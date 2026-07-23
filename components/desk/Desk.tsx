"use client";

import { RoundedBox } from "@react-three/drei";

// The desk itself + a couple of ambient props. Top surface sits at y = 0,
// so every object placed on it starts at y = 0 and extends upward.
export function Desk() {
  return (
    <group>
      <RoundedBox
        args={[9, 0.3, 5]}
        radius={0.06}
        smoothness={4}
        position={[0, -0.15, 0]}
      >
        <meshStandardMaterial color="#c8a97e" roughness={0.75} metalness={0.05} />
      </RoundedBox>

      {/* desk mat */}
      <mesh position={[0, 0.001, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.6, 2.7]} />
        <meshStandardMaterial color="#a5794f" roughness={0.95} />
      </mesh>

      {/* coffee mug */}
      <mesh position={[-2.1, 0.16, 1.7]}>
        <cylinderGeometry args={[0.16, 0.14, 0.32, 24]} />
        <meshStandardMaterial color="#2f6f6a" roughness={0.5} />
      </mesh>
    </group>
  );
}
