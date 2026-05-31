"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { ScreenshotButton } from "./ScreenshotButton";
import { ViewModeToggle } from "./ViewModeToggle";
import { SoundToggle } from "./AudioEngine";
import { TweetButton } from "./TweetButton";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { HelpButton } from "./HelpButton";
import { DataSourceBadge } from "./DataSourceBadge";

function formatUtc(now: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
}

function formatDate(now: Date): string {
  return now
    .toUTCString()
    .split(" ")
    .slice(0, 4)
    .join(" ");
}

export function TopBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start gap-4 px-6 py-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-md border border-zinc-800/70 bg-[#0a0b0e] px-3 py-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-lime-400/15">
          <span className="block h-2 w-2 rounded-full bg-lime-400" />
        </div>
        <div className="leading-none">
          <div className="font-mono text-[14px] font-semibold tracking-[0.3em] text-zinc-100">
            PULSE
          </div>
          <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-500">
            Global News Intelligence
          </div>
        </div>
      </div>

      <div className="flex flex-1 justify-center">
        <SearchBar />
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        <DataSourceBadge />
        <ViewModeToggle />
        <ThemeSwitcher />
      </div>
      <div className="pointer-events-auto flex items-center gap-4 rounded-md border border-zinc-800/70 bg-[#0a0b0e] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-400" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-lime-300">
            Live
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm text-zinc-100 tabular-nums">
            {now ? formatUtc(now) : "--:--:-- UTC"}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
            {now ? formatDate(now) : ""}
          </div>
        </div>
        <SoundToggle />
        <TweetButton />
        <ScreenshotButton />
        <HelpButton />
      </div>
    </div>
  );
}
