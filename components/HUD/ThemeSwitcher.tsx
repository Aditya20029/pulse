"use client";

import { useEffect } from "react";
import { Theme, useSettingsStore } from "@/stores/useSettingsStore";

const THEMES: { value: Theme; label: string; swatch: string }[] = [
  { value: "cyan", label: "Cyan", swatch: "#22d3ee" },
  { value: "amber", label: "Amber", swatch: "#fbbf24" },
  { value: "magenta", label: "Magenta", swatch: "#e879f9" },
  { value: "crt", label: "CRT", swatch: "#86efac" },
];

export function ThemeSwitcher() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <div className="flex items-center gap-1 rounded-md border border-cyan-400/15 bg-[rgba(4,6,12,0.7)] p-0.5 backdrop-blur-md">
      {THEMES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => setTheme(t.value)}
          title={`${t.label} theme`}
          aria-label={`${t.label} theme`}
          className={`flex h-6 w-6 items-center justify-center rounded ${
            theme === t.value ? "ring-1 ring-cyan-300/70" : "opacity-65 hover:opacity-100"
          }`}
        >
          <span
            className="block h-3 w-3 rounded-full"
            style={{
              background: t.swatch,
              boxShadow: theme === t.value ? `0 0 8px ${t.swatch}` : "none",
            }}
          />
        </button>
      ))}
    </div>
  );
}
