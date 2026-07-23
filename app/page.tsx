import { DeskScene } from "@/components/desk/DeskScene";
import { SITE } from "@/content/sections";

// Person structured data for search engines. Rendered as an inline JSON-LD
// script (Next.js App Router pattern — crawlers accept it in <body>).
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Abhiram Avula",
  alternateName: ["Sunny Avula", 'Abhiram "Sunny" Avula'],
  url: SITE.url,
  sameAs: [SITE.github, "https://www.linkedin.com/in/abhiramavula01/"],
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
