"use client";

import { useMemo } from "react";
import { CATEGORY_COLORS } from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";

export function PinnedCompare() {
  const pinnedId = useGlobeStore((s) => s.pinnedClusterId);
  const selectedId = useGlobeStore((s) => s.selectedClusterId);
  const clusters = useGlobeStore((s) => s.clusters);
  const pinCluster = useGlobeStore((s) => s.pinCluster);
  const swapPinned = useGlobeStore((s) => s.swapPinned);
  const flyTo = useGlobeStore((s) => s.flyTo);

  const pinned = useMemo(
    () => clusters.find((c) => c.id === pinnedId) ?? null,
    [clusters, pinnedId],
  );
  const selected = useMemo(
    () => clusters.find((c) => c.id === selectedId) ?? null,
    [clusters, selectedId],
  );

  if (!pinned) return null;

  const totalDelta = selected
    ? selected.events.length - pinned.events.length
    : 0;

  return (
    <div className="pointer-events-auto absolute bottom-44 left-72 z-30 w-72">
      <div className="rounded-lg border border-amber-400/25 bg-[rgba(4,6,12,0.92)] backdrop-blur-xl shadow-[0_0_30px_-12px_rgba(251,191,36,0.4)]">
        <div className="flex items-center justify-between border-b border-amber-400/15 px-3 py-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-300/85">
            Pinned compare
          </span>
          <div className="flex items-center gap-1.5">
            {selected && (
              <button
                type="button"
                onClick={swapPinned}
                title="Swap with active"
                className="rounded border border-amber-400/25 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-200 hover:bg-amber-400/10"
              >
                Swap
              </button>
            )}
            <button
              type="button"
              onClick={() => pinCluster(null)}
              title="Unpin"
              className="rounded-full border border-amber-400/25 px-1.5 py-0 font-mono text-xs text-amber-200 hover:bg-amber-400/10"
            >
              ×
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            useGlobeStore.getState().selectCluster(pinned.id);
            flyTo(pinned.lat, pinned.lng);
          }}
          className="block w-full px-3 py-2 text-left"
        >
          <div className="flex items-center gap-2">
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{
                background: CATEGORY_COLORS[pinned.category],
                boxShadow: `0 0 6px ${CATEGORY_COLORS[pinned.category]}`,
              }}
            />
            <span className="font-mono text-[8px] uppercase tracking-widest text-cyan-200/55">
              {pinned.events.length} events
            </span>
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-cyan-50/95">
            {pinned.dominantTitle}
          </div>
        </button>
        {selected && selected.id !== pinned.id && (
          <div className="border-t border-amber-400/10 px-3 py-1.5">
            <div className="font-mono text-[8px] uppercase tracking-wider text-amber-200/55">
              Vs active
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="line-clamp-1 max-w-[170px] text-[10px] text-cyan-50/85">
                {selected.dominantTitle}
              </span>
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{
                  color:
                    totalDelta > 0 ? "#22c55e" : totalDelta < 0 ? "#ef4444" : "#94a3b8",
                }}
              >
                {totalDelta >= 0 ? "+" : ""}
                {totalDelta}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
