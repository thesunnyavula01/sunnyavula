"use client";

import Link from "next/link";
import { MotionConfig, motion, type Variants } from "framer-motion";
import type { Section } from "@/content/sections";
import { SectionHero } from "./SectionHero";
import { StatBlock } from "./StatBlock";

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const inView = { once: true, margin: "-60px" } as const;

function BackToDesk({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-sm text-black/50 hover:underline dark:text-white/50 ${className}`}
    >
      ← Back to the desk
    </Link>
  );
}

// Full Phase 2 section subpage: hero + stats + narrative + honors + outbound
// links + back-to-desk. All copy comes from content/sections.ts.
export function SectionPage({ section }: { section: Section }) {
  return (
    <MotionConfig reducedMotion="user">
      <article className="mx-auto max-w-3xl px-4 py-12">
        <motion.div variants={rise} initial="hidden" animate="show">
          <BackToDesk />
          <SectionHero section={section} />
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
                <p className="text-xs uppercase tracking-widest text-black/40 dark:text-white/40">
                  {block.kicker}
                </p>
              )}
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {block.heading}
              </h2>
              <p className="mt-3 leading-relaxed text-black/80 dark:text-white/80">
                {block.body}
              </p>
              {block.bullets && (
                <ul className="mt-4 space-y-2 border-l border-black/10 pl-5 text-sm text-black/70 dark:border-white/10 dark:text-white/70">
                  {block.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
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
            <h2 className="text-sm font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
              Honors
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {section.honors.map((h) => (
                <li
                  key={h}
                  className="rounded-lg border border-black/10 px-4 py-3 text-sm text-black/80 dark:border-white/10 dark:text-white/80"
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
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
              >
                {l.label} ↗
              </a>
            ))}
          </motion.div>
        )}

        <div className="mt-16 border-t border-black/10 pt-6 dark:border-white/10">
          <BackToDesk />
        </div>
      </article>
    </MotionConfig>
  );
}
