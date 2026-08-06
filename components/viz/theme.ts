// Chart tokens for the subpage figures.
//
// These are NOT the same values as ACCENTS in components/desk/palette.ts, and
// the difference is deliberate. The deck accents were brightened for the 3D
// scene and sit at OKLCH L ≈ 0.71–0.76 — above the 0.48–0.67 band a mark needs
// to hold its chroma on a dark surface. Each series below is the same hue
// snapped down to the top of that band, so charts read as the same palette
// without the marks blooming.
//
// Validated as a set against the card surface (#171a23 = the page bg #10131c
// under bg-white/[0.03]) with the dataviz validator, dark mode:
//   research pair  #808fdb + #c37f29 — CVD ΔE 23.7, normal-vision 23.6
//   markets pair   #0daf80 + #c37f29 — CVD ΔE  9.7, normal-vision 20.1
//   all three, all-pairs             — CVD ΔE  9.7, normal-vision 20.1
// Lightness band, chroma floor and 3:1 contrast pass for all three in every
// combination. Re-run the validator if any of these change.

export const VIZ = {
  /** Categorical slot 1 — indigo. Research primary. Contrast 5.68:1. */
  s1: "#808fdb",
  /** Categorical slot 2 — marigold. Second series anywhere. Contrast 5.29:1. */
  s2: "#c37f29",
  /** Categorical slot 3 — green. Markets primary. Contrast 6.17:1. */
  s3: "#0daf80",
  /**
   * De-emphasis gray for context marks (benchmark lines, unranked dots). Below
   * the chroma floor on purpose: it is not doing identity work, so it always
   * ships with a direct label rather than relying on hue.
   */
  muted: "#8b8fa3",

  /** Chart chrome, all on the dark card surface. */
  surface: "#171a23",
  grid: "rgba(255,255,255,0.07)",
  axis: "rgba(255,255,255,0.18)",
  /** Axis ticks and units. neutral-400 — 6.78:1. */
  ink: "#a1a1aa",
  /** Series labels and readouts. neutral-200. */
  inkStrong: "#e5e7eb",
} as const;

/**
 * Verdict styling for the specification ladder. Never color-alone: every use
 * prints `word` beside the swatch.
 *
 * `word` is deliberately blunt rather than clever. "Found something" is true of
 * all four signal rows including the placebo test — which found significant
 * breaks in six countries that changed no tax rate, and is therefore bad news
 * for the thesis even though the test rejected its null. A verdict label that
 * implied "supports the argument" would be wrong on exactly that row, which is
 * the row the page most needs to report straight. `technical` carries the
 * notation for a reader who wants it.
 */
export const VERDICT = {
  signal: {
    color: VIZ.s3,
    word: "Found something",
    technical: "rejects the null",
    mark: "●",
  },
  null: {
    color: VIZ.muted,
    word: "Found nothing",
    technical: "cannot reject the null",
    mark: "○",
  },
} as const;
