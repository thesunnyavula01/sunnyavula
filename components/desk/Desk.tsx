"use client";

import { useMemo } from "react";
import { Instance, Instances, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE as P } from "./palette";

// The desk ISLAND — a floating chunk of study, sarastotey-style: a rounded
// floor slab carrying a legged desk, a chair, a rug, a floor plant, a lamp and
// small clutter. Desk TOP surface sits at y = 0 (hotspot objects stand on it);
// the floor top sits at FLOOR_TOP. Everything uses core-three materials only —
// no shader-chunk patching (see CLAUDE.md: PCSS broke every lit material).

export const FLOOR_TOP = -1.42;

/* --------------------------- procedural wood map --------------------------- */

function useWoodTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d")!;

    // deep walnut base — reads rich under the warm lamp key light
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, "#8a5a34");
    grad.addColorStop(0.5, "#9a683c");
    grad.addColorStop(1, "#855430");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // plank seams (four boards across the depth)
    for (let i = 1; i < 4; i++) {
      const y = i * 128 + (Math.random() * 8 - 4);
      ctx.strokeStyle = "rgba(38,22,10,0.55)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(214,164,110,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + 2);
      ctx.lineTo(1024, y + 2);
      ctx.stroke();
    }

    // long grain streaks — denser and higher-contrast than the old pass
    for (let i = 0; i < 260; i++) {
      const y = Math.random() * 512;
      const x = Math.random() * 1024 - 200;
      const len = 160 + Math.random() * 600;
      const dark = Math.random() > 0.35;
      const r = dark ? 55 + Math.random() * 35 : 175 + Math.random() * 40;
      const g = dark ? 32 + Math.random() * 22 : 125 + Math.random() * 30;
      const b = dark ? 14 + Math.random() * 12 : 80 + Math.random() * 22;
      ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${
        0.06 + Math.random() * 0.12
      })`;
      ctx.lineWidth = 0.6 + Math.random() * 2.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + len * 0.35,
        y + (Math.random() * 10 - 5),
        x + len * 0.7,
        y + (Math.random() * 10 - 5),
        x + len,
        y + (Math.random() * 14 - 7)
      );
      ctx.stroke();
    }

    // knots with grain flowing around them
    for (let i = 0; i < 6; i++) {
      const kx = 100 + Math.random() * 824;
      const ky = 60 + Math.random() * 392;
      for (let ring = 6; ring > 0; ring--) {
        ctx.strokeStyle = `rgba(52,30,14,${0.06 + ring * 0.03})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(kx, ky, ring * 7, ring * 3.4, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(40,22,10,0.5)";
      ctx.beginPath();
      ctx.ellipse(kx, ky, 4.5, 2.6, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

/* -------------------------------- furniture -------------------------------- */

function DeskTable() {
  const wood = useWoodTexture();
  return (
    <group>
      <RoundedBox
        castShadow
        receiveShadow
        args={[9.4, 0.42, 5.2]}
        radius={0.1}
        smoothness={6}
        position={[0, -0.21, 0]}
      >
        <meshStandardMaterial map={wood} roughness={0.62} metalness={0.02} />
      </RoundedBox>

      {/* legs down to the floor slab */}
      {(
        [
          [-4.35, -2.25],
          [4.35, -2.25],
          [-4.35, 2.25],
          [4.35, 2.25],
        ] as const
      ).map(([x, z]) => (
        <RoundedBox
          key={`${x}${z}`}
          castShadow
          args={[0.26, 1.04, 0.26]}
          radius={0.04}
          position={[x, -0.92, z]}
        >
          <meshStandardMaterial color={P.woodEdge} roughness={0.7} />
        </RoundedBox>
      ))}

      {/* indigo blotter under the laptop area */}
      <RoundedBox
        receiveShadow
        args={[4.4, 0.05, 2.85]}
        radius={0.025}
        position={[-0.2, 0.025, 0.3]}
      >
        <meshStandardMaterial color={P.blotter} roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

function Chair() {
  const armAngles = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2);
  return (
    <group position={[0.9, FLOOR_TOP, 3.0]} rotation={[0, -0.35, 0]}>
      {/* star base + casters */}
      {armAngles.map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <RoundedBox castShadow args={[0.1, 0.07, 0.6]} radius={0.03} position={[0, 0.08, 0.28]}>
            <meshStandardMaterial color={P.charcoal} roughness={0.5} />
          </RoundedBox>
          <mesh castShadow position={[0, 0.06, 0.54]}>
            <sphereGeometry args={[0.06, 14, 14]} />
            <meshStandardMaterial color={P.slate} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.55, 16]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.45} metalness={0.4} />
      </mesh>
      {/* seat + backrest */}
      <RoundedBox castShadow args={[0.88, 0.14, 0.82]} radius={0.06} position={[0, 0.68, 0.02]}>
        <meshStandardMaterial color={P.berry} roughness={0.75} />
      </RoundedBox>
      <RoundedBox
        castShadow
        args={[0.82, 1.0, 0.13]}
        radius={0.06}
        position={[0, 1.28, 0.42]}
        rotation={[0.1, 0, 0]}
      >
        <meshStandardMaterial color={P.berry} roughness={0.75} />
      </RoundedBox>
    </group>
  );
}

function Rug() {
  return (
    <group position={[0.7, FLOOR_TOP, 1.7]}>
      <mesh receiveShadow position={[0, 0.018, 0]}>
        <cylinderGeometry args={[2.35, 2.35, 0.036, 56]} />
        <meshStandardMaterial color={P.moss} roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.02, 0]} scale={[1, 0.5, 1]}>
        <torusGeometry args={[2.32, 0.05, 8, 64]} />
        <meshStandardMaterial color={P.berry} roughness={0.9} />
      </mesh>
    </group>
  );
}

