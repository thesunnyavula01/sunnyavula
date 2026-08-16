"use client";

import { useMemo, type ReactNode } from "react";
import { Instance, Instances } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE as P } from "./palette";
import { SoftBox } from "./SoftBox";
import {
  PHONE_SCREEN,
  bookCoverTexture,
  pageEdgeTexture,
  phoneScreenTexture,
} from "./screens";

// The desk ISLAND — a floating chunk of study, sarastotey-style: a rounded
// floor slab carrying a legged desk, a chair, a rug, a floor plant, a lamp and
// small clutter. Desk TOP surface sits at y = 0 (hotspot objects stand on it);
// the floor top sits at FLOOR_TOP. Everything uses core-three materials only —
// no shader-chunk patching (see CLAUDE.md: PCSS broke every lit material).

export const FLOOR_TOP = -1.42;

// Top surface of the indigo blotter, and the footprint it covers on the desk
// top. Anything standing ON the mat must be placed at BLOTTER_TOP, not y = 0 —
// at y = 0 its base sits *inside* the mat and reads as sunk into it. Anything
// placed at y = 0 must stay clear of BLOTTER_X / BLOTTER_Z entirely.
export const BLOTTER_TOP = 0.05;
const BLOTTER_X: [number, number] = [-2.4, 2.0];
const BLOTTER_Z: [number, number] = [-0.6, 1.7];

/* --------------------------- procedural wood map --------------------------- */

