"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  /** Approximate height of the placeholder before content mounts. */
  minHeight?: number;
  rootMargin?: string;
}

/**
 * Renders children only once scrolled near the viewport. Used to defer the
 * auto-firing Claude panels (anomaly / narratives / forecast) so they don't
 * all hit the API on initial page load, cutting cost and first-paint work.
 */
export function LazySection({
  children,
  minHeight = 60,
  rootMargin = "120px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? (
        children
      ) : (
        <div
          className="animate-pulse rounded border border-zinc-800/50 bg-zinc-900/20"
          style={{ height: minHeight }}
        />
      )}
    </div>
  );
}
