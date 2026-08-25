"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Predictive route loading.
//
// Every route on this site is statically prerendered, and `router.prefetch()`
// warms one completely: it pulls the RSC payload AND the route's JS chunks
// (measured against the live site — /research costs 6.1 kB of flight data plus
// a 19 kB chunk, ~25 kB total). Once a route is warmed, clicking it is a
// client-side render with no network in the way. So the only question worth
// engineering is WHEN to spend those bytes.
//
// The landing page is why this module exists rather than plain <Link> defaults.
// `/` ships 431 kB of JS across 13 chunks — three.js is a hard floor there (see
// CLAUDE.md) — and Next emits every one of them as <script async>, which Chrome
// fetches at LOW priority. Next's own viewport prefetching fires as soon as a
// <Link> paints, i.e. in the middle of that download, and it is low priority
// too. So the four nav links put ~100 kB on exactly the same contended pipe as
// the desk the visitor is waiting to see. On a fast connection that is
// invisible; on the slow-4G median it is real, and it is spent on a navigation
// that will not happen for several seconds if it happens at all.
//
// The fix is not "prefetch less" — it is "prefetch on a signal, and never
// before the thing already on screen has finished loading". Hence three tiers:
//
//   * intent   — pointer/focus/touch on a control. Highest confidence, fires
//                immediately, costs one route.
//   * arrival  — the deck camera parks on a section's stop. Unique to this
//                site and the strongest passive signal it has: the visitor is
//                looking at that section's copy and its CTA.
//   * idle     — everything still cold, warmed one at a time, but only after
//                the desk has painted and the browser reports idle.
//
// All three funnel through the callback `useRouteWarmer` returns, which dedupes
// and refuses to spend bandwidth it should not (see `canSpeculate`).

/** Routes already handed to `router.prefetch`. Module scope on purpose: it has
 *  to survive component remounts (the copy card unmounts on every stop change)
 *  and be shared across the nav, the deck and the hotspots, so one route is
 *  never warmed twice from two different signals. Next keeps its own prefetch
 *  cache underneath, but reaching it still re-enters the router; a Set lookup
 *  is free. */
const warmed = new Set<string>();

/** Next reports a 5-minute client-router stale time for these static routes
 *  (`x-nextjs-stale-time: 300` on the live responses). A tab parked longer than
 *  that — or restored from bfcache — should be allowed to warm again rather
 *  than trusting a Set that outlived the cache it stands for. */
const STALE_AFTER_MS = 5 * 60 * 1000;
let warmedAt = 0;

function noteWarm(href: string) {
  const now = Date.now();
  if (now - warmedAt > STALE_AFTER_MS) warmed.clear();
  warmedAt = now;
  warmed.add(href);
}

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

function connection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
}

/**
 * Whether speculative bytes are appropriate at all right now.
 *
 * The two tiers do not deserve the same budget:
 *   "intent" — the visitor has aimed at this link. Worth spending on anything
 *              short of an explicit Save-Data request or a 2G connection.
 *   "idle"   — nobody asked. Requires a connection that can afford to be
 *              wrong, and a tab that is actually on screen.
 *
 * `effectiveType` is Chromium-only; Safari and Firefox report nothing, which
 * reads here as "no reason to hold back" rather than as "slow". That is the
 * right default — treating unknown as slow would switch predictive loading off
 * for every Safari visitor, which is a large share of the mobile traffic this
 * is meant to help.
 */
function canSpeculate(tier: "intent" | "idle"): boolean {
  if (typeof document === "undefined") return false;

  const c = connection();
  // An explicit user preference. Never overridden, at either tier.
  if (c?.saveData) return false;

  const eff = c?.effectiveType;
  if (eff === "slow-2g" || eff === "2g") return false;

  if (tier === "idle") {
    // 3g loads this site fine, but it cannot afford 100 kB of guesses next to a
    // 431 kB landing page. Intent-driven warming still works there.
    if (eff && eff !== "4g") return false;
    // A background tab may never be looked at again. Warming resumes on
    // visibilitychange — see `useIdleRouteWarm`.
    if (document.visibilityState !== "visible") return false;
  }
  return true;
}

/** Minimum gap between two speculative warms.
 *
 *  This exists because `requestIdleCallback` does NOT space its callbacks out,
 *  which is easy to assume and wrong. rIC only promises "not while the main
 *  thread is busy" — and once the desk has painted the thread is extremely
 *  quiet, which is precisely when this sweep runs. Measured on the built page,
 *  scheduling each warm from the previous one's rIC fired all four routes
 *  inside 14 ms: a four-way concurrent burst, i.e. exactly the contention the
 *  sequential design was meant to avoid.
 *
 *  rIC also knows nothing about the NETWORK, which is the resource actually
 *  being rationed here. So idleness and spacing are two separate mechanisms:
 *  `onIdle` waits for a quiet main thread, this waits for a quiet pipe.
 *  300 ms spreads four routes over ~0.9 s — far quicker than anyone reads a
 *  stop and clicks, and slow enough that each warm gets its own window. */
