"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import {
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from "react";
import * as THREE from "three";
import { sections } from "@/content/sections";
import { ACCENTS, PALETTE } from "./palette";
import { CameraRig, type OrbitState } from "./CameraRig";
import { BLOTTER_TOP, Desk } from "./Desk";
import { Hotspot } from "./Hotspot";
import { makeStudioEnv } from "./env";
import { shadowsDirty } from "./shadowBus";
import { Papers, Laptop, Ticker, GavelMic } from "./objects";

// IMPORTANT: core-three shadow features only (PCF + ContactShadows).
// drei's <SoftShadows/> (PCSS) patches global shader chunks and broke EVERY
// meshStandardMaterial with three 0.185 — the whole desk rendered invisible.
//
// `shadows` is the STRING "percentage", not the boolean. R3F maps a bare
// `shadows` to PCFSoftShadowMap, which three 0.185 has deprecated: on the first
// shadow render it logs "PCFSoftShadowMap has been deprecated. Using
// PCFShadowMap instead." and rewrites the type itself. Two consequences beyond
// the console noise, and the second one is the reason this matters:
//   * R3F re-runs its shadow config on state changes (the dpr bump below is
//     one), sets the type back to PCFSoft each time, and its own
//     `oldType !== newType` check therefore fires `shadowMap.needsUpdate` —
//     forcing a full depth pass that ShadowScheduler exists to avoid.
//   * the warning repeats on every one of those passes.
// "percentage" names PCFShadowMap outright, which is what three renders either
// way, so this is identical output with none of that.
//
// Also gone on purpose, both for time-to-first-frame:
//   * drei <Environment>/<Lightformer> — replaced by makeStudioEnv() (see
//     env.ts); it cost ~25 kB gzip of unused loaders plus a six-face cube
//     render at startup.
//   * drei <Preload all/> — it called gl.compile() AND drove a CubeCamera over
//     the whole scene, i.e. six extra full-scene renders synchronously in a
//     layout effect before the first frame could paint. Every object is
//     visible at the overview stop anyway, so frame 1 compiles the same
//     programs; the cube pass was pure latency.

// Same order as `sections`: research, att-agency, markets, leadership.
const OBJECTS: ComponentType<{ hovered: boolean }>[] = [
  Papers,
  Laptop,
  Ticker,
  GavelMic,
];
const POSITIONS: [number, number, number][] = [
  [-3.2, 0, -0.4],
  [-0.9, BLOTTER_TOP, 0.35], // sits on the blotter
  // Behind the blotter (its back edge is z = -0.6), where a monitor belongs:
  // at z = -0.8 the stand stood ON the mat and sank 0.05 into it, and the ring
  // (r 1.05) was half-buried under the mat, so the hover circle broke mid-arc.
  // The ring now lands entirely on bare wood between z = -0.7 and -2.5, inside
  // the desk top's back edge (-2.6). Keep KEYS[3] in CameraRig.tsx in sync.
  [1.55, 0, -1.6],
  [3.3, 0, 0.45],
];
const RING_RADII = [1.0, 1.15, 0.9, 1.05];

// Fires `onFirstFrame` one rAF after the first rendered frame, i.e. once the
// scene is actually on screen — DeskScene uses it to fade out the loading
// label that stands in while three.js downloads and the shaders compile.
function FirstFrame({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    if (onFirstFrame) requestAnimationFrame(() => onFirstFrame());
  });
  return null;
}

// The first frame is the one the user is waiting on, so it renders at dpr 1 —
// on a 2× display that is a quarter of the pixels, and it is the frame that
// also pays for every shader compile. The real dpr is restored a frame later,
// so the desk appears as early as possible and sharpens immediately after.
function ProgressiveDpr({ onReady }: { onReady: (dpr: number) => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    const want = Math.min(2, window.devicePixelRatio || 1);
    if (want > 1) requestAnimationFrame(() => onReady(want));
  });
  return null;
}

