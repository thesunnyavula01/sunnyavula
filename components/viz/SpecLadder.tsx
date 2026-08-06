"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ERTA_SPECS } from "@/content/figures";
import { EASE_OUT_POINTS } from "./motion";
import { VERDICT } from "./theme";

/**
 * All seven specifications, including the two that return nulls and the placebo
 * that cuts against a naive causal reading. Showing the whole specification
 * curve rather than the significant slice is the point of this component — do
 * not filter it down to the results that agree with the thesis.
 *
 * Each row reads plain-first: the question in ordinary English, then the answer
 * in ordinary English, then the gloss, then the notation. A reader who stops at
 * the second line still gets the result; a reader who wants `F(2, 61) = 86.03`
 * finds it without opening anything.
 */
export function SpecLadder() {
  const [open, setOpen] = useState<string | null>("fd");
  const reduced = useReducedMotion();
  const signals = ERTA_SPECS.filter((s) => s.verdict === "signal").length;
  const nulls = ERTA_SPECS.length - signals;

  return (
    <div className="mt-6">
      <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-neutral-50">
        Every test we ran, including the two that found nothing
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-neutral-400">
        Five of these are in the paper; the panel regression and the event study
        are in its methodology companion. Open any row for the full finding and
        where it is weak.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { n: signals, ...VERDICT.signal },
          { n: nulls, ...VERDICT.null },
        ].map((v) => (
          <span
            key={v.word}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: `${v.color}1f`, color: v.color }}
          >
            {v.n} {v.word.toLowerCase()}
          </span>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {ERTA_SPECS.map((s, i) => {
          const v = VERDICT[s.verdict];
          const isOpen = open === s.id;
          return (
            <li
              key={s.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] transition-colors hover:border-white/20 motion-reduce:transition-none"
            >
              <h4>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03] motion-reduce:transition-none"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: `${v.color}24`, color: v.color }}
                  >
                    {i + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        {s.name}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${v.color}1f`,
                          color: v.color,
                        }}
                      >
                        {v.word}
                      </span>
                    </span>

                    <span className="mt-1.5 block text-sm font-semibold leading-snug text-neutral-100">
                      {s.question}
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-neutral-300">
                      {s.answer}
                    </span>
                    <span className="mt-1.5 block text-[11px] leading-relaxed text-neutral-500">
                      {s.plainStat}
                    </span>
                    <span
                      className="mt-2 inline-block rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-neutral-300"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {s.stat}
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className={`mt-0.5 shrink-0 text-lg leading-none text-neutral-600 transition-transform duration-200 motion-reduce:transition-none ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  >
                    ›
                  </span>
                </button>
              </h4>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.32,
                      ease: EASE_OUT_POINTS,
                    }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="border-t border-white/10 px-4 py-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                        What it found
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-neutral-300">
                        {s.finding}
                      </p>
                      {s.caveat && (
                        <p
                          className="mt-3 border-l-2 pl-3 text-xs leading-relaxed text-neutral-400"
                          style={{ borderColor: v.color }}
                        >
                          <span className="font-semibold text-neutral-300">
                            Where it is weak:{" "}
                          </span>
                          {s.caveat}
                        </p>
                      )}
                      <p className="mt-3 text-[10px] text-neutral-600">
                        In the notation: {v.technical}.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
