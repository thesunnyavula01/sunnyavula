"use client";

import { Instance, Instances } from "@react-three/drei";
import { PALETTE as P } from "./palette";
import { SoftBox } from "./SoftBox";
import {
  LAPTOP_SCREEN,
  PAPER_SHEET,
  TICKER_SCREEN,
  laptopScreenTexture,
  paperPrintTexture,
  tickerScreenTexture,
} from "./screens";

// The four clickable desk objects, one per section. Built from primitives but
// detailed enough to read as real props under the lamp light: a manila folder
// + printed pages with figures, a laptop with keys + a full website mock, a
// candlestick monitor with volume + a moving average, a banded gavel + studio
// mic. `hovered` lets each object brighten its signature surface.
//
// All the FLAT artwork — the website mock, the chart, the printed page — is
// painted into a canvas in screens.ts and applied as a single map, rather than
// stacked out of ~95 individual planes. Only things with real depth are still
// geometry.

/* ------------------------------ Research ------------------------------ */

export function Papers({ hovered }: { hovered: boolean }) {
  const stackTop = 0.02 + 5 * 0.028;
  return (
    <group>
      {/* manila folder peeking out under the stack — 8mm corner radius on a
          2cm-thick slab never reads, so it is a plain box */}
      <mesh
        castShadow
        receiveShadow
        position={[-0.06, 0.006, 0.05]}
        rotation={[0, -0.09, 0]}
      >
        <boxGeometry args={[1.12, 0.02, 1.42]} />
        <meshStandardMaterial color="#d9b06a" roughness={0.9} />
      </mesh>

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[i * 0.015, 0.012 + i * 0.028, -i * 0.012]}
          rotation={[0, (i - 2.5) * 0.045, 0]}
        >
          <boxGeometry args={[0.98, 0.024, 1.3]} />
          <meshStandardMaterial
            color={i % 2 ? "#f4efe4" : P.paper}
            emissive={P.indigo}
            emissiveIntensity={hovered ? 0.12 : 0}
            roughness={0.95}
          />
        </mesh>
      ))}

      {/* printed top sheet: title, rule, two-column body, chart */}
      <group position={[0.075, stackTop + 0.014, -0.06]} rotation={[0, 0.11, 0]}>
        {/* the printing itself — one transparent map over the lit sheet */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PAPER_SHEET.w, PAPER_SHEET.d]} />
          <meshStandardMaterial
            map={paperPrintTexture()}
            transparent
            roughness={0.95}
          />
        </mesh>

        {/* figure: upright axis + bars + trend line all stand off the page */}
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
          <torusGeometry args={[0.045, 0.007, 6, 16]} />
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
          <cylinderGeometry args={[0.024, 0.024, 0.72, 10]} />
          <meshStandardMaterial color={P.berry} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.025, 0.012, 0.07, 10]} />
          <meshStandardMaterial color={P.charcoal} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.37, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.05, 10]} />
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
      <SoftBox
        castShadow
        receiveShadow
        args={[1.5, 0.07, 1.0]}
        radius={0.032}
        position={[0, 0.035, 0]}
      >
        <meshStandardMaterial color={P.silver} roughness={0.5} metalness={0.35} />
      </SoftBox>

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
      <mesh position={[0, 0.072, 0.31]}>
        <boxGeometry args={[0.46, 0.012, 0.28]} />
        <meshStandardMaterial color="#d9d2c5" roughness={0.55} metalness={0.2} />
      </mesh>

      {/* hinge */}
      <mesh position={[0, 0.055, -0.49]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.028, 1.32, 10]} />
        <meshStandardMaterial color={P.slate} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* lid + screen, leaning back ~24° from vertical */}
      <group position={[0, 0.06, -0.485]} rotation={[-0.42, 0, 0]}>
        <SoftBox castShadow args={[1.5, 1.04, 0.05]} radius={0.032} position={[0, 0.52, 0]}>
          <meshStandardMaterial color={P.slate} roughness={0.5} metalness={0.35} />
        </SoftBox>
        {/* dark bezel + webcam dot */}
        <mesh position={[0, 0.53, 0.026]}>
          <planeGeometry args={[1.44, 0.96]} />
          <meshBasicMaterial color="#14161e" />
        </mesh>
        <mesh position={[0, 0.995, 0.028]}>
          <circleGeometry args={[0.008, 8]} />
          <meshBasicMaterial color="#3a3f4d" />
        </mesh>

        {/* the whole website mock, in one map — a backlit screen, so it is
            unlit basic; hover just brightens it */}
        <mesh position={[0, LAPTOP_SCREEN.y, 0.028]}>
          <planeGeometry args={[LAPTOP_SCREEN.w, LAPTOP_SCREEN.h]} />
          <meshBasicMaterial
            map={laptopScreenTexture()}
            color={hovered ? "#ffffff" : "#ddd9d1"}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------- Markets ------------------------------ */

