import { RawEvent } from "./types";
import { classify } from "./gdelt";

interface Story {
  id: number;
  title?: string;
  url?: string;
  by?: string;
  time?: number;
  score?: number;
  type?: string;
}

const TIMEOUT_MS = 3000;
const TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const ITEM_URL = (id: number) =>
  `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

async function fetchWithTimeout(url: string): Promise<unknown | null> {
  const ac = new AbortController();
  const tid = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(tid);
  }
}

function domainOf(url?: string): string {
  if (!url) return "ycombinator.com";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "ycombinator.com";
  }
}

export async function fetchHackerNews(max: number = 80): Promise<RawEvent[]> {
  const ids = (await fetchWithTimeout(TOP_STORIES_URL)) as number[] | null;
  if (!ids || ids.length === 0) return [];

  const batch = ids.slice(0, Math.min(max, 120));
  const items = await Promise.all(
    batch.map((id) => fetchWithTimeout(ITEM_URL(id)) as Promise<Story | null>),
  );

  const out: RawEvent[] = [];
  const now = new Date().toISOString();
  for (const item of items) {
    if (!item || !item.title || item.type !== "story") continue;
    const fallbackUrl =
      item.url ?? `https://news.ycombinator.com/item?id=${item.id}`;
    out.push({
      id: `hn-${item.id}`,
      lat: 0,
      lng: 0,
      title: item.title,
      url: fallbackUrl,
      source: domainOf(item.url) || "news.ycombinator.com",
      datetime: item.time
        ? new Date(item.time * 1000).toISOString()
        : now,
      tone: 0,
      category: classify(item.title),
    });
  }
  return out;
}
