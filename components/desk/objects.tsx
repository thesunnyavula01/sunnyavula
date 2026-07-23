"use client";

import { Instance, Instances, RoundedBox } from "@react-three/drei";
import { PALETTE as P } from "./palette";

// The four clickable desk objects, one per section. Built from primitives but
// detailed enough to read as real props under soft light: printed pages,
// a laptop with keys + a website mock, a candlestick monitor, a gavel + mic.
// `hovered` lets each object brighten its signature surface.

/* ------------------------------ Research ------------------------------ */

const PAGE_LINES = [0.34, 0.28, 0.31, 0.22, 0.3, 0.16];

export function Papers({ hovered }: { hovered: boolean }) {
  const stackTop = 0.02 + 5 * 0.028;
  return (
    <group>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <RoundedBox
          key={i}
          castShadow
          receiveShadow
          args={[0.98, 0.024, 1.3]}
          radius={0.008}
          position={[i * 0.015, 0.012 + i * 0.028, -i * 0.012]}
          rotation={[0, (i - 2.5) * 0.045, 0]}
        >
          <meshStandardMaterial
            color={P.paper}
            emissive={P.indigo}
            emissiveIntensity={hovered ? 0.12 : 0}
            roughness={0.95}
          />
        </RoundedBox>
      ))}

      {/* printed text lines on the top sheet */}
      <group position={[0.075, stackTop + 0.014, -0.06]} rotation={[0, 0.11, 0]}>
        {PAGE_LINES.map((w, i) => (
          <mesh
            key={i}
            position={[-0.42 + w / 2, 0, -0.5 + i * 0.11]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[w, 0.02]} />
            <meshBasicMaterial color={P.ink} />
          </mesh>
        ))}
        {/* tiny bar-chart figure */}
        {[
          { x: 0.2, h: 0.09, c: P.indigo },
          { x: 0.3, h: 0.14, c: P.berry },
          { x: 0.4, h: 0.2, c: P.sage },
        ].map((b, i) => (
          <mesh key={i} castShadow position={[b.x, b.h / 2, 0.28]}>
            <boxGeometry args={[0.055, b.h, 0.03]} />
            <meshStandardMaterial color={b.c} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* sticky notes */}
      <mesh position={[-0.62, stackTop - 0.05, 0.52]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color={P.marigold} roughness={0.9} />
      </mesh>
      <mesh position={[0.66, 0.002, 0.58]} rotation={[-Math.PI / 2, 0, -0.3]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial color={P.blush} roughness={0.9} />
      </mesh>

      {/* berry pen resting across the corner */}
      <group position={[0.28, stackTop + 0.033, 0.42]} rotation={[0, 0.85, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.72, 14]} />
          <meshStandardMaterial color={P.berry} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.025, 0.012, 0.07, 14]} />
          <meshStandardMaterial color={P.charcoal} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.37, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.05, 14]} />
          <meshStandardMaterial color={P.charcoal} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ----------------------------- ATT Agency ----------------------------- */

const KEY_ROWS = 4;
const KEY_COLS = 12;

