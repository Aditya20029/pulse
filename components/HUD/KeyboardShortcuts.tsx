"use client";

import { useEffect, useState } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        if (e.key === "Escape" && target instanceof HTMLInputElement) {
          target.blur();
        }
        return;
      }

      const state = useGlobeStore.getState();

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]',
        );
        input?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (showHelp) {
          setShowHelp(false);
        } else if (state.selectedClusterId || state.selectedRegion) {
          state.selectCluster(null);
          state.selectRegion(null);
        }
        return;
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        const current = state.timeScrubHoursAgo;
        if (current === null) {
          state.setTimeScrub(24);
        } else {
          state.setTimeScrub(null);
        }
        return;
      }

      if (e.key === "j" || e.key === "k") {
        e.preventDefault();
        const order = state.clusters
          .filter((c) => state.activeCategories.has(c.category))
          .sort((a, b) => b.intensity - a.intensity);
        if (order.length === 0) return;
        const currentIdx = order.findIndex(
          (c) => c.id === state.selectedClusterId,
        );
        const next =
          e.key === "j"
            ? (currentIdx + 1) % order.length
            : (currentIdx - 1 + order.length) % order.length;
        const target = order[next];
        if (target) {
          state.selectCluster(target.id);
          state.flyTo(target.lat, target.lng);
        }
        return;
      }

      if (e.key === "v") {
        e.preventDefault();
        const modes = ["satellite", "political", "heatmap"] as const;
        const idx = modes.indexOf(state.viewMode);
        const next = modes[(idx + 1) % modes.length];
        state.setViewMode(next);
        return;
      }

      if (e.key === "r") {
        e.preventDefault();
        state.setAutoRotate(!state.autoRotate);
        return;
      }

      if (e.key === "h") {
        e.preventDefault();
        state.toggleHud();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showHelp]);

  if (!showHelp) return null;

  return (
    <div
      data-screenshot-hide="true"
      className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
      onClick={() => setShowHelp(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[440px] rounded-lg border border-cyan-400/25 bg-[rgba(4,6,12,0.97)] p-6 shadow-[0_0_60px_-10px_rgba(0,240,255,0.5)]"
      >
        <div className="flex items-start justify-between border-b border-cyan-400/15 pb-3">
          <div>
            <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-cyan-100">
              Shortcuts
            </h2>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-cyan-100/45">
              Pulse keyboard reference
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(false)}
            className="rounded-full border border-cyan-400/20 px-2 py-0.5 font-mono text-xs text-cyan-200 hover:bg-cyan-400/10"
          >
            ×
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12px]">
          {(
            [
              ["J / K", "Cycle clusters by intensity"],
              ["/", "Focus search"],
              ["Esc", "Close panels"],
              ["Space", "Play / pause timeline"],
              ["V", "Cycle view mode"],
              ["R", "Toggle auto-rotate"],
              ["H", "Hide / show HUD"],
              ["?", "Show this panel"],
              ["Click globe", "Drilldown by country"],
            ] as const
          ).map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <kbd className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-100">
                {key}
              </kbd>
              <span className="text-[11px] text-cyan-50/85">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
