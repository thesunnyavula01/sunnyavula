import { DeskScene } from "@/components/desk/DeskScene";
import { SITE } from "@/content/sections";

// Person structured data for search engines. Rendered as an inline JSON-LD
// script (Next.js App Router pattern — crawlers accept it in <body>).
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.legalName,
  alternateName: ["Sunny Avula", SITE.fullName],
  url: SITE.url,
  email: `mailto:${SITE.email}`,
  jobTitle: "Co-founder & Lead Business Executive",
  worksFor: {
    "@type": "Organization",
    name: "ATT Agency",
    url: SITE.attAgency,
  },
  homeLocation: {
    "@type": "Place",
    name: SITE.location,
  },
  knowsAbout: [
    "Economics research",
    "Econometrics",
    "Tax policy",
    "Web development",
    "Value investing",
    "Public policy",
    "Debate",
  ],
  sameAs: [SITE.github, SITE.linkedin, SITE.instagram, SITE.podcast],
};

// The landing page IS the desk: a full-viewport, stepped tour. The centered
// pill nav (layout) and the desk hotspots both route to the four sections.
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <DeskScene />
    </>
  );
}
