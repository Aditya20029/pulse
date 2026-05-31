"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { latLngToVector3, GLOBE_RADIUS } from "@/lib/globe-utils";

interface Strike {
  id: string;
  position: THREE.Vector3;
  start: number;
  duration: number;
}

const STRIKE_DURATION = 0.35;

export function Lightning() {
  const clusters = useGlobeStore((s) => s.clusters);
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const lastSpawnRef = useRef(0);

  const candidates = useMemo(() => {
    return clusters
      .filter(
        (c) => c.category === "environment" || c.category === "conflict",
      )
      .map((c) => ({
        id: c.id,
        position: latLngToVector3(c.lat, c.lng, GLOBE_RADIUS * 1.012),
      }));
  }, [clusters]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (
      candidates.length > 0 &&
      t - lastSpawnRef.current > 0.8 + Math.random() * 2
    ) {
      lastSpawnRef.current = t;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setStrikes((prev) => [
        ...prev.filter((s) => t - s.start < s.duration + 0.1).slice(-15),
        {
          id: `${pick.id}-${t.toFixed(3)}`,
          position: pick.position.clone(),
          start: t,
          duration: STRIKE_DURATION,
        },
      ]);
    }
  });

  const positions = useMemo(() => {
    const arr = new Float32Array(strikes.length * 3);
    strikes.forEach((s, i) => {
      arr[i * 3 + 0] = s.position.x;
      arr[i * 3 + 1] = s.position.y;
      arr[i * 3 + 2] = s.position.z;
    });
    return arr;
  }, [strikes]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!matRef.current) return;
    if (strikes.length === 0) {
      matRef.current.opacity = 0;
      return;
    }
    // average opacity from active strikes
    let maxOpacity = 0;
    for (const s of strikes) {
      const age = t - s.start;
      if (age < 0 || age > s.duration) continue;
      const phase = age / s.duration;
      const flash = Math.exp(-phase * 4) * (0.7 + Math.random() * 0.3);
      maxOpacity = Math.max(maxOpacity, flash);
    }
    matRef.current.opacity = Math.min(1, maxOpacity);
  });

  if (strikes.length === 0) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
