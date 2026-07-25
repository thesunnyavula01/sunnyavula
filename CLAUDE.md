# CLAUDE.md

Personal portfolio site. A single interactive 3D "aerial desk" on the landing page acts as
the navigation hub: the camera is driven by scroll, and four objects on the desk are clickable
hotspots that route to four deep-dive subpages. Each subpage details a body of work and links
out to the real thing (live site, paper, profile).

Inspired by the structure of sarastotey.com (full-screen hero object + scroll + nav tabs to
project subpages), but the object here is a **top-down desk**, not an isometric island, and it
is **real interactive WebGL** (react-three-fiber), not pre-rendered slides.

---

## The hero object — aerial desk

- **View:** top-down / slightly angled aerial shot of a desk.
- **Interaction:** scroll drives the camera (dolly + subtle pan/tilt) across the desk; mouse
  drag gives a small parallax orbit. Each desk object has a hover state and a click that routes
  to its section. A text nav (Home / Research / ATT Agency / Markets / Leadership) mirrors the
  hotspots for accessibility and mobile.
- **Mobile fallback:** if WebGL is unavailable or the viewport is small, render a static
  hero image of the desk + the same text nav (see Phase 3).

### Desk object → section mapping

| Desk object                     | Section            | Routes to        |
| ------------------------------- | ------------------ | ---------------- |
| Stack of papers / open notebook | Research           | `/research`      |
| Laptop / monitor showing a site | ATT Agency         | `/att-agency`    |
| Ticker / trading screen         | Markets            | `/markets`       |
| Gavel + microphone              | Leadership & Policy| `/leadership`    |

---

## Sections

Four subpages. Each = hero + narrative + key stats + an outbound link to the real artifact.
Content copy must match the **Content facts** section below (numbers are load-bearing).

1. **Research** (`/research`) — two studies: the Northeastern ERTA income-disparity study
   (team lead) and the CU Boulder autocracies/UN-peacekeeping study. Outbound: the ERTA paper in
   `/public/papers/` — the main paper plus its methodology companion (`Northeastern paper 1`, same
   paper), both staged from `~/Downloads` (still under faculty review).
2. **ATT Agency** (`/att-agency`) — the dev agency. Outbound: **https://attagency.co**.
3. **Markets** (`/markets`) — VSD Investments value-investing formula + finance competition
   record. Outbound: none for now (intentionally link-less). **Dividend Collective is
   intentionally excluded.**
4. **Leadership & Policy** (`/leadership`) — iStartValley, NSDA debate, Boys State, Economics
   For Leaders, Sewa Design to Lead. Outbound: **iStart Insider** podcast —
   https://open.spotify.com/show/4vbP7cvc3Qyb1N96vZN8Me

**Footer / global:** GitHub → https://github.com/thesunnyavula01 · email → abhiram.avula01@gmail.com ·
credit line "Developed entirely by {SITE.name}" (subpage `Footer`, the deck's bottom-right chrome,
and the `FallbackHero`)

---

## Tech stack

- **Next.js** (App Router, TypeScript)
- **Tailwind CSS** for layout/type
- **react-three-fiber** + **@react-three/drei** for the desk scene; **@react-three/postprocessing**
  optional for bloom/DOF
- **Framer Motion** for 2D UI transitions
- **Deploy on Cloudflare Workers** via the **OpenNext** adapter (`@opennextjs/cloudflare`),
  managed with **Wrangler**. This is Cloudflare's current recommended path for the Next.js App
  Router; `@cloudflare/next-on-pages` (Cloudflare Pages) is the older alternative. Requires the
  `nodejs_compat` compatibility flag and a recent `compatibility_date` in `wrangler.jsonc`.
- No backend/database in the current plan ("static, minimal" was chosen), so **no Supabase or
  D1 is required**. If storage is added later, prefer Cloudflare-native **D1** (SQL) or **KV**
  (configured as Wrangler bindings, not `.env.local` vars); external Supabase stays optional.

---

## Planned directory structure

