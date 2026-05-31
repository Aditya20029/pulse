"use client";

import { useMemo } from "react";
import { Cluster } from "@/lib/types";

interface Props {
  clusters: Cluster[];
}

export function SeverityHistogram({ clusters }: Props) {
  const bars = useMemo(() => {
    const buckets = new Array(10).fill(0);
    for (const c of clusters) {
      const severity = Math.max(0, Math.min(9, Math.round(c.intensity * 9)));
      buckets[severity] += c.events.length;
    }
    const max = Math.max(...buckets, 1);
    return buckets.map((v, i) => ({
      bucket: i + 1,
      value: v,
      pct: (v / max) * 100,
    }));
  }, [clusters]);

  const total = bars.reduce((s, b) => s + b.value, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="flex h-12 items-end gap-1">
        {bars.map((b) => (
          <div
            key={b.bucket}
            className="relative flex-1"
            title={`Severity ${b.bucket}: ${b.value} events`}
          >
            <div
              className="w-full rounded-t bg-gradient-to-t from-cyan-500/70 to-cyan-300"
              style={{
                height: `${Math.max(b.pct, 4)}%`,
                boxShadow:
                  b.pct > 0 ? "0 0 6px rgba(0, 240, 255, 0.45)" : "none",
                transition: "height 0.4s ease",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-wider text-cyan-100/40">
        <span>1</span>
        <span>severity</span>
        <span>10</span>
      </div>
    </div>
  );
}
