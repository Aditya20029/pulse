"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefingResponse,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Cluster,
} from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";
import {
  clusterBriefingToMarkdown,
  downloadMarkdown,
} from "@/lib/markdown-export";
import { ListenButton } from "./ListenButton";
import { safeUrl } from "@/lib/safe-url";

function SeverityBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value * 10));
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-cyan-400/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, #22d3ee 0%, #a855f7 50%, #ef4444 100%)",
            boxShadow: "0 0 10px rgba(0,240,255,0.5)",
          }}
        />
      </div>
      <span className="font-mono text-sm text-cyan-100 tabular-nums">
        {value}/10
      </span>
    </div>
  );
}

function SkeletonRow({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="my-2 h-3 rounded bg-cyan-400/10"
      style={{ width }}
    />
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-cyan-50/90">
      <span className="mt-1.5 block h-1 w-1 rounded-full bg-cyan-300" />
      <span>{children}</span>
    </li>
  );
}

export function BriefingPanel() {
  const clusters = useGlobeStore((s) => s.clusters);
  const selectedId = useGlobeStore((s) => s.selectedClusterId);
  const selectCluster = useGlobeStore((s) => s.selectCluster);
  const flyTo = useGlobeStore((s) => s.flyTo);
  const pinnedClusterId = useGlobeStore((s) => s.pinnedClusterId);
  const pinCluster = useGlobeStore((s) => s.pinCluster);

  const cluster: Cluster | null = useMemo(
    () => clusters.find((c) => c.id === selectedId) ?? null,
    [clusters, selectedId],
  );

  const [briefing, setBriefing] = useState<BriefingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [framing, setFraming] = useState<"default" | "devil" | "counterfactual">(
    "default",
  );
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (!cluster) {
      setBriefing(null);
      setError(null);
      setFraming("default");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setBriefing(null);

    (async () => {
      try {
        const res = await fetch("/api/news/brief", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cluster, framing, language }),
          signal: controller.signal,
        });
        if (!res.body) {
          const data = (await res.json()) as BriefingResponse;
          setBriefing(data);
          setLoading(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let firstParse = true;
        const { parsePartial } = await import("@/lib/partial-json");
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const partial = parsePartial<BriefingResponse>(accumulated);
          if (partial) {
            setBriefing(partial);
            if (firstParse) {
              setLoading(false);
              firstParse = false;
            }
          }
        }
        const final = parsePartial<BriefingResponse>(accumulated);
        if (final) setBriefing(final);
        setLoading(false);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [cluster, framing, language]);

  const open = !!cluster;

  const relatedClusters = useMemo(() => {
    if (!cluster) return [];
    return clusters
      .filter((c) => c.id !== cluster.id && c.category === cluster.category)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 5);
  }, [cluster, clusters]);

  const sources = useMemo(() => {
    if (!cluster) return [];
    const seen = new Set<string>();
    const items: { source: string; title: string; url: string }[] = [];
    for (const e of cluster.events) {
      if (!e.source || seen.has(e.source)) continue;
      if (!e.url) continue;
      seen.add(e.source);
      items.push({ source: e.source, title: e.title, url: e.url });
      if (items.length >= 5) break;
    }
    return items;
  }, [cluster]);

  return (
    <aside
      aria-hidden={!open}
      className={`pointer-events-none absolute right-0 top-0 z-30 h-full w-full max-w-[420px] p-4 pt-20 transition-transform duration-500 ease-out ${
        open ? "translate-x-0" : "translate-x-[110%]"
      }`}
    >
      <div className="pointer-events-auto flex h-full flex-col rounded-lg border border-cyan-400/15 bg-[rgba(10,10,15,0.92)] backdrop-blur-2xl shadow-[0_0_60px_-20px_rgba(0,240,255,0.4)]">
        {cluster && (
          <>
            <div className="border-b border-cyan-400/10 px-5 py-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="block h-2 w-2 rounded-full"
                      style={{
                        background: cluster.color,
                        boxShadow: `0 0 8px ${cluster.color}`,
                      }}
                    />
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: cluster.color }}
                    >
                      {CATEGORY_LABELS[cluster.category]}
                    </span>
                  </div>
                  <h2 className="line-clamp-2 text-base font-semibold leading-tight text-cyan-50">
                    {cluster.dominantTitle}
                  </h2>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-cyan-200/55">
                    {cluster.events.length} sources • {cluster.lat.toFixed(2)}°,{" "}
                    {cluster.lng.toFixed(2)}°
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close briefing"
                  onClick={() => selectCluster(null)}
                  className="ml-2 shrink-0 rounded-full border border-cyan-400/20 px-2 py-0.5 font-mono text-xs text-cyan-200 hover:bg-cyan-400/10"
                >
                  ×
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded border border-cyan-400/25 bg-cyan-400/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/15"
                  aria-label="Briefing language"
                >
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="hi">HI</option>
                  <option value="zh">ZH</option>
                  <option value="ar">AR</option>
                  <option value="de">DE</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setFraming(framing === "devil" ? "default" : "devil")
                  }
                  title="Devil's advocate framing"
                  aria-label="Devil's advocate framing"
                  className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest transition ${
                    framing === "devil"
                      ? "border-purple-400/45 bg-purple-500/15 text-purple-200"
                      : "border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/15"
                  }`}
                >
                  Devil
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFraming(
                      framing === "counterfactual" ? "default" : "counterfactual",
                    )
                  }
                  title="Counterfactual framing"
                  aria-label="Counterfactual framing"
                  className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest transition ${
                    framing === "counterfactual"
                      ? "border-amber-400/45 bg-amber-500/15 text-amber-200"
                      : "border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/15"
                  }`}
                >
                  What if
                </button>
                <ListenButton
                  text={
                    briefing
                      ? `${cluster.dominantTitle}. ${briefing.summary} ${briefing.significance}`
                      : cluster.dominantTitle
                  }
                />
                <button
                  type="button"
                  aria-label={pinnedClusterId === cluster.id ? "Unpin" : "Pin for compare"}
                  title={pinnedClusterId === cluster.id ? "Unpin" : "Pin for compare"}
                  onClick={() =>
                    pinCluster(
                      pinnedClusterId === cluster.id ? null : cluster.id,
                    )
                  }
                  className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest transition ${
                    pinnedClusterId === cluster.id
                      ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                      : "border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/15"
                  }`}
                >
                  Pin
                </button>
                <button
                  type="button"
                  aria-label="Export briefing"
                  title="Export as Markdown"
                  onClick={() => {
                    const md = clusterBriefingToMarkdown(cluster, briefing);
                    const name = cluster.dominantTitle
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .slice(0, 60);
                    downloadMarkdown(`pulse-${name}.md`, md);
                  }}
                  className="rounded border border-cyan-400/25 bg-cyan-400/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/15"
                >
                  .md
                </button>
                <button
                  type="button"
                  aria-label="Pop out briefing"
                  title="Open in new window"
                  onClick={() => {
                    if (typeof window === "undefined") return;
                    const url = new URL(window.location.href);
                    url.searchParams.set("cluster", cluster.id);
                    window.open(
                      url.toString(),
                      "_blank",
                      "width=520,height=900,resizable=yes",
                    );
                  }}
                  className="rounded border border-cyan-400/25 bg-cyan-400/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/15"
                >
                  ↗
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 touch-pan-y space-y-5 overflow-y-auto overscroll-contain px-5 pt-5 pb-24 min-[1025px]:pb-48">
              <section>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                  Severity
                </h3>
                {loading ? (
                  <SkeletonRow width="80%" />
                ) : (
                  <SeverityBar value={briefing?.severity ?? 5} />
                )}
              </section>

              <section>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                  What happened
                </h3>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow width="80%" />
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-cyan-50/90">
                    {briefing?.summary || "Awaiting analysis."}
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                  Why it matters
                </h3>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow width="65%" />
                  </>
                ) : (
                  <p className="text-sm leading-relaxed text-cyan-50/80">
                    {briefing?.significance || "n/a"}
                  </p>
                )}
              </section>

              {briefing?.connected_events &&
                briefing.connected_events.length > 0 && (
                  <section>
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                      Connected events
                    </h3>
                    <ul className="space-y-1.5">
                      {briefing.connected_events.map((e, i) => (
                        <ListItem key={i}>{e}</ListItem>
                      ))}
                    </ul>
                  </section>
                )}

              {briefing?.historical_parallels && (
                <section>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                    Historical parallels
                  </h3>
                  <p className="text-sm leading-relaxed text-cyan-50/80">
                    {briefing.historical_parallels}
                  </p>
                </section>
              )}

              {typeof briefing?.tone_forecast_12h === "number" && (
                <section>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                    Sentiment forecast (12h)
                  </h3>
                  <div className="rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-lg tabular-nums"
                        style={{
                          color:
                            briefing.tone_forecast_12h < -2
                              ? "#ef4444"
                              : briefing.tone_forecast_12h > 2
                                ? "#22c55e"
                                : "#fbbf24",
                        }}
                      >
                        {briefing.tone_forecast_12h >= 0 ? "+" : ""}
                        {briefing.tone_forecast_12h.toFixed(1)}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-cyan-100/45">
                        projected
                      </span>
                    </div>
                    {briefing.tone_forecast_reasoning && (
                      <p className="mt-1 text-[11px] leading-snug text-cyan-50/75">
                        {briefing.tone_forecast_reasoning}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {briefing?.key_actors && briefing.key_actors.length > 0 && (
                <section>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                    Key actors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {briefing.key_actors.map((a, i) => (
                      <span
                        key={i}
                        className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-0.5 font-mono text-[11px] text-cyan-100"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {relatedClusters.length > 0 && (
                <section>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                    Nearby on the globe
                  </h3>
                  <div className="space-y-1.5">
                    {relatedClusters.map((rc) => (
                      <button
                        key={rc.id}
                        type="button"
                        onClick={() => {
                          selectCluster(rc.id);
                          flyTo(rc.lat, rc.lng);
                        }}
                        className="block w-full rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="block h-1.5 w-1.5 rounded-full"
                            style={{
                              background: CATEGORY_COLORS[rc.category],
                              boxShadow: `0 0 6px ${CATEGORY_COLORS[rc.category]}`,
                            }}
                          />
                          <span className="line-clamp-1 text-xs text-cyan-50/95">
                            {rc.dominantTitle}
                          </span>
                        </div>
                        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-cyan-200/55">
                          {rc.events.length} events
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {sources.length > 0 && (
                <section>
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">
                    Sources
                  </h3>
                  <div className="space-y-1.5">
                    {sources.map((s) => (
                      <a
                        key={s.source}
                        href={safeUrl(s.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded border border-cyan-400/10 bg-white/[0.02] px-3 py-2 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                      >
                        <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/80">
                          {s.source}
                        </div>
                        <div className="line-clamp-1 text-xs text-cyan-50/90">
                          {s.title}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {error && (
                <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                  {error}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
