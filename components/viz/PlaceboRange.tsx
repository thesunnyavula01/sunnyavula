"use client";

import { ERTA_PLACEBO as P } from "@/content/figures";
import { ChartScroll, Figure, Readout, XTick } from "./Figure";
import { fade, growX, useReveal } from "./motion";
import { VIZ } from "./theme";

/**
 * Ranked bars on ONE shared value axis, with a name/value gutter on the left.
 *
 * The first cut of this figure was two floating lanes with a translucent
 * full-height rectangle behind them standing in for the placebo range. Three
 * things were wrong with it and all three are structural, not cosmetic:
 *
 *   1. The range rectangle ran underneath both lane headings and the "Canada"
 *      label, so body text sat half on and half off a gray box.
 *   2. Nothing tied the two lanes to the axis — three unconnected rules, no
 *      gridlines — so "the US lands inside their range", which is the entire
 *      claim, could not actually be checked by eye.
 *   3. The "+4 more" note was centred at F = 50, i.e. it occupied a data
 *      position on a value axis while carrying no value.
 *
 * So: every mark now starts at the same zero line and shares vertical
 * gridlines, the range is read off the bars instead of being drawn as
 * furniture, and labels live in a gutter where they can never collide with a
 * mark. The four countries whose F is unpublished are off the scale entirely —
 * they are chips in HTML below the plot, because the honest thing to say about
 * them is "significant, magnitude unknown", and there is no x for that.
 *
 * Emphasis form, not categorical: the US is the one mark that matters and the
 * placebo countries are context, so the US wears the accent and everything else
 * is the de-emphasis gray. Both groups carry a direct heading, so gray is never
 * asked to do identity work.
 */

const known = (
  P.countries.filter((c) => c.f !== null) as { name: string; f: number }[]
)
  .slice()
  .sort((a, b) => b.f - a.f);
const unknown = P.countries.filter((c) => c.f === null);
const topPlacebo = known[0];
/** How far short of the sharpest placebo break the treated country lands. */
const shortfall = (topPlacebo.f - P.us).toFixed(1);

const W = 640;
const NAME_X = 16;
const VAL_X = 124;
const X0 = 138;
const X1 = 624;
const FMAX = 100;
const BAR_H = 16;

const px = (f: number) => X0 + (f / FMAX) * (X1 - X0);

// Row geometry is derived from the data length so a third published F-statistic
// would push the layout down rather than land on top of the US row.
const G1_Y = 22;
const ROW0 = 50;
const STEP = 32;
const placeboRows = known.map((c, i) => ({ ...c, cy: ROW0 + i * STEP }));
const SPAN_LABEL_Y = ROW0 + known.length * STEP - 2;
const SPAN_Y = SPAN_LABEL_Y + 10;
const G2_Y = SPAN_Y + 28;
const US_Y = G2_Y + 28;
const CAPTION_Y = US_Y + 24;
const AXIS_Y = CAPTION_Y + 14;
const H = AXIS_Y + 40;
const GRID_TOP = ROW0 - 12;
const GRID_BOT = AXIS_Y - 4;