function useWoodTexture() {
  return useMemo(() => {
    // 512×256 rather than 1024×512: the desk top is never seen closer than
    // ~2 units, so the extra 3/4 of a megapixel only cost fill time, upload
    // time and mipmap generation on the critical path.
    const W = 512;
    const H = 256;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;

    // deep walnut base — reads rich under the warm lamp key light
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#8a5a34");
    grad.addColorStop(0.5, "#9a683c");
    grad.addColorStop(1, "#855430");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // plank seams (four boards across the depth)
    for (let i = 1; i < 4; i++) {
      const y = i * (H / 4) + (Math.random() * 4 - 2);
      ctx.strokeStyle = "rgba(38,22,10,0.55)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(214,164,110,0.18)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y + 1);
      ctx.lineTo(W, y + 1);
      ctx.stroke();
    }

    // long grain streaks — same density per pixel as before, half the count
    // because the canvas is a quarter of the area
    for (let i = 0; i < 130; i++) {
      const y = Math.random() * H;
      const x = Math.random() * W - 100;
      const len = 80 + Math.random() * 300;
      const dark = Math.random() > 0.35;
      const r = dark ? 55 + Math.random() * 35 : 175 + Math.random() * 40;
      const g = dark ? 32 + Math.random() * 22 : 125 + Math.random() * 30;
      const b = dark ? 14 + Math.random() * 12 : 80 + Math.random() * 22;
      ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${
        0.06 + Math.random() * 0.12
      })`;
      ctx.lineWidth = 0.3 + Math.random() * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(
        x + len * 0.35,
        y + (Math.random() * 5 - 2.5),
        x + len * 0.7,
        y + (Math.random() * 5 - 2.5),
        x + len,
        y + (Math.random() * 7 - 3.5)
      );
      ctx.stroke();
    }

    // knots with grain flowing around them
    for (let i = 0; i < 5; i++) {
      const kx = 50 + Math.random() * (W - 100);
      const ky = 30 + Math.random() * (H - 60);
      for (let ring = 6; ring > 0; ring--) {
        ctx.strokeStyle = `rgba(52,30,14,${0.06 + ring * 0.03})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(kx, ky, ring * 3.5, ring * 1.7, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(40,22,10,0.5)";
      ctx.beginPath();
      ctx.ellipse(kx, ky, 2.2, 1.3, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

/* -------------------------------- furniture -------------------------------- */

function DeskTable() {
  const wood = useWoodTexture();
  return (
    <group>
      <SoftBox
        castShadow
        receiveShadow
        args={[9.4, 0.42, 5.2]}
        radius={0.1}
        smoothness={3}
        position={[0, -0.21, 0]}
      >
        <meshStandardMaterial map={wood} roughness={0.62} metalness={0.02} />
      </SoftBox>

      {/* legs down to the floor slab */}
      {(
        [
          [-4.35, -2.25],
          [4.35, -2.25],
          [-4.35, 2.25],
          [4.35, 2.25],
        ] as const
      ).map(([x, z]) => (
        <SoftBox
          key={`${x}${z}`}
          castShadow
          args={[0.26, 1.04, 0.26]}
          radius={0.04}
          position={[x, -0.92, z]}
        >
          <meshStandardMaterial color={P.woodEdge} roughness={0.7} />
        </SoftBox>
      ))}

      {/* indigo blotter under the laptop area — seen flat from above, so its
          2.5cm corner radius never reads; a plain box saves an extrude.
          Depth stops at z = -0.6 (was -1.125) so the monitor and its hover ring
          stand on bare wood BEHIND the mat: the ring is a flat annulus on the
          desk, and when the mat cut through it the circle read as broken. Top
          surface sits at y = 0.05 — Hotspot's ring clears that (see Hotspot). */}
      <mesh
        receiveShadow
        position={[
          (BLOTTER_X[0] + BLOTTER_X[1]) / 2,
          BLOTTER_TOP / 2,
          (BLOTTER_Z[0] + BLOTTER_Z[1]) / 2,
        ]}
      >
        <boxGeometry
          args={[
            BLOTTER_X[1] - BLOTTER_X[0],
            BLOTTER_TOP,
            BLOTTER_Z[1] - BLOTTER_Z[0],
          ]}
        />
        <meshStandardMaterial color={P.blotter} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Chair() {
  const armAngles = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2);
  return (
    <group position={[0.9, FLOOR_TOP, 3.0]} rotation={[0, -0.35, 0]}>
      {/* star base + casters */}
      {armAngles.map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <SoftBox castShadow args={[0.1, 0.07, 0.6]} radius={0.03} position={[0, 0.08, 0.28]}>
            <meshStandardMaterial color={P.charcoal} roughness={0.5} />
          </SoftBox>
          <mesh castShadow position={[0, 0.06, 0.54]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshStandardMaterial color={P.slate} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh castShadow position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.55, 12]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.45} metalness={0.4} />
      </mesh>
      {/* seat + backrest */}
      <SoftBox castShadow args={[0.88, 0.14, 0.82]} radius={0.06} smoothness={3} position={[0, 0.68, 0.02]}>
        <meshStandardMaterial color={P.brand} roughness={0.75} />
      </SoftBox>
      <SoftBox
        castShadow
        args={[0.82, 1.0, 0.13]}
        radius={0.06}
        smoothness={3}
        position={[0, 1.28, 0.42]}
        rotation={[0.1, 0, 0]}
      >
        <meshStandardMaterial color={P.brand} roughness={0.75} />
      </SoftBox>
    </group>
  );
}

function Rug() {
  return (
    <group position={[0.7, FLOOR_TOP, 1.7]}>
      <mesh receiveShadow position={[0, 0.018, 0]}>
        <cylinderGeometry args={[2.35, 2.35, 0.036, 36]} />
        <meshStandardMaterial color={P.moss} roughness={0.95} />
      </mesh>
      <mesh receiveShadow position={[0, 0.02, 0]} scale={[1, 0.5, 1]}>
        <torusGeometry args={[2.32, 0.05, 6, 40]} />
        <meshStandardMaterial color={P.brand} roughness={0.9} />
      </mesh>
    </group>
  );
}

// Stands beside the desk's left end, NOT through it. The foliage sits at world
// y -0.44..0.71, which straddles the desk slab's own -0.42..0 band, so the only
// thing keeping the leaves out of the desk is x clearance: the desk top starts
// at x = -4.7, and the widest leaf reaches `leaf.x + leaf.r` from the pot. At
// the old x of -5.0 three of the six leaves were buried in the desk top — the
// second one was centred at x -4.64, i.e. inside it. Keep
// `max(leaf.x + leaf.r) + POT_X <= -4.85`.
function FloorPlant() {
  const leaves: { p: [number, number, number]; r: number }[] = [
    { p: [0, 1.55, 0], r: 0.46 },
    { p: [0.3, 1.3, 0.12], r: 0.32 }, // reach 0.62 — the binding one
    { p: [-0.34, 1.35, -0.1], r: 0.35 },
    { p: [0.1, 1.25, 0.36], r: 0.3 },
    { p: [-0.12, 1.2, -0.38], r: 0.31 },
    { p: [0.05, 1.85, -0.05], r: 0.28 },
  ];
  // -5.5 is as far out as the pot can go: its 0.5 top radius plus the 0.05 rim
  // reaches x -6.04 against the floor slab's -6.1 edge.
  return (
    <group position={[-5.5, FLOOR_TOP, 0.9]}>
      <mesh castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.5, 0.38, 0.84, 20]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.84, 0]}>
        <torusGeometry args={[0.49, 0.05, 8, 24]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 8]} />
        <meshStandardMaterial color="#6b4a2c" roughness={0.8} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} castShadow position={l.p}>
          <sphereGeometry args={[l.r, 14, 10]} />
          <meshStandardMaterial color={i % 2 ? P.sageDark : P.sage} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Lamp() {
  return (
    <group position={[-4.0, 0, -1.75]}>
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.3, 0.34, 0.08, 18]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.18, 0.5, 0.1]} rotation={[0.06, 0, -0.42]}>
        <cylinderGeometry args={[0.035, 0.035, 0.95, 8]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} />
      </mesh>
      <mesh position={[0.38, 0.93, 0.14]}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <meshStandardMaterial color={P.slate} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.68, 0.86, 0.26]} rotation={[0.15, 0, 1.05]}>
        <cylinderGeometry args={[0.035, 0.035, 0.72, 8]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.5} />
      </mesh>
      {/* shade, pointing down over the desk */}
      <group position={[1.02, 0.72, 0.34]} rotation={[0.2, 0, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.32, 0.38, 16, 1, true]} />
          <meshStandardMaterial color={P.marigold} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial
            color="#ffe9b8"
            emissive="#ffc46b"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight
        position={[1.1, 0.55, 0.4]}
        intensity={2.2}
        distance={4.5}
        decay={2}
        color="#ffd9a0"
      />
    </group>
  );
}

