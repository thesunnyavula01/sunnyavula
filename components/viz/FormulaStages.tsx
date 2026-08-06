"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { VSD_STAGES } from "@/content/figures";
import { EASE_OUT_POINTS } from "./motion";
import { VIZ } from "./theme";

/**
 * The three published pillars of the VSD formula, as a stepper. Deliberately
 * describes the mechanism only — there are no sub-factors or weights here,
 * because none are published, and inventing a scorecard would put fake numbers
 * on a page whose whole claim is a real track record.
 *
 * The panel animates its own height (`layout`) rather than being pinned to a
 * fixed min-height: the three bodies are different lengths, and a min-height
 * tall enough for the longest leaves a visible hole under the shortest.
 */
export function FormulaStages() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const stage = VSD_STAGES[active];
  const dur = reduced ? 0 : 0.24;

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-neutral-50">
        The formula, in three passes
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-neutral-400">
        Each pass throws out a different kind of mistake: buying the wrong thing,
        buying the right thing at the wrong time, and buying the right thing at
        the right time from the wrong company. Step through them.
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
                  className="block h-1 w-full rounded-full transition-colors duration-300 motion-reduce:transition-none"
                  style={{
                    backgroundColor:
                      on || done ? VIZ.s3 : "rgba(255,255,255,0.10)",
                  }}
                />
                <span className="mt-2 flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-colors duration-300 motion-reduce:transition-none"
                    style={{
                      backgroundColor: on || done ? `${VIZ.s3}2e` : "transparent",
                      color: on || done ? VIZ.s3 : "#737373",
                      border: on || done ? "none" : "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 motion-reduce:transition-none"
                    style={{ color: on ? VIZ.s3 : "#737373" }}
                  >
                    {s.label}
                  </span>
                </span>
                <span
                  className={`mt-1 block text-xs leading-snug transition-colors duration-300 motion-reduce:transition-none ${
                    on
                      ? "text-neutral-200"
                      : "text-neutral-500 group-hover:text-neutral-400"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <motion.div
        layout
        transition={{ duration: reduced ? 0 : 0.3, ease: EASE_OUT_POINTS }}
        className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-4"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: dur, ease: EASE_OUT_POINTS }}
          >
            <p className="text-sm leading-relaxed text-neutral-300">
              {stage.body}
            </p>
            <p
              className="mt-3 border-l-2 pl-3 text-xs leading-relaxed text-neutral-400"
              style={{ borderColor: VIZ.s3 }}
            >
              <span className="font-semibold text-neutral-300">In practice: </span>
              {stage.example}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white/25 hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-transparent motion-reduce:transition-none"
        >
          ← Previous
        </button>
        <span className="text-[11px] text-neutral-500">
          {active + 1} of {VSD_STAGES.length}
        </span>
        <button
          type="button"
          onClick={() =>
            setActive((a) => Math.min(VSD_STAGES.length - 1, a + 1))
          }
          disabled={active === VSD_STAGES.length - 1}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white/25 hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-transparent motion-reduce:transition-none"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
