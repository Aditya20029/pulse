import { RawEvent } from "./types";
import { classify } from "./gdelt";

const SEED_EVENTS: Array<Omit<RawEvent, "id" | "category" | "tone" | "datetime">> = [
  // Eastern Europe / Russia
  { lat: 50.4501, lng: 30.5234, title: "Kyiv air defences intercept overnight drone strike, officials say", url: "https://example.com/kyiv-drones", source: "reuters.com" },
  { lat: 48.0159, lng: 37.8028, title: "Donetsk shelling damages power grid, blackouts ripple across region", url: "https://example.com/donetsk-grid", source: "kyivindependent.com" },
  { lat: 55.7558, lng: 37.6173, title: "Moscow announces fresh tech import controls in response to sanctions", url: "https://example.com/moscow-tech", source: "tass.com" },
  { lat: 53.9006, lng: 27.5590, title: "Minsk hosts trilateral talks amid renewed border tensions", url: "https://example.com/minsk-talks", source: "belta.by" },

  // Middle East
  { lat: 31.5, lng: 34.47, title: "Gaza ceasefire talks resume in Cairo as mediators push for hostage deal", url: "https://example.com/gaza-talks", source: "aljazeera.com" },
  { lat: 33.5138, lng: 36.2765, title: "Damascus condemns overnight airstrike, demands UN investigation", url: "https://example.com/damascus-strike", source: "syrianobserver.com" },
  { lat: 32.0853, lng: 34.7818, title: "Tel Aviv markets jittery after diplomatic spat with European allies", url: "https://example.com/tel-aviv-markets", source: "haaretz.com" },
  { lat: 35.6892, lng: 51.389, title: "Tehran protests sanctions, threatens uranium enrichment increase", url: "https://example.com/tehran-uranium", source: "presstv.ir" },
  { lat: 33.3152, lng: 44.3661, title: "Baghdad police raid uncovers major weapons cache linked to militia", url: "https://example.com/baghdad-cache", source: "rudaw.net" },
  { lat: 24.7136, lng: 46.6753, title: "Riyadh greenlights sweeping AI investment for sovereign tech fund", url: "https://example.com/riyadh-ai", source: "arabnews.com" },
  { lat: 25.2048, lng: 55.2708, title: "Dubai hosts AI summit drawing major sovereign wealth funds", url: "https://example.com/dubai-ai", source: "gulfnews.com" },

  // Western Europe
  { lat: 51.5074, lng: -0.1278, title: "Bank of England signals hold on rates amid lingering wage growth", url: "https://example.com/boe-rates", source: "ft.com" },
  { lat: 48.8566, lng: 2.3522, title: "EU climate ministers gather to debate 2040 emissions target", url: "https://example.com/eu-climate", source: "lemonde.fr" },
  { lat: 50.8503, lng: 4.3517, title: "Brussels unveils landmark AI safety regulation framework", url: "https://example.com/brussels-ai", source: "politico.eu" },
  { lat: 52.52, lng: 13.405, title: "Berlin protests demand stricter renewable energy push", url: "https://example.com/berlin-climate", source: "dw.com" },
  { lat: 41.9028, lng: 12.4964, title: "Rome announces emergency response after coastal storm surge", url: "https://example.com/rome-storm", source: "ansa.it" },
  { lat: 40.4168, lng: -3.7038, title: "Madrid heatwave shatters May temperature records", url: "https://example.com/madrid-heat", source: "elpais.com" },
  { lat: 45.4642, lng: 9.19, title: "Milan auto show debuts new generation of electric platforms", url: "https://example.com/milan-ev", source: "ansa.it" },
  { lat: 59.3293, lng: 18.0686, title: "Stockholm cyberattack disrupts banking infrastructure briefly", url: "https://example.com/stockholm-cyber", source: "thelocal.se" },
  { lat: 60.1699, lng: 24.9384, title: "Helsinki rolls out experimental Arctic broadband corridor", url: "https://example.com/helsinki-arctic", source: "yle.fi" },
  { lat: 53.3498, lng: -6.2603, title: "Dublin tech sector adds 8,000 jobs amid AI-driven hiring surge", url: "https://example.com/dublin-jobs", source: "irishtimes.com" },
  { lat: 47.4979, lng: 19.0402, title: "Budapest parliament debates contested judicial reform package", url: "https://example.com/budapest-judicial", source: "hungarytoday.hu" },
  { lat: 41.0082, lng: 28.9784, title: "Istanbul mediates new round of grain corridor talks", url: "https://example.com/istanbul-grain", source: "hurriyetdailynews.com" },

  // North America
  { lat: 40.7128, lng: -74.006, title: "Wall Street rallies as inflation data comes in softer than expected", url: "https://example.com/wall-street", source: "bloomberg.com" },
  { lat: 38.9072, lng: -77.0369, title: "US Senate clears procedural vote on tech antitrust package", url: "https://example.com/senate-tech", source: "washingtonpost.com" },
  { lat: 37.7749, lng: -122.4194, title: "San Francisco startup unveils breakthrough fusion reactor milestone", url: "https://example.com/sf-fusion", source: "techcrunch.com" },
  { lat: 47.6062, lng: -122.3321, title: "Seattle climate suit filed by coalition of coastal cities", url: "https://example.com/seattle-climate", source: "seattletimes.com" },
  { lat: 34.0522, lng: -118.2437, title: "Los Angeles tech layoffs continue across major AI startups", url: "https://example.com/la-layoffs", source: "latimes.com" },
  { lat: 41.8781, lng: -87.6298, title: "Chicago FDA approves novel cancer therapy after Phase 3 trial", url: "https://example.com/chicago-fda", source: "chicagotribune.com" },
  { lat: 29.7604, lng: -95.3698, title: "Houston gulf hurricane brews, evacuations underway in three counties", url: "https://example.com/houston-storm", source: "houstonchronicle.com" },
  { lat: 25.7617, lng: -80.1918, title: "Miami coral reef restoration sees record juvenile coral survival", url: "https://example.com/miami-coral", source: "miamiherald.com" },
  { lat: 45.5017, lng: -73.5673, title: "Montreal AI lab publishes paper on reasoning model alignment", url: "https://example.com/montreal-ai", source: "cbc.ca" },
  { lat: 43.6532, lng: -79.3832, title: "Toronto exchange hits record on strong fintech earnings", url: "https://example.com/toronto-exchange", source: "globeandmail.com" },
  { lat: 19.4326, lng: -99.1332, title: "Mexico City quake rattles central neighborhoods, no major damage", url: "https://example.com/mxc-quake", source: "milenio.com" },

  // South America
  { lat: -23.5505, lng: -46.6333, title: "Brazil pledges Amazon deforestation cut at COP summit", url: "https://example.com/brazil-cop", source: "globo.com" },
  { lat: -3.119, lng: -60.0217, title: "Amazon researchers confirm rediscovery of presumed extinct frog species", url: "https://example.com/amazon-frog", source: "mongabay.com" },
  { lat: -34.6037, lng: -58.3816, title: "Argentina inflation slows for fourth straight month", url: "https://example.com/argentina-inflation", source: "clarin.com" },
  { lat: -33.4489, lng: -70.6693, title: "Santiago observatory captures sharpest exoplanet image to date", url: "https://example.com/santiago-exo", source: "eso.org" },
  { lat: -12.0464, lng: -77.0428, title: "Lima protests escalate over contested mining concession", url: "https://example.com/lima-mining", source: "elcomercio.pe" },
  { lat: 4.711, lng: -74.0721, title: "Bogota police seize cartel weapons cache in major operation", url: "https://example.com/bogota-cache", source: "eltiempo.com" },
  { lat: 10.4806, lng: -66.9036, title: "Caracas announces emergency oil output cuts amid grid failures", url: "https://example.com/caracas-oil", source: "elnacional.com" },

  // Africa
  { lat: 30.0444, lng: 31.2357, title: "Cairo summit yields tentative roadmap for regional ceasefire", url: "https://example.com/cairo-summit", source: "ahram.org.eg" },
  { lat: -1.2921, lng: 36.8219, title: "Nairobi tech corridor draws record venture funding", url: "https://example.com/nairobi-tech", source: "businessdaily.africa" },
  { lat: -1.95, lng: 30.0588, title: "Rwanda anti-poaching units track record mountain gorilla population growth", url: "https://example.com/rwanda-gorilla", source: "newtimes.co.rw" },
  { lat: 6.5244, lng: 3.3792, title: "Lagos floods worsen as record rainfall hits coastal districts", url: "https://example.com/lagos-floods", source: "punchng.com" },
  { lat: -26.2041, lng: 28.0473, title: "Johannesburg power crisis deepens as grid stability falters", url: "https://example.com/joburg-power", source: "iol.co.za" },
  { lat: -4.0383, lng: 21.7587, title: "DRC rangers confiscate record ivory shipment near Virunga", url: "https://example.com/drc-ivory", source: "africanews.com" },
  { lat: -29.8587, lng: 31.0218, title: "Durban scientists report bleaching reversal at restored reef site", url: "https://example.com/durban-reef", source: "iol.co.za" },
  { lat: 9.082, lng: 8.6753, title: "Abuja announces sweeping agricultural subsidy pivot to mitigate drought", url: "https://example.com/abuja-ag", source: "guardian.ng" },
  { lat: 36.7538, lng: 3.0588, title: "Algiers signs lithium development pact with European consortium", url: "https://example.com/algiers-lithium", source: "ennaharonline.com" },
  { lat: 14.6928, lng: -17.4467, title: "Dakar fisheries collapse triggers regional emergency talks", url: "https://example.com/dakar-fisheries", source: "rfi.fr" },

  // Asia
  { lat: 28.6139, lng: 77.209, title: "Delhi parliament debates contested AI safety bill", url: "https://example.com/delhi-ai-bill", source: "thehindu.com" },
  { lat: 19.076, lng: 72.8777, title: "Mumbai stocks hit record on strong earnings season", url: "https://example.com/mumbai-stocks", source: "economictimes.com" },
  { lat: 13.0827, lng: 80.2707, title: "Chennai oncologists report novel breast cancer biomarker discovery", url: "https://example.com/chennai-cancer", source: "thehindu.com" },
  { lat: 27.7172, lng: 85.324, title: "Kathmandu glacier survey finds accelerating Himalayan melt", url: "https://example.com/kathmandu-glacier", source: "kathmandupost.com" },
  { lat: 23.8103, lng: 90.4125, title: "Dhaka factory blaze prompts new garment industry safety probe", url: "https://example.com/dhaka-fire", source: "thedailystar.net" },
  { lat: 35.6762, lng: 139.6503, title: "Tokyo unveils fresh chip subsidies to bolster semiconductor supply", url: "https://example.com/tokyo-chips", source: "nikkei.com" },
  { lat: 37.5665, lng: 126.978, title: "Seoul accelerates satellite launch program", url: "https://example.com/seoul-satellite", source: "koreaherald.com" },
  { lat: 39.0392, lng: 125.7625, title: "Pyongyang missile test draws condemnation from regional partners", url: "https://example.com/pyongyang-missile", source: "yonhapnews.co.kr" },
  { lat: 39.9042, lng: 116.4074, title: "Beijing rolls out AI governance rules for generative models", url: "https://example.com/beijing-ai", source: "scmp.com" },
  { lat: 31.2304, lng: 121.4737, title: "Shanghai semiconductor exports surge despite tightened controls", url: "https://example.com/shanghai-chips", source: "caixinglobal.com" },
  { lat: 22.3193, lng: 114.1694, title: "Hong Kong markets dip after weaker China factory data", url: "https://example.com/hk-markets", source: "ft.com" },
  { lat: 25.0330, lng: 121.5654, title: "Taipei chipmaker unveils next-gen 1.6nm process node", url: "https://example.com/taipei-chip", source: "taipeitimes.com" },
  { lat: 14.5995, lng: 120.9842, title: "Manila braces for incoming super typhoon as evacuations begin", url: "https://example.com/manila-typhoon", source: "rappler.com" },
  { lat: -6.2088, lng: 106.8456, title: "Jakarta floods strand commuters as monsoon intensifies", url: "https://example.com/jakarta-floods", source: "jakartapost.com" },
  { lat: 1.3521, lng: 103.8198, title: "Singapore launches sovereign AI compute initiative", url: "https://example.com/sg-ai", source: "straitstimes.com" },
  { lat: 13.7563, lng: 100.5018, title: "Bangkok flooding strains rail and supply chains", url: "https://example.com/bangkok-floods", source: "bangkokpost.com" },
  { lat: 21.0285, lng: 105.8542, title: "Hanoi tech park lures regional GPU manufacturing contract", url: "https://example.com/hanoi-gpu", source: "vnexpress.net" },
  { lat: 3.139, lng: 101.6869, title: "Kuala Lumpur conservationists track success of orangutan rewilding", url: "https://example.com/kl-orangutan", source: "thestar.com.my" },
  { lat: 41.2995, lng: 69.2401, title: "Tashkent unveils $3B renewable energy plan with regional partners", url: "https://example.com/tashkent-renewable", source: "gazeta.uz" },

  // Oceania
  { lat: -33.8688, lng: 151.2093, title: "Sydney wildfires force evacuations along western suburbs", url: "https://example.com/sydney-fire", source: "abc.net.au" },
  { lat: -37.8136, lng: 144.9631, title: "Melbourne researchers publish quantum error correction milestone", url: "https://example.com/melbourne-quantum", source: "theage.com.au" },
  { lat: -41.2865, lng: 174.7762, title: "Wellington marine biologists report record whale migration counts", url: "https://example.com/wellington-whales", source: "stuff.co.nz" },
  { lat: -8.6500, lng: 115.2167, title: "Bali coral restoration project hits 10,000 transplant milestone", url: "https://example.com/bali-coral", source: "thejakartapost.com" },

  // Polar / oceans
  { lat: 64.1466, lng: -21.9426, title: "Reykjavik volcanic activity prompts new evacuation orders", url: "https://example.com/reykjavik-volcano", source: "icelandmag.is" },
  { lat: -77.85, lng: 166.6667, title: "McMurdo team confirms ice shelf fracture far exceeds prior estimates", url: "https://example.com/mcmurdo-ice", source: "nature.com" },
  { lat: 78.2232, lng: 15.6267, title: "Svalbard seed vault adds 30,000 new genetic samples", url: "https://example.com/svalbard-vault", source: "barentsobserver.com" },

  // Sports / Culture sprinkles
  { lat: 48.8584, lng: 2.2945, title: "Paris hosts world-record marathon as elite athletes converge", url: "https://example.com/paris-marathon", source: "lequipe.fr" },
  { lat: -22.9068, lng: -43.1729, title: "Rio carnival draws largest crowd in a decade", url: "https://example.com/rio-carnival", source: "globo.com" },
  { lat: 51.4934, lng: 0.0098, title: "Greenwich observatory unveils restored telescope after multi-year refit", url: "https://example.com/greenwich-telescope", source: "bbc.co.uk" },

  // Health
  { lat: 46.2044, lng: 6.1432, title: "Geneva WHO warns of resurgent respiratory outbreak across three regions", url: "https://example.com/geneva-who", source: "who.int" },
  { lat: 50.0755, lng: 14.4378, title: "Prague hospital trial reports breakthrough Alzheimer drug efficacy", url: "https://example.com/prague-alz", source: "praguemonitor.com" },
];

