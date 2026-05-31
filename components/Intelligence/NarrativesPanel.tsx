"use client";

import { useEffect, useMemo, useState } from "react";
import { Cluster, CATEGORY_COLORS, Category } from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";

interface Narrative {
  title: string;
  thread: string;
  cluster_indices: number[];
  category: string;
}

interface NarrativesResponse {
  narratives: Narrative[];
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

export function NarrativesPanel({ clusters }: Props) {
  const [data, setData] = useState<NarrativesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);
  const fp = useMemo(() => fingerprint(clusters), [clusters]);

  useEffect(() => {
    if (clusters.length === 0) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/news/narratives", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clusters }),
    })
      .then((r) => r.json())
      .then((d: NarrativesResponse) => {
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
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded border border-cyan-400/10 bg-cyan-400/5"
          />
        ))}
      </div>
    );
  }

  if (!data || data.narratives.length === 0) return null;

  return (
    <div className="space-y-2">
      {data.narratives.map((n, i) => {
        const cat = (n.category as Category) ?? "other";
        const color = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;
        return (
          <div
            key={i}
            className="rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
              <span className="font-mono text-[8px] uppercase tracking-widest text-cyan-300/65">
                Thread {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-semibold leading-snug text-cyan-50">
              {n.title}
            </div>
            <p className="mt-1 text-[10px] leading-snug text-cyan-50/75">
              {n.thread}
            </p>
            {n.cluster_indices.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {n.cluster_indices.slice(0, 8).map((idx) => {
                  const c = clusters[idx];
                  if (!c) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        selectCluster(c.id);
                        flyTo(c.lat, c.lng);
                      }}
                      title={c.dominantTitle}
                      className="rounded border border-cyan-400/20 bg-cyan-400/5 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-cyan-200/85 hover:bg-cyan-400/15"
                    >
                      #{idx}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
