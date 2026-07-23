"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { sections, SITE } from "@/content/sections";

// Canvas is client-only (WebGL) — never server-render it.
const DeskCanvas = dynamic(() => import("./DeskCanvas"), { ssr: false });

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function DeskScene() {
  const heroRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(-1); // -1 = intro / overview
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  // Drive the scroll progress (0..1) across the tall hero from the page scroll.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-el.getBoundingClientRect().top / total, 0, 1) : 0;
      progress.current = p;
      const nearest = Math.round(p * sections.length);
      const idx = nearest === 0 ? -1 : Math.min(nearest - 1, sections.length - 1);
      setActive((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative h-[420vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#f3ede2]">
        {webgl ? (
          <div className="absolute inset-0">
            <DeskCanvas progress={progress} reduced={reduced} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 sm:text-6xl">
                {SITE.name}
              </h1>
              <p className="mt-3 text-neutral-700">
                Research, a dev agency, markets, and leadership.
              </p>
              <p className="mt-6 text-sm text-neutral-500">
                Explore the sections below.
              </p>
            </div>
          </div>
        )}

        {webgl && (
          <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-5xl flex-col justify-between px-6 py-24 sm:px-10">
            <div className="max-w-md">
              <AnimatePresence mode="wait">
                {active === -1 ? (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Boulder, Colorado
                    </p>
                    <h1 className="mt-3 text-5xl font-bold tracking-tight text-neutral-900 sm:text-7xl">
                      {SITE.name}
                    </h1>
                    <p className="mt-4 text-lg text-neutral-700">
                      Research, a dev agency, markets, and leadership — all on one
                      desk.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      {String(active + 1).padStart(2, "0")} /{" "}
                      {String(sections.length).padStart(2, "0")}
                    </p>
                    <h2 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
                      {sections[active].title}
                    </h2>
                    <p className="mt-3 text-lg text-neutral-700">
                      {sections[active].tagline}
                    </p>
                    <Link
                      href={`/${sections[active].slug}`}
                      className="pointer-events-auto mt-5 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                    >
                      Open {sections[active].nav} →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              <span
                className={`transition-opacity duration-300 ${
                  active === -1 ? "opacity-100" : "opacity-0"
                }`}
              >
                Scroll to explore ↓
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