export function Laptop({ hovered }: { hovered: boolean }) {
  const keys: [number, number, number][] = [];
  for (let r = 0; r < KEY_ROWS; r++) {
    for (let c = 0; c < KEY_COLS; c++) {
      keys.push([-0.605 + c * 0.11, 0.082, -0.34 + r * 0.11]);
    }
  }
  return (
    <group rotation={[0, -0.28, 0]}>
      {/* base */}
      <RoundedBox
        castShadow
        receiveShadow
        args={[1.5, 0.07, 1.0]}
        radius={0.032}
        position={[0, 0.035, 0]}
      >
        <meshStandardMaterial color={P.silver} roughness={0.5} metalness={0.35} />
      </RoundedBox>

      {/* keyboard */}
      <Instances limit={KEY_ROWS * KEY_COLS} castShadow>
        <boxGeometry args={[0.088, 0.022, 0.088]} />
        <meshStandardMaterial color={P.slate} roughness={0.85} />
        {keys.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>
      {/* spacebar + trackpad */}
      <mesh castShadow position={[0, 0.082, 0.1]}>
        <boxGeometry args={[0.53, 0.022, 0.088]} />
        <meshStandardMaterial color={P.slate} roughness={0.85} />
      </mesh>
      <RoundedBox args={[0.46, 0.012, 0.28]} radius={0.006} position={[0, 0.072, 0.31]}>
        <meshStandardMaterial color="#d9d2c5" roughness={0.55} metalness={0.2} />
      </RoundedBox>

      {/* lid + screen, leaning back ~24° from vertical */}
      <group position={[0, 0.06, -0.485]} rotation={[-0.42, 0, 0]}>
        <RoundedBox castShadow args={[1.5, 1.04, 0.05]} radius={0.032} position={[0, 0.52, 0]}>
          <meshStandardMaterial color={P.slate} roughness={0.5} metalness={0.35} />
        </RoundedBox>
        {/* screen with a little website mock on it */}
        <mesh position={[0, 0.53, 0.028]}>
          <planeGeometry args={[1.38, 0.9]} />
          <meshStandardMaterial
            color="#fbf8f1"
            emissive="#ffffff"
            emissiveIntensity={hovered ? 0.4 : 0.2}
          />
        </mesh>
        <mesh position={[0, 0.925, 0.03]}>
          <planeGeometry args={[1.38, 0.11]} />
          <meshBasicMaterial color={P.berry} />
        </mesh>
        {[-0.62, -0.57, -0.52].map((x, i) => (
          <mesh key={i} position={[x, 0.925, 0.032]}>
            <circleGeometry args={[0.013, 12]} />
            <meshBasicMaterial color="#fbf8f1" />
          </mesh>
        ))}
        <mesh position={[0, 0.68, 0.03]}>
          <planeGeometry args={[1.24, 0.32]} />
          <meshBasicMaterial color={P.indigo} />
        </mesh>
        <mesh position={[-0.18, 0.72, 0.032]}>
          <planeGeometry args={[0.56, 0.028]} />
          <meshBasicMaterial color="#fbf8f1" />
        </mesh>
        <mesh position={[-0.3, 0.66, 0.032]}>
          <planeGeometry args={[0.32, 0.022]} />
          <meshBasicMaterial color="#c9cfe6" />
        </mesh>
        <mesh position={[-0.32, 0.32, 0.03]}>
          <planeGeometry args={[0.6, 0.24]} />
          <meshBasicMaterial color={P.sage} />
        </mesh>
        <mesh position={[0.34, 0.32, 0.03]}>
          <planeGeometry args={[0.6, 0.24]} />
          <meshBasicMaterial color={P.marigold} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------- Markets ------------------------------ */

type Candle = { x: number; h: number; y: number; up: boolean };
const CANDLES: Candle[] = [
  { x: -0.65, h: 0.16, y: -0.22, up: true },
  { x: -0.505, h: 0.22, y: -0.16, up: true },
  { x: -0.36, h: 0.14, y: -0.2, up: false },
  { x: -0.215, h: 0.26, y: -0.08, up: true },
  { x: -0.07, h: 0.18, y: -0.12, up: false },
  { x: 0.075, h: 0.3, y: 0.0, up: true },
  { x: 0.22, h: 0.2, y: -0.04, up: false },
  { x: 0.365, h: 0.34, y: 0.1, up: true },
  { x: 0.51, h: 0.26, y: 0.16, up: true },
  { x: 0.655, h: 0.4, y: 0.24, up: true },
];

export function Ticker({ hovered }: { hovered: boolean }) {
  const glow = hovered ? 1.1 : 0.65;
  return (
    <group rotation={[0, 0.12, 0]}>
      {/* stand */}
      <mesh castShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.06, 32]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} metalness={0.3} />
      </mesh>
      <RoundedBox castShadow args={[0.12, 0.5, 0.09]} radius={0.02} position={[0, 0.3, 0]}>
        <meshStandardMaterial color={P.charcoal} roughness={0.5} metalness={0.3} />
      </RoundedBox>

      {/* head */}
      <group position={[0, 0.98, 0]}>
        <RoundedBox castShadow args={[1.72, 1.06, 0.08]} radius={0.03}>
          <meshStandardMaterial color={P.charcoal} roughness={0.45} metalness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[1.6, 0.94]} />
          <meshBasicMaterial color={P.navy} />
        </mesh>
        {/* faint gridlines */}
        {[-0.26, 0, 0.26].map((y, i) => (
          <mesh key={i} position={[0, y, 0.047]}>
            <planeGeometry args={[1.52, 0.005]} />
            <meshBasicMaterial color="#242c48" />
          </mesh>
        ))}
        {/* legend chip */}
        <mesh position={[-0.62, 0.38, 0.048]}>
          <planeGeometry args={[0.16, 0.05]} />
          <meshBasicMaterial color={P.green} toneMapped={false} />
        </mesh>
        {/* candles + wicks */}
        {CANDLES.map((c, i) => {
          const color = c.up ? P.green : P.red;
          return (
            <group key={i} position={[c.x, c.y, 0]}>
              <mesh position={[0, 0, 0.049]}>
                <planeGeometry args={[0.012, c.h + 0.14]} />
                <meshBasicMaterial color={color} toneMapped={false} />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[0.072, c.h, 0.008]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={glow}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/* --------------------------- Leadership & Policy ---------------------- */

export function GavelMic({ hovered }: { hovered: boolean }) {
  const em = hovered ? 0.28 : 0;
  return (
    <group>
      {/* sound block */}
      <mesh castShadow receiveShadow position={[0.35, 0.045, 0.25]}>
        <cylinderGeometry args={[0.3, 0.33, 0.09, 32]} />
        <meshStandardMaterial color={P.walnut} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.35, 0.115, 0.25]}>
        <cylinderGeometry args={[0.235, 0.235, 0.05, 32]} />
        <meshStandardMaterial color="#8f5a30" roughness={0.55} />
      </mesh>

      {/* gavel resting across the block */}
      <group position={[0.32, 0.28, 0.18]} rotation={[0.06, 0.55, 0.16]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.125, 0.125, 0.4, 24]} />
          <meshStandardMaterial
            color="#8a5a33"
            emissive={P.marigold}
            emissiveIntensity={em}
            roughness={0.5}
          />
        </mesh>
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={i} castShadow position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.138, 0.138, 0.05, 24]} />
            <meshStandardMaterial color="#5e3a1c" roughness={0.5} />
          </mesh>
        ))}
        {[-0.215, 0.215].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.095, 0.095, 0.035, 24]} />
            <meshStandardMaterial color="#5e3a1c" roughness={0.5} />
          </mesh>
        ))}
        {/* handle: perpendicular to the head, angled slightly down to the desk */}
        <mesh castShadow position={[0, -0.04, 0.36]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.042, 0.62, 16]} />
          <meshStandardMaterial color={P.walnutLight} roughness={0.55} />
        </mesh>
        <mesh castShadow position={[0, -0.08, 0.68]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={P.walnutLight} roughness={0.55} />
        </mesh>
      </group>

      {/* microphone */}
      <group position={[-0.52, 0, -0.12]}>
        <mesh castShadow position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.19, 0.22, 0.07, 32]} />
          <meshStandardMaterial color={P.charcoal} roughness={0.45} metalness={0.35} />
        </mesh>
        <mesh castShadow position={[0.045, 0.42, 0]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.022, 0.022, 0.72, 14]} />
          <meshStandardMaterial color={P.slate} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh castShadow position={[0.095, 0.82, 0]}>
          <sphereGeometry args={[0.115, 24, 24]} />
          <meshStandardMaterial
            color="#23252c"
            emissive={P.marigold}
            emissiveIntensity={em}
            roughness={0.35}
            metalness={0.55}
          />
        </mesh>
        <mesh position={[0.095, 0.82, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.118, 0.014, 10, 28]} />
          <meshStandardMaterial color={P.berry} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
