import type { Metadata } from "next";
import { SITE, type Section } from "./sections";

// IMPORTANT: Next merges route metadata SHALLOWLY. A page-level `openGraph`
// (or `twitter`) object REPLACES the root layout's outright — it does not
// deep-merge — and it also drops the og:image that app/opengraph-image.tsx
// contributes to the root segment (see mergeStaticMetadata in Next: the static
// file is only merged when the segment's own openGraph has no `images` key,
// and only for the segment the file lives in).
//
// So the shared OG/Twitter defaults live here and are SPREAD into every page's
// metadata. Do not "inherit" them from the layout — a page that sets og:title
// without spreading these would silently lose og:image, og:type, og:site_name,
// og:locale and twitter:card.

const OG_IMAGE = {
  // The generated card from app/opengraph-image.tsx.
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE.fullName} — research, ATT Agency, markets, and leadership`,
  type: "image/png",
};

export const OG_DEFAULTS = {
  type: "website",
  siteName: SITE.fullName,
  locale: "en_US",
  images: [OG_IMAGE],
} satisfies Metadata["openGraph"];

export const TWITTER_DEFAULTS = {
  card: "summary_large_image",
  images: [OG_IMAGE],
} satisfies Metadata["twitter"];

type PageMetaInput = {
  /** <title>. Run through the layout's "%s — name" template unless `absoluteTitle`. */
  title: string;
  /** Full, self-contained og:title — the template is NOT applied to it. */
  ogTitle: string;
  description: string;
  /** Route path, leading slash. Used for the canonical and og:url. */
  path: string;
  absoluteTitle?: boolean;
};

/** Builds a complete, self-referential metadata object for one route. */
export function pageMetadata({
  title,
  ogTitle,
  description,
  path,
  absoluteTitle = false,
}: PageMetaInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OG_DEFAULTS,
      title: ogTitle,
      description,
      url: path,
    },
    twitter: {
      ...TWITTER_DEFAULTS,
      title: ogTitle,
      description,
    },
  };
}

/** Metadata for one of the four section subpages. */
export function sectionMetadata(section: Section): Metadata {
  return pageMetadata({
    title: section.nav,
    ogTitle: `${section.nav} — ${SITE.fullName}`,
    description: section.metaDescription,
    path: `/${section.slug}`,
  });
}
