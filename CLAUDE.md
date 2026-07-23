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
  hero-fallback.webp    # static desk image for no-WebGL / mobile
  papers/               # hosted research PDFs, linked from /research
wrangler.jsonc          # Cloudflare Workers config (name, compat_date, nodejs_compat, assets)
open-next.config.ts     # OpenNext (@opennextjs/cloudflare) adapter config
```

---

## Environment variables

Kept in `.env.local` (gitignored). `NEXT_PUBLIC_*` are inlined into the client bundle at build
time — never put a secret behind that prefix. Server-only runtime secrets on Cloudflare are set
with `wrangler secret put` (not shipped in the bundle). Cloudflare resource bindings (D1, KV, R2)
live in `wrangler.jsonc`, not here. Mirror active keys into `.env.example` (no values) after git init.

**Active now (static scope):**

| Variable                    | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | Canonical URL for metadata/OG/sitemap              |
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

> **Status (2026-07-22): Phase 0 complete.** Stack: Next 15.5 · React 19 · Tailwind v4 ·
> react-three-fiber 9 / drei 10 / three 0.185 · OpenNext 1.20 + Wrangler 4. `npm run build` and
> `npm run lint` pass; dev server serves the landing page, all four routes, and the hosted PDFs.
> Deferred to deploy time: (1) approve the npm install scripts for `workerd`/`esbuild`/`sharp`
> before `npm run preview`/`deploy`; (2) `initOpenNextCloudflareForDev()` is intentionally omitted
> from `next.config.ts` until bindings are added; (3) Google Fonts fall back to system fonts in
> offline sandboxes (fine on a real Cloudflare build). **Next: Phase 1 — the R3F desk.**

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
npm run build      # Next.js production build
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
