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
// contact is a slide on this page, not a route.
//
// FRAMING IS SOLVED, NOT EYEBALLED — stops 1..5 were hand-placed and every one
// of them put its subject partly under the page chrome. The gavel was the worst
// (its projected box ran to y = 957 in an 800px viewport, i.e. the head and
// handle were off-screen and what remained sat in the bottom scrim), the laptop
// overflowed the right edge by 52px, and the phone sat 70px inside the scrim.
// The keys below place each subject inside a SAFE RECT measured against the
// chrome at 1280x800 — masthead 0..87, copy block x 0..640, credit y 673..688,
// index strip 743..800, bottom scrim from 688 — leaving
//
//     x 666..1235   y 108..652
//
// with each object's projected silhouette filling ~0.88 of it (0.78 papers,
// 0.70 phone — see below) and centred in it. Stops 1..4 KEEP their original
// viewing direction, so the tour's swing around the island is unchanged; only
// the distance and the aim moved, and three of the five distances barely moved
// at all — the defect was mostly aim, not zoom. Worst case over the
// pointer-parallax box (±0.35, ±0.18) and the island's ±0.05 idle bob still
// fits: the contact stop's swept union is 723,122 -> 1213,641.
//
// Fit against the SILHOUETTE (every mesh's own box, projected), not one AABB
// around the whole object: the gavel stop is a mic at one end and a gavel at
// the other with nothing between them, so its group box is half empty air and
// fitting that box pushes the camera back far enough to turn a close-up into a
// wide shot of the whole desk.
//
// Consequence worth stating: the targets no longer sit a flat ~0.75 left of
// their object — the offset is whatever centres the subject in that rect, which
// is why COMPACT_PAN below had to be re-derived rather than kept.
//
// THE CONTACT STOP was left out of that solve at 0.48 fill, on the grounds that
// it "already read at a good size". It did not: the phone is the smallest object
// on the desk, so 0.48 of the rect's WIDTH is 15% of its AREA — the frame was
// 85% bare wood. It is now fitted like the rest, and two things beyond distance
// were wrong with it:
//
//   * the old azimuth (27.5°) looked almost straight down the phone's long axis
//     — the slab is turned `ry 0.35`, i.e. 7.7° off that view — so the screen
//     was foreshortened to nearly a square and the silhouette was as small as it
//     could possibly be. Swinging to 22° and lifting to 38° lays the phone
//     DIAGONALLY across the frame, which is both readable and the shape that
//     fills a near-square rect. Measured over an elevation x azimuth sweep, the
//     phone's own projected top face goes from 14.8% of the safe rect to 33.9%.
//   * fill is capped at 0.70, not the 0.88 the other stops take, because the
//     island's idle bob (±0.05, plus ±0.014 from the two rocking rotations at
//     the phone's radius) is a FIXED WORLD offset: it projects to ±58px here
//     against ±18px at the gavel's distance. 0.88 would have the subject leaving
//     the safe rect on every breath.
type Key = { pos: [number, number, number]; target: [number, number, number] };

export const KEYS: Key[] = [
  // Overview — unchanged: the whole island is the subject, and it already sits
  // clear of the chrome.
  { pos: [1.0, 8.6, 10.2], target: [-1.3, -0.9, 0] },
  { pos: [-5.01, 2.35, 3.19], target: [-4.26, -0.01, -0.41] }, // papers, from the left
  { pos: [-0.48, 2.92, 5.07], target: [-2.07, 0.3, 0.51] }, // laptop, from the front
  { pos: [2.85, 2.7, 2.71], target: [0.66, 0.67, -1.04] }, // monitor, front-right
  { pos: [4.9, 2.33, 4.04], target: [2.58, 0.28, 1.24] }, // gavel + mic, right end
  { pos: [2.8, 0.83, 2.67], target: [2.38, -0.04, 1.63] }, // phone, near corner — contact
];

export const STOP_COUNT = KEYS.length;

/* ------------------------------ aspect framing ------------------------------ */

// KEYS above are solved for the DESKTOP canvas at REF_ASPECT: a wide viewport
// whose left third is covered by the copy block, which is why every target sits
// well LEFT of its object (so the object lands right-of-center, clear of the
// copy). Two things break that framing, and both are handled by holding the
// HORIZONTAL field the keys were framed against:
//
//   * any canvas NARROWER than REF_ASPECT crops the subject sideways. That is
//     always true on a phone, and also true of a portrait tablet or a short
//     narrow desktop window — which is why this is no longer gated on
//     `compact`. The vertical fov widens until the same horizontal slice is
//     back in frame, clamped at MAX_FOV (past which the perspective goes
//     fish-eye), with the remainder bought by dollying back.
//   * a WIDER canvas needs nothing: it keeps the authored vertical fov and
//     simply sees more to the sides, which is pure headroom.
//
// `compact` then adds what is specific to the stacked phone layout: the shot
// pans right by COMPACT_PAN, cancelling the copy-card offset so the object
// lands centered, and tightens by COMPACT_ZOOM.
const BASE_FOV = 35; // matches the <Canvas camera> fov in DeskCanvas
const REF_ASPECT = 1.6; // the desktop canvas KEYS were framed against
const MAX_FOV = 60;

