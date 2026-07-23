import type { Metadata } from "next";
import { sections } from "@/content/sections";
import { SectionPage } from "@/components/ui/SectionPage";

const section = sections.find((s) => s.slug === "att-agency")!;

export const metadata: Metadata = {
  title: section.nav,
  description: section.tagline,
};

export default function Page() {
  return <SectionPage section={section} />;
}