```
app/
  layout.tsx            # root layout, fonts, metadata
  page.tsx              # landing: <DeskScene/> + nav
  research/page.tsx
  att-agency/page.tsx
  markets/page.tsx
  leadership/page.tsx
components/
  desk/
    DeskScene.tsx       # <Canvas>, lighting, camera rig
    Desk.tsx            # the desk + objects (GLTF or primitives)
    Hotspot.tsx         # hover/click wrapper -> router.push
    ScrollCameraRig.tsx # maps scroll progress -> camera
  ui/
    Nav.tsx
    SectionHero.tsx
    StatBlock.tsx
content/
  sections.ts           # single source of truth: titles, blurbs, stats, outbound links
public/
  models/               # .glb assets (desk + objects), draco-compressed
  hero-fallback.svg     # static desk illustration for no-WebGL / small viewports
  papers/               # hosted research PDFs, linked from /research
wrangler.jsonc          # Cloudflare Workers config (name, compat_date, nodejs_compat, assets)
open-next.config.ts     # OpenNext (@opennextjs/cloudflare) adapter config
```

---

## Environment variables

Kept in `.env.local` (gitignored). A committed, non-secret `.env` carries the four
`NEXT_PUBLIC_*` defaults so CI builds (which have no `.env.local`) inline the real site URL;
`.env.local` overrides it locally. `NEXT_PUBLIC_*` are inlined into the client bundle at build
time — never put a secret behind that prefix (in `.env.local` or `.env`). Server-only runtime secrets on Cloudflare are set
with `wrangler secret put` (not shipped in the bundle). Cloudflare resource bindings (D1, KV, R2)
live in `wrangler.jsonc`, not here. Mirror active keys into `.env.example` (no values) after git init.

**Active now (static scope):**

| Variable                    | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | **No longer read** — the canonical origin (`https://sunnyavula.com`) is hardcoded as `SITE.url` in `content/sections.ts` so sitemap/canonicals/OG can never emit the workers.dev host |
| `NEXT_PUBLIC_SITE_NAME`     | Display name in hero + `<title>`                   |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `mailto:` link target                              |
| `NEXT_PUBLIC_GITHUB_URL`    | GitHub profile link in footer (`thesunnyavula01`)  |

**Deployment (Wrangler reads these from the environment — keep in CI secrets, never commit real values):**

| Variable                | Purpose                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Target Cloudflare account for `wrangler deploy`                          |
| `CLOUDFLARE_API_TOKEN`  | Deploy auth — create in the Cloudflare dashboard (scope: *Workers Scripts: Edit*). Generate it yourself; I won't handle the token value. |

**Future / optional (only if a dynamic feature is added — all currently unused):**

| Variable                                                       | Feature                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------ |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`                           | Contact-form email                                           |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`       | Cloudflare Turnstile (form spam protection)                  |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` or `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analytics (Cloudflare Web Analytics / Plausible)            |
| `NEWSLETTER_API_KEY`, `NEWSLETTER_LIST_ID`                     | Newsletter provider                                          |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase — **only if** you pick external Postgres over D1/KV |

> **Bottom line for the current build:** no Supabase, no database, no auth. Deploying this
> static/SSG Next.js site to Cloudflare needs only the two `CLOUDFLARE_*` deploy credentials plus
> the `NEXT_PUBLIC_*` config above.

---

## Build phases

