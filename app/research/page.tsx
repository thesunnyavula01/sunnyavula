import type { Metadata } from "next";
import { sections } from "@/content/sections";
import { sectionMetadata } from "@/content/metadata";
import { breadcrumbSchema, ertaPaperSchema } from "@/content/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionPage } from "@/components/ui/SectionPage";

const section = sections.find((s) => s.slug === "research")!;

// Self-referential title/description/canonical/og:*/twitter:* — see
// content/metadata.ts for why the shared defaults are spread, not inherited.
export const metadata: Metadata = sectionMetadata(section);

export default function Page() {
  return (
    <>
      <JsonLd data={[ertaPaperSchema, breadcrumbSchema(section)]} />
      <SectionPage section={section} />
    </>
  );
}