const IDLE_GAP_MS = 300;

/** `requestIdleCallback` with a `setTimeout` fallback — Safari only shipped rIC
 *  in 16.4. Returns its own canceller so callers do not have to branch.
 *  Spacing is NOT this function's job; see `IDLE_GAP_MS`. */
function onIdle(fn: () => void, timeout = 2000): () => void {
  const w = window as Window & {
    requestIdleCallback?: (
      cb: IdleRequestCallback,
      o?: { timeout: number }
    ) => number;
    cancelIdleCallback?: (h: number) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    const h = w.requestIdleCallback(() => fn(), { timeout });
    return () => w.cancelIdleCallback?.(h);
  }
  const h = window.setTimeout(fn, 1);
  return () => window.clearTimeout(h);
}

export type WarmTier = "intent" | "idle";
export type Warm = (href: string, tier?: WarmTier) => void;

/**
 * The one way anything on this site warms a route. Returns a stable callback,
 * so it drops straight into an event handler or a dependency array.
 */
export function useRouteWarmer(): Warm {
  const router = useRouter();

  return useCallback(
    (href: string, tier: WarmTier = "intent") => {
      if (!href || warmed.has(href)) return;
      if (!canSpeculate(tier)) return;
      noteWarm(href);
      try {
        router.prefetch(href);
      } catch {
        // A prefetch is a nice-to-have by definition. If the router refuses
        // (mid-navigation, route gone), the click still works — it just pays
        // for the fetch then. Drop the mark so a later signal can retry.
        warmed.delete(href);
      }
    },
    [router]
  );
}

/**
 * Event handlers that express "this control is about to be used". Spread onto a
 * <button> or a <Link>. Covers three input models deliberately:
 *   onPointerEnter — mouse/trackpad hover, the classic ~200 ms head start.
 *   onFocus        — keyboard tabbing, which otherwise gets no prediction at
 *                    all and is the path assistive tech takes.
 *   onPointerDown  — touch, where there is no hover. Buys the ~100 ms between
 *                    finger-down and the click that fires on lift.
 *
 * Adds no DOM and no styling; it is purely behavioural, so it cannot move a
 * pixel of the deck.
 */
export function intentProps(warm: Warm, href: string | null | undefined) {
  if (!href) return {};
  const fire = () => warm(href, "intent");
  return { onPointerEnter: fire, onFocus: fire, onPointerDown: fire };
}

/**
 * Warm `hrefs` one at a time, once `enabled` goes true and the browser is idle.
 *
 * Sequential rather than parallel on purpose: four concurrent prefetches is a
 * burst that looks exactly like the contention this module exists to remove.
 * One at a time, each waiting for the next idle window, keeps speculative bytes
 * behind whatever the page is genuinely doing.
 *
 * `enabled` is the caller's "the visible thing has finished loading" signal —
 * on the deck that is the canvas's first frame.
 */
export function useIdleRouteWarm(hrefs: string[], enabled: boolean) {
  const warm = useRouteWarmer();
  // Keeps the effect from restarting the queue just because the caller passed a
  // fresh array literal on a re-render (the deck re-renders on every stop).
  const key = hrefs.join("|");
  const warmRef = useRef(warm);
  warmRef.current = warm;

  useEffect(() => {
    if (!enabled || !key) return;
    const list = key.split("|");
    let i = 0;
    let cancel: (() => void) | null = null;
    let stopped = false;

    // Two gates in series: wait out `delay` on the clock, then wait for the
    // main thread to be idle. Neither alone is enough — see `IDLE_GAP_MS`.
    const schedule = (delay: number) => {
      const t = window.setTimeout(() => {
        cancel = onIdle(pump);
      }, delay);
      cancel = () => window.clearTimeout(t);
    };

    const pump = () => {
      if (stopped) return;
      // Skip past anything another signal warmed while this waited.
      while (i < list.length && warmed.has(list[i])) i++;
      if (i >= list.length) return;
      if (!canSpeculate("idle")) return; // resumes on visibilitychange
      warmRef.current(list[i++], "idle");
      if (i < list.length) schedule(IDLE_GAP_MS);
    };

    schedule(0); // the first one has nothing to be spaced from

    // A tab opened in the background — a link opened in a new tab, a restored
    // session — never becomes idle-eligible above, and `pump` returns without
    // rescheduling, so the queue parks. Pick it back up the moment the tab is
    // actually looked at.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        cancel?.();
        schedule(0);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stopped = true;
      cancel?.();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, key]);
}
