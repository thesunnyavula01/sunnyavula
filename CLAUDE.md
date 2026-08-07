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
- **Phones (<640px):** the same interactive deck, restacked — desk on top, copy card as a
  bottom sheet, swipe the desk to travel, horizontal stop dots. **Not** a static image.
- **Fallback:** only when WebGL is unavailable — a static hero image of the desk + text nav.

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
2. **ATT Agency** (`/att-agency`) — the Boulder growth studio. Outbound: **https://attagency.co**
   and **https://attagency.co/results**, plus per-case-study links to the client projects.
3. **Markets** (`/markets`) — VSD Investments value-investing formula + finance competition
   record. Outbound: none for now (intentionally link-less).

> **The Dividend Collective is excluded SITEWIDE — not just from Markets.** It must not appear
> anywhere: not as a Markets venture, not as an ATT client case study, not in a stat, a bullet,
> a blurb, a `metaDescription`, or a link. It is a real ATT project and it is prominent on
> `attagency.co/results` (it carries the agency's strongest single metric, `0 → 9` paid
> subscribers in a launch quarter), so **any future pass that re-reads the agency site will be
> tempted to pull it back in. Don't.** When a results figure is needed, use the Pathmind /
> KasaiSora reach or the shipped-site counts instead.
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

> **Status (2026-08-07, latest+13): the deck's chrome was a clone of sarastotey.com — it
> isn't any more.** Sunny put the two first screens side by side: the copy had already been
> rewritten (latest+12) but the FURNITURE was identical — floating rounded glass card on the
> left, `01 / 6` counter, vertical dot rail on the right, `SCROLL TO EXPLORE ↓` bottom-left,
> centred pill nav. Five pieces of chrome, five matches. Copy was never the resemblance.
> **(1) The card is gone, and nothing replaced it.** Type sits directly on the scene,
> bottom-left, and legibility comes from a **scrim**. That scrim is load bearing, not
> decoration: the first cut anchored it in the corner at `(-8%, 100%)` and failed by eye,
> because the headline sits ~40% UP the frame where a corner gradient has already fallen off —
> 60pt serif ran straight over the lit desk. It is now centred on the copy itself
> (`58% 66% at 6% 76%`), holds ~0.7 alpha out to the headline, and clears by 80%, so the desk's
> bright middle and right — where every camera stop puts its subject — stay untouched. A
> `text-shadow` on the copy block is the second layer, for the frames where the camera parks
> something bright behind a thin glyph.
> **(2) `IndexStrip` replaces THREE controls at once** — the dot rail, the counter and the
> scroll prompt: six ruled columns across the bottom edge, `00 START · 01 PAPERS · … · 05 SAY
> HI`, active column ruled in that stop's accent. It states position, length and destination
> together, which none of the three did alone. The four middle columns are named for the
> OBJECT, not the section (the section name is already the heading above); screen readers get
> "Stop 03 — go to Markets". **Phones drop the names and keep the numbers** — 62px will not
> hold "MONITOR" at a legible size.
> **(3) `Nav` is a masthead**: wordmark hard left, section links hard right, hairline under
> both, scrim instead of a panel. **The wordmark is the home link**, so "Home" is no longer a
> list item. Active link takes its own section's accent as colour AND underline.
> **(4) Pink is gone sitewide.** `PALETTE.berry`/`berryLight` are now `brand`/`brandLight` =
> **petrol teal `#1d7f92` / `#3fbfd4`**, the walnut desk's complement — which is why it can be
> this saturated without fighting the scene, and why the chair, pen, sticky notes and laptop
> browser bar all recoloured with it. ATT Agency's accent (which WAS `berryLight`) is now
> **coral `#e8785a`**. `ACCENTS` is chosen for hue separation — indigo 232° / coral 14° /
> green 160° / marigold 36°, with the brand teal at 190° deliberately outside the set because
> it marks the two stops that are not sections. Also updated: `::selection`, and
> `public/desk-poster.webp` — **recaptured, because the no-WebGL fallback was still showing the
> pink chair** (2560×1080 → 1920×810 q76, 55 kB; its inlined 24px blur URI regenerated with
> it).
> **(5) Headlines are a display serif** (`Instrument_Serif`, one weight, `--font-serif` →
> `font-serif`). Body and every label stay Geist / Geist Mono; the contrast between them IS the
> type system. Subpage `<h1>`s and narrative `<h2>`s take it too, so the two halves of the site
> don't drift apart.
> **Verified by eye at 1280×800 and 375×812, plus /att-agency.** Caught that way and fixed: the
> scrim miss above, `MONITOR` clipping in the strip on phones, an orphaned "DIVE IN" on both
> the desktop and phone hint lines (desktop tracking 0.2em → 0.14em, phone line shortened), a
> headline breaking as "…read as a / résumé." (`text-balance`), and a phone bottom edge where
> the hint, the two-line credit and the strip were stacked with no gaps (copy region
> `pb-14` → `pb-24`, credit to `bottom-[3.55rem]`). Measured overflow is 0 at 375×812 and
> 375×667. Build + lint pass; `/` First Load JS unchanged at 422 kB.
> **NEW verification trick — the pane could not composite this whole session**, so
> `computer{screenshot}` timed out on every call and, worse, the frozen compositor silently
> stops rAF: R3F never initialises (canvas stuck at 300×150), framer-motion's `AnimatePresence`
> exits never finish, and CSS transitions read back their START value from
> `getComputedStyle` — three ways to "find" bugs that do not exist. The workaround, from the
> browser console alone: **(a)** shim `requestAnimationFrame` with `setTimeout` and
> `delete Element.prototype.animate`, which restarts both framer and the R3F loop; **(b)**
> dispatch a `window` `resize` event — react-use-measure listens for it, which is what makes
> R3F finally size its canvas; **(c)** `st.gl.render(...)` then `toDataURL` in the SAME task
> (there is no `preserveDrawingBuffer`); **(d)** clone `document.body`, swap each `<canvas>` for
> an **absolutely positioned** `<img>` of those pixels (an in-flow `<img>` becomes a flex item
> with intrinsic size and stretches the phone layout), serialize with **`XMLSerializer`** — not
> `innerHTML`, which is not well-formed XML and makes `decode()` throw `EncodingError` — wrap in
> an SVG `<foreignObject>`, rasterize via `Image` + `drawImage`, and POST the PNG to a throwaway
> `localhost:3999` receiver. **Two traps in there:** every `url()` in the CSS must be inlined as
> a data URI (a data: SVG has no base URL, so `/_next/...` fonts silently vanish), and the type
> metrics must be **pinned inline from `getComputedStyle`** — collecting CSS text loses
> Tailwind v4's `@layer` order once HMR appends a second sheet, at which point preflight's
> `h1 { font-size: inherit }` beats the size utility and every heading renders at 16px.
>
> **Status (2026-08-06, latest+12): the landing card is a LEGEND, not a name card.** Stop 0 —
> the first thing anyone sees — opened with "My name is Sunny Avula." plus a list of four job
> titles, which is the one screen on the site that said nothing the `<title>` didn't. It now
> reads the desk as its own key: kicker `Sunny Avula · Longmont, Colorado`, h1 **"A desk, read
> as a résumé."**, one line of copy, then four rows — `● PAPERS  The 1981 tax act, tested five
> ways` / `LAPTOP  A growth studio in Boulder` / `MONITOR  A formula I trust with real money` /
> `GAVEL  Every room I've argued in` — each dotted in that section's desk accent. It states the
> metaphor and teaches that the desk is clickable in the same breath. **Camera rig, stops, dots,
> wheel/swipe/keyboard stepping and every other stop are untouched.**
> **(1) Copy lives in `DESK_INTRO` (`content/sections.ts`), and `legend[i]` is POSITIONAL** —
> it pairs with `sections[i]`, `ACCENTS[i]` and camera stop `i + 1`; `DeskLegend` indexes all
> three off one `i`. Keep the array the same length and order as `sections`.
> **(2) The rows jump stops (`goTo(i + 1)`), they do NOT route.** Same move the dots make, so a
> visitor can never skip the tour from the first screen; the section stop they land on already
> carries its own "Explore X →" link. `FallbackHero` passes no `onSelect` — it has no camera —
> and renders the identical rows as static text captioning the poster.
> **(3) The label column is `w-20`, measured not chosen.** "MONITOR" renders **76px** at 10px
> mono/0.18em, and letter-spacing adds a trailing gap after the last letter, so the first cut
> (4.25rem desktop / 3.5rem phone) had MONITOR overrunning its box and colliding with the phrase
> beside it. One width at every size; the phrase column still has ~20px to spare at 375px.
> **(4) The phone kicker drops to `tracking-[0.14em]`.** Name + city wraps to a second line at
> 0.25em in a 375px sheet, and **the sheet's height is fixed** (`h-[min(24.5rem,58svh)]`), so a
> wrapped line is 16px stolen from the copy below it — with the legend added, the card body
> overflowed its scroll valve by 17px. With that plus `max-sm:space-y-0.5` on the rows, measured
> overflow is **0 at both 375×812 and 375×667**.
> **(5) The name is out of the `<h1>` on purpose** — it is in the accent kicker instead. The
> search-weighted variants are unaffected: `SITE.metaTitle`, the Person JSON-LD, and the
> visually-hidden desk nav in `app/page.tsx` all still carry `Abhiram "Sunny" Avula`.
> `SITE.updated` bumped to 2026-08-06. Home First Load JS **421 → 422 kB** (the "416 kB" in the
> latest+4 note was stale; 421 is the measured pre-change baseline).
> **Verified by eye with NO dev server, via a new trick worth keeping.** `next build`
> prerenders `/` to `.next/server/app/index.html`; copy it to `.next/home-preview.html` with
> `sed 's|/_next/|./|g'` (so `/_next/static/*` resolves against `.next/`) and open it over
> **`file://`** in the pane. It must live INSIDE the project folder — files outside it render as
> a static snapshot the pane cannot screenshot. The page **hydrates and renders the real WebGL
> desk**, so this is a full-page substitute for the localhost-POST trick, not just an SVG one.
> Two caveats: the `<footer>` appears (it hides on `pathname === "/"`, and under `file://` the
> pathname is the file path — not a regression), and framer's `AnimatePresence` needs ~1s
> between acting and asserting, not one tick. Caught this way: the MONITOR collision and the
> 17px sheet overflow, neither of which was visible in the source. All four rows were then
> driven through `__reactProps$*` and land on Research / ATT Agency / Markets / Leadership with
> the right CTA. Build + lint pass (`next build`; the OpenNext wrapper was not run locally —
> nothing in this pass touches deps or worker config, and CI runs it on push).
>
> **Status (2026-08-06, latest+11): audited all nine figures for a reader with no economics.**
> Every figure was rendered and read (see the sharp/esbuild trick in latest+10). **Five were
> already fine and were left alone** — `SpecLadder` and `AttributionSlider` are the strongest
> writing on the site (plain question → plain answer → `plainStat` → notation; do not "tidy" the
> redundancy out of them), and `CompoundingCurve`, `FormulaStages` and `ClubLadder` carry no
> jargon. **Three were failing, all in the same way: the chart assumed a vocabulary the takeaway
> had not given it.**
> **(1) `FireControl` was the worst on the site.** Two bare coefficients and two bare p-values,
> on an axis with no ticks, no unit, and only one of its two directions named — nothing told the
> reader what `+0.013` was 0.013 *of*. Now: the axis states its unit outright ("each dot = how
> far the top 1% share moves per 1-point rise in the tax rate"), it has ticks, **both**
> directions are named (the right-hand one at 0.7 opacity — it is not a claim anyone makes, but
> an axis with one end labelled cannot be read at all), each p-value ships with the sentence it
> stands for ("could easily be chance" / "unlikely to be chance"), and the two states are
> **numbered** because the "after" estimate sits to the LEFT of the "before" one — reading order
> and time order run opposite ways and a chevron alone does not fix that. **The FIRE coefficient
> moved out of the collapsed provenance note into a `Readout`** — it is the reason the figure
> exists, phrased as "each extra point of GDP going to finance → +2.97 points to the top 1%".
> H 146 → 184.
> **(2) `TrendFlip` never said what its y axis was a percent OF.** Gridlines read "22%", "20%"
> … and the only statement of the variable was in the subtitle. `PAD.t` 16 → 32 (H 280 → 292)
> buys a row for the title "Share of all US income going to the top 1%". The min–max bands were
> also unlabelled — two dotted rules floating across the chart, explained only inside the
> disclosure — so they now carry an in-chart caption. Legend drops the `pp` abbreviation.
> **(3) `DistributionShift` had no stated meaning for curve HEIGHT**, and the white threshold
> marker was an unexplained vertical rule. One line each: "taller = more of that era's years
> landed at that level", and a note under the slider tying the marker to it.
> Rule this pass encodes: **a figure has to be legible with the disclosure closed.** `source` is
> provenance, not the glossary — if a mark, an axis or a number cannot be read without opening
> it, the explanation belongs on the chart. Build + lint pass, subpage First Load JS unchanged at
> 176 kB, no dev server run.
>
> **Status (2026-08-06, latest+10): the placebo figure was rebuilt — it was the one chart on
> the site that fought its own labels.** `PlaceboRange` used to be two floating lanes with a
> translucent full-height rectangle behind them standing in for the range. Three defects, all
> structural: **(1)** the rectangle ran underneath both lane headings and the "Canada" label, so
> body text sat half on and half off a gray box — that is what read as "visually discomforting";
> **(2)** nothing tied the two lanes to the axis (three unconnected rules, no gridlines), so
> *"the US lands inside their range"* — the entire claim of the block — could not be checked by
> eye; **(3)** the "+4 more" note was centred at **F = 50**, i.e. it occupied a data position on
> a value axis while carrying no value.
> Now: ranked bars on **one shared scale**, every mark starting at the same zero line, with
> shared vertical gridlines; a **name/value gutter** on the left (tabular-nums) where labels can
> never collide with a mark — and which, because it is the left edge, is what a phone reader sees
> first inside `ChartScroll`; the range redrawn as a **measurement bracket with end ticks**
> between the two groups, sitting directly above the US bar so "inside their range" is a straight
> vertical comparison; and a dashed guide carrying the US bar's end up to that bracket, because
> **96.2 and 97.1 are four pixels apart at this scale** and the near-tie is the point.
> **The four countries with no published F are off the scale on purpose** — chips in plain HTML
> below the plot, not marks. The honest statement about them is "significant, magnitude unknown",
> and there is no x-position for that; putting them anywhere on the axis invents one. Keep them
> out of the SVG. A `Readout` carries the tally that a lay reader actually needs (**7 of 7**
> countries tested showed a 1981 break) and the HTML chips reflow at full size on a phone instead
> of inheriting the 640-unit viewBox.
> New `growX` in `components/viz/motion.ts` (SVG bars; `transformBox: fill-box` for the same
> reason `pop` needs it). Subpage First Load JS 175 → **176 kB**. Build + lint pass.
> **Verified by eye without a dev server, via a new and much cheaper trick than the localhost-POST
> one below:** esbuild bundles the figure's TSX with `framer-motion` aliased to a two-line stub
> (`useInView: () => true`, `useReducedMotion: () => false`, so `useReveal` reports *revealed*),
> `react-dom/server` renders it to static markup, the `<svg>` is lifted out, given `#171a23` as a
> background, and **`sharp` rasterizes it to a PNG** — no browser, no server, no canvas. Two
> iterations were caught that way: the first cut left a dead 68px band between the groups (the
> bracket now fills it) and the range label needed to say "the countries above" rather than "all
> six", since only two of the six have a published figure. Rendered and checked at 1x and 2x.
>
> **Status (2026-08-06, latest+8): `/research` and `/markets` now carry nine interactive
> figures.** Both pages were three narrative blocks and no evidence. Research is now nine blocks
> with five figures, markets seven blocks with three. New: `content/figures.ts` (every number,
> cited), `components/viz/` (the figures), `ChartScroll` + `Figure`/`Legend` primitives.
> **(1) The ERTA PDFs were a goldmine nobody had opened.** `public/papers/*.pdf` embed subset
> fonts, so naive text extraction returns glyph ids, which is presumably why the stats were
> never used. The subset is a flat offset from WinAnsi: **`char = glyphCode + 29`** (glyph 0x03
> is space). Decode the `<hex> Tj` operators with that and the full text falls out. Everything
> in `content/figures.ts` came from there — Welch t = −10.10, Chow F(2,61) = 86.03, trend
> −0.156 → +0.206 pp/yr, Quandt-Andrews max at **1977** (F 107.8) not 1981 (96.2), the six-country
> placebo, the panel and event-study **nulls**, first-differences β = −0.053, and the arithmetic
> behind the ~12%.
> **(2) The page shows the null results on purpose** — decided with Sunny. `ERTA_SPECS` carries
> all seven specifications, the two nulls written up at the same length as the wins, and the
> placebo test (which is the most damaging result for a naive causal claim) gets its own block
> and figure. **Do not filter `SpecLadder` down to the significant rows.** The thesis the page
> argues is the defensible one: the break was global, the magnitude was American.
> **(3) Chart colors are NOT `ACCENTS`.** The deck accents were brightened for the 3D scene and
> sit at OKLCH L ≈ 0.71–0.76, above the 0.48–0.67 band a mark needs on a dark surface. `VIZ` in
> `components/viz/theme.ts` is the same hues snapped to the top of the band: `#808fdb` /
> `#c37f29` / `#0daf80`. Validated as a set with the dataviz skill's validator against the card
> surface `#171a23` (= page bg under `bg-white/[0.03]`): worst adjacent CVD ΔE 23.7 research /
> 9.7 markets, normal-vision 23.6 / 20.1, lightness band + chroma floor + 3:1 contrast all pass.
> **Re-run the validator if any of these change**; do not eyeball a replacement.
> **(4) `ChartScroll` is load bearing, not styling.** Charts are authored against a 640-unit
> viewBox. `w-full` alone shrinks that to the container, and the figure area on a 375px phone is
> ~309px — a 0.48x downscale that renders the 9px axis labels at **4.4px**. So the plot keeps its
> design width and overflows into its own scroller. **Wrap only the `<svg>`** — sliders and
> readouts must stay outside or they inherit the 640px floor and scroll for nothing. On desktop
> the figure is 694px, min-width never binds, nothing scrolls.
> **(5) The markets compounding curve is arithmetic, not a trade record.** Only the two
> endpoints and the CAGR are real; the curve between them is what those endpoints imply and the
> caption says exactly that. **Never add intermediate marks, drawdowns, or dates to it**, and
> never date the axis — it is "Year 0–4" deliberately. Same rule for `FormulaStages`: the three
> published pillars only, no invented sub-factors or weights.
> **(6) Registry wiring.** `VisualKey` is a union in `content/sections.ts`; `VISUALS` in
> `components/viz/index.tsx` is typed `Record<VisualKey, ComponentType>`, so adding a key fails
> the build until its component exists. Copy stays in content, components stay out of it.
> **Verified on a running dev server** (Sunny approved it this time). The preview pane still
> cannot composite, so `computer{screenshot}` times out — instead each SVG was serialized with
> `XMLSerializer`, drawn to a canvas at 2x, and POSTed as a PNG to a throwaway localhost:3999
> receiver, then read back as an image. **That trick works for any SVG in this repo and is much
> cheaper than the rafshim procedure below** (which is still the only option for WebGL).
> Caught by eye that way: the placebo figure had two label collisions, the FIRE figure labelled
> zero as if it were the right end of the axis, the trend bands read as an area chart, and the
> distribution's threshold line ran full height. All four fixed. Also verified: both sliders
> compute correctly against the closed forms, the accordion opens one row at a time, the stepper
> disables at both ends, no page-level horizontal overflow at 375 or 1280, no clipped text.
> **React state updates are async — assertions in the same synchronous `javascript_tool` call
> read stale DOM.** Await a tick between acting and asserting, or you will "find" bugs that
> aren't there. Likewise `element.click()` does not reach React's root listener in this pane;
> call the handler off `__reactProps$*` instead.
> Subpage First Load JS 155 → **169 kB** for all nine widgets (hand-rolled SVG, no chart
> library — recharts alone would have roughly doubled it). `updated` bumped to 2026-08-06 for
> both sections. Build + lint pass. **Confirmed live on sunnyavula.com after the push** — see
> the deploy note under Commands; this repo does not need a manual `npm run deploy`.
>
> **Status (2026-08-05, latest+7): `/att-agency` rewritten from the live agency site.** The
> page was two narrative blocks of role description and no evidence — the driest section on the
> site. It is now eight blocks built from `attagency.co` and `attagency.co/results`: role and
> mission, the studio's positioning against AI site builders, a "by the numbers" block, three
> case studies (soymods & Pathmind, Kodama, the three artist portfolios), the
> interactive-experiments shelf, and the existing Google Skillshop block.
> Every figure is transcribed in **Content facts → ATT Agency** below; the reconciled counts
> and the display-domain-vs-real-host trap are documented there.
> **`stats` deliberately stayed at three entries.** They render in *two* places — the subpage
> `StatBlock` (a 2/3-col grid, so 3 or 6 are the only clean counts) and the deck's copy card,
> which on phones lives in a **fixed-height sheet** (`h-[min(24.5rem,58svh)]`). More stats push
> that sheet into its `overflow-y-auto` safety valve, and the zero-overflow phone layout was
> verified by eye at 375×812/375×667 and can't be re-verified without a dev server. The full
> results set lives in the "by the numbers" narrative bullets instead. Values refreshed to
> `10+` / `130K` / `~$10k` — "4 client sites shipped" was stale.
> **Also updated:** `tagline`, `blurb`, `metaDescription` (149 chars), `deskLinkText`, `updated`
> → 2026-08-05, the hidden desk-nav line in `app/page.tsx` ("dev studio" → "Boulder growth
> studio"), and `agencySchema` in `content/schema.ts` (Boulder address, `areaServed` city/state/
> country, `slogan`, `numberOfEmployees`, `priceRange`, seven `serviceType` entries).
> **The Dividend Collective was in the first cut of this pass and was then pulled back out, at
> Sunny's instruction, sitewide** — the case-study block, the `0 → 9` results bullet, the blurb
> clause and the `metaDescription` clause are all gone. See the callout under *Sections* for the
> standing rule; the point of that callout is that re-reading `attagency.co/results` makes this
> an easy mistake to repeat. The `10+` and `6` counts are the agency's own published totals and
> stay as published.
> Build + lint pass; **not eyeballed** (no dev server was run, per request). Live deploy
> predates this — run `npm run deploy`.
>
> **Status (2026-08-04, latest+6): the coffee mug is a real vessel.** It was a solid
> cylinder with a dark disc laid over its top cap, which the deck's aerial camera — looking
> straight down INTO it — read as a plug with a lid rather than a cup with coffee in it. The
> body and saucer are now single **`<latheGeometry>`** revolutions: `MUG_PROFILE` runs up the
> outside wall, over the lip and back down the inside to the interior floor, so one mesh gives
> real wall thickness (0.016), a rounded rim (0.018 across the top) and an interior with visible
> depth. **The lathe's normals come from the profile tangent** — `(dy, -dx)` — so they point
> outward on the way up and inward on the way back down with no extra work; no `DoubleSide`, no
> second mesh. The saucer's well floor stops 0.002 short of the mug's underside so the two
> coincident discs cannot z-fight. The handle is a **partial torus** (`arc` 4.3rad spun back by
> half of it, so the opening faces the body and both cut ends finish ~0.02 inside the wall)
> instead of a full ring stuck to the side; the coffee sits 0.041 below the rim, glossy and
> faintly metallic so it catches the lamp as liquid. **Handle orientation is load bearing:** the
> overview camera looks along ≈(-0.33, -0.94), so the group is rotated `y 0.35` to put the
> handle broadside; turned along that axis instead it collapses into a flat strip on the cup
> (this was caught by eye — the geometry was correct either way). Reach is 0.277 against the
> saucer's 0.26, so the footprint is unchanged and it still clears the laptop base by 0.06.
> Still four draw calls, +~360 triangles on a ~37k scene. Verified by rendering the mug close
> up and at the overview stop via the rafshim procedure below. ~~`public/desk-poster.webp` now
> predates the scene by three passes — recapture it.~~ **Done 2026-08-06** (latest+9).
>
> **Status (2026-08-04, latest+5): desk props no longer clip through the mat or the
> desk.** Six placement bugs, all the same two shapes.
> **(1) `BLOTTER_TOP` (= 0.05) is now exported from `Desk.tsx`**, alongside `BLOTTER_X`
> ([-2.4, 2.0]) and `BLOTTER_Z` ([-0.6, 1.7]), and the blotter mesh is derived from them.
> "Sits on the mat" had been hardcoded per object, so it drifted: the mug's saucer, the pencil
> cup and the second loose sheet were all placed at y ≈ 0 while standing on a mat whose top is
> 0.05 — their bases were *inside* it — and the keyboard was at 0.072, hovering 0.022 above it
> (its comment claimed the mat top was ~0.007, which had been stale since the mat was
> thickened). **Anything on the mat must use `BLOTTER_TOP`; anything at y = 0 must clear
> `BLOTTER_X`/`BLOTTER_Z` in plan.** `POSITIONS[1]` in `DeskCanvas` imports the constant too.
> **(2) The floor plant was standing *through* the desk.** Its foliage spans world y
> -0.44..0.71, which straddles the desk slab's own -0.42..0 band, so x clearance is the only
> thing keeping it out; at x -5.0 three of six leaves intersected the desk top and one was
> centred at x -4.64, i.e. inside it. Now x -5.5, with leaf 1 pulled in 0.36 → 0.30. The rule:
> `max(leaf.x + leaf.r) + potX <= -4.85`, and the pot cannot go further out than -5.5 because
> its rim reaches -6.04 against the floor slab's -6.1 edge.
> Also: loose sheet 2 moved to [-2.95, 1.15] (it straddled the mat's left edge and z-fought the
> papers folder), and the bin's crumpled paper pulled in to local x 0.42 — the bin is
> near-black on a near-black floor, so at 0.55 the bright paper read as a shape floating in the
> dark rather than as litter beside a bin.
> **Verified numerically** (no dev server was run, per request): a throwaway script modelled
> every prop's world AABB and reported resting height vs the mat, plant-vs-desk intersection,
> and pairwise plan-view collisions. It reproduces all six defects on the old coordinates and
> reports none on the new ones. Build + lint pass. **Since confirmed by eye** in the mug pass
> above — the overview render shows the plant standing clear of the desk, the mug and pencil cup
> sitting on the mat, and the loose sheet on bare wood.
>
> **Status (2026-08-04, latest+4): the deck now runs on PHONES — desktop byte-for-byte
> unchanged.** Phones were gated out of the tour entirely: `DeskScene`'s fallback test was
> `!webgl || small` (`max-width: 640px`), so every phone got `FallbackHero` — a static
> screenshot of the deck plus nav pills. The landing page's whole premise was desktop-only.
> Now `fallback = !webgl`; `FallbackHero` is strictly the no-WebGL path.
> **(1) The phone layout is pure `max-sm:` utilities, NOT a JS branch.** Every phone rule is
> scoped to `width < 40rem`, so the desktop deck renders from exactly the class strings it
> always did — and there is no SSR→hydration layout snap. Consequence: `PHONE_MQ` in
> `DeskScene` is **`(max-width: 639.98px)`**, the exact complement of Tailwind's `sm`. It drives
> only the camera mode and the touch wiring, and matching on `640px` would put the phone camera
> under the desktop layout at exactly 640.
> **(2) Stacked, and the SHEET owns the height.** Desk on top, copy card as a bottom sheet
> (`h-[min(24.5rem,58svh)]`), desk takes the remainder via `flex-1`. Both consequences are load
> bearing: a short phone shrinks the desk instead of clipping the copy, and **the canvas never
> resizes mid-tour** — `AnimatePresence mode="wait"` empties the sheet for a beat between stops,
> and a content-sized sheet would collapse and re-grow, making three.js reallocate its drawing
> buffer on every step. The card is the sheet's scroll body (`overflow-y-auto`) as a safety
> valve; the panel chrome (bg/blur/ring) moves up to the wrapper so the dots and credit line
> share the sheet. Stop dots render **twice** — vertical rail (`max-sm:hidden`) and horizontal
> row inside the sheet (`hidden max-sm:block`), 44px targets; `display:none` also drops the
> unused one from the a11y tree, so there is no duplicate control set.
> **(3) Portrait camera (`CameraRig`, `compact`).** `KEYS` are framed for a ~16:10 canvas whose
> left third is covered by the copy card. Compact widens the vertical fov to hold the desktop
> HORIZONTAL field as the canvas narrows, clamps at 60° (past which it goes fish-eye) and buys
> the remainder with distance. **`COMPACT_PAN` is per-stop, not one constant** — every target
> sits a flat ~0.75 world units left of its object, but the stops view the desk from different
> azimuths and distances, so that same world offset projects to a different share of the screen
> at each one; the values are `(object − target) · right`. `COMPACT_LIFT`/`COMPACT_ZOOM` are
> per-stop too: the contact stop (the phone) needed both, or it read as a speck in bare wood.
> Pointer parallax is off when compact — the only pointer is the swiping finger.
> **(4) Touch listeners moved to the desk stage, not the section**, so the sheet's scroll is not
> preventDefault'd away; multi-touch is ignored; threshold 55→48px.
> **(5) `Hotspot` now ignores clicks that moved >10px** from their pointerdown. A click fires on
> pointerup over the object no matter how far the pointer travelled, so a swipe starting on the
> laptop navigated away mid-gesture (this also fixes desktop drag-orbit ending over an object).
> **(6) `Nav`** under 640px is a single current-page pill that opens a dropdown — the 5 pills
> need 491px inside a 343px bar, i.e. it was a silent horizontal scroller hiding two sections.
> **Verified in-pane** via the rafshim procedure below, at 375×812 and 375×667: all six stops
> captured and eyeballed, zero card overflow at both sizes, no page scroll, no horizontal
> overflow, swipe-up/down steps and a swipe on the sheet does not, tap on the laptop routes to
> `/att-agency` while a 90px drag over it does not, nav menu opens/Escape-closes. Desktop
> re-measured at 1280×720: section still `display:block`, sheet still the 430px floating panel,
> fov still 35, mobile-only nodes `display:none`. Home First Load JS 415 → **416 kB**.
> **rafshim gotcha (new):** framer-motion drives opacity via **WAAPI**, and the pane's
> `document.timeline` is frozen at 0, so `AnimatePresence` exits never complete and the copy card
> stays stuck on stop 0 forever — the camera moves but the text does not. `a.finish()` does not
> help. Add **`delete Element.prototype.animate`** to the shim to force framer onto its own
> rAF-driven path. Live deploy predates this — run `npm run deploy`.
>
> **Status (2026-08-01, latest+3): site icon is the LEGO-avatar portrait, cropped for search
> results.** `app/favicon.ico` (16/32/48), `app/icon.png` (192×192) and `app/apple-icon.png`
> (180×180) are all generated from `Gemini_Generated_Image_ngkwucngkwucngkw.png` with
> **`extract({ left: 302, top: 40, width: 1400, height: 1400 })`** — a head-and-shoulders crop,
> *not* the full circular avatar. Google renders the search-result favicon at ~16–24px, where the
> full 2076×2048 frame (white ring + a lot of tree) collapses into an unreadable smudge; the tight
> crop keeps the face legible. Head bbox in source pixels is x 478–1526, y 171–1194 if it ever
> needs re-framing.
> **Constraints baked into the sizes:** Google requires the favicon be a **multiple of 48px
> square**, so `icon.png` is 192 (4×48), not an arbitrary 512; Apple wants exactly 180.
> The `.ico` is a hand-built container (PNG-in-ICO, Vista-era) because sharp cannot write `.ico`,
> and its entries are ordered **largest-first** — Next fills the `<link sizes>` attribute from the
> *first* directory entry, so 16-first made it advertise `sizes="16x16"` for a file whose best
> payload is 48. All three are palette-quantized (sharp `png({ palette: true, quality: 90 })`):
> the source is photographic, and full-colour output made a 640 kB favicon.
> Regenerate all three together if the portrait changes. Verified on the dev server: links emit
> `48x48` / `192x192` / `180x180`, each decodes at that size, and `robots.txt` is `Allow: /` so
> Googlebot can fetch them.
>
> **Status (2026-07-30, latest+2): monitor moved off the blotter.** The Markets hotspot's
> hover ring is a flat annulus lying on the desk top (y≈0), but the monitor stood at
> `[1.55, 0, -0.8]` — inside the indigo blotter's footprint — so its base sank 0.05 into the mat
> and the mat swallowed the half of the ring that ran under it: the circle broke mid-sweep and
> the focus animation read as unanchored. Fixes: (1) the blotter is shallower —
> `position z 0.3 → 0.55`, `depth 2.85 → 2.3`, i.e. its back edge moves `-1.125 → -0.6`, leaving
> a bare-wood strip behind it (the laptop's base, min z ≈ -0.34, still sits on the mat);
> (2) `POSITIONS[2]` is `[1.55, 0, -1.6]` with `RING_RADII[2]` 1.05 → 0.9, so the whole ring lands
> on wood between z -0.7 and -2.5, inside the desk's back edge (-2.6) and clear of the gavel ring
> (z ≥ -0.6); (3) `KEYS[3]` moves with it — `target [0.85, 0.8, -1.6]`, `pos [2.9, 2.7, 1.9]`,
> keeping the old target→camera offset `[2.05, 1.9, 3.5]` so screen framing is unchanged;
> (4) belt-and-braces, `Hotspot`'s ring plane sits at **y 0.06** instead of 0.015 — above the
> blotter's 0.05 top face, so no ring can ever be buried again (the papers ring still grazes the
> mat's left corner). Build + lint pass; **not eyeballed** (no dev server was run per request),
> and `public/desk-poster.webp` now predates the scene — recapture it via the rafshim procedure
> below. Live deploy predates this — run `npm run deploy`.
>
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
> **Status (2026-07-22): Phase 3 complete — SITE IS LIVE.** *(Superseded 2026-08-06: the
> custom domain **is** wired — **https://sunnyavula.com** serves, and pushes to `main` deploy
> automatically via Workers Builds. The two "still open" items below were both closed long ago
> and the note was never updated; the original text is kept for history only.)*
> Originally at **https://sunnyavula.black-pine-e5ad.workers.dev** (deployed via
> `npm run deploy`; workers.dev URL until the custom domain is wired in the Cloudflare dashboard
> — that step is manual and still open, as is a human visual review of the desk scene, which the
> sandbox still can't render). Phase 3 shipped: (1) small-viewport (≤640px) + no-WebGL static fallback hero —
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

> **Deploying is automatic — do not tell the user to run `npm run deploy`.** Cloudflare Workers
> Builds is wired to this GitHub repo and runs `npm run build` + `npx wrangler deploy` on every
> push to `main` (that pipeline was fixed on 2026-07-23; see the status entry below). Verified
> on 2026-08-06: three commits pushed that day were serving on **https://sunnyavula.com** within
> minutes, with no manual step.
> `npm run deploy` is the out-of-band escape hatch — a local deploy without a push, or a push
> whose CI build failed. **Several status entries below end with "Live deploy predates this —
> run `npm run deploy`". For anything after 2026-07-23 that line is wrong**; it was carried
> forward from the pre-CI era and repeated without being checked. Confirm against the live URL
> instead of assuming either way.

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
- Manages clients, taxes, dev & deployment. Expected ~$10k ARR for FY27. Mission: help small
  businesses hit by the digital divide modernize their digital infrastructure.
  Site: attagency.co (a static `.html` site; `/results` resolves without the extension).
- Positioning per the live site: "a creative growth agency", **Boulder, CO**, tagline
  *"Growth, designed on purpose."* Three founders — Saras Totey, Ryder Thomas, Sunny Avula.
  Brand + website + ad creative + analytics from one team. **Packages from $99**, fixed quote
  within **one business day**, **brief to launch in six weeks** across three phases
  (Diagnose → Build → Optimize).
- **Counts are two different numbers and must not be conflated:** **6 live client websites**
  (homepage "By the numbers") vs **10+ live custom websites, apps, and interactive builds**
  (`/results` header). Plus the Thriftly paid-ad campaign (not on the agency site).
- **Results / case studies** (`attagency.co/results`), the load-bearing figures. Note that the
  agency's own results page leads with **The Dividend Collective**, which is **excluded from
  this site sitewide** — see the callout under *Sections*. Everything below is usable; that one
  is not, and is deliberately not transcribed here.
  - *soymods & Pathmind* — Minecraft Fabric mod with a no-code drag-and-drop node panel, on
    Modrinth + GitHub, plus the soymods.com hub. Featured days after launch by the mod-review
    channel **KasaiSora (130,000+ subscribers), zero ad spend**. → soymods.com
  - *Kodama* — AI historian Discord bot: semantic search over server history, receipt answers
    that link back to source messages, slash commands (`/lore search`, `/recap today`,
    `/settings personality`, `/optout`), admin/personality controls, free tier + paid Store.
    → askkodama.com
  - *BAIR* — single-page photographer portfolio; brutalist wordmark, macOS-style window frame,
    custom cursor, live timecode. Displayed as bair.my, **hosted at bair.netlify.app**.
  - *ryduzz.com* (blackletter wordmark, grid overlay, barcode footer) and *shitaltayde.art*
    (cream gallery-serif, Boulder oil painter) — **under three weeks each**, no templates.
    shitaltayde.art is **actually served from shital-tayde-art.pages.dev**.
  - *Interactive experiments* — Solaris Breach (boss-rush game), threebody.app (RK4/RKF45
    Newtonian sim, Figure-8 / Lagrange / Euler-collinear presets), solarsystem.dev (Keplerian
    J2000, 1 day/sec → 100 yr/sec). Real hosts: `solaris-breach.pages.dev`,
    `three-body-dh1.pages.dev`, `solar-system-3d-8bt.pages.dev`.
- **Vanity domains ≠ hrefs.** Four of these projects are presented under a display domain that
  does not resolve. `content/sections.ts` links the **real** host and labels the button by the
  project ("BAIR portfolio", "Shital Tayde gallery", "Try the solar system") rather than by a
  domain the link does not go to. Re-check these if the agency moves them onto their vanity
  domains.

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
