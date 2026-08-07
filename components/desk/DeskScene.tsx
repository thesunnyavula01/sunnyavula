"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { DESK_INTRO, sections, SITE } from "@/content/sections";
import { ACCENTS, PALETTE } from "./palette";
import type { OrbitState } from "./CameraRig";
import DeskCanvas from "./DeskCanvas";

// DeskCanvas holds all the three.js/WebGL. It is imported statically (not via
// next/dynamic) so its code ships in the home page bundle and is preloaded with
// the page, instead of only being fetched after hydration. That late fetch was
// what made the desk take seconds to appear. It still renders client-only,
// gated behind `mounted`, so WebGL never runs on the server, and three.js stays
// out of the subpage bundles because only the home page imports DeskScene.

// Stops: 0 = aerial overview / intro, 1..4 = one per section, 5 = the contact
// slide on the phone (must stay in sync with KEYS in CameraRig.tsx).
const STOPS = sections.length + 2;
const CONTACT = STOPS - 1;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pad = (n: number) => String(n).padStart(2, "0");

// A 24px-wide encode of the hero image, inlined so a desk-shaped blur is
// present in the server-rendered HTML itself — zero requests, so on a slow link
// the fallback hero is never a flat empty gradient while desk-poster.webp
// (43 kB) is still in flight.
const POSTER_BLUR =
  "data:image/webp;base64,UklGRuQAAABXRUJQVlA4WAoAAAAQAAAAFwAACQAAQUxQSGEAAAARb6C0bSM4WVzU++/QRUTAYuJUVsYPuKm17WleOozM3UDvCGDEBQZYUdOTiMjaBfR8atIdRPR/AvDXsS03yqv4QUTr4sWFXrJPp1cCAPvxSgbQ0WsNQHN85QBQw3r1IKIKAFZQOCBcAAAAEAQAnQEqGAAKAD8ZerNRrKekorAIAZAjCWMAAFqfIJidB6jkIa2G0gAA/uLmG0CpdmukEerrPHh1rxgFujr86qa9yigRZbMNYC2hchfl2CyII4g5P4REJlW2gAA=";

// A real capture of the WebGL scene, used only by the no-WebGL fallback hero
// below. The live deck renders the 3D desk directly.
const POSTER = { src: "/desk-poster.webp", width: 1920, height: 810 } as const;

// Phone layout breakpoint. Must be the exact complement of Tailwind's `sm`
// screen, because the two halves of the phone treatment are split across
// languages: this query drives the camera's portrait framing and the touch
// wiring, while the layout itself is pure `max-sm:` utilities. Tailwind v4
// emits `max-sm` as `width < 40rem`, so 640px itself is DESKTOP — matching on
// `(max-width: 640px)` here would put the phone camera under the desktop
// layout at exactly 640.
const PHONE_MQ = "(max-width: 639.98px)";

/* -------------------------------- desk legend -------------------------------- */

