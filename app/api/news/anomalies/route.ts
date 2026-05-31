import { NextResponse } from "next/server";
import {
  anthropic,
  BRIEFING_MODEL,
} from "@/lib/claude";
import { Cluster } from "@/lib/types";

import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Anomaly {
  title: string;
  description: string;
  category: string;
  region: string;
  severity: number;
}

interface AnomaliesResponse {
  anomalies: Anomaly[];
  signal: string;
}

const SYSTEM_PROMPT = `You are Pulse, a senior global intelligence analyst. Given a compressed snapshot of current global news clusters, identify 3 to 4 statistically or geopolitically notable anomalies. An anomaly is a pattern that is surprising, unusual, accelerating, or potentially destabilizing. Be analytical, not alarmist. Avoid filler.

Respond ONLY with a JSON object:
{
  "anomalies": [
    {
      "title": "Short headline",
      "description": "1-2 sentences explaining the pattern",
      "category": "conflict | politics | economy | environment | wildlife | tech | science | health | culture | other",
      "region": "Short region name",
      "severity": 1-10
    }
  ],
  "signal": "One sentence overall read of the current global signal"
}`;

function fallbackAnomalies(clusters: Cluster[]): AnomaliesResponse {
  const byCategory = new Map<string, Cluster[]>();
  for (const c of clusters) {
    const arr = byCategory.get(c.category) ?? [];
    arr.push(c);
    byCategory.set(c.category, arr);
  }
  const top = Array.from(byCategory.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);
  return {
    anomalies: top.map(([cat, items]) => ({
      title: `Elevated ${cat} activity`,
      description: `${items.length} ${cat} clusters detected across ${new Set(items.map((c) => `${Math.round(c.lat / 20)},${Math.round(c.lng / 20)}`)).size} regions.`,
      category: cat,
      region: "Global",
      severity: Math.min(10, items.length),
    })),
    signal:
      "AI anomaly synthesis unavailable; showing raw category density instead.",
  };
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
  let clusters: Cluster[] = [];
  try {
    const body = (await request.json()) as { clusters: Cluster[] };
    clusters = body.clusters ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!rateLimit(`${clientKey(request)}:anomalies`, 30, 60_000).allowed) {
    return NextResponse.json(fallbackAnomalies(clusters), { status: 429 });
  }

  if (!anthropic || clusters.length === 0) {
    return NextResponse.json(fallbackAnomalies(clusters));
  }

  const compressed = clusters
    .slice(0, 60)
    .map(
      (c) =>
        `[${c.category}] lat=${c.lat.toFixed(1)} lng=${c.lng.toFixed(1)} n=${c.events.length} "${c.dominantTitle}"`,
    )
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: BRIEFING_MODEL,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Current global news clusters (${clusters.length} total, top 60 shown):\n\n${compressed}\n\nIdentify the anomalies.`,
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(fallbackAnomalies(clusters));
    }
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("anomalies route error", err);
    return NextResponse.json(fallbackAnomalies(clusters));
  }
}