export function PlaceboRange() {
  const { ref, shown, animate } = useReveal<SVGSVGElement>();

  return (
    <Figure
      accent={VIZ.s1}
      title="Six countries that never cut their top rate broke in 1981 too"
      takeaway="If ERTA caused the break, countries that passed no such tax cut should show nothing in 1981. All six show one — and the US result lands inside their range rather than beyond it. That rules out the simple story, and it is the reason the paper argues the narrower one."
      subtitle="The same Chow test applied at 1981 to OECD economies with no comparable 1979–83 top-rate reduction. Each bar is that test's F-statistic: the longer it runs, the more sharply the country's trend snapped in 1981. New Zealand, which cut nothing, scores 97.1. The United States scores 96.2."
      source={`F-statistics at 1981. Published values exist for ${known
        .map((k) => k.name)
        .join(" and ")} only; ${unknown
        .map((u) => u.name)
        .join(
          ", "
        )} are reported as significant without a figure, so they are counted in the tally but not plotted. An F-statistic here measures how much better the years before and after 1981 fit as two separate trends than as one — ${
        known[known.length - 1].name
      }'s ${known[known.length - 1].f.toFixed(
        1
      )} is the smallest break in the set and ${topPlacebo.name}'s ${topPlacebo.f.toFixed(
        1
      )} the largest.`}
    >
      <ChartScroll>
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Chow F-statistics at 1981, on one shared scale. ${topPlacebo.name}, which cut no top tax rate, scores ${topPlacebo.f}. ${
            known[known.length - 1].name
          } scores ${known[known.length - 1].f}. The United States, which enacted ERTA, scores ${
            P.us
          } — inside the placebo range of ${P.range[0]} to ${
            P.range[1]
          }, not beyond it. ${unknown.length} further countries broke significantly without a published figure.`}
        >
          {/* Shared scale first, under everything: the two groups are only
              comparable because they hang off the same gridlines. */}
          <g style={fade(shown, animate, 380, 40)}>
            {[0, 25, 50, 75, 100].map((t) => (
              <line
                key={t}
                x1={px(t)}
                x2={px(t)}
                y1={GRID_TOP}
                y2={GRID_BOT}
                stroke={VIZ.grid}
                strokeWidth={1}
              />
            ))}
            <line
              x1={X0}
              x2={X0}
              y1={GRID_TOP}
              y2={AXIS_Y}
              stroke={VIZ.axis}
              strokeWidth={1}
            />
          </g>

          <text
            x={NAME_X}
            y={G1_Y}
            fontSize={10}
            fontWeight={600}
            fill={VIZ.ink}
            style={fade(shown, animate, 420, 120)}
          >
            Countries that did not cut their top tax rate
          </text>

          {placeboRows.map((c, i) => (
            <g key={c.name} style={fade(shown, animate, 380, 200 + i * 110)}>
              <text x={NAME_X} y={c.cy + 3.5} fontSize={10} fill={VIZ.ink}>
                {c.name}
              </text>
              <text
                x={VAL_X}
                y={c.cy + 3.5}
                textAnchor="end"
                fontSize={10}
                fill={VIZ.inkStrong}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c.f.toFixed(1)}
              </text>
              <rect
                x={X0}
                y={c.cy - BAR_H / 2}
                width={Math.max(px(c.f) - X0, 2)}
                height={BAR_H}
                rx={3}
                fill={VIZ.muted}
                style={growX(shown, animate, 620, 240 + i * 110)}
              />
            </g>
          ))}

          {/* The range, drawn as a measurement of the bars above rather than as
              a background box behind them — which is what made the first cut of
              this figure collide with its own labels. It sits directly above the
              US bar so "inside their range" is a straight vertical comparison. */}
          <g style={fade(shown, animate, 420, 480)}>
            <text
              x={px(known[known.length - 1].f)}
              y={SPAN_LABEL_Y}
              fontSize={9.5}
              fill={VIZ.ink}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              spread across the countries above · F {P.range[0].toFixed(1)} –{" "}
              {P.range[1].toFixed(1)}
            </text>
            <line
              x1={px(P.range[0])}
              x2={px(P.range[1])}
              y1={SPAN_Y}
              y2={SPAN_Y}
              stroke={VIZ.muted}
              strokeWidth={1.25}
            />
            {[P.range[0], P.range[1]].map((v) => (
              <line
                key={v}
                x1={px(v)}
                x2={px(v)}
                y1={SPAN_Y - 4}
                y2={SPAN_Y + 4}
                stroke={VIZ.muted}
                strokeWidth={1.25}
              />
            ))}
          </g>

          <text
            x={NAME_X}
            y={G2_Y}
            fontSize={10}
            fontWeight={600}
            fill={VIZ.s1}
            style={fade(shown, animate, 420, 560)}
          >
            The country that did
          </text>

          <g style={fade(shown, animate, 380, 600)}>
            <text
              x={NAME_X}
              y={US_Y + 3.5}
              fontSize={10}
              fontWeight={700}
              fill={VIZ.inkStrong}
            >
              United States
            </text>
            <text
              x={VAL_X}
              y={US_Y + 3.5}
              textAnchor="end"
              fontSize={10}
              fontWeight={700}
              fill={VIZ.inkStrong}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {P.us.toFixed(1)}
            </text>
          </g>
          <rect
            x={X0}
            y={US_Y - BAR_H / 2}
            width={px(P.us) - X0}
            height={BAR_H}
            rx={3}
            fill={VIZ.s1}
            style={growX(shown, animate, 700, 640)}
          />

          {/* The punchline. 96.2 and 97.1 are four pixels apart at this scale,
              so the comparison is drawn rather than left to the reader: the
              guide carries the US bar's end up to the range bracket, where it
              stops just inside the right-hand tick. */}
          <g style={fade(shown, animate, 420, 1120)}>
            <line
              x1={px(P.us)}
              x2={px(P.us)}
              y1={SPAN_Y}
              y2={US_Y - BAR_H / 2}
              stroke={VIZ.s1}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.6}
            />
            <text
              x={px(P.us) - 6}
              y={CAPTION_Y}
              textAnchor="end"
              fontSize={9}
              fill={VIZ.s1}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {shortfall} short of {topPlacebo.name}, which cut nothing
            </text>
          </g>

          <g style={fade(shown, animate, 420, 80)}>
            <line
              x1={X0}
              x2={X1}
              y1={AXIS_Y}
              y2={AXIS_Y}
              stroke={VIZ.axis}
              strokeWidth={1}
            />
            {[0, 25, 50, 75, 100].map((t) => (
              <XTick key={t} x={px(t)} y={AXIS_Y + 14} label={String(t)} />
            ))}
            <text
              x={(X0 + X1) / 2}
              y={AXIS_Y + 32}
              textAnchor="middle"
              fontSize={9.5}
              fill={VIZ.ink}
            >
              Chow F-statistic at 1981 — bigger means a sharper break
            </text>
          </g>
        </svg>
      </ChartScroll>

      <Readout
        label="Countries tested for a 1981 break · countries that had one"
        value={`${P.countries.length + 1} of ${P.countries.length + 1}`}
      />

      {/* Off the scale on purpose: the paper reports these four as significant
          without printing a figure, and there is no honest x-position for
          "somewhere above the threshold". Plain HTML rather than SVG so they
          render at full size on a phone instead of inheriting ChartScroll's
          640-unit viewBox. */}
      <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
        <p className="text-[11px] leading-relaxed text-neutral-400">
          The other {unknown.length} countries in the test broke significantly
          too. The paper reports them as significant without printing a figure,
          so they are counted in the tally above but cannot be placed on the
          scale.
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {unknown.map((u) => (
            <li
              key={u.name}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] leading-tight text-neutral-300"
            >
              {u.name}
            </li>
          ))}
        </ul>
      </div>
    </Figure>
  );
}
