"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Category,
} from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { Toggle } from "@/components/ui/Toggle";
import { LazySection } from "@/components/ui/LazySection";
import { MobileSheet } from "./MobileSheet";

// Reused content widgets (all positioning-agnostic, take props or read store)
import { EventVelocity } from "@/components/HUD/EventVelocity";
import { WorldClock } from "@/components/HUD/WorldClock";
import { MarketsTicker } from "@/components/HUD/MarketsTicker";
import { CommoditiesPanel } from "@/components/HUD/CommoditiesPanel";
import { LiveStreams } from "@/components/HUD/LiveStreams";
import { LiveActivity } from "@/components/Intelligence/LiveActivity";
import { TrendingTopics } from "@/components/Intelligence/TrendingTopics";
import { PriorityAlerts } from "@/components/HUD/PriorityAlerts";
import { SentimentGauge } from "@/components/Intelligence/SentimentGauge";
import { CategoryBreakdown } from "@/components/Intelligence/CategoryBreakdown";
import { SeverityHistogram } from "@/components/Intelligence/SeverityHistogram";
import { HotspotLeaderboard } from "@/components/Intelligence/HotspotLeaderboard";
import { TopSources } from "@/components/Intelligence/TopSources";
import { AnomalyPanel } from "@/components/Intelligence/AnomalyPanel";
import { NarrativesPanel } from "@/components/Intelligence/NarrativesPanel";
import { ForecastPanel } from "@/components/Intelligence/ForecastPanel";
import { DigestPanel } from "@/components/Intelligence/DigestPanel";

import { BriefingPanel } from "@/components/Briefing/BriefingPanel";
import { RegionPanel } from "@/components/Region/RegionPanel";
import { AskClaude } from "@/components/Chat/AskClaude";

const ALL_CATS: Category[] = [
  "conflict", "politics", "economy", "environment", "wildlife",
  "tech", "science", "health", "culture", "other",
];

const TIMESPANS: { label: string; value: "1h" | "6h" | "24h" | "7d" }[] = [
  { label: "1H", value: "1h" },
  { label: "6H", value: "6h" },
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
];

type Tab = "map" | "layers" | "intel" | "markets";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-zinc-800/60 pb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
      {children}
    </h3>
  );
}