function FloorPlant() {
  const leaves: { p: [number, number, number]; r: number }[] = [
    { p: [0, 1.55, 0], r: 0.46 },
    { p: [0.36, 1.3, 0.12], r: 0.32 },
    { p: [-0.34, 1.35, -0.1], r: 0.35 },
    { p: [0.1, 1.25, 0.36], r: 0.3 },
    { p: [-0.12, 1.2, -0.38], r: 0.31 },
    { p: [0.05, 1.85, -0.05], r: 0.28 },
  ];
  return (
    <group position={[-5.0, FLOOR_TOP, 0.9]}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.5, 0.38, 0.84, 32]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.84, 0]}>
        <torusGeometry args={[0.49, 0.05, 12, 32]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 10]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.8} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} castShadow position={l.p}>
          <sphereGeometry args={[l.r, 20, 20]} />
          <meshStandardMaterial color={i % 2 ? P.sageDark : P.sage} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Lamp() {
  return (
    <group position={[-4.0, 0, -1.75]}>
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.08, 28]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.18, 0.5, 0.1]} rotation={[0.06, 0, -0.42]}>
        <cylinderGeometry args={[0.035, 0.035, 0.95, 12]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} />
      </mesh>
      <mesh position={[0.38, 0.93, 0.14]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color={P.slate} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.68, 0.86, 0.26]} rotation={[0.15, 0, 1.05]}>
        <cylinderGeometry args={[0.035, 0.035, 0.72, 12]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} />
      </mesh>
      {/* shade, pointing down over the desk */}
      <group position={[1.02, 0.72, 0.34]} rotation={[0.2, 0, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.32, 0.38, 24, 1, true]} />
          <meshStandardMaterial color={P.marigold} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshStandardMaterial
            color="#ffe9b8"
            emissive="#ffc46b"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight
        position={[1.1, 0.55, 0.4]}
        intensity={2.2}
        distance={4.5}
        decay={2}
        color="#ffd9a0"
      />
    </group>
  );
}

