// Copies OpenNext's prerendered cache entries into the Workers Assets bundle so
// `staticAssetsIncrementalCache` (see open-next.config.ts) can find them.
//
// WHY THIS FILE EXISTS, because it is a sharp edge and not obvious:
// `opennextjs-cloudflare build` does NOT populate the cache. Population lives in
// a separate `populateCache` command, which `opennextjs-cloudflare deploy` and
// `... preview` call for you — but this project's CI does not use either. The
// Cloudflare Workers Builds pipeline runs `npm run build` followed by a raw
// `npx wrangler deploy`, so without this step the deployed Worker would look up
// every page in an assets directory that was never uploaded, miss every time,
// and fall back to rendering on demand — i.e. silently no better than before.
//
// This is deliberately a plain fs copy rather than a shell out to
// `opennextjs-cloudflare populateCache`: for the static-assets cache that
// command does exactly one `fs.cpSync` (see populate-cache.js,
// `populateStaticAssetsIncrementalCache`), but it first spins up a Wrangler
// platform proxy to read env vars, which means booting workerd inside CI for no
// reason. Running it twice is harmless anyway — `npm run deploy` still calls the
// real command, and the copy is idempotent.

import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = ".open-next";

// Mirrors CACHE_DIR in
// @opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache.
// Not imported from there on purpose: that module is built against the workerd
// condition and pulls in the Cloudflare request context. Kept as a literal with
// this pointer instead — if the adapter ever moves it, the post-deploy check
// below is what catches the drift.
const CACHE_DIR = "cdn-cgi/_next_cache";

const from = path.join(OUTPUT_DIR, "cache");
const to = path.join(OUTPUT_DIR, "assets", CACHE_DIR);

if (!fs.existsSync(from)) {
  // Not fatal. A missing cache directory costs the optimisation, not the site:
  // the Worker just falls through to rendering on demand, which is what it did
  // before any of this existed. Failing the build here would block the deploy
  // of unrelated changes, which is the worse outcome — so shout instead.
  console.warn(
    `[populate-static-cache] SKIPPED — ${from} does not exist.\n` +
      `  The deploy will still work, but pages will be rendered per request\n` +
      `  instead of served from Workers Assets. Verify with:\n` +
      `    curl -sI https://sunnyavula.com/ | grep x-opennext-cache\n` +
      `  A working deploy reports "HIT".`
  );
  process.exit(0);
}

fs.cpSync(from, to, { recursive: true });

const count = fs
  .readdirSync(to, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile()).length;

console.log(
  `[populate-static-cache] copied ${count} cache ${
    count === 1 ? "entry" : "entries"
  } -> ${to}`
);
