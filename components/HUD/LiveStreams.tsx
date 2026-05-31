"use client";

interface Channel {
  name: string;
  region: string;
  handle: string;
  color: string;
}

const CHANNELS: Channel[] = [
  { name: "Fox News", region: "United States", handle: "@FoxNews", color: "#fb923c" },
  { name: "LiveNOW Fox", region: "US Breaking", handle: "@LiveNOWFOX", color: "#f87171" },
  { name: "Sky News", region: "United Kingdom", handle: "@SkyNews", color: "#22d3ee" },
  { name: "BBC News", region: "United Kingdom", handle: "@BBCNews", color: "#f43f5e" },
  { name: "Al Jazeera", region: "Middle East", handle: "@aljazeeraenglish", color: "#e879f9" },
  { name: "France 24", region: "Europe", handle: "@FRANCE24English", color: "#a3e635" },
  { name: "DW News", region: "Germany", handle: "@dwnews", color: "#fb923c" },
  { name: "Bloomberg TV", region: "Markets / US", handle: "@business", color: "#fbbf24" },
  { name: "CNBC", region: "Markets / US", handle: "@CNBC", color: "#34d399" },
  { name: "ABC News", region: "United States", handle: "@ABCNews", color: "#60a5fa" },
  { name: "TRT World", region: "Turkey", handle: "@trtworld", color: "#22d3ee" },
  { name: "NHK World", region: "Japan", handle: "@NHKWORLDJAPAN", color: "#f472b6" },
  { name: "WION", region: "India", handle: "@WION", color: "#a78bfa" },
  { name: "Channels NewsAsia", region: "Singapore", handle: "@channelnewsasia", color: "#06b6d4" },
  { name: "Africa News", region: "Africa", handle: "@africanews", color: "#f59e0b" },
  { name: "Globo News", region: "Brazil", handle: "@GloboNews", color: "#84cc16" },
];

export function LiveStreams() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5">
        {CHANNELS.map((c) => (
          <a
            key={c.handle + c.name}
            href={`https://www.youtube.com/${c.handle}/live`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded border border-zinc-800/70 bg-[#0a0b0e] px-2.5 py-2 transition hover:border-zinc-700 hover:bg-zinc-900/40"
            title={`Watch ${c.name} live on YouTube`}
          >
            <span
              className="absolute inset-y-0 left-0 w-0.5"
              style={{
                background: c.color,
                boxShadow: `0 0 6px ${c.color}`,
              }}
            />
            <div className="ml-1.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="line-clamp-1 font-mono text-[11px] uppercase tracking-wider text-zinc-100">
                  {c.name}
                </div>
                <div className="mt-0.5 font-mono text-[8px] uppercase tracking-widest text-zinc-500">
                  {c.region}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="flex items-center gap-1">
                  <span className="relative flex h-1 w-1">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                    <span className="relative inline-flex h-1 w-1 rounded-full bg-red-500" />
                  </span>
                  <span className="font-mono text-[7px] uppercase tracking-widest text-red-300">
                    Live
                  </span>
                </span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-500 transition group-hover:text-cyan-200">
                  Watch ↗
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[8px] uppercase tracking-widest text-zinc-500">
        Click any channel to open its live stream on YouTube
      </p>
    </div>
  );
}