// tan of half the desktop HORIZONTAL fov — the quantity held constant.
const REF_TAN_HALF_H =
  Math.tan(THREE.MathUtils.degToRad(BASE_FOV / 2)) * REF_ASPECT;
const BASE_HALF_FOV = THREE.MathUtils.degToRad(BASE_FOV / 2);
const MAX_HALF_FOV = THREE.MathUtils.degToRad(MAX_FOV / 2);

// Per-stop zoom, applied on top of the fov/dolly fit. Everything is a little
// tighter than desktop because the shot no longer has to leave a third of the
// frame free for the copy card. The last stop is tighter still: the phone is
// the smallest object on the desk and lies flat, so at the shared zoom it read
// as a speck adrift in bare wood.
//
// These are NOT one constant any more, and the spread is not a style choice:
// the framing solve moved the desktop camera by a different factor at every
// stop (papers 1.00x, laptop 1.38x, monitor 1.07x, gavel 1.08x), and the compact
// shot dollies off that same distance. Each entry is the old zoom divided by its
// stop's pull-back. Re-derive them the same way if a key moves again.
//
// The contact entry is NOT that arithmetic. Carrying it forward preserved a
// framing that was itself the defect: on a 375x420 desk stage the phone was
// 22% of the canvas WIDTH — 2.3% of its area. It is now solved for the stage
// the same way the desktop key is solved for the safe rect, and lands at
// 0.51x0.40 on a 375x812 phone and 0.51x0.60 on a 375x667 one.
const COMPACT_ZOOM = [0.92, 0.92, 0.67, 0.86, 0.85, 0.64];

// How far to pan each stop right (world units along the camera's own right
// vector) to undo the copy-card offset — which is what centres the subject on a
// canvas that has no copy beside it. Not one constant: the stops view the desk
// from different azimuths and distances, so the same world offset projects to a
// different fraction of the screen at each one. These are that projection —
// (object − target) · right, with the object positions from POSITIONS in
// DeskCanvas.
const COMPACT_PAN = [0.75, 1.04, 1.16, 1.05, 1.06, 0.3];

// Vertical trim, same units, along the camera's up vector. Positive pushes the
// subject DOWN in frame. Portrait sees far more vertically than the wide
// desktop canvas does, and the phone at the last stop is small and lies flat,
// so it otherwise sinks into a large empty foreground.
//
// Stops 0..4 take none: (object − target) · up is now +0.12..−0.59, i.e. the
// solved desktop keys already leave each subject near the centre line, which is
// where the portrait shot wants it.
//
// Stop 5's SIGN FLIPPED. It used to be −0.19, lifting the subject ~0.23 above
// centre — which was sized for a phone occupying a sixth of the stage. Now that
// it fills half of it, the thing to centre it against is not the stage but the
// part of the stage that is not under the masthead: that gradient is 86px of a
// 420px desk stage, i.e. a fifth of it, so dead centre puts the slab's top edge
// (121px, and 94 at the bottom of the island's bob) almost against it. +0.03
// pushes the subject down into the clear band. Measured at 375x812; on a 375x667
// the stage is only 275px tall and the top corner does pass under the fade —
// unavoidable at any size worth showing, and it is a scrim, not a bar.
const COMPACT_LIFT = [0, 0, 0, 0, 0, 0.03];

// Distance at which the pointer parallax runs at full amplitude; closer shots
// scale it down. 4.0 is just inside the closest of stops 0..4 (the gavel, at
// 4.17), so those five are untouched — see the note at the parallax below.
const PAR_REF = 4.0;

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

    // Aspect fit — see the note above KEYS. At REF_ASPECT and wider this is an
    // exact no-op: `wantHalf` collapses to BASE_HALF_FOV and `dolly` to 1, so
    // an ordinary desktop canvas renders from the keys untouched.
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const wantHalf = Math.max(Math.atan(REF_TAN_HALF_H / aspect), BASE_HALF_FOV);
    const half = Math.min(wantHalf, MAX_HALF_FOV);
    const fov = THREE.MathUtils.radToDeg(half) * 2;
    if (Math.abs(cam.fov - fov) > 0.05) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    // Whatever widening the clamp refused, buy with distance instead.
    let dolly = Math.tan(wantHalf) / Math.tan(half);
    if (compact) dolly *= lerpAt(COMPACT_ZOOM, p.current);

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

    off.current.multiplyScalar(dolly);
    if (compact) {
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
    //
    // It is a fixed WORLD offset, so what it costs in screen terms depends
    // entirely on how close the shot is: the same ±0.35 is a gentle drift at the
    // gavel (4.2 units out) and a ±15° heave at the contact stop (1.4 units), far
    // enough to carry the phone out of frame. Scaling by the shot's own distance
    // makes it a constant SCREEN nudge instead. PAR_REF sits just under the
    // closest of the other five stops, so every one of them still scales by
    // exactly 1 and only the contact close-up is damped.
    const amp =
      reduced || compact
        ? 0
        : Math.min(1, off.current.length() / PAR_REF);
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
