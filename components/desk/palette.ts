// Shared palette for the desk scene + landing UI.
// Dark, moody study at night: deep navy world, warm lamp-lit desk, petrol-teal
// brand accent, indigo/sage/marigold/terracotta props — every 3D material and
// hover accent reads from here so the scene stays coherent.
//
// The brand accent is the walnut desk's COMPLEMENT (teal against warm wood),
// which is why it can be this saturated without fighting the scene. It was a
// berry pink through 2026-08-06; nothing here is named for a fruit any more,
// so a stray `berry` in a diff is stale code, not a variant.

export const PALETTE = {
  bg: "#10131c",
  bgDeep: "#0a0c12",
  bgGlow: "#1a1f2e",
  floor: "#252a3b",
  wood: "#9c6b3e",
  woodEdge: "#6e4a28",
  blotter: "#3c4770",
  paper: "#faf7f0",
  ink: "#4a453b",
  brand: "#1d7f92",
  brandLight: "#3fbfd4",
  coral: "#e8785a",
  indigo: "#4a5688",
  indigoLight: "#8b9be8",
  navy: "#141a2e",
  sage: "#7fa576",
  sageDark: "#5f8459",
  moss: "#4e6b48",
  terracotta: "#c96f4a",
  marigold: "#e8a04c",
  blush: "#f3c5b6",
  charcoal: "#33363f",
  slate: "#494d59",
  silver: "#e9e3d8",
  walnut: "#7a4a26",
  walnutLight: "#a2703f",
  brass: "#d4a94e",
  green: "#2fbf8f",
  red: "#ff6b5e",
} as const;

// Per-section accent, indexed like `sections`:
// research, att-agency, markets, leadership.
// Brightened variants so kickers/rings/CTAs pop against the dark backdrop.
//
// These four sit next to each other in the deck's index strip and in the
// landing legend, so they are chosen for HUE SEPARATION, not just for looking
// nice alone: indigo 232° / coral 14° / green 160° / marigold 36°. The brand
// teal (190°) is deliberately not in this set — it marks the two stops that
// are not sections (Home and Contact), so it has to stay distinct from all
// four. Check the spacing before swapping any of them.
export const ACCENTS = [
  PALETTE.indigoLight,
  PALETTE.coral,
  PALETTE.green,
  PALETTE.marigold,
] as const;
