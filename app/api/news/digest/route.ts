import { NextResponse } from "next/server";
import { anthropic, BRIEFING_MODEL } from "@/lib/claude";
import { Cluster } from "@/lib/types";

import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface DigestSection {
  heading: string;
  body: string;
  category: string;
}

interface DigestResponse {
  title: string;
  summary: string;
  sections: DigestSection[];
  generated_at: string;
}

const SYSTEM_PROMPT = `You are Pulse, a global intelligence analyst writing an end-of-day digest, "What mattered today." Given a compressed snapshot of today's news clusters, write a concise digest with:
- A 1 sentence overall summary
- 4 to 6 sections, each a brief themed story with heading and 2 to 3 sentence body

Be analytical, not breathless. Avoid lists of headlines, write narrative prose. Identify cross-cutting themes.

Respond ONLY with JSON:
{
  "title": "Pulse Digest, DATE",
  "summary": "1 sentence",
  "sections": [
    {
      "heading": "Theme heading",
      "body": "2-3 sentence story",
      "category": "conflict | politics | economy | environment | wildlife | tech | science | health | culture | other"
    }
  ]
}`;

function fallback(): DigestResponse {
  return {
    title: "Pulse Digest",
    summary: "AI digest unavailable.",
    sections: [],
    generated_at: new Date().toISOString(),
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
  if (!rateLimit(`${clientKey(request)}:digest`, 15, 60_000).allowed) {
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

  const compressed = clusters
    .slice(0, 55)
    .map(
      (c) =>
        `[${c.category}] (${c.lat.toFixed(1)}, ${c.lng.toFixed(1)}) n=${c.events.length} "${c.dominantTitle}"`,
    )
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: BRIEFING_MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Today's clusters:\n\n${compressed}\n\nWrite the digest.`,
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(fallback());
    }
    return NextResponse.json({
      ...(parsed as DigestResponse),
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("digest route error", err);
    return NextResponse.json(fallback());
  }
}
