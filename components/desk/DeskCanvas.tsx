"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { type ComponentType, type RefObject } from "react";
import { sections } from "@/content/sections";
import { CameraRig } from "./CameraRig";
import { Desk } from "./Desk";
import { Hotspot } from "./Hotspot";
import { Papers, Laptop, Ticker, GavelMic } from "./objects";

// Same order as `sections`: research, att-agency, markets, leadership.
const OBJECTS: ComponentType<{ hovered: boolean }>[] = [
  Papers,
  Laptop,
  Ticker,
  GavelMic,
];
const POSITIONS: [number, number, number][] = [
  [-3, 0, -0.4],
  [-1, 0, 0.3],
  [1.2, 0, -0.5],
  [3, 0, 0.4],
];

export default function DeskCanvas({
  progress,
  reduced,
}: {
  progress: RefObject<number>;
  reduced: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov: 40, position: [0, 9, 7.5], near: 0.1, far: 100 }}
    >
      <CameraRig progress={progress} reduced={reduced} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 10, 6]} intensity={1.5} />
      <directionalLight position={[-6, 5, -3]} intensity={0.5} color="#ffd9a0" />
      <Desk />
      {sections.map((s, i) => {
        const Obj = OBJECTS[i];
        return (
          <Hotspot key={s.slug} position={POSITIONS[i]} href={`/${s.slug}`}>
            {(hovered) => <Obj hovered={hovered} />}
          </Hotspot>
        );
      })}
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.35}
        scale={18}
        blur={2.6}
        far={5}
        resolution={512}
        color="#3a2c1a"
      />
    </Canvas>
  );
}
