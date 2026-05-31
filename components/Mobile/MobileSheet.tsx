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
        open ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      style={{ height: "72vh" }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col rounded-t-2xl border-t border-zinc-700/70 bg-[#0a0b0e] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3">
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
            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 font-mono text-sm text-zinc-300 active:bg-zinc-800"
          >
            ×
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}
