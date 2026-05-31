"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function Moon() {
  const ref = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(96, 80, 4, 128, 128, 140);
      grad.addColorStop(0, "#f8f5ee");
      grad.addColorStop(0.5, "#cfc8b8");
      grad.addColorStop(1, "#6e6657");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const r = 2 + Math.random() * 8;
        const dim = 0.4 + Math.random() * 0.3;
        ctx.fillStyle = `rgba(80, 70, 60, ${dim})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 250, 240, ${dim * 0.4})`;
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1,
      metalness: 0,
      emissive: new THREE.Color("#1a1815"),
      emissiveIntensity: 0.05,
    });
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.04;
    const r = 4.5;
    ref.current.position.set(Math.cos(t) * r, Math.sin(t * 0.3) * 0.8, Math.sin(t) * r);
    ref.current.rotation.y += 0.002;
  });

  return (
    <group>
      <directionalLight intensity={0.6} position={[1, 0.5, 1]} />
      <mesh ref={ref} material={material}>
        <sphereGeometry args={[0.18, 48, 48]} />
      </mesh>
    </group>
  );
}