const STOPWORDS = new Set([
  "the","a","an","and","or","of","to","in","on","at","for","with","from","by","as",
  "is","are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","should","could","may","might","must","can","this","that","these",
  "those","its","it","also","new","amid","over","under","across","into","says","said",
  "announce","announces","announced","reports","reported","report","sweeping","pivot",
]);

function keywordsFor(title: string): string {
  const words = title
    .split(/[^A-Za-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w.toLowerCase()));
  // Prefer proper-noun-ish capitalized words first, then fall back to the rest
  const capitalized = words.filter((w) => /^[A-Z]/.test(w));
  const others = words.filter((w) => !/^[A-Z]/.test(w));
  const picked = [...capitalized.slice(0, 5), ...others.slice(0, 3)];
  return picked.join(" ");
}

function googleNewsUrl(title: string): string {
  // Broad Google News search across all outlets so it always returns
  // real current coverage even when the mock headline is paraphrased.
  const query = keywordsFor(title) || title;
  return `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-US`;
}

export function getMockEvents(): RawEvent[] {
  const nowMs = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  return SEED_EVENTS.map((e, i) => {
    const offset = (Math.sin(i * 0.913) * 0.5 + 0.5) * TWENTY_FOUR_HOURS;
    const date = new Date(nowMs - offset);
    return {
      ...e,
      url: googleNewsUrl(e.title),
      id: `mock-${i}`,
      tone: Math.sin(i * 1.7) * 4 + Math.cos(i * 0.6) * 2,
      datetime: date.toISOString(),
      category: classify(e.title),
    };
  });
}
