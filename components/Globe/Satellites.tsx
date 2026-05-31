"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface Orbit {
  radius: number;
  inclination: number;
  ascendingNode: number;
  phase: number;
  speed: number;
  color: THREE.Color;
  trailLength: number;
}

const ORBITS: Orbit[] = [
  { radius: 1.22, inclination: 0.9, ascendingNode: 0.4, phase: 0, speed: 0.14, color: new THREE.Color("#7dd3fc"), trailLength: 0.35 },
  { radius: 1.32, inclination: -0.55, ascendingNode: 3.4, phase: 2.6, speed: 0.09, color: new THREE.Color("#a855f7"), trailLength: 0.42 },
];

const SEGMENTS = 64;

function buildOrbitGeometry(orbit: Orbit): {
  positions: Float32Array;
  alphas: Float32Array;
} {
  const positions = new Float32Array((SEGMENTS + 1) * 3);
  const alphas = new Float32Array(SEGMENTS + 1);

  return { positions, alphas };
}

export function Satellites() {
  const groupRef = useRef<THREE.Group>(null);

  const orbits = useMemo(() => {
    return ORBITS.map((o) => buildOrbitGeometry(o));
  }, []);

  const lineRefs = useRef<(THREE.Line | null)[]>([]);
  const dotRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    ORBITS.forEach((orbit, idx) => {
      const positions = orbits[idx].positions;
      const alphas = orbits[idx].alphas;
      const head = (time * orbit.speed + orbit.phase) % (Math.PI * 2);

      const cosNode = Math.cos(orbit.ascendingNode);
      const sinNode = Math.sin(orbit.ascendingNode);
      const cosInc = Math.cos(orbit.inclination);
      const sinInc = Math.sin(orbit.inclination);

      for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS;
        const angle = head - t * orbit.trailLength * Math.PI * 2;

        const x0 = orbit.radius * Math.cos(angle);
        const z0 = orbit.radius * Math.sin(angle);

        const x1 = x0;
        const y1 = z0 * sinInc;
        const z1 = z0 * cosInc;

        const x2 = x1 * cosNode - z1 * sinNode;
        const y2 = y1;
        const z2 = x1 * sinNode + z1 * cosNode;

        positions[i * 3 + 0] = x2;
        positions[i * 3 + 1] = y2;
        positions[i * 3 + 2] = z2;

        alphas[i] = 1 - t;
      }

      const line = lineRefs.current[idx];
      if (line) {
        const geom = line.geometry as THREE.BufferGeometry;
        const posAttr = geom.attributes.position as THREE.BufferAttribute;
        posAttr.array = positions;
        posAttr.needsUpdate = true;
      }
      const dot = dotRefs.current[idx];
      if (dot) {
        dot.position.set(positions[0], positions[1], positions[2]);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {ORBITS.map((orbit, idx) => (
        <group key={idx}>
          <line ref={(el) => { lineRefs.current[idx] = el as THREE.Line | null; }}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[orbits[idx].positions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={orbit.color}
              transparent
              opacity={0.18}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </line>
          <mesh ref={(el) => { dotRefs.current[idx] = el; }}>
            <sphereGeometry args={[0.009, 12, 12]} />
            <meshBasicMaterial
              color={orbit.color}
              toneMapped={false}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
