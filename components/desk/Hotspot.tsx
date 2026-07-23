"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { pokeShadows } from "./shadowBus";

// Wraps a desk object: hover lifts + scales it, fades in an accent ring and a
// floating label, and prefetches the route; click navigates. `focused` marks
// the object the camera is currently parked on (subtle permanent ring).
export function Hotspot({
  position,
  href,
  label,
  accent,
  ringRadius = 1,
  focused = false,
  children,
}: {
  position: [number, number, number];
  href: string;
  label: string;
  accent: string;
  ringRadius?: number;
  focused?: boolean;
  children: (hovered: boolean) => ReactNode;
}) {
  const router = useRouter();
  const inner = useRef<THREE.Group>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((_, dt) => {
    const g = inner.current;
    if (!g) return;
    const alpha = 1 - Math.exp(-10 * dt);
    const s = THREE.MathUtils.lerp(g.scale.x, hovered ? 1.06 : 1, alpha);
    g.scale.setScalar(s);
    const lift = hovered ? 0.16 : focused ? 0.04 : 0;
    g.position.y = THREE.MathUtils.lerp(g.position.y, lift, alpha);

    if (ringMat.current) {
      const want = hovered ? 0.85 : focused ? 0.3 : 0;
      ringMat.current.opacity = THREE.MathUtils.lerp(
        ringMat.current.opacity,
        want,
        alpha
      );
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        pokeShadows(); // the lift moves geometry — un-freeze the shadow map
        router.prefetch(href);
      }}
      onPointerOut={() => {
        setHovered(false);
        pokeShadows();
      }}
      onClick={(e) => {
        e.stopPropagation();
        router.push(href);
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[ringRadius, ringRadius + 0.045, 64, 1]} />
        <meshBasicMaterial
          ref={ringMat}
          color={accent}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {hovered && (
        <Html center position={[0, 1.45, 0]} zIndexRange={[40, 0]}>
          <div className="desk-label pointer-events-none whitespace-nowrap rounded-full bg-[#141824]/95 px-4 py-1.5 text-xs font-semibold tracking-wide text-neutral-100 shadow-lg ring-1 ring-white/10">
            <span style={{ color: accent }}>●</span>
            <span className="ml-2">{label} ↗</span>
          </div>
        </Html>
      )}

      <group ref={inner}>{children(hovered)}</group>
    </group>
  );
}
