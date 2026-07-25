"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/content/sections";

// Hidden on the landing page — the full-viewport desk deck carries its own
// GitHub/email links in the bottom-right corner.
export function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-black/60 dark:text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {SITE.fullName} · {SITE.location}
        </span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
          <span aria-hidden="true" className="text-black/25 dark:text-white/25">
            |
          </span>
          <a href={`mailto:${SITE.email}`} className="hover:underline">
            Email
          </a>
          <span aria-hidden="true" className="text-black/25 dark:text-white/25">
            |
          </span>
          <a
            href="https://attagency.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            ATT Agency
          </a>
          <span aria-hidden="true" className="text-black/25 dark:text-white/25">
            |
          </span>
          {/* year lives in the © line on the left, so it isn't repeated here */}
          <span>Developed entirely by {SITE.name}</span>
        </div>
      </div>
    </footer>
  );
}
