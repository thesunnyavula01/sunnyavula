"use client";

import { useId, useState } from "react";
import { ERTA_ATTRIBUTION as A } from "@/content/figures";
import { VIZ } from "./theme";

/**
 * The paper's headline "~12%" is one line of arithmetic on the first-differences
 * coefficient. This lets the reader run that arithmetic on any rate cut, and
 * carries the 95% interval alongside the point estimate — at 19pp the interval
 * is roughly 1%–24%, which is the honest width of the claim.
 */
export function AttributionSlider() {
  const [cut, setCut] = useState<number>(A.ertaCut);
  const id = useId();

  const pp = cut * A.beta;
  const lo = cut * Math.max(0, A.beta - 1.96 * A.se);
  const hi = cut * (A.beta + 1.96 * A.se);
  const pct = (pp / A.observedRise) * 100;
  const pctLo = (lo / A.observedRise) * 100;
  const pctHi = (hi / A.observedRise) * 100;
  const isErta = cut === A.ertaCut;

  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-neutral-100">
        How much of the rise does the cut actually explain?
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
        The first-differences estimate is β = −{A.beta} — a 1pp cut in the top
        marginal rate moves the top 1% share {A.beta}pp the same year. Run it
        forward against the {A.observedRise}pp rise observed between 1980 and
        2024.
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
          {cut}pp
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={A.sliderMax}
        step={1}
        value={cut}
        onChange={(e) => setCut(Number(e.target.value))}
        className="mt-2 w-full accent-[#808fdb]"
      />
      <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
        <span>0</span>
        <button
          type="button"
          onClick={() => setCut(A.ertaCut)}
          className="rounded px-1.5 py-0.5 transition hover:bg-white/10 hover:text-neutral-300 motion-reduce:transition-none"
        >
          ERTA · {A.ertaCut}pp
        </button>
        <span>{A.sliderMax}pp</span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-neutral-500">
            Attributable rise
          </p>
          <p
            className="mt-1 text-3xl font-bold text-neutral-50"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {pp.toFixed(2)}
            <span className="ml-1 text-base font-semibold text-neutral-400">pp</span>
          </p>
          <p
            className="mt-1 text-[11px] text-neutral-500"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            95% interval {lo.toFixed(2)}–{hi.toFixed(2)}pp
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-neutral-500">
            Share of the {A.observedRise}pp rise
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
            95% interval {pctLo.toFixed(1)}–{pctHi.toFixed(1)}%
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
            style={{ left: `${clamp(pct)}%`, backgroundColor: VIZ.s1 }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
          <span>0% of the rise</span>
          <span>100%</span>
        </div>
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-neutral-500">
        {isErta ? (
          <>
            <span className="font-semibold text-neutral-300">
              At ERTA&rsquo;s actual {A.ertaCut}pp cut
            </span>{" "}
            the estimate attributes about 1.0pp — roughly 12% of the observed
            rise. The other 88% is what the complementary policies amplified: the
            10b-18 buyback regime, OBRA welfare contraction, the PAC explosion,
            and antitrust retrenchment.
          </>
        ) : (
          <>
            Drag back to {A.ertaCut}pp for ERTA&rsquo;s actual cut, 70% to 50%
            over 1981–82.
          </>
        )}
      </p>
    </div>
  );
}
