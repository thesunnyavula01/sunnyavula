"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/content/sections";

const items = [
  { href: "/", label: "Home" },
  ...sections.map((s) => ({ href: `/${s.slug}`, label: s.nav })),
];

// Floating pill nav, centered at the top of every page (sarastotey-style).
export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <ul className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/80 p-1.5 shadow-[0_12px_40px_-12px_rgba(80,50,20,0.35)] ring-1 ring-black/5 backdrop-blur-md dark:bg-neutral-900/80 dark:ring-white/10">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#b3265c] text-white shadow-sm"
                    : "text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
