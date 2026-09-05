"use client";

import { useId, useState } from "react";
import { ERTA_ATTRIBUTION as A } from "@/content/figures";
import { Slider } from "./Figure";
import { EASE_OUT, useEased } from "./motion";
import { VIZ } from "./theme";

/**
 * The paper's headline "~12%" is one line of arithmetic on the first-differences
 * coefficient. This lets the reader run that arithmetic on any rate cut, and
 * carries the 95% interval alongside the point estimate — at 19pp the interval
 * is roughly 1%–24%, which is the honest width of the claim.
 *
 * The interval is not decoration. A single number here would read as precision
 * the estimate does not have, so the meter always shows the band and the point
 * mark together.
 */
export function AttributionSlider() {
  const [cut, setCut] = useState<number>(A.ertaCut);
  const id = useId();

  // Everything downstream reads the eased value, so dragging rolls the numbers
  // instead of snapping them a point at a time.
  const c = useEased(cut, 320);

  const pp = c * A.beta;
  const lo = c * Math.max(0, A.beta - 1.96 * A.se);
  const hi = c * (A.beta + 1.96 * A.se);
  const pct = (pp / A.observedRise) * 100;
  const pctLo = (lo / A.observedRise) * 100;
  const pctHi = (hi / A.observedRise) * 100;
  const isErta = cut === A.ertaCut;

  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-neutral-50">
        How much of the rise does the tax cut actually explain?
      </h3>
      <p className="mt-2.5 border-l-2 pl-3 text-[13px] leading-relaxed text-neutral-200" style={{ borderColor: VIZ.s1 }}>
        Cut the top tax rate by one point and the top 1%&rsquo;s share of income
        rises about five hundredths of a point that year ({A.beta}). ERTA cut it
        by {A.ertaCut} points. Run that forward and it accounts for roughly an
        eighth of the {A.observedRise}-point rise since 1980, not the whole
        story, which is the paper&rsquo;s actual claim.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-neutral-400">
        Drag to run the same arithmetic on any size of cut. The band under each
        number is the 95% interval: the range the estimate is actually
        consistent with, which is wide.
      </p>

      <label
        htmlFor={id}
        className="mt-5 flex flex-wrap items-baseline justify-between gap-2"
      >
        <span className="text-xs text-neutral-300">Cut to the top marginal rate</span>
        <span
          className="text-sm font-bold text-neutral-50"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {cut} points
        </span>
      </label>
      <Slider
        id={id}
        min={0}
        max={A.sliderMax}
        step={1}
        value={cut}
        onChange={setCut}
        accent={VIZ.s1}
        valueText={`${cut} percentage points`}
      />
      <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500">
        <span>no cut</span>
        <button
          type="button"
          onClick={() => setCut(A.ertaCut)}
          className="rounded px-1.5 py-0.5 font-medium transition-colors hover:bg-white/10 hover:text-neutral-200 motion-reduce:transition-none"
        >
          ERTA · {A.ertaCut}pp
        </button>
        <span>{A.sliderMax}pp</span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-neutral-500">
            Points of the rise it explains
          </p>
          <p
            className="mt-1 text-3xl font-bold text-neutral-50"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {pp.toFixed(2)}
            <span className="ml-1 text-base font-semibold text-neutral-400">
              of {A.observedRise}
            </span>
          </p>
          <p
            className="mt-1 text-[11px] text-neutral-500"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            somewhere between {lo.toFixed(2)} and {hi.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-neutral-500">
            As a share of the whole rise
          </p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color: VIZ.s1, fontVariantNumeric: "tabular-nums" }}
          >
            {pct.toFixed(1)}
            <span className="ml-0.5 text-base font-semibold">%</span>
          </p>
          <p
            className="mt-1 text-[11px] text-neutral-500"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            somewhere between {pctLo.toFixed(1)}% and {pctHi.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Meter: point estimate against the interval, on the same track. */}
      <div className="mt-4">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: `${clamp(pctLo)}%`,
              width: `${clamp(pctHi) - clamp(pctLo)}%`,
              backgroundColor: VIZ.s1,
              opacity: 0.28,
            }}
          />
          <div
            className="absolute inset-y-0 w-1 rounded-full"
            style={{
              left: `${clamp(pct)}%`,
              backgroundColor: VIZ.s1,
              boxShadow: `0 0 8px ${VIZ.s1}`,
              transition: `box-shadow 300ms ${EASE_OUT}`,
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
          <span>none of the rise</span>
          <span>all of it</span>
        </div>
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-neutral-500">
        {isErta ? (
          <>
            <span className="font-semibold text-neutral-300">
              At ERTA&rsquo;s actual {A.ertaCut}-point cut
            </span>{" "}
            the estimate attributes about 1.0 point, roughly 12% of the observed
            rise. The other 88% is what the complementary policies amplified: the
            10b-18 buyback regime, OBRA welfare contraction, the PAC explosion,
            and antitrust retrenchment.
          </>
        ) : (
          <>
            Drag back to {A.ertaCut} points for ERTA&rsquo;s actual cut, 70% down
            to 50% over 1981–82.
          </>
        )}
      </p>
    </div>
  );
}
