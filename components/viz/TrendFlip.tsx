"use client";

import { useRef, useState } from "react";
import { ERTA_DESCRIPTIVES as D } from "@/content/figures";
import { ChartScroll, Figure, GridLine, Legend, XTick } from "./Figure";
import { VIZ } from "./theme";

// Fitted least-squares trends, not raw observations. The paper reports each
// period's mean and slope but not the year-by-year series, so this draws the
// two regression lines those two numbers define and nothing else — anchoring
// each on its period mean at its own midpoint year.
const W = 640, H = 280;
const PAD = { l: 34, r: 14, t: 16, b: 28 };
const X0 = 1960, X1 = 2024;
const Y0 = 9, Y1 = 22;

const px = (year: number) =>
  PAD.l + ((year - X0) / (X1 - X0)) * (W - PAD.l - PAD.r);
const py = (v: number) =>
  PAD.t + (1 - (v - Y0) / (Y1 - Y0)) * (H - PAD.t - PAD.b);

const fitPre = (year: number) => D.pre.mean + D.pre.trend * (year - D.pre.midYear);
const fitPost = (year: number) =>
  D.post.mean + D.post.trend * (year - D.post.midYear);

export function TrendFlip() {
  const ref = useRef<SVGSVGElement>(null);
  const [year, setYear] = useState<number | null>(null);

  function track(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const xInView = ((clientX - r.left) / r.width) * W;
    const y = Math.round(
      X0 + ((xInView - PAD.l) / (W - PAD.l - PAD.r)) * (X1 - X0)
    );
    setYear(Math.min(X1, Math.max(X0, y)));
  }

  const isPre = year !== null && year < D.breakYear;
  const value = year === null ? null : isPre ? fitPre(year) : fitPost(year);

  return (
    <Figure
      title="The trend did not steepen in 1981 — it reversed"
      subtitle="Fitted least-squares trend in the US top 1% pre-tax income share, before and after the break. A Chow test puts the break at 1981 with F(2, 61) = 86.03, p < 0.001."
      source="Fitted lines only. Each is drawn from the period mean and slope reported in the paper (pre: 11.60% and −0.156pp/yr; post: 16.45% and +0.206pp/yr) — the underlying year-by-year WID.world series is not reproduced here. Shaded bands are each period's observed min–max."
      legend={
        <Legend
          items={[
            { color: VIZ.s1, label: `${D.pre.label} ${D.pre.years} · −0.156pp/yr` },
            { color: VIZ.s2, label: `${D.post.label} ${D.post.years} · +0.206pp/yr` },
          ]}
        />
      }
    >
      <ChartScroll>
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none"
          role="img"
          aria-label="Fitted trend in the US top 1 percent income share. Before 1981 the trend falls at 0.156 percentage points per year; after 1981 it rises at 0.206 percentage points per year."
          onPointerMove={(e) => track(e.clientX)}
          onPointerLeave={() => setYear(null)}
        >
          {[10, 12, 14, 16, 18, 20, 22].map((v) => (
            <GridLine key={v} y={py(v)} x1={PAD.l} x2={W - PAD.r} label={`${v}%`} />
          ))}

          {/* Observed min–max for each period. Kept faint with hairline edges so
              it reads as a range envelope, not as an area chart under the line. */}
          {[
            { x1: px(X0), x2: px(1980), lo: D.pre.min, hi: D.pre.max, c: VIZ.s1 },
            { x1: px(D.breakYear), x2: px(X1), lo: D.post.min, hi: D.post.max, c: VIZ.s2 },
          ].map((b) => (
            <g key={b.x1}>
              <rect
                x={b.x1}
                y={py(b.hi)}
                width={b.x2 - b.x1}
                height={py(b.lo) - py(b.hi)}
                fill={b.c}
                opacity={0.06}
              />
              {[b.lo, b.hi].map((v) => (
                <line
                  key={v}
                  x1={b.x1}
                  x2={b.x2}
                  y1={py(v)}
                  y2={py(v)}
                  stroke={b.c}
                  strokeWidth={1}
                  strokeDasharray="2 4"
                  opacity={0.4}
                />
              ))}
            </g>
          ))}

          {/* The break. */}
          <line
            x1={px(D.breakYear)}
            x2={px(D.breakYear)}
            y1={PAD.t}
            y2={H - PAD.b}
            stroke={VIZ.inkStrong}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <text
            x={px(D.breakYear) + 5}
            y={PAD.t + 10}
            fontSize={9.5}
            fill={VIZ.inkStrong}
            fontWeight={600}
          >
            ERTA · 1981
          </text>

          <line
            x1={px(X0)}
            y1={py(fitPre(X0))}
            x2={px(1980)}
            y2={py(fitPre(1980))}
            stroke={VIZ.s1}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <line
            x1={px(D.breakYear)}
            y1={py(fitPost(D.breakYear))}
            x2={px(X1)}
            y2={py(fitPost(X1))}
            stroke={VIZ.s2}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Direct labels — the two slopes are the whole point of the figure. */}
          <text x={px(1962)} y={py(fitPre(1962)) - 9} fontSize={10} fill={VIZ.s1} fontWeight={600}>
            falling
          </text>
          <text x={px(2012)} y={py(fitPost(2012)) + 16} fontSize={10} fill={VIZ.s2} fontWeight={600}>
            rising
          </text>

          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={H - PAD.b}
            y2={H - PAD.b}
            stroke={VIZ.axis}
            strokeWidth={1}
          />
          {[1960, 1970, 1980, 1990, 2000, 2010, 2020].map((t) => (
            <XTick key={t} x={px(t)} y={H - PAD.b + 14} label={String(t)} />
          ))}

          {year !== null && value !== null && (
            <g pointerEvents="none">
              <line
                x1={px(year)}
                x2={px(year)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke={VIZ.inkStrong}
                strokeWidth={1}
                opacity={0.35}
              />
              <circle
                cx={px(year)}
                cy={py(value)}
                r={4.5}
                fill={isPre ? VIZ.s1 : VIZ.s2}
                stroke={VIZ.surface}
                strokeWidth={2}
              />
              <g
                transform={`translate(${Math.min(px(year) + 8, W - PAD.r - 104)}, ${Math.max(py(value) - 34, PAD.t + 2)})`}
              >
                <rect width={100} height={30} rx={5} fill="#0b0e16" opacity={0.94} />
                <text x={7} y={12} fontSize={9} fill={VIZ.ink}>
                  {year} · {isPre ? "pre" : "post"}-ERTA
                </text>
                <text
                  x={7}
                  y={24}
                  fontSize={11}
                  fontWeight={700}
                  fill={VIZ.inkStrong}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {value.toFixed(2)}% fitted
                </text>
              </g>
            </g>
          )}
        </svg>
      </ChartScroll>

      <p className="mt-2 text-[11px] text-neutral-500">
        Hover or drag across the chart to read the fitted value for any year.
      </p>
    </Figure>
  );
}
