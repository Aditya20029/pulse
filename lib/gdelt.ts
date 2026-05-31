import { Category, RawEvent } from "./types";

interface GDELTGeoFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    name?: string;
    html?: string;
    shareimage?: string;
    url?: string;
    urltone?: number;
    count?: number;
  };
}

interface GDELTGeoResponse {
  type: "FeatureCollection";
  features: GDELTGeoFeature[];
}

interface GDELTArtListItem {
  url: string;
  url_mobile?: string;
  title: string;
  seendate: string;
  socialimage?: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

interface GDELTArtListResponse {
  articles: GDELTArtListItem[];
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  conflict: [
    "war",
    "attack",
    "strike",
    "killed",
    "military",
    "troops",
    "missile",
    "rebel",
    "battle",
    "clash",
    "violence",
    "weapon",
    "terror",
    "armed",
    "soldiers",
    "ceasefire",
    "drone",
    "invasion",
    "wounded",
    "casualties",
    "shelling",
    "raid",
    "insurgent",
  ],
  politics: [
    "president",
    "election",
    "minister",
    "parliament",
    "vote",
    "government",
    "senate",
    "policy",
    "diplomat",
    "summit",
    "treaty",
    "sanction",
    "protest",
    "congress",
    "law",
    "cabinet",
    "court",
    "trial",
    "ruling",
    "regime",
    "embassy",
    "diplomatic",
    "referendum",
  ],
  economy: [
    "market",
    "stocks",
    "inflation",
    "trade",
    "tariff",
    "economy",
    "gdp",
    "bank",
    "fed",
    "rates",
    "currency",
    "earnings",
    "ipo",
    "fund",
    "investment",
    "recession",
    "growth",
    "deficit",
    "debt",
    "oil",
    "supply",
    "labor",
    "employment",
    "merger",
  ],
  environment: [
    "climate",
    "wildfire",
    "flood",
    "hurricane",
    "drought",
    "storm",
    "earthquake",
    "tsunami",
    "emissions",
    "carbon",
    "renewable",
    "pollution",
    "deforestation",
    "heatwave",
    "glacier",
    "cyclone",
    "volcano",
    "weather",
    "rainfall",
    "blizzard",
  ],
  wildlife: [
    "wildlife",
    "endangered",
    "species",
    "biodiversity",
    "poaching",
    "elephant",
    "tiger",
    "rhino",
    "whale",
    "coral",
    "reef",
    "wolves",
    "habitat",
    "conservation",
    "extinction",
    "migration",
    "rewilding",
    "sanctuary",
  ],
  tech: [
    "ai",
    "artificial intelligence",
    "openai",
    "anthropic",
    "google",
    "microsoft",
    "apple",
    "chip",
    "semiconductor",
    "startup",
    "tech",
    "software",
    "cyber",
    "hack",
    "data breach",
    "robot",
    "quantum",
    "blockchain",
    "crypto",
  ],
  science: [
    "research",
    "scientists",
    "discovery",
    "physics",
    "biology",
    "chemistry",
    "telescope",
    "spacex",
    "satellite",
    "nasa",
    "esa",
    "space",
    "mars",
    "moon",
    "particle",
    "fusion",
    "genome",
    "neural",
    "cern",
    "astronomers",
  ],
  health: [
    "outbreak",
    "vaccine",
    "virus",
    "pandemic",
    "epidemic",
    "hospital",
    "disease",
    "cancer",
    "drug",
    "trial",
    "fda",
    "who",
    "mental health",
    "surgeon",
    "treatment",
    "diagnosed",
    "cases",
    "infection",
  ],
  culture: [
    "festival",
    "film",
    "concert",
    "olympics",
    "world cup",
    "championship",
    "museum",
    "exhibit",
    "premiere",
    "award",
    "music",
    "literature",
    "art",
    "fashion",
    "tournament",
    "athlete",
    "team",
    "novel",
  ],
  other: [],
};

export function classify(text: string): Category {
  const lower = text.toLowerCase();
  let best: Category = "other";
  let bestScore = 0;
  for (const cat of Object.keys(CATEGORY_KEYWORDS) as Category[]) {
    if (cat === "other") continue;
    let score = 0;
    for (const kw of CATEGORY_KEYWORDS[cat]) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  return best;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function gdeltFetch(url: string, timeoutMs: number = 6000): Promise<Response> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { "user-agent": "Pulse/1.0 (portfolio)" },
      next: { revalidate: 300 },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(tid);
  }
}

export async function fetchGdeltGeo(
  query: string = "(news OR breaking) sourcelang:eng",
  timespan: string = "24h",
): Promise<RawEvent[]> {
  const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${encodeURIComponent(query)}&mode=PointData&timespan=${timespan}&format=GeoJSON&maxrecords=500`;
  const res = await gdeltFetch(url);
  if (!res.ok) {
    throw new Error(`GDELT geo error ${res.status}`);
  }
  const text = await res.text();
  let data: GDELTGeoResponse;
  try {
    data = JSON.parse(text) as GDELTGeoResponse;
  } catch {
    return [];
  }
  if (!data?.features) return [];

  const events: RawEvent[] = [];
  for (const f of data.features) {
    const [lng, lat] = f.geometry.coordinates ?? [];
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const html = f.properties.html ?? "";
    const name = f.properties.name ?? "";
    const text = `${name} ${stripHtml(html)}`;
    const titleMatch = html.match(/<a[^>]*>([^<]+)<\/a>/);
    const urlMatch = html.match(/href="([^"]+)"/);
    const title = titleMatch?.[1]?.trim() ?? name ?? "Untitled event";
    const articleUrl = urlMatch?.[1] ?? f.properties.url ?? "";
    let source = "";
    try {
      if (articleUrl) source = new URL(articleUrl).hostname.replace(/^www\./, "");
    } catch {
      source = "gdelt";
    }
    events.push({
      id: `${lat.toFixed(3)}-${lng.toFixed(3)}-${events.length}`,
      lat,
      lng,
      title,
      url: articleUrl,
      source: source || "gdelt",
      datetime: new Date().toISOString(),
      tone: typeof f.properties.urltone === "number" ? f.properties.urltone : 0,
      category: classify(text),
    });
  }
  return events;
}

export async function fetchGdeltArticles(
  query: string = "(breaking OR news) sourcelang:eng",
  timespan: string = "24h",
  max: number = 25,
): Promise<RawEvent[]> {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=${max}&timespan=${timespan}&format=json&sort=DateDesc`;
  const res = await gdeltFetch(url);
  if (!res.ok) throw new Error(`GDELT doc error ${res.status}`);
  const text = await res.text();
  let data: GDELTArtListResponse;
  try {
    data = JSON.parse(text) as GDELTArtListResponse;
  } catch {
    return [];
  }
  if (!data?.articles) return [];

  return data.articles.map((a, i) => ({
    id: `art-${i}`,
    lat: 0,
    lng: 0,
    title: a.title,
    url: a.url,
    source: a.domain,
    datetime: a.seendate,
    tone: 0,
    category: classify(a.title),
  }));
}
