import type { Section } from "@/content/sections";

// Presentational hero for a section subpage: desk-object kicker, title,
// tagline, and lede. Motion/entrance is handled by SectionPage.
export function SectionHero({ section }: { section: Section }) {
  return (
    <header className="mt-8">
      <p className="text-sm uppercase tracking-widest text-black/40 dark:text-white/40">
        {section.deskObject}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        {section.title}
      </h1>
      <p className="mt-4 text-lg text-black/70 dark:text-white/70 sm:text-xl">
        {section.tagline}
      </p>
      <p className="mt-6 leading-relaxed text-black/80 dark:text-white/80">
        {section.blurb}
      </p>
    </header>
  );
}
