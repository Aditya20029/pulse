"use client";

import { useEffect, useRef } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";
import type { ViewMode } from "@/stores/useGlobeStore";

export function DeepLinkSync() {
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cluster = params.get("cluster");
    const region = params.get("region");
    const time = params.get("t");
    const view = params.get("view") as ViewMode | null;

    const state = useGlobeStore.getState();
    if (view && ["satellite", "political", "heatmap"].includes(view)) {
      state.setViewMode(view);
    }
    if (time !== null) {
      const t = parseFloat(time);
      if (!Number.isNaN(t) && t >= 0) {
        state.setTimeScrub(t > 0 ? t : null);
      }
    }
    if (cluster) {
      const tryRestore = () => {
        const found = useGlobeStore
          .getState()
          .clusters.find((c) => c.id === cluster);
        if (found) {
          state.selectCluster(found.id);
          state.flyTo(found.lat, found.lng);
        } else if (useGlobeStore.getState().clusters.length === 0) {
          setTimeout(tryRestore, 300);
        }
      };
      tryRestore();
    } else if (region) {
      state.selectRegion(region);
    }
  }, []);

  const selectedClusterId = useGlobeStore((s) => s.selectedClusterId);
  const selectedRegion = useGlobeStore((s) => s.selectedRegion);
  const timeScrubHoursAgo = useGlobeStore((s) => s.timeScrubHoursAgo);
  const viewMode = useGlobeStore((s) => s.viewMode);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const params = new URLSearchParams();
    if (selectedClusterId) params.set("cluster", selectedClusterId);
    if (selectedRegion) params.set("region", selectedRegion);
    if (timeScrubHoursAgo !== null) params.set("t", timeScrubHoursAgo.toFixed(2));
    if (viewMode !== "satellite") params.set("view", viewMode);
    const qs = params.toString();
    const next = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState({}, "", next);
  }, [selectedClusterId, selectedRegion, timeScrubHoursAgo, viewMode]);

  return null;
}
