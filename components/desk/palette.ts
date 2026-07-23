// Shared clay-render palette for the desk scene + landing UI.
// Warm cream world, berry accent, indigo/sage/marigold/terracotta props —
// every 3D material and hover accent reads from here so the scene stays coherent.

export const PALETTE = {
  bg: "#f4ede1",
  wood: "#d3a06c",
  woodEdge: "#b9854f",
  blotter: "#46527f",
  paper: "#faf7f0",
  ink: "#4a453b",
  berry: "#b3265c",
  indigo: "#4a5688",
  navy: "#141a2e",
  sage: "#7fa576",
  sageDark: "#5f8459",
  terracotta: "#c96f4a",
  marigold: "#e8a04c",
  blush: "#f3c5b6",
  charcoal: "#33363f",
  slate: "#494d59",
  silver: "#e9e3d8",
  walnut: "#7a4a26",
  walnutLight: "#a2703f",
  green: "#2fbf8f",
  red: "#ff6b5e",
} as const;

// Per-section accent, indexed like `sections`:
// research, att-agency, markets, leadership.
export const ACCENTS = [
  PALETTE.indigo,
  PALETTE.berry,
  PALETTE.green,
  PALETTE.marigold,
] as const;
