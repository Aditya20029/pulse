import { NextResponse } from "next/server";
import { fetchGdeltGeo } from "@/lib/gdelt";
import { clusterEvents } from "@/lib/clustering";
import { getMockEvents } from "@/lib/mock-events";
import { fetchRedditNews } from "@/lib/reddit-news";
import { fetchRssSupplementary } from "@/lib/rss-sources";
import { fetchHackerNews } from "@/lib/hackernews";
import { geocodeHeadlineAll, geocodeBySource } from "@/lib/geocoder";
import { GlobeFeedResponse, RawEvent } from "@/lib/types";

export const revalidate = 300;
export const dynamic = "force-dynamic";

function geocodeMissing(events: RawEvent[]): RawEvent[] {
  const out: RawEvent[] = [];
  for (const e of events) {
    if (e.lat === 0 && e.lng === 0) {
      const hits = geocodeHeadlineAll(e.title);
      if (hits.length > 0) {
        // Create one event per geocoded place mentioned in the headline.
        hits.forEach((hit, i) => {
          const jitterLat = Math.sin((e.id.length + i) * 7.3) * 1.2;
          const jitterLng = Math.cos((e.id.length + i) * 5.1) * 1.2;
          out.push({
            ...e,
            id: i === 0 ? e.id : `${e.id}-${i}`,
            lat: hit.lat + jitterLat,
            lng: hit.lng + jitterLng,
          });
        });
      } else {
        // Fallback: anchor at the source outlet's HQ. Adds events that would
        // otherwise be dropped because the headline mentioned no place name.
        const src = geocodeBySource(e.source);
        if (!src) continue;
        const jitterLat = Math.sin(e.id.length * 9.7) * 3.5;
        const jitterLng = Math.cos(e.id.length * 6.3) * 3.5;
        out.push({
          ...e,
          lat: src.lat + jitterLat,
          lng: src.lng + jitterLng,
        });
      }
    } else {
      out.push(e);
    }
  }
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const timespan = url.searchParams.get("timespan") ?? "24h";
  const query =
    url.searchParams.get("q") ?? "(news OR breaking) sourcelang:eng";

  let geo: RawEvent[] = [];
  let rss: RawEvent[] = [];
  let reddit: RawEvent[] = [];
  const sourceTags: string[] = [];

  let hn: RawEvent[] = [];

  const settled = await Promise.allSettled([
    fetchGdeltGeo(query, timespan),
    fetchRssSupplementary(),
    fetchRedditNews(600),
    fetchHackerNews(80),
  ]);

  if (settled[0].status === "fulfilled") geo = settled[0].value;
  if (settled[1].status === "fulfilled") rss = settled[1].value;
  if (settled[2].status === "fulfilled") reddit = settled[2].value;
  if (settled[3].status === "fulfilled") hn = settled[3].value;

  if (geo.length > 0) sourceTags.push("gdelt");
  if (rss.length > 0) sourceTags.push("rss");
  if (reddit.length > 0) sourceTags.push("reddit");
  if (hn.length > 0) sourceTags.push("hn");

  // Geocode any non-geo events that mention recognizable places
  const placed = geocodeMissing([...rss, ...reddit, ...hn]);

  let events = [...geo, ...placed];
  let usedMock = false;
  if (events.length === 0) {
    events = getMockEvents();
    usedMock = true;
    sourceTags.push("mock");
  }

  const clusters = clusterEvents(events, 120);
  const body: GlobeFeedResponse = {
    clusters,
    fetchedAt: new Date().toISOString(),
    totalEvents: events.length,
  };
  return NextResponse.json(body, {
    headers: {
      "cache-control": usedMock
        ? "no-store"
        : "s-maxage=300, stale-while-revalidate=600",
      "x-pulse-source": sourceTags.join(",") || "mock",
    },
  });
}
