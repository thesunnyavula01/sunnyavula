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

// Labels for the index strip along the bottom edge. The four middle stops are
// named for the OBJECT, not the section — the strip is a key to the desk, and
// the section name is already the heading of the stop it lands on. Screen
// readers get the section name in the button's aria-label.
const STOP_LABELS = [
  "Start",
  ...DESK_INTRO.legend.map((l) => l.object),
  "Say hi",
];
const stopAccent = (i: number) =>
  i === 0 || i === CONTACT ? PALETTE.brandLight : ACCENTS[i - 1];
const stopTarget = (i: number) =>
  i === 0
    ? "the overview"
    : i === CONTACT
      ? "contact details"
      : sections[i - 1].nav;

// A 24px-wide encode of the hero image, inlined so a desk-shaped blur is
// present in the server-rendered HTML itself — zero requests, so on a slow link
// the fallback hero is never a flat empty gradient while desk-poster.webp
// (43 kB) is still in flight.
const POSTER_BLUR =
  "data:image/webp;base64,UklGRhgBAABXRUJQVlA4WAoAAAAQAAAAFwAACQAAQUxQSHEAAAABcBoAAJpsuDb3vIxEkrucQIPuH5A4wOEAIge4wxUOyZ25fRARZJM2ZmwvAdjHZcrRHRSTvtSpTSPqPMDErtOOhUrrBVP1N5NxCjB1CQ4JdKZRFhCJ+jCNlZwAVJS62z+ltwkk7BItZA+mq901+RrnAQBWUDgggAAAAFAEAJ0BKhgACgA+wVChSqekoyGwCADwGAljAL84IWv9yduH3wneSoFeTAAA/vKhErA13Xe3HXesGqnNZPE3ufpEQx4OrcNGsaLNgnETQ6AV6AqmgIveRXamQ1iMLVMZTFBbSqBU8x8dYkuZSmA4g8CDfKDFEgcPEe8tn6zVAAAA";

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
// `onSelect` jumps the camera to that object's stop (the same move the index
// strip makes, so the tour is never skipped). The no-WebGL hero has no camera,
// so it omits it and the same rows render as static text captioning the poster.
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
                className={`pointer-events-auto -mx-2 px-2 py-1 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 ${rowClass}`}
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
    <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col justify-center gap-8 px-6 pb-16 pt-32">
      <div>
        <p
          className="font-mono text-[11px] uppercase tracking-[0.28em]"
          style={{ color: PALETTE.brandLight }}
        >
          {DESK_INTRO.kicker}
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-neutral-50 sm:text-6xl">
          {DESK_INTRO.heading}
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-neutral-300">
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
        sizes="(max-width: 640px) 100vw, 768px"
        className="w-full bg-[radial-gradient(120%_120%_at_50%_0%,#1a1f2e_0%,#10131c_55%,#0a0c12_100%)]"
      />
      {/* Static here — there is no camera to jump. It captions the poster
          above, which is a real capture of the same desk. */}
      <DeskLegend />
      <nav aria-label="Sections" className="border-t border-white/10 pt-6">
        <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
          {sections.map((s, i) => (
            <li key={s.slug}>
              <Link
                href={`/${s.slug}`}
                className="block border-t-2 pt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-300 transition-colors hover:text-white"
                style={{ borderColor: ACCENTS[i] }}
              >
                {s.nav}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* The deck's closing contact stop has no equivalent here (and the global
          footer is hidden on "/"), so the same details ride along with the
          fallback hero. */}
      <div className="space-y-3 border-t border-white/10 pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-500">
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
        <p
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"
          style={{ color: PALETTE.brandLight }}
        >
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
              className="underline decoration-1 underline-offset-4"
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

/* -------------------------------- index strip -------------------------------- */

// Pinned to the bottom edge, full width: six ruled columns, one per stop. This
// is the tour's only stop control, and it replaces THREE pieces of chrome the
// deck used to carry separately — the vertical dot rail, the "01 / 06" counter,
// and the "scroll to explore" prompt. A ruled strip states position, length and
// destination at once, which none of the three did on its own.
//
// Phones keep the same six columns but drop the names: 62px is not enough for
// "MONITOR" at a legible size, and the active stop's name is the heading
// directly above it either way.
function IndexStrip({ stop, goTo }: { stop: number; goTo: (n: number) => void }) {
  return (
    <nav
      aria-label="Tour stops"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 grid grid-cols-6"
    >
      {STOP_LABELS.map((label, i) => {
        const active = stop === i;
        const accent = stopAccent(i);
        return (
          <button
            key={label}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Stop ${pad(i)} — go to ${stopTarget(i)}`}
            aria-current={active ? "true" : undefined}
            className="group flex flex-col items-start gap-2 px-3 pb-4 pt-3 text-left sm:px-5 sm:pb-5"
          >
            <span
              aria-hidden="true"
              className="block h-[2px] w-full transition-colors duration-300"
              style={{
                backgroundColor: active ? accent : "rgba(255,255,255,0.14)",
              }}
            />
            <span className="flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
              <span
                className="transition-colors"
                style={{ color: active ? accent : undefined }}
              >
                <span className={active ? "" : "text-neutral-600"}>{pad(i)}</span>
              </span>
              <span
                className={`transition-colors max-sm:hidden ${
                  active
                    ? "text-neutral-200"
                    : "text-neutral-500 group-hover:text-neutral-300"
                }`}
              >
                {label}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
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
    // copy block below it is a scroll container (a long stop's copy can
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
  const accent = stopAccent(stop);

  // Editorial layout, deliberately NOT a floating card.
  //
  // The copy used to live in a rounded, blurred, ring-lit panel over the left
  // third of the scene, with a counter, a vertical dot rail and a scroll prompt
  // around it. That is the stock chrome of every scroll-driven portfolio deck.
  // Now the type sits directly on the scene — anchored bottom-left, above the
  // index strip — and legibility comes from a corner SCRIM rather than a panel,
  // so the desk is never boxed in.
  //
  // Phones stack instead of overlaying — desk on top, copy below. The copy
  // region is the one with a height (a viewport-capped constant, not its own
  // content) and the desk takes what is left. Two consequences, both load
  // bearing: a short phone shrinks the desk instead of clipping the copy, and
  // the canvas never resizes mid-tour — AnimatePresence empties the region for
  // a beat between stops, and a content-sized one would collapse and re-grow,
  // forcing three.js to reallocate its drawing buffer on every single step.
  return (
    <section
      ref={deckRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio tour — scroll, use arrow keys, or the index strip to move between stops"
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
            It only covers the empty canvas area; the copy, the strip and the
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
              style={{ backgroundColor: PALETTE.brandLight }}
            />
            Building the desk…
          </p>
        </div>
      </div>

      {/* Scrim, not a panel — this is what replaces the copy card, so it is
          load bearing rather than decoration.
          The first cut was a corner wash anchored at the very bottom-left
          (-8%, 100%) and it failed by eye: the headline sits around 40% UP the
          frame, well outside a corner gradient's reach, so 60pt type ran
          straight over the lit desk, the papers and the plant. The wash is now
          centred on the copy itself (6%, 76%) and holds ~0.7 alpha out to the
          headline before falling off, which keeps the desk's bright middle and
          right — where every camera stop puts the subject — untouched.
          Phones use the full-width fade behind the stacked copy instead. Both
          are pointer-events-none, so drag-orbit still works through them. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(58%_66%_at_6%_76%,rgba(5,7,11,0.97)_0%,rgba(5,7,11,0.93)_38%,rgba(5,7,11,0.72)_58%,rgba(5,7,11,0.3)_80%,rgba(5,7,11,0)_100%)] max-sm:hidden"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[#06080d] via-[#06080d]/70 to-transparent max-sm:hidden"
      />

      <MotionConfig reducedMotion="user">
        {/* Copy block: bottom-left on desktop, above the index strip. On phones
            it becomes the stacked region under the desk — same fixed-height
            contract as before, but rendered as a scrimmed block rather than a
            panel (no rounding, no ring, no backdrop blur). */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute bottom-24 left-0 z-20 w-full max-w-[40rem] px-5 sm:bottom-28 sm:px-9 lg:px-14 max-sm:relative max-sm:bottom-auto max-sm:left-auto max-sm:flex max-sm:h-[min(24.5rem,58svh)] max-sm:max-w-none max-sm:shrink-0 max-sm:flex-col max-sm:bg-gradient-to-t max-sm:from-[#06080d] max-sm:via-[#06080d]/95 max-sm:to-[#06080d]/70 max-sm:px-0 max-sm:pb-24"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={stop}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              // On phones this is the region's scroll body — the safety valve
              // for a long stop's copy on a short phone. The swipe-to-step
              // listener is bound to the desk above, so it never eats this
              // scroll.
              // The scrim does most of the work, but the copy still sits on a
              // lit 3D scene rather than a flat panel, and the camera moves
              // under it at every stop — the shadow is the margin of safety for
              // the frames where something bright lands behind a thin glyph.
              className="[text-shadow:0_1px_14px_rgba(5,7,11,0.9)] max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:px-5 max-sm:pt-4"
            >
              {isContact ? (
                <>
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: accent }}
                  >
                    {SITE.location} to anywhere
                  </p>
                  <h2 className="mt-3 font-serif text-5xl leading-[1.02] text-neutral-50 sm:text-6xl max-sm:mt-2 max-sm:text-[2.1rem]">
                    Say hello.
                  </h2>
                  <dl className="mt-5 space-y-2 text-sm max-sm:mt-3.5">
                    <div className="flex gap-4">
                      <dt className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
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
                    <div className="flex gap-4">
                      <dt className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
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
                    <div className="flex gap-4">
                      <dt className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                        Discord
                      </dt>
                      <dd className="text-neutral-200">{SITE.discord}</dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] max-sm:mt-4">
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
                        className="pointer-events-auto border-b pb-1 transition hover:opacity-80"
                        style={{ color: accent, borderColor: accent }}
                      >
                        {l.label}
                      </a>
                    ))}
                  </div>
                </>
              ) : section === null ? (
                <>
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.28em] max-sm:tracking-[0.14em]"
                    style={{ color: accent }}
                  >
                    {DESK_INTRO.kicker}
                  </p>
                  {/* Fits on one line at lg; text-balance only matters at the
                      widths where it does wrap, where the natural break is the
                      weakest one in the line ("...read as a / résumé."). */}
                  <h1 className="mt-3 text-balance font-serif text-[3rem] leading-[1] text-neutral-50 lg:text-[3.75rem] max-sm:mt-2 max-sm:text-[2.1rem]">
                    {DESK_INTRO.heading}
                  </h1>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-300 max-sm:mt-2.5 max-sm:text-[0.9375rem] max-sm:leading-normal">
                    {DESK_INTRO.body}
                  </p>
                  <DeskLegend
                    onSelect={(i) => goTo(i + 1)}
                    className="mt-6 max-sm:mt-3"
                  />
                  {/* Tracking is 0.14em, not the 0.2em the other labels use:
                      this line is 67 characters and broke across two lines at
                      0.2em, orphaning "dive in". */}
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500 max-sm:mt-2.5 max-sm:tracking-[0.1em]">
                    <span className="max-sm:hidden">
                      scroll to travel · drag to look around · click an object
                      to dive in
                    </span>
                    {/* No hover and no drag-orbit on touch, so the phone hint
                        names the two gestures that actually do something. */}
                    {/* Shorter than the desktop line by design: at 375px the
                        full sentence wrapped and orphaned "dive in" directly
                        above the credit line, so the two read as one block. */}
                    <span className="hidden max-sm:inline">
                      swipe to travel · tap an object
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="font-mono text-[11px] uppercase tracking-[0.28em]"
                    style={{ color: accent }}
                  >
                    {section.nav}
                  </p>
                  <h2 className="mt-3 font-serif text-[3.1rem] leading-[1] text-neutral-50 lg:text-6xl max-sm:mt-2 max-sm:text-[2rem]">
                    {section.title}
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-300 max-sm:mt-2 max-sm:text-[0.9375rem] max-sm:leading-normal">
                    {section.tagline}
                  </p>
                  <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-4 max-sm:mt-3 max-sm:gap-x-6 max-sm:pt-3">
                    {section.stats.map((st) => (
                      <div key={st.label}>
                        <dt className="sr-only">{st.label}</dt>
                        <dd className="font-serif text-2xl leading-none text-neutral-50">
                          {st.value}
                        </dd>
                        <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                          {st.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={`/${section.slug}`}
                    className="pointer-events-auto mt-6 inline-flex items-center gap-2 border-b pb-1 font-mono text-[11px] uppercase tracking-[0.2em] transition hover:gap-3 max-sm:mt-4"
                    style={{ color: accent, borderColor: accent }}
                  >
                    Explore {section.nav}
                    <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom-right chrome, riding the same baseline as the copy block.
            On phones it sits inside the copy region's reserved bottom padding,
            just above the index strip. */}
        {/* Phones drop the uppercase + wide tracking: the same string is 54
            characters, and at 0.16em tracked caps it is 380px wide inside a
            335px sheet, so it wrapped onto the hint line above it. */}
        <div className="pointer-events-auto absolute bottom-24 right-9 z-20 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 sm:bottom-28 lg:right-14 max-sm:inset-x-0 max-sm:bottom-[3.55rem] max-sm:justify-center max-sm:px-5 max-sm:normal-case max-sm:tracking-[0.01em]">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-neutral-200"
          >
            GitHub
          </a>
          <span aria-hidden="true" className="text-neutral-700">
            /
          </span>
          <a
            href={`mailto:${SITE.email}`}
            className="transition hover:text-neutral-200"
          >
            Email
          </a>
          <span aria-hidden="true" className="text-neutral-700">
            /
          </span>
          <span>
            Developed entirely by {SITE.name} {new Date().getFullYear()}
          </span>
        </div>

        <IndexStrip stop={stop} goTo={goTo} />
      </MotionConfig>
    </section>
  );
}
