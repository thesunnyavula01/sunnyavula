"use client";

import { Instance, Instances, RoundedBox } from "@react-three/drei";
import { PALETTE as P } from "./palette";

// The four clickable desk objects, one per section. Built from primitives but
// detailed enough to read as real props under the lamp light: a manila folder
// + printed pages with figures, a laptop with keys + a full website mock, a
// candlestick monitor with volume + a moving average, a banded gavel + studio
// mic. `hovered` lets each object brighten its signature surface.

/* ------------------------------ Research ------------------------------ */

// two-column body text on the top sheet: [x offset, width] pairs per row
const PAGE_COLUMNS: [number, number][][] = [
  [
    [-0.42, 0.34],
    [0.02, 0.36],
  ],
  [
    [-0.42, 0.3],
    [0.02, 0.32],
  ],
  [
    [-0.42, 0.36],
    [0.02, 0.28],
  ],
  [
    [-0.42, 0.26],
    [0.02, 0.34],
  ],
  [
    [-0.42, 0.32],
    [0.02, 0.2],
  ],
];

export function Papers({ hovered }: { hovered: boolean }) {
  const stackTop = 0.02 + 5 * 0.028;
  return (
    <group>
      {/* manila folder peeking out under the stack */}
      <RoundedBox
        castShadow
        receiveShadow
        args={[1.12, 0.02, 1.42]}
        radius={0.008}
        position={[-0.06, 0.006, 0.05]}
        rotation={[0, -0.09, 0]}
      >
        <meshStandardMaterial color="#d9b06a" roughness={0.9} />
      </RoundedBox>

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
            color={i % 2 ? "#f4efe4" : P.paper}
            emissive={P.indigo}
            emissiveIntensity={hovered ? 0.12 : 0}
            roughness={0.95}
          />
        </RoundedBox>
      ))}

      {/* printed top sheet: title, rule, two-column body, chart with axes */}
      <group position={[0.075, stackTop + 0.014, -0.06]} rotation={[0, 0.11, 0]}>
        {/* title + berry rule */}
        <mesh position={[-0.14, 0, -0.54]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.56, 0.036]} />
          <meshBasicMaterial color="#2e2a22" />
        </mesh>
        <mesh position={[-0.02, 0, -0.475]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 0.008]} />
          <meshBasicMaterial color={P.berry} />
        </mesh>
        {/* two-column body text */}
        {PAGE_COLUMNS.map((row, r) =>
          row.map(([x, w], c) => (
            <mesh
              key={`${r}-${c}`}
              position={[x + w / 2, 0, -0.4 + r * 0.075]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[w, 0.016]} />
              <meshBasicMaterial color={P.ink} />
            </mesh>
          ))
        )}
        {/* figure: axes + bars + trend line */}
        <mesh position={[0.3, 0.001, 0.31]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.34, 0.006]} />
          <meshBasicMaterial color={P.ink} />
        </mesh>
        <mesh position={[0.135, 0.11, 0.31]}>
          <boxGeometry args={[0.006, 0.22, 0.006]} />
          <meshBasicMaterial color={P.ink} />
        </mesh>
        {[
          { x: 0.2, h: 0.09, c: P.indigo },
          { x: 0.3, h: 0.14, c: P.berry },
          { x: 0.4, h: 0.2, c: P.sage },
        ].map((b, i) => (
          <mesh key={i} castShadow position={[b.x, b.h / 2, 0.31]}>
            <boxGeometry args={[0.055, b.h, 0.03]} />
            <meshStandardMaterial color={b.c} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0.3, 0.19, 0.295]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.26, 0.008]} />
          <meshBasicMaterial color={P.marigold} />
        </mesh>
        {/* paperclip on the corner */}
        <mesh
          position={[-0.36, 0.004, -0.55]}
          rotation={[-Math.PI / 2, 0, 0.3]}
          scale={[1, 1.9, 1]}
        >
          <torusGeometry args={[0.045, 0.007, 8, 24]} />
          <meshStandardMaterial color="#c9c9cf" roughness={0.25} metalness={0.85} />
        </mesh>
      </group>

      {/* sticky notes — the marigold one has a scribble */}
      <group position={[-0.62, stackTop - 0.05, 0.52]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <mesh>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color={P.marigold} roughness={0.9} />
        </mesh>
        {[0.07, 0.0, -0.07].map((y, i) => (
          <mesh key={i} position={[i === 1 ? -0.03 : 0, y, 0.001]}>
            <planeGeometry args={[i === 1 ? 0.14 : 0.2, 0.012]} />
            <meshBasicMaterial color="#7a5a1e" />
          </mesh>
        ))}
      </group>
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
        {/* clip */}
        <mesh position={[0.026, 0.3, 0]}>
          <boxGeometry args={[0.008, 0.12, 0.014]} />
          <meshStandardMaterial color="#c9c9cf" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/* ----------------------------- ATT Agency ----------------------------- */

const KEY_ROWS = 4;
const KEY_COLS = 12;

// website-mock cards: [x center, image-strip color]
const MOCK_CARDS: [number, string][] = [
  [-0.45, P.sage],
  [0, P.marigold],
  [0.45, P.blush],
];

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

      {/* keyboard — frustumCulled off: the culling sphere only covers the base
          key geometry at the origin, so keys vanish at close camera angles */}
      <Instances limit={KEY_ROWS * KEY_COLS} castShadow frustumCulled={false}>
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

      {/* hinge */}
      <mesh position={[0, 0.055, -0.49]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 1.32, 12]} />
        <meshStandardMaterial color={P.slate} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* lid + screen, leaning back ~24° from vertical */}
      <group position={[0, 0.06, -0.485]} rotation={[-0.42, 0, 0]}>
        <RoundedBox castShadow args={[1.5, 1.04, 0.05]} radius={0.032} position={[0, 0.52, 0]}>
          <meshStandardMaterial color={P.slate} roughness={0.5} metalness={0.35} />
        </RoundedBox>
        {/* dark bezel + webcam dot */}
        <mesh position={[0, 0.53, 0.026]}>
          <planeGeometry args={[1.44, 0.96]} />
          <meshBasicMaterial color="#14161e" />
        </mesh>
        <mesh position={[0, 0.995, 0.028]}>
          <circleGeometry args={[0.008, 10]} />
          <meshBasicMaterial color="#3a3f4d" />
        </mesh>

        {/* glowing screen with a full website mock (attagency-style) */}
        <mesh position={[0, 0.53, 0.028]}>
          <planeGeometry args={[1.38, 0.9]} />
          <meshStandardMaterial
            color="#fbf8f1"
            emissive="#fff6e8"
            emissiveIntensity={hovered ? 0.65 : 0.4}
          />
        </mesh>
        {/* browser chrome: berry bar, traffic lights, URL pill */}
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
        <mesh position={[0.02, 0.925, 0.032]}>
          <planeGeometry args={[0.52, 0.045]} />
          <meshBasicMaterial color="#d24f80" />
        </mesh>
        {/* hero: headline, sub, CTA, art blob */}
        <mesh position={[0, 0.73, 0.03]}>
          <planeGeometry args={[1.38, 0.28]} />
          <meshBasicMaterial color={P.indigo} />
        </mesh>
        <mesh position={[-0.28, 0.79, 0.032]}>
          <planeGeometry args={[0.56, 0.032]} />
          <meshBasicMaterial color="#fbf8f1" />
        </mesh>
        <mesh position={[-0.36, 0.735, 0.032]}>
          <planeGeometry args={[0.4, 0.024]} />
          <meshBasicMaterial color="#c9cfe6" />
        </mesh>
        <mesh position={[-0.47, 0.665, 0.032]}>
          <planeGeometry args={[0.18, 0.05]} />
          <meshBasicMaterial color={P.marigold} />
        </mesh>
        <mesh position={[0.44, 0.73, 0.032]}>
          <circleGeometry args={[0.095, 24]} />
          <meshBasicMaterial color={P.blush} />
        </mesh>
        <mesh position={[0.5, 0.77, 0.033]}>
          <circleGeometry args={[0.045, 20]} />
          <meshBasicMaterial color={P.marigold} />
        </mesh>
        {/* three feature cards: image strip + two text lines each */}
        {MOCK_CARDS.map(([x, c]) => (
          <group key={x} position={[x, 0.4, 0]}>
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[0.4, 0.32]} />
              <meshBasicMaterial color="#f1ece0" />
            </mesh>
            <mesh position={[0, 0.085, 0.032]}>
              <planeGeometry args={[0.4, 0.15]} />
              <meshBasicMaterial color={c} />
            </mesh>
            <mesh position={[-0.045, -0.035, 0.032]}>
              <planeGeometry args={[0.29, 0.02]} />
              <meshBasicMaterial color="#7a7466" />
            </mesh>
            <mesh position={[-0.085, -0.085, 0.032]}>
              <planeGeometry args={[0.21, 0.016]} />
              <meshBasicMaterial color="#a8a191" />
            </mesh>
          </group>
        ))}
        {/* footer */}
        <mesh position={[0, 0.135, 0.03]}>
          <planeGeometry args={[1.38, 0.11]} />
          <meshBasicMaterial color={P.navy} />
        </mesh>
        <mesh position={[-0.5, 0.135, 0.032]}>
          <planeGeometry args={[0.3, 0.018]} />
          <meshBasicMaterial color="#4a5470" />
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