// Bakes the directional shadow map over the first few frames, then freezes it.
// The island only bobs (±0.05) and lifts objects on hover, so re-running a
// full depth pass every frame doubled the draw calls to no visible end;
// <Hotspot> pokes it back on while a lift animates.
function ShadowScheduler() {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current < 3) {
      frames.current += 1;
      if (frames.current === 3) gl.shadowMap.autoUpdate = false;
      return;
    }
    gl.shadowMap.needsUpdate = shadowsDirty();
  });
  return null;
}

// Gentle idle bob so the floating island feels alive; off for reduced motion.
function FloatGroup({
  reduced,
  children,
}: {
  reduced: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    if (reduced) {
      g.position.y = 0;
      g.rotation.set(0, 0, 0);
      return;
    }
    const t = clock.elapsedTime;
    g.position.y = Math.sin(t * 0.55) * 0.05;
    g.rotation.z = Math.sin(t * 0.38) * 0.004;
    g.rotation.x = Math.sin(t * 0.47 + 1.2) * 0.003;
  });
  return <group ref={ref}>{children}</group>;
}

export default function DeskCanvas({
  stop,
  orbit,
  active,
  reduced,
  compact = false,
  paused = false,
  onFirstFrame,
}: {
  stop: RefObject<number>; // target stop index, 0..5
  orbit: RefObject<OrbitState>; // drag-to-look-around state
  active: number; // -1 = overview, 0..3 = focused section
  reduced: boolean;
  compact?: boolean; // phone layout — see the portrait framing note in CameraRig
  paused?: boolean;
  onFirstFrame?: () => void; // desk is on screen — safe to drop the loader
}) {
  const [dpr, setDpr] = useState(1);
  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      frameloop={paused ? "never" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 35, position: [0.6, 8.6, 10.2], near: 0.1, far: 80 }}
      onCreated={(state) => {
        // Set before the first render: `environment` is part of the material
        // program key, so attaching it later would recompile every lit
        // material in the scene.
        state.scene.environment = makeStudioEnv();
        state.scene.environmentIntensity = 0.85;
        // debug handle: lets headless checks force a render + read pixels back
        (window as unknown as Record<string, unknown>).__deskState = state;
      }}
    >
      <fog attach="fog" args={[PALETTE.bg, 16, 40]} />
      <CameraRig
        stop={stop}
        orbit={orbit}
        reduced={reduced}
        compact={compact}
      />

      {/* night study: cool moon ambience, warm key from the lamp side, cool rim */}
      <ambientLight intensity={0.3} color="#c9d2ff" />
      <hemisphereLight intensity={0.35} color="#aebaff" groundColor="#1d1409" />
      <directionalLight
        castShadow
        position={[6, 12, 7]}
        intensity={2.1}
        color="#ffe0b0"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0001}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-7, 5, -4]} intensity={0.7} color="#7f8dff" />

      <FloatGroup reduced={reduced}>
        <Desk />
        {sections.map((s, i) => {
          const Obj = OBJECTS[i];
          return (
            <Hotspot
              key={s.slug}
              position={POSITIONS[i]}
              href={`/${s.slug}`}
              label={s.nav}
              accent={ACCENTS[i]}
              ringRadius={RING_RADII[i]}
              focused={active === i}
            >
              {(hovered) => <Obj hovered={hovered} />}
            </Hotspot>
          );
        })}
      </FloatGroup>

      {/* soft blob the island floats over — baked once (frames=1), the bob is
          too small to warrant re-rendering the depth pass every frame */}
      <ContactShadows
        position={[0, -2.3, 0]}
        scale={30}
        far={6}
        blur={2.4}
        opacity={0.6}
        resolution={512}
        frames={1}
        color="#000000"
      />

      <ShadowScheduler />
      <FirstFrame onFirstFrame={onFirstFrame} />
      <ProgressiveDpr onReady={setDpr} />
    </Canvas>
  );
}
