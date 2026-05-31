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

export function CategoryBreakdown({ clusters }: Props) {
  const { rows, total } = useMemo(() => {
    const counts = new Map<Category, number>();
    for (const c of clusters) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + c.events.length);
    }
    const total = clusters.reduce((s, c) => s + c.events.length, 0);
    const rows = ALL.map((cat) => ({
      cat,
      count: counts.get(cat) ?? 0,
      pct: total ? ((counts.get(cat) ?? 0) / total) * 100 : 0,
    }));
    return { rows, total };
  }, [clusters]);

  if (total === 0) return null;

  return (
    <div>
      <div className="mb-2 flex h-2 w-full overflow-hidden rounded-full">
        {rows.map((r) =>
          r.pct > 0 ? (
            <div
              key={r.cat}
              style={{
                width: `${r.pct}%`,
                background: CATEGORY_COLORS[r.cat],
                boxShadow: `0 0 6px ${CATEGORY_COLORS[r.cat]}`,
              }}
              title={`${CATEGORY_LABELS[r.cat]}: ${r.count}`}
            />
          ) : null,
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {rows.map((r) => (
          <div key={r.cat} className="flex items-center gap-1.5">
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{ background: CATEGORY_COLORS[r.cat] }}
            />
            <span className="flex-1 font-mono text-[10px] uppercase tracking-wider text-cyan-100/65">
              {CATEGORY_LABELS[r.cat]}
            </span>
            <span className="font-mono text-[10px] text-cyan-100/85 tabular-nums">
              {r.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
