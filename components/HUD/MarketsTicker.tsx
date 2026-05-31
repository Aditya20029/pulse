"use client";

import useSWR from "swr";

interface IndexQuote {
  symbol: string;
  name: string;
  region: string;
  value: number;
  deltaPct: number;
}

interface Response {
  indices: IndexQuote[];
  asOf: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MarketsTicker() {
  const { data } = useSWR<Response>("/api/data/stocks", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });

  if (!data || data.indices.length === 0) return null;

  return (
    <div className="space-y-1">
      {data.indices.slice(0, 6).map((i) => {
        const up = i.deltaPct >= 0;
        return (
          <div
            key={i.symbol}
            className="flex items-center justify-between gap-2"
          >
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-100/85">
                {i.symbol}
              </div>
              <div className="font-mono text-[8px] uppercase tracking-widest text-cyan-100/35">
                {i.region}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] text-cyan-50 tabular-nums">
                {i.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div
                className="font-mono text-[10px] tabular-nums"
                style={{ color: up ? "#22c55e" : "#ef4444" }}
              >
                {up ? "+" : ""}
                {i.deltaPct.toFixed(2)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
