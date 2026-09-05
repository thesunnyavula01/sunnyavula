// Single source of truth for site copy. Every headline number here traces to
// CLAUDE.md → "Content facts". Components must read from this file, not hardcode.

export type Stat = { value: string; label: string };
export type OutboundLink = { label: string; href: string };

/**
 * Figures a narrative block can attach. The vocabulary lives here rather than
 * in components/viz so the dependency points the right way: content names the
 * figure it wants, and `VISUALS` in components/viz/index.tsx is typed as a
 * total map over this union, so adding a key here fails the build until the
 * component exists. Numbers behind each one are in content/figures.ts.
 */
export type VisualKey =
  | "trend-flip"
  | "distribution-shift"
  | "spec-ladder"
  | "attribution"
  | "placebo-range"
  | "fire-control"
  | "compounding"
  | "formula-stages"
  | "club-ladder";

export type NarrativeBlock = {
  kicker?: string; // small over-line: institution / role
  heading: string;
  body: string;
  bullets?: string[];
  links?: OutboundLink[]; // outbound buttons rendered under this block
  visual?: VisualKey; // figure rendered after the bullets, before the links
};

export type Section = {
  slug: string; // route under "/"
  nav: string; // nav-bar label
  title: string; // page + hero title
  deskObject: string; // the desk hotspot this section maps to (Phase 1)
  tagline: string;
  blurb: string;
  // <meta name="description"> for this page. Must be DISTINCT per page (a
  // shared description is a duplicate-content signal) and ≤ ~155 chars so it
  // isn't truncated in the SERP. Never reuse SITE.metaDescription here.
  metaDescription: string;
  // Sitemap <lastmod>, YYYY-MM-DD. Deliberately hand-maintained rather than
  // `new Date()`: a build timestamp changes on every deploy and is identical
  // across all URLs, which makes Google distrust and ignore the field. These
  // are the real dates this section's copy last changed, from:
  //   git log -1 --format=%cI -L <start>,<end>:content/sections.ts
  // Bump the one you touch when you edit a section's copy.
  updated: string;
  // Short screen-reader/crawler description of the desk object that opens this
  // section, used by the visually-hidden desk nav on the landing page.
  deskLinkText: string;
  stats: Stat[];
  narrative: NarrativeBlock[];
  links: OutboundLink[];
  honors?: string[];
};

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Sunny Avula",
  // Full/legal name variants — used in visible copy, metadata, and the Person
  // JSON-LD so searches for "Abhiram Avula" match the site, not just "Sunny".
  legalName: "Abhiram Avula",
  fullName: 'Abhiram "Sunny" Avula',
  location: "Longmont, Colorado",
  linkedin: "https://www.linkedin.com/in/abhiramavula01/",
  instagram: "https://www.instagram.com/sunny.avula01/",
  podcast: "https://open.spotify.com/show/4vbP7cvc3Qyb1N96vZN8Me",
  attAgency: "https://attagency.co",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "abhiram.avula01@gmail.com",
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/thesunnyavula01",
  // Shown on the deck's closing contact stop (the phone on the desk). `phone`
  // is the display form; `phoneHref` is the E.164 tel: target.
  discord: "avavula01",
  phone: "720-400-8337",
  phoneHref: "tel:+17204008337",
  // Homepage <title>. Subpage titles are `${nav} — ${fullName}` via the title
  // template in app/layout.tsx.
  metaTitle: 'Abhiram "Sunny" Avula, Economics Researcher',
  // Homepage <meta name="description">. Every subpage overrides this with its
  // own `metaDescription` — it must never be reused.
  metaDescription:
    'Abhiram "Sunny" Avula, economics researcher, ATT Agency co-founder, investor, and NSDA debate co-captain in Longmont, Colorado.',
  // Sitemap <lastmod> for "/" — the desk scene's last real change. See the
  // `updated` note on the Section type for why these are not build timestamps.
  updated: "2026-09-04",
  // Sitemap <lastmod> for the two PDFs under /papers.
  papersUpdated: "2026-07-22",
  // Canonical production origin — hardcoded on purpose. Metadata, sitemap,
  // robots, and canonical tags must always emit this domain, never the
  // *.workers.dev origin (duplicate content) or a stale env value.
  url: "https://sunnyavula.com",
} as const;

