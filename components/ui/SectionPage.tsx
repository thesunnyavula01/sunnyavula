"use client";

import Link from "next/link";
import { MotionConfig, motion, type Variants } from "framer-motion";
import { sections, type Section } from "@/content/sections";
import { ACCENTS } from "@/components/desk/palette";
import { Visual } from "@/components/viz";
import { SectionHero } from "./SectionHero";
import { StatBlock } from "./StatBlock";

// Shared entrance. The curve is the same decelerating one the figures use
// (EASE_OUT in components/viz/motion.ts) so a block and the chart inside it
// settle on the same rhythm rather than two different ones.
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const inView = { once: true, margin: "-60px" } as const;

function BackToDesk({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-sm text-neutral-500 transition hover:text-neutral-200 ${className}`}
    >
      ← Back to the desk
    </Link>
  );
}

// Full Phase 2 section subpage: hero + stats + narrative + honors + outbound
// links + back-to-desk. All copy comes from content/sections.ts.
//
// Colors are dark-only and stated outright — see the note in app/globals.css on
// why nothing here may be gated behind Tailwind's media-driven `dark:` variant.
export function SectionPage({ section }: { section: Section }) {
  // ACCENTS is indexed like `sections`, same as the deck's per-stop accent, so
  // each subpage inherits the color its desk object glows on the landing page.
  const accentIndex = sections.findIndex((s) => s.slug === section.slug);
  const accent = ACCENTS[accentIndex] ?? ACCENTS[0];

  return (
    <MotionConfig reducedMotion="user">
      <article className="mx-auto max-w-3xl px-4 pb-12 pt-28">
        <motion.div variants={rise} initial="hidden" animate="show">
          <BackToDesk />
          <SectionHero section={section} accent={accent} />
        </motion.div>

        <motion.div
          className="mt-10"
          variants={rise}
          initial="hidden"
          animate="show"
        >
          <StatBlock stats={section.stats} />
        </motion.div>

        <div className="mt-14 space-y-12">
          {section.narrative.map((block) => (
            <motion.section
              key={block.heading}
              variants={rise}
              initial="hidden"
              whileInView="show"
              viewport={inView}
            >
              {block.kicker && (
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  {block.kicker}
                </p>
              )}
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
                {block.heading}
              </h2>
              <p className="mt-3 leading-relaxed text-neutral-300">
                {block.body}
              </p>
              {block.bullets && (
                <ul className="mt-4 space-y-2 border-l border-white/10 pl-5 text-sm text-neutral-400">
                  {block.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {block.visual && <Visual name={block.visual} />}
              {block.links && block.links.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {block.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.03] hover:opacity-95 active:scale-100"
                      style={{ backgroundColor: accent }}
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </motion.section>
          ))}
        </div>

        {section.honors && section.honors.length > 0 && (
          <motion.section
            className="mt-14"
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Honors
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {section.honors.map((h) => (
                <li
                  key={h}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300"
                >
                  {h}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {section.links.length > 0 && (
          <motion.div
            className="mt-12 flex flex-wrap gap-3"
            variants={rise}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            {section.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.03] hover:opacity-95 active:scale-100"
                style={{ backgroundColor: accent }}
              >
                {l.label} ↗
              </a>
            ))}
          </motion.div>
        )}

        <div className="mt-16 border-t border-white/10 pt-6">
          <BackToDesk />
        </div>
      </article>
    </MotionConfig>
  );
}
