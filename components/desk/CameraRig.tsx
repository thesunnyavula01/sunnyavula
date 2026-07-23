"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

// Camera path through the five stops. Stop 0 is the aerial overview of the
// whole island; 1..4 park on each desk object (same order as `sections`),
// swinging AROUND the desk — left end, front, front-right, right end — so the
// tour travels around the island. Targets sit slightly LEFT of each object so
// the object renders right-of-center, clear of the copy card.
type Key = { pos: [number, number, number]; target: [number, number, number] };

export const KEYS: Key[] = [
  { pos: [1.0, 8.6, 10.2], target: [-1.3, -0.9, 0] }, // island overview
  { pos: [-4.7, 2.5, 3.1], target: [-3.95, 0.15, -0.5] }, // papers, from the left
  { pos: [-0.5, 2.3, 3.6], target: [-1.65, 0.4, 0.3] }, // laptop, from the front
  { pos: [2.9, 2.7, 2.7], target: [0.85, 0.8, -0.8] }, // monitor, front-right
  { pos: [4.7, 2.2, 2.9], target: [2.55, 0.3, 0.3] }, // gavel + mic, right end
];

export const STOP_COUNT = KEYS.length;

// Drag-to-look-around state, written by DeskScene's pointer handlers.
export type OrbitState = { angle: number; pitch: number; dragging: boolean };

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

const UP = new THREE.Vector3(0, 1, 0);

// `stop` holds the TARGET stop index (0..4); the rig glides toward it along a
// catmull-rom path with damped easing, then applies the user's drag-orbit
// (azimuth + pitch around the current target) and a soft pointer parallax.
export function CameraRig({
  stop,
  orbit,
  reduced,
}: {
  stop: RefObject<number>;
  orbit: RefObject<OrbitState>;
  reduced: boolean;
}) {
  const { camera, pointer } = useThree();
  const p = useRef(0);
  const orbCur = useRef(0);
  const pitCur = useRef(0);
  const par = useRef(new THREE.Vector3());
  const wantPos = useRef(new THREE.Vector3());
  const wantTgt = useRef(new THREE.Vector3());
  const off = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const tmp = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const t =
      THREE.MathUtils.clamp(stop.current ?? 0, 0, STOP_COUNT - 1) /
      (STOP_COUNT - 1);
    const alpha = reduced ? 1 : 1 - Math.exp(-3 * dt);
    p.current += (t - p.current) * alpha;

    posCurve.getPoint(p.current, wantPos.current);
    tgtCurve.getPoint(p.current, wantTgt.current);

    // drag-orbit: released drags ease back home; motion is damped either way
    const o = orbit.current;
    if (o && !reduced) {
      if (!o.dragging) {
        const decay = Math.exp(-1.1 * dt);
        o.angle *= decay;
        o.pitch *= decay;
      }
      const oAlpha = 1 - Math.exp(-7 * dt);
      orbCur.current += (o.angle - orbCur.current) * oAlpha;
      pitCur.current += (o.pitch - pitCur.current) * oAlpha;
    } else {
      orbCur.current = 0;
      pitCur.current = 0;
    }

    off.current.copy(wantPos.current).sub(wantTgt.current);
    off.current.applyAxisAngle(UP, orbCur.current);
    right.current.crossVectors(UP, off.current).normalize();
    off.current.applyAxisAngle(right.current, pitCur.current);

    const amp = reduced ? 0 : 1;
    tmp.current.set(pointer.x * 0.35 * amp, pointer.y * 0.18 * amp, 0);
    par.current.lerp(tmp.current, 1 - Math.exp(-4 * dt));

    camera.position
      .copy(wantTgt.current)
      .add(off.current)
      .add(par.current);
    camera.lookAt(wantTgt.current);
  });

  return null;
}