/**
 * Copy for the deck's opening stop — the first thing a visitor reads — and for
 * its no-WebGL twin in `FallbackHero`. Keep the two in sync by editing here.
 *
 * The landing page introduces itself as a LEGEND rather than as a name card:
 * each row names a real object in the 3D scene and the chapter it opens, so the
 * metaphor and the interaction are taught in the same breath. The name lives in
 * the accent kicker instead of the `<h1>` (the legal-name variants that carry
 * search weight are in `SITE.metaTitle`, the Person JSON-LD, and the
 * visually-hidden desk nav in app/page.tsx).
 *
 * `legend` is POSITIONAL — `legend[i]` pairs with `sections[i]`, and therefore
 * with `ACCENTS[i]` and camera stop `i + 1`. Keep it the same length and order
 * as `sections`; DeskScene indexes all three off the same `i`.
 */
export const DESK_INTRO = {
  kicker: `${SITE.name} · ${SITE.location}`,
  heading: "A desk, read as a résumé.",
  body: "Four objects. Four chapters. Everything here is something I actually built.",
  legend: [
    { object: "Papers", line: "The 1981 tax act, tested five ways" },
    { object: "Laptop", line: "A marketing team in Boulder" },
    { object: "Monitor", line: "A formula I trust with real money" },
    { object: "Gavel", line: "Every room I've argued in" },
  ],
} as const;

