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
        className="text-xs font-bold uppercase tracking-[0.25em]"
        style={{ color: accent }}
      >
        {section.deskObject}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl">
        {section.title}
      </h1>
      <p className="mt-4 text-lg text-neutral-300 sm:text-xl">
        {section.tagline}
      </p>
      <p className="mt-6 leading-relaxed text-neutral-400">{section.blurb}</p>
    </header>
  );
}
