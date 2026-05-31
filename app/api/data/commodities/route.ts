import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Commodity {
  symbol: string;
  name: string;
  unit: string;
  value: number;
  deltaPct: number;
}

interface Currency {
  pair: string;
  value: number;
  deltaPct: number;
}

interface Crypto {
  symbol: string;
  name: string;
  value: number;
  deltaPct: number;
}

const BASELINES = {
  GOLD: 2410,
  SILVER: 30.4,
  OIL_WTI: 78.2,
  OIL_BRENT: 82.5,
  NATGAS: 2.85,
  COPPER: 4.32,
  WHEAT: 6.15,
  COFFEE: 2.18,
  EURUSD: 1.082,
  GBPUSD: 1.272,
  USDJPY: 155.3,
  USDCNY: 7.22,
  USDINR: 83.4,
  AUDUSD: 0.668,
  BTC: 67500,
  ETH: 3450,
  SOL: 158,
};

function seededDelta(symbol: string, range: number = 2.0): number {
  let h = 0;
  const seed = `${symbol}-${Math.floor(Date.now() / (5 * 60 * 1000))}`;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const r = ((h & 0xffff) / 0xffff - 0.5) * 2;
  return r * range;
}

function makeRow<T extends { value: number; deltaPct: number }>(
  base: T,
  symbol: string,
  range: number,
): T {
  const deltaPct = seededDelta(symbol, range);
  return {
    ...base,
    value: parseFloat((base.value * (1 + deltaPct / 100)).toFixed(2)),
    deltaPct: parseFloat(deltaPct.toFixed(2)),
  };
}

export async function GET() {
  const commodities: Commodity[] = [
    makeRow({ symbol: "GOLD", name: "Gold", unit: "$/oz", value: BASELINES.GOLD, deltaPct: 0 }, "GOLD", 1.5),
    makeRow({ symbol: "SILVER", name: "Silver", unit: "$/oz", value: BASELINES.SILVER, deltaPct: 0 }, "SILVER", 2.5),
    makeRow({ symbol: "WTI", name: "WTI Crude", unit: "$/bbl", value: BASELINES.OIL_WTI, deltaPct: 0 }, "OIL_WTI", 3),
    makeRow({ symbol: "BRENT", name: "Brent", unit: "$/bbl", value: BASELINES.OIL_BRENT, deltaPct: 0 }, "OIL_BRENT", 3),
    makeRow({ symbol: "NATGAS", name: "Nat Gas", unit: "$/mmBtu", value: BASELINES.NATGAS, deltaPct: 0 }, "NATGAS", 4),
    makeRow({ symbol: "COPPER", name: "Copper", unit: "$/lb", value: BASELINES.COPPER, deltaPct: 0 }, "COPPER", 2),
    makeRow({ symbol: "WHEAT", name: "Wheat", unit: "$/bu", value: BASELINES.WHEAT, deltaPct: 0 }, "WHEAT", 2.5),
    makeRow({ symbol: "COFFEE", name: "Coffee", unit: "$/lb", value: BASELINES.COFFEE, deltaPct: 0 }, "COFFEE", 3),
  ];

  const currencies: Currency[] = [
    makeRow({ pair: "EUR/USD", value: BASELINES.EURUSD, deltaPct: 0 }, "EURUSD", 0.6),
    makeRow({ pair: "GBP/USD", value: BASELINES.GBPUSD, deltaPct: 0 }, "GBPUSD", 0.7),
    makeRow({ pair: "USD/JPY", value: BASELINES.USDJPY, deltaPct: 0 }, "USDJPY", 0.8),
    makeRow({ pair: "USD/CNY", value: BASELINES.USDCNY, deltaPct: 0 }, "USDCNY", 0.4),
    makeRow({ pair: "USD/INR", value: BASELINES.USDINR, deltaPct: 0 }, "USDINR", 0.5),
    makeRow({ pair: "AUD/USD", value: BASELINES.AUDUSD, deltaPct: 0 }, "AUDUSD", 0.7),
  ];

  const crypto: Crypto[] = [
    makeRow({ symbol: "BTC", name: "Bitcoin", value: BASELINES.BTC, deltaPct: 0 }, "BTC", 4),
    makeRow({ symbol: "ETH", name: "Ethereum", value: BASELINES.ETH, deltaPct: 0 }, "ETH", 5),
    makeRow({ symbol: "SOL", name: "Solana", value: BASELINES.SOL, deltaPct: 0 }, "SOL", 7),
  ];

  return NextResponse.json(
    { commodities, currencies, crypto, asOf: new Date().toISOString() },
    { headers: { "cache-control": "s-maxage=300, stale-while-revalidate=600" } },
  );
}
