"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Motion vocabulary for the subpage figures.
 *
 * Every chart here is hand-rolled SVG, so reveals are CSS transitions on
 * presentation attributes rather than a JS animation loop: the compositor keeps
 * them off the main thread and React re-renders exactly once per figure, when
 * it enters the viewport. Nothing re-renders while a line draws itself.
 *
 * The load-bearing rule is the reduced-motion one. `shown` must ALREADY be true
 * on the first render for a visitor who prefers reduced motion, or the element
 * mounts at its "before" value and the correction animates — the exact thing
 * they asked not to see. `useReveal` guarantees that, and every helper takes the
 * `animate` flag it returns so it can drop the `transition` shorthand outright
 * rather than relying on the duration being short.
 */

/** Decelerating — quick to leave, long to settle. Fades and pops. */
export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
/** Eased at both ends. Reads better on a line drawing across a chart. */
export const EASE_DRAW = "cubic-bezier(0.37, 0, 0.19, 1)";
/** EASE_OUT in the tuple form framer-motion's `ease` prop wants. */
export const EASE_OUT_POINTS: [number, number, number, number] = [
  0.16, 1, 0.3, 1,
];

/**
 * Fires once, when the element is a quarter visible. Attach `ref` to the `<svg>`
 * (or whichever node defines the figure's box) and gate every helper below on
 * the returned flags.
 */
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const animate = !reduced;
  return { ref, shown: animate ? inView : true, animate };
}

/**
 * Draws a stroke on. The element MUST carry `pathLength={1}`, which renormalises
 * its length to 1 so a single dash of 1 covers it whatever its real geometry is
 * — that is what lets one helper serve `<line>`, `<polyline>` and `<path>`
 * without measuring any of them.
 */
export function draw(
  shown: boolean,
  animate: boolean,
  ms = 900,
  delay = 0
): CSSProperties {
  return {
    strokeDasharray: "1",
    strokeDashoffset: shown ? "0" : "1",
    transition: animate
      ? `stroke-dashoffset ${ms}ms ${EASE_DRAW} ${delay}ms`
      : "none",
  };
}

/** Fades a mark, a label, or a whole `<g>` in. */
export function fade(
  shown: boolean,
  animate: boolean,
  ms = 420,
  delay = 0
): CSSProperties {
  return {
    opacity: shown ? 1 : 0,
    transition: animate ? `opacity ${ms}ms ${EASE_OUT} ${delay}ms` : "none",
  };
}

/**
 * Fade plus a scale-up from the mark's own centre. `transformBox: fill-box` is
 * required: without it an SVG transform-origin resolves against the viewBox
 * origin, so a dot at x=600 would fly in from the left edge instead of growing
 * in place.
 */
export function pop(
  shown: boolean,
  animate: boolean,
  ms = 380,
  delay = 0
): CSSProperties {
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? "scale(1)" : "scale(0.4)",
    transformBox: "fill-box",
    transformOrigin: "center",
    transition: animate
      ? `opacity ${ms}ms ${EASE_OUT} ${delay}ms, transform ${ms}ms ${EASE_OUT} ${delay}ms`
      : "none",
  };
}

/** Grows a bar from its baseline. For HTML bars, not SVG. */
export function growY(
  shown: boolean,
  animate: boolean,
  ms = 620,
  delay = 0
): CSSProperties {
  return {
    transform: shown ? "scaleY(1)" : "scaleY(0)",
    transformOrigin: "bottom",
    transition: animate ? `transform ${ms}ms ${EASE_OUT} ${delay}ms` : "none",
  };
}

/**
 * Eases a number toward `target` so a slider's readouts roll rather than jump.
 *
 * Hand-rolled rather than a spring: these drive text and chart geometry, and a
 * spring's overshoot would print values the underlying model never produces
 * (a share above 100%, a year past the end of the series).
 */
export function useEased(target: number, ms = 420) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(target);
  const state = useRef({ from: target, to: target, cur: target, t0: 0, raf: 0 });

  useEffect(() => {
    const s = state.current;

    if (reduced || ms <= 0) {
      s.from = target;
      s.to = target;
      s.cur = target;
      setValue(target);
      return;
    }
    if (s.to === target) return;

    s.from = s.cur;
    s.to = target;
    s.t0 = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - s.t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      s.cur = s.from + (s.to - s.from) * eased;
      setValue(s.cur);
      if (p < 1) s.raf = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s.raf);
  }, [target, ms, reduced]);

  return value;
}
