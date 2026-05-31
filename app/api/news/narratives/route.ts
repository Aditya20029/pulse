import { NextResponse } from "next/server";
import { anthropic, BRIEFING_MODEL } from "@/lib/claude";
import { Cluster } from "@/lib/types";
import { FingerprintCache, clustersFingerprint } from "@/lib/ai-cache";

import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const cache = new FingerprintCache<NarrativesResponse>();

interface Narrative {
  title: string;
  thread: string;
  cluster_indices: number[];
  category: string;
}

interface NarrativesResponse {
  narratives: Narrative[];
}

const SYSTEM_PROMPT = `You are a senior global intelligence analyst at Pulse. Given a compressed set of current news clusters indexed by number, identify 3 to 5 "narratives" — story threads that span multiple clusters across the world. A narrative is a single underlying story that ties together physically distant events.

Examples:
- "Ukraine war and its energy ripple effects across Europe"
- "Global AI race between US, China, and Gulf states"
- "Climate migration patterns in coastal regions"

For each narrative, list the indices of clusters that participate. Be selective, only include clusters that genuinely fit the thread.

Respond ONLY with JSON:
{
  "narratives": [
    {
      "title": "Short narrative title (under 70 chars)",
      "thread": "1-2 sentence explanation of the underlying story",
      "cluster_indices": [1, 5, 12],
      "category": "conflict | politics | economy | environment | wildlife | tech | science | health | culture | other"
    }
  ]
}`;

function fallback(): NarrativesResponse {
  return { narratives: [] };
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
  if (!rateLimit(`${clientKey(request)}:narratives`, 30, 60_000).allowed) {
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

  const indexed = clusters
    .slice(0, 50)
    .map(
      (c, i) =>
        `${i}: [${c.category}] (${c.lat.toFixed(1)}, ${c.lng.toFixed(1)}) "${c.dominantTitle}"`,
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
          content: `Current news clusters:\n\n${indexed}\n\nIdentify the global narratives.`,
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && "text" in textBlock ? textBlock.text : "";
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(fallback());
    }
    cache.set(fp, parsed as NarrativesResponse);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("narratives route error", err);
    return NextResponse.json(fallback());
  }
}