function MiniKeyboard({ position }: { position: [number, number, number] }) {
  const keys: [number, number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      keys.push([-0.48 + c * 0.08, 0.045, -0.115 + r * 0.08]);
    }
  }
  return (
    <group position={position} rotation={[0, 0.07, 0]}>
      <SoftBox castShadow args={[1.12, 0.05, 0.44]} radius={0.02} position={[0, 0.025, 0.02]}>
        <meshStandardMaterial color={P.silver} roughness={0.55} metalness={0.25} />
      </SoftBox>
      <Instances limit={52} castShadow frustumCulled={false}>
        <boxGeometry args={[0.064, 0.018, 0.064]} />
        <meshStandardMaterial color={P.slate} roughness={0.85} />
        {keys.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>
      <mesh castShadow position={[0, 0.045, 0.155]}>
        <boxGeometry args={[0.38, 0.018, 0.064]} />
        <meshStandardMaterial color={P.slate} roughness={0.85} />
      </mesh>
    </group>
  );
}

function Mouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.25, 0]}>
      <mesh castShadow position={[0, 0.055, 0]} scale={[1, 0.62, 1.45]}>
        <sphereGeometry args={[0.09, 14, 10]} />
        <meshStandardMaterial color={P.charcoal} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ------------------------------- small clutter ------------------------------ */

// Half-profiles revolved by <latheGeometry>, as [radius, height] pairs. The mug
// runs up the OUTSIDE wall, over the lip, and back down the INSIDE to the
// interior floor, so one lathe yields a genuinely hollow vessel — real wall
// thickness, a rounded rim, and an interior with depth to it. The lathe's
// normals follow the profile tangent, so they point outward on the way up and
// inward on the way back down without any extra work.
//
// This matters most from the deck's aerial camera, which looks straight down
// INTO the mug: the old build was a solid cylinder with a dark disc laid over
// its top cap, so from above it read as a plug with a lid rather than as a cup
// with coffee in it. Same four draw calls as that version.
const MUG_PROFILE = (
  [
    [0, 0.012], // underside centre
    [0.128, 0.012], // foot
    [0.134, 0.024],
    [0.148, 0.182], // outer wall, gently flared
    [0.156, 0.334],
    [0.156, 0.348], // rim, outer face
    [0.148, 0.354], // over the lip
    [0.138, 0.348], // rim, inner face — 0.018 of ceramic across the top
    [0.132, 0.182], // inner wall
    [0.124, 0.054],
    [0.1, 0.038], // fillet into the interior floor
    [0, 0.034], // interior floor centre, 0.022 above the underside
  ] as const
).map(([r, h]) => new THREE.Vector2(r, h));