// moving-average polyline through the candle centers (marigold, above closes)
const MA_SEGMENTS = CANDLES.slice(1).map((c, i) => {
  const prev = CANDLES[i];
  const x0 = prev.x;
  const y0 = prev.y + 0.06;
  const x1 = c.x;
  const y1 = c.y + 0.06;
  return {
    x: (x0 + x1) / 2,
    y: (y0 + y1) / 2,
    len: Math.hypot(x1 - x0, y1 - y0),
    rot: Math.atan2(y1 - y0, x1 - x0),
  };
});

export function Ticker({ hovered }: { hovered: boolean }) {
  const glow = hovered ? 1.4 : 0.9;
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
        {/* grid: horizontals + verticals + right-edge price ticks */}
        {[-0.26, 0, 0.26].map((y, i) => (
          <mesh key={i} position={[0, y, 0.047]}>
            <planeGeometry args={[1.52, 0.005]} />
            <meshBasicMaterial color="#242c48" />
          </mesh>
        ))}
        {[-0.48, -0.16, 0.16, 0.48].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.0465]}>
            <planeGeometry args={[0.004, 0.86]} />
            <meshBasicMaterial color="#1d2440" />
          </mesh>
        ))}
        {[-0.26, 0, 0.26, 0.38].map((y, i) => (
          <mesh key={i} position={[0.735, y, 0.048]}>
            <planeGeometry args={[0.05, 0.01]} />
            <meshBasicMaterial color="#3c4670" />
          </mesh>
        ))}
        {/* legend chips + live price readout */}
        <mesh position={[-0.62, 0.38, 0.048]}>
          <planeGeometry args={[0.16, 0.05]} />
          <meshBasicMaterial color={P.green} toneMapped={false} />
        </mesh>
        <mesh position={[-0.44, 0.38, 0.048]}>
          <planeGeometry args={[0.12, 0.04]} />
          <meshBasicMaterial color={P.marigold} toneMapped={false} />
        </mesh>
        <mesh position={[0.52, 0.38, 0.048]}>
          <planeGeometry args={[0.2, 0.045]} />
          <meshStandardMaterial
            color={P.green}
            emissive={P.green}
            emissiveIntensity={glow}
            toneMapped={false}
          />
        </mesh>
        {/* volume bars along the bottom */}
        {CANDLES.map((c, i) => (
          <mesh key={i} position={[c.x, -0.4 + (0.04 + (i % 4) * 0.02) / 2, 0.048]}>
            <planeGeometry args={[0.05, 0.04 + (i % 4) * 0.02]} />
            <meshBasicMaterial color={c.up ? "#1f6b52" : "#7c3a33"} />
          </mesh>
        ))}
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
        {/* moving-average line over the candles */}
        {MA_SEGMENTS.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, 0.052]} rotation={[0, 0, s.rot]}>
            <planeGeometry args={[s.len, 0.011]} />
            <meshBasicMaterial color={P.marigold} toneMapped={false} />
          </mesh>
        ))}
        {/* power LED */}
        <mesh position={[0.78, -0.49, 0.046]}>
          <circleGeometry args={[0.012, 10]} />
          <meshStandardMaterial
            color={P.green}
            emissive={P.green}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/* --------------------------- Leadership & Policy ---------------------- */

