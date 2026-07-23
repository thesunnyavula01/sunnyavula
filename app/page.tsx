import Link from "next/link";
import { sections } from "@/content/sections";
import { DeskScene } from "@/components/desk/DeskScene";

export default function Home() {
  return (
    <>
      <DeskScene />

      <section id="sections" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-sm uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
          All sections
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="group rounded-xl border border-black/10 p-5 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{s.title}</h3>
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
        </div>
      </section>
    </>
  );
}