export const sections: Section[] = [
  {
    slug: "research",
    nav: "Research",
    title: "Research",
    deskObject: "Stack of papers / notebook",
    tagline: "Econometrics on tax policy and the political economy of peacekeeping.",
    metaDescription:
      "Econometric study of the 1981 ERTA's effect on U.S. income disparity, plus CU Boulder research on why autocracies join UN peacekeeping.",
    updated: "2026-09-04",
    deskLinkText:
      "Research, econometrics on tax policy and the political economy of peacekeeping",
    blurb:
      "As team lead at Northeastern, under Prof. Omar Robles, I directed a study of the socioeconomic legacy of the 1981 Economic Recovery Tax Act (ERTA) on U.S. income disparity, running five econometric specifications across 65 years of U.S. data and an 812-observation OECD panel, then turning the findings into a corrective policy proposal. In a separate CU Boulder internship under Prof. Megan Shannon, I examined why autocracies contribute to UN peacekeeping and found that deployments track strategic self-interest over humanitarian need.",
    stats: [
      { value: "65 yrs", label: "of U.S. tax & income data" },
      { value: "812", label: "OECD panel observations" },
      { value: "~12%", label: "of the income-gap rise tied to ERTA" },
    ],
    narrative: [
      {
        kicker: "Northeastern University · Team lead · Prof. Omar Robles",
        heading: "ERTA and the U.S. income gap",
        body:
          "As team lead, I directed a study of the socioeconomic legacy of the 1981 Economic Recovery Tax Act on U.S. income disparity, running five econometric specifications over 65 years of U.S. tax and income data and an 812-observation panel of 17 OECD economies. The question is narrower than the usual argument about Reaganomics: not whether inequality rose after 1981, which is not in dispute, but how much of the rise the rate cuts themselves can carry.",
        bullets: [
          "Data: WID.world top-1% pre-tax shares, Tax Foundation marginal rates, FRED real GDP per capita, Census Gini, Saez-Zucman wealth shares.",
          "Specifications: Welch t-tests, Chow and Quandt-Andrews structural-break tests, a six-country OECD placebo test, and a first-differences regression with Newey-West errors.",
          "Presented to Prof. Robles with strongly positive feedback; currently under faculty review.",
        ],
        links: [
          { label: "Read the paper", href: "/papers/erta-paper.pdf" },
          { label: "Methodology", href: "/papers/erta-methodology.pdf" },
        ],
      },
      {
        kicker: "Finding · Structural break",
        heading: "The trend did not steepen in 1981. It reversed.",
        body:
          "The easy version of this story is that inequality was already climbing and 1981 made it climb faster. That is not what the series does. Through the New Deal-era rate structure the top 1% share was in slow decline, about a sixth of a percentage point a year. After 1981 the same series turns and rises at roughly a fifth of a point a year. A Chow test puts the break at 1981 with F(2, 61) = 86.03. The sign of the trend, not just its slope, is what changed.",
        visual: "trend-flip",
      },
      {
        kicker: "Finding · Level and variance",
        heading: "Two different distributions, not one drifting",
        body:
          "Treating the two eras as samples rather than a single series makes the size of the move legible. The pre-ERTA mean is 11.60% across 21 years; the post-ERTA mean is 16.45% across 44. A Welch two-sample t-test returns t = −10.10. The second thing the comparison shows is less quoted and more interesting: the standard deviation more than doubles, from 1.09 to 2.77. Top incomes did not just get bigger, they got far more cyclical, which is what you would expect once they are tied to asset prices rather than wages.",
        visual: "distribution-shift",
      },
      {
        kicker: "Method · The full specification curve",
        heading: "Seven specifications, two of which found nothing",
        body:
          "One specification that agrees with you is a coincidence. The defensible version of this claim is the whole set, so the paper runs five and the methodology companion documents two more, and the two that return nulls are written up at the same length as the ones that do not. A reader who opens the PDF should find no result there that is missing from this page.",
        visual: "spec-ladder",
      },
      {
        kicker: "Finding · The placebo test",
        heading: "The result that cuts against the thesis",
        body:
          "The hardest test in the paper is the one designed to break it. Applying the same Chow test at 1981 to six OECD economies that enacted no comparable top-rate reduction between 1979 and 1983 should, if ERTA is doing the work, find nothing. It finds a significant break in all six, and the US statistic of 96.2 sits inside their range rather than beyond it. That rules out the strong claim. What survives is the more precise one: the break was global, the magnitude was American. ERTA is not the cause of a worldwide shift, it is the policy architecture through which that shift was channelled into uniquely concentrated US outcomes.",
        visual: "placebo-range",
      },
      {
        kicker: "Mechanism · Financialization",
        heading: "Where the effect was actually hiding",
        body:
          "Run the top marginal rate against the top 1% share on its own and it looks irrelevant. Add the FIRE sector's share of GDP as a control and the rate coefficient flips sign and becomes significant, while FIRE itself enters enormous. The financial sector's expansion had been absorbing the effect, and the ERTA-era deregulation that enabled that expansion, SEC Rule 10b-18 above all, which turned buybacks from a legal risk into standard practice, is the link between the tax cut and the concentration. Frydman and Saks put the same shift in compensation: real executive pay grew 0.8% a year from 1936 to 1976 and 8.0% a year from 1977 to 2005.",
        visual: "fire-control",
      },
      {
        kicker: "Estimate · First differences",
        heading: "Putting a number on it",
        body:
          "The cleanest specification is a first-differences regression with Newey-West errors, which strips the trend out and resolves the serial correlation that makes the levels regression untrustworthy, Durbin-Watson moves from 0.237 to 1.80. It returns a coefficient of −0.053: a one-point cut in the top marginal rate moves the top 1% share about five hundredths of a point in the same year. Applied to ERTA's actual 19-point cut, that is roughly 1.0pp of the 8pp rise between 1980 and 2024, or about 12%. The remaining 88% belongs to the complementary policies, which is the paper's actual claim and a smaller one than the headline usually gets.",
        visual: "attribution",
      },
      {
        kicker: "Team leadership · From findings to policy",
        heading: "Leading the team, and a pivot to policy",
        body:
          "I led the team the way Satya Nadella leads: set a clear shared vision, then give people the freedom to decide how to reach it. Balancing full course loads, we produced roughly twenty pages of research in about two months. As the evidence came in, we pivoted the argument from reforming welfare toward implementing a negative income tax, a substantive reframing that the team's creative freedom made possible.",
      },
      {
        kicker: "CU Boulder · Research intern · Prof. Megan Shannon",
        heading: "Why autocracies join UN peacekeeping",
        body:
          "Selected for a research internship under political science professor Megan Shannon, I synthesized ten years of scholarship and mission-level evidence to explain why non-democratic states contribute troops to UN peacekeeping. The puzzle is that peacekeeping is expensive, and the humanitarian return on it accrues mostly to other people, so a regime that answers to no electorate has thin reason to pay. The evidence points one way: China's and Russia's deployments track strategic self-interest, access, influence over mission mandates, and standing in the institutions that authorize them, rather than humanitarian need. It is the same instinct as the ERTA work, applied to a different subject: take the stated rationale for a policy, and check it against where the resources actually go.",
      },
    ],
    links: [],
  },
  {
    slug: "att-agency",
    nav: "ATT Agency",
    title: "ATT Agency",
    deskObject: "Laptop / monitor",
    tagline: "Full service marketing for growing businesses",
    metaDescription: "Sunny Avula co-founded ATT Agency in Boulder: advertising, social media management, website development, and SEO & AEO for growing businesses.",
    updated: "2026-09-04",
    deskLinkText: "ATT Agency, full service marketing for growing businesses",
    blurb: "I co-founded ATT Agency, a three-founder marketing team in Boulder. We handle advertising, social media management, website development, and SEO & AEO. My role covers strategy, accounts, and reporting. Ideas are easy. Execution is everything.",
    stats: [
      { value: "3", label: "founders, one working team" },
      { value: "4", label: "marketing capabilities" },
      { value: "Boulder", label: "Colorado" },
    ],
    narrative: [
      {
        heading: "One team. The full picture.",
        body: "Our work covers advertising strategy and campaigns, social content and channel management, websites built around business goals, and SEO & AEO. I handle strategy, accounts, and reporting alongside Saras Totey on web, technology, and search, and Ryder Thomas on creative, advertising, and video.",
      },
      {
        kicker: "Featured work",
        heading: "Websites and campaigns",
        body: "The work featured on our agency site includes BAIR's musician portfolio, Kodama's product launch, Shital Tayde's artist portfolio, and a paid social campaign for Thriftly.",
        links: [
          { label: "BAIR", href: "https://bair.netlify.app/" },
          { label: "Kodama", href: "https://askkodama.com/" },
          { label: "Shital Tayde", href: "https://shital-tayde-art.pages.dev/" },
          { label: "Thriftly campaign", href: "https://attagency.co/#work" },
        ],
      },
    ],
    links: [{ label: "Visit ATT Agency", href: "https://attagency.co/" }],
  },
  {
    slug: "markets",
    nav: "Markets",
    title: "Markets",
    deskObject: "Ticker / trading screen",
    tagline: "A value-investing model that beat the S&P 500.",
    metaDescription:
      "A value-investing formula at VSD Investments compounding at ~27% CAGR, $35k to $91k, top 8% on Investopedia, plus finance-club leadership.",
    updated: "2026-09-04",
    deskLinkText:
      "Markets, a value-investing model that beat the S&P 500",
    blurb:
      "At VSD Investments I built a value-investing predictive formula that screens for supply bottlenecks in emerging trends, weights entries against Federal Reserve rate cycles, and scores company fundamentals into a composite trustworthiness index. It has compounded at roughly 27% and outpaced the S&P 500, and I carry the same focus on markets into competition and financial-literacy work.",
    stats: [
      { value: "~27.0%", label: "CAGR" },
      { value: "$35k → $91k", label: "portfolio growth" },
      { value: "Top 8%", label: "Investopedia competitor" },
    ],
    narrative: [
      {
        kicker: "VSD Investments LLC",
        heading: "A formula built on supply bottlenecks",
        body:
          "The formula starts where demand outruns supply. It screens for supply bottlenecks inside emerging trends, then weights entry timing against Federal Reserve rate cycles, then scores company fundamentals into a composite trustworthiness index. Three passes, each one removing a different kind of mistake: buying the wrong thing, buying the right thing at the wrong time, and buying the right thing at the right time from the wrong company.",
        visual: "formula-stages",
      },
      {
        kicker: "Worked example",
        heading: "Nuclear power and the data-center buildout",
        body:
          "The trend everyone can see is AI. The trend is not the trade. Training and inference need electricity at a scale and a reliability that intermittent generation cannot cover, and baseload capacity takes years to permit and build, so power becomes the binding constraint on how fast compute can actually be deployed. That is what the first pass is looking for: the input that physically cannot scale as fast as the demand pulling on it. A constraint like that turns a narrative into pricing power, because the constrained supplier does not have to compete on price to capture the trend's economics.",
        bullets: [
          "The screen asks what runs out first, not what grows fastest.",
          "A bottleneck has to be physical or regulatory to hold. Anything a competitor can simply build more of is not one.",
          "The same logic reads across trends: the constraint moves, the method does not.",
        ],
      },
      {
        kicker: "Track record",
        heading: "What it compounded to",
        body:
          "The formula compounded at roughly 27.0% a year and took the portfolio from $35,000 to $91,000, ahead of the S&P 500 over the same period. Compounding is the whole argument for a repeatable method over a good call: the gap against a market-return baseline is small in year one and is most of the balance by year four.",
        bullets: [
          "Roughly 27.0% CAGR, beating the S&P 500 over the same period.",
          "Grew the portfolio from $35k to $91k.",
          "Top 8% finish as an Investopedia competitor.",
        ],
        visual: "compounding",
      },
      {
        kicker: "Peak to Peak Finance Club",
        heading: "From member to president",
        body:
          "I joined as a freshman, was elected Secretary junior year, and now lead the club as President, growing membership to 85 students. Competing in the Council for Economic Education's National Personal Finance Challenge, our team was the best in the state and advanced to the national semifinals, and I have competed at the international level in high-school economics and finance competitions.",
        visual: "club-ladder",
      },
      {
        kicker: "Financial literacy",
        heading: "Making the market legible",
        body:
          "Beyond my own portfolio, I work to close the financial-literacy gap. Through SEWA International USA my current focus is the shortage of practical money education in the United States, and my academic grounding runs through AP Microeconomics, AP Macroeconomics, and a college-level Personal Finance course I finished with an A.",
      },
      {
        kicker: "Philosophy",
        heading: "Why value investing",
        body:
          "Momentum asks what other people will do next. Value asks what a business is worth and waits for the price to agree, which means the work is research rather than prediction and the edge compounds instead of expiring. It also fails honestly: when a value thesis is wrong, the reason is usually written down in the thesis itself, so the next one can be better. That is the same reason the research work appeals to me. Both are the practice of holding a claim to evidence and being specific about the conditions under which you would abandon it.",
      },
    ],
    links: [],
  },
  {
    slug: "leadership",
    nav: "Leadership",
    title: "Leadership & Policy",
    deskObject: "Gavel + microphone",
    tagline: "Debate, civics, and youth entrepreneurship.",
    metaDescription:
      "2x NSDA National Qualifier and debate co-captain, iStartValley Sr. Director behind the 2.3k-stream iStart Insider podcast, and Boys State senator.",
    updated: "2026-09-04",
    deskLinkText:
      "Leadership & Policy, debate, civics, and youth entrepreneurship",
    blurb:
      "I am a varsity NSDA debater and school co-captain, a 2x World Schools National Qualifier with 1000+ career points. As Senior Director on the iStartValley Youth Committee I helped launch the iStart Insider podcast and pitched a $300k startup concept, and I have led on the floor and in the courts of American Legion Colorado Boys State, in Economics For Leaders, and through Sewa's Design to Lead, where research turned into real lobbying.",
    stats: [
      { value: "2×", label: "NSDA National Qualifier" },
      { value: "1000+", label: "NSDA points" },
      { value: "2.3k+", label: "iStart Insider streams" },
    ],
    narrative: [
      {
        kicker: "iStartValley · Intern → Sr. Director, Youth Committee Board",
        heading: "iStart Insider and startup strategy",
        body:
          "On the iStartValley Youth Committee Board I saw that the cohort was missing a shared why, so I opened a discussion and helped the team commit to one: equitable, easy-to-access resources for young entrepreneurs. We scrapped an inaccessible blog for the iStart Insider podcast, now past 2.3k streams and in Spotify's top 25%, with episodes featuring multiple six-figure founders. Alongside it I ran product-market-fit analysis and pitched a $300k startup concept.",
        bullets: [
          "iStartValley Innovator Award & International Semifinalist (won $300).",
          "Conrad Innovator.",
        ],
        links: [
          {
            label: "iStart Insider on Spotify",
            href: "https://open.spotify.com/show/4vbP7cvc3Qyb1N96vZN8Me",
          },
        ],
      },
      {
        kicker: "NSDA Debate · Varsity, School Co-Captain",
        heading: "Debate, and widening the door to it",
        body:
          "As varsity co-captain I have earned 1000+ NSDA points across Public Forum, Congressional, and World Schools, qualified for Nationals twice in World Schools, reached the Public Forum state final, and was named an Academic All-American. As Secretary of the Colorado Chapter of Equality in Forensics, a student-led nonprofit that makes debate more accessible, I helped grow the chapter from 5 members to more than 40.",
        links: [
          {
            label: "Join Equality in Forensics",
            href: "https://discord.com/invite/equality-in-forensics-843216532744962118",
          },
        ],
      },
      {
        kicker: "American Legion Colorado Boys State",
        heading: "Senate floor and courtroom",
        body:
          "Served as Senator and committee chair, Director of Economic Relations, and Attorney and Judge. I chaired a Senate committee, sponsored small-business bills, managed financial-literacy grants, and litigated First and Sixth Amendment cases.",
        links: [
          {
            label: "Colorado Boys State",
            href: "https://colegionboysstate.org/previous-boys-state/",
          },
        ],
      },
      {
        kicker: "Sewa Design to Lead · Economics For Leaders",
        heading: "From research to the statehouse",
        body:
          "Through Sewa's Design to Lead I took the Stanford Biodesign process from analysis to advocacy, leading a team to lobby for healthcare-workforce visa policy in Colorado, including expanding H-1B access and restoring the H-1C visa for healthcare workers and certified nursing assistants, in work with Representative Megan Lukes. Earlier service ranged from a resume-building workshop and job connections to fundraising for homeless residents. I was also selected for the Economics For Leaders cohort, where I served as a simulation executive.",
        links: [
          { label: "Design to Lead", href: "https://sewausa.org/DTL" },
        ],
      },
      {
        kicker: "Philosophy",
        heading: "How I lead",
        body:
          "I treat leadership as the pursuit of systemic, tangible impact: not just a what, but a foundational why and a strategic how. In practice that means leading from the front and only asking of others what I have done myself, leading with empathy for people's different strengths and needs, and staying accountable by owning my mistakes and treating them as room to grow. Improvement over perfection.",
      },
    ],
    links: [],
    honors: [
      "Congressional Award Silver Medalist & STEM Star",
      "Academic All-American, NSDA (fewer than 2% of 141,000+ members)",
      "President's Volunteer Service Award, Gold (100+ hours)",
      "Speech & Debate National Qualifier, World Schools (2025 and 2026)",
      "Public Forum State Finalist and 4A State Quarterfinalist",
      "iStartValley Innovator Award & International Semifinalist",
      "AP Scholar",
      "6× Dean's List",
    ],
  },
];
