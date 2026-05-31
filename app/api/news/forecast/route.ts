import { NextResponse } from "next/server";
import { anthropic, BRIEFING_MODEL } from "@/lib/claude";
import { Cluster } from "@/lib/types";
import { FingerprintCache, clustersFingerprint } from "@/lib/ai-cache";

import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cache = new FingerprintCache<ForecastResponse>();

interface Prediction {
  title: string;
  probability: number;
  reasoning: string;
  horizon_hours: number;
  category: string;
}

interface ForecastResponse {
  predictions: Prediction[];
  summary: string;
}

const SYSTEM_PROMPT = `You are a forecasting analyst at Pulse. Given current global news clusters, predict 3 to 4 plausible developments that may occur in the next 24 hours. For each prediction:
- Be concrete, not vague
- Estimate probability (0 to 1)
- Give a short reasoning grounded in the visible signal
- State the horizon in hours (typically 6 to 48)

Be intellectually honest about uncertainty. If signals are weak, set lower probabilities. Avoid sensationalism.

Respond ONLY with JSON:
{
  "summary": "1 sentence on the overall outlook",
  "predictions": [
    {
      "title": "Specific prediction (under 90 chars)",
      "probability": 0.0,
      "reasoning": "1 sentence justification",
      "horizon_hours": 12,
      "category": "conflict | politics | economy | environment | wildlife | tech | science | health | culture | other"
    }
  ]
}`;

function fallback(): ForecastResponse {
  return { predictions: [], summary: "" };
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced?.[1] ?? text;
  const match = body.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!rateLimit(`${clientKey(request)}:forecast`, 30, 60_000).allowed) {
    return NextResponse.json(fallback(), { status: 429 });
  }
  let clusters: Cluster[] = [];
  try {
    const body = (await request.json()) as { clusters: Cluster[] };
    clusters = body.clusters ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!anthropic || clusters.length === 0) {
    return NextResponse.json(fallback());
  }

  const fp = clustersFingerprint(clusters);
  const cached = cache.get(fp);
  if (cached) return NextResponse.json(cached);

  const compressed = clusters
    .slice(0, 50)
    .map(
      (c) =>
        `[${c.category}] (${c.lat.toFixed(1)}, ${c.lng.toFixed(1)}) n=${c.events.length} "${c.dominantTitle}"`,
    )
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: BRIEFING_MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Current cluster snapshot:\n\n${compressed}\n\nForecast the next 24 hours.`,
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(fallback());
    }
    cache.set(fp, parsed as ForecastResponse);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("forecast route error", err);
    return NextResponse.json(fallback());
  }
}
