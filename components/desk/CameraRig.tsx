"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

type Key = { pos: [number, number, number]; target: [number, number, number] };

// Keyframe 0 = aerial overview; 1..4 = a focused shot of each desk object,
// in the same order as `sections` (research, att-agency, markets, leadership).
const KEYS: Key[] = [
  { pos: [0, 9, 7.5], target: [0, 0, 0] },
  { pos: [-3.1, 3.2, 2.7], target: [-3, 0.2, -0.4] },
  { pos: [-1.0, 3.0, 3.0], target: [-1, 0.35, 0.3] },
  { pos: [1.3, 3.0, 3.0], target: [1.2, 0.4, -0.5] },
  { pos: [3.1, 3.2, 2.8], target: [3, 0.35, 0.4] },
];

const smooth = (x: number) => x * x * (3 - 2 * x);

export function CameraRig({
  progress,
  reduced,
}: {
  progress: RefObject<number>;
  reduced: boolean;
}) {
  const { camera, pointer } = useThree();
  const pos = useRef(new THREE.Vector3(...KEYS[0].pos));
  const tgt = useRef(new THREE.Vector3(...KEYS[0].target));
  const a = useRef(new THREE.Vector3());
  const b = useRef(new THREE.Vector3());
  const at = useRef(new THREE.Vector3());
  const bt = useRef(new THREE.Vector3());
  const wantPos = useRef(new THREE.Vector3());
  const wantTgt = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const p = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    const seg = p * (KEYS.length - 1);
    const i = Math.min(Math.floor(seg), KEYS.length - 2);
    const f = smooth(seg - i);

    a.current.set(...KEYS[i].pos);
    b.current.set(...KEYS[i + 1].pos);
    at.current.set(...KEYS[i].target);
    bt.current.set(...KEYS[i + 1].target);
    wantPos.current.lerpVectors(a.current, b.current, f);
    wantTgt.current.lerpVectors(at.current, bt.current, f);

    // Subtle mouse parallax on top of the scroll-driven position.
    const amp = reduced ? 0 : 0.5;
    wantPos.current.x += pointer.x * amp;
    wantPos.current.y += pointer.y * amp * 0.4;

    // Frame-rate independent damping (snap when reduced motion is requested).
    const alpha = reduced ? 1 : 1 - Math.exp(-6 * dt);
    pos.current.lerp(wantPos.current, alpha);
    tgt.current.lerp(wantTgt.current, alpha);
    camera.position.copy(pos.current);
    camera.lookAt(tgt.current);
  });

  return null;
}
