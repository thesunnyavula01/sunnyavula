"use client";

import { useId, useState } from "react";
import { ERTA_DESCRIPTIVES as D } from "@/content/figures";
import { ChartScroll, Figure, Legend, Slider, XTick } from "./Figure";
import { draw, fade, useEased, useReveal } from "./motion";
import { VIZ } from "./theme";

// Normal approximations built from Table 1's mean and standard deviation. Both
// curves are true densities on the same y scale (each integrates to 1), so the
// post-ERTA curve is genuinely shorter and wider — that flattening IS the
// variance result (σ 1.09 → 2.77), and normalising the peaks would erase it.
const W = 640, H = 250;
const PAD = { l: 14, r: 14, t: 14, b: 40 };
const X0 = 7, X1 = 26;

const px = (v: number) => PAD.l + ((v - X0) / (X1 - X0)) * (W - PAD.l - PAD.r);
const YMAX = 0.4;
const py = (d: number) => PAD.t + (1 - d / YMAX) * (H - PAD.t - PAD.b);

const pdf = (x: number, m: number, s: number) =>
  Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

/** Normal CDF, Abramowitz & Stegun 7.1.26. */
function cdf(x: number, m: number, s: number) {
  const z = (x - m) / (s * Math.SQRT2);
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-z * z);
  return 0.5 * (1 + (z >= 0 ? y : -y));
}

/** Curve only — used for the stroke, so the draw-on starts at the left tail. */
function curve(m: number, s: number) {
  const pts: string[] = [];
  for (let x = X0; x <= X1; x += 0.1) pts.push(`${px(x)},${py(pdf(x, m, s))}`);
  return pts.join(" ");
}

/** Curve closed to the baseline — used for the fill. */
function area(m: number, s: number) {
  return `${px(X0)},${py(0)} ${curve(m, s)} ${px(X1)},${py(0)}`;
}

