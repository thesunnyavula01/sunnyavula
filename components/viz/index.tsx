"use client";

import type { ComponentType } from "react";
import type { VisualKey } from "@/content/sections";
import { AttributionSlider } from "./AttributionSlider";
import { ClubLadder } from "./ClubLadder";
import { CompoundingCurve } from "./CompoundingCurve";
import { DistributionShift } from "./DistributionShift";
import { FireControl } from "./FireControl";
import { FormulaStages } from "./FormulaStages";
import { PlaceboRange } from "./PlaceboRange";
import { SpecLadder } from "./SpecLadder";
import { TrendFlip } from "./TrendFlip";

/**
 * Registry of the figures a narrative block can attach to itself. Copy stays in
 * content/sections.ts (which only names a key) and the components stay out of
 * it, per the "all section copy comes from content/sections.ts" convention.
 *
 * Typed as a TOTAL map over VisualKey on purpose: adding a key to the union in
 * content/sections.ts fails the build here until its component is wired up.
 */
export const VISUALS: Record<VisualKey, ComponentType> = {
  "trend-flip": TrendFlip,
  "distribution-shift": DistributionShift,
  "spec-ladder": SpecLadder,
  attribution: AttributionSlider,
  "placebo-range": PlaceboRange,
  "fire-control": FireControl,
  compounding: CompoundingCurve,
  "formula-stages": FormulaStages,
  "club-ladder": ClubLadder,
};

export function Visual({ name }: { name: VisualKey }) {
  const C = VISUALS[name];
  return C ? <C /> : null;
}