export function GavelMic({ hovered }: { hovered: boolean }) {
  const em = hovered ? 0.28 : 0;
  return (
    <group>
      {/* sound block with a brass rim */}
      <mesh castShadow receiveShadow position={[0.35, 0.045, 0.25]}>
        <cylinderGeometry args={[0.3, 0.33, 0.09, 32]} />
        <meshStandardMaterial color={P.walnut} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.35, 0.115, 0.25]}>
        <cylinderGeometry args={[0.235, 0.235, 0.05, 32]} />
        <meshStandardMaterial color="#8f5a30" roughness={0.55} />
      </mesh>
      <mesh position={[0.35, 0.14, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.235, 0.011, 10, 40]} />
        <meshStandardMaterial color={P.brass} roughness={0.3} metalness={0.75} />
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
        {/* brass bands around the head */}
        {[-0.09, 0.09].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.128, 0.128, 0.024, 24]} />
            <meshStandardMaterial color={P.brass} roughness={0.3} metalness={0.75} />
          </mesh>
        ))}
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
        <mesh position={[0, -0.016, 0.13]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.02, 16]} />
          <meshStandardMaterial color={P.brass} roughness={0.3} metalness={0.75} />
        </mesh>
        <mesh castShadow position={[0, -0.08, 0.68]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={P.walnutLight} roughness={0.55} />
        </mesh>
      </group>

      {/* studio microphone */}
      <group position={[-0.52, 0, -0.12]}>
        <mesh castShadow position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.19, 0.22, 0.07, 32]} />
          <meshStandardMaterial color={P.charcoal} roughness={0.45} metalness={0.35} />
        </mesh>
        {/* on-air LED + mute button on the base */}
        <mesh position={[0.13, 0.072, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.016, 12]} />
          <meshStandardMaterial
            color={P.red}
            emissive={P.red}
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.06, 0.072, 0.135]}>
          <cylinderGeometry args={[0.02, 0.02, 0.012, 14]} />
          <meshStandardMaterial color={P.slate} roughness={0.4} />
        </mesh>
        {/* stem + joint collar */}
        <mesh castShadow position={[0.045, 0.42, 0]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.022, 0.022, 0.72, 14]} />
          <meshStandardMaterial color={P.slate} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.088, 0.755, 0]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.032, 0.032, 0.045, 12]} />
          <meshStandardMaterial color={P.brass} roughness={0.35} metalness={0.7} />
        </mesh>
        {/* capsule with grill rings */}
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
        {[-0.03, 0.02, 0.07].map((y, i) => (
          <mesh key={i} position={[0.095, 0.82 + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry
              args={[Math.sqrt(Math.max(0.115 ** 2 - y ** 2, 0.001)) + 0.004, 0.004, 8, 28]}
            />
            <meshStandardMaterial color="#4a4e5a" roughness={0.35} metalness={0.6} />
          </mesh>
        ))}
        <mesh position={[0.095, 0.82, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.118, 0.014, 10, 28]} />
          <meshStandardMaterial color={P.berry} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
