// Single source of truth for site copy. Every headline number here traces to
// CLAUDE.md → "Content facts". Components must read from this file, not hardcode.

export type Stat = { value: string; label: string };
export type OutboundLink = { label: string; href: string };

export type NarrativeBlock = {
  kicker?: string; // small over-line: institution / role
  heading: string;
  body: string;
  bullets?: string[];
  links?: OutboundLink[]; // outbound buttons rendered under this block
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
  metaTitle: 'Abhiram "Sunny" Avula — Economics Researcher',
  // Homepage <meta name="description">. Every subpage overrides this with its
  // own `metaDescription` — it must never be reused.
  metaDescription:
    'Abhiram "Sunny" Avula — economics researcher, ATT Agency co-founder, investor, and NSDA debate co-captain in Longmont, Colorado.',
  // Sitemap <lastmod> for "/" — the desk scene's last real change. See the
  // `updated` note on the Section type for why these are not build timestamps.
  updated: "2026-07-25",
  // Sitemap <lastmod> for the two PDFs under /papers.
  papersUpdated: "2026-07-22",
  // Canonical production origin — hardcoded on purpose. Metadata, sitemap,
  // robots, and canonical tags must always emit this domain, never the
  // *.workers.dev origin (duplicate content) or a stale env value.
  url: "https://sunnyavula.com",
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
    updated: "2026-07-23",
    deskLinkText:
      "Research — econometrics on tax policy and the political economy of peacekeeping",
    blurb:
      "As team lead at Northeastern, under Prof. Omar Robles, I directed a study of the socioeconomic legacy of the 1981 Economic Recovery Tax Act (ERTA) on U.S. income disparity, running five econometric specifications across 65 years of U.S. data and an 812-observation OECD panel, then turning the findings into a corrective policy proposal. In a separate CU Boulder internship under Prof. Megan Shannon, I examined why autocracies contribute to UN peacekeeping and found that deployments track strategic self-interest over humanitarian need.",
    stats: [
      { value: "65 yrs", label: "of U.S. tax & income data" },
      { value: "812", label: "OECD panel observations" },
      { value: "~12%", label: "of the income-gap rise tied to ERTA" },
    ],
    narrative: [
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
          "Selected for a research internship under political science professor Megan Shannon, I synthesized ten years of scholarship and mission-level evidence to explain why non-democratic states contribute troops to UN peacekeeping. The stories point one way: China's and Russia's deployments track strategic self-interest, not humanitarian need.",
      },
      {
        kicker: "Northeastern University · Team lead · Prof. Omar Robles",
        heading: "ERTA and the U.S. income gap",
        body:
          "As team lead, I directed a study of the socioeconomic legacy of the 1981 Economic Recovery Tax Act on U.S. income disparity, running five econometric specifications over 65 years of U.S. tax and income data and an 812-observation panel of 17 OECD economies.",
        bullets: [
          "Specifications: Welch t-tests, Chow and Quandt-Andrews structural-break tests, a six-country OECD placebo test, and a first-differences regression with Newey-West errors.",
          "The placebo test showed the 1981 structural break was global, not U.S.-specific.",
          "The first-difference estimate attributes roughly 12% of the rise in income disparity directly to ERTA's rate cuts.",
          "Presented to Prof. Robles with strongly positive feedback; currently under faculty review.",
        ],
        links: [
          { label: "Read the paper", href: "/papers/erta-paper.pdf" },
          { label: "Methodology", href: "/papers/erta-methodology.pdf" },
        ],
      },
    ],
    links: [],
  },
  {
    slug: "att-agency",
    nav: "ATT Agency",
    title: "ATT Agency",
    deskObject: "Laptop / monitor",
    tagline: "A Boulder growth studio: brand, websites, and ads that ship.",
    metaDescription:
      "ATT Agency, the Boulder studio Sunny Avula co-founded: 10+ sites, apps, and interactive builds shipped, plus a 130K-subscriber organic press feature.",
    updated: "2026-08-05",
    deskLinkText:
      "ATT Agency — a Boulder growth studio shipping brand, websites, and ads for small businesses",
    blurb:
      "I co-founded ATT Agency to help small businesses hurt by the digital divide get a web presence that matches the quality of what they sell. Three founders run the studio out of Boulder, covering brand, website, ad creative, and analytics from one team, starting at $99 with a fixed quote back inside one business day. I own the business and accounting side, so when you reach out I am your first point of contact: client calls, scoping, scheduling, and making sure every project ships on time. Ten-plus sites, apps, and interactive builds are live, among them a Discord product with semantic search over a server's entire history and a mod that picked up a 130,000-subscriber YouTube feature days after release.",
    stats: [
      { value: "10+", label: "sites, apps & builds shipped" },
      { value: "130K", label: "reached by a client launch" },
      { value: "~$10k", label: "projected ARR (FY27)" },
    ],
    narrative: [
      {
        kicker: "Co-founder & lead business executive",
        heading: "Closing the digital divide, one storefront at a time",
        body:
          "ATT Agency exists for the small businesses the digital divide left behind, the shops whose web presence does not match the quality of what they sell. Three of us run the studio out of Boulder with no hand-offs between freelancers: one quote, one timeline, one set of files at the end. As lead business executive I run the business and accounting side, from client calls, scoping, and scheduling to taxes, development, and deployment, and I keep every engagement on schedule.",
        bullets: [
          "First point of contact for every prospective and active client.",
          "A fixed quote in the client's inbox within one business day; packages start at $99.",
          "Brief to launch in six weeks, in three phases: diagnose, build, optimize.",
          "Six live client websites, plus a paid-ad campaign for Thriftly.",
          "On track for roughly $10k ARR in FY27.",
        ],
      },
      {
        kicker: "Positioning",
        heading: "Why a studio and not an AI builder",
        body:
          "Lovable, v0, and Cursor will spin up a working page in an afternoon, and if a founder already knows exactly what their site should say, that is the cheapest path. We tell prospects so. What those tools do not decide is what to build. That is what the studio sells: strategy about what the page should say and to whom, a brand and a tone the models cannot fake yet, real iteration after launch instead of an abandoned file, a human who answers when something breaks, and code the client owns and hosts wherever they like, with no monthly platform lock-in.",
      },
      {
        kicker: "Results",
        heading: "The numbers we scope new work against",
        body:
          "Most agencies show pretty screenshots. We publish the figures underneath them, and they are the same numbers we use to scope and quote new business. Every one of them comes off a project the studio built and launched.",
        bullets: [
          "130,000+ subscribers reached when Pathmind was featured on the KasaiSora YouTube channel, on zero ad spend.",
          "10+ live custom websites, apps, and interactive builds shipped.",
          "6 live client websites for founders, artists, and small businesses.",
          "2 artist portfolio sites delivered in under three weeks each, hand-coded with no templates.",
        ],
        links: [
          { label: "See the full case studies", href: "https://attagency.co/results" },
        ],
      },
      {
        kicker: "Case study · soymods & Pathmind",
        heading: "A no-code mod that found 130,000 people on its own",
        body:
          "Automating anything in Minecraft normally means writing code or running a separate bot. Pathmind is a Fabric mod that replaces that with a drag-and-drop node panel in the game: movement, interact, and item-move nodes, navigation, and crafting, chained into a routine in seconds. The studio shipped the mod on Modrinth with source on GitHub and paired it with soymods.com, a pixel-styled project hub that points players straight at downloads, source, and Discord. Days after launch the mod-review channel KasaiSora featured it to an audience of more than 130,000, entirely organically.",
        bullets: [
          "130,000+ subscriber channel reached with zero ad spend.",
          "KasaiSora called it a drag-and-drop panel with “essentially endless possibilities” and no coding knowledge required.",
          "One flagship mod on Modrinth, one custom mod hub around it.",
        ],
        links: [{ label: "Visit soymods.com", href: "https://soymods.com/" }],
      },
      {
        kicker: "Case study · Kodama",
        heading: "An AI historian for Discord",
        body:
          "Every active Discord server buries its own history, the decisions and running jokes and tournament results, under thousands of messages nobody will scroll back through. Kodama indexes all of it and answers questions with receipts: each reply links back to the original messages, so a server can check the source instead of trusting a summary. We designed the brand, built the product around Discord-native slash commands, and shipped askkodama.com as the marketing site.",
        bullets: [
          "Semantic search index over a server's full message history.",
          "Slash commands: /lore search, /recap today, /settings personality, /optout.",
          "Personality and admin controls for moderators, plus a per-user opt-out.",
          "Free to add to any server, with a paid Store for extras.",
        ],
        links: [{ label: "Visit askkodama.com", href: "https://askkodama.com" }],
      },
      {
        kicker: "Case study · BAIR, ryduzz.com, shitaltayde.art",
        heading: "Three artists, three sites, zero templates",
        body:
          "Creative professionals usually get squeezed into portfolio grids that look like every other template. BAIR is a single-scroll site for a photographer, built around a brutalist wordmark over a wide sky photo, a macOS-style window frame, a custom cursor, and a live timecode. ryduzz.com is a dark portfolio for an advertising creative, with a blackletter wordmark, a technical grid overlay, and a barcode footer strip. shitaltayde.art is a cream, gallery-serif site for a Boulder oil painter, anchored by a full-bleed wildlife painting and a quiet inquiry flow.",
        bullets: [
          "The two portfolio sites each shipped in under three weeks.",
          "A complete brand system per project: logo, typography, and palette.",
          "Hand-written and mobile-first throughout. No Squarespace, no Wix.",
        ],
        links: [
          { label: "BAIR portfolio", href: "https://bair.netlify.app/" },
          { label: "ryduzz.com", href: "https://ryduzz.com/" },
          {
            label: "Shital Tayde gallery",
            href: "https://shital-tayde-art.pages.dev/",
          },
        ],
      },
      {
        kicker: "Between client projects",
        heading: "A shelf of interactive builds",
        body:
          "Client work rewards taste and reliability. Experiments reward everything else: physics, shader math, camera work, game feel. So between projects the studio ships browser-first builds to stay sharp. Solaris Breach is a boss rush through a dying star system. threebody.app is a Newtonian gravity simulator with RK4 and RKF45 integrators and named-solution presets from the Figure-8 orbit to the Lagrange points. solarsystem.dev is a 3D Keplerian solar system on real J2000 orbital elements, with time control from one day per second up to a hundred years per second. All of it runs in the browser with nothing to install.",
        links: [
          {
            label: "Try the solar system",
            href: "https://solar-system-3d-8bt.pages.dev/",
          },
          {
            label: "Three-body simulator",
            href: "https://three-body-dh1.pages.dev/",
          },
          { label: "Solaris Breach", href: "https://solaris-breach.pages.dev/" },
        ],
      },
      {
        kicker: "Performance marketing",
        heading: "Certified for the ad side of the work",
        body:
          "The growth half of the studio is paid media: static and video creative for Meta, TikTok, YouTube, and Google, then Search Console and analytics reporting that decides where next month's spend goes. I earned two Google Skillshop certifications to back that work, in Measurement and Analytics and in AI-Powered Performance Ads. That foundation is what sits behind campaigns like the paid-ad push we ran for Thriftly.",
      },
    ],
    links: [
      { label: "Visit attagency.co", href: "https://attagency.co" },
      { label: "See the results", href: "https://attagency.co/results" },
    ],
  },
  {
    slug: "markets",
    nav: "Markets",
    title: "Markets",
    deskObject: "Ticker / trading screen",
    tagline: "A value-investing model that beat the S&P 500.",
    metaDescription:
      "A value-investing formula at VSD Investments compounding at ~27% CAGR — $35k to $91k, top 8% on Investopedia — plus finance-club leadership.",
    updated: "2026-07-23",
    deskLinkText:
      "Markets — a value-investing model that beat the S&P 500",
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
          "The formula starts where demand outruns supply. It screens for supply bottlenecks inside emerging trends, for example nuclear power constraining the AI data-center buildout, then weights entry timing against Federal Reserve rate cycles and scores company fundamentals into a composite trustworthiness index.",
        bullets: [
          "Roughly 27.0% CAGR, beating the S&P 500 over the same period.",
          "Grew the portfolio from $35k to $91k.",
          "Top 8% finish as an Investopedia competitor.",
        ],
      },
      {
        kicker: "Peak to Peak Finance Club",
        heading: "From member to president",
        body:
          "I joined as a freshman, was elected Secretary junior year, and now lead the club as President, growing membership to 85 students. Competing in the Council for Economic Education's National Personal Finance Challenge, our team was the best in the state and advanced to the national semifinals, and I have competed at the international level in high-school economics and finance competitions.",
        bullets: [
          "Member (9th, 10th), Secretary (11th), President (12th).",
          "Grew the club to 85 members.",
          "CEE National Personal Finance Challenge: Colorado State Champion and National Semifinalist.",
        ],
      },
      {
        kicker: "Financial literacy",
        heading: "Making the market legible",
        body:
          "Beyond my own portfolio, I work to close the financial-literacy gap. Through SEWA International USA my current focus is the shortage of practical money education in the United States, and my academic grounding runs through AP Microeconomics, AP Macroeconomics, and a college-level Personal Finance course I finished with an A.",
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
    updated: "2026-07-24",
    deskLinkText:
      "Leadership & Policy — debate, civics, and youth entrepreneurship",
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
