import { Category, RawEvent } from "./types";
import { classify } from "./gdelt";

interface RedditChild {
  data: {
    title: string;
    url: string;
    permalink: string;
    domain: string;
    score: number;
    created_utc: number;
    subreddit: string;
    over_18?: boolean;
    is_self?: boolean;
  };
}

interface RedditResponse {
  data: { children: RedditChild[] };
}

const SUBREDDITS = [
  // World / regional
  "worldnews",
  "news",
  "politics",
  "usnews",
  "ukpolitics",
  "europe",
  "geopolitics",
  "anime_titties", // satirical name, well-modded serious world news subreddit
  "india",
  "China",
  "japan",
  "korea",
  "Africa",
  "LatinAmerica",
  "MiddleEastNews",
  "ukraine",
  "war",

  // Business / markets
  "Economics",
  "business",
  "stocks",
  "investing",
  "wallstreetbets",
  "CryptoCurrency",
  "energy",
  "EnergyAndPower",

  // Tech
  "technology",
  "Futurology",
  "artificial",
  "MachineLearning",
  "gadgets",

  // Science / climate / nature
  "science",
  "space",
  "Physics",
  "biology",
  "climate",
  "environment",
  "wildlife",
  "nature",
  "earthporn", // landscape news, sometimes ties to climate stories

  // Health
  "Health",
  "medicine",
  "Coronavirus",

  // Sports
  "sports",
  "soccer",
  "nba",
  "nfl",
  "formula1",
  "olympics",

  // Culture / entertainment
  "movies",
  "television",
  "Music",
  "books",
  "Art",
];

const TIMEOUT_MS = 3500;

async function fetchSubreddit(sub: string, limit: number = 30): Promise<RedditChild[]> {
  const ac = new AbortController();
  const tid = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}&raw_json=1`,
      {
        signal: ac.signal,
        headers: {
          "user-agent": "Pulse/1.0 (portfolio; news aggregator)",
        },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as RedditResponse;
    return data?.data?.children ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(tid);
  }
}

export async function fetchRedditNews(maxTotal: number = 600): Promise<RawEvent[]> {
  const results = await Promise.all(
    SUBREDDITS.map((sub) => fetchSubreddit(sub, 25)),
  );

  const seenUrls = new Set<string>();
  const events: RawEvent[] = [];

  for (const children of results) {
    for (const item of children) {
      const d = item.data;
      if (!d || d.over_18 || d.is_self || !d.url) continue;
      const key = d.url.toLowerCase();
      if (seenUrls.has(key)) continue;
      // Skip Reddit-internal links
      if (d.domain.includes("redd.it") || d.domain.includes("reddit.com")) continue;
      // Skip image / video hosts (we want real news)
      if (d.domain.includes("imgur") || d.domain.includes("youtu")) continue;
      seenUrls.add(key);

      const category: Category = classify(d.title);
      events.push({
        id: `reddit-${events.length}`,
        lat: 0,
        lng: 0,
        title: d.title,
        url: d.url,
        source: d.domain.replace(/^www\./, ""),
        datetime: new Date(d.created_utc * 1000).toISOString(),
        tone: 0,
        category,
      });
      if (events.length >= maxTotal) return events;
    }
  }
  return events;
}
