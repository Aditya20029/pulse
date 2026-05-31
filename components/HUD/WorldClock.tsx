"use client";

import { useEffect, useState } from "react";

const CITIES = [
  { code: "NYC", tz: "America/New_York" },
  { code: "LDN", tz: "Europe/London" },
  { code: "DXB", tz: "Asia/Dubai" },
  { code: "HKG", tz: "Asia/Hong_Kong" },
  { code: "TYO", tz: "Asia/Tokyo" },
  { code: "SYD", tz: "Australia/Sydney" },
];

function fmt(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function isOpenMarket(date: Date, tz: string): boolean {
  const hour = parseInt(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false,
    }).format(date),
    10,
  );
  const dow = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
  }).format(date);
  if (dow === "Sat" || dow === "Sun") return false;
  return hour >= 9 && hour < 17;
}

export function WorldClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {CITIES.map((c) => {
        const open = now ? isOpenMarket(now, c.tz) : false;
        return (
          <div
            key={c.code}
            className="flex items-center justify-between rounded border border-cyan-400/10 bg-white/[0.02] px-2 py-1"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="block h-1 w-1 rounded-full"
                style={{
                  background: open ? "#22c55e" : "#475569",
                  boxShadow: open ? "0 0 4px #22c55e" : "none",
                }}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-200/65">
                {c.code}
              </span>
            </div>
            <div className="font-mono text-[11px] text-cyan-50 tabular-nums">
              {now ? fmt(now, c.tz) : "--:--"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
