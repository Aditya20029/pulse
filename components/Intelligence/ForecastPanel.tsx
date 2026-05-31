"use client";

import { useEffect, useMemo, useState } from "react";
import { Cluster, CATEGORY_COLORS, Category } from "@/lib/types";

interface Prediction {
  title: string;
  probability: number;
  reasoning: string;
  horizon_hours: number;
  category: string;
}

interface ForecastResponse {
  predictions: Prediction[];
  summary: string;
}

interface Props {
  clusters: Cluster[];
}

function fingerprint(clusters: Cluster[]): string {
  return clusters
    .slice(0, 40)
    .map((c) => `${c.id}:${c.events.length}`)
    .join("|");
}

function probColor(p: number): string {
  if (p >= 0.7) return "#22c55e";
  if (p >= 0.4) return "#fbbf24";
  return "#94a3b8";
}

export function ForecastPanel({ clusters }: Props) {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const fp = useMemo(() => fingerprint(clusters), [clusters]);

  useEffect(() => {
    if (clusters.length === 0) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/news/forecast", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clusters }),
    })
      .then((r) => r.json())
      .then((d: ForecastResponse) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fp]);

  if (loading && !data) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded border border-cyan-400/10 bg-cyan-400/5"
          />
        ))}
      </div>
    );
  }

  if (!data || data.predictions.length === 0) return null;

  return (
    <div className="space-y-2">
      {data.summary && (
        <div className="rounded border border-cyan-400/15 bg-cyan-500/5 px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-cyan-300/80">
            Outlook
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-cyan-50/90">
            {data.summary}
          </p>
        </div>
      )}
      {data.predictions.map((p, i) => {
        const cat = (p.category as Category) ?? "other";
        const color = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;
        const pct = Math.round(p.probability * 100);
        return (
          <div
            key={i}
            className="rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2"
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-0.5 rounded px-1 font-mono text-[8px] font-bold tracking-widest"
                style={{
                  color: probColor(p.probability),
                  border: `1px solid ${probColor(p.probability)}55`,
                  background: `${probColor(p.probability)}10`,
                }}
              >
                {pct}%
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="block h-1.5 w-1.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="font-mono text-[8px] uppercase tracking-wider text-cyan-200/55">
                    {p.horizon_hours}h horizon • {cat}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] font-semibold leading-snug text-cyan-50">
                  {p.title}
                </div>
                <p className="mt-1 text-[10px] leading-snug text-cyan-50/70">
                  {p.reasoning}
                </p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-cyan-400/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: probColor(p.probability),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
