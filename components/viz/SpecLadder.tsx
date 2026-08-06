"use client";

import { useState } from "react";
import { ERTA_SPECS } from "@/content/figures";
import { VERDICT } from "./theme";

/**
 * All seven specifications, including the two that return nulls and the placebo
 * that cuts against a naive causal reading. Showing the whole specification
 * curve rather than the significant slice is the point of this component — do
 * not filter it down to the results that agree with the thesis.
 */
export function SpecLadder() {
  const [open, setOpen] = useState<string | null>("fd");
  const signals = ERTA_SPECS.filter((s) => s.verdict === "signal").length;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-100">
          Every specification we ran, including the ones that found nothing
        </h3>
        <p className="text-[11px] text-neutral-500">
          {signals} of {ERTA_SPECS.length} reject the null
        </p>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
        Five of these are in the paper; the panel regression and the event study
        are in its methodology companion. Select any row to see what it tests,
        what it found, and where it is weak.
      </p>

      <ul className="mt-4 space-y-2">
        {ERTA_SPECS.map((s) => {
          const v = VERDICT[s.verdict];
          const isOpen = open === s.id;
          return (
            <li
              key={s.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
            >
              <h4>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04] motion-reduce:transition-none"
                >
                  <span
                    aria-hidden
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: v.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold text-neutral-100">
                        {s.name}
                      </span>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: v.color }}
                      >
                        {v.word}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-400">
                      {s.question}
                    </span>
                    <span
                      className="mt-1 block text-xs font-semibold text-neutral-200"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {s.stat}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`mt-1 shrink-0 text-neutral-500 transition-transform motion-reduce:transition-none ${isOpen ? "rotate-90" : ""}`}
                  >
                    ›
                  </span>
                </button>
              </h4>
              {isOpen && (
                <div className="border-t border-white/10 px-4 py-3">
                  <p className="text-xs leading-relaxed text-neutral-300">
                    {s.finding}
                  </p>
                  {s.caveat && (
                    <p className="mt-3 border-l-2 pl-3 text-xs leading-relaxed text-neutral-400" style={{ borderColor: v.color }}>
                      <span className="font-semibold text-neutral-300">
                        Where it is weak:{" "}
                      </span>
                      {s.caveat}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