// Foot ring, up to the lip, then a shallow well. Its floor stops 0.002 short of
// the mug's underside so the two coincident discs cannot z-fight.
const SAUCER_PROFILE = (
  [
    [0, 0],
    [0.215, 0],
    [0.238, 0.006],
    [0.26, 0.024], // outer edge
    [0.246, 0.03], // over the lip
    [0.15, 0.016], // into the well
    [0.12, 0.014],
    [0, 0.01],
  ] as const
).map(([r, h]) => new THREE.Vector2(r, h));

function Mug({ position }: { position: [number, number, number] }) {
  return (
    // Handle turned broadside to the tour. The overview camera looks along
    // roughly (-0.33, -0.94), so this angle puts the handle's plane very nearly
    // perpendicular to the view and it reads as a loop; point it along that
    // axis instead and it collapses into a flat strip stuck to the cup. Its
    // 0.277 reach lands exactly on the saucer's 0.26 silhouette, so the mug's
    // footprint is unchanged and it still clears the laptop base by 0.06.
    <group position={position} rotation={[0, 0.35, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[SAUCER_PROFILE, 18]} />
        <meshStandardMaterial color={P.paper} roughness={0.45} metalness={0.04} />
      </mesh>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[MUG_PROFILE, 18]} />
        <meshStandardMaterial color={P.brand} roughness={0.38} metalness={0.04} />
      </mesh>
      {/* C-handle: a 4.3rad arc spun back by half of it, so the opening faces
          the body and both cut ends finish ~0.02 INSIDE the wall where they
          cannot be seen. A full torus read as a ring stuck on the side. */}
      <mesh castShadow position={[0.168, 0.2, 0]} rotation={[0, 0, -2.15]}>
        <torusGeometry args={[0.085, 0.024, 8, 16, 4.3]} />
        <meshStandardMaterial color={P.brand} roughness={0.38} metalness={0.04} />
      </mesh>
      {/* Coffee, sitting 0.04 below the rim so the inner wall above it reads as
          depth. Glossy and faintly metallic so it catches the lamp as a liquid
          surface instead of sitting there as flat brown paint. */}
      <mesh position={[0, 0.307, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.135, 18]} />
        <meshStandardMaterial color="#43301f" roughness={0.15} metalness={0.15} />
      </mesh>
    </group>
  );
}

function Succulent({ position }: { position: [number, number, number] }) {
  const leaves: { p: [number, number, number]; r: number }[] = [
    { p: [0, 0.52, 0], r: 0.2 },
    { p: [0.16, 0.44, 0.06], r: 0.15 },
    { p: [-0.15, 0.46, -0.04], r: 0.16 },
    { p: [0.04, 0.42, 0.16], r: 0.13 },
    { p: [-0.05, 0.4, -0.17], r: 0.14 },
  ];
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.32, 20]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.215, 0.03, 8, 24]} />
        <meshStandardMaterial color={P.terracotta} roughness={0.75} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} castShadow position={l.p}>
          <sphereGeometry args={[l.r, 14, 10]} />
          <meshStandardMaterial color={i % 2 ? P.sageDark : P.sage} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ----------------------------------- books ---------------------------------- */

