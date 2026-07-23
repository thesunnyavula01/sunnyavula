import { SITE } from "@/content/sections";

export function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-black/60 dark:text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {SITE.name}
        </span>
        <div className="flex gap-4">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
          <a href={`mailto:${SITE.email}`} className="hover:underline">
            Email
          </a>
          <a
            href="https://attagency.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            ATT Agency
          </a>
        </div>
      </div>
    </footer>
  );
}