export function DistributionShift() {
  const [threshold, setThreshold] = useState(15);
  const { ref, shown, animate } = useReveal<SVGSVGElement>();
  const id = useId();

  // The marker and every readout run off the eased value, so dragging the
  // slider glides instead of stepping. The label prints the real threshold, so
  // the number the reader is setting is never mid-transit.
  const t = useEased(threshold, 220);

  const preAbove = (1 - cdf(t, D.pre.mean, D.pre.sd)) * 100;
  const postAbove = (1 - cdf(t, D.post.mean, D.post.sd)) * 100;

  // A share is abstract; "in 32 of the 44 years" is not. The counts are the
  // whole reason this control is worth having.
  const preYears = Math.round((preAbove / 100) * D.pre.n);
  const postYears = Math.round((postAbove / 100) * D.post.n);

  // `count` rather than `years`: D.pre.years is already the date-range string
  // ("1960–1980"), and spreading a count in under the same key would silently
  // replace it.
  const rows = [
    { ...D.pre, above: preAbove, count: preYears, c: VIZ.s1 },
    { ...D.post, above: postAbove, count: postYears, c: VIZ.s2 },
  ];

  return (
    <Figure
      accent={VIZ.s1}
      title="Two different worlds, not one world drifting"
      takeaway="Line the two eras up side by side and they barely overlap. The post-1981 curve sits well to the right — a bigger share — and is also much flatter, which means top incomes swung far harder from year to year than they used to."
      subtitle={`The top 1% share averaged ${D.pre.mean}% across ${D.pre.n} pre-ERTA years and ${D.post.mean}% across ${D.post.n} post-ERTA years — a ${D.meanShift}pp shift that a Welch two-sample t-test rejects as chance at t = −10.10, p < 0.001. The spread more than doubled too, from σ 1.09 to σ 2.77.`}
      source="Normal approximations drawn from the mean and standard deviation reported in Table 1 of the paper (pre: 11.60 ± 1.09; post: 16.45 ± 2.77). The real series is not necessarily normal — this shows the location and spread the test compares, not the empirical histogram. Year counts under the slider are that same approximation applied to each period's length, so they are estimates rather than a tally of observations."
      legend={
        <Legend
          items={[
            { color: VIZ.s1, label: `${D.pre.label} ${D.pre.years} · ${D.pre.n} years` },
            { color: VIZ.s2, label: `${D.post.label} ${D.post.years} · ${D.post.n} years` },
          ]}
        />
      }
    >
      <ChartScroll>
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Two bell curves. The pre-ERTA distribution is centred at ${D.pre.mean} percent and is narrow; the post-ERTA distribution is centred at ${D.post.mean} percent and is much wider and flatter.`}
        >
          <defs>
            <linearGradient id={`${id}-a`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={VIZ.s1} stopOpacity={0.34} />
              <stop offset="100%" stopColor={VIZ.s1} stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id={`${id}-b`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={VIZ.s2} stopOpacity={0.34} />
              <stop offset="100%" stopColor={VIZ.s2} stopOpacity={0.04} />
            </linearGradient>
          </defs>

          <polygon
            points={area(D.pre.mean, D.pre.sd)}
            fill={`url(#${id}-a)`}
            style={fade(shown, animate, 620, 260)}
          />
          <polyline
            points={curve(D.pre.mean, D.pre.sd)}
            fill="none"
            stroke={VIZ.s1}
            strokeWidth={2}
            pathLength={1}
            style={draw(shown, animate, 780, 60)}
          />
          <polygon
            points={area(D.post.mean, D.post.sd)}
            fill={`url(#${id}-b)`}
            style={fade(shown, animate, 620, 560)}
          />
          <polyline
            points={curve(D.post.mean, D.post.sd)}
            fill="none"
            stroke={VIZ.s2}
            strokeWidth={2}
            pathLength={1}
            style={draw(shown, animate, 780, 360)}
          />

          {/* Mean markers, direct-labelled. */}
          {[
            { m: D.pre.mean, s: D.pre.sd, c: VIZ.s1, d: 720 },
            { m: D.post.mean, s: D.post.sd, c: VIZ.s2, d: 900 },
          ].map(({ m, s, c, d }) => (
            <g key={m} style={fade(shown, animate, 420, d)}>
              <line
                x1={px(m)}
                x2={px(m)}
                y1={py(pdf(m, m, s))}
                y2={py(0)}
                stroke={c}
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <text
                x={px(m)}
                y={py(pdf(m, m, s)) - 6}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={c}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {m}%
              </text>
            </g>
          ))}

          {/* The threshold the slider drives. Its top tracks whichever curve is
              taller at that x (with a floor so it stays visible in the tails), so
              it reads as a marker on the data rather than a full-height divider. */}
          {(() => {
            const top =
              Math.max(
                pdf(t, D.pre.mean, D.pre.sd),
                pdf(t, D.post.mean, D.post.sd),
                0.055
              ) + 0.035;
            return (
              <g style={fade(shown, animate, 420, 1000)}>
                <line
                  x1={px(t)}
                  x2={px(t)}
                  y1={py(Math.min(top, YMAX))}
                  y2={py(0)}
                  stroke={VIZ.inkStrong}
                  strokeWidth={1.5}
                />
                <circle
                  cx={px(t)}
                  cy={py(Math.min(top, YMAX))}
                  r={3.5}
                  fill={VIZ.inkStrong}
                />
              </g>
            );
          })()}

          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={py(0)}
            y2={py(0)}
            stroke={VIZ.axis}
            strokeWidth={1}
            pathLength={1}
            style={draw(shown, animate, 620, 0)}
          />
          <g style={fade(shown, animate, 380, 200)}>
            {[8, 10, 12, 14, 16, 18, 20, 22, 24].map((v) => (
              <XTick key={v} x={px(v)} y={py(0) + 14} label={`${v}%`} />
            ))}
            <text
              x={W / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize={9.5}
              fill={VIZ.ink}
            >
              Top 1% share of US pre-tax national income
            </text>
          </g>
        </svg>
      </ChartScroll>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3 sm:p-4">
        <label
          htmlFor={`${id}-slider`}
          className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-neutral-300"
        >
          <span>How often did the top 1% take more than</span>
          <span
            className="text-sm font-bold text-neutral-50"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {threshold.toFixed(1)}%
          </span>
        </label>
        <Slider
          id={`${id}-slider`}
          min={9}
          max={22}
          step={0.5}
          value={threshold}
          onChange={setThreshold}
          accent={VIZ.s2}
          valueText={`${threshold.toFixed(1)} percent`}
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
          <span>9%</span>
          <span>22%</span>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline gap-2">
              <span
                aria-hidden
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: r.c }}
              />
              <div className="min-w-0">
                <dt className="text-[11px] text-neutral-500">
                  {r.label} {r.years}
                  <span className="sr-only"> — years above the threshold</span>
                </dt>
                <dd
                  className="text-base font-bold leading-tight text-neutral-100"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {r.count} of {r.n}
                  <span className="ml-2 text-[11px] font-medium text-neutral-500">
                    {r.above < 0.5 ? "<1" : r.above.toFixed(0)}% of the era
                  </span>
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-neutral-400">
          Above {threshold.toFixed(1)}%: roughly{" "}
          <span className="font-semibold text-neutral-200">
            {preYears} of the {D.pre.n} years
          </span>{" "}
          before ERTA, and{" "}
          <span className="font-semibold text-neutral-200">
            {postYears} of the {D.post.n} years
          </span>{" "}
          after it.
        </p>
      </div>
    </Figure>
  );
}
