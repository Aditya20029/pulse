import { NextResponse } from "next/server";
import { anthropic, BRIEFING_MODEL } from "@/lib/claude";
import { Cluster } from "@/lib/types";

import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface ChatRequest {
  message: string;
  clusters: Cluster[];
  selectedClusterId?: string | null;
  selectedRegion?: string | null;
  timeScrubHoursAgo?: number | null;
  history?: { role: "user" | "assistant"; content: string }[];
}

const SYSTEM_PROMPT = `You are Pulse, a global intelligence analyst chatbot embedded inside a real-time 3D news globe. The user is looking at the same globe data you are. Be concise (under 130 words), direct, and analytical. Reference specific clusters by their dominant headline when relevant. Never make up facts; only reason from the provided cluster snapshot.

When user asks about something not in the data, say so and suggest what they could examine. Use plain text, no markdown formatting except for occasional emphasis with quotes.`;

function buildContext(req: ChatRequest): string {
  const lines: string[] = [];
  const compressed = req.clusters
    .slice(0, 40)
    .map(
      (c, i) =>
        `${i}: [${c.category}] (${c.lat.toFixed(1)}, ${c.lng.toFixed(1)}) n=${c.events.length} "${c.dominantTitle}"`,
    )
    .join("\n");
  lines.push("CURRENT GLOBE STATE:");
  lines.push(`Visible clusters: ${req.clusters.length}`);
  if (req.selectedClusterId) lines.push(`User selected cluster: ${req.selectedClusterId}`);
  if (req.selectedRegion) lines.push(`User selected region: ${req.selectedRegion}`);
  if (req.timeScrubHoursAgo !== null && req.timeScrubHoursAgo !== undefined) {
    lines.push(`Time scrub: ${req.timeScrubHoursAgo.toFixed(1)}h ago`);
  } else {
    lines.push("Time: live");
  }
  lines.push("");
  lines.push("Cluster snapshot:");
  lines.push(compressed);
  return lines.join("\n");
}

export async function POST(request: Request) {
  const limit = rateLimit(`${clientKey(request)}:chat`, 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { reply: "You're sending messages too fast. Give it a few seconds." },
      { status: 429 },
    );
  }

  let req: ChatRequest;
  try {
    req = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!anthropic) {
    return NextResponse.json({
      reply:
        "AI chat is unavailable (no ANTHROPIC_API_KEY configured). Add a key to .env.local to enable.",
    });
  }

  const context = buildContext(req);
  const history = req.history ?? [];
  const messages: { role: "user" | "assistant"; content: string }[] = [
    ...history.slice(-6),
    {
      role: "user",
      content: `${context}\n\nUSER QUESTION: ${req.message}`,
    },
  ];

  try {
    const response = await anthropic.messages.create({
      model: BRIEFING_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages,
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("chat route error", err);
    return NextResponse.json({
      reply: "Chat unavailable right now. Try again in a moment.",
    });
  }
}
