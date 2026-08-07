"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections, SITE } from "@/content/sections";
import { ACCENTS, PALETTE } from "@/components/desk/palette";

const items = sections.map((s, i) => ({
  href: `/${s.slug}`,
  label: s.nav,
  accent: ACCENTS[i],
}));

const isActive = (href: string, pathname: string) => pathname.startsWith(href);

// Masthead, not a pill bar.
//
// The old nav was a floating rounded pill row centered at the top — the single
// most recognisable piece of chrome on every scroll-driven portfolio deck, and
// the reason this site read as a copy of one. It is now an editorial masthead:
// wordmark hard left, section links hard right, a hairline rule under both, and
// a scrim instead of a panel so the WebGL desk runs under it uninterrupted.
//
// The wordmark IS the home link, so "Home" is no longer a list item; it carries
// aria-current on "/" and the four section links carry it on their own routes.
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const home = pathname === "/";
  const current = items.find((it) => isActive(it.href, pathname));

  // Close on navigation — the bar stays mounted across route changes.
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
      className="pointer-events-none fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-[#0a0c12]/85 via-[#0a0c12]/45 to-transparent pb-7 pt-5"
    >
      <div className="mx-auto flex max-w-[104rem] items-center justify-between gap-4 px-5 sm:px-9">
        <Link
          href="/"
          aria-current={home ? "page" : undefined}
          className="pointer-events-auto group flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.26em] text-neutral-200 transition-colors hover:text-white"
        >
          <span
            aria-hidden="true"
            className={`block h-1.5 w-1.5 rounded-full transition-opacity ${
              home ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            }`}
            style={{ backgroundColor: PALETTE.brandLight }}
          />
          {SITE.name}
        </Link>

        {/* desktop / tablet: text links, hard right */}
        <ul className="pointer-events-auto flex items-center gap-6 max-sm:hidden lg:gap-8">
          {items.map((it) => {
            const active = isActive(it.href, pathname);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className="block border-b pb-1 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
                  style={{
                    color: active ? it.accent : undefined,
                    borderColor: active ? it.accent : "transparent",
                  }}
                >
                  <span
                    className={
                      active ? "" : "text-neutral-400 transition-colors hover:text-neutral-100"
                    }
                  >
                    {it.label}
                  </span>
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
            className="flex items-center gap-2 border-b border-white/20 pb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-200"
          >
            {current ? current.label : "Index"}
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
              className="absolute right-0 top-full mt-3 w-56 overflow-hidden border border-white/10 bg-[#0e111a]/95 backdrop-blur-md"
            >
              {[{ href: "/", label: "Home", accent: PALETTE.brandLight }, ...items].map(
                (it) => {
                  const active =
                    it.href === "/" ? home : isActive(it.href, pathname);
                  return (
                    <li key={it.href} className="border-b border-white/5 last:border-b-0">
                      <Link
                        href={it.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-300 active:bg-white/5"
                        style={active ? { color: it.accent } : undefined}
                      >
                        <span
                          aria-hidden="true"
                          className="block h-1 w-1 rounded-full"
                          style={{
                            backgroundColor: active ? it.accent : "transparent",
                          }}
                        />
                        {it.label}
                      </Link>
                    </li>
                  );
                }
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-[104rem] px-5 sm:px-9">
        <div className="h-px bg-white/10" />
      </div>
    </nav>
  );
}
