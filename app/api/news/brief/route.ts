import { NextResponse } from "next/server";
import {
  anthropic,
  BRIEFING_MODEL,
  BRIEFING_SYSTEM_PROMPT,
} from "@/lib/claude";
import { BriefingResponse, Cluster } from "@/lib/types";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function fallbackBriefing(cluster: Cluster): BriefingResponse {
  const titles = cluster.events.slice(0, 5).map((e) => e.title);
  return {
    summary: `Cluster of ${cluster.events.length} ${cluster.category} stories near ${cluster.lat.toFixed(2)}, ${cluster.lng.toFixed(2)}. Top headline: ${titles[0] ?? "(none)"}.`,
    significance:
      "AI briefing unavailable (no ANTHROPIC_API_KEY configured). Showing raw cluster data instead.",
    connected_events: titles.slice(1, 4),
    historical_parallels: "n/a",
    key_actors: [],
    severity: Math.min(10, Math.round(cluster.intensity * 10)),
  };
}

const DEVIL_PROMPT = `${BRIEFING_SYSTEM_PROMPT}

ADDITIONAL CONSTRAINT: Take a contrarian / devil's advocate framing. Argue the case that the mainstream interpretation of this story is incomplete or wrong. Surface counter-narratives, overlooked context, alternative explanations, and underweighted risks/opportunities. Stay intellectually honest, never make things up, do not promote conspiracies. Acknowledge that this is the contrarian view at the start of the summary.`;

const COUNTERFACTUAL_PROMPT = `${BRIEFING_SYSTEM_PROMPT}

ADDITIONAL CONSTRAINT: Apply counterfactual analysis. After describing what happened, explore one or two specific alternative decisions or events that could have changed the outcome. Be concrete and grounded, not speculative. Examples: "Had X chosen Y instead of Z, the likely effect would be..." Acknowledge that this is counterfactual analysis at the start of the summary.`;

const LANG_NAMES: Record<string, string> = {
  es: "Spanish (Castilian)",
  fr: "French",
  hi: "Hindi",
  zh: "Mandarin Chinese (Simplified)",
  ar: "Arabic",
  de: "German",
};

export async function POST(request: Request) {
  const limit = rateLimit(`${clientKey(request)}:brief`, 45, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Slow down a moment." },
      { status: 429, headers: { "retry-after": String(Math.ceil(limit.resetMs / 1000)) } },
    );
  }

  let cluster: Cluster;
  let framing: "default" | "devil" | "counterfactual" = "default";
  let language: string = "en";
  try {
    const body = (await request.json()) as {
      cluster: Cluster;
      framing?: "default" | "devil" | "counterfactual";
      language?: string;
    };
    cluster = body.cluster;
    if (body.framing === "devil" || body.framing === "counterfactual") {
      framing = body.framing;
    }
    if (body.language && LANG_NAMES[body.language]) language = body.language;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
  if (!cluster) {
    return NextResponse.json({ error: "Missing cluster" }, { status: 400 });
  }

  if (!anthropic) {
    return NextResponse.json(fallbackBriefing(cluster));
  }

  const headlines = cluster.events
    .slice(0, 12)
    .map((e) => `- ${e.title} (${e.source})`)
    .join("\n");
  const sources = Array.from(
    new Set(cluster.events.map((e) => e.source).filter(Boolean)),
  ).slice(0, 8);

  const userMessage = `Analyze this news cluster:

Category: ${cluster.category}
Location: lat ${cluster.lat.toFixed(2)}, lng ${cluster.lng.toFixed(2)}
Event count: ${cluster.events.length}

Headlines:
${headlines}

Sources: ${sources.join(", ")}`;

  let systemPrompt = BRIEFING_SYSTEM_PROMPT;
  if (framing === "devil") systemPrompt = DEVIL_PROMPT;
  if (framing === "counterfactual") systemPrompt = COUNTERFACTUAL_PROMPT;
  if (language !== "en") {
    systemPrompt += `\n\nIMPORTANT: All text values in the JSON response (summary, significance, connected_events, historical_parallels, key_actors, tone_forecast_reasoning) must be written in ${LANG_NAMES[language]}.`;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic!.messages.stream({
          model: BRIEFING_MODEL,
          max_tokens: 900,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("brief stream error", err);
        controller.enqueue(
          encoder.encode(JSON.stringify(fallbackBriefing(cluster))),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-pulse-stream": "1",
    },
  });
}
