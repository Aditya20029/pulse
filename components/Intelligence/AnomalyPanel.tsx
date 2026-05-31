"use client";

import { useEffect, useMemo, useState } from "react";
import { Cluster } from "@/lib/types";

interface Anomaly {
  title: string;
  description: string;
  category: string;
  region: string;
  severity: number;
}

interface AnomaliesResponse {
  anomalies: Anomaly[];
  signal: string;
}

interface Props {
  clusters: Cluster[];
}

function fingerprint(clusters: Cluster[]): string {
  return clusters
    .slice(0, 30)
    .map((c) => `${c.category}:${Math.round(c.lat)}:${Math.round(c.lng)}:${c.events.length}`)
    .join("|");
}

function severityColor(s: number): string {
  if (s >= 8) return "#ef4444";
  if (s >= 6) return "#fb923c";
  if (s >= 4) return "#fbbf24";
  return "#22d3ee";
}

export function AnomalyPanel({ clusters }: Props) {
  const [data, setData] = useState<AnomaliesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const fp = useMemo(() => fingerprint(clusters), [clusters]);

  useEffect(() => {
    if (clusters.length === 0) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/news/anomalies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clusters }),
    })
      .then((r) => r.json())
      .then((d: AnomaliesResponse) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // re-run when fingerprint changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fp]);

  if (loading && !data) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded border border-cyan-400/10 bg-cyan-400/5"
          />
        ))}
      </div>
    );
  }

  if (!data || data.anomalies.length === 0) return null;

  return (
    <div className="space-y-2">
      {data.signal && (
        <div className="rounded border border-purple-400/20 bg-purple-500/5 px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-purple-300/80">
            Signal
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-cyan-50/90">
            {data.signal}
          </p>
        </div>
      )}
      {data.anomalies.map((a, i) => (
        <div
          key={i}
          className="rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2"
        >
          <div className="flex items-start gap-2">
            <span
              className="mt-0.5 rounded px-1 font-mono text-[8px] font-bold tracking-widest"
              style={{
                color: severityColor(a.severity),
                border: `1px solid ${severityColor(a.severity)}55`,
                background: `${severityColor(a.severity)}10`,
              }}
            >
              {a.severity}/10
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-cyan-50">
                {a.title}
              </div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-cyan-200/55">
                {a.region} • {a.category}
              </div>
              <p className="mt-1 text-[10px] leading-snug text-cyan-50/75">
                {a.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
