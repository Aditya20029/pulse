"use client";

import { create } from "zustand";
import { Category, Cluster } from "@/lib/types";

export type ViewMode = "satellite" | "political" | "heatmap";

interface GlobeState {
  clusters: Cluster[];
  selectedClusterId: string | null;
  selectedRegion: string | null;
  hoveredClusterId: string | null;
  hoveredCoords: { lat: number; lng: number } | null;
  hoveredCountry: string | null;
  activeCategories: Set<Category>;
  timespan: "1h" | "6h" | "24h" | "7d";
  autoRotate: boolean;
  flyToTarget: { lat: number; lng: number; key: number } | null;
  timeScrubHoursAgo: number | null;
  viewMode: ViewMode;
  soundEnabled: boolean;
  cameraDistance: number;

  setClusters: (clusters: Cluster[]) => void;
  selectCluster: (id: string | null) => void;
  selectRegion: (region: string | null) => void;
  setHover: (id: string | null) => void;
  setHoveredCoords: (coords: { lat: number; lng: number } | null) => void;
  setHoveredCountry: (name: string | null) => void;
  toggleCategory: (cat: Category) => void;
  setTimespan: (t: "1h" | "6h" | "24h" | "7d") => void;
  setAutoRotate: (v: boolean) => void;
  flyTo: (lat: number, lng: number) => void;
  setTimeScrub: (hoursAgo: number | null) => void;
  setViewMode: (m: ViewMode) => void;
  setSoundEnabled: (v: boolean) => void;
  setCameraDistance: (d: number) => void;
  pinnedClusterId: string | null;
  pinCluster: (id: string | null) => void;
  swapPinned: () => void;
  hudHidden: boolean;
  toggleHud: () => void;
}

const ALL_CATEGORIES: Category[] = [
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

export const useGlobeStore = create<GlobeState>((set) => ({
  clusters: [],
  selectedClusterId: null,
  selectedRegion: null,
  hoveredClusterId: null,
  hoveredCoords: null,
  hoveredCountry: null,
  activeCategories: new Set(ALL_CATEGORIES),
  timespan: "24h",
  autoRotate: true,
  flyToTarget: null,
  timeScrubHoursAgo: null,
  viewMode: "satellite",
  soundEnabled: false,
  cameraDistance: 3.6,
  pinnedClusterId: null,
  hudHidden: false,

  setClusters: (clusters) => set({ clusters }),
  selectCluster: (id) =>
    set(() =>
      id ? { selectedClusterId: id, selectedRegion: null } : { selectedClusterId: null },
    ),
  selectRegion: (region) =>
    set(() =>
      region
        ? { selectedRegion: region, selectedClusterId: null }
        : { selectedRegion: null },
    ),
  setHover: (id) => set({ hoveredClusterId: id }),
  setHoveredCoords: (coords) => set({ hoveredCoords: coords }),
  setHoveredCountry: (name) => set({ hoveredCountry: name }),
  setTimeScrub: (hoursAgo) => set({ timeScrubHoursAgo: hoursAgo }),
  setViewMode: (m) => set({ viewMode: m }),
  setSoundEnabled: (v) => set({ soundEnabled: v }),
  setCameraDistance: (d) => set({ cameraDistance: d }),
  pinCluster: (id) => set({ pinnedClusterId: id }),
  swapPinned: () =>
    set((s) => ({
      pinnedClusterId: s.selectedClusterId,
      selectedClusterId: s.pinnedClusterId,
    })),
  toggleHud: () => set((s) => ({ hudHidden: !s.hudHidden })),
  toggleCategory: (cat) =>
    set((state) => {
      const next = new Set(state.activeCategories);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { activeCategories: next };
    }),
  setTimespan: (t) => set({ timespan: t }),
  setAutoRotate: (v) => set({ autoRotate: v }),
  flyTo: (lat, lng) =>
    set({ flyToTarget: { lat, lng, key: Date.now() }, autoRotate: false }),
}));
