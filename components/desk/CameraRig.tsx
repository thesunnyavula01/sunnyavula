"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

// Camera path through the five stops. Stop 0 is the aerial overview; 1..4 park
// on each desk object (same order as `sections`). Targets sit slightly LEFT of
// each object so the object renders right-of-center, clear of the copy card.
type Key = { pos: [number, number, number]; target: [number, number, number] };

export const KEYS: Key[] = [
  { pos: [0.4, 8.4, 8.6], target: [-0.9, -0.4, 0] }, // overview
  { pos: [-2.5, 2.5, 2.6], target: [-3.75, 0.25, -0.5] }, // papers
  { pos: [-0.2, 2.3, 3.4], target: [-1.55, 0.45, 0.3] }, // laptop
  { pos: [2.4, 2.5, 2.4], target: [0.95, 0.75, -0.85] }, // monitor
  { pos: [4.0, 2.4, 3.2], target: [2.65, 0.35, 0.35] }, // gavel + mic
];

export const STOP_COUNT = KEYS.length;

const posCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.pos)),
  false,
  "catmullrom",
  0.5
);
const tgtCurve = new THREE.CatmullRomCurve3(
  KEYS.map((k) => new THREE.Vector3(...k.target)),
  false,
  "catmullrom",
  0.5
);

// `stop` holds the TARGET stop index (0..4); the rig glides toward it along a
// catmull-rom path with critically-damped easing + a soft pointer parallax.
export function CameraRig({
  stop,
  reduced,
}: {
  stop: RefObject<number>;
  reduced: boolean;
}) {
  const { camera, pointer } = useThree();
  const p = useRef(0);
  const par = useRef(new THREE.Vector3());
  const wantPos = useRef(new THREE.Vector3());
  const wantTgt = useRef(new THREE.Vector3());
  const tmp = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const t =
      THREE.MathUtils.clamp(stop.current ?? 0, 0, STOP_COUNT - 1) /
      (STOP_COUNT - 1);
    const alpha = reduced ? 1 : 1 - Math.exp(-3 * dt);
    p.current += (t - p.current) * alpha;

    posCurve.getPoint(p.current, wantPos.current);
    tgtCurve.getPoint(p.current, wantTgt.current);

    const amp = reduced ? 0 : 1;
    tmp.current.set(pointer.x * 0.38 * amp, pointer.y * 0.2 * amp, 0);
    par.current.lerp(tmp.current, 1 - Math.exp(-4 * dt));

    camera.position.copy(wantPos.current).add(par.current);
    camera.lookAt(wantTgt.current);
  });

  return null;
}
