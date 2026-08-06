"use client";

import { ERTA_FIRE as F } from "@/content/figures";
import { ChartScroll, Figure } from "./Figure";
import { VIZ } from "./theme";

// Before → after on one item, so: dumbbell, one hue in two shades. The whole
// figure exists to show a sign flip, so the zero line is the anchor and both
// endpoints are direct-labelled with their p-value.
const W = 640, H = 128;
const PAD = { l: 20, r: 20 };
const DOMAIN = [-0.08, 0.04];
const Y = 62;

const px = (v: number) =>
  PAD.l + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (W - PAD.l - PAD.r);

export function FireControl() {
  const a = F.rateBefore.beta;
  const b = F.rateAfter.beta;

  return (
    <Figure
      title="Controlling for financialization flips the sign"
      subtitle="The coefficient on the top marginal rate in a single-country US regression, before and after adding the FIRE sector's share of GDP as a control. Without the control the rate looks irrelevant; with it, the rate is significant and negative — the financial sector's expansion had been carrying the effect."
      source={`FIRE share enters with β = ${F.fire.beta} (SE ${F.fire.se}, p ${F.fire.p}). HAC p-values throughout. From the paper's single-country specification.`}
    >
      <ChartScroll>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Coefficient on the top marginal rate moves from plus ${a}, not significant, to minus ${Math.abs(b)}, significant, once the FIRE share is controlled for.`}
        >
          {/* Zero line — the thing being crossed. */}
          <line
            x1={px(0)}
            x2={px(0)}
            y1={18}
            y2={H - 30}
            stroke={VIZ.axis}
            strokeWidth={1}
          />
          <text x={px(0)} y={14} textAnchor="middle" fontSize={9} fill={VIZ.ink}>
            0
          </text>

          {/* The connector. */}
          <line
            x1={px(a)}
            x2={px(b)}
            y1={Y}
            y2={Y}
            stroke={VIZ.s1}
            strokeWidth={2.5}
            opacity={0.4}
          />

          <circle cx={px(a)} cy={Y} r={6.5} fill={VIZ.muted} stroke={VIZ.surface} strokeWidth={2} />
          <circle cx={px(b)} cy={Y} r={7.5} fill={VIZ.s1} stroke={VIZ.surface} strokeWidth={2} />

          <text x={px(a)} y={Y - 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={VIZ.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
            +{a}
          </text>
          <text x={px(a)} y={Y + 22} textAnchor="middle" fontSize={9} fill={VIZ.ink}>
            no control · p = {F.rateBefore.p}
          </text>

          <text x={px(b)} y={Y - 16} textAnchor="middle" fontSize={11} fontWeight={700} fill={VIZ.s1} style={{ fontVariantNumeric: "tabular-nums" }}>
            {b}
          </text>
          <text x={px(b)} y={Y + 22} textAnchor="middle" fontSize={9} fill={VIZ.s1}>
            + FIRE control · p = {F.rateAfter.p}
          </text>

          {/* Zero is the middle of this axis, not its right end — label it there.
              Right of zero would mean a rate CUT lowers the top share, which is
              not a claim anyone makes, so that side gets no label. */}
          <text x={PAD.l} y={H - 6} fontSize={9} fill={VIZ.ink}>
            ← cutting the rate raises the top share
          </text>
          <text x={px(0)} y={H - 6} textAnchor="middle" fontSize={9} fill={VIZ.ink}>
            no relationship
          </text>
        </svg>
      </ChartScroll>
    </Figure>
  );
}
