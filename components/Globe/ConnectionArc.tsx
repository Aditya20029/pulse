"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Cluster } from "@/lib/types";
import { buildArcCurve, GLOBE_RADIUS } from "@/lib/globe-utils";

interface Props {
  from: Cluster;
  to: Cluster;
  color: string;
  delay?: number;
}

type LineHandle = {
  material: { dashOffset?: number } & Record<string, unknown>;
};

export function ConnectionArc({ from, to, color, delay = 0 }: Props) {
  const ref = useRef<LineHandle | null>(null);

  const points = useMemo(() => {
    const curve = buildArcCurve(
      from.lat,
      from.lng,
      to.lat,
      to.lng,
      GLOBE_RADIUS * 1.01,
    );
    return curve
      .getPoints(80)
      .map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [from.lat, from.lng, to.lat, to.lng]);

  useFrame((state) => {
    const obj = ref.current;
    if (!obj) return;
    const mat = obj.material;
    if (mat && typeof mat === "object") {
      mat.dashOffset = -(state.clock.elapsedTime + delay) * 0.4;
    }
  });

  return (
    <Line
      // @ts-expect-error drei Line ref accepts Line2/LineSegments2, our handle subset is enough
      ref={ref}
      points={points}
      color={color}
      lineWidth={1.4}
      transparent
      opacity={0.9}
      dashed
      dashSize={0.05}
      gapSize={0.03}
    />
  );
}
