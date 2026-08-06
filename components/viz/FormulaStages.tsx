"use client";

import { useState } from "react";
import { VSD_STAGES } from "@/content/figures";
import { VIZ } from "./theme";

/**
 * The three published pillars of the VSD formula, as a stepper. Deliberately
 * describes the mechanism only — there are no sub-factors or weights here,
 * because none are published, and inventing a scorecard would put fake numbers
 * on a page whose whole claim is a real track record.
 */
export function FormulaStages() {
  const [active, setActive] = useState(0);
  const stage = VSD_STAGES[active];

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-neutral-100">
        The formula, in three passes
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
        Each pass removes a different kind of mistake. Step through them.
      </p>

      {/* Stage rail. */}
      <ol className="mt-4 grid grid-cols-3 gap-2">
        {VSD_STAGES.map((s, i) => {
          const on = i === active;
          const done = i < active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={on ? "step" : undefined}
                className="group w-full text-left"
              >
                <span
                  aria-hidden
                  className="block h-1 w-full rounded-full transition-colors motion-reduce:transition-none"
                  style={{
                    backgroundColor: on || done ? VIZ.s3 : "rgba(255,255,255,0.10)",
                  }}
                />
                <span
                  className="mt-2 block text-[10px] font-semibold uppercase tracking-wider transition-colors motion-reduce:transition-none"
                  style={{ color: on ? VIZ.s3 : "#737373" }}
                >
                  {i + 1} · {s.label}
                </span>
                <span
                  className={`mt-0.5 block text-xs leading-snug transition-colors motion-reduce:transition-none ${
                    on ? "text-neutral-200" : "text-neutral-500 group-hover:text-neutral-400"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="text-sm leading-relaxed text-neutral-300">{stage.body}</p>
        <p
          className="mt-3 border-l-2 pl-3 text-xs leading-relaxed text-neutral-400"
          style={{ borderColor: VIZ.s3 }}
        >
          <span className="font-semibold text-neutral-300">In practice: </span>
          {stage.example}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06] disabled:opacity-30 motion-reduce:transition-none"
        >
          ← Previous
        </button>
        <span className="text-[11px] text-neutral-500">
          {active + 1} of {VSD_STAGES.length}
        </span>
        <button
          type="button"
          onClick={() => setActive((a) => Math.min(VSD_STAGES.length - 1, a + 1))}
          disabled={active === VSD_STAGES.length - 1}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/[0.06] disabled:opacity-30 motion-reduce:transition-none"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
