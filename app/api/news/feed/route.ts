import { NextResponse } from "next/server";
import { getMockEvents } from "@/lib/mock-events";
import { fetchRssSupplementary } from "@/lib/rss-sources";
import { fetchRedditNews } from "@/lib/reddit-news";
import { fetchHackerNews } from "@/lib/hackernews";
import { FeedHeadline, RawEvent } from "@/lib/types";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  const articles: RawEvent[] = [];
  let usedMock = false;
  const sourceTags: string[] = [];

  // RSS + Reddit + HN return quickly. GDELT articles are excluded here
  // because the GDELT geo feed already powers globe clusters and the doc API
  // often takes 5+ seconds, which blocks the feed UI from showing anything.
  const [rss, reddit, hn] = await Promise.all([
    fetchRssSupplementary().catch(() => [] as RawEvent[]),
    fetchRedditNews(600).catch(() => [] as RawEvent[]),
    fetchHackerNews(80).catch(() => [] as RawEvent[]),
  ]);
  if (rss.length > 0) sourceTags.push("rss");
  if (reddit.length > 0) sourceTags.push("reddit");
  if (hn.length > 0) sourceTags.push("hn");

  const seen = new Set<string>();
  for (const e of [...rss, ...reddit, ...hn]) {
    const key = (e.url || e.title).toLowerCase().slice(0, 100);
    if (seen.has(key)) continue;
    seen.add(key);
    articles.push(e);
  }

  if (articles.length === 0) {
    articles.push(...getMockEvents());
    usedMock = true;
    sourceTags.push("mock");
  }

  const headlines: FeedHeadline[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    source: a.source,
    lat: a.lat,
    lng: a.lng,
    category: a.category,
    url: a.url,
    datetime: a.datetime,
  }));
  return NextResponse.json(
    { headlines },
    {
      headers: {
        "cache-control": usedMock
          ? "no-store"
          : "s-maxage=300, stale-while-revalidate=600",
        "x-pulse-source": sourceTags.join(",") || "mock",
      },
    },
  );
}
