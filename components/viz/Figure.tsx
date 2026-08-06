"use client";

import type { CSSProperties, ReactNode } from "react";
import { VIZ } from "./theme";

/**
 * Shared frame for every subpage figure.
 *
 * Reading order is deliberate and is the whole point of this component:
 *
 *   title      — what the chart is about, phrased as a claim, not a variable
 *   takeaway   — ONE plain sentence a reader with no statistics gets on sight
 *   subtitle   — the technical framing, with the notation, kept as a subline
 *   chart
 *   source     — provenance, behind a disclosure
 *
 * The takeaway leads and the notation follows it. The notation is never
 * removed: a page whose credibility rests on real econometrics cannot hide its
 * statistics, so `subtitle` stays visible and only the long provenance note
 * collapses.
 *
 * The card surface here is what components/viz/theme.ts validated the series
 * colors against — if `bg-white/[0.03]` changes, re-run the validator.
 */
export function Figure({
  title,
  takeaway,
  subtitle,
  source,
  children,
  legend,
  accent = VIZ.s1,
}: {
  title: string;
  takeaway?: string;
  subtitle?: string;
  source?: string;
  legend?: ReactNode;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <figure className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <figcaption>
          <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-neutral-50">
            {title}
          </h3>
          {takeaway && (
            <p
              className="mt-2.5 border-l-2 pl-3 text-[13px] leading-relaxed text-neutral-200"
              style={{ borderColor: accent }}
            >
              {takeaway}
            </p>
          )}
          {subtitle && (
            <p className="mt-3 text-xs leading-relaxed text-neutral-400">
              {subtitle}
            </p>
          )}
        </figcaption>
        {legend && <div className="mt-4">{legend}</div>}
        <div className="mt-4">{children}</div>
      </div>

      {source ? (
        <details className="viz-note mt-4 border-t border-white/10">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-300 sm:px-5">
            <span aria-hidden className="viz-chev text-neutral-600">
              ›
            </span>
            Data &amp; method
          </summary>
          <p className="px-4 pb-4 pl-9 text-[11px] leading-relaxed text-neutral-500 sm:px-5 sm:pl-10">
            {source}
          </p>
        </details>
      ) : (
        <div className="h-4 sm:h-5" />
      )}
    </figure>
  );
}

/**
 * Horizontal scroller for the SVG charts.
 *
 * Every chart is authored against a 640-unit viewBox. `w-full` alone makes that
 * box shrink to the container, and on a 375px phone the figure area is ~309px —
 * a 0.48x downscale that renders the 9px axis labels at 4.4px. So the plot keeps
 * its design width and the overflow scrolls instead. On desktop the figure is
 * wider than 640, min-width never binds, and nothing scrolls.
 *
 * Wrap ONLY the svg. HTML controls (sliders, readouts) reflow fine and must stay
 * outside, or they inherit the 640px floor and scroll for no reason.
 */
export function ChartScroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:-mx-5 sm:px-5">
      <div className="min-w-[640px]">{children}</div>
    </div>
  );
}

/**
 * Legend row. Present whenever a figure carries two or more series, so identity
 * is never color-alone (the swatch is paired with its name).
 */
export function Legend({
  items,
}: {
  items: { color: string; label: string; dashed?: boolean }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-[3px] w-5 rounded-full"
            style={
              it.dashed
                ? {
                    backgroundImage: `repeating-linear-gradient(90deg, ${it.color} 0 4px, transparent 4px 7px)`,
                  }
                : { backgroundColor: it.color }
            }
          />
          <span className="text-[11px] leading-tight text-neutral-300">
            {it.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Value strip under an interactive chart.
 *
 * The charts used to print their hover value into a small SVG tooltip. On a
 * phone that tooltip is inside the horizontal scroller and sized in viewBox
 * units, so it was both hard to hit and rendered small. This is plain HTML
 * below the plot: always visible, always full size, and it carries a useful
 * summary before the reader has touched anything.
 */
export function Readout({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <span className="text-[11px] leading-tight text-neutral-400">{label}</span>
      <span
        className="text-sm font-bold leading-tight"
        style={{
          color: color ?? VIZ.inkStrong,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Range input styled by `.viz-range` in app/globals.css. The accent and the
 * filled portion of the track are passed down as custom properties so one rule
 * serves both pages' hues without either color being restated in CSS.
 */
export function Slider({
  id,
  min,
  max,
  step,
  value,
  onChange,
  accent,
  valueText,
}: {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  accent: string;
  valueText?: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-valuetext={valueText}
      className="viz-range mt-2.5 w-full"
      style={
        {
          "--viz-accent": accent,
          "--viz-fill": `${fill}%`,
        } as CSSProperties
      }
    />
  );
}

/** Recessive horizontal gridline + its axis label. */
export function GridLine({
  y,
  x1,
  x2,
  label,
  style,
}: {
  y: number;
  x1: number;
  x2: number;
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <g style={style}>
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={VIZ.grid} strokeWidth={1} />
      {label && (
        <text
          x={x1 - 6}
          y={y + 3.5}
          textAnchor="end"
          fontSize={9}
          fill={VIZ.ink}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Tick label on the x axis. */
export function XTick({
  x,
  y,
  label,
  anchor = "middle",
}: {
  x: number;
  y: number;
  label: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={9}
      fill={VIZ.ink}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {label}
    </text>
  );
}
