"use client";

import type { ReactNode } from "react";
import { VIZ } from "./theme";

/**
 * Shared frame for every subpage figure: caption above, chart, source note
 * below. The card surface here is what components/viz/theme.ts validated the
 * series colors against — if this background changes, re-run the validator.
 */
export function Figure({
  title,
  subtitle,
  source,
  children,
  legend,
}: {
  title: string;
  subtitle?: string;
  source?: string;
  legend?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <figcaption>
        <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {subtitle}
          </p>
        )}
      </figcaption>
      {legend && <div className="mt-3">{legend}</div>}
      <div className="mt-4">{children}</div>
      {source && (
        <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-neutral-500">
          {source}
        </p>
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
            className="h-0.5 w-4 rounded-full"
            style={
              it.dashed
                ? {
                    backgroundImage: `repeating-linear-gradient(90deg, ${it.color} 0 4px, transparent 4px 7px)`,
                  }
                : { backgroundColor: it.color }
            }
          />
          <span className="text-[11px] text-neutral-300">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Recessive horizontal gridline + its axis label. */
export function GridLine({
  y,
  x1,
  x2,
  label,
}: {
  y: number;
  x1: number;
  x2: number;
  label?: string;
}) {
  return (
    <g>
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
