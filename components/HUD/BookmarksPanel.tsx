"use client";

import { useState } from "react";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { useGlobeStore } from "@/stores/useGlobeStore";

export function BookmarksPanel() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const bookmarks = useBookmarksStore((s) => s.bookmarks);
  const addBookmark = useBookmarksStore((s) => s.addBookmark);
  const removeBookmark = useBookmarksStore((s) => s.removeBookmark);

  const selectedClusterId = useGlobeStore((s) => s.selectedClusterId);
  const selectedRegion = useGlobeStore((s) => s.selectedRegion);
  const timeScrubHoursAgo = useGlobeStore((s) => s.timeScrubHoursAgo);
  const clusters = useGlobeStore((s) => s.clusters);
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);
  const selectRegion = useGlobeStore((s) => s.selectRegion);
  const setTimeScrub = useGlobeStore((s) => s.setTimeScrub);

  const canSave = selectedClusterId || selectedRegion || timeScrubHoursAgo !== null;

  const save = () => {
    if (!name.trim() || !canSave) return;
    addBookmark({
      name: name.trim(),
      clusterId: selectedClusterId,
      region: selectedRegion,
      timeScrubHoursAgo: timeScrubHoursAgo,
    });
    setName("");
  };

  const restore = (b: { clusterId: string | null; region: string | null; timeScrubHoursAgo: number | null }) => {
    setTimeScrub(b.timeScrubHoursAgo);
    if (b.region) {
      selectRegion(b.region);
    } else if (b.clusterId) {
      const c = clusters.find((x) => x.id === b.clusterId);
      if (c) {
        selectCluster(c.id);
        flyTo(c.lat, c.lng);
      }
    }
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-screenshot-hide="true"
        className="pointer-events-auto absolute bottom-44 left-72 z-30 flex items-center gap-1.5 rounded border border-cyan-400/25 bg-cyan-400/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/15"
        title="Bookmarks"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
        Bookmarks
        {bookmarks.length > 0 && (
          <span className="rounded-full bg-cyan-400/25 px-1.5 py-0 text-[9px]">
            {bookmarks.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      data-screenshot-hide="true"
      className="pointer-events-auto absolute bottom-44 left-72 z-30 w-80 rounded-lg border border-cyan-400/20 bg-[rgba(4,6,12,0.95)] backdrop-blur-xl shadow-[0_0_40px_-12px_rgba(0,240,255,0.45)]"
    >
      <div className="flex items-center justify-between border-b border-cyan-400/15 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/75">
          Bookmarks
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-cyan-400/20 px-1.5 py-0 font-mono text-xs text-cyan-200 hover:bg-cyan-400/10"
        >
          ×
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="border-b border-cyan-400/10 p-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this view..."
          disabled={!canSave}
          className="w-full rounded border border-cyan-400/20 bg-[rgba(4,6,12,0.7)] px-2 py-1 text-xs text-cyan-50 placeholder:text-cyan-100/35 focus:border-cyan-300/55 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!canSave || !name.trim()}
          className="mt-2 w-full rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
        >
          {canSave ? "Save current view" : "Open a cluster or region first"}
        </button>
      </form>
      <div className="max-h-[300px] space-y-1 overflow-y-auto p-2">
        {bookmarks.length === 0 ? (
          <div className="py-4 text-center font-mono text-[10px] uppercase tracking-wider text-cyan-100/40">
            No saved views yet
          </div>
        ) : (
          bookmarks.map((b) => (
            <div
              key={b.id}
              className="group flex items-center gap-2 rounded border border-cyan-400/10 bg-white/[0.02] px-2 py-1.5 hover:border-cyan-400/30"
            >
              <button
                type="button"
                onClick={() => restore(b)}
                className="flex-1 text-left"
              >
                <div className="line-clamp-1 text-[11px] text-cyan-50">
                  {b.name}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-cyan-100/45">
                  {b.region ? "Region" : b.clusterId ? "Cluster" : "Time"}
                  {b.timeScrubHoursAgo !== null
                    ? ` · T-${b.timeScrubHoursAgo.toFixed(1)}h`
                    : ""}
                </div>
              </button>
              <button
                type="button"
                onClick={() => removeBookmark(b.id)}
                aria-label="Delete bookmark"
                className="rounded px-1 text-cyan-200/40 hover:bg-red-500/15 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
