import type { Metadata } from "next";
import { DeskScene } from "@/components/desk/DeskScene";
import { JsonLd } from "@/components/seo/JsonLd";
import { personSchema } from "@/content/schema";
import { pageMetadata } from "@/content/metadata";
import { sections, SITE } from "@/content/sections";

export const metadata: Metadata = pageMetadata({
  // `absoluteTitle` so the home title is not run through the layout's
  // "%s — Abhiram "Sunny" Avula" template, which would repeat the name.
  title: SITE.metaTitle,
  absoluteTitle: true,
  ogTitle: SITE.metaTitle,
  description: SITE.metaDescription,
  path: "/",
});

// The landing page IS the desk: a full-viewport, stepped tour. The centered
// pill nav (layout) and the desk hotspots both route to the four sections.
export default function Home() {
  return (
    <>
      <JsonLd data={personSchema} />

      {/* The desk's clickable objects live inside a WebGL canvas, so they are
          invisible to crawlers and to assistive tech. This mirrors them as real
          links in the server-rendered HTML.

          `.visually-hidden` keeps them off-screen without display:none or
          visibility:hidden — those are discounted by crawlers AND removed from
          the accessibility tree, which would defeat both purposes. */}
      <nav className="visually-hidden" aria-label="Desk objects">
        <h2>Explore the desk</h2>
        <ul>
          {sections.map((s) => (
            <li key={s.slug}>
              <a href={`/${s.slug}`}>{s.deskLinkText}</a>
            </li>
          ))}
          <li>
            <a href={`mailto:${SITE.email}`}>
              Contact — email {SITE.fullName} at {SITE.email}
            </a>
          </li>
          <li>
            <a href={SITE.phoneHref}>
              Contact — call {SITE.fullName} at {SITE.phone}
            </a>
          </li>
          <li>
            <a href={SITE.attAgency} rel="noopener noreferrer">
              ATT Agency — attagency.co, the dev studio co-founded by{" "}
              {SITE.fullName}
            </a>
          </li>
        </ul>
      </nav>

      <DeskScene />
    </>
  );
}
