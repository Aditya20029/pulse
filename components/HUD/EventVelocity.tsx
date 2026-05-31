"use client";

import { useMemo } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Category,
  Cluster,
} from "@/lib/types";

interface Props {
  clusters: Cluster[];
}

const ALL: Category[] = [
  "conflict",
  "politics",
  "economy",
  "environment",
  "tech",
  "other",
];

export function EventVelocity({ clusters }: Props) {
  const data = useMemo(() => {
    const totals = new Map<Category, number>();
    for (const c of clusters) {
      for (const e of c.events) {
        totals.set(e.category, (totals.get(e.category) ?? 0) + 1);
      }
    }
    const max = Math.max(1, ...ALL.map((c) => totals.get(c) ?? 0));
    return ALL.map((cat) => ({
      cat,
      count: totals.get(cat) ?? 0,
      pct: ((totals.get(cat) ?? 0) / max) * 100,
    }));
  }, [clusters]);

  return (
    <div>
      <div className="mb-2 flex items-end gap-1.5">
        {data.map((d) => (
          <div key={d.cat} className="flex flex-1 flex-col items-center gap-1">
            <span
              className="font-mono text-[9px] tabular-nums text-cyan-100/80"
              style={{ color: d.count > 0 ? CATEGORY_COLORS[d.cat] : undefined }}
            >
              {d.count}
            </span>
            <div className="relative h-10 w-full overflow-hidden rounded-t bg-cyan-400/8">
              <div
                className="absolute inset-x-0 bottom-0 rounded-t"
                style={{
                  height: `${Math.max(d.pct, 6)}%`,
                  background: CATEGORY_COLORS[d.cat],
                  boxShadow: `0 0 6px ${CATEGORY_COLORS[d.cat]}`,
                  opacity: 0.85,
                  transition: "height 0.5s ease",
                }}
              />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-wider text-cyan-100/45">
              {CATEGORY_LABELS[d.cat].slice(0, 4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
