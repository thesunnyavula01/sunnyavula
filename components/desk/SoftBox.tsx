"use client";

import { RoundedBox } from "@react-three/drei";
import type { ComponentProps } from "react";

// drei's <RoundedBox> is not a box: it builds a Shape, extrudes it with bevels
// (it doubles `bevelSegments` internally) and then runs toCreasedNormals over
// the result — per instance, on the main thread, at mount. The scene has ~29
// of them, and at the default smoothness=4/bevelSegments=4 that was one of the
// largest single blocks of startup CPU.
//
// At these prop sizes the extra segments are invisible, so everything goes
// through this cheaper profile. Props whose rounding cannot be read at all
// (paper sheets, the blotter, the trackpad) use a plain <boxGeometry> instead.
export function SoftBox(props: ComponentProps<typeof RoundedBox>) {
  return <RoundedBox smoothness={2} bevelSegments={2} {...props} />;
}
