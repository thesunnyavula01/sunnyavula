import type { MetadataRoute } from "next";
import { SITE, sections } from "@/content/sections";

// Notes on what is deliberately absent:
//  - <priority> and <changefreq>: Google ignores both outright.
//  - `new Date()` for <lastmod>: a build timestamp is identical across every
//    URL and changes on each deploy, which is exactly the pattern that makes
//    Google stop trusting the field. The dates come from `updated` in
//    content/sections.ts instead — real per-page content-change dates.
//
// The homepage <loc> is the bare origin, with NO trailing slash, because that
// is what the canonical tag actually emits and the two must match byte for
// byte. Next hard-codes this: resolveAbsoluteUrlWithPathname does
// `result.pathname === '/' ? result.origin : result.href`, so the root
// canonical is always slash-less unless `trailingSlash: true` is set in
// next.config — which would also rewrite every subpage URL to "/research/".
// If the trailing-slash form is ever wanted, flip it in next.config and here
// together, never in one place alone.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, lastModified: SITE.updated },
    ...sections.map((s) => ({
      url: `${SITE.url}/${s.slug}`,
      lastModified: s.updated,
    })),
    // The research PDFs are indexable documents in their own right.
    {
      url: `${SITE.url}/papers/erta-paper.pdf`,
      lastModified: SITE.papersUpdated,
    },
    {
      url: `${SITE.url}/papers/erta-methodology.pdf`,
      lastModified: SITE.papersUpdated,
    },
  ];
}
