import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config for a static/SSG-first site. When dynamic features are added
// (contact form, caching), wire an incremental cache here backed by KV/R2/D1.
export default defineCloudflareConfig({});