function MobileTopBar() {
  const [now, setNow] = useState<Date | null>(null);
  const clusters = useGlobeStore((s) => s.clusters);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const total = clusters.reduce((s, c) => s + c.events.length, 0);
  const utc = now
    ? `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`
    : "--:-- UTC";
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 z-30 flex items-center justify-between border-b border-zinc-800/60 bg-[rgba(4,6,12,0.82)] px-3 py-2 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-lime-400/15">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
        </span>
        <span className="font-mono text-sm font-bold tracking-[0.25em] text-zinc-100">
          PULSE
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-mono text-[11px] leading-none text-lime-300 tabular-nums">
            {total.toLocaleString()}
          </div>
          <div className="font-mono text-[7px] uppercase tracking-widest text-zinc-500">
            events
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[11px] leading-none text-zinc-200 tabular-nums">
            {utc}
          </div>
          <div className="flex items-center justify-end gap-1">
            <span className="h-1 w-1 rounded-full bg-lime-400" />
            <span className="font-mono text-[7px] uppercase tracking-widest text-lime-300/80">
              live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBar({
  active,
  onSelect,
}: {
  active: Tab;
  onSelect: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "map", label: "Globe", icon: "◐" },
    { id: "layers", label: "Layers", icon: "▤" },
    { id: "intel", label: "Intel", icon: "✦" },
    { id: "markets", label: "Data", icon: "$" },
  ];
  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex border-t border-zinc-800/70 bg-[rgba(4,6,12,0.95)] backdrop-blur-md">
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
          >
            <span
              className="font-mono text-base leading-none"
              style={{ color: on ? "#a3e635" : "#71717a" }}
            >
              {t.icon}
            </span>
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: on ? "#a3e635" : "#71717a" }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MobileApp() {
  const [tab, setTab] = useState<Tab>("map");

  const clusters = useGlobeStore((s) => s.clusters);
  const activeCategories = useGlobeStore((s) => s.activeCategories);
  const toggleCategory = useGlobeStore((s) => s.toggleCategory);
  const timespan = useGlobeStore((s) => s.timespan);
  const setTimespan = useGlobeStore((s) => s.setTimespan);
  const autoRotate = useGlobeStore((s) => s.autoRotate);
  const setAutoRotate = useGlobeStore((s) => s.setAutoRotate);
  const selectedClusterId = useGlobeStore((s) => s.selectedClusterId);
  const selectedRegion = useGlobeStore((s) => s.selectedRegion);

  // When a cluster/region is selected, collapse any open sheet so the briefing
  // (full-screen on mobile) is unobstructed.
  useEffect(() => {
    if (selectedClusterId || selectedRegion) setTab("map");
  }, [selectedClusterId, selectedRegion]);

  const byCat = useMemo(() => {
    const m = new Map<Category, number>();
    for (const c of clusters)
      m.set(c.category, (m.get(c.category) ?? 0) + c.events.length);
    return m;
  }, [clusters]);

  return (
    <>
      <MobileTopBar />

      {/* Layers sheet */}
      <MobileSheet
        open={tab === "layers"}
        title="Layers & Time"
        onClose={() => setTab("map")}
      >
        <section className="space-y-2">
          <SectionLabel>Timespan</SectionLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {TIMESPANS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTimespan(t.value)}
                className={`rounded border py-2 font-mono text-xs ${
                  timespan === t.value
                    ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
                    : "border-zinc-800/70 text-zinc-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className="w-full rounded border border-zinc-800/70 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300"
          >
            Auto-rotate: {autoRotate ? "On" : "Off"}
          </button>
        </section>

        <section className="space-y-2">
          <SectionLabel>Categories</SectionLabel>
          <div className="space-y-1">
            {ALL_CATS.map((cat) => {
              const on = activeCategories.has(cat);
              return (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded px-1 py-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: CATEGORY_COLORS[cat] }}
                    />
                    <span
                      className={`font-mono text-xs ${on ? "text-zinc-100" : "text-zinc-500"}`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                      {byCat.get(cat) ?? 0}
                    </span>
                    <Toggle
                      on={on}
                      onChange={() => toggleCategory(cat)}
                      color={CATEGORY_COLORS[cat]}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <SectionLabel>Velocity</SectionLabel>
          <EventVelocity clusters={clusters} />
        </section>
      </MobileSheet>

      {/* Intel sheet */}
      <MobileSheet
        open={tab === "intel"}
        title="Intelligence"
        onClose={() => setTab("map")}
      >
        <section className="space-y-2">
          <SectionLabel>Live channels</SectionLabel>
          <LiveStreams />
        </section>
        <section className="space-y-2">
          <SectionLabel>Live activity</SectionLabel>
          <LiveActivity />
        </section>
        <section className="space-y-2">
          <SectionLabel>Trending entities</SectionLabel>
          <TrendingTopics clusters={clusters} />
        </section>
        <section className="space-y-2">
          <SectionLabel>Priority alerts</SectionLabel>
          <PriorityAlerts clusters={clusters} />
        </section>
        <section className="space-y-2">
          <SectionLabel>AI anomaly detection</SectionLabel>
          <LazySection minHeight={120}>
            <AnomalyPanel clusters={clusters} />
          </LazySection>
        </section>
        <section className="space-y-2">
          <SectionLabel>Cross-cluster narratives</SectionLabel>
          <LazySection minHeight={120}>
            <NarrativesPanel clusters={clusters} />
          </LazySection>
        </section>
        <section className="space-y-2">
          <SectionLabel>24h forecast</SectionLabel>
          <LazySection minHeight={120}>
            <ForecastPanel clusters={clusters} />
          </LazySection>
        </section>
        <section className="space-y-2">
          <SectionLabel>Global sentiment</SectionLabel>
          <SentimentGauge clusters={clusters} />
        </section>
        <section className="space-y-2">
          <SectionLabel>Category split</SectionLabel>
          <CategoryBreakdown clusters={clusters} />
        </section>
        <section className="space-y-2">
          <SectionLabel>Severity</SectionLabel>
          <SeverityHistogram clusters={clusters} />
        </section>
        <section className="space-y-2">
          <SectionLabel>Top hotspots</SectionLabel>
          <HotspotLeaderboard clusters={clusters} />
        </section>
        <section className="space-y-2">
          <SectionLabel>Top sources</SectionLabel>
          <TopSources clusters={clusters} />
        </section>
        <section className="space-y-2">
          <SectionLabel>Daily digest</SectionLabel>
          <DigestPanel />
        </section>
      </MobileSheet>

      {/* Markets / Data sheet */}
      <MobileSheet
        open={tab === "markets"}
        title="Markets & Data"
        onClose={() => setTab("map")}
      >
        <section className="space-y-2">
          <SectionLabel>Indices</SectionLabel>
          <MarketsTicker />
        </section>
        <section className="space-y-2">
          <SectionLabel>Commodities · FX · Crypto</SectionLabel>
          <CommoditiesPanel />
        </section>
        <section className="space-y-2">
          <SectionLabel>Financial centers</SectionLabel>
          <WorldClock />
        </section>
      </MobileSheet>

      {/* Selection panels — full-screen sheets on mobile */}
      <BriefingPanel />
      <RegionPanel />

      {/* Ask Claude floating button (repositioned above the tab bar via max-md) */}
      <AskClaude />

      <TabBar active={tab} onSelect={(t) => setTab(t === tab ? "map" : t)} />
    </>
  );
}
