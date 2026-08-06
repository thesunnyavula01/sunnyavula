"use client";

import { useId, useState } from "react";
import { ERTA_DESCRIPTIVES as D } from "@/content/figures";
import { ChartScroll, Figure, Legend, XTick } from "./Figure";
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

function area(m: number, s: number) {
  const pts: string[] = [`${px(X0)},${py(0)}`];
  for (let x = X0; x <= X1; x += 0.1) pts.push(`${px(x)},${py(pdf(x, m, s))}`);
  pts.push(`${px(X1)},${py(0)}`);
  return pts.join(" ");
}

export function DistributionShift() {
  const [threshold, setThreshold] = useState(15);
  const id = useId();

  const preAbove = (1 - cdf(threshold, D.pre.mean, D.pre.sd)) * 100;
  const postAbove = (1 - cdf(threshold, D.post.mean, D.post.sd)) * 100;

  return (
    <Figure
      title="Two different distributions, not one distribution drifting"
      subtitle={`The top 1% share averaged ${D.pre.mean}% across ${D.pre.n} pre-ERTA years and ${D.post.mean}% across ${D.post.n} post-ERTA years — a ${D.meanShift}pp shift that a Welch two-sample t-test rejects as chance at t = −10.10, p < 0.001. The post-ERTA curve is also visibly wider: top incomes became far more cyclical.`}
      source="Normal approximations drawn from the mean and standard deviation reported in Table 1 of the paper (pre: 11.60 ± 1.09; post: 16.45 ± 2.77). The real series is not necessarily normal — this shows the location and spread the test compares, not the empirical histogram."
      legend={
        <Legend
          items={[
            { color: VIZ.s1, label: `${D.pre.label} ${D.pre.years} · σ ${D.pre.sd}` },
            { color: VIZ.s2, label: `${D.post.label} ${D.post.years} · σ ${D.post.sd}` },
          ]}
        />
      }
    >
      <ChartScroll>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`Two normal curves. The pre-ERTA distribution is centred at ${D.pre.mean} percent and is narrow; the post-ERTA distribution is centred at ${D.post.mean} percent and is much wider.`}
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

          <polygon points={area(D.pre.mean, D.pre.sd)} fill={`url(#${id}-a)`} />
          <polyline
            points={area(D.pre.mean, D.pre.sd)}
            fill="none"
            stroke={VIZ.s1}
            strokeWidth={2}
          />
          <polygon points={area(D.post.mean, D.post.sd)} fill={`url(#${id}-b)`} />
          <polyline
            points={area(D.post.mean, D.post.sd)}
            fill="none"
            stroke={VIZ.s2}
            strokeWidth={2}
          />

          {/* Mean markers, direct-labelled. */}
          {[
            { m: D.pre.mean, s: D.pre.sd, c: VIZ.s1 },
            { m: D.post.mean, s: D.post.sd, c: VIZ.s2 },
          ].map(({ m, s, c }) => (
            <g key={m}>
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
            const top = Math.max(
              pdf(threshold, D.pre.mean, D.pre.sd),
              pdf(threshold, D.post.mean, D.post.sd),
              0.055
            ) + 0.035;
            return (
              <>
                <line
                  x1={px(threshold)}
                  x2={px(threshold)}
                  y1={py(Math.min(top, YMAX))}
                  y2={py(0)}
                  stroke={VIZ.inkStrong}
                  strokeWidth={1.5}
                />
                <circle
                  cx={px(threshold)}
                  cy={py(Math.min(top, YMAX))}
                  r={3.5}
                  fill={VIZ.inkStrong}
                />
              </>
            );
          })()}

          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={py(0)}
            y2={py(0)}
            stroke={VIZ.axis}
            strokeWidth={1}
          />
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
        </svg>
      </ChartScroll>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <label
          htmlFor={`${id}-slider`}
          className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-neutral-300"
        >
          <span>Share of years above a threshold of</span>
          <span
            className="text-sm font-bold text-neutral-50"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {threshold.toFixed(1)}%
          </span>
        </label>
        <input
          id={`${id}-slider`}
          type="range"
          min={9}
          max={22}
          step={0.5}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="mt-2 w-full accent-[#c37f29]"
        />
        <dl className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: D.pre.label, years: D.pre.years, v: preAbove, c: VIZ.s1 },
            { label: D.post.label, years: D.post.years, v: postAbove, c: VIZ.s2 },
          ].map((r) => (
            <div key={r.label} className="flex items-baseline gap-2">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: r.c }}
              />
              <div>
                <dt className="text-[11px] text-neutral-500">
                  {r.label} {r.years}
                </dt>
                <dd
                  className="text-base font-bold text-neutral-100"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {r.v < 0.1 ? "<0.1" : r.v.toFixed(1)}%
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Figure>
  );
}
