"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "cyan" | "amber" | "magenta" | "crt";

interface SettingsState {
  theme: Theme;
  defaultViewMode: "satellite" | "political" | "heatmap";
  defaultSoundEnabled: boolean;
  defaultAutoRotate: boolean;
  setTheme: (t: Theme) => void;
  setDefaultViewMode: (m: "satellite" | "political" | "heatmap") => void;
  setDefaultSoundEnabled: (v: boolean) => void;
  setDefaultAutoRotate: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "cyan",
      defaultViewMode: "satellite",
      defaultSoundEnabled: false,
      defaultAutoRotate: true,
      setTheme: (t) => set({ theme: t }),
      setDefaultViewMode: (m) => set({ defaultViewMode: m }),
      setDefaultSoundEnabled: (v) => set({ defaultSoundEnabled: v }),
      setDefaultAutoRotate: (v) => set({ defaultAutoRotate: v }),
    }),
    { name: "pulse-settings" },
  ),
);
