"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

// Camera path through the six stops. Stop 0 is the aerial overview of the
// whole island; 1..4 park on each desk object (same order as `sections`),
// swinging AROUND the desk — left end, front, front-right, right end — so the
// tour travels around the island. Stop 5 closes on the phone lying at the near
// right corner of the desk (Desk.tsx: `<Phone position={[2.65, 0, 1.5]} />`)
// and carries the contact card; the phone is deliberately NOT a hotspot, since
// contact is a slide on this page, not a route. Targets sit slightly LEFT of
// each object so the object renders right-of-center, clear of the copy card.
type Key = { pos: [number, number, number]; target: [number, number, number] };

export const KEYS: Key[] = [
  { pos: [1.0, 8.6, 10.2], target: [-1.3, -0.9, 0] }, // island overview
  { pos: [-4.7, 2.5, 3.1], target: [-3.95, 0.15, -0.5] }, // papers, from the left
  { pos: [-0.5, 2.3, 3.6], target: [-1.65, 0.4, 0.3] }, // laptop, from the front
  // monitor, front-right — moved back with the monitor (POSITIONS[2] z -0.8 →
  // -1.6); pos keeps the old target→camera offset [2.05, 1.9, 3.5] so the
  // framing of the screen is unchanged.
  { pos: [2.9, 2.7, 1.9], target: [0.85, 0.8, -1.6] },
  { pos: [4.7, 2.2, 2.9], target: [2.55, 0.3, 0.3] }, // gavel + mic, right end
  { pos: [3.15, 1.55, 3.4], target: [2.1, 0.1, 1.4] }, // phone, near corner — contact
];

export const STOP_COUNT = KEYS.length;

/* ----------------------------- portrait framing ----------------------------- */

// KEYS above are hand-tuned for the DESKTOP canvas: a wide viewport whose left
// third is covered by the copy card, which is why every target sits ~0.75 world
// units LEFT of its object (so the object lands right-of-center, clear of the
// card). A phone canvas is roughly square-to-portrait and stacks the copy card
// BELOW the desk instead, so replaying those keys unchanged would crop the
// subject horizontally and shove it toward the right edge.
//
// `compact` re-frames without a second set of keyframes:
//   * the vertical fov widens as the canvas narrows, so the same HORIZONTAL
//     slice of the world stays in frame — clamped at MAX_FOV, past which the
//     perspective goes fish-eye, with the remainder made up by dollying back;
//   * the whole shot pans right by COMPACT_PAN, cancelling the copy-card
//     offset so the object lands centered.
const BASE_FOV = 35; // matches the <Canvas camera> fov in DeskCanvas
const REF_ASPECT = 1.6; // the desktop canvas KEYS were framed against
const MAX_FOV = 60;

// tan of half the desktop HORIZONTAL fov — the quantity held constant.
const REF_TAN_HALF_H =
  Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * REF_ASPECT;
const MAX_HALF_FOV = THREE.MathUtils.degToRad(MAX_FOV / 2);

// Per-stop zoom, applied on top of the fov/dolly fit. Everything is a little
// tighter than desktop because the shot no longer has to leave a third of the
// frame free for the copy card. The last stop is tighter still: the phone is
// the smallest object on the desk and lies flat, so at the shared zoom it read
// as a speck adrift in bare wood.
const COMPACT_ZOOM = [0.92, 0.92, 0.92, 0.92, 0.92, 0.7];

// How far to pan each stop right (world units along the camera's own right
// vector) to undo the copy-card offset. Not one constant: every target is a
// flat ~0.75 world units left of its object, but the stops view the desk from
// different azimuths and distances, so the same world offset projects to a
// different fraction of the screen at each one. These are that projection —
// (object − target) · right, with the object positions from POSITIONS in
// DeskCanvas — which lands each subject on the centre line.
const COMPACT_PAN = [0.75, 0.76, 0.69, 0.6, 0.48, 0.44];

// Vertical trim, same units, along the camera's up vector. Positive pushes the
// subject DOWN in frame. Portrait sees far more vertically than the wide
// desktop canvas does, and the phone at the last stop is small and lies flat,
// so it otherwise sinks into a large empty foreground.
const COMPACT_LIFT = [0, 0, 0, 0, 0, -0.5];

const lerpAt = (table: number[], u: number) => {
  const x = THREE.MathUtils.clamp(u, 0, 1) * (table.length - 1);
  const i = Math.min(Math.floor(x), table.length - 2);
  return THREE.MathUtils.lerp(table[i], table[i + 1], x - i);
};

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

// `stop` holds the TARGET stop index (0..5); the rig glides toward it along a
// catmull-rom path with damped easing, then applies the user's drag-orbit
// (azimuth + pitch around the current target) and a soft pointer parallax.
export function CameraRig({
  stop,
  orbit,
  reduced,
  compact = false,
}: {
  stop: RefObject<number>;
  orbit: RefObject<OrbitState>;
  reduced: boolean;
  compact?: boolean; // phone layout: portrait canvas, copy card stacked below
}) {
  const { camera, pointer, size } = useThree();
  const p = useRef(0);
  const orbCur = useRef(0);
  const pitCur = useRef(0);
  const par = useRef(new THREE.Vector3());
  const wantPos = useRef(new THREE.Vector3());
  const wantTgt = useRef(new THREE.Vector3());
  const off = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3());
  const tmp = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const t =
      THREE.MathUtils.clamp(stop.current ?? 0, 0, STOP_COUNT - 1) /
      (STOP_COUNT - 1);
    const alpha = reduced ? 1 : 1 - Math.exp(-3 * dt);
    p.current += (t - p.current) * alpha;

    posCurve.getPoint(p.current, wantPos.current);
    tgtCurve.getPoint(p.current, wantTgt.current);

    // Portrait re-framing. `compact` is false on desktop, so this whole branch
    // is dead there and the fov stays exactly as <Canvas> declared it.
    const cam = camera as THREE.PerspectiveCamera;
    let dolly = 1;
    if (compact) {
      const aspect = size.width / Math.max(1, size.height);
      const wantHalf = Math.atan(REF_TAN_HALF_H / aspect);
      const half = Math.min(wantHalf, MAX_HALF_FOV);
      const fov = THREE.MathUtils.radToDeg(half) * 2;
      if (Math.abs(cam.fov - fov) > 0.05) {
        cam.fov = fov;
        cam.updateProjectionMatrix();
      }
      // Whatever widening the clamp refused, buy with distance instead.
      dolly =
        (Math.tan(wantHalf) / Math.tan(half)) * lerpAt(COMPACT_ZOOM, p.current);
    } else if (cam.fov !== BASE_FOV) {
      // Only reachable by dragging a desktop window across the breakpoint.
      cam.fov = BASE_FOV;
      cam.updateProjectionMatrix();
    }

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

    if (compact) {
      off.current.multiplyScalar(dolly);
      // Pan the shot — target AND camera move together, so the view direction
      // is untouched — along the camera's own right/up axes, which keeps the
      // correction reading as "shift on screen" at every stop's azimuth.
      up.current.crossVectors(off.current, right.current).normalize();
      wantTgt.current
        .addScaledVector(right.current, lerpAt(COMPACT_PAN, p.current))
        .addScaledVector(up.current, lerpAt(COMPACT_LIFT, p.current));
    }

    // Pointer parallax is a mouse affordance. On a phone the only pointer is
    // the swiping finger, so it would just make the desk lurch mid-gesture.
    const amp = reduced || compact ? 0 : 1;
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
