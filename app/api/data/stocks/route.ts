import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Index {
  symbol: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

const INDICES: Index[] = [
  { symbol: "SPX", name: "S&P 500", region: "United States", lat: 40.7128, lng: -74.006 },
  { symbol: "NDX", name: "Nasdaq 100", region: "United States", lat: 40.7128, lng: -74.006 },
  { symbol: "DJI", name: "Dow Jones", region: "United States", lat: 40.7128, lng: -74.006 },
  { symbol: "FTSE", name: "FTSE 100", region: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { symbol: "DAX", name: "DAX", region: "Germany", lat: 50.1109, lng: 8.6821 },
  { symbol: "CAC", name: "CAC 40", region: "France", lat: 48.8566, lng: 2.3522 },
  { symbol: "N225", name: "Nikkei 225", region: "Japan", lat: 35.6762, lng: 139.6503 },
  { symbol: "HSI", name: "Hang Seng", region: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  { symbol: "SHCOMP", name: "Shanghai Composite", region: "China", lat: 31.2304, lng: 121.4737 },
  { symbol: "BSESN", name: "Sensex", region: "India", lat: 19.076, lng: 72.8777 },
  { symbol: "AXJO", name: "ASX 200", region: "Australia", lat: -33.8688, lng: 151.2093 },
  { symbol: "BVSP", name: "Bovespa", region: "Brazil", lat: -23.5505, lng: -46.6333 },
];

const BASELINE: Record<string, number> = {
  SPX: 5680,
  NDX: 19840,
  DJI: 41200,
  FTSE: 8120,
  DAX: 19250,
  CAC: 7480,
  N225: 38600,
  HSI: 18950,
  SHCOMP: 3120,
  BSESN: 81200,
  AXJO: 8210,
  BVSP: 130400,
};

function seededDelta(symbol: string): number {
  let h = 0;
  const seed = `${symbol}-${Math.floor(Date.now() / (5 * 60 * 1000))}`;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const r = ((h & 0xffff) / 0xffff - 0.5) * 2;
  return r * 2.4;
}

export async function GET() {
  const data = INDICES.map((idx) => {
    const baseline = BASELINE[idx.symbol] ?? 1000;
    const deltaPct = seededDelta(idx.symbol);
    const value = baseline * (1 + deltaPct / 100);
    return {
      symbol: idx.symbol,
      name: idx.name,
      region: idx.region,
      lat: idx.lat,
      lng: idx.lng,
      value: parseFloat(value.toFixed(2)),
      deltaPct: parseFloat(deltaPct.toFixed(2)),
    };
  });
  return NextResponse.json(
    { indices: data, asOf: new Date().toISOString() },
    { headers: { "cache-control": "s-maxage=300, stale-while-revalidate=600" } },
  );
}
