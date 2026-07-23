"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { sections, SITE } from "@/content/sections";
import { ACCENTS, PALETTE } from "./palette";

// Canvas is client-only (WebGL) — never server-render it. Kept behind a dynamic
// import so three.js stays code-split off the shared bundle.
const DeskCanvas = dynamic(() => import("./DeskCanvas"), { ssr: false });

// Stops: 0 = aerial overview / intro, 1..4 = one per section (must stay in sync
// with the camera keyframes in CameraRig.tsx).
const STOPS = sections.length + 1;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pad = (n: number) => String(n).padStart(2, "0");

/* ------------------------- fallback (small / no-WebGL) ------------------------- */

function FallbackHero() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-8 bg-[#f4ede1] px-6 pb-16 pt-28 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b3265c]">
          Boulder, Colorado
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
          My name is {SITE.name}.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-neutral-700">
          Research, a dev agency, markets, and leadership — all on one desk.
        </p>
      </div>
      <Image
        src="/hero-fallback.svg"
        alt="Aerial view of a desk with a stack of papers, a laptop, a trading monitor, and a gavel with a microphone"
        width={1600}
        height={1000}
        priority
        unoptimized
        className="w-full max-w-xl rounded-3xl shadow-[0_24px_60px_-24px_rgba(80,50,20,0.35)] ring-1 ring-black/5"
      />
      <nav aria-label="Sections" className="flex flex-wrap justify-center gap-2">
        {sections.map((s, i) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: ACCENTS[i] }}
          >
            {s.nav}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/* --------------------------------- the deck --------------------------------- */

export function DeskScene() {
  const [stop, setStop] = useState(0);
  const stopRef = useRef(0); // target stop, read every frame by the camera rig
  const lockUntil = useRef(0);
  const wheelAcc = useRef(0);
  const lastWheel = useRef(0);
  const touchY = useRef<number | null>(null);
  const touchDone = useRef(false);
  const deckRef = useRef<HTMLElement>(null);

  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [small, setSmall] = useState(false);
  const [hidden, setHidden] = useState(false);

  const fallback = !webgl || small;

  const goTo = useCallback((next: number) => {
    const n = clamp(next, 0, STOPS - 1);
    if (n === stopRef.current) return;
    stopRef.current = n;
    setStop(n);
  }, []);

  const step = useCallback(
    (dir: number) => goTo(Math.round(stopRef.current) + dir),
    [goTo]
  );

  // Capability + preference detection.
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
    const mqSmall = window.matchMedia("(max-width: 640px)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onSmall = () => setSmall(mqSmall.matches);
    const onReduced = () => setReduced(mqReduced.matches);
    onSmall();
    onReduced();
    mqSmall.addEventListener("change", onSmall);
    mqReduced.addEventListener("change", onReduced);
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mqSmall.removeEventListener("change", onSmall);
      mqReduced.removeEventListener("change", onReduced);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Stepped scroll-wheel: each gesture advances exactly one stop.
  useEffect(() => {
    if (fallback) return;
    const el = deckRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      e.preventDefault();
      const now = performance.now();
      if (now < lockUntil.current) return;
      if (now - lastWheel.current > 220) wheelAcc.current = 0;
      lastWheel.current = now;
      wheelAcc.current += e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      if (Math.abs(wheelAcc.current) > 55) {
        step(wheelAcc.current > 0 ? 1 : -1);
        lockUntil.current = now + 750;
        wheelAcc.current = 0;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY.current = e.touches[0].clientY;
      touchDone.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY.current === null) return;
      e.preventDefault();
      const dy = touchY.current - e.touches[0].clientY;
      if (!touchDone.current && Math.abs(dy) > 55) {
        touchDone.current = true;
        step(dy > 0 ? 1 : -1);
      }
    };
    const onTouchEnd = () => {
      touchY.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [fallback, step]);

  // Keyboard stepping.
  useEffect(() => {
    if (fallback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.altKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("a,button,input,textarea,select") || t.isContentEditable))
        return;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          step(1);
          break;
        case " ":
          e.preventDefault();
          step(e.shiftKey ? -1 : 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          step(-1);
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(STOPS - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fallback, step, goTo]);

  if (fallback) return <FallbackHero />;

  const section = stop > 0 ? sections[stop - 1] : null;
  const accent = stop > 0 ? ACCENTS[stop - 1] : PALETTE.berry;

  return (
    <section
      ref={deckRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio tour — scroll, use arrow keys, or the dots to move between stops"
      className="relative h-[100svh] select-none overflow-hidden overscroll-none bg-[radial-gradient(120%_120%_at_50%_0%,#f8f2e7_0%,#f4ede1_55%,#ebe1cf_100%)]"
      style={{ touchAction: "none" }}
    >
      <div
        className="absolute inset-0"
        role="img"
        aria-label="Interactive 3D desk — each object opens a section: papers for Research, laptop for ATT Agency, trading monitor for Markets, gavel and microphone for Leadership"
      >
        <DeskCanvas
          stop={stopRef}
          active={stop - 1}
          reduced={reduced}
          paused={hidden}
        />
      </div>

      <MotionConfig reducedMotion="user">
        {/* copy card, sarastotey-style, left of center */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute left-5 top-1/2 w-[min(430px,88vw)] -translate-y-1/2 sm:left-10 lg:left-16"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={stop}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="rounded-3xl bg-[#fdf6ec]/85 p-8 shadow-[0_28px_70px_-28px_rgba(80,50,20,0.4)] ring-1 ring-black/5 backdrop-blur-md sm:p-9"
            >
              <p className="font-mono text-[11px] tracking-[0.3em] text-neutral-400">
                {pad(stop + 1)} / {pad(STOPS)}
              </p>

              {section === null ? (
                <>
                  <p
                    className="mt-4 text-xs font-bold uppercase tracking-[0.25em]"
                    style={{ color: accent }}
                  >
                    Boulder, Colorado
                  </p>
                  <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl">
                    My name is {SITE.name}.
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-neutral-700 sm:text-lg">
                    Research, a dev agency, markets, and leadership — all on one
                    desk. Every object opens a chapter.
                  </p>
                  <p className="mt-4 font-mono text-[11px] tracking-wide text-neutral-400">
                    scroll to travel · hover an object · click to dive in
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="mt-4 text-xs font-bold uppercase tracking-[0.25em]"
                    style={{ color: accent }}
                  >
                    {section.nav}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-neutral-700">
                    {section.tagline}
                  </p>
                  <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                    {section.stats.map((st) => (
                      <div key={st.label}>
                        <dt className="sr-only">{st.label}</dt>
                        <dd className="text-sm font-bold text-neutral-900">
                          {st.value}
                        </dd>
                        <dd className="text-[11px] text-neutral-500">{st.label}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={`/${section.slug}`}
                    className="pointer-events-auto mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.03] hover:opacity-95 active:scale-100"
                    style={{ backgroundColor: accent }}
                  >
                    Explore {section.nav} →
                  </Link>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* vertical stop dots, right edge */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-7">
          <ul className="flex flex-col items-center gap-2.5">
            {["Home", ...sections.map((s) => s.nav)].map((label, i) => {
              const isActive = stop === i;
              const dotAccent = i === 0 ? PALETTE.berry : ACCENTS[i - 1];
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to ${label}`}
                    aria-current={isActive ? "true" : undefined}
                    className="group flex h-6 w-6 items-center justify-center"
                  >
                    <span
                      className={`block w-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "h-7"
                          : "h-1.5 bg-neutral-400/50 group-hover:bg-neutral-500/70"
                      }`}
                      style={isActive ? { backgroundColor: dotAccent } : undefined}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* bottom chrome */}
        <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between sm:inset-x-10 sm:bottom-7">
          <p
            aria-hidden="true"
            className={`font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500 transition-opacity duration-500 motion-safe:animate-pulse ${
              stop === 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            Scroll to explore ↓
          </p>
          <div className="pointer-events-auto flex items-center gap-4 font-mono text-[11px] tracking-wide text-neutral-500">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-neutral-800"
            >
              GitHub
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="transition hover:text-neutral-800"
            >
              Email
            </a>
            <span aria-hidden="true">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </MotionConfig>
    </section>
  );
}
