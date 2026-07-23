import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// NOTE: When Cloudflare bindings (KV/D1/R2) are introduced in a later phase,
// enable dev access to them by importing `initOpenNextCloudflareForDev` from
// "@opennextjs/cloudflare" and calling it here. It's intentionally omitted now
// (no bindings yet) so `next dev` runs as plain Next.js and doesn't require the
// workerd binary. Deployment still uses OpenNext via `npm run deploy`.