// A book is not a coloured slab. It is a CASE — two boards joined by a spine —
// wrapped round a block of leaves that sits a few millimetres inside it on
// three sides. That inset (the "square"), the board thickness showing at the
// fore-edge, and the hinge groove beside the spine are most of what tells the
// eye "book" rather than "brick", and all three are silhouette, so they survive
// at the size these are seen at. The stack was two plain rounded boxes before,
// which from the papers stop — where it sits in the near foreground, closer to
// the camera than the subject — read as two painted bricks.
//
// THE CASE IS ONE EXTRUDED PROFILE, not a box per board. The profile is a C
// (bottom board, rounded spine, top board) whose cavity opens toward the
// fore-edge, so boards + spine + groove come out of a single shape and a single
// draw call, and the extrusion's end cap shows the book's CROSS-SECTION: board,
// recess, leaves, board. That cap is the head/tail face, which is exactly the
// face the papers-stop camera is looking at — the group's +z axis points almost
// straight at it (dot 0.97), while the fore-edge faces away.
//
// No bevel on the extrude, deliberately: `bevelSize` insets the profile in x-y,
// and the board is 0.014 thick with a groove cut into it, so a bevel big enough
// to see would pinch that region into self-intersecting geometry. A board this
// thin wants a sharp edge anyway.
type BookSpec = {
  w: number; // spine to fore-edge
  d: number; // head to tail
  t: number; // total thickness, boards included
  board: number; // cover board thickness
  square: number; // how far the cover overhangs the leaves on three sides
  /**
   * Spine radius as a fraction of half the thickness. 1 is a half-cylinder,
   * which at these thicknesses reads as a bolster strapped to the book rather
   * than as a spine — 0.55 leaves a flat face between two corner rolls, which
   * is both what a cased book looks like and what the groove needs to sit
   * beside. A perfect-bound paperback is flatter still.
   */
  round: number;
  /** Hinge groove: the quadratic reaches HALF this, so it is 2x the depth cut. */
  groove: number;
  cover: string;
  pages: string;
  roughness: number;
  /** Print a front cover. Only the top book's is ever seen. */
  art?: boolean;
};

const spineR = (b: BookSpec) =>
  Math.min(b.t / 2, Math.max(0.004, (b.t / 2) * b.round));
/** x of the cavity's back wall — where the leaves start, just clear of the spine. */
const cavityX = (b: BookSpec) => -b.w / 2 + spineR(b) + b.board;

function caseGeometry(b: BookSpec) {
  const w2 = b.w / 2;
  const t2 = b.t / 2;
  const r = spineR(b);
  const cav = cavityX(b);
  const gw = Math.min(b.w * 0.12, b.t * 0.45);

  const s = new THREE.Shape();
  s.moveTo(w2, -t2);
  if (b.groove > 0) {
    s.lineTo(cav + gw, -t2);
    s.quadraticCurveTo(cav + gw / 2, -t2 + b.groove, cav, -t2);
  }
  s.lineTo(-w2 + r, -t2);
  s.absarc(-w2 + r, -t2 + r, r, -Math.PI / 2, Math.PI, true);
  s.lineTo(-w2, t2 - r);
  s.absarc(-w2 + r, t2 - r, r, Math.PI, Math.PI / 2, true);
  if (b.groove > 0) {
    s.lineTo(cav, t2);
    s.quadraticCurveTo(cav + gw / 2, t2 - b.groove, cav + gw, t2);
  }
  s.lineTo(w2, t2);
  // back down the fore-edge and round the cavity the leaves sit in
  s.lineTo(w2, t2 - b.board);
  s.lineTo(cav, t2 - b.board);
  s.lineTo(cav, -t2 + b.board);
  s.lineTo(w2, -t2 + b.board);
  s.closePath();

  const g = new THREE.ExtrudeGeometry(s, {
    depth: b.d,
    bevelEnabled: false,
    curveSegments: 12,
  });
  g.translate(0, 0, -b.d / 2);
  return g;
}