function MiniKeyboard({ position }: { position: [number, number, number] }) {
  const keys: [number, number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      keys.push([-0.48 + c * 0.08, 0.045, -0.115 + r * 0.08]);
    }
  }
  return (
    <group position={position} rotation={[0, 0.07, 0]}>
      <RoundedBox castShadow args={[1.12, 0.05, 0.44]} radius={0.02} position={[0, 0.025, 0.02]}>
        <meshStandardMaterial color={P.silver} roughness={0.55} metalness={0.25} />
      </RoundedBox>
      <Instances limit={52} castShadow frustumCulled={false}>
        <boxGeometry args={[0.064, 0.018, 0.064]} />
        <meshStandardMaterial color={P.slate} roughness={0.85} />
        {keys.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>
      <mesh castShadow position={[0, 0.045, 0.155]}>
        <boxGeometry args={[0.38, 0.018, 0.064]} />
        <meshStandardMaterial color={P.slate} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Mouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.25, 0]}>
      <mesh castShadow position={[0, 0.055, 0]} scale={[1, 0.62, 1.45]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ------------------------------- small clutter ------------------------------ */

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
      <mesh castShadow position={[0.19, 0.21, 0]}>
        <torusGeometry args={[0.085, 0.026, 14, 28]} />
        <meshStandardMaterial color={P.berry} roughness={0.55} />
      </mesh>
    </group>
  );
}

function Succulent({ position }: { position: [number, number, number] }) {
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
          <meshStandardMaterial color={i % 2 ? P.sageDark : P.sage} roughness={0.9} />
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
        <meshStandardMaterial
          color="#1a1d26"
          emissive="#2a3350"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}

function Bin() {
  return (
    <group position={[4.9, FLOOR_TOP, 1.9]}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.32, 0.25, 0.6, 28, 1, true]} />
        <meshStandardMaterial color={P.slate} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh castShadow position={[0.55, 0.09, 0.25]}>
        <icosahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={P.paper} roughness={0.95} />
      </mesh>
    </group>
  );
}

function LooseSheets() {
  return (
    <>
      <mesh receiveShadow position={[-2.15, 0.002, -1.35]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <planeGeometry args={[0.72, 0.95]} />
        <meshStandardMaterial color={P.paper} roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[-2.45, 0.003, 0.75]} rotation={[-Math.PI / 2, 0, -0.25]}>
        <planeGeometry args={[0.68, 0.9]} />
        <meshStandardMaterial color="#f3efe4" roughness={0.95} />
      </mesh>
    </>
  );
}

/* --------------------------------- island ---------------------------------- */

export function Desk() {
  return (
    <group>
      {/* floor slab the whole study stands on */}
      <RoundedBox
        castShadow
        receiveShadow
        args={[12.2, 0.55, 8.2]}
        radius={0.26}
        smoothness={6}
        position={[0, FLOOR_TOP - 0.275, 0]}
      >
        <meshStandardMaterial color={P.floor} roughness={0.85} />
      </RoundedBox>

      <Rug />
      <DeskTable />
      <Chair />
      <FloorPlant />
      <Bin />

      {/* on the desk */}
      <Lamp />
      {/* y-lift clears the blotter slab (top ~0.007); at y=0 the base plate
          sank into the mat and z-fought it. x pulled in so it stays on the
          blotter (right edge ~2.0) instead of overhanging onto bare wood. */}
      <MiniKeyboard position={[1.42, 0.072, 0.35]} />
      <Mouse position={[2.4, 0, 0.45]} />
      <LooseSheets />
      <Mug position={[-2.0, 0, 1.55]} />
      <Succulent position={[4.0, 0, -1.6]} />
      <Books position={[-4.1, 0, 1.5]} />
      <PencilCup position={[0.62, 0, 1.5]} />
      <Phone position={[2.65, 0, 1.5]} />
    </group>
  );
}