// The opening stop introduces the desk as a legend: one row per object, dotted
// with that section's desk accent, so the metaphor and the interaction are
// taught together. Rows are POSITIONAL against `sections`/`ACCENTS` — see the
// note on DESK_INTRO.
//
// `onSelect` jumps the camera to that object's stop (the same move the dots
// make, so the tour is never skipped). The no-WebGL hero has no camera, so it
// omits it and the same rows render as static text captioning the poster.
function DeskLegend({
  onSelect,
  className = "",
}: {
  onSelect?: (i: number) => void;
  className?: string;
}) {
  return (
    <ul className={`space-y-1 max-sm:space-y-0.5 ${className}`}>
      {DESK_INTRO.legend.map((row, i) => {
        const dot = (
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-[1.6]"
            style={{ backgroundColor: ACCENTS[i] }}
          />
        );
        const object = (
          // 5rem is measured, not chosen: the widest label ("MONITOR") renders
          // 76px at 10px mono with 0.18em tracking — and letter-spacing adds a
          // trailing gap after the last letter, so a snug column collides with
          // the phrase beside it. Same width at every size; the phrase column
          // has room to spare even on a 375px phone.
          <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400 transition-colors group-hover:text-neutral-200">
            {row.object}
          </span>
        );
        const line = (
          <span className="text-sm leading-snug text-neutral-300 transition-colors group-hover:text-neutral-50 max-sm:text-[0.8125rem]">
            {row.line}
          </span>
        );
        const rowClass =
          "group flex w-full items-center gap-3 text-left max-sm:gap-2.5";

        return (
          <li key={row.object}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                // Reads as one sentence: what the object is, then where it goes.
                aria-label={`${row.object} — ${row.line}. Go to ${sections[i].nav}.`}
                className={`pointer-events-auto -mx-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${rowClass}`}
              >
                {dot}
                {object}
                {line}
              </button>
            ) : (
              <div className={`py-1 ${rowClass}`}>
                {dot}
                {object}
                {line}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ----------------------------- fallback (no WebGL) ----------------------------- */

function FallbackHero() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-8 bg-[#10131c] px-6 pb-16 pt-28 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e8548a]">
          {DESK_INTRO.kicker}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-50 sm:text-6xl">
          {DESK_INTRO.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-neutral-300">
          {DESK_INTRO.body}
        </p>
      </div>
      <Image
        src={POSTER.src}
        alt="Aerial view of a desk with a stack of papers, a laptop, a trading monitor, and a gavel with a microphone"
        width={POSTER.width}
        height={POSTER.height}
        priority
        unoptimized
        placeholder="blur"
        blurDataURL={POSTER_BLUR}
        sizes="(max-width: 640px) 100vw, 576px"
        className="w-full max-w-xl rounded-3xl bg-[radial-gradient(120%_120%_at_50%_0%,#1a1f2e_0%,#10131c_55%,#0a0c12_100%)] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
      />
      {/* Static here — there is no camera to jump. It captions the poster
          above, which is a real capture of the same desk. */}
      <DeskLegend className="-mt-2 text-left" />
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
      {/* The deck's closing contact stop has no equivalent here (and the global
          footer is hidden on "/"), so the same details ride along with the
          fallback hero. */}
      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          Contact
        </p>
        <p className="text-sm text-neutral-300">
          <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
            {SITE.email}
          </a>
          <span className="mx-2 text-neutral-600">·</span>
          <a href={SITE.phoneHref} className="underline underline-offset-4">
            {SITE.phone}
          </a>
          <span className="mx-2 text-neutral-600">·</span>
          Discord: {SITE.discord}
        </p>
        <p className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-[#e8548a]">
          {[
            { label: "LinkedIn", href: SITE.linkedin },
            { label: "GitHub", href: SITE.github },
            { label: "Instagram", href: SITE.instagram },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-2 underline-offset-4"
            >
              {l.label}
            </a>
          ))}
        </p>
        <p className="font-mono text-[11px] tracking-wide text-neutral-500">
          Developed entirely by {SITE.name} · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------- stop dots --------------------------------- */

// Rendered twice — a vertical rail pinned to the right edge on desktop, and a
// horizontal row at the top of the copy sheet on phones. Only one is ever in
// the layout: the other is `display:none`, which also drops it out of the
// accessibility tree, so there is no duplicate set of controls to tab through.
function StopDots({
  stop,
  goTo,
  className = "",
  horizontal = false,
}: {
  stop: number;
  goTo: (n: number) => void;
  className?: string;
  horizontal?: boolean;
}) {
  return (
    <div className={className}>
      <ul
        className={`flex items-center ${
          horizontal ? "justify-center gap-1" : "flex-col gap-2.5"
        }`}
      >
        {["Home", ...sections.map((s) => s.nav), "Contact"].map((label, i) => {
          const isActive = stop === i;
          const dotAccent =
            i === 0 || i === CONTACT ? PALETTE.berryLight : ACCENTS[i - 1];
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${label}`}
                aria-current={isActive ? "true" : undefined}
                // 44px tall on phones: these are the tour's only always-visible
                // controls there, and a 24px box is below the minimum a thumb
                // can hit reliably.
                className={`group flex items-center justify-center ${
                  horizontal ? "h-11 w-10" : "h-6 w-6"
                }`}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? horizontal
                        ? "h-1.5 w-7"
                        : "h-7 w-1.5"
                      : "h-1.5 w-1.5 bg-white/30 group-hover:bg-white/50"
                  }`}
                  style={isActive ? { backgroundColor: dotAccent } : undefined}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------- the deck --------------------------------- */

export function DeskScene() {
  const [stop, setStop] = useState(0);
  const stopRef = useRef(0); // target stop, read every frame by the camera rig
  const orbit = useRef<OrbitState>({ angle: 0, pitch: 0, dragging: false });
  const dragLast = useRef<{ x: number; y: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const lockUntil = useRef(0);
  const wheelAcc = useRef(0);
  const lastWheel = useRef(0);
  const touchY = useRef<number | null>(null);
  const touchDone = useRef(false);
  const deckRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [phone, setPhone] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Gate WebGL to client-only (mirrors the old dynamic ssr:false). The canvas
  // code is now preloaded with the page; it just mounts after hydration.
  const [mounted, setMounted] = useState(false);
  // True once the canvas has drawn its first frame. Until then the loading
  // label below sits in the empty canvas area so the wait reads as "the desk
  // is coming" rather than as a blank gradient.
  const [live, setLive] = useState(false);

  // The static hero is now strictly a no-WebGL fallback. Phones used to land
  // here too, which meant the whole point of the landing page — the tour — was
  // something only desktop visitors ever saw; they got a flat screenshot of it.
  const fallback = !webgl;

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
    setMounted(true);
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
    const mqPhone = window.matchMedia(PHONE_MQ);
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPhone = () => setPhone(mqPhone.matches);
    const onReduced = () => setReduced(mqReduced.matches);
    onPhone();
    onReduced();
    mqPhone.addEventListener("change", onPhone);
    mqReduced.addEventListener("change", onReduced);
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mqPhone.removeEventListener("change", onPhone);
      mqReduced.removeEventListener("change", onReduced);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Stepped scroll-wheel / swipe: each gesture advances exactly one stop.
  useEffect(() => {
    if (fallback) return;
    const el = deckRef.current;
    if (!el) return;
    // On phones the swipe surface is the desk itself, not the whole deck: the
    // copy sheet below it is a scroll container (a long stop's card can
    // outgrow a short phone), and a handler here would preventDefault that
    // scroll away. On desktop both live on the section, as before.
    const touchEl = (phone ? stageRef.current : el) ?? el;

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
      if (e.touches.length > 1) {
        touchY.current = null; // pinch/multi-touch is not a step gesture
        return;
      }
      touchY.current = e.touches[0].clientY;
      touchDone.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY.current === null || e.touches.length > 1) return;
      e.preventDefault();
      const dy = touchY.current - e.touches[0].clientY;
      if (!touchDone.current && Math.abs(dy) > 48) {
        touchDone.current = true;
        step(dy > 0 ? 1 : -1);
      }
    };
    const onTouchEnd = () => {
      touchY.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    touchEl.addEventListener("touchstart", onTouchStart, { passive: true });
    touchEl.addEventListener("touchmove", onTouchMove, { passive: false });
    touchEl.addEventListener("touchend", onTouchEnd, { passive: true });
    touchEl.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      touchEl.removeEventListener("touchstart", onTouchStart);
      touchEl.removeEventListener("touchmove", onTouchMove);
      touchEl.removeEventListener("touchend", onTouchEnd);
      touchEl.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [fallback, phone, step]);

  // Drag-to-look-around (mouse/pen; touch keeps swipe-to-step).
  useEffect(() => {
    if (fallback) return;
    const onMove = (e: PointerEvent) => {
      const last = dragLast.current;
      if (!last) return;
      const o = orbit.current;
      o.angle = clamp(o.angle - (e.clientX - last.x) * 0.005, -0.75, 0.75);
      o.pitch = clamp(o.pitch + (e.clientY - last.y) * 0.003, -0.1, 0.24);
      dragLast.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      if (!dragLast.current) return;
      dragLast.current = null;
      orbit.current.dragging = false;
      setGrabbing(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [fallback]);

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

  const isContact = stop === CONTACT;
  const section = stop > 0 && !isContact ? sections[stop - 1] : null;
  const accent =
    section === null ? PALETTE.berryLight : ACCENTS[stop - 1];

  // Everything below is one layout with `max-sm:` overrides, not two branches:
  // every phone rule is scoped to `width < 40rem`, so the desktop deck renders
  // from exactly the classes it always did.
  //
  // Phones stack instead of overlaying — desk on top, copy sheet below. The
  // SHEET is the one with a height (a viewport-capped constant, not its own
  // content) and the desk takes what is left. Two consequences, both load
  // bearing: a short phone shrinks the desk instead of clipping the copy, and
  // the canvas never resizes mid-tour — AnimatePresence empties the sheet for a
  // beat between stops, and a content-sized sheet would collapse and re-grow,
  // forcing three.js to reallocate its drawing buffer on every single step.
  return (
    <section
      ref={deckRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio tour — scroll, use arrow keys, or the dots to move between stops"
      className="relative h-[100svh] select-none overflow-hidden overscroll-none bg-[radial-gradient(120%_120%_at_50%_0%,#1a1f2e_0%,#10131c_55%,#0a0c12_100%)] max-sm:flex max-sm:flex-col"
      style={{ touchAction: phone ? undefined : "none" }}
    >
      <div
        ref={stageRef}
        className={`absolute inset-0 max-sm:relative max-sm:inset-auto max-sm:min-h-0 max-sm:flex-1 ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: phone ? "none" : undefined }}
        role="img"
        aria-label="Interactive 3D desk in a study corner — each object opens a section: papers for Research, laptop for ATT Agency, trading monitor for Markets, gavel and microphone for Leadership, and the phone closes the tour on contact details. Drag to look around."
        onPointerDown={(e) => {
          if (e.pointerType === "touch") return;
          dragLast.current = { x: e.clientX, y: e.clientY };
          orbit.current.dragging = true;
          setGrabbing(true);
        }}
      >
        {mounted && (
          <DeskCanvas
            stop={stopRef}
            orbit={orbit}
            active={isContact ? -1 : stop - 1}
            reduced={reduced}
            compact={phone}
            paused={hidden}
            onFirstFrame={() => setLive(true)}
          />
        )}
        {/* Loading label. Plain server-rendered HTML, so it is on screen with
            the first paint — long before three.js has downloaded, hydrated and
            compiled its shaders — and fades out the moment the canvas draws.
            It only covers the empty canvas area; the copy card, dots and
            bottom links stay readable throughout. */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out ${
            live ? "opacity-0" : "opacity-100"
          }`}
        >
          <p
            role="status"
            className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400"
          >
            <span
              aria-hidden="true"
              className="block h-1.5 w-1.5 rounded-full motion-safe:animate-pulse"
              style={{ backgroundColor: PALETTE.berryLight }}
            />
            Building the desk…
          </p>
        </div>
      </div>

      <MotionConfig reducedMotion="user">
        {/* copy card, sarastotey-style, left of center */}
        {/* On phones the card's chrome (panel, blur, ring) moves up onto this
            wrapper, so the dot row and the credit line below sit on the same
            sheet as the copy instead of floating on the bare gradient. */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute left-5 top-1/2 w-[min(430px,88vw)] -translate-y-1/2 sm:left-10 lg:left-16 max-sm:relative max-sm:left-auto max-sm:top-auto max-sm:flex max-sm:h-[min(24.5rem,58svh)] max-sm:w-auto max-sm:shrink-0 max-sm:translate-y-0 max-sm:flex-col max-sm:justify-between max-sm:rounded-t-3xl max-sm:bg-[#141824]/85 max-sm:shadow-[0_-24px_60px_-28px_rgba(0,0,0,0.9)] max-sm:ring-1 max-sm:ring-white/10 max-sm:backdrop-blur-md"
        >
          <StopDots
            stop={stop}
            goTo={goTo}
            horizontal
            className="pointer-events-auto hidden shrink-0 pt-1.5 max-sm:block"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={stop}
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              // On phones the panel chrome moves to the wrapper and this
              // becomes the sheet's scroll body — the safety valve for a long
              // stop's card on a short phone. The swipe-to-step listener is
              // bound to the desk above, so it never eats this scroll.
              className="rounded-3xl bg-[#141824]/85 p-8 shadow-[0_28px_70px_-28px_rgba(0,0,0,0.85)] ring-1 ring-white/10 backdrop-blur-md sm:p-9 max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:rounded-none max-sm:bg-transparent max-sm:px-5 max-sm:pb-4 max-sm:pt-2 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none"
            >
              {/* Hidden on phones: the dot row sits directly above the card
                  there and already says which stop this is. */}
              <p className="font-mono text-[11px] tracking-[0.3em] text-neutral-500 max-sm:hidden">
                {pad(stop + 1)} / {pad(STOPS)}
              </p>

              {isContact ? (
                <>
                  <p
                    className="mt-4 text-xs font-bold uppercase tracking-[0.25em] max-sm:mt-2.5"
                    style={{ color: accent }}
                  >
                    {SITE.location} to anywhere
                  </p>
                  <h2 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-neutral-50 sm:text-5xl max-sm:mt-2 max-sm:text-[1.7rem]">
                    Contact me.
                  </h2>
                  <dl className="mt-5 space-y-2.5 text-sm max-sm:mt-3.5 max-sm:space-y-2">
                    <div className="flex gap-3">
                      <dt className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        Email
                      </dt>
                      <dd>
                        <a
                          href={`mailto:${SITE.email}`}
                          className="pointer-events-auto text-neutral-200 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white/60"
                        >
                          {SITE.email}
                        </a>
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        Phone
                      </dt>
                      <dd>
                        <a
                          href={SITE.phoneHref}
                          className="pointer-events-auto text-neutral-200 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white/60"
                        >
                          {SITE.phone}
                        </a>
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        Discord
                      </dt>
                      <dd className="text-neutral-200">{SITE.discord}</dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold max-sm:mt-4">
                    {[
                      { label: "LinkedIn", href: SITE.linkedin },
                      { label: "GitHub", href: SITE.github },
                      { label: "Instagram", href: SITE.instagram },
                    ].map((l) => (
                      <a
                        key={l.label}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto underline decoration-2 underline-offset-4 transition hover:opacity-80"
                        style={{ color: accent }}
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                </>
              ) : section === null ? (
                <>
                  {/* Tighter tracking on phones only: this kicker carries the
                      name AND the city, which wraps to a second line at 0.25em
                      in a 375px sheet — and the sheet's height is fixed, so a
                      wrapped line is 16px stolen from the copy below it. */}
                  <p
                    className="mt-4 text-xs font-bold uppercase tracking-[0.25em] max-sm:mt-2.5 max-sm:tracking-[0.14em]"
                    style={{ color: accent }}
                  >
                    {DESK_INTRO.kicker}
                  </p>
                  <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-neutral-50 sm:text-5xl max-sm:mt-2 max-sm:text-[1.55rem]">
                    {DESK_INTRO.heading}
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-neutral-300 sm:text-lg max-sm:mt-2.5 max-sm:text-[0.9375rem] max-sm:leading-normal">
                    {DESK_INTRO.body}
                  </p>
                  <DeskLegend
                    onSelect={(i) => goTo(i + 1)}
                    className="mt-5 max-sm:mt-3"
                  />
                  <p className="mt-4 font-mono text-[11px] tracking-wide text-neutral-500 max-sm:mt-2.5">
                    <span className="max-sm:hidden">
                      scroll to travel · drag to look around · click an object
                      to dive in
                    </span>
                    {/* No hover and no drag-orbit on touch, so the phone hint
                        names the two gestures that actually do something. */}
                    <span className="hidden max-sm:inline">
                      swipe the desk to travel · tap an object to dive in
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="mt-4 text-xs font-bold uppercase tracking-[0.25em] max-sm:mt-2.5"
                    style={{ color: accent }}
                  >
                    {section.nav}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-[1.08] tracking-tight text-neutral-50 sm:text-4xl max-sm:mt-2 max-sm:text-[1.55rem]">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-neutral-300 max-sm:mt-2 max-sm:text-[0.9375rem] max-sm:leading-normal">
                    {section.tagline}
                  </p>
                  <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 max-sm:mt-3 max-sm:gap-x-5 max-sm:gap-y-1.5">
                    {section.stats.map((st) => (
                      <div key={st.label}>
                        <dt className="sr-only">{st.label}</dt>
                        <dd className="text-sm font-bold text-neutral-100">
                          {st.value}
                        </dd>
                        <dd className="text-[11px] text-neutral-500">{st.label}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={`/${section.slug}`}
                    className="pointer-events-auto mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.03] hover:opacity-95 active:scale-100 max-sm:mt-3 max-sm:py-3"
                    style={{ backgroundColor: accent }}
                  >
                    Explore {section.nav} →
                  </Link>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* The deck's bottom chrome has nowhere to sit on a phone — it would
              land on top of this sheet — so the credit line rides along the
              sheet's bottom edge instead. */}
          <p className="pointer-events-auto hidden shrink-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-5 pb-3 pt-1 text-center font-mono text-[10px] tracking-wide text-neutral-500 max-sm:flex">
            <a href={SITE.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span aria-hidden="true" className="text-neutral-700">
              |
            </span>
            <a href={`mailto:${SITE.email}`}>Email</a>
            <span aria-hidden="true" className="text-neutral-700">
              |
            </span>
            <span>
              Developed entirely by {SITE.name} {new Date().getFullYear()}
            </span>
          </p>
        </div>

        {/* vertical stop dots, right edge (phones get the horizontal row that
            sits at the top of the copy sheet instead) */}
        <StopDots
          stop={stop}
          goTo={goTo}
          className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-7 max-sm:hidden"
        />

        {/* bottom chrome */}
        <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between sm:inset-x-10 sm:bottom-7 max-sm:hidden">
          <p
            aria-hidden="true"
            className={`font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400 transition-opacity duration-500 motion-safe:animate-pulse ${
              stop === 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            Scroll to explore ↓
          </p>
          <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[11px] tracking-wide text-neutral-400">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-neutral-100"
            >
              GitHub
            </a>
            <span aria-hidden="true" className="text-neutral-600">
              |
            </span>
            <a
              href={`mailto:${SITE.email}`}
              className="transition hover:text-neutral-100"
            >
              Email
            </a>
            <span aria-hidden="true" className="text-neutral-600">
              |
            </span>
            <span>
              Developed entirely by {SITE.name} {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </MotionConfig>
    </section>
  );
}