function Book({
  spec,
  y,
  rot,
  offset,
  children,
}: {
  spec: BookSpec;
  y: number;
  rot: number;
  offset: [number, number];
  children?: ReactNode;
}) {
  const geo = useMemo(() => caseGeometry(spec), [spec]);
  const x0 = cavityX(spec);
  const x1 = spec.w / 2 - spec.square;
  return (
    <group position={[offset[0], y, offset[1]]} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow geometry={geo}>
        <meshStandardMaterial color={spec.cover} roughness={spec.roughness} />
      </mesh>
      {/* The leaves. 0.004 shy of the boards so the two cannot z-fight along
          the cavity, which is a seam the head-on camera looks straight down. */}
      <mesh position={[(x0 + x1) / 2, 0, 0]}>
        <boxGeometry
          args={[
            x1 - x0,
            spec.t - 2 * spec.board - 0.004,
            spec.d - 2 * spec.square,
          ]}
        />
        <meshStandardMaterial
          map={pageEdgeTexture()}
          color={spec.pages}
          roughness={0.95}
        />
      </mesh>
      {spec.art && (
        <mesh position={[0, spec.t / 2 + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[spec.w - 0.014, spec.d - 0.012]} />
          <meshStandardMaterial map={bookCoverTexture()} transparent roughness={0.5} />
        </mesh>
      )}
      {children}
    </group>
  );
}

// Bottom two are cloth-cased hardbacks; the top one is a slim perfect-bound
// paperback — boards a fifth as thick, a near-flat spine, no groove, and the
// leaves trimmed almost flush. Building it from the same profile with different
// numbers is what makes the stack read as three different books rather than
// three sizes of one.
//
// FOOTPRINT IS FIXED BY THE DESK, not by taste. The stack stands on bare wood
// at x -4.1 with the group turned -0.25, which puts the bottom book's far
// corner at world x -4.60 against a desk edge at -4.7 and the floor plant's
// widest leaf at -4.88. Nothing here may project further left than that: the
// two upper books are smaller and their own rotations are checked against it
// (book 2 reaches -4.57, book 3 -4.52).
const BOOK_STACK: { spec: BookSpec; rot: number; offset: [number, number] }[] = [
  {
    spec: {
      w: 0.88,
      d: 0.62,
      t: 0.125,
      board: 0.016,
      square: 0.018,
      round: 0.55,
      groove: 0.02,
      cover: P.indigo,
      pages: "#eadfc4", // the one aged block on the desk
      roughness: 0.85,
    },
    rot: 0,
    offset: [0, 0],
  },
  {
    spec: {
      w: 0.76,
      d: 0.53,
      t: 0.105,
      board: 0.015,
      square: 0.016,
      round: 0.55,
      groove: 0.018,
      cover: P.marigold,
      pages: "#fbf7ec",
      roughness: 0.82,
    },
    rot: 0.2,
    offset: [0.02, -0.015],
  },
  {
    spec: {
      w: 0.6,
      d: 0.42,
      t: 0.055,
      board: 0.003,
      square: 0.003,
      round: 0.4,
      groove: 0,
      cover: P.brand,
      pages: "#fbf7ec",
      roughness: 0.5, // laminated stock, so it takes a little of the lamp
      art: true,
    },
    rot: -0.15,
    offset: [-0.03, 0.03],
  },
];

// Each book rests on the one below, so the heights are derived rather than
// written down — a thickness change cannot leave a book floating.
let stackBase = 0;
const BOOK_Y = BOOK_STACK.map((b) => {
  const y = stackBase + b.spec.t / 2;
  stackBase += b.spec.t;
  return y;
});

function Books({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.25, 0]}>
      {BOOK_STACK.map((b, i) => (
        <Book key={i} spec={b.spec} y={BOOK_Y[i]} rot={b.rot} offset={b.offset}>
          {/* Bookmark in the bottom book. It sits at y 0.03 — inside the LEAVES,
              not on the cover — so it leaves through the gap between the boards
              (the cap is empty for |y| < 0.0485) and its buried end is occluded
              by the page block. That is what keeps it from reading as a stray
              stick lying on the book, which is how the old printed-figure trend
              line failed on the papers. */}
          {i === 0 && (
            <mesh castShadow position={[0.12, 0.03, 0.34]} rotation={[0, 0.18, 0]}>
              <boxGeometry args={[0.09, 0.0035, 0.16]} />
              <meshStandardMaterial color={P.terracotta} roughness={0.85} />
            </mesh>
          )}
        </Book>
      ))}
    </group>
  );
}

