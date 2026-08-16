"use client";

import { PEAK_TO_PEAK } from "@/content/figures";
import { fade, growY, useReveal } from "./motion";
import { VIZ } from "./theme";

// Ordinal, not categorical: swapping the grades would change the meaning, so
// this takes one hue in monotone steps rather than four identities. There is no
// per-year membership figure published, so the 85 is shown once as an endpoint
// and no growth curve is drawn.
const STEP_OPACITY = [0.3, 0.45, 0.7, 1];

export function ClubLadder() {
  const { ref, shown, animate } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
    >
      <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-neutral-50">
        Four years, member to president
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-neutral-400">
        Peak to Peak Finance Club, ninth grade through twelfth.
      </p>

      <ol className="mt-5 grid grid-cols-4 gap-2">
        {PEAK_TO_PEAK.map((r, i) => (
          <li key={r.grade} className="flex flex-col">
            <span
              aria-hidden
              className="block rounded-sm"
              style={{
                height: 8 + i * 9,
                backgroundColor: VIZ.s3,
                opacity: STEP_OPACITY[i],
                marginTop: "auto",
                ...growY(shown, animate, 560, i * 90),
              }}
            />
            <span
              className="mt-2 text-[10px] uppercase tracking-wider text-neutral-500"
              style={fade(shown, animate, 380, i * 90 + 120)}
            >
              {r.grade}
            </span>
            <span
              className="text-xs font-semibold"
              style={{
                color: i === PEAK_TO_PEAK.length - 1 ? VIZ.s3 : "#d4d4d4",
                ...fade(shown, animate, 380, i * 90 + 180),
              }}
            >
              {r.role}
            </span>
          </li>
        ))}
      </ol>

      <dl className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-neutral-500">
            Membership grown to
          </dt>
          <dd className="mt-0.5 text-2xl font-bold text-neutral-50">85</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-neutral-500">
            CEE Personal Finance Challenge
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-neutral-200">
            State Champion / National Semifinalist
          </dd>
        </div>
      </dl>
    </div>
  );
}
