"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  Preload,
} from "@react-three/drei";
import { useRef, type ComponentType, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { sections } from "@/content/sections";
import { ACCENTS, PALETTE } from "./palette";
import { CameraRig, type OrbitState } from "./CameraRig";
import { Desk } from "./Desk";
import { Hotspot } from "./Hotspot";
import { Papers, Laptop, Ticker, GavelMic } from "./objects";

// IMPORTANT: core-three shadow features only (PCFSoft + ContactShadows).
// drei's <SoftShadows/> (PCSS) patches global shader chunks and broke EVERY
// meshStandardMaterial with three 0.185 — the whole desk rendered invisible.

// Same order as `sections`: research, att-agency, markets, leadership.
const OBJECTS: ComponentType<{ hovered: boolean }>[] = [
  Papers,
  Laptop,
  Ticker,
  GavelMic,
];
const POSITIONS: [number, number, number][] = [
  [-3.2, 0, -0.4],
  [-0.9, 0.05, 0.35], // sits on the blotter
  [1.55, 0, -0.8],
  [3.3, 0, 0.45],
];
const RING_RADII = [1.0, 1.15, 1.05, 1.05];

// Fires `onFirstFrame` one rAF after the first rendered frame, i.e. once the
// scene is actually on screen — DeskScene uses it to fade out the static
// poster that covers the canvas while shaders compile.
function FirstFrame({ onFirstFrame }: { onFirstFrame?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    if (onFirstFrame) requestAnimationFrame(() => onFirstFrame());
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
  paused = false,
  onFirstFrame,
}: {
  stop: RefObject<number>; // target stop index, 0..4
  orbit: RefObject<OrbitState>; // drag-to-look-around state
  active: number; // -1 = overview, 0..3 = focused section
  reduced: boolean;
  paused?: boolean;
  onFirstFrame?: () => void; // first frame is on screen — safe to drop the poster
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={paused ? "never" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 35, position: [0.6, 8.6, 10.2], near: 0.1, far: 80 }}
      onCreated={(state) => {
        // debug handle: lets headless checks force a render + read pixels back
        (window as unknown as Record<string, unknown>).__deskState = state;
      }}
    >
      <fog attach="fog" args={[PALETTE.bg, 16, 40]} />
      <CameraRig stop={stop} orbit={orbit} reduced={reduced} />

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

      {/* local studio environment — no network HDRs */}
      <Environment resolution={64}>
        <Lightformer
          intensity={0.6}
          rotation-x={Math.PI / 2}
          position={[0, 5, 0]}
          scale={[10, 10, 1]}
          color="#fff3dd"
        />
        <Lightformer
          intensity={0.4}
          position={[-6, 2, -1]}
          rotation-y={Math.PI / 2}
          scale={[4, 6, 1]}
          color="#ffcf94"
        />
        <Lightformer
          intensity={0.35}
          position={[6, 3, 2]}
          rotation-y={-Math.PI / 2}
          scale={[4, 6, 1]}
          color="#8fa2ff"
        />
      </Environment>

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

      {/* compile every material up front so camera swings never hit a
          first-use shader stall */}
      <Preload all />
      <FirstFrame onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}
