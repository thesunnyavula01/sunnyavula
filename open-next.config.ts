import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Config for a static/SSG-only site.
//
// `buildCommand` points open-next's internal Next.js build straight at
// `next build`: the package.json `build` script runs `opennextjs-cloudflare
// build` (so Workers Builds CI produces .open-next/), and without this override
// open-next would default to `npm run build` and recurse.
//
// ---------------------------------------------------------------------------
// Caching. This used to be `defineCloudflareConfig({})`, and the default for
// `incrementalCache` is the string "dummy" — a cache that always misses. That
// is not a theoretical default: every live response carried `x-nextjs-cache:
// MISS`, meaning the Worker was re-rendering the React tree for all five pages
// on EVERY request, even though all five are prerendered at build time and
// never change between deploys. Measured on sunnyavula.com, that was
// `cfWorker;dur=430` on a cold isolate and ~69 ms warm — and at scale a cold
// isolate is not rare, because every Cloudflare colo warms its own.
//
// Two changes, both of which this site is the textbook case for:
//
//   * `staticAssetsIncrementalCache` — the adapter's own words are "should only
//     be used for applications that do NOT want revalidation and ONLY want to
//     serve prerendered data". Verified against .next/prerender-manifest.json:
//     all 13 entries are `initialRevalidateSeconds: false` and there are zero
//     dynamic routes. It reads prerendered payloads from Workers Assets through
//     the ASSETS binding, so there is no KV/R2/D1 to provision and nothing to
//     keep in sync.
//
//   * `enableCacheInterception` — serves that cached entry from the routing
//     layer, before the Next server handler is entered at all. This is where
//     the CPU saving actually comes from.
//
// Safety, checked by reading the adapter rather than assumed:
//   * A cache MISS is not a failure. `cacheInterceptor` returns the event
//     unchanged and routing falls through to the normal Next path — i.e. exactly
//     today's behaviour. The downside of this whole change is "no speedup",
//     not "broken page".
//   * The interceptor is RSC-aware: it serves `cachedValue.html` for document
//     requests and `cachedValue.rsc`/`segmentData` when `RSC: 1` is set, and
//     emits the matching Vary. That matters here because
//     components/perf/prefetch.ts drives a lot of RSC traffic.
//   * Interception is gated on `!isInternalResult(...)`, and middleware runs
//     first, so the workers.dev -> sunnyavula.com 301 in middleware.ts still
//     short-circuits ahead of it.
//   * PPR is not used (a documented incompatibility with cache interception).
//
// NOT solved by this: the HTML still is not stored in Cloudflare's CDN cache,
// so the Worker is still invoked per request — this makes that invocation much
// cheaper rather than removing it. Doing the rest needs a zone-level Cache Rule,
// and it needs a CUSTOM CACHE KEY: the response varies on `RSC` and three other
// Next router headers, and Cloudflare's cache honours no Vary except
// Accept-Encoding, so a naive "Cache Everything" rule would happily serve an RSC
// flight payload to a browser asking for the document. That is a dashboard
// change, not a repo one.
const config = {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    enableCacheInterception: true,
  }),
  buildCommand: "npx next build",
};

export default config;
