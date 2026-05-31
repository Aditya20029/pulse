"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GLOBE_RADIUS } from "@/lib/globe-utils";
import { useGlobeStore } from "@/stores/useGlobeStore";

const vertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1, 0));
    float c = hash(i + vec2(0, 1));
    float d = hash(i + vec2(1, 1));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    float lat = vWorldNormal.y;
    // bands at high latitudes
    float polarMask = smoothstep(0.62, 0.82, abs(lat));
    polarMask *= 1.0 - smoothstep(0.92, 0.99, abs(lat));

    if (polarMask < 0.01) discard;

    float lng = atan(vWorldNormal.z, vWorldNormal.x);
    vec2 uv = vec2(lng * 2.5 + uTime * 0.18, abs(lat) * 8.0 - uTime * 0.05);
    float n = fbm(uv);
    float curtains = pow(n, 2.0);

    float band = smoothstep(0.4, 0.95, curtains);
    vec3 color = mix(uColorA, uColorB, smoothstep(0.55, 0.95, curtains));
    float alpha = polarMask * band * 0.45;

    gl_FragColor = vec4(color, alpha);
  }
`;

export function Auroras() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const clusters = useGlobeStore((s) => s.clusters);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color("#22c55e") },
          uColorB: { value: new THREE.Color("#a855f7") },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const baseA = useMemo(() => new THREE.Color("#22c55e"), []);
  const baseB = useMemo(() => new THREE.Color("#a855f7"), []);
  const sadA = useMemo(() => new THREE.Color("#ef4444"), []);
  const sadB = useMemo(() => new THREE.Color("#fb923c"), []);
  const colorARef = useRef(new THREE.Color("#22c55e"));
  const colorBRef = useRef(new THREE.Color("#a855f7"));

  useFrame((state, delta) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    let toneSum = 0;
    let count = 0;
    for (const c of clusters) {
      for (const e of c.events) {
        toneSum += e.tone;
        count += 1;
      }
    }
    const avgTone = count ? toneSum / count : 0;
    const sadness = Math.max(0, Math.min(1, -avgTone / 6));
    const targetA = new THREE.Color().lerpColors(baseA, sadA, sadness);
    const targetB = new THREE.Color().lerpColors(baseB, sadB, sadness);
    colorARef.current.lerp(targetA, Math.min(1, delta * 0.6));
    colorBRef.current.lerp(targetB, Math.min(1, delta * 0.6));
    matRef.current.uniforms.uColorA.value.copy(colorARef.current);
    matRef.current.uniforms.uColorB.value.copy(colorBRef.current);
  });

  return (
    <mesh scale={1.018}>
      <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
      <primitive attach="material" object={material} ref={matRef} />
    </mesh>
  );
}
