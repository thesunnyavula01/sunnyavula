"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/content/sections";

const items = [
  { href: "/", label: "Home" },
  ...sections.map((s) => ({ href: `/${s.slug}`, label: s.nav })),
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/10 bg-background/80 backdrop-blur dark:border-white/10">
      <ul className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 text-sm">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-foreground text-background"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
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
