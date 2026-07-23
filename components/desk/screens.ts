import * as THREE from "three";
import { PALETTE as P } from "./palette";

// The flat artwork on three of the four hotspot objects — the laptop's website
// mock, the ticker's chart, and the printed research page — used to be built
// from ~95 individual planes/boxes, each with its own geometry, material and
// draw call, all created on the main thread while the user waited for the
// first frame.
//
// None of it has any depth: it is 2D art on a flat surface. So it is painted
// once into a canvas here and applied as a single map. Same picture, three
// meshes instead of ninety-five, and canvas2d fills are orders of magnitude
// cheaper than allocating a BufferGeometry + Material per rectangle.
//
// Coordinates below are the SAME local coordinates the meshes used, so the
// layout maps one-to-one against the old markup.

type Painter = {
  ctx: CanvasRenderingContext2D;
  /** Filled rect, centred on (x, y) like a <planeGeometry> was. */
  rect: (x: number, y: number, w: number, h: number, color: string) => void;
  circle: (x: number, y: number, r: number, color: string) => void;
  finish: () => THREE.Texture;
};

function painter(
  wPx: number,
  hPx: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): Painter {
  const c = document.createElement("canvas");
  c.width = wPx;
  c.height = hPx;
  const ctx = c.getContext("2d")!;
  const sx = wPx / (x1 - x0);
  const sy = hPx / (y1 - y0);
  // local +y is up; canvas +y is down
  const X = (x: number) => (x - x0) * sx;
  const Y = (y: number) => (y1 - y) * sy;

  return {
    ctx,
    rect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(X(x) - (w * sx) / 2, Y(y) - (h * sy) / 2, w * sx, h * sy);
    },
    circle(x, y, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(X(x), Y(y), r * sx, r * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    finish() {
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    },
  };
}

// One texture each, built on first use and shared for the life of the page.
function once<T>(make: () => T): () => T {
  let v: T | undefined;
  return () => (v ??= make());
}

/* ------------------------- ATT Agency: laptop screen ------------------------ */

// Plane is 1.38 × 0.9, centred at y = 0.53 inside the lid group.
export const LAPTOP_SCREEN = { w: 1.38, h: 0.9, y: 0.53 } as const;

// feature cards: [x centre, image-strip colour]
const MOCK_CARDS: [number, string][] = [
  [-0.45, P.sage],
  [0, P.marigold],
  [0.45, P.blush],
];

export const laptopScreenTexture = once(() => {
  const p = painter(1024, 668, -0.69, 0.69, 0.08, 0.98);

  p.ctx.fillStyle = "#fbf8f1";
  p.ctx.fillRect(0, 0, 1024, 668);

  // browser chrome: berry bar, traffic lights, URL pill
  p.rect(0, 0.925, 1.38, 0.11, P.berry);
  for (const x of [-0.62, -0.57, -0.52]) p.circle(x, 0.925, 0.013, "#fbf8f1");
  p.rect(0.02, 0.925, 0.52, 0.045, "#d24f80");

  // hero: headline, sub, CTA, art blobs
  p.rect(0, 0.73, 1.38, 0.28, P.indigo);
  p.rect(-0.28, 0.79, 0.56, 0.032, "#fbf8f1");
  p.rect(-0.36, 0.735, 0.4, 0.024, "#c9cfe6");
  p.rect(-0.47, 0.665, 0.18, 0.05, P.marigold);
  p.circle(0.44, 0.73, 0.095, P.blush);
  p.circle(0.5, 0.77, 0.045, P.marigold);

  // three feature cards: image strip + two text lines each
  for (const [x, c] of MOCK_CARDS) {
    p.rect(x, 0.4, 0.4, 0.32, "#f1ece0");
    p.rect(x, 0.485, 0.4, 0.15, c);
    p.rect(x - 0.045, 0.365, 0.29, 0.02, "#7a7466");
    p.rect(x - 0.085, 0.315, 0.21, 0.016, "#a8a191");
  }

  // footer
  p.rect(0, 0.135, 1.38, 0.11, P.navy);
  p.rect(-0.5, 0.135, 0.3, 0.018, "#4a5470");

  return p.finish();
});

/* --------------------------- Markets: ticker screen ------------------------- */

export const TICKER_SCREEN = { w: 1.6, h: 0.94 } as const;

type Candle = { x: number; h: number; y: number; up: boolean };
const CANDLES: Candle[] = [
  { x: -0.65, h: 0.16, y: -0.22, up: true },
  { x: -0.505, h: 0.22, y: -0.16, up: true },
  { x: -0.36, h: 0.14, y: -0.2, up: false },
  { x: -0.215, h: 0.26, y: -0.08, up: true },
  { x: -0.07, h: 0.18, y: -0.12, up: false },
  { x: 0.075, h: 0.3, y: 0.0, up: true },
  { x: 0.22, h: 0.2, y: -0.04, up: false },
  { x: 0.365, h: 0.34, y: 0.1, up: true },
  { x: 0.51, h: 0.26, y: 0.16, up: true },
  { x: 0.655, h: 0.4, y: 0.24, up: true },
];

export const tickerScreenTexture = once(() => {
  const W = 1024;
  const H = 602;
  const p = painter(W, H, -0.8, 0.8, -0.47, 0.47);
  const sx = W / 1.6;
  const sy = H / 0.94;
  const X = (x: number) => (x + 0.8) * sx;
  const Y = (y: number) => (0.47 - y) * sy;

  p.ctx.fillStyle = P.navy;
  p.ctx.fillRect(0, 0, W, H);

  // grid: horizontals + verticals + right-edge price ticks
  for (const y of [-0.26, 0, 0.26]) p.rect(0, y, 1.52, 0.005, "#242c48");
  for (const x of [-0.48, -0.16, 0.16, 0.48]) p.rect(x, 0, 0.004, 0.86, "#1d2440");
  for (const y of [-0.26, 0, 0.26, 0.38]) p.rect(0.735, y, 0.05, 0.01, "#3c4670");

  // legend chips + live price readout
  p.rect(-0.62, 0.38, 0.16, 0.05, P.green);
  p.rect(-0.44, 0.38, 0.12, 0.04, P.marigold);
  p.rect(0.52, 0.38, 0.2, 0.045, P.green);

  // volume bars along the bottom
  CANDLES.forEach((c, i) => {
    const h = 0.04 + (i % 4) * 0.02;
    p.rect(c.x, -0.4 + h / 2, 0.05, h, c.up ? "#1f6b52" : "#7c3a33");
  });

  // candles + wicks
  for (const c of CANDLES) {
    const color = c.up ? P.green : P.red;
    p.rect(c.x, c.y, 0.012, c.h + 0.14, color);
    p.rect(c.x, c.y, 0.072, c.h, color);
  }

  // moving-average polyline over the candle centres
  p.ctx.strokeStyle = P.marigold;
  p.ctx.lineWidth = 0.011 * sy;
  p.ctx.lineJoin = "round";
  p.ctx.beginPath();
  CANDLES.forEach((c, i) => {
    const x = X(c.x);
    const y = Y(c.y + 0.06);
    if (i === 0) p.ctx.moveTo(x, y);
    else p.ctx.lineTo(x, y);
  });
  p.ctx.stroke();

  return p.finish();
});

/* ------------------------- Research: printed top sheet ---------------------- */

// This one lies flat on the desk, so its second axis is world −z: a plane
// rotated −90° about X maps its local +y onto −z. Everything below is passed
// as (x, −z) so the same painter works.
export const PAPER_SHEET = { w: 0.9, d: 1.24 } as const;

// two-column body text: [x offset, width] pairs per row
const PAGE_COLUMNS: [number, number][][] = [
  [
    [-0.42, 0.34],
    [0.02, 0.36],
  ],
  [
    [-0.42, 0.3],
    [0.02, 0.32],
  ],
  [
    [-0.42, 0.36],
    [0.02, 0.28],
  ],
  [
    [-0.42, 0.26],
    [0.02, 0.34],
  ],
  [
    [-0.42, 0.32],
    [0.02, 0.2],
  ],
];

export const paperPrintTexture = once(() => {
  // transparent: only the marks are drawn, so the lit sheet underneath still
  // provides the paper colour and shading
  const p = painter(384, 529, -0.45, 0.45, -0.62, 0.62);

  // title + berry rule
  p.rect(-0.14, 0.54, 0.56, 0.036, "#2e2a22");
  p.rect(-0.02, 0.475, 0.8, 0.008, P.berry);

  // two-column body text
  PAGE_COLUMNS.forEach((row, r) => {
    for (const [x, w] of row) p.rect(x + w / 2, 0.4 - r * 0.075, w, 0.016, P.ink);
  });

  // horizontal axis of the little figure (the bars, upright axis and trend
  // line stay as real geometry — they stand up off the page)
  p.rect(0.3, -0.31, 0.34, 0.006, P.ink);

  return p.finish();
});
