"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GLOBE_RADIUS, latLngToVector3 } from "@/lib/globe-utils";

interface Quake {
  id: string;
  lat: number;
  lng: number;
  magnitude: number;
  place: string;
  time: number;
}

interface Response {
  quakes: Quake[];
  fetchedAt: string;
}

const RING_DURATION = 3.0;
const MAX_RINGS_PER_QUAKE = 2;

export function Earthquakes() {
  const [quakes, setQuakes] = useState<Quake[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = () => {
      fetch("/api/data/earthquakes")
        .then((r) => r.json())
        .then((d: Response) => {
          if (!cancelled) setQuakes(d.quakes ?? []);
        })
        .catch(() => {});
    };
    fetchData();
    const id = setInterval(fetchData, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const items = useMemo(() => {
    return quakes.map((q, i) => ({
      ...q,
      position: latLngToVector3(q.lat, q.lng, GLOBE_RADIUS * 1.003),
      normal: latLngToVector3(q.lat, q.lng, 1).normalize(),
      phaseOffset: (i * 0.31) % RING_DURATION,
    }));
  }, [quakes]);

  if (items.length === 0) return null;

  return (
    <group>
      {items.map((q) => (
        <QuakeRings key={q.id} item={q} />
      ))}
    </group>
  );
}

function QuakeRings({
  item,
}: {
  item: {
    id: string;
    magnitude: number;
    position: THREE.Vector3;
    normal: THREE.Vector3;
    phaseOffset: number;
  };
}) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), item.normal);
    return q;
  }, [item.normal]);

  const baseScale = Math.max(0.012, item.magnitude * 0.005);

  useFrame((state) => {
    const t = state.clock.elapsedTime + item.phaseOffset;
    for (let i = 0; i < MAX_RINGS_PER_QUAKE; i++) {
      const cycle = (t / RING_DURATION + i / MAX_RINGS_PER_QUAKE) % 1;
      const mesh = refs.current[i];
      const mat = matRefs.current[i];
      if (!mesh || !mat) continue;
      const radius = baseScale + cycle * baseScale * 2.2;
      mesh.scale.setScalar(radius);
      mat.opacity = (1 - cycle) * 0.45;
    }
  });

  return (
    <group position={item.position} quaternion={quaternion}>
      {Array.from({ length: MAX_RINGS_PER_QUAKE }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <ringGeometry args={[0.92, 1, 32]} />
          <meshBasicMaterial
            ref={(el) => {
              matRefs.current[i] = el;
            }}
            color="#f87171"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
