"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";

// Wraps a desk object: hover raises + scales it and swaps the cursor,
// click routes to the section page. Children receive `hovered` to tint materials.
export function Hotspot({
  position,
  href,
  children,
}: {
  position: [number, number, number];
  href: string;
  children: (hovered: boolean) => ReactNode;
}) {
  const router = useRouter();
  const inner = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((_, dt) => {
    const g = inner.current;
    if (!g) return;
    const alpha = 1 - Math.exp(-10 * dt);
    const s = THREE.MathUtils.lerp(g.scale.x, hovered ? 1.08 : 1, alpha);
    g.scale.setScalar(s);
    g.position.y = THREE.MathUtils.lerp(g.position.y, hovered ? 0.18 : 0, alpha);
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        router.push(href);
      }}
    >
      <group ref={inner}>{children(hovered)}</group>
    </group>
  );
}
