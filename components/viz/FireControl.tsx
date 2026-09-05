"use client";

import { ERTA_FIRE as F } from "@/content/figures";
import { ChartScroll, Figure, Readout, XTick } from "./Figure";
import { draw, fade, pop, useReveal } from "./motion";
import { VIZ } from "./theme";

// Before → after on one item, so: dumbbell, one hue in two shades. The whole
// figure exists to show a sign flip, so the zero line is the anchor and both
// endpoints are direct-labelled.
//
// Everything below zero on this axis was previously left to the reader: two
// bare coefficients and two bare p-values, on an axis with no ticks, no unit
// and only one of its two directions named. A reader who has never met a
// regression coefficient had nothing to hold on to. So the axis now says what
// its numbers mean, both directions are named, each p-value ships with the
// sentence it actually stands for, and the two states are numbered because the
// "after" estimate sits to the LEFT of the "before" one — the reading order and
// the time order run opposite ways, which the arrow alone does not fix.
const W = 640,
  H = 184;
const PAD = { l: 20, r: 20 };
const DOMAIN = [-0.08, 0.04];
const Y = 74;
const ZERO_TOP = 34;
const AXIS_Y = 124;
const TICK_Y = AXIS_Y + 13;
const ANCHOR_Y = AXIS_Y + 34;
const UNIT_Y = H - 8;

const px = (v: number) =>
  PAD.l + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (W - PAD.l - PAD.r);

const signed = (v: number) => `${v < 0 ? "−" : "+"}${Math.abs(v)}`;

export function FireControl() {
  const { ref, shown, animate } = useReveal<SVGSVGElement>();
  const a = F.rateBefore.beta;
  const b = F.rateAfter.beta;
  const mid = (px(a) + px(b)) / 2;

  return (
    <Figure
      accent={VIZ.s1}
      title="One missing control was hiding the whole effect"
      takeaway="Measured on its own, the top tax rate looks unrelated to what the top 1% take home. Add one thing the model was missing, how large finance, insurance and real estate had grown as a share of the economy, and the relationship appears, pointing the expected way. Finance had been absorbing the effect."
      subtitle={`The coefficient on the top marginal rate in a single-country US regression, before and after adding the FIRE sector's share of GDP as a control. It moves from +${a} (p = ${F.rateBefore.p}, ${F.rateBefore.label}) to ${b} (p = ${F.rateAfter.p}, ${F.rateAfter.label}).`}
      source={`FIRE share enters with β = ${F.fire.beta} (SE ${F.fire.se}, p ${F.fire.p}). HAC p-values throughout. From the paper's single-country specification. A coefficient here is how much the top 1% share moves for each one-point change in the top marginal rate; left of zero means cutting the rate raises the share. A p-value is how often a result this large would turn up by luck if the true effect were zero, so 0.778 is "routinely", and 0.015 is "about three times in two hundred".`}
    >
      <ChartScroll>
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Coefficient on the top marginal rate moves from plus ${a}, which could easily be chance, to minus ${Math.abs(
            b
          )}, which is unlikely to be, once the FIRE share of GDP is controlled for.`}
        >
          {/* Zero line — the thing being crossed. */}
          <g style={fade(shown, animate, 420, 0)}>
            <line
              x1={px(0)}
              x2={px(0)}
              y1={ZERO_TOP}
              y2={AXIS_Y}
              stroke={VIZ.axis}
              strokeWidth={1}
            />
            <text
              x={px(0)}
              y={ZERO_TOP - 6}
              textAnchor="middle"
              fontSize={9}
              fill={VIZ.ink}
            >
              0 · no effect either way
            </text>
          </g>

          {/* The connector, drawn right-to-left so it travels the way the
              estimate does: from "no relationship" across zero to negative. The
              chevron names that direction, since the move runs against the
              reading direction. */}
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
          <polygon
            points={`${mid - 9},${Y} ${mid + 3},${Y - 5.5} ${mid + 3},${Y + 5.5}`}
            fill={VIZ.s1}
            opacity={0.55}
            style={fade(shown, animate, 380, 900)}
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
              y={Y - 15}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={VIZ.muted}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {signed(a)}
            </text>
            <text
              x={px(a)}
              y={Y + 22}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              fill={VIZ.ink}
            >
              1 · tax rate alone
            </text>
            <text
              x={px(a)}
              y={Y + 36}
              textAnchor="middle"
              fontSize={9}
              fill={VIZ.ink}
              opacity={0.8}
            >
              could easily be chance · p = {F.rateBefore.p}
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
              {signed(b)}
            </text>
            <text
              x={px(b)}
              y={Y + 22}
              textAnchor="middle"
              fontSize={9}
              fontWeight={600}
              fill={VIZ.s1}
            >
              2 · plus finance&rsquo;s share of GDP
            </text>
            <text
              x={px(b)}
              y={Y + 36}
              textAnchor="middle"
              fontSize={9}
              fill={VIZ.s1}
              opacity={0.8}
            >
              unlikely to be chance · p = {F.rateAfter.p}
            </text>
          </g>

          {/* A scale, so the reader can see these numbers are small — and, with
              the unit line below, what "small" is small in. */}
          <g style={fade(shown, animate, 420, 120)}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={AXIS_Y}
              y2={AXIS_Y}
              stroke={VIZ.axis}
              strokeWidth={1}
            />
            {[-0.08, -0.04, 0, 0.04].map((t) => (
              <XTick
                key={t}
                x={px(t)}
                y={TICK_Y}
                label={t === 0 ? "0" : signed(t)}
              />
            ))}
          </g>

          {/* Both directions get named. Right of zero would mean a rate CUT
              lowers the top share, which is not a claim anyone makes — but an
              axis with only one end labelled cannot be read at all. */}
          <g style={fade(shown, animate, 380, 420)}>
            <text x={PAD.l} y={ANCHOR_Y} fontSize={9} fill={VIZ.ink}>
              ← cutting the tax rate raises the top 1% share
            </text>
            <text
              x={W - PAD.r}
              y={ANCHOR_Y}
              textAnchor="end"
              fontSize={9}
              fill={VIZ.ink}
              opacity={0.7}
            >
              cutting it lowers the share →
            </text>
            <text
              x={W / 2}
              y={UNIT_Y}
              textAnchor="middle"
              fontSize={9.5}
              fill={VIZ.ink}
            >
              each dot = how far the top 1% share moves per 1-point rise in the
              tax rate
            </text>
          </g>
        </svg>
      </ChartScroll>

      {/* The control's own coefficient was buried in the provenance note, which
          is the wrong place for it: it is the reason the figure exists. Stated
          the way a reader can picture rather than as a bare β. */}
      <Readout
        color={VIZ.s1}
        label="Meanwhile, each extra point of GDP going to finance, insurance and real estate"
        value={`+${F.fire.beta} points to the top 1%`}
      />
    </Figure>
  );
}