function PencilCup({ position }: { position: [number, number, number] }) {
  const pens: { color: string; rot: [number, number, number]; x: number }[] = [
    { color: P.charcoal, rot: [0.1, 0, 0.12], x: -0.03 },
    { color: P.brand, rot: [-0.08, 0, -0.14], x: 0.04 },
    { color: P.sageDark, rot: [0.04, 0, 0.02], x: 0 },
  ];
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.13, 0.11, 0.32, 18]} />
        <meshStandardMaterial color={P.marigold} roughness={0.7} />
      </mesh>
      {pens.map((pen, i) => (
        <mesh key={i} castShadow position={[pen.x, 0.38, 0]} rotation={pen.rot}>
          <cylinderGeometry args={[0.018, 0.018, 0.44, 8]} />
          <meshStandardMaterial color={pen.color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Phone({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.35, 0]}>
      <SoftBox castShadow args={[0.32, 0.035, 0.64]} radius={0.016} position={[0, 0.018, 0]}>
        <meshStandardMaterial color={P.charcoal} roughness={0.4} metalness={0.3} />
      </SoftBox>
      {/* volume rocker + power key, so the slab has a silhouette */}
      <mesh castShadow position={[-0.163, 0.02, -0.09]}>
        <boxGeometry args={[0.008, 0.014, 0.075]} />
        <meshStandardMaterial color={P.slate} roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.163, 0.02, -0.05]}>
        <boxGeometry args={[0.008, 0.014, 0.055]} />
        <meshStandardMaterial color={P.slate} roughness={0.35} metalness={0.5} />
      </mesh>

      {/* lock screen: incoming call, decline + accept buttons. Self-lit via the
          emissive map so it glows like a real screen in the dark study. */}
      <mesh position={[0, 0.037, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PHONE_SCREEN.w, PHONE_SCREEN.h]} />
        <meshStandardMaterial
          map={phoneScreenTexture()}
          emissiveMap={phoneScreenTexture()}
          emissive="#ffffff"
          emissiveIntensity={0.6}
          roughness={0.22}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function Bin() {
  return (
    <group position={[4.9, FLOOR_TOP, 1.9]}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.32, 0.25, 0.6, 18, 1, true]} />
        <meshStandardMaterial color={P.slate} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Crumpled paper that missed the bin. Pulled in from x 0.55: the bin is
          near-black against a near-black floor, so at that distance the bright
          paper read as a stray shape floating in the dark rather than as litter
          beside a bin. 0.115 clear of the bin wall, so it still reads as a miss. */}
      <mesh castShadow position={[0.42, 0.09, 0.2]}>
        <icosahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={P.paper} roughness={0.95} />
      </mesh>
    </group>
  );
}

/* --------------------------------- island ---------------------------------- */

export function Desk() {
  return (
    <group>
      {/* floor slab the whole study stands on */}
      <SoftBox
        castShadow
        receiveShadow
        args={[12.2, 0.55, 8.2]}
        radius={0.26}
        smoothness={3}
        position={[0, FLOOR_TOP - 0.275, 0]}
      >
        <meshStandardMaterial color={P.floor} roughness={0.85} />
      </SoftBox>

      <Rug />
      <DeskTable />
      <Chair />
      <FloorPlant />
      <Bin />

      {/* On the desk. Everything ON the mat is placed at BLOTTER_TOP; everything
          at y = 0 is clear of the mat's footprint in plan. */}
      <Lamp />
      {/* x pulled in so it stays on the blotter (right edge 2.0) rather than
          overhanging onto bare wood. y was 0.072 against a mat top that the old
          comment put at ~0.007 — the mat is 0.05 tall, so it was hovering. */}
      <MiniKeyboard position={[1.42, BLOTTER_TOP, 0.35]} />
      <Mouse position={[2.4, 0, 0.45]} />
      {/* Was [-2.0, 0, 1.55]: the saucer (y 0..0.03) sat below the mat's top and
          straddled its front edge, so it was half-swallowed by the mat. Now it
          stands ON the mat, pulled back inside the front edge (1.7) and kept
          clear of both the mat's left edge (-2.4) and the laptop base (-1.76). */}
      <Mug position={[-2.08, BLOTTER_TOP, 1.35]} />
      <Succulent position={[4.0, 0, -1.6]} />
      <Books position={[-4.1, 0, 1.5]} />
      {/* Stands squarely on the mat, so it was sunk 0.05 into it at y = 0. */}
      <PencilCup position={[0.62, BLOTTER_TOP, 1.5]} />
      <Phone position={[2.65, 0, 1.5]} />
    </group>
  );
}
