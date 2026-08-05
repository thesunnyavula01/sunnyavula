"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/content/sections";

const items = [
  { href: "/", label: "Home" },
  ...sections.map((s) => ({ href: `/${s.slug}`, label: s.nav })),
];

const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

// Floating pill nav, centered at the top of every page (sarastotey-style).
//
// The five pills need ~490px, so on a 375px phone the bar was a silent
// horizontal scroller: two of the five sections sat off the right edge with
// nothing to suggest they were there. Under Tailwind's `sm` breakpoint the row
// is replaced by a single pill naming the current page, which opens the full
// list on tap. The desktop row below is untouched — it is just `max-sm:hidden`.
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const current = items.find((it) => isActive(it.href, pathname)) ?? items[0];

  // Close on navigation — the pill stays mounted across route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // `true` so a tap on the WebGL deck closes the menu before the deck's own
    // pointer handlers start a drag under it.
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      {/* desktop / tablet: the full pill row */}
      <ul className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-neutral-900/80 p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur-md max-sm:hidden">
        {items.map((it) => {
          const active = isActive(it.href, pathname);
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#b3265c] text-white shadow-sm"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* phones: current page + disclosure */}
      <div ref={menuRef} className="pointer-events-auto relative hidden max-sm:block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-menu"
          className="flex items-center gap-2 rounded-full bg-neutral-900/85 py-2.5 pl-5 pr-4 text-sm font-medium text-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur-md"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#e8548a]"
          />
          {current.label}
          <span className="sr-only">— open menu</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 8"
            className={`h-2 w-3 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M1 1.5 6 6.5l5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <ul
            id="nav-menu"
            className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl bg-neutral-900/95 p-1.5 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.85)] ring-1 ring-white/10 backdrop-blur-md"
          >
            {items.map((it) => {
              const active = isActive(it.href, pathname);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-[#b3265c] text-white"
                        : "text-neutral-300 active:bg-white/10"
                    }`}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
