import type { Metadata } from "next";
import { sections } from "@/content/sections";
import { SectionStub } from "@/components/ui/SectionStub";

const section = sections.find((s) => s.slug === "att-agency")!;

export const metadata: Metadata = { title: section.nav };

export default function Page() {
  return <SectionStub section={section} />;
}
