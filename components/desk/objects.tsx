"use client";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// Section accent colors (used as hover glow).
const RESEARCH = "#b98cff";
const ATT = "#5b8cff";
const MARKETS = "#33d17a";
const LEAD = "#ffcf6b";

// Research — a stack of papers with a pen.
export function Papers({ hovered }: { hovered: boolean }) {
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <RoundedBox
          key={i}
          args={[0.95, 0.02, 1.25]}
          radius={0.008}
          position={[i * 0.02, 0.03 + i * 0.03, i * 0.02]}
          rotation={[0, (i - 1.5) * 0.06, 0]}
        >
          <meshStandardMaterial
            color="#f8f6f1"
            emissive={RESEARCH}
            emissiveIntensity={hovered ? 0.35 : 0}
            roughness={0.9}
          />
        </RoundedBox>
      ))}
      <mesh position={[0.15, 0.17, 0.25]} rotation={[0, 0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 12]} />
        <meshStandardMaterial color="#2b2b2b" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ATT Agency — an open laptop with a glowing screen.
export function Laptop({ hovered }: { hovered: boolean }) {
  const glow = hovered ? 1.0 : 0.65;
  return (
    <group rotation={[0, -0.35, 0]}>
      <RoundedBox args={[1.15, 0.06, 0.78]} radius={0.03} position={[0, 0.03, 0.06]}>
        <meshStandardMaterial color="#cfd3d9" metalness={0.7} roughness={0.35} />
      </RoundedBox>
      <group position={[0, 0.05, -0.32]} rotation={[-1.15, 0, 0]}>
        <RoundedBox args={[1.15, 0.78, 0.04]} radius={0.03} position={[0, 0.39, 0]}>
          <meshStandardMaterial color="#2a2d33" metalness={0.5} roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0.39, 0.03]}>
          <planeGeometry args={[1.02, 0.64]} />
          <meshStandardMaterial
            color={ATT}
            emissive={ATT}
            emissiveIntensity={glow}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}

// Markets — a monitor showing a small candlestick chart.
const BARS = [
  { h: 0.18, y: 0.0, up: true },
  { h: 0.3, y: 0.05, up: true },
  { h: 0.22, y: -0.03, up: false },
  { h: 0.36, y: 0.08, up: true },
  { h: 0.26, y: 0.02, up: false },
  { h: 0.42, y: 0.12, up: true },
  { h: 0.3, y: 0.06, up: true },
  { h: 0.24, y: -0.02, up: false },
];

export function Ticker({ hovered }: { hovered: boolean }) {
  const glow = hovered ? 1.2 : 0.8;
  return (
    <group>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.06, 24]} />
        <meshStandardMaterial color="#2c2f34" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.1, 0.34, 0.08]} />
        <meshStandardMaterial color="#2c2f34" metalness={0.4} roughness={0.5} />
      </mesh>
      <group position={[0, 0.66, 0]}>
        <RoundedBox args={[1.35, 0.85, 0.07]} radius={0.03}>
          <meshStandardMaterial color="#14181c" metalness={0.3} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[1.22, 0.72]} />
          <meshStandardMaterial
            color="#08130d"
            emissive="#0c2a1a"
            emissiveIntensity={0.4}
            toneMapped={false}
          />
        </mesh>
        {BARS.map((bar, i) => (
          <mesh key={i} position={[-0.5 + i * 0.14, bar.y, 0.05]}>
            <boxGeometry args={[0.06, bar.h, 0.01]} />
            <meshStandardMaterial
              color={bar.up ? MARKETS : "#ff5c57"}
              emissive={bar.up ? MARKETS : "#ff5c57"}
              emissiveIntensity={glow}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Leadership & Policy — a gavel on a sound block, next to a microphone.
export function GavelMic({ hovered }: { hovered: boolean }) {
  const em = hovered ? 0.4 : 0;
  return (
    <group>
      <mesh position={[0.35, 0.05, 0.2]}>
        <cylinderGeometry args={[0.24, 0.26, 0.1, 24]} />
        <meshStandardMaterial color="#7a4a22" roughness={0.6} />
      </mesh>
      <group position={[0.1, 0.22, 0.1]} rotation={[0, 0.4, 0.35]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.36, 20]} />
          <meshStandardMaterial
            color="#9a6a35"
            emissive={LEAD}
            emissiveIntensity={em}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
          <meshStandardMaterial color="#7a4a22" roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[-0.45, 0.35, -0.1]}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 12]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.45, 0.74, -0.1]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial
          color="#1f1f1f"
          emissive={LEAD}
          emissiveIntensity={em}
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}
