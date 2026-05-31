"use client";

import dynamic from "next/dynamic";

const Globe = dynamic(
  () => import("@/components/Globe/Globe").then((m) => m.Globe),
  { ssr: false },
);

export default function EmbedPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Globe />
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-20 rounded border border-cyan-400/20 bg-[rgba(4,6,12,0.75)] px-2.5 py-1 backdrop-blur-md">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-200 hover:text-cyan-100"
        >
          PULSE
        </a>
      </div>
    </main>
  );
}
