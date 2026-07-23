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

**Footer / global:** GitHub → https://github.com/divcollective01 · email → abhiram.avula01@gmail.com

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
| `NEXT_PUBLIC_GITHUB_URL`    | GitHub profile link in footer (`divcollective01`)  |

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
- NSDA debate (Varsity, School Co-Captain): **960+ NSDA points**; **2x National Qualifier** (World
  Schools); Public Forum State Finalist; Academic All-American.
- American Legion CO Boys State (Senator/Chair, Dir. Econ Relations, Attorney/Judge): chaired a
  Senate committee, sponsored small-biz bills, managed financial-literacy grants, litigated 1st &
  6th Amendment cases.
- Economics For Leaders (selected cohort, simulation executive); Sewa "Design to Lead" (Stanford
  Biodesign process → lobbying for CO healthcare visa policy).

**Honors** (rendered inside the Leadership & Policy page)
- Congressional Award **Silver Medalist** & STEM Star; President's Volunteer Service **Gold**;
  AP Scholar; Dean's List.

**Links**
- GitHub: https://github.com/divcollective01
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
- Links set: ATT → attagency.co, Leadership → iStart Insider (Spotify), GitHub → divcollective01.
- **Honors:** live inside the Leadership & Policy page (decided — not a separate footer strip).
