import type { MetadataRoute } from "next";
import { SITE, sections } from "@/content/sections";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    ...sections.map((s) => ({
      url: `${SITE.url}/${s.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
