"use client";

import useSWR from "swr";

interface Quote {
  symbol?: string;
  name?: string;
  pair?: string;
  unit?: string;
  value: number;
  deltaPct: number;
}

interface Response {
  commodities: Quote[];
  currencies: Quote[];
  crypto: Quote[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function Row({ q, label }: { q: Quote; label: string }) {
  const up = q.deltaPct >= 0;
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-200">
          {label}
        </div>
        {q.unit && (
          <div className="font-mono text-[8px] uppercase tracking-widest text-zinc-500">
            {q.unit}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="font-mono text-[11px] text-zinc-100 tabular-nums">
          {q.value.toLocaleString(undefined, {
            maximumFractionDigits: q.value > 100 ? 0 : 2,
          })}
        </div>
        <div
          className="font-mono text-[9px] tabular-nums"
          style={{ color: up ? "#22c55e" : "#ef4444" }}
        >
          {up ? "+" : ""}
          {q.deltaPct.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

export function CommoditiesPanel() {
  const { data } = useSWR<Response>("/api/data/commodities", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });

  if (!data) return null;

  return (
    <div className="space-y-2">
      <div>
        <div className="mb-1 flex items-center justify-between border-b border-zinc-800/60 pb-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
            Commodities
          </span>
        </div>
        <div className="space-y-0">
          {data.commodities.map((c) => (
            <Row key={c.symbol} q={c} label={c.name || c.symbol || ""} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between border-b border-zinc-800/60 pb-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
            FX
          </span>
        </div>
        <div className="space-y-0">
          {data.currencies.map((c) => (
            <Row key={c.pair} q={c} label={c.pair || ""} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between border-b border-zinc-800/60 pb-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
            Crypto
          </span>
        </div>
        <div className="space-y-0">
          {data.crypto.map((c) => (
            <Row key={c.symbol} q={c} label={c.name || c.symbol || ""} />
          ))}
        </div>
      </div>
    </div>
  );
}
