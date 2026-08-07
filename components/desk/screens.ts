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

  // browser chrome: brand bar, traffic lights, URL pill
  p.rect(0, 0.925, 1.38, 0.11, P.brand);
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

/* --------------------------- Contact: phone screen -------------------------- */

// The phone lies flat like the paper sheet, so its local +y maps onto world −z:
// high y is the far end of the handset, which reads as the top of the frame.
export const PHONE_SCREEN = { w: 0.27, h: 0.58 } as const;

/** Handset glyph: a thick round-capped arc with fattened ear/mouth ends. */
function handset(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  rot: number,
  color: string
) {
  const r = s * 0.5;
  const a0 = Math.PI * 0.2;
  const a1 = Math.PI * 0.8;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = s * 0.24;
  ctx.beginPath();
  ctx.arc(0, -s * 0.16, r, a0, a1);
  ctx.stroke();
  for (const a of [a0, a1]) {
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r, -s * 0.16 + Math.sin(a) * r, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export const phoneScreenTexture = once(() => {
  const W = 320;
  const H = 688;
  const p = painter(W, H, -0.135, 0.135, -0.29, 0.29);
  const sx = W / PHONE_SCREEN.w;
  const sy = H / PHONE_SCREEN.h;
  const X = (x: number) => (x + 0.135) * sx;
  const Y = (y: number) => (0.29 - y) * sy;

  // lock-screen wallpaper, warmer toward the top
  const g = p.ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1c2238");
  g.addColorStop(0.55, "#111524");
  g.addColorStop(1, "#0c0f19");
  p.ctx.fillStyle = g;
  p.ctx.fillRect(0, 0, W, H);

  // earpiece slit + status bar (clock, signal bars, battery)
  p.rect(0, 0.272, 0.055, 0.007, "#232838");
  p.rect(-0.088, 0.253, 0.05, 0.013, "#c9d1e6");
  [0.006, 0.009, 0.012, 0.015].forEach((h, i) =>
    p.rect(0.05 + i * 0.011, 0.2455 + h / 2, 0.007, h, "#c9d1e6")
  );
  p.rect(0.106, 0.253, 0.026, 0.013, "#5c6784");
  p.rect(0.102, 0.253, 0.016, 0.008, "#c9d1e6");

  // "incoming call" kicker rule
  p.rect(0, 0.163, 0.078, 0.011, P.brand);

  // caller avatar: brand disc with a silhouette clipped inside it
  p.circle(0, 0.072, 0.058, "#2a1a2c");
  p.circle(0, 0.072, 0.052, P.brand);
  p.ctx.save();
  p.ctx.beginPath();
  p.ctx.ellipse(X(0), Y(0.072), 0.052 * sx, 0.052 * sy, 0, 0, Math.PI * 2);
  p.ctx.clip();
  p.ctx.fillStyle = "#f6e9ef";
  p.ctx.beginPath();
  p.ctx.ellipse(X(0), Y(0.088), 0.018 * sx, 0.018 * sy, 0, 0, Math.PI * 2);
  p.ctx.fill();
  p.ctx.beginPath();
  p.ctx.ellipse(X(0), Y(0.008), 0.036 * sx, 0.062 * sy, 0, 0, Math.PI * 2);
  p.ctx.fill();
  p.ctx.restore();

  // caller name + subtitle
  p.rect(0, -0.012, 0.14, 0.019, "#e9edf7");
  p.rect(0, -0.042, 0.088, 0.012, "#69749a");

  // secondary actions: remind me / message
  for (const x of [-0.052, 0.052]) {
    p.circle(x, -0.116, 0.021, "#232a3f");
    p.rect(x, -0.116, 0.017, 0.004, "#7f8bb0");
  }

  // the two call buttons
  p.circle(-0.062, -0.194, 0.032, P.green);
  p.circle(0.062, -0.194, 0.032, P.red);
  handset(p.ctx, X(-0.062), Y(-0.194), 0.03 * sx, Math.PI * 0.78, "#ffffff");
  handset(p.ctx, X(0.062), Y(-0.194), 0.03 * sx, -0.3, "#ffffff");

  // home indicator
  p.rect(0, -0.262, 0.084, 0.007, "#3a4258");

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

// The figure at the foot of the page. Bars are a fraction of the plot height.
const FIG = { ax: -0.345, base: -0.42, top: -0.06, x0: -0.3, step: 0.075, w: 0.052 };
const FIG_BARS = [0.2, 0.29, 0.24, 0.46, 0.63, 0.88];

// Column that runs beside the figure, so the lower half is not half-empty.
const FIG_ASIDE: [number, number][] = [
  [-0.075, 0.22],
  [-0.15, 0.18],
  [-0.225, 0.22],
  [-0.3, 0.14],
];

export const paperPrintTexture = once(() => {
  // transparent: only the marks are drawn, so the lit sheet underneath still
  // provides the paper colour and shading
  const W = 384;
  const H = 529;
  const p = painter(W, H, -0.45, 0.45, -0.62, 0.62);
  const sx = W / 0.9;
  const sy = H / 1.24;
  const X = (x: number) => (x + 0.45) * sx;
  const Y = (y: number) => (0.62 - y) * sy;

  // title + brand rule
  p.rect(-0.14, 0.54, 0.56, 0.036, "#2e2a22");
  p.rect(-0.02, 0.475, 0.8, 0.008, P.brand);

  // two-column body text
  PAGE_COLUMNS.forEach((row, r) => {
    for (const [x, w] of row) p.rect(x + w / 2, 0.4 - r * 0.075, w, 0.016, P.ink);
  });

  // The figure is PRINTED, not built from standing geometry. It used to be an
  // upright axis, three chunky bars and a trend line that was a plane standing
  // on edge: at the close camera stops the bars read as toy blocks left on a
  // sheet of paper, the trend line as a stray orange stick floating clear of
  // them, and whatever else lay on the page (the pen) collided with all four.
  // Flat art on a flat surface is the same rule the rest of this file follows.
  const { ax, base, top, x0, step, w } = FIG;
  const span = top - base;
  const cx = (i: number) => x0 + i * step;

  p.rect(ax, (base + top) / 2, 0.005, span, P.ink);
  p.rect(ax + 0.2375, base, 0.475, 0.005, P.ink);

  FIG_BARS.forEach((f, i) => {
    const h = f * span;
    p.rect(cx(i), base + h / 2, w, h, P.indigo);
  });

  // trend line over the bar tops, with a marker on each
  p.ctx.strokeStyle = P.marigold;
  p.ctx.lineWidth = 0.009 * sy;
  p.ctx.lineJoin = "round";
  p.ctx.lineCap = "round";
  p.ctx.beginPath();
  FIG_BARS.forEach((f, i) => {
    const y = Y(base + f * span + 0.02);
    if (i === 0) p.ctx.moveTo(X(cx(i)), y);
    else p.ctx.lineTo(X(cx(i)), y);
  });
  p.ctx.stroke();
  FIG_BARS.forEach((f, i) => p.circle(cx(i), base + f * span + 0.02, 0.011, P.marigold));

  // caption under the figure
  p.rect(ax + 0.21, -0.485, 0.42, 0.013, "#8d8578");
  p.rect(ax + 0.15, -0.517, 0.3, 0.013, "#8d8578");

  // text column beside the figure
  for (const [y, cw] of FIG_ASIDE) p.rect(0.16 + cw / 2, y, cw, 0.016, P.ink);

  return p.finish();
});
