// JSON-LD graph for the site. One canonical Person node lives at PERSON_ID;
// every other schema (the agency, the ERTA paper) references it by @id rather
// than restating it, so search engines resolve a single entity sitewide.
//
// Name strategy: the legal/professional form is the schema `name`; the two
// everyday forms are `alternateName`, so a search for either reaches the site.

import { SITE, type Section } from "./sections";

/** Stable @id for the Person node. Referenced from every other schema. */
export const PERSON_ID = `${SITE.url}/#person`;

/** Stable @id for the ATT Agency node. */
export const AGENCY_ID = `${SITE.url}/att-agency#organization`;

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.legalName,
  alternateName: ["Sunny Avula", "Abhiram Sunny Avula"],
  jobTitle: "Economics Researcher & Co-founder, ATT Agency",
  description: SITE.metaDescription,
  // Matches the homepage canonical exactly (no trailing slash — see app/sitemap.ts).
  url: SITE.url,
  email: `mailto:${SITE.email}`,
  telephone: SITE.phone,
  worksFor: { "@id": AGENCY_ID },
  homeLocation: {
    "@type": "Place",
    name: SITE.location,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Longmont",
      addressRegion: "CO",
      addressCountry: "US",
    },
  },
  knowsAbout: [
    "Econometrics",
    "Tax policy",
    "Political economy",
    "UN peacekeeping",
    "Software development",
    "Value investing",
  ],
  sameAs: [
    SITE.github,
    SITE.linkedin,
    SITE.attAgency,
    SITE.instagram,
    SITE.podcast,
  ],
};

export const agencySchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": AGENCY_ID,
  name: "ATT Agency",
  url: SITE.attAgency,
  description:
    "A full service marketing team in Boulder, Colorado for growing businesses, covering advertising, social media management, website development, and SEO & AEO.",
  slogan: "Ideas are easy. Execution is everything.",
  founder: { "@id": PERSON_ID },
  numberOfEmployees: 3,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Boulder",
    addressRegion: "CO",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "Boulder" },
    { "@type": "State", name: "Colorado" },
    { "@type": "Country", name: "United States" },
  ],
  serviceType: [
    "Advertising",
    "Social media management",
    "Website development",
    "SEO & AEO",
  ],
};

export const ertaPaperSchema = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "@id": `${SITE.url}/research#erta-paper`,
  name: "The socioeconomic legacy of the 1981 Economic Recovery Tax Act on U.S. income disparity",
  headline:
    "The socioeconomic legacy of the 1981 Economic Recovery Tax Act on U.S. income disparity",
  author: { "@id": PERSON_ID },
  url: `${SITE.url}/research`,
  // Both PDFs are the same study: the paper and its methodology companion.
  associatedMedia: [
    {
      "@type": "MediaObject",
      name: "ERTA paper",
      encodingFormat: "application/pdf",
      contentUrl: `${SITE.url}/papers/erta-paper.pdf`,
    },
    {
      "@type": "MediaObject",
      name: "ERTA methodology companion",
      encodingFormat: "application/pdf",
      contentUrl: `${SITE.url}/papers/erta-methodology.pdf`,
    },
  ],
  about: [
    "Economic Recovery Tax Act of 1981",
    "Income inequality",
    "Tax policy",
    "Econometrics",
  ],
  inLanguage: "en",
  creativeWorkStatus: "Under faculty review",
  publisher: {
    "@type": "CollegeOrUniversity",
    name: "Northeastern University",
  },
};

/** Home > <page> breadcrumb trail for a section subpage. */
export function breadcrumbSchema(section: Section) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: section.title,
        item: `${SITE.url}/${section.slug}`,
      },
    ],
  };
}
