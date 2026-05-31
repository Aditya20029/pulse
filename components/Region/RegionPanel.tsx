"use client";

import { useEffect, useMemo, useState } from "react";
import type { Feature } from "geojson";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Category,
  Cluster,
} from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { loadWorldAtlas } from "@/lib/world-atlas";
import { findCountry, countryName } from "@/lib/country-detection";
import { downloadMarkdown, regionToMarkdown } from "@/lib/markdown-export";

function clustersInCountry(
  clusters: Cluster[],
  features: Feature[],
  regionName: string,
): Cluster[] {
  return clusters.filter((c) => {
    const f = findCountry(features, c.lat, c.lng);
    return countryName(f) === regionName;
  });
}

export function RegionPanel() {
  const region = useGlobeStore((s) => s.selectedRegion);
  const selectRegion = useGlobeStore((s) => s.selectRegion);
  const selectCluster = useGlobeStore((s) => s.selectCluster);
  const flyTo = useGlobeStore((s) => s.flyTo);
  const clusters = useGlobeStore((s) => s.clusters);
  const [features, setFeatures] = useState<Feature[] | null>(null);

  useEffect(() => {
    if (region) {
      loadWorldAtlas()
        .then((d) => setFeatures(d.features))
        .catch(() => {});
    }
  }, [region]);

  const regional = useMemo(() => {
    if (!region || !features) return [];
    return clustersInCountry(clusters, features, region);
  }, [region, features, clusters]);

  const stats = useMemo(() => {
    const byCat = new Map<Category, number>();
    let totalEvents = 0;
    let toneSum = 0;
    let toneCount = 0;
    for (const c of regional) {
      byCat.set(c.category, (byCat.get(c.category) ?? 0) + c.events.length);
      for (const e of c.events) {
        totalEvents += 1;
        toneSum += e.tone;
        toneCount += 1;
      }
    }
    const sortedCats = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1]);
    return {
      totalEvents,
      clusterCount: regional.length,
      sortedCats,
      avgTone: toneCount > 0 ? toneSum / toneCount : 0,
    };
  }, [regional]);

  const open = !!region;

  return (
    <aside
      aria-hidden={!open}
      className={`pointer-events-none absolute right-0 top-0 z-30 h-full w-full max-w-[420px] p-4 pt-20 transition-transform duration-500 ease-out ${
        open ? "translate-x-0" : "translate-x-[110%]"
      }`}
    >
      <div className="pointer-events-auto flex h-full flex-col rounded-lg border border-cyan-400/15 bg-[rgba(4,6,12,0.92)] backdrop-blur-2xl shadow-[0_0_60px_-20px_rgba(0,240,255,0.4)]">
        {region && (
          <>
            <div className="flex items-start justify-between border-b border-cyan-400/10 px-5 py-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-300/65">
                  Region focus
                </div>
                <h2 className="mt-0.5 text-lg font-semibold leading-tight text-cyan-50">
                  {region}
                </h2>
                <div className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-cyan-200/55">
                  <span>{stats.clusterCount} clusters</span>
                  <span>•</span>
                  <span>{stats.totalEvents} events</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Export region"
                  title="Export as Markdown"
                  onClick={() => {
                    const md = regionToMarkdown(region, regional);
                    const name = region
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .slice(0, 60);
                    downloadMarkdown(`pulse-region-${name}.md`, md);
                  }}
                  className="rounded border border-cyan-400/25 bg-cyan-400/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/15"
                >
                  .md
                </button>
                <button
                  type="button"
                  aria-label="Close region"
                  onClick={() => selectRegion(null)}
                  className="rounded-full border border-cyan-400/20 px-2 py-0.5 font-mono text-xs text-cyan-200 hover:bg-cyan-400/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {stats.totalEvents === 0 ? (
                <div className="rounded border border-cyan-400/10 bg-cyan-400/5 px-3 py-4 text-center font-mono text-[11px] uppercase tracking-wider text-cyan-200/55">
                  No tracked events in this country
                </div>
              ) : (
                <>
                  <section>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                      Category mix
                    </h3>
                    <div className="space-y-1.5">
                      {stats.sortedCats.map(([cat, count]) => (
                        <div
                          key={cat}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="block h-1.5 w-1.5 rounded-full"
                            style={{ background: CATEGORY_COLORS[cat] }}
                          />
                          <span className="flex-1 font-mono text-[10px] uppercase tracking-wider text-cyan-100/75">
                            {CATEGORY_LABELS[cat]}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-100/85 tabular-nums">
                            {count}
                          </span>
                          <div className="ml-2 h-1 w-20 overflow-hidden rounded-full bg-cyan-400/10">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(count / stats.totalEvents) * 100}%`,
                                background: CATEGORY_COLORS[cat],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                      Average tone
                    </h3>
                    <div className="flex items-center justify-between rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2">
                      <span className="font-mono text-xl text-cyan-50 tabular-nums">
                        {stats.avgTone >= 0 ? "+" : ""}
                        {stats.avgTone.toFixed(2)}
                      </span>
                      <span
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{
                          color:
                            stats.avgTone < -2
                              ? "#ef4444"
                              : stats.avgTone > 2
                                ? "#22c55e"
                                : "#fbbf24",
                        }}
                      >
                        {stats.avgTone < -2
                          ? "Negative"
                          : stats.avgTone > 2
                            ? "Positive"
                            : "Neutral"}
                      </span>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                      Clusters in {region}
                    </h3>
                    <div className="space-y-1.5">
                      {regional.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            selectCluster(c.id);
                            flyTo(c.lat, c.lng);
                          }}
                          className="block w-full rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="block h-1.5 w-1.5 rounded-full"
                              style={{
                                background: CATEGORY_COLORS[c.category],
                                boxShadow: `0 0 6px ${CATEGORY_COLORS[c.category]}`,
                              }}
                            />
                            <span className="line-clamp-1 flex-1 text-xs text-cyan-50/95">
                              {c.dominantTitle}
                            </span>
                            <span className="font-mono text-[10px] text-cyan-200/55 tabular-nums">
                              {c.events.length}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
