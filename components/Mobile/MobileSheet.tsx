"use client";

import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileSheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out ${
        open
          ? "pointer-events-auto translate-y-0"
          : "pointer-events-none translate-y-full"
      }`}
      style={{ height: "78dvh" }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-t-2xl border-t border-zinc-700/70 bg-[#0a0b0e] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-zinc-700" />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-200">
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 font-mono text-base text-zinc-300 active:bg-zinc-800"
          >
            ×
          </button>
        </div>
        <div
          className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            // clear the bottom tab bar (~56px) + the phone home-indicator
            paddingBottom: "calc(72px + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
