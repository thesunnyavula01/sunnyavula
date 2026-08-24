"use client";

import { useState } from "react";
import { VSD_COMPOUNDING as V } from "@/content/figures";
import { ChartScroll, Figure, GridLine, Legend, Readout, XTick } from "./Figure";
import { draw, fade, pop, useReveal } from "./motion";
import { VIZ } from "./theme";

// Only three numbers here are real: the two endpoints and the CAGR. The curve
// between them is the compounding path those endpoints imply, NOT a record of
// positions — the caption says so, and nothing may be added to this chart that
// implies otherwise (no drawdowns, no monthly marks, no dates).
const W = 640, H = 260;
const PAD = { l: 46, r: 16, t: 16, b: 34 };
const YMAX = 100000;

const px = (t: number) => PAD.l + (t / V.years) * (W - PAD.l - PAD.r);
// Rounded for the same reason DistributionShift's py is — see the note there.
// Every value reaching py here has been through Math.pow, whose last bit is
// implementation-defined, and this curve is server-rendered, so an unrounded
// `points` string is a hydration mismatch waiting on a client whose math
// library differs from the server's. V8-to-V8 happens to agree on these
// particular exponents; SpiderMonkey and JavaScriptCore are not promised to.
const py = (v: number) =>
  Math.round((PAD.t + (1 - v / YMAX) * (H - PAD.t - PAD.b)) * 1000) / 1000;

const at = (t: number, rate: number) => V.start * Math.pow(1 + rate, t);
const path = (rate: number) => {
  const pts: string[] = [];
  for (let t = 0; t <= V.years + 0.001; t += 0.1)
    pts.push(`${px(t)},${py(at(t, rate))}`);
  return pts.join(" ");
};

