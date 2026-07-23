import Link from "next/link";
import type { Section } from "@/content/sections";

// Phase 0 placeholder for a section subpage. Phase 2 replaces this with the
// full write-up (hero, narrative, imagery), still sourced from content/sections.ts.
export function SectionStub({ section }: { section: Section }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/"
        className="text-sm text-black/50 hover:underline dark:text-white/50"
      >
        ← Back to the desk
      </Link>

      <p className="mt-6 text-sm uppercase tracking-widest text-black/40 dark:text-white/40">
        {section.deskObject}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{section.title}</h1>
      <p className="mt-3 text-lg text-black/70 dark:text-white/70">
        {section.tagline}
      </p>
      <p className="mt-6 text-black/80 dark:text-white/80">{section.blurb}</p>

      {section.stats.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {section.stats.map((st) => (
            <div
              key={st.label}
              className="rounded-lg border border-black/10 p-4 dark:border-white/10"
            >
              <dt className="text-2xl font-bold">{st.value}</dt>
              <dd className="mt-1 text-xs text-black/50 dark:text-white/50">
                {st.label}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {section.honors && section.honors.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-black/40 dark:text-white/40">
            Honors
          </h2>
          <ul className="mt-2 list-disc pl-5 text-black/80 dark:text-white/80">
            {section.honors.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {section.links.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {section.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      )}

      <p className="mt-12 text-sm text-black/40 dark:text-white/40">
        Full write-up arrives in Phase 2.
      </p>
    </div>
  );
}
