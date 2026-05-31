"use client";

import { useMemo } from "react";
import { Cluster } from "@/lib/types";

interface Props {
  clusters: Cluster[];
}

export function TopSources({ clusters }: Props) {
  const top = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of clusters) {
      for (const e of c.events) {
        if (!e.source) continue;
        counts.set(e.source, (counts.get(e.source) ?? 0) + 1);
      }
    }
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([source, count]) => ({
      source,
      count,
      pct: (count / max) * 100,
    }));
  }, [clusters]);

  if (top.length === 0) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-wider text-cyan-100/40">
        No sources yet
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {top.map((s) => (
        <div key={s.source} className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="truncate font-mono text-[10px] uppercase tracking-wider text-cyan-100/75">
              {s.source}
            </span>
            <span className="font-mono text-[10px] text-cyan-200/70 tabular-nums">
              {s.count}
            </span>
          </div>
          <div className="relative h-1 overflow-hidden rounded-full bg-cyan-400/8">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400/70 to-cyan-300"
              style={{
                width: `${s.pct}%`,
                boxShadow: "0 0 6px rgba(0, 240, 255, 0.5)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
