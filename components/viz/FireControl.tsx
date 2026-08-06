"use client";

import { ERTA_FIRE as F } from "@/content/figures";
import { ChartScroll, Figure } from "./Figure";
import { draw, fade, pop, useReveal } from "./motion";
import { VIZ } from "./theme";

// Before → after on one item, so: dumbbell, one hue in two shades. The whole
// figure exists to show a sign flip, so the zero line is the anchor and both
// endpoints are direct-labelled with their p-value.
const W = 640, H = 146;
const PAD = { l: 20, r: 20 };
const DOMAIN = [-0.08, 0.04];
const Y = 66;

const px = (v: number) =>
  PAD.l + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (W - PAD.l - PAD.r);

export function FireControl() {
  const { ref, shown, animate } = useReveal<SVGSVGElement>();
  const a = F.rateBefore.beta;
  const b = F.rateAfter.beta;

  return (
    <Figure
      accent={VIZ.s1}
      title="One missing control was hiding the whole effect"
      takeaway="Measured on its own, the top tax rate looks unrelated to what the top 1% take home. Add one thing the model was missing — how large finance, insurance and real estate had grown as a share of the economy — and the relationship appears, pointing the expected way. Finance had been absorbing the effect."
      subtitle={`The coefficient on the top marginal rate in a single-country US regression, before and after adding the FIRE sector's share of GDP as a control. It moves from +${a} (p = ${F.rateBefore.p}, ${F.rateBefore.label}) to ${b} (p = ${F.rateAfter.p}, ${F.rateAfter.label}).`}
      source={`FIRE share enters with β = ${F.fire.beta} (SE ${F.fire.se}, p ${F.fire.p}). HAC p-values throughout. From the paper's single-country specification. A coefficient here is how much the top 1% share moves for each one-point change in the top marginal rate; left of zero means cutting the rate raises the share.`}
    >
      <ChartScroll>
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Coefficient on the top marginal rate moves from plus ${a}, not significant, to minus ${Math.abs(b)}, significant, once the FIRE share is controlled for.`}
        >
          {/* Zero line — the thing being crossed. */}
          <g style={fade(shown, animate, 420, 0)}>
            <line
              x1={px(0)}
              x2={px(0)}
              y1={20}
              y2={H - 42}
              stroke={VIZ.axis}
              strokeWidth={1}
            />
            <text x={px(0)} y={15} textAnchor="middle" fontSize={9} fill={VIZ.ink}>
              0
            </text>
          </g>

          {/* The connector, drawn right-to-left so it travels the way the
              estimate does: from "no relationship" across zero to negative. */}
          <line
            x1={px(a)}
            x2={px(b)}
            y1={Y}
            y2={Y}
            stroke={VIZ.s1}
            strokeWidth={2.5}
            opacity={0.4}
            pathLength={1}
            style={draw(shown, animate, 700, 320)}
          />

          <circle
            cx={px(a)}
            cy={Y}
            r={6.5}
            fill={VIZ.muted}
            stroke={VIZ.surface}
            strokeWidth={2}
            style={pop(shown, animate, 380, 180)}
          />
          <circle
            cx={px(b)}
            cy={Y}
            r={7.5}
            fill={VIZ.s1}
            stroke={VIZ.surface}
            strokeWidth={2}
            style={pop(shown, animate, 420, 880)}
          />

          <g style={fade(shown, animate, 380, 240)}>
            <text
              x={px(a)}
              y={Y - 14}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={VIZ.muted}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              +{a}
            </text>
            <text x={px(a)} y={Y + 22} textAnchor="middle" fontSize={9} fill={VIZ.ink}>
              tax rate alone · p = {F.rateBefore.p}
            </text>
          </g>

          <g style={fade(shown, animate, 400, 960)}>
            <text
              x={px(b)}
              y={Y - 16}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={VIZ.s1}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {b}
            </text>
            <text x={px(b)} y={Y + 22} textAnchor="middle" fontSize={9} fill={VIZ.s1}>
              + finance&rsquo;s share of GDP · p = {F.rateAfter.p}
            </text>
          </g>

          {/* Zero is the middle of this axis, not its right end — label it there.
              Right of zero would mean a rate CUT lowers the top share, which is
              not a claim anyone makes, so that side gets no label. */}
          <g style={fade(shown, animate, 380, 420)}>
            <text x={PAD.l} y={H - 8} fontSize={9} fill={VIZ.ink}>
              ← cutting the rate raises the top 1% share
            </text>
            <text x={px(0)} y={H - 8} textAnchor="middle" fontSize={9} fill={VIZ.ink}>
              no relationship
            </text>
          </g>
        </svg>
      </ChartScroll>
    </Figure>
  );
}