const money = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${Math.round(v)}`;

const END_PORT = at(V.years, V.cagr);
const END_BASE = at(V.years, V.baselineCagr);

export function CompoundingCurve() {
  const { ref, shown, animate } = useReveal<SVGSVGElement>();
  const [t, setT] = useState<number | null>(null);

  function track(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const xInView = ((clientX - r.left) / r.width) * W;
    const raw = ((xInView - PAD.l) / (W - PAD.l - PAD.r)) * V.years;
    setT(Math.min(V.years, Math.max(0, Math.round(raw * 2) / 2)));
  }

  function step(delta: number) {
    setT((prev) =>
      Math.min(V.years, Math.max(0, (prev ?? V.years / 2) + delta))
    );
  }

  const vPort = t === null ? null : at(t, V.cagr);
  const vBase = t === null ? null : at(t, V.baselineCagr);

  return (
    <Figure
      accent={VIZ.s3}
      title="What ~27% a year does to $35,000"
      takeaway={`$35,000 became $91,000. Money growing at a normal long-run market return of about 10% a year would have reached roughly ${money(END_BASE)} over the same stretch. Most of that gap opens up in the last two years — that is what compounding does, and it is the argument for a repeatable method over one good call.`}
      subtitle={`The formula compounded at roughly ${(V.cagr * 100).toFixed(1)}% and took the portfolio from $35k to $91k — about ${V.years} years at that rate — against a ${(V.baselineCagr * 100).toFixed(0)}% long-run reference.`}
      source="$35k to $91k at ~27% CAGR — the compounding path implied by the endpoints, not a record of actual positions. Intermediate points are arithmetic, not marks; the axis is deliberately undated. The reference line is a flat 10%/yr, not a dated S&P return over the same window. CAGR means compound annual growth rate: the single yearly rate that turns the starting figure into the ending one."
      legend={
        <Legend
          items={[
            { color: VIZ.s3, label: `VSD formula · ${(V.cagr * 100).toFixed(1)}% a year` },
            { color: VIZ.muted, label: V.baselineLabel, dashed: true },
          ]}
        />
      }
    >
      <ChartScroll>
        <svg
          ref={ref}
          viewBox={`0 0 ${W} ${H}`}
          className="viz-focus w-full touch-none rounded-lg"
          role="img"
          tabIndex={0}
          aria-label={`Compounding curve from $35,000 to about $91,000 over ${V.years} years at 27% a year, against a 10% a year reference line ending near $51,000. Use the left and right arrow keys to read any year.`}
          onPointerMove={(e) => track(e.clientX)}
          onPointerLeave={() => setT(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              step(0.5);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              step(-0.5);
            } else if (e.key === "Home") {
              e.preventDefault();
              setT(0);
            } else if (e.key === "End") {
              e.preventDefault();
              setT(V.years);
            } else if (e.key === "Escape") {
              setT(null);
            }
          }}
        >
          {[0, 25000, 50000, 75000, 100000].map((v) => (
            <GridLine
              key={v}
              y={py(v)}
              x1={PAD.l}
              x2={W - PAD.r}
              label={money(v)}
              style={fade(shown, animate, 380)}
            />
          ))}

          <polyline
            points={path(V.baselineCagr)}
            fill="none"
            stroke={VIZ.muted}
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
            style={fade(shown, animate, 560, 160)}
          />
          <polyline
            points={path(V.cagr)}
            fill="none"
            stroke={VIZ.s3}
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={1}
            style={draw(shown, animate, 1050, 240)}
          />

          {/* Endpoints — the only two real observations. */}
          {[
            { t: 0, v: V.start, d: 220 },
            { t: V.years, v: END_PORT, d: 1240 },
          ].map((p) => (
            <circle
              key={p.t}
              cx={px(p.t)}
              cy={py(p.v)}
              r={5}
              fill={VIZ.s3}
              stroke={VIZ.surface}
              strokeWidth={2}
              style={pop(shown, animate, 400, p.d)}
            />
          ))}
          <text
            x={px(V.years) - 6}
            y={py(END_PORT) - 12}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            fill={VIZ.s3}
            style={fade(shown, animate, 400, 1300)}
          >
            ${(END_PORT / 1000).toFixed(0)}k
          </text>
          <text
            x={px(0) + 8}
            y={py(V.start) - 10}
            fontSize={10}
            fontWeight={600}
            fill={VIZ.s3}
            style={fade(shown, animate, 400, 280)}
          >
            $35k
          </text>
          <text
            x={px(V.years) - 6}
            y={py(END_BASE) + 16}
            textAnchor="end"
            fontSize={9.5}
            fill={VIZ.muted}
            style={fade(shown, animate, 400, 700)}
          >
            {money(END_BASE)} at 10%
          </text>

          {/* The gap at the end, bracketed. Both ends of it are already plotted,
              so this adds no new claim — it just names the distance between the
              two lines, which is the thing the figure is about. */}
          <g style={fade(shown, animate, 460, 1420)}>
            <line
              x1={px(V.years) - 16}
              x2={px(V.years) - 16}
              y1={py(END_PORT)}
              y2={py(END_BASE)}
              stroke={VIZ.ink}
              strokeWidth={1}
              opacity={0.5}
            />
            {[py(END_PORT), py(END_BASE)].map((y) => (
              <line
                key={y}
                x1={px(V.years) - 20}
                x2={px(V.years) - 12}
                y1={y}
                y2={y}
                stroke={VIZ.ink}
                strokeWidth={1}
                opacity={0.5}
              />
            ))}
            <text
              x={px(V.years) - 24}
              y={(py(END_PORT) + py(END_BASE)) / 2 + 3.5}
              textAnchor="end"
              fontSize={9.5}
              fill={VIZ.ink}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {money(END_PORT - END_BASE)} ahead
            </text>
          </g>

          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={H - PAD.b}
            y2={H - PAD.b}
            stroke={VIZ.axis}
            strokeWidth={1}
            pathLength={1}
            style={draw(shown, animate, 620, 60)}
          />
          <g style={fade(shown, animate, 380, 240)}>
            {Array.from({ length: V.years + 1 }, (_, i) => i).map((i) => (
              <XTick key={i} x={px(i)} y={H - PAD.b + 14} label={`Year ${i}`} />
            ))}
          </g>

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
              <circle
                cx={px(t)}
                cy={py(vBase)}
                r={4}
                fill={VIZ.muted}
                stroke={VIZ.surface}
                strokeWidth={2}
              />
              <circle
                cx={px(t)}
                cy={py(vPort)}
                r={5}
                fill={VIZ.s3}
                stroke={VIZ.surface}
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      </ChartScroll>

      <Readout
        color={VIZ.s3}
        label={
          t === null
            ? `Start → after ${V.years} years, against the 10% reference`
            : `Year ${t % 1 === 0 ? t : t.toFixed(1)} · vs ${money(vBase ?? 0)} at 10%`
        }
        value={
          t === null || vPort === null
            ? `${money(V.start)} → ${money(END_PORT)}`
            : money(vPort)
        }
      />
      <p className="mt-2 text-[11px] text-neutral-500">
        Hover or drag across the chart to read any point. With the chart focused,
        the arrow keys do the same.
      </p>
    </Figure>
  );
}
