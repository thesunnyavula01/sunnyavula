"use client";

import { useRef, useState } from "react";
import { VSD_COMPOUNDING as V } from "@/content/figures";
import { ChartScroll, Figure, GridLine, Legend, XTick } from "./Figure";
import { VIZ } from "./theme";

// Only three numbers here are real: the two endpoints and the CAGR. The curve
// between them is the compounding path those endpoints imply, NOT a record of
// positions — the caption says so, and nothing may be added to this chart that
// implies otherwise (no drawdowns, no monthly marks, no dates).
const W = 640, H = 260;
const PAD = { l: 46, r: 16, t: 16, b: 34 };
const YMAX = 100000;

const px = (t: number) => PAD.l + (t / V.years) * (W - PAD.l - PAD.r);
const py = (v: number) => PAD.t + (1 - v / YMAX) * (H - PAD.t - PAD.b);

const at = (t: number, rate: number) => V.start * Math.pow(1 + rate, t);
const path = (rate: number) => {
  const pts: string[] = [];
  for (let t = 0; t <= V.years + 0.001; t += 0.1) pts.push(`${px(t)},${py(at(t, rate))}`);
  return pts.join(" ");
};

const money = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${Math.round(v)}`;

export function CompoundingCurve() {
  const ref = useRef<SVGSVGElement>(null);
  const [t, setT] = useState<number | null>(null);

  function track(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const xInView = ((clientX - r.left) / r.width) * W;
    const raw = ((xInView - PAD.l) / (W - PAD.l - PAD.r)) * V.years;
    setT(Math.min(V.years, Math.max(0, Math.round(raw * 2) / 2)));
  }

  const vPort = t === null ? null : at(t, V.cagr);
  const vBase = t === null ? null : at(t, V.baselineCagr);

  return (
    <Figure
      title="What ~27% a year does to $35,000"
      subtitle={`The formula compounded at roughly ${(V.cagr * 100).toFixed(1)}% and took the portfolio from $35k to $91k — about ${V.years} years at that rate — against a ${(V.baselineCagr * 100).toFixed(0)}% long-run reference.`}
      source="$35k to $91k at ~27% CAGR — the compounding path implied by the endpoints, not a record of actual positions. Intermediate points are arithmetic, not marks; the axis is deliberately undated. The reference line is a flat 10%/yr, not a dated S&P return over the same window."
      legend={
        <Legend
          items={[
            { color: VIZ.s3, label: `VSD formula · ${(V.cagr * 100).toFixed(1)}% CAGR` },
            { color: VIZ.muted, label: V.baselineLabel, dashed: true },
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
          aria-label={`Compounding curve from $35,000 to about $91,000 over ${V.years} years at 27% a year, against a 10% a year reference line ending near $51,000.`}
          onPointerMove={(e) => track(e.clientX)}
          onPointerLeave={() => setT(null)}
        >
          {[0, 25000, 50000, 75000, 100000].map((v) => (
            <GridLine key={v} y={py(v)} x1={PAD.l} x2={W - PAD.r} label={money(v)} />
          ))}

          <polyline
            points={path(V.baselineCagr)}
            fill="none"
            stroke={VIZ.muted}
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <polyline
            points={path(V.cagr)}
            fill="none"
            stroke={VIZ.s3}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Endpoints — the only two real observations. */}
          {[
            { t: 0, v: V.start },
            { t: V.years, v: at(V.years, V.cagr) },
          ].map((p) => (
            <circle
              key={p.t}
              cx={px(p.t)}
              cy={py(p.v)}
              r={5}
              fill={VIZ.s3}
              stroke={VIZ.surface}
              strokeWidth={2}
            />
          ))}
          <text
            x={px(V.years) - 6}
            y={py(at(V.years, V.cagr)) - 12}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            fill={VIZ.s3}
          >
            ${(at(V.years, V.cagr) / 1000).toFixed(0)}k
          </text>
          <text
            x={px(0) + 8}
            y={py(V.start) - 10}
            fontSize={10}
            fontWeight={600}
            fill={VIZ.s3}
          >
            $35k
          </text>
          <text
            x={px(V.years) - 6}
            y={py(at(V.years, V.baselineCagr)) + 16}
            textAnchor="end"
            fontSize={9.5}
            fill={VIZ.muted}
          >
            {money(at(V.years, V.baselineCagr))} at 10%
          </text>

          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={H - PAD.b}
            y2={H - PAD.b}
            stroke={VIZ.axis}
            strokeWidth={1}
          />
          {Array.from({ length: V.years + 1 }, (_, i) => i).map((i) => (
            <XTick key={i} x={px(i)} y={H - PAD.b + 14} label={`Year ${i}`} />
          ))}

          {t !== null && vPort !== null && vBase !== null && (
            <g pointerEvents="none">
              <line
                x1={px(t)}
                x2={px(t)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke={VIZ.inkStrong}
                strokeWidth={1}
                opacity={0.3}
              />
              <circle cx={px(t)} cy={py(vBase)} r={4} fill={VIZ.muted} stroke={VIZ.surface} strokeWidth={2} />
              <circle cx={px(t)} cy={py(vPort)} r={5} fill={VIZ.s3} stroke={VIZ.surface} strokeWidth={2} />
              <g transform={`translate(${Math.min(px(t) + 10, W - PAD.r - 108)}, ${Math.max(py(vPort) - 46, PAD.t + 2)})`}>
                <rect width={104} height={42} rx={5} fill="#0b0e16" opacity={0.94} />
                <text x={8} y={13} fontSize={9} fill={VIZ.ink}>
                  Year {t % 1 === 0 ? t : t.toFixed(1)}
                </text>
                <text x={8} y={26} fontSize={11} fontWeight={700} fill={VIZ.s3} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {money(vPort)}
                </text>
                <text x={8} y={37} fontSize={9.5} fill={VIZ.muted} style={{ fontVariantNumeric: "tabular-nums" }}>
                  vs {money(vBase)} at 10%
                </text>
              </g>
            </g>
          )}
        </svg>
      </ChartScroll>
    </Figure>
  );
}
