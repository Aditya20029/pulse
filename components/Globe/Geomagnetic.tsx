"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertexShader = /* glsl */ `
  attribute float lineId;
  attribute float segmentT;
  varying float vT;
  varying float vLine;
  void main() {
    vT = segmentT;
    vLine = lineId;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying float vT;
  varying float vLine;
  void main() {
    float traveling = fract(vT - uTime * 0.15 + vLine * 0.07);
    float pulse = smoothstep(0.0, 0.18, traveling) * smoothstep(0.4, 0.22, traveling);
    float alpha = pulse * (0.4 + 0.6 * sin(vT * 3.14159));
    vec3 color = mix(vec3(0.45, 0.85, 1.0), vec3(0.6, 0.4, 1.0), vT);
    gl_FragColor = vec4(color, alpha * 0.75);
  }
`;

function buildFieldLines(): {
  positions: Float32Array;
  segmentT: Float32Array;
  lineIds: Float32Array;
  indices: Uint16Array;
} {
  const lines = 18;
  const segmentsPerLine = 60;
  const totalVerts = lines * segmentsPerLine;
  const positions = new Float32Array(totalVerts * 3);
  const segmentT = new Float32Array(totalVerts);
  const lineIds = new Float32Array(totalVerts);
  const indices: number[] = [];

  for (let l = 0; l < lines; l++) {
    const angle = (l / lines) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const tilt = ((l * 13) % 5) * 0.08 - 0.16;

    for (let s = 0; s < segmentsPerLine; s++) {
      const t = s / (segmentsPerLine - 1);
      const u = (t - 0.5) * 2;
      const r = 1.0 + 0.45 * (1 - u * u);
      const lat = u * Math.PI * 0.85;
      const y = Math.sin(lat) * r;
      const horiz = Math.cos(lat) * r;
      const x = horiz * cosA - tilt * sinA;
      const z = horiz * sinA + tilt * cosA;
      const idx = l * segmentsPerLine + s;
      positions[idx * 3 + 0] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;
      segmentT[idx] = t;
      lineIds[idx] = l;
      if (s < segmentsPerLine - 1) {
        indices.push(idx, idx + 1);
      }
    }
  }
  return {
    positions,
    segmentT,
    lineIds,
    indices: new Uint16Array(indices),
  };
}

export function Geomagnetic() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, segmentT, lineIds, indices } = useMemo(buildFieldLines, []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-segmentT" args={[segmentT, 1]} />
        <bufferAttribute attach="attributes-lineId" args={[lineIds, 1]} />
        <bufferAttribute attach="index" args={[indices, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
