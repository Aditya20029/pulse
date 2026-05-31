"use client";

import { HTMLAttributes, forwardRef } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { className = "", glow = false, children, ...rest },
  ref,
) {
  const glowClass = glow
    ? "shadow-[0_0_30px_-12px_rgba(0,240,255,0.45)]"
    : "";
  return (
    <div
      ref={ref}
      className={`relative rounded-lg border border-cyan-400/15 bg-[rgba(18,18,26,0.78)] backdrop-blur-xl ${glowClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
