import type { Section } from "@/content/sections";

// Presentational hero for a section subpage: desk-object kicker, title,
// tagline, and lede. Motion/entrance is handled by SectionPage.
// The type ramp mirrors the landing deck's copy card — accent kicker,
// neutral-50 heading, neutral-300 body — so the subpage reads as the same
// night-study surface the desk sits on.
export function SectionHero({
  section,
  accent,
}: {
  section: Section;
  accent: string;
}) {
  return (
    <header className="mt-8">
      <p
        className="font-mono text-[11px] uppercase tracking-[0.28em]"
        style={{ color: accent }}
      >
        {section.deskObject}
      </p>
      <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-neutral-50 sm:text-6xl">
        {section.title}
      </h1>
      <p className="mt-4 text-lg text-neutral-300 sm:text-xl">
        {section.tagline}
      </p>
      <p className="mt-6 leading-relaxed text-neutral-400">{section.blurb}</p>
    </header>
  );
}
