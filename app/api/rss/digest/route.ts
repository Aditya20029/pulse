import { NextResponse } from "next/server";
import { fetchGdeltGeo } from "@/lib/gdelt";
import { clusterEvents } from "@/lib/clustering";
import { getMockEvents } from "@/lib/mock-events";
import { anthropic, BRIEFING_MODEL } from "@/lib/claude";
import { Cluster, RawEvent } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

interface DigestSection {
  heading: string;
  body: string;
  category: string;
}

interface DigestResponse {
  title: string;
  summary: string;
  sections: DigestSection[];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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

async function buildDigest(clusters: Cluster[]): Promise<DigestResponse | null> {
  if (!anthropic || clusters.length === 0) return null;
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
      max_tokens: 1800,
      system: `You are Pulse writing an end-of-day digest. Respond ONLY with JSON: { "title": str, "summary": str, "sections": [{ "heading": str, "body": str, "category": str }] }`,
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
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as DigestResponse;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  let events: RawEvent[] = [];
  try {
    events = await fetchGdeltGeo();
  } catch {
    // ignore
  }
  if (events.length === 0) events = getMockEvents();
  const clusters = clusterEvents(events, 350);

  const digest = await buildDigest(clusters);
  const baseUrl = new URL(request.url);
  const origin = `${baseUrl.protocol}//${baseUrl.host}`;
  const now = new Date();

  const sections = digest?.sections ?? [];
  const items = sections
    .map(
      (s) =>
        `    <item>
      <title>${escapeXml(s.heading)}</title>
      <link>${origin}/</link>
      <guid isPermaLink="false">${escapeXml(`${now.toISOString()}-${s.heading}`)}</guid>
      <category>${escapeXml(s.category)}</category>
      <pubDate>${now.toUTCString()}</pubDate>
      <description>${escapeXml(s.body)}</description>
    </item>`,
    )
    .join("\n");

  const title = digest?.title ?? "Pulse Digest";
  const summary = digest?.summary ?? `Tracking ${clusters.length} clusters worldwide.`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${origin}/</link>
    <description>${escapeXml(summary)}</description>
    <language>en</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
