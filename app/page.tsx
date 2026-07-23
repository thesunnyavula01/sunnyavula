import Link from "next/link";
import { sections, SITE } from "@/content/sections";
import { DeskScene } from "@/components/desk/DeskScene";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-widest text-black/40 dark:text-white/40">
          Boulder, Colorado
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
          {SITE.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-black/70 dark:text-white/70">
          Research, a dev agency, markets, and leadership — explore the desk, or
          jump straight to a section.
        </p>
      </section>

      <DeskScene />

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="group rounded-xl border border-black/10 p-5 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <span className="text-black/30 transition group-hover:translate-x-0.5 dark:text-white/30">
                →
              </span>
            </div>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">
              {s.deskObject}
            </p>
            <p className="mt-3 text-sm text-black/70 dark:text-white/70">
              {s.tagline}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
