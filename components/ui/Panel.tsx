"use client";

import { HTMLAttributes, forwardRef } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "accent";
}

export const Panel = forwardRef<HTMLDivElement, Props>(function Panel(
  { className = "", tone = "default", children, ...rest },
  ref,
) {
  const toneClass =
    tone === "accent"
      ? "border-lime-400/25 bg-[#0d100a]"
      : "border-zinc-800/70 bg-[#0a0b0e]";
  return (
    <div
      ref={ref}
      className={`rounded-md border ${toneClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});

export function PanelHeader({
  label,
  right,
  hint,
}: {
  label: string;
  right?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 pt-2.5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
            {hint}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}
