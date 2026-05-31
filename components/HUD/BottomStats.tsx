"use client";

import { useMemo } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Category,
} from "@/lib/types";

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  alert?: boolean;
}

function Stat({ label, value, sub, accent, alert }: StatProps) {
  const valueColor = alert
    ? "text-amber-300"
    : accent
      ? "text-lime-300"
      : "text-zinc-100";
  return (
    <div className="flex min-w-0 flex-col">
      <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </span>
      <span
        className={`mt-0.5 font-mono text-[26px] leading-none tabular-nums ${valueColor}`}
      >
        {value}
      </span>
      {sub && (
        <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
          {sub}
        </span>
      )}
    </div>
  );
}

export function BottomStats() {
  const clusters = useGlobeStore((s) => s.clusters);

  const stats = useMemo(() => {
    let totalEvents = 0;
    const byCategory = new Map<Category, number>();
    const sourceSet = new Set<string>();
    let critical = 0;
    let topCategory: Category = "other";
    let topCategoryCount = 0;

    for (const c of clusters) {
      totalEvents += c.events.length;
      byCategory.set(
        c.category,
        (byCategory.get(c.category) ?? 0) + c.events.length,
      );
      for (const e of c.events) {
        if (e.source) sourceSet.add(e.source);
      }
      if (c.intensity >= 0.7) critical += 1;
    }

    for (const [cat, count] of byCategory) {
      if (count > topCategoryCount) {
        topCategoryCount = count;
        topCategory = cat;
      }
    }

    return {
      totalEvents,
      clusterCount: clusters.length,
      sourceCount: sourceSet.size,
      categoryCount: byCategory.size,
      critical,
      topCategory,
    };
  }, [clusters]);

  return (
    <div className="pointer-events-auto rounded-md border border-zinc-800/70 bg-[#0a0b0e]">
      <div className="grid grid-cols-5 divide-x divide-zinc-800/70">
        <div className="px-4 py-3">
          <Stat
            label="Total events"
            value={stats.totalEvents.toLocaleString()}
            sub="globally tracked"
            accent
          />
        </div>
        <div className="px-4 py-3">
          <Stat
            label="Clusters"
            value={String(stats.clusterCount)}
            sub="active hotspots"
          />
        </div>
        <div className="px-4 py-3">
          <Stat
            label="Sources"
            value={String(stats.sourceCount)}
            sub="distinct outlets"
          />
        </div>
        <div className="px-4 py-3">
          <Stat
            label="Categories"
            value={String(stats.categoryCount)}
            sub="event types"
          />
        </div>
        <div className="px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
              Alerts
            </span>
            <span
              className={`mt-0.5 font-mono text-[26px] leading-none tabular-nums ${
                stats.critical > 0 ? "text-amber-300" : "text-zinc-100"
              }`}
            >
              {stats.critical}
            </span>
            <span
              className="mt-1 font-mono text-[9px] uppercase tracking-wider"
              style={{
                color:
                  stats.critical > 0
                    ? CATEGORY_COLORS[stats.topCategory]
                    : "#71717a",
              }}
            >
              {stats.critical > 0
                ? CATEGORY_LABELS[stats.topCategory]
                : "all clear"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