export function Ticker({ hovered }: { hovered: boolean }) {
  return (
    <group rotation={[0, 0.12, 0]}>
      {/* stand */}
      <mesh castShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.06, 18]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} metalness={0.3} />
      </mesh>
      <SoftBox castShadow args={[0.12, 0.5, 0.09]} radius={0.02} position={[0, 0.3, 0]}>
        <meshStandardMaterial color={P.charcoal} roughness={0.5} metalness={0.3} />
      </SoftBox>

      {/* head */}
      <group position={[0, 0.98, 0]}>
        <SoftBox castShadow args={[1.72, 1.06, 0.08]} radius={0.03}>
          <meshStandardMaterial color={P.charcoal} roughness={0.45} metalness={0.3} />
        </SoftBox>

        {/* grid, candles, volume, moving average — one map, tone mapping off
            so the greens keep their neon punch */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[TICKER_SCREEN.w, TICKER_SCREEN.h]} />
          <meshBasicMaterial
            map={tickerScreenTexture()}
            toneMapped={false}
            color={hovered ? "#ffffff" : "#cdcdcd"}
          />
        </mesh>

        {/* power LED, on the bezel below the panel */}
        <mesh position={[0.78, -0.49, 0.046]}>
          <circleGeometry args={[0.012, 8]} />
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
        <cylinderGeometry args={[0.3, 0.33, 0.09, 20]} />
        <meshStandardMaterial color={P.walnut} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.35, 0.115, 0.25]}>
        <cylinderGeometry args={[0.235, 0.235, 0.05, 20]} />
        <meshStandardMaterial color="#8f5a30" roughness={0.55} />
      </mesh>
      <mesh position={[0.35, 0.14, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.235, 0.011, 6, 24]} />
        <meshStandardMaterial color={P.brass} roughness={0.3} metalness={0.75} />
      </mesh>

      {/* gavel resting across the block */}
      <group position={[0.32, 0.28, 0.18]} rotation={[0.06, 0.55, 0.16]}>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.125, 0.125, 0.4, 16]} />
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
            <cylinderGeometry args={[0.128, 0.128, 0.024, 16]} />
            <meshStandardMaterial color={P.brass} roughness={0.3} metalness={0.75} />
          </mesh>
        ))}
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={i} castShadow position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.138, 0.138, 0.05, 16]} />
            <meshStandardMaterial color="#5e3a1c" roughness={0.5} />
          </mesh>
        ))}
        {[-0.215, 0.215].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.095, 0.095, 0.035, 16]} />
            <meshStandardMaterial color="#5e3a1c" roughness={0.5} />
          </mesh>
        ))}
        {/* handle: perpendicular to the head, angled slightly down to the desk */}
        <mesh castShadow position={[0, -0.04, 0.36]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.042, 0.62, 12]} />
          <meshStandardMaterial color={P.walnutLight} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.016, 0.13]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.02, 12]} />
          <meshStandardMaterial color={P.brass} roughness={0.3} metalness={0.75} />
        </mesh>
        <mesh castShadow position={[0, -0.08, 0.68]}>
          <sphereGeometry args={[0.055, 12, 8]} />
          <meshStandardMaterial color={P.walnutLight} roughness={0.55} />
        </mesh>
      </group>

      {/* studio microphone */}
      <group position={[-0.52, 0, -0.12]}>
        <mesh castShadow position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.19, 0.22, 0.07, 20]} />
          <meshStandardMaterial color={P.charcoal} roughness={0.45} metalness={0.35} />
        </mesh>
        {/* on-air LED + mute button on the base */}
        <mesh position={[0.13, 0.072, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.016, 10]} />
          <meshStandardMaterial
            color={P.red}
            emissive={P.red}
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.06, 0.072, 0.135]}>
          <cylinderGeometry args={[0.02, 0.02, 0.012, 10]} />
          <meshStandardMaterial color={P.slate} roughness={0.4} />
        </mesh>
        {/* stem + joint collar */}
        <mesh castShadow position={[0.045, 0.42, 0]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.022, 0.022, 0.72, 10]} />
          <meshStandardMaterial color={P.slate} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.088, 0.755, 0]} rotation={[0, 0, -0.12]}>
          <cylinderGeometry args={[0.032, 0.032, 0.045, 10]} />
          <meshStandardMaterial color={P.brass} roughness={0.35} metalness={0.7} />
        </mesh>
        {/* capsule with grill rings */}
        <mesh castShadow position={[0.095, 0.82, 0]}>
          <sphereGeometry args={[0.115, 16, 12]} />
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
              args={[Math.sqrt(Math.max(0.115 ** 2 - y ** 2, 0.001)) + 0.004, 0.004, 5, 16]}
            />
            <meshStandardMaterial color="#4a4e5a" roughness={0.35} metalness={0.6} />
          </mesh>
        ))}
        <mesh position={[0.095, 0.82, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.118, 0.014, 6, 20]} />
          <meshStandardMaterial color={P.berry} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
