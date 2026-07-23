// Tiny module-scope channel between <Hotspot> and DeskCanvas's shadow
// scheduler, so Hotspot doesn't have to import DeskCanvas (which would be a
// cycle) just to say "something moved".
//
// The directional shadow map is baked once and then frozen: the scene is
// static apart from the idle float bob (too small to matter) and the hover
// lift, so re-rendering the whole depth pass every frame roughly doubled the
// per-frame draw calls for nothing. Hover pokes it back on for the length of
// the lift animation.

let dirtyUntil = 0;

/** Re-arm shadow-map updates for `ms` (default: the hover lift animation). */
export function pokeShadows(ms = 600) {
  dirtyUntil = Math.max(dirtyUntil, performance.now() + ms);
}

export function shadowsDirty() {
  return performance.now() < dirtyUntil;
}
