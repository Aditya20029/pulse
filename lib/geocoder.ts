import { MAJOR_CITIES } from "./cities";

interface NamedPlace {
  name: string;
  lat: number;
  lng: number;
}

// Capital cities / well-known country anchor points.
// Used as the location for a country mentioned in a headline when no
// specific city is mentioned.
const COUNTRY_ANCHORS: NamedPlace[] = [
  { name: "United States", lat: 38.9072, lng: -77.0369 },
  { name: "USA", lat: 38.9072, lng: -77.0369 },
  { name: "America", lat: 38.9072, lng: -77.0369 },
  { name: "Russia", lat: 55.7558, lng: 37.6173 },
  { name: "China", lat: 39.9042, lng: 116.4074 },
  { name: "India", lat: 28.6139, lng: 77.209 },
  { name: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Britain", lat: 51.5074, lng: -0.1278 },
  { name: "England", lat: 51.5074, lng: -0.1278 },
  { name: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Germany", lat: 52.52, lng: 13.405 },
  { name: "Spain", lat: 40.4168, lng: -3.7038 },
  { name: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "South Korea", lat: 37.5665, lng: 126.978 },
  { name: "North Korea", lat: 39.0392, lng: 125.7625 },
  { name: "Korea", lat: 37.5665, lng: 126.978 },
  { name: "Ukraine", lat: 50.4501, lng: 30.5234 },
  { name: "Poland", lat: 52.2297, lng: 21.0122 },
  { name: "Israel", lat: 31.7683, lng: 35.2137 },
  { name: "Palestine", lat: 31.9522, lng: 35.2332 },
  { name: "Gaza", lat: 31.5, lng: 34.47 },
  { name: "Lebanon", lat: 33.8547, lng: 35.8623 },
  { name: "Syria", lat: 33.5138, lng: 36.2765 },
  { name: "Iran", lat: 35.6892, lng: 51.389 },
  { name: "Iraq", lat: 33.3152, lng: 44.3661 },
  { name: "Saudi Arabia", lat: 24.7136, lng: 46.6753 },
  { name: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Turkey", lat: 39.9334, lng: 32.8597 },
  { name: "Egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Nigeria", lat: 9.082, lng: 8.6753 },
  { name: "Kenya", lat: -1.2921, lng: 36.8219 },
  { name: "Ethiopia", lat: 9.145, lng: 40.4897 },
  { name: "Sudan", lat: 15.5007, lng: 32.5599 },
  { name: "South Africa", lat: -25.7461, lng: 28.1881 },
  { name: "Brazil", lat: -15.7942, lng: -47.8822 },
  { name: "Argentina", lat: -34.6037, lng: -58.3816 },
  { name: "Mexico", lat: 19.4326, lng: -99.1332 },
  { name: "Canada", lat: 45.4215, lng: -75.6972 },
  { name: "Australia", lat: -35.2809, lng: 149.13 },
  { name: "New Zealand", lat: -41.2865, lng: 174.7762 },
  { name: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { name: "Philippines", lat: 14.5995, lng: 120.9842 },
  { name: "Vietnam", lat: 21.0285, lng: 105.8542 },
  { name: "Thailand", lat: 13.7563, lng: 100.5018 },
  { name: "Malaysia", lat: 3.139, lng: 101.6869 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Pakistan", lat: 33.6844, lng: 73.0479 },
  { name: "Afghanistan", lat: 34.5553, lng: 69.2075 },
  { name: "Bangladesh", lat: 23.8103, lng: 90.4125 },
  { name: "Taiwan", lat: 25.033, lng: 121.5654 },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { name: "Greece", lat: 37.9838, lng: 23.7275 },
  { name: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "Sweden", lat: 59.3293, lng: 18.0686 },
  { name: "Norway", lat: 59.9139, lng: 10.7522 },
  { name: "Finland", lat: 60.1699, lng: 24.9384 },
  { name: "Belarus", lat: 53.9006, lng: 27.559 },
  { name: "Venezuela", lat: 10.4806, lng: -66.9036 },
  { name: "Colombia", lat: 4.711, lng: -74.0721 },
  { name: "Chile", lat: -33.4489, lng: -70.6693 },
  { name: "Peru", lat: -12.0464, lng: -77.0428 },
];

const US_STATES: NamedPlace[] = [
  { name: "California", lat: 36.7783, lng: -119.4179 },
  { name: "Texas", lat: 31.9686, lng: -99.9018 },
  { name: "Florida", lat: 27.6648, lng: -81.5158 },
  { name: "New York State", lat: 42.1657, lng: -74.9481 },
  { name: "Illinois", lat: 40.6331, lng: -89.3985 },
  { name: "Pennsylvania", lat: 41.2033, lng: -77.1945 },
  { name: "Ohio", lat: 40.4173, lng: -82.9071 },
  { name: "North Carolina", lat: 35.7596, lng: -79.0193 },
  { name: "Michigan", lat: 44.3148, lng: -85.6024 },
  { name: "Washington state", lat: 47.7511, lng: -120.7401 },
  { name: "Arizona", lat: 34.0489, lng: -111.0937 },
  { name: "Massachusetts", lat: 42.4072, lng: -71.3824 },
  { name: "Virginia", lat: 37.4316, lng: -78.6569 },
  { name: "Colorado", lat: 39.5501, lng: -105.7821 },
  { name: "Oregon", lat: 43.8041, lng: -120.5542 },
  { name: "Hawaii", lat: 19.8987, lng: -155.6659 },
  { name: "Alaska", lat: 64.2008, lng: -149.4937 },
  { name: "Maui", lat: 20.7984, lng: -156.3319 },
  { name: "Louisiana", lat: 30.9843, lng: -91.9623 },
  { name: "New Orleans", lat: 29.9511, lng: -90.0715 },
  { name: "Houston", lat: 29.7604, lng: -95.3698 },
  { name: "Phoenix", lat: 33.4484, lng: -112.074 },
  { name: "Philadelphia", lat: 39.9526, lng: -75.1652 },
  { name: "San Antonio", lat: 29.4241, lng: -98.4936 },
  { name: "San Diego", lat: 32.7157, lng: -117.1611 },
  { name: "Dallas", lat: 32.7767, lng: -96.797 },
  { name: "Austin", lat: 30.2672, lng: -97.7431 },
  { name: "Miami", lat: 25.7617, lng: -80.1918 },
  { name: "Atlanta", lat: 33.749, lng: -84.388 },
  { name: "Boston", lat: 42.3601, lng: -71.0589 },
  { name: "Seattle", lat: 47.6062, lng: -122.3321 },
  { name: "Denver", lat: 39.7392, lng: -104.9903 },
  { name: "Detroit", lat: 42.3314, lng: -83.0458 },
  { name: "Minneapolis", lat: 44.9778, lng: -93.265 },
  { name: "Washington DC", lat: 38.9072, lng: -77.0369 },
  { name: "Washington", lat: 38.9072, lng: -77.0369 },
];

const LEADER_ALIASES: NamedPlace[] = [
  { name: "Trump", lat: 38.9072, lng: -77.0369 },
  { name: "Biden", lat: 38.9072, lng: -77.0369 },
  { name: "Harris", lat: 38.9072, lng: -77.0369 },
  { name: "White House", lat: 38.9072, lng: -77.0369 },
  { name: "Pentagon", lat: 38.871, lng: -77.0563 },
  { name: "Congress", lat: 38.8899, lng: -77.0091 },
  { name: "Senate", lat: 38.8899, lng: -77.0091 },
  { name: "Putin", lat: 55.7558, lng: 37.6173 },
  { name: "Kremlin", lat: 55.7517, lng: 37.6178 },
  { name: "Xi Jinping", lat: 39.9042, lng: 116.4074 },
  { name: "Modi", lat: 28.6139, lng: 77.209 },
  { name: "Zelenskyy", lat: 50.4501, lng: 30.5234 },
  { name: "Zelensky", lat: 50.4501, lng: 30.5234 },
  { name: "Netanyahu", lat: 31.7683, lng: 35.2137 },
  { name: "Hamas", lat: 31.5, lng: 34.47 },
  { name: "Hezbollah", lat: 33.8547, lng: 35.8623 },
  { name: "Houthis", lat: 15.3694, lng: 44.191 },
  { name: "Yemen", lat: 15.3694, lng: 44.191 },
  { name: "Starmer", lat: 51.5074, lng: -0.1278 },
  { name: "Macron", lat: 48.8566, lng: 2.3522 },
  { name: "Merz", lat: 52.52, lng: 13.405 },
  { name: "Scholz", lat: 52.52, lng: 13.405 },
  { name: "Erdogan", lat: 39.9334, lng: 32.8597 },
  { name: "Lula", lat: -15.7942, lng: -47.8822 },
  { name: "Milei", lat: -34.6037, lng: -58.3816 },
  { name: "EU", lat: 50.8503, lng: 4.3517 },
  { name: "European Union", lat: 50.8503, lng: 4.3517 },
  { name: "NATO", lat: 50.8503, lng: 4.3517 },
  { name: "UN", lat: 40.7484, lng: -73.9683 },
  { name: "United Nations", lat: 40.7484, lng: -73.9683 },
];

const REGIONAL: NamedPlace[] = [
  { name: "Middle East", lat: 31.5, lng: 38 },
  { name: "Mideast", lat: 31.5, lng: 38 },
  { name: "Balkans", lat: 43.5, lng: 21 },
  { name: "Scandinavia", lat: 60, lng: 15 },
  { name: "Caribbean", lat: 18, lng: -75 },
  { name: "Sahel", lat: 14, lng: 0 },
  { name: "Horn of Africa", lat: 8, lng: 43 },
  { name: "South Asia", lat: 20, lng: 78 },
  { name: "Southeast Asia", lat: 10, lng: 110 },
  { name: "Latin America", lat: -15, lng: -60 },
];

const CITY_PLACES: NamedPlace[] = MAJOR_CITIES.map((c) => ({
  name: c.name,
  lat: c.lat,
  lng: c.lng,
}));

// City + country lookup, longest names first so "South Korea" wins over "Korea"
const ALL_PLACES: NamedPlace[] = [
  ...CITY_PLACES,
  ...COUNTRY_ANCHORS,
  ...US_STATES,
  ...LEADER_ALIASES,
  ...REGIONAL,
].sort((a, b) => b.name.length - a.name.length);

/**
 * HQ / primary newsroom of major news domains. Used as a fallback when a
 * headline has no recognizable place name so we can still plot it on the
 * globe at a sensible location.
 */
const SOURCE_DEFAULTS: Record<string, { lat: number; lng: number }> = {
  "bbc.com": { lat: 51.5074, lng: -0.1278 },
  "bbc.co.uk": { lat: 51.5074, lng: -0.1278 },
  "theguardian.com": { lat: 51.5074, lng: -0.1278 },
  "independent.co.uk": { lat: 51.5074, lng: -0.1278 },
  "telegraph.co.uk": { lat: 51.5074, lng: -0.1278 },
  "ft.com": { lat: 51.5074, lng: -0.1278 },
  "news.sky.com": { lat: 51.5074, lng: -0.1278 },
  "reuters.com": { lat: 51.5074, lng: -0.1278 },
  "aljazeera.com": { lat: 25.2854, lng: 51.531 },
  "france24.com": { lat: 48.8566, lng: 2.3522 },
  "lemonde.fr": { lat: 48.8566, lng: 2.3522 },
  "lequipe.fr": { lat: 48.8566, lng: 2.3522 },
  "rfi.fr": { lat: 48.8566, lng: 2.3522 },
  "dw.com": { lat: 50.937, lng: 6.961 },
  "spiegel.de": { lat: 53.5511, lng: 9.9937 },
  "euronews.com": { lat: 45.764, lng: 4.8357 },
  "nhk.or.jp": { lat: 35.6762, lng: 139.6503 },
  "asia.nikkei.com": { lat: 35.6762, lng: 139.6503 },
  "scmp.com": { lat: 22.3193, lng: 114.1694 },
  "thehindu.com": { lat: 13.0827, lng: 80.2707 },
  "timesofindia.indiatimes.com": { lat: 19.076, lng: 72.8777 },
  "channelnewsasia.com": { lat: 1.3521, lng: 103.8198 },
  "straitstimes.com": { lat: 1.3521, lng: 103.8198 },
  "businessdaily.africa": { lat: -1.2921, lng: 36.8219 },
  "iol.co.za": { lat: -26.2041, lng: 28.0473 },
  "news24.com": { lat: -26.2041, lng: 28.0473 },
  "allafrica.com": { lat: 9.082, lng: 8.6753 },
  "punchng.com": { lat: 6.5244, lng: 3.3792 },
  "ahram.org.eg": { lat: 30.0444, lng: 31.2357 },
  "globo.com": { lat: -22.9068, lng: -43.1729 },
  "clarin.com": { lat: -34.6037, lng: -58.3816 },
  "eltiempo.com": { lat: 4.711, lng: -74.0721 },
  "elpais.com": { lat: 40.4168, lng: -3.7038 },
  "ansa.it": { lat: 41.9028, lng: 12.4964 },
  "tass.com": { lat: 55.7558, lng: 37.6173 },
  "belta.by": { lat: 53.9006, lng: 27.559 },
  "presstv.ir": { lat: 35.6892, lng: 51.389 },
  "hurriyetdailynews.com": { lat: 41.0082, lng: 28.9784 },
  "bangkokpost.com": { lat: 13.7563, lng: 100.5018 },
  "rappler.com": { lat: 14.5995, lng: 120.9842 },
  "koreaherald.com": { lat: 37.5665, lng: 126.978 },
  "gulfnews.com": { lat: 25.2048, lng: 55.2708 },
  "thelocal.se": { lat: 59.3293, lng: 18.0686 },
  "yle.fi": { lat: 60.1699, lng: 24.9384 },
  "kyivindependent.com": { lat: 50.4501, lng: 30.5234 },
  "stuff.co.nz": { lat: -41.2865, lng: 174.7762 },
  "abc.net.au": { lat: -33.8688, lng: 151.2093 },
  "theage.com.au": { lat: -37.8136, lng: 144.9631 },
  "thejakartapost.com": { lat: -6.2088, lng: 106.8456 },
  // US-based
  "apnews.com": { lat: 40.7128, lng: -74.006 },
  "nytimes.com": { lat: 40.7128, lng: -74.006 },
  "washingtonpost.com": { lat: 38.9072, lng: -77.0369 },
  "npr.org": { lat: 38.9072, lng: -77.0369 },
  "politico.com": { lat: 38.9072, lng: -77.0369 },
  "thehill.com": { lat: 38.9072, lng: -77.0369 },
  "nbcnews.com": { lat: 40.7128, lng: -74.006 },
  "cbsnews.com": { lat: 40.7128, lng: -74.006 },
  "abcnews.go.com": { lat: 40.7128, lng: -74.006 },
  "cnn.com": { lat: 33.749, lng: -84.388 },
  "foxnews.com": { lat: 40.7128, lng: -74.006 },
  "bloomberg.com": { lat: 40.7128, lng: -74.006 },
  "marketwatch.com": { lat: 40.7128, lng: -74.006 },
  "cnbc.com": { lat: 40.7587, lng: -73.9852 },
  "wsj.com": { lat: 40.7128, lng: -74.006 },
  "businessinsider.com": { lat: 40.7128, lng: -74.006 },
  // Tech
  "techcrunch.com": { lat: 37.7749, lng: -122.4194 },
  "theverge.com": { lat: 40.7128, lng: -74.006 },
  "arstechnica.com": { lat: 40.7128, lng: -74.006 },
  "wired.com": { lat: 37.7749, lng: -122.4194 },
  "news.ycombinator.com": { lat: 37.7749, lng: -122.4194 },
  "ycombinator.com": { lat: 37.7749, lng: -122.4194 },
  "github.com": { lat: 37.7749, lng: -122.4194 },
  // Science
  "nasa.gov": { lat: 38.9072, lng: -77.0369 },
  "sciencedaily.com": { lat: 38.9072, lng: -77.0369 },
  "phys.org": { lat: 51.5074, lng: -0.1278 },
  "nature.com": { lat: 51.5074, lng: -0.1278 },
  "who.int": { lat: 46.2044, lng: 6.1432 },
  "statnews.com": { lat: 42.3601, lng: -71.0589 },
  "climatechangenews.com": { lat: 51.5074, lng: -0.1278 },
  "mongabay.com": { lat: 37.7749, lng: -122.4194 },
  // Sports / culture (default US east coast)
  "espn.com": { lat: 41.6612, lng: -91.5302 },
  "variety.com": { lat: 34.0522, lng: -118.2437 },
  "hollywoodreporter.com": { lat: 34.0522, lng: -118.2437 },
};

export function geocodeBySource(
  source: string,
): { lat: number; lng: number; place: string } | null {
  const host = source.replace(/^www\./, "").toLowerCase();
  const hit = SOURCE_DEFAULTS[host];
  if (!hit) return null;
  return { ...hit, place: host };
}

export function geocodeHeadline(
  title: string,
): { lat: number; lng: number; place: string } | null {
  const all = geocodeHeadlineAll(title);
  return all[0] ?? null;
}

export function geocodeHeadlineAll(
  title: string,
): Array<{ lat: number; lng: number; place: string }> {
  if (!title) return [];
  const hits: Array<{ lat: number; lng: number; place: string }> = [];
  const seenPlaces = new Set<string>();
  for (const p of ALL_PLACES) {
    const escaped = p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const looser = new RegExp(`\\b${escaped}\\b`, "i");
    if (looser.test(title)) {
      // Dedup overlapping matches: if "United States" already matched, skip "States"
      const key = p.name.toLowerCase();
      if (seenPlaces.has(key)) continue;
      // Skip if a longer place name (already matched) contains this one
      let containedInLonger = false;
      for (const existing of seenPlaces) {
        if (existing.includes(key) && existing.length > key.length) {
          containedInLonger = true;
          break;
        }
      }
      if (containedInLonger) continue;
      hits.push({ lat: p.lat, lng: p.lng, place: p.name });
      seenPlaces.add(key);
      if (hits.length >= 3) break; // cap to avoid runaway
    }
  }
  return hits;
}
