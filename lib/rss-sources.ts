import { Category, RawEvent } from "./types";
import { classify } from "./gdelt";

interface RssSource {
  name: string;
  url: string;
  domain: string;
  region: string;
  category?: Category;
}

const SOURCES: RssSource[] = [
  // Global / wire services
  { name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews", domain: "reuters.com", region: "Global" },
  { name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml", domain: "bbc.com", region: "Global" },
  { name: "AP World", url: "https://apnews.com/hub/apf-topnews?utm_source=hp&utm_medium=rss", domain: "apnews.com", region: "Global" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", domain: "aljazeera.com", region: "Middle East" },
  { name: "France 24", url: "https://www.france24.com/en/rss", domain: "france24.com", region: "Europe" },
  { name: "Deutsche Welle", url: "https://rss.dw.com/rdf/rss-en-world", domain: "dw.com", region: "Europe" },
  { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/world.xml", domain: "news.sky.com", region: "Europe" },
  { name: "Guardian World", url: "https://www.theguardian.com/world/rss", domain: "theguardian.com", region: "Europe" },
  { name: "Euronews", url: "https://www.euronews.com/rss", domain: "euronews.com", region: "Europe" },

  // Asia
  { name: "NHK World", url: "https://www3.nhk.or.jp/nhkworld/en/news/feeds/", domain: "nhk.or.jp", region: "Asia" },
  { name: "Nikkei Asia", url: "https://asia.nikkei.com/rss/feed/nar", domain: "asia.nikkei.com", region: "Asia" },
  { name: "South China Morning Post", url: "https://www.scmp.com/rss/91/feed", domain: "scmp.com", region: "Asia" },
  { name: "The Hindu", url: "https://www.thehindu.com/news/international/feeder/default.rss", domain: "thehindu.com", region: "Asia" },
  { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", domain: "timesofindia.indiatimes.com", region: "Asia" },
  { name: "Channel News Asia", url: "https://www.channelnewsasia.com/rssfeeds/8395986", domain: "channelnewsasia.com", region: "Asia" },

  // Africa
  { name: "AllAfrica", url: "https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf", domain: "allafrica.com", region: "Africa" },
  { name: "News24 South Africa", url: "https://feeds.news24.com/articles/news24/TopStories/rss", domain: "news24.com", region: "Africa" },

  // Americas
  { name: "Globo Brazil", url: "https://g1.globo.com/rss/g1/mundo/", domain: "globo.com", region: "Americas" },
  { name: "Buenos Aires Herald", url: "https://buenosairesherald.com/feed", domain: "buenosairesherald.com", region: "Americas" },

  // US politics / general
  { name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml", domain: "npr.org", region: "Americas" },
  { name: "Politico", url: "https://www.politico.com/rss/politicopicks.xml", domain: "politico.com", region: "Americas" },

  // Business / Markets
  { name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews", domain: "reuters.com", region: "Global", category: "economy" },
  { name: "BBC Business", url: "http://feeds.bbci.co.uk/news/business/rss.xml", domain: "bbc.com", region: "Global", category: "economy" },
  { name: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories", domain: "marketwatch.com", region: "Global", category: "economy" },
  { name: "CNBC Markets", url: "https://www.cnbc.com/id/100727362/device/rss/rss.html", domain: "cnbc.com", region: "Global", category: "economy" },

  // Technology
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", domain: "techcrunch.com", region: "Global", category: "tech" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", domain: "theverge.com", region: "Global", category: "tech" },
  { name: "Ars Technica", url: "http://feeds.arstechnica.com/arstechnica/index", domain: "arstechnica.com", region: "Global", category: "tech" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", domain: "wired.com", region: "Global", category: "tech" },

  // Science
  { name: "NASA", url: "https://www.nasa.gov/feeds/iotd-feed/", domain: "nasa.gov", region: "Global", category: "science" },
  { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml", domain: "sciencedaily.com", region: "Global", category: "science" },
  { name: "Phys.org", url: "https://phys.org/rss-feed/", domain: "phys.org", region: "Global", category: "science" },
  { name: "Nature", url: "http://www.nature.com/nature/current_issue/rss", domain: "nature.com", region: "Global", category: "science" },

  // Climate / environment
  { name: "Guardian Environment", url: "https://www.theguardian.com/environment/rss", domain: "theguardian.com", region: "Global", category: "environment" },
  { name: "Climate Home News", url: "https://www.climatechangenews.com/feed/", domain: "climatechangenews.com", region: "Global", category: "environment" },
  { name: "Mongabay", url: "https://news.mongabay.com/feed/", domain: "mongabay.com", region: "Global", category: "wildlife" },

  // Health
  { name: "WHO News", url: "https://www.who.int/feeds/entity/news/en/rss.xml", domain: "who.int", region: "Global", category: "health" },
  { name: "STAT News", url: "https://www.statnews.com/feed/", domain: "statnews.com", region: "Global", category: "health" },
  { name: "Reuters Health", url: "https://feeds.reuters.com/reuters/healthNews", domain: "reuters.com", region: "Global", category: "health" },

  // Sports
  { name: "ESPN Top", url: "https://www.espn.com/espn/rss/news", domain: "espn.com", region: "Global", category: "culture" },
  { name: "BBC Sport", url: "http://feeds.bbci.co.uk/sport/rss.xml", domain: "bbc.com", region: "Global", category: "culture" },

  // Culture / entertainment
  { name: "BBC Entertainment", url: "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", domain: "bbc.com", region: "Global", category: "culture" },
  { name: "Variety", url: "https://variety.com/feed/", domain: "variety.com", region: "Global", category: "culture" },
  { name: "Hollywood Reporter", url: "https://www.hollywoodreporter.com/feed/", domain: "hollywoodreporter.com", region: "Global", category: "culture" },
];

const TIMEOUT_MS = 3500;

async function fetchWithTimeout(url: string): Promise<string | null> {
  const ac = new AbortController();
  const tid = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { "user-agent": "Pulse/1.0 (portfolio)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(tid);
  }
}

function parseRssItems(xml: string): Array<{ title: string; link: string }> {
  const items: Array<{ title: string; link: string }> = [];
  const matches = xml.matchAll(/<item[\s\S]*?<\/item>/g);
  for (const m of matches) {
    const block = m[0];
    const t = block.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const l = block.match(/<link[^>]*>([\s\S]*?)<\/link>/);
    if (!t) continue;
    const title = t[1]
      .replace(/<!\[CDATA\[/, "")
      .replace(/\]\]>/, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    const link = (l?.[1] ?? "").trim();
    if (title) items.push({ title, link });
    if (items.length >= 40) break;
  }
  return items;
}

export async function fetchRssSupplementary(): Promise<RawEvent[]> {
  const all: RawEvent[] = [];
  const seenTitles = new Set<string>();
  const now = new Date().toISOString();

  const results = await Promise.all(
    SOURCES.map(async (src) => {
      const xml = await fetchWithTimeout(src.url);
      if (!xml) return [] as Array<{ src: RssSource; title: string; link: string }>;
      return parseRssItems(xml).map((item) => ({ src, ...item }));
    }),
  );

  for (const batch of results) {
    for (const { src, title, link } of batch) {
      const key = title.toLowerCase().slice(0, 80);
      if (seenTitles.has(key)) continue;
      seenTitles.add(key);
      // Prefer the feed's declared category, otherwise classify from title text
      const category: Category = src.category ?? classify(title);
      all.push({
        id: `rss-${all.length}`,
        lat: 0,
        lng: 0,
        title,
        url: link,
        source: src.domain,
        datetime: now,
        tone: 0,
        category,
      });
    }
  }
  return all;
}
