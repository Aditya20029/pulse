"use client";

import { useEffect, useState } from "react";

/**
 * Returns true on phones/tablets (viewport <= breakpoint), false on desktop,
 * and `null` before mount so server + first client render match (no hydration
 * mismatch). Callers render the desktop tree only when `=== false` and the
 * mobile tree only when `=== true`.
 */
export function useIsMobile(breakpoint = 1024): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
