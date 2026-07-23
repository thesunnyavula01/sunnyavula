import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config for a static/SSG-first site. When dynamic features are added
// (contact form, caching), wire an incremental cache here backed by KV/R2/D1.
//
// `buildCommand` points open-next's internal Next.js build straight at
// `next build`: the package.json `build` script runs `opennextjs-cloudflare
// build` (so Workers Builds CI produces .open-next/), and without this
// override open-next would default to `npm run build` and recurse.
export default {
  ...defineCloudflareConfig({}),
  buildCommand: "npx next build",
};
