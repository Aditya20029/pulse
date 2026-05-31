"use client";

import { useGlobeStore } from "@/stores/useGlobeStore";
import { SentimentGauge } from "./SentimentGauge";
import { TopSources } from "./TopSources";
import { HotspotLeaderboard } from "./HotspotLeaderboard";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { SeverityHistogram } from "./SeverityHistogram";
import { PriorityAlerts } from "@/components/HUD/PriorityAlerts";
import { AnomalyPanel } from "./AnomalyPanel";
import { NarrativesPanel } from "./NarrativesPanel";
import { ForecastPanel } from "./ForecastPanel";
import { DigestPanel } from "./DigestPanel";
import { TrendingTopics } from "./TrendingTopics";
import { LiveActivity } from "./LiveActivity";
import { LiveStreams } from "@/components/HUD/LiveStreams";
import { LazySection } from "@/components/ui/LazySection";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {children}
      </h3>
    </div>
  );
}

export function IntelligencePanel() {
  const clusters = useGlobeStore((s) => s.clusters);
  const selectedClusterId = useGlobeStore((s) => s.selectedClusterId);
  const selectedRegion = useGlobeStore((s) => s.selectedRegion);

  const open = !selectedClusterId && !selectedRegion;

  return (
    <aside
      aria-hidden={!open}
      className={`pointer-events-none absolute right-0 top-0 z-20 h-full w-full max-w-[380px] p-4 pt-20 transition-transform duration-500 ease-out ${
        open ? "translate-x-0" : "translate-x-[110%]"
      }`}
    >
      <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-md border border-zinc-800/70 bg-[#0a0b0e]">
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3">
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-200">
              Intelligence Brief
            </h2>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              Real time signals, no event selected
            </p>
          </div>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-lime-300/85">
              Live
            </span>
          </span>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section>
            <SectionHeader>Live channels</SectionHeader>
            <div className="mt-3">
              <LiveStreams />
            </div>
          </section>

          <section>
            <SectionHeader>Live activity feed</SectionHeader>
            <div className="mt-3">
              <LiveActivity />
            </div>
          </section>

          <section>
            <SectionHeader>Trending entities</SectionHeader>
            <div className="mt-3">
              <TrendingTopics clusters={clusters} />
            </div>
          </section>

          <section>
            <SectionHeader>Priority alerts</SectionHeader>
            <div className="mt-3">
              <PriorityAlerts clusters={clusters} />
            </div>
          </section>

          <section>
            <SectionHeader>AI anomaly detection</SectionHeader>
            <div className="mt-3">
              <LazySection minHeight={120}>
                <AnomalyPanel clusters={clusters} />
              </LazySection>
            </div>
          </section>

          <section>
            <SectionHeader>Cross-cluster narratives</SectionHeader>
            <div className="mt-3">
              <LazySection minHeight={120}>
                <NarrativesPanel clusters={clusters} />
              </LazySection>
            </div>
          </section>

          <section>
            <SectionHeader>24h forecast</SectionHeader>
            <div className="mt-3">
              <LazySection minHeight={120}>
                <ForecastPanel clusters={clusters} />
              </LazySection>
            </div>
          </section>

          <section>
            <SectionHeader>Global sentiment</SectionHeader>
            <div className="mt-3">
              <SentimentGauge clusters={clusters} />
            </div>
          </section>

          <section>
            <SectionHeader>Category split</SectionHeader>
            <div className="mt-3">
              <CategoryBreakdown clusters={clusters} />
            </div>
          </section>

          <section>
            <SectionHeader>Severity distribution</SectionHeader>
            <div className="mt-3">
              <SeverityHistogram clusters={clusters} />
            </div>
          </section>

          <section>
            <SectionHeader>Top hotspots</SectionHeader>
            <div className="mt-3">
              <HotspotLeaderboard clusters={clusters} />
            </div>
          </section>

          <section>
            <SectionHeader>Top sources</SectionHeader>
            <div className="mt-3">
              <TopSources clusters={clusters} />
            </div>
          </section>

          <section>
            <SectionHeader>End-of-day digest</SectionHeader>
            <div className="mt-3">
              <DigestPanel />
            </div>
          </section>

          <section className="rounded border border-zinc-800/70 bg-zinc-900/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Tip
            </div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Click any glowing cluster on the globe for a Claude-generated briefing. Press ? to see shortcuts.
            </p>
          </section>
        </div>
      </div>
    </aside>
  );
}
