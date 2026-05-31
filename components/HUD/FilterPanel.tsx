"use client";

import { useMemo } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Category,
} from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Toggle } from "@/components/ui/Toggle";
import { EventVelocity } from "./EventVelocity";
import { WorldClock } from "./WorldClock";
import { MarketsTicker } from "./MarketsTicker";
import { CommoditiesPanel } from "./CommoditiesPanel";

const TIMESPANS: { label: string; value: "1h" | "6h" | "24h" | "7d" }[] = [
  { label: "1H", value: "1h" },
  { label: "6H", value: "6h" },
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
];

const ALL_CATS: Category[] = [
  "conflict",
  "politics",
  "economy",
  "environment",
  "wildlife",
  "tech",
  "science",
  "health",
  "culture",
  "other",
];

export function FilterPanel() {
  const clusters = useGlobeStore((s) => s.clusters);
  const activeCategories = useGlobeStore((s) => s.activeCategories);
  const toggleCategory = useGlobeStore((s) => s.toggleCategory);
  const timespan = useGlobeStore((s) => s.timespan);
  const setTimespan = useGlobeStore((s) => s.setTimespan);
  const autoRotate = useGlobeStore((s) => s.autoRotate);
  const setAutoRotate = useGlobeStore((s) => s.setAutoRotate);

  const stats = useMemo(() => {
    const byCat = new Map<Category, number>();
    for (const c of clusters) {
      byCat.set(c.category, (byCat.get(c.category) ?? 0) + c.events.length);
    }
    const total = clusters.reduce((s, c) => s + c.events.length, 0);
    let hottest: Category = "other";
    let hottestCount = 0;
    for (const [cat, count] of byCat) {
      if (count > hottestCount) {
        hottestCount = count;
        hottest = cat;
      }
    }
    return { total, byCat, hottest, hottestCount };
  }, [clusters]);

  return (
    <div className="pointer-events-none absolute left-4 top-24 z-20 flex max-h-[calc(100vh-180px)] w-64 flex-col gap-3 overflow-y-auto pr-1">
      <Panel className="pointer-events-auto">
        <PanelHeader
          label="Live"
          right={
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-lime-300/85">
                Streaming
              </span>
            </span>
          }
        />
        <div className="grid grid-cols-2 gap-3 p-3 pt-2">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Total events
            </div>
            <div className="mt-0.5 font-mono text-2xl text-lime-300 tabular-nums">
              {stats.total}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Clusters
            </div>
            <div className="mt-0.5 font-mono text-2xl text-zinc-100 tabular-nums">
              {clusters.length}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-800/70 px-3 py-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
            Hottest
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: CATEGORY_COLORS[stats.hottest] }}
          >
            {CATEGORY_LABELS[stats.hottest]}
          </span>
        </div>
      </Panel>

      <Panel className="pointer-events-auto">
        <PanelHeader
          label="Timespan"
          right={
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 hover:text-zinc-200"
            >
              {autoRotate ? "Pause" : "Spin"}
            </button>
          }
        />
        <div className="grid grid-cols-4 gap-1 p-2 pt-2">
          {TIMESPANS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTimespan(t.value)}
              className={`rounded border px-2 py-1 font-mono text-[11px] transition ${
                timespan === t.value
                  ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
                  : "border-zinc-800/70 bg-transparent text-zinc-500 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="pointer-events-auto">
        <PanelHeader label="Layers" hint={`${activeCategories.size}/${ALL_CATS.length}`} />
        <div className="flex flex-col p-2 pt-2">
          {ALL_CATS.map((cat) => {
            const active = activeCategories.has(cat);
            const count = stats.byCat.get(cat) ?? 0;
            return (
              <div
                key={cat}
                className="flex items-center justify-between rounded px-1.5 py-1.5 transition hover:bg-zinc-900/60"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="block h-1.5 w-1.5 rounded-full"
                    style={{ background: CATEGORY_COLORS[cat] }}
                  />
                  <span
                    className={`font-mono text-[11px] tracking-wide ${
                      active ? "text-zinc-100" : "text-zinc-500"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                    {count}
                  </span>
                  <Toggle
                    on={active}
                    onChange={() => toggleCategory(cat)}
                    color={CATEGORY_COLORS[cat]}
                    label={`Toggle ${CATEGORY_LABELS[cat]}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="pointer-events-auto">
        <PanelHeader label="Velocity" />
        <div className="p-3 pt-2">
          <EventVelocity clusters={clusters} />
        </div>
      </Panel>

      <Panel className="pointer-events-auto">
        <PanelHeader label="Financial centers" />
        <div className="p-3 pt-2">
          <WorldClock />
        </div>
      </Panel>

      <Panel className="pointer-events-auto">
        <PanelHeader label="Markets" />
        <div className="p-3 pt-2">
          <MarketsTicker />
        </div>
      </Panel>

      <Panel className="pointer-events-auto">
        <PanelHeader label="Tape" />
        <div className="p-3 pt-2">
          <CommoditiesPanel />
        </div>
      </Panel>
    </div>
  );
}
