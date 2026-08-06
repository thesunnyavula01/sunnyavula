"use client";

import { ERTA_PLACEBO as P } from "@/content/figures";
import { ChartScroll, Figure } from "./Figure";
import { fade, pop, useReveal } from "./motion";
import { VIZ } from "./theme";

// Emphasis form, not categorical: the US is the one mark that matters and the
// placebo countries are context, so the US wears the accent and everything else
// is the de-emphasis gray — with direct labels, since gray carries no identity.
// Generous vertical rhythm on purpose: at the first pass the country labels
// under row 1 collided with row 2's heading, and the last x-tick collided with
// the axis title. Each label now owns its own band.
const W = 640, H = 246;
const PAD = { l: 16, r: 16, t: 34 };
const FMAX = 110;

const px = (f: number) => PAD.l + (f / FMAX) * (W - PAD.l - PAD.r);
const ROW_PLACEBO = 80;
const ROW_US = 156;
const AXIS_Y = 196;

const known = P.countries.filter((c) => c.f !== null) as {
  name: string;
  f: number;
}[];
const unknown = P.countries.filter((c) => c.f === null);

export function PlaceboRange() {
  const { ref, shown, animate } = useReveal<SVGSVGElement>();

  return (
    <Figure
      accent={VIZ.s1}
      title="Six countries that never cut their top rate broke in 1981 too"
      takeaway="If ERTA caused the break, countries that passed no such tax cut should show nothing in 1981. All six show a break — and the US result lands inside their range rather than standing out from it. That rules out the simple story, and it is the reason the paper argues the narrower one."
      subtitle="The same Chow test applied at 1981 to OECD economies with no comparable 1979–83 top-rate reduction. A higher score means a sharper break; the US scores 96.2, New Zealand 97.1."
      source={`F-statistics at 1981. Published values exist for ${known.map((k) => k.name).join(" and ")} only; ${unknown.map((u) => u.name).join(", ")} are reported as significant without a figure, so they are counted in the band but not plotted as points. An F-statistic here measures how much better the years before and after 1981 fit as two separate trends than as one.`}
    >
      <ChartScroll>
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Chow F-statistics at 1981. Placebo countries range from ${P.range[0]} to ${P.range[1]}. The United States is ${P.us}, inside that range.`}
        >
          {/* The placebo range, spanning both rows. */}
          <g style={fade(shown, animate, 560, 60)}>
            <rect
              x={px(P.range[0])}
              y={PAD.t}
              width={px(P.range[1]) - px(P.range[0])}
              height={ROW_US + 18 - PAD.t}
              fill={VIZ.muted}
              opacity={0.12}
              rx={4}
            />
            <text x={px(P.range[0])} y={PAD.t - 10} fontSize={9.5} fill={VIZ.ink}>
              range covered by countries that changed nothing · F {P.range[0]} –{" "}
              {P.range[1]}
            </text>
          </g>

          {/* Row labels. */}
          <g style={fade(shown, animate, 420, 200)}>
            <text
              x={PAD.l}
              y={ROW_PLACEBO - 20}
              fontSize={10}
              fill={VIZ.ink}
              fontWeight={600}
            >
              Six OECD countries with no comparable rate cut
            </text>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={ROW_PLACEBO}
              y2={ROW_PLACEBO}
              stroke={VIZ.grid}
              strokeWidth={1}
            />
          </g>
          <g style={fade(shown, animate, 420, 520)}>
            <text
              x={PAD.l}
              y={ROW_US - 20}
              fontSize={10}
              fill={VIZ.inkStrong}
              fontWeight={600}
            >
              United States (enacted ERTA)
            </text>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={ROW_US}
              y2={ROW_US}
              stroke={VIZ.grid}
              strokeWidth={1}
            />
          </g>

          {known.map((c, i) => (
            <g key={c.name} style={fade(shown, animate, 380, 320 + i * 110)}>
              <circle
                cx={px(c.f)}
                cy={ROW_PLACEBO}
                r={6}
                fill={VIZ.muted}
                stroke={VIZ.surface}
                strokeWidth={2}
                style={pop(shown, animate, 400, 320 + i * 110)}
              />
              <text
                x={px(c.f)}
                y={ROW_PLACEBO + 20}
                textAnchor={c.f > FMAX * 0.8 ? "end" : "middle"}
                fontSize={9.5}
                fill={VIZ.ink}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {c.name} {c.f}
              </text>
            </g>
          ))}

          {/* Without this the row reads as two countries, not six. */}
          <text
            x={px(50)}
            y={ROW_PLACEBO + 36}
            textAnchor="middle"
            fontSize={9}
            fill={VIZ.ink}
            style={fade(shown, animate, 380, 560)}
            opacity={0.85}
          >
            + {unknown.length} more ({unknown.map((u) => u.name).join(", ")}) —
            significant, F not published
          </text>

          <circle
            cx={px(P.us)}
            cy={ROW_US}
            r={7.5}
            fill={VIZ.s1}
            stroke={VIZ.surface}
            strokeWidth={2}
            style={pop(shown, animate, 440, 700)}
          />
          <text
            x={px(P.us) - 12}
            y={ROW_US + 4}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            fill={VIZ.s1}
            style={{
              fontVariantNumeric: "tabular-nums",
              ...fade(shown, animate, 380, 820),
            }}
          >
            F = {P.us}
          </text>

          <g style={fade(shown, animate, 420, 120)}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={AXIS_Y}
              y2={AXIS_Y}
              stroke={VIZ.axis}
              strokeWidth={1}
            />
            {[0, 25, 50, 75, 100].map((t) => (
              <text
                key={t}
                x={px(t)}
                y={AXIS_Y + 14}
                textAnchor="middle"
                fontSize={9}
                fill={VIZ.ink}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {t}
              </text>
            ))}
            <text
              x={W / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize={9.5}
              fill={VIZ.ink}
            >
              How sharp the 1981 break was (Chow F-statistic) →
            </text>
          </g>
        </svg>
      </ChartScroll>
    </Figure>
  );
}
