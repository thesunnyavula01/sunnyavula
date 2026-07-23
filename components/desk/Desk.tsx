"use client";

import { RoundedBox } from "@react-three/drei";
import { PALETTE as P } from "./palette";

// The desk slab + ambient props. The slab "floats" over the void like the
// sarastotey island — the shadow-catcher plane below it lives in DeskCanvas.
// Top surface of the slab sits at y = 0; props start at y = 0 and grow up.

function Mug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 0.03, 32]} />
        <meshStandardMaterial color={P.paper} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.155, 0.135, 0.34, 32]} />
        <meshStandardMaterial color={P.berry} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.015, 32]} />
        <meshStandardMaterial color="#3d2a1e" roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.19, 0.21, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.085, 0.026, 14, 28]} />
        <meshStandardMaterial color={P.berry} roughness={0.55} />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  const leaves: { p: [number, number, number]; r: number }[] = [
    { p: [0, 0.52, 0], r: 0.2 },
    { p: [0.16, 0.44, 0.06], r: 0.15 },
    { p: [-0.15, 0.46, -0.04], r: 0.16 },
    { p: [0.04, 0.42, 0.16], r: 0.13 },
    { p: [-0.05, 0.4, -0.17], r: 0.14 },
  ];
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.32, 32]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.215, 0.03, 12, 32]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} castShadow position={l.p}>
          <sphereGeometry args={[l.r, 20, 20]} />
          <meshStandardMaterial
            color={i % 2 ? P.sageDark : P.sage}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function Books({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.25, 0]}>
      <RoundedBox castShadow args={[0.88, 0.13, 0.62]} radius={0.03} position={[0, 0.065, 0]}>
        <meshStandardMaterial color={P.indigo} roughness={0.8} />
      </RoundedBox>
      <RoundedBox
        castShadow
        args={[0.78, 0.11, 0.54]}
        radius={0.03}
        position={[0.03, 0.185, -0.02]}
        rotation={[0, 0.22, 0]}
      >
        <meshStandardMaterial color={P.marigold} roughness={0.8} />
      </RoundedBox>
    </group>
  );
}

function PencilCup({ position }: { position: [number, number, number] }) {
  const pens: { color: string; rot: [number, number, number]; x: number }[] = [
    { color: P.charcoal, rot: [0.1, 0, 0.12], x: -0.03 },
    { color: P.berry, rot: [-0.08, 0, -0.14], x: 0.04 },
    { color: P.sageDark, rot: [0.04, 0, 0.02], x: 0 },
  ];
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.32, 28]} />
        <meshStandardMaterial color={P.marigold} roughness={0.7} />
      </mesh>
      {pens.map((pen, i) => (
        <mesh key={i} castShadow position={[pen.x, 0.38, 0]} rotation={pen.rot}>
          <cylinderGeometry args={[0.018, 0.018, 0.44, 10]} />
          <meshStandardMaterial color={pen.color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Phone({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.35, 0]}>
      <RoundedBox castShadow args={[0.32, 0.035, 0.64]} radius={0.016} position={[0, 0.018, 0]}>
        <meshStandardMaterial color={P.charcoal} roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.037, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.27, 0.58]} />
        <meshStandardMaterial color="#1a1d26" roughness={0.2} metalness={0.4} />
      </mesh>
    </group>
  );
}

export function Desk() {
  return (
    <group>
      {/* slab */}
      <RoundedBox
        castShadow
        receiveShadow
        args={[9.4, 0.42, 5.2]}
        radius={0.1}
        smoothness={6}
        position={[0, -0.21, 0]}
      >
        <meshStandardMaterial color={P.wood} roughness={0.65} metalness={0.02} />
      </RoundedBox>

      {/* indigo blotter under the laptop area */}
      <RoundedBox
        receiveShadow
        args={[4.4, 0.05, 2.85]}
        radius={0.025}
        position={[-0.2, 0.025, 0.3]}
      >
        <meshStandardMaterial color={P.blotter} roughness={0.9} />
      </RoundedBox>

      <Mug position={[-2.05, 0, 1.6]} />
      <Plant position={[3.95, 0, -1.55]} />
      <Books position={[-4.0, 0, 1.3]} />
      <PencilCup position={[0.65, 0, 1.55]} />
      <Phone position={[2.35, 0, 1.35]} />
    </group>
  );
}