> **Status (2026-07-25, latest+1): the site is now DARK-ONLY.** The four subpages rendered
> white on a light-OS machine while the WebGL deck stayed dark, because every subpage color was
> gated behind Tailwind's `dark:` variant — which is **media-driven** (`prefers-color-scheme`),
> not class-driven, so it never matched the deck's hardcoded palette. Fix: `globals.css` drops
> the `prefers-color-scheme: light/dark` branches, sets `color-scheme: dark` and
> `--background: #10131c` (= `PALETTE.bg`), and paints `body` with the **same radial gradient**
> the deck `<section>` uses, `background-attachment: fixed` so it stays viewport-sized over a
> long page. **Never reintroduce a `dark:` variant or a light branch here** — state subpage
> colors outright. Every `dark:`/`text-black`/`bg-white` pair in `Nav`, `Footer`, `SectionHero`,
> `StatBlock` and `SectionPage` is now a fixed dark value on the deck's type ramp (accent
> kicker → `neutral-50` heading → `neutral-300` body → `neutral-500` meta; cards are
> `border-white/10 bg-white/[0.03]`). Subpages also inherit their **desk accent**: `SectionPage`
> looks up `ACCENTS[sections.findIndex(...)]` from `components/desk/palette.ts` (a dependency-free
> module — it pulls no three.js) and uses it for the hero kicker and every outbound pill, which
> replaces the old `bg-foreground` pills. `viewport.themeColor` is the single value `#10131c`.
> Subpage First Load JS unchanged at 153 kB. Also in this pass: the footer row is reordered to
> `GitHub | Email | … | Developed entirely by {name}` with pipe dividers, in both the subpage
> `Footer` and the deck's bottom-right chrome (the deck one ends `… {year}`; the subpage one
> omits the year since its left-hand `©` line carries it). Build + lint pass; **not eyeballed in
> a browser** (no dev server was run). Live deploy predates this — run `npm run deploy`.
>
> **Status (2026-07-25): technical SEO pass — per-page metadata, JSON-LD, crawlable desk.**
> Zero rendered-appearance changes; only `<head>`, JSON-LD, and one visually-hidden nav.
> **(1) Next merges route metadata SHALLOWLY** — a page-level `openGraph`/`twitter` object
> *replaces* the root layout's outright and also drops the `app/opengraph-image.tsx` card
> (`mergeStaticMetadata` only merges the static file when the segment's own openGraph has no
> `images` key, and only for the segment the file lives in). So the shared OG/Twitter defaults
> live in **`content/metadata.ts`** (`OG_DEFAULTS`, `TWITTER_DEFAULTS`) and are **spread** into
> every page via `pageMetadata()` / `sectionMetadata()`. **Never "inherit" og/twitter from the
> layout** — a page that sets only og:title silently loses og:image, og:type, og:site_name,
> og:locale and twitter:card. All five pages now emit self-referential title / description /
> canonical / og:* / twitter:*.
> **(2) Titles/descriptions:** `title.default` is `SITE.metaTitle`, template `%s — ${fullName}`;
> the home page passes `absoluteTitle` so the name isn't doubled. Each section carries its own
> `metaDescription` (all ≤155 chars, all distinct) in `content/sections.ts`.
> **(3) JSON-LD** in `content/schema.ts`, rendered by the server component
> `components/seo/JsonLd.tsx` (escapes `<`). One canonical Person node at
> `https://sunnyavula.com/#person`; the agency (`ProfessionalService`), the ERTA
> `ScholarlyArticle`, and `worksFor` all reference it by `@id` instead of restating it. All four
> subpages carry a `BreadcrumbList`.
> **(4) Crawlable desk:** the WebGL hotspots are invisible to crawlers and assistive tech, so
> `app/page.tsx` server-renders a `.visually-hidden` `<nav>` of real `<a href>`s (four sections +
> mailto + tel + attagency.co — the last also gives `/` the sitewide agency link the hidden
> footer can't). The `.visually-hidden` class in `globals.css` is `position:absolute;
> width/height:1px; overflow:hidden; clip-path:inset(50%)` — **never `display:none` or
> `visibility:hidden`**, which drop it from the a11y tree and are discounted by crawlers.
> Verified in-pane: 1×1 box at (−1,−1), `visibility:visible`, document scroll size unchanged,
> links present in the accessibility tree.
> **(5) Sitemap:** `<priority>`/`<changefreq>` removed (Google ignores both); `<lastmod>` is no
> longer `new Date()` (an identical, every-build-changing timestamp is what makes Google distrust
> the field) but hand-maintained per-page `updated` dates in `content/sections.ts`, sourced from
> `git log -1 --format=%cI -L <start>,<end>:content/sections.ts` — **bump the one you touch when
> you edit a section's copy**. Both `/papers/*.pdf` added. The home `<loc>` is the bare origin
> with **no** trailing slash because that is what the canonical actually emits: Next hard-codes
> `result.pathname === '/' ? result.origin : result.href`, so `https://sunnyavula.com/` is
> unreachable without `trailingSlash: true` (which would rewrite every subpage to `/research/`).
> If that's ever wanted, flip `next.config.ts` and `app/sitemap.ts` together.
>
> **Status (2026-07-23, latest+4): contact slide — the deck is now SIX stops.** After
> Leadership the tour pans to the **phone** lying at the near-right corner of the desk
> (`<Phone position={[2.65, 0, 1.5]} />` in `Desk.tsx`) and the copy card becomes a
> sarastotey-style **"Contact me."** slide: email, phone, Discord handle, then LinkedIn /
> GitHub / Instagram links. The phone is deliberately **not** a `<Hotspot>` — contact is a slide
> on the landing page, not a route, so there is no `/contact` page and nothing to click on the
> object. `KEYS` in `CameraRig.tsx` gained a 6th keyframe and `STOPS` in `DeskScene.tsx` is now
> `sections.length + 2` (`CONTACT = STOPS - 1`); the stop dots gained a "Contact" dot (berry, like
> Home). New `SITE` fields in `content/sections.ts`: `instagram`, `discord`, `phone`,
> `phoneHref`; `instagram` also joins the Person JSON-LD `sameAs`. The ≤640px / no-WebGL
> `FallbackHero` carries the same contact block, since it has no deck and `/` hides the footer.
> Camera framing for the phone stop is untested by eye — nudge `KEYS[5]` if it sits wrong.
>
> **Status (2026-07-23, latest+3): poster crossfade removed.** The home page no longer paints
> `desk-poster.webp` over the canvas and crossfades it out — the WebGL desk renders directly on
> mount. Gone: the poster overlay + `live` state in `DeskScene.tsx`, `DeskCanvas`'s `FirstFrame`
> helper and `onFirstFrame` prop, and the hoisted `<link rel="preload" as="image">` in
> `app/page.tsx`. `ProgressiveDpr` stays (first frame at dpr 1, real dpr one frame later) since
> it now purely accelerates the real first frame. `public/desk-poster.webp` is kept — the
> ≤640px / no-WebGL `FallbackHero` still uses it (with the inlined blur), so recapture it after
> scene changes per the procedure below. Follow-up: a **loading label** replaces it — a berry
> pulsing dot + "Building the desk…" in the mono/uppercase deck style, server-rendered inside
> the canvas wrapper so it paints with the page, fading out over 300ms when the canvas draws
> (`FirstFrame`/`onFirstFrame` re-added for that signal). The copy card, dots and bottom links
> stay visible the whole time; the label only occupies the empty canvas area.
>
> **Status (2026-07-23, latest+2): desk load-time pass — bundle + first-frame cost.**
> Audited why the WebGL desk took seconds to appear. Four causes, all fixed:
> **(1) drei `<Environment>`/`<Lightformer>`** pulled `three-stdlib`'s RGBE/EXR loaders and
> `@monogrid/gainmap-js` into the home bundle — never called, since the lightformers were
> local — and rendered a six-face cube target at startup. Replaced by `components/desk/env.ts`,
> a 64×32 equirect canvas that three PMREM-filters automatically for the metals. drei chunk
> 99 kB raw / 35 kB gz → 48 kB / 17 kB.
> **(2) drei `<Preload all/>`** did `gl.compile()` *and* drove a `CubeCamera` over the whole
> scene — six extra full-scene renders synchronously in a layout effect before the first frame
> could paint. Removed; every object is visible at stop 0, so frame 1 compiles the same
> programs. **Do not reintroduce `<Preload all/>` here.**
> **(3) ~95 flat meshes** drew 2D artwork (laptop website mock, ticker chart, printed page),
> each its own geometry + material + draw call, all built on the main thread. Now painted once
> into canvases in `components/desk/screens.ts` and applied as one map each; the painters reuse
> the *same local coordinates* as the old meshes, so the layout maps 1:1 against the old markup.
> Only things with real depth (chart bars, paperclip, power LED, webcam) are still geometry.
> **(4) 29 drei `<RoundedBox>`** — each one is a `Shape` + `ExtrudeGeometry` (it doubles
> `bevelSegments` internally) + `toCreasedNormals`, per instance, at mount.
> `components/desk/SoftBox.tsx` halves that profile; props whose rounding cannot be read
> (paper sheets, blotter, trackpad) are plain `<boxGeometry>`. Segment counts cut throughout
> (spheres 20→14, cylinders 32→18, torus 64→24).
> Also: the first frame renders at **dpr 1** and the real dpr is restored one frame later under
> the poster's 700ms crossfade (`ProgressiveDpr`); the directional shadow map bakes over 3
> frames then **freezes** (`shadowBus.ts` lets `<Hotspot>` poke it back on while a hover lift
> animates); wood texture 1024×512 → 512×256, anisotropy 16→8.
> Measured in-pane via the rafshim procedure below: **draw calls 304 → 214 (133 in the
> frozen-shadow steady state), triangles ~119k → 37k, shader programs 37 → 26**, zero console
> errors, all five stops captured and verified.
> **Poster:** 155 kB → **43 kB** (1920×810, q76) with a 363-byte blur data-URI inlined into the
> SSR HTML via `placeholder="blur"`, plus an explicit hoisted
> `<link rel="preload" as="image" fetchPriority="high">` in `app/page.tsx` — next/image's
> `priority` does **not** emit one, so the poster was queueing behind ~400 kB of scene JS.
> `desk-poster.webp` also joins `/_next/static/*` in skipping `run_worker_first`.
> Home-page First Load JS 421 kB gz → 404 kB gz. **three.js itself (183 kB gz) is a hard floor:
> `@react-three/fiber` calls `extend(THREE)` on the entire namespace at module scope, so the
> library can never be tree-shaken while R3F's JSX element names are used.** The poster is
> therefore what makes the desk feel instant on a slow link; the live scene takes over as soon
> as three.js lands. `DeskCanvas` stays a *static* import on purpose — going back to
> `next/dynamic` would serialize the three.js fetch after hydration. Live deploy predates this —
> run `npm run deploy`.
>
> **Status (2026-07-23, latest+1): instant-desk poster.** The deployed desk appeared seconds
> after the copy card (canvas waits on JS download + hydration + ~37 shader compiles). Fix:
> `public/desk-poster.webp` — a REAL 2560×1080 alpha-transparent capture of the WebGL scene at
> the overview stop (camera at `KEYS[0]`, float-bob zeroed, so it matches the live first frame)
> — is painted as SSR HTML over the canvas (`next/image` fill+priority, object-cover; wide
> capture crops sides identically to the camera's vertical-fov framing at narrower aspects) and
> crossfades out 700ms after `DeskCanvas`'s new `onFirstFrame` fires (a `useFrame`-once +
> one-rAF-later signal). `FallbackHero` (≤640px / no-WebGL) now uses the same poster instead of
> the stale light-palette `hero-fallback.svg`. Recapture the poster after any scene change (the
> rafshim procedure below + `__deskState`: setSize 2560×1080 dpr 1, zero the ≥5-child root
> group, render, `toDataURL('image/webp', 0.92)`). Verified in-pane: poster paints in SSR HTML,
> wrapper flips to `opacity-0` after first frame, corner pixels alpha-0 over the page gradient.
>
> **Status (2026-07-23, earlier): dark-mode desk + detail/perf pass — VERIFIED pixel-for-pixel
> at all five stops.** The scene is now a lamp-lit night study: dark navy world (`PALETTE.bg
> #10131c`, dark fog/gradient/copy-card/dots/fallback hero), deep-walnut wood texture with plank
> seams + denser grain, darker floor slab + moss rug, cool ambient + warm key + cool rim lights,
> brightened `ACCENTS` for dark backgrounds. Detail pass on all four hotspot objects: papers
> (manila folder, title + berry rule, two-column text, axes + trend line, paperclip, scribbled
> sticky), laptop (bezel + webcam, hinge, full website mock with chrome/hero/cards/footer),
> ticker (vertical grid, price ticks, volume bars, moving-average polyline, power LED), gavel +
> mic (brass bands/rim/collar, grill rings, on-air LED). Perf: `ContactShadows frames={1}`,
> shadow maps 2048→1024, drei `<Preload all/>`, `powerPreference: "high-performance"`; dpr cap
> raised to 2 for sharpness. **Bug fixed:** drei `<Instances>` keyboards culled against a tiny
> origin bounding sphere and vanished at close camera stops — both now set
> `frustumCulled={false}`. Verified via the rafshim headless-render procedure below (shim added
> temporarily, removed before commit): 304 draw calls, 37 programs, ~119k tris, zero console/
> shader errors. `.claude/launch.json` now has `autoPort: true`. Live deploy predates this —
> run `npm run deploy`.
>
> **Status (2026-07-23, later): desk-island overhaul — scene VERIFIED pixel-for-pixel.** The first
> deck shipped invisible: drei's `<SoftShadows/>` (PCSS) patches global shader chunks and broke
> EVERY `meshStandardMaterial` under three 0.185 — only unlit `meshBasicMaterial` planes drew.
> **Never reintroduce PCSS/shader-chunk patching; use core PCFSoft + drei `ContactShadows` only.**
> The scene is now a floating **island** (sarastotey-style): rounded floor slab + rug + legged desk
> (procedural canvas wood-grain texture) + berry office chair + floor plant + lamp (warm pointlight)
> + keyboard/mouse/bin/clutter; camera stops swing AROUND the island (overview → left → front →
> front-right → right) and mouse/pen **drag orbits** the view (azimuth+pitch, eases home on
> release); hero kicker is **Longmont, Colorado** (also fixed in `opengraph-image.tsx`).
> **Headless render verification (how the bug was caught):** the sandbox pane never composites, so
> rAF and ResizeObserver callbacks never fire and R3F never initializes — shader errors stay
> invisible. Fix: temporarily add a `beforeInteractive` Script in `app/layout.tsx` (gated on
> `?rafshim=1`) that shims `requestAnimationFrame` with setTimeout AND polyfills `ResizeObserver`
> with a getBoundingClientRect poller BEFORE bundles load; `DeskCanvas` keeps a permanent
> `onCreated` handle at `window.__deskState`. Then from browser JS: `st.gl.render(st.scene,
> st.camera)` + drawImage to a 2D canvas + `toDataURL` + POST to a throwaway local Node receiver,
> and Read the JPEG. Renders were verified this way at all five stops (228 draw calls, 21 programs,
> zero shader errors).
>
> **Status (2026-07-23): Workers Builds CI deploy fixed.** The Cloudflare dashboard CI runs
> `npm run build` then `npx wrangler deploy`; deploys failed with "Could not find compiled Open
> Next config" because `npm run build` was only `next build` and never produced `.open-next/`.
> `npm run build` is now the full `opennextjs-cloudflare build` — with
> `buildCommand: "npx next build"` set in `open-next.config.ts` so open-next doesn't default to
> `npm run build` and recurse — and `npm run build:next` keeps the plain Next-only build. Also
> committed a non-secret `.env` (the four `NEXT_PUBLIC_*` defaults, gitignore exception added):
> CI has no `.env.local`, so without it builds inlined the `localhost:3000` fallback into
> metadata/OG/sitemap. `.env.local` still overrides locally.
>
> **Status (2026-07-22, later): landing redesign — sarastotey-style stepped deck.** The home page
> is now a full-viewport tour, not a tall scroll region: wheel/touch/arrow-keys advance exactly one
> stop per gesture through 5 camera stops (aerial overview + one per section) along a catmull-rom
> path (`CameraRig.tsx` — its `KEYS` must stay in sync with `POSITIONS` in `DeskCanvas.tsx`); a left
> copy card (counter, kicker, title, tagline, stats, CTA) animates per stop; vertical accent dots on
> the right jump between stops. The pill nav is now **fixed + top-centered** on every page (berry
> active pill); the footer is hidden on `/` (links live in the deck's bottom-right corner) and
> subpages carry `pt-28` to clear the fixed nav. Scene quality pass: PCSS `SoftShadows`, local
> `Lightformer` environment (no network HDRs), floating desk slab over a shadow-catcher plane, a
> shared clay palette (`components/desk/palette.ts`), and detailed props — instanced keyboard keys +
> a website mock on the laptop screen, candlestick monitor, printed pages + pen + sticky notes,
> gavel + mic, mug, plant, books, pencil cup, phone — with hover rings, floating `Html` labels, and
> route prefetch on the hotspots. Build + lint pass; stepping (wheel/dots/keyboard) and all subpages
> verified via DOM/console in the sandbox browser. **First-frame visual review still needs a human**
> — the sandbox pane can't composite (rAF frozen), so camera framing/lighting are untuned-by-eye.
> The live Workers deploy predates this redesign; run `npm run deploy` to refresh it.
>
> **Status (2026-07-22): Phase 3 complete — SITE IS LIVE** at
> **https://sunnyavula.black-pine-e5ad.workers.dev** (deployed via `npm run deploy`; workers.dev
> URL until the custom domain is wired in the Cloudflare dashboard — that step is manual and
> still open, as is a human visual review of the desk scene, which the sandbox still can't
> render). Phase 3 shipped: (1) small-viewport (≤640px) + no-WebGL static fallback hero —
> `public/hero-fallback.svg` (hand-authored aerial desk illustration matching the scene palette)
> plus a text section nav; (2) WebGL frameloop pauses (`frameloop="never"`) when the hero is
> scrolled off-screen (IntersectionObserver); (3) SEO: `app/opengraph-image.tsx` (static
> next/og card), `app/sitemap.ts`, `app/robots.ts`, OG/Twitter metadata, themeColor viewport;
> (4) a11y: skip-to-content link, `role="img"` + label on the canvas wrapper, captions wrapped
> in `MotionConfig reducedMotion="user"`, live media-query listeners for viewport/reduced-motion;
> (5) `.env.example` added (keys only). `NEXT_PUBLIC_SITE_URL` in `.env.local` now points at the
> workers.dev origin — change it when the custom domain lands (and note: stale `NEXT_PUBLIC_*`
> values stick in the webpack cache; `rm -rf .next .open-next node_modules/.cache` before
> rebuilding after env changes). Gotcha: never run `npm run build` while `next dev` is running —
> they share `.next` and the dev server's cache gets corrupted (delete `.next` and restart).
>
> **Phase 2 (also complete):** All four section subpages are now full pages
> rendered by `components/ui/SectionPage.tsx` (client, framer-motion entrances with
> `reducedMotion="user"`) composing `SectionHero` + `StatBlock` + narrative blocks + honors grid +
> outbound buttons + back-to-desk links. Copy lives in `content/sections.ts` as `narrative:
> NarrativeBlock[]` (kicker/heading/body/bullets) per section — all figures trace to Content facts.
> `SectionStub` is deleted; each route adds `description: tagline` metadata. Build/lint pass;
> all four pages verified in the live preview (content, stats, honors, links; zero console
> errors). Subpages are ~147 kB First Load (no three.js). **Next: Phase 3 — polish** (visual
> review of the desk, SEO/OG, mobile fallback image, deploy).
>
> **Phase 1 (also complete):** The landing page is the interactive R3F
> **aerial desk** (`components/desk/`): a scroll-driven `CameraRig` pans from an aerial overview to
> each of four `Hotspot` objects — papers→Research, laptop→ATT, ticker→Markets, gavel+mic→Leadership
> — with synced framer-motion captions, subtle mouse parallax, and reduced-motion + no-WebGL
> fallbacks. Canvas is `dynamic(ssr:false)`; the three/R3F bundle is code-split onto `/` only
> (~151 kB First Load). `npm run build`/`lint` pass; SSR + all routes return 200 with no console/
> server errors. **Not yet eyeballed in a live browser** (sandbox can't display the pane) — desk
> geometry, camera framing, and palette are first-pass and await visual review.
>
> Stack: Next 15.5 · React 19 · Tailwind v4 · r3f 9 / drei 10 / three 0.185 · OpenNext 1.20 +
> Wrangler 4. Deferred to deploy time: (1) approve npm install scripts for `workerd`/`esbuild`/
> `sharp` before `npm run preview`/`deploy`; (2) `initOpenNextCloudflareForDev()` is omitted from
> `next.config.ts` until bindings are added; (3) Google Fonts fall back to system fonts offline.

- **Phase 0 — Scaffold:** `create-next-app` (TS + Tailwind), install R3F/drei/framer-motion,
  add the OpenNext adapter (`@opennextjs/cloudflare`) + `wrangler.jsonc` + `open-next.config.ts`,
  wire `.env.local`, base layout, `Nav`, and `content/sections.ts`, and copy the two research
  PDFs into `public/papers/`. App runs locally and via `wrangler dev`; four empty routes.
- **Phase 1 — Desk hero:** `DeskScene` with lighting + camera; desk + four objects (primitives
  first, swap in `.glb` later); `ScrollCameraRig`; `Hotspot` hover/click routing. This is the centerpiece.
- **Phase 2 — Subpages:** build the four section pages from `content/sections.ts` — hero, narrative,
  stat blocks, outbound button, back-to-desk.
- **Phase 3 — Polish:** scroll/scene animation tuning, mobile + no-WebGL fallback, SEO/OG images,
  performance (draco/lazy `<Canvas>`), a11y (keyboard nav, reduced-motion), deploy to Cloudflare
  Workers (`npm run deploy`) and wire the custom domain.
- **Phase 4+ (optional):** contact form (Resend), analytics, newsletter — flip the future env vars on.

---

## Commands

```bash
npm run dev        # local Next.js dev server
npm run build      # full OpenNext build: `next build` + .open-next/ Worker bundle (what CI runs)
npm run build:next # plain Next.js production build only (no Worker bundle)
npm run lint       # eslint
npm run preview    # OpenNext build + run the Worker locally (wrangler dev)
npm run deploy     # OpenNext build + deploy to Cloudflare Workers (wrangler deploy)
```

`preview`/`deploy` are added in Phase 0 and wrap `opennextjs-cloudflare build` + Wrangler. Real
deploys need `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` in the environment (CI secrets
preferred). Set any server-only runtime var with `wrangler secret put`; `NEXT_PUBLIC_*` are
inlined at build time from `.env.local`.

---

## Conventions

- All section copy comes from `content/sections.ts` — do not hardcode stats in components.
- Keep the `<Canvas>` client-only (`'use client'` / dynamic import with `ssr:false`) and lazy-load
  heavy 3D so subpages stay light.
- Respect `prefers-reduced-motion`: cut scroll-driven camera moves to instant transitions.
- Every headline number on the site must trace to the **Content facts** below.

---

## Content facts (source of truth for copy)

Verified from the résumé docs. Use these exact figures.

**Research**
- Northeastern (team lead, oversight Prof. Omar Robles): socioeconomic legacy of the 1981
  Economic Recovery Tax Act (ERTA) on U.S. income disparity. Five econometric specifications
  (Welch t-tests; Chow and Quandt-Andrews structural-break tests; six-country OECD placebo test;
  first-differences regression with Newey-West errors) over 65 years of U.S. tax/income data and
  an 812-observation panel of 17 OECD economies. Placebo showed the 1981 break was global, not
  U.S.-specific; first-difference estimate attributes ~12% of the rise directly to ERTA's rate
  cuts. Presented to Prof. Robles; under faculty review.
- CU Boulder (intern under Prof. Shannon): economic incentives behind autocracies' UN
  peacekeeping. Synthesized 10 years of scholarship + mission-level evidence; China/Russia
  deployments track strategic self-interest, not humanitarian need.

**ATT Agency** (co-founder & lead business executive)
- Manages clients, taxes, dev & deployment. Shipped 4 sites + a Thriftly paid-ad campaign.
  Expected ~$10k ARR for FY27. Mission: help Colorado small businesses hit by the digital divide
  modernize their digital infrastructure. Site: attagency.co.

**Markets**
- VSD Investments LLC: value-investing predictive formula, **~27.0% CAGR** (beat the S&P 500);
  grew portfolio **$35k → $91k**; **top 8%** Investopedia competitor. Formula screens for supply
  bottlenecks in emerging trends (e.g., nuclear constraining AI data-center buildout), weights
  entries against Fed rate cycles, scores fundamentals into a composite trustworthiness index.
- Peak to Peak Finance Club: Member (9,10) → Secretary (11) → President (12); grew club to
  **85 members**. CEE National Personal Finance Challenge: National Semifinalist & State Champion.

**Leadership & Policy**
- iStartValley (Intern → Sr. Director, Youth Committee Board): launched "iStart Insider" podcast
  (**2.3k+ streams, top 25%**) — https://open.spotify.com/show/4vbP7cvc3Qyb1N96vZN8Me; PMF
  analysis; pitched a **$300k** startup concept. iStartValley Innovator Award & International
  Semifinalist (won $300); Conrad Innovator.
- NSDA debate (Varsity, School Co-Captain): **1000+ NSDA points**; **2x National Qualifier** (World
  Schools); Public Forum State Finalist; Academic All-American.
- American Legion CO Boys State (Senator/Chair, Dir. Econ Relations, Attorney/Judge): chaired a
  Senate committee, sponsored small-biz bills, managed financial-literacy grants, litigated 1st &
  6th Amendment cases.
- Economics For Leaders (selected cohort, simulation executive); Sewa "Design to Lead" (Stanford
  Biodesign process → lobbying for CO healthcare visa policy).

**Honors** (rendered inside the Leadership & Policy page)
- Congressional Award **Silver Medalist** & STEM Star; President's Volunteer Service **Gold**;
  AP Scholar; 6× Dean's List.

**Links**
- GitHub: https://github.com/thesunnyavula01
- Email: abhiram.avula01@gmail.com
- ATT Agency: https://attagency.co
- iStart Insider podcast: https://open.spotify.com/show/4vbP7cvc3Qyb1N96vZN8Me
- Research PDFs: `public/papers/` — the ERTA paper (main) + its methodology companion (`Northeastern paper 1`)

---

## TODO — confirm before/while building

- **Display name:** confirmed — `Sunny Avula`.
- **Contact email:** `abhiram.avula01@gmail.com` (site display + `mailto:`).
- **Research PDFs:** same paper — `Northeastern paper` is the main paper, `Northeastern paper 1` is
  its methodology companion. `/research` links both, labeled "Paper" and "Methodology".
- **Markets:** intentionally link-less for now.
- Links set: ATT → attagency.co, Leadership → iStart Insider (Spotify), GitHub → thesunnyavula01.
- **Honors:** live inside the Leadership & Policy page (decided — not a separate footer strip).
