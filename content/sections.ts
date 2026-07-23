// Single source of truth for site copy. Every headline number here traces to
// CLAUDE.md → "Content facts". Components must read from this file, not hardcode.

export type Stat = { value: string; label: string };
export type OutboundLink = { label: string; href: string };

export type NarrativeBlock = {
  kicker?: string; // small over-line: institution / role
  heading: string;
  body: string;
  bullets?: string[];
};

export type Section = {
  slug: string; // route under "/"
  nav: string; // nav-bar label
  title: string; // page + hero title
  deskObject: string; // the desk hotspot this section maps to (Phase 1)
  tagline: string;
  blurb: string;
  stats: Stat[];
  narrative: NarrativeBlock[];
  links: OutboundLink[];
  honors?: string[];
};

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Sunny Avula",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "abhiram.avula01@gmail.com",
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/divcollective01",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const sections: Section[] = [
  {
    slug: "research",
    nav: "Research",
    title: "Research",
    deskObject: "Stack of papers / notebook",
    tagline: "Econometrics on tax policy and the political economy of peacekeeping.",
    blurb:
      "I led a Northeastern study of the socioeconomic legacy of the 1981 Economic Recovery Tax Act (ERTA) on U.S. income disparity, under Prof. Omar Robles — applying five econometric specifications across 65 years of U.S. data and an 812-observation OECD panel. In a separate CU Boulder study under Prof. Shannon, I analyzed why autocracies contribute to UN peacekeeping, finding that deployments track strategic self-interest over humanitarian need.",
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
          "As team lead, I directed a study of the socioeconomic legacy of the 1981 Economic Recovery Tax Act on U.S. income disparity, running five econometric specifications over 65 years of U.S. tax and income data and an 812-observation panel of 17 OECD economies.",
        bullets: [
          "Specifications: Welch t-tests, Chow and Quandt-Andrews structural-break tests, a six-country OECD placebo test, and a first-differences regression with Newey-West errors.",
          "The placebo test showed the 1981 structural break was global, not U.S.-specific.",
          "The first-difference estimate attributes ~12% of the rise in income disparity directly to ERTA's rate cuts.",
          "Presented to Prof. Robles; currently under faculty review.",
        ],
      },
      {
        kicker: "CU Boulder · Research intern · Prof. Shannon",
        heading: "Why autocracies join UN peacekeeping",
        body:
          "I studied the economic incentives behind autocracies' contributions to UN peacekeeping, synthesizing ten years of scholarship with mission-level evidence. The pattern is consistent: China's and Russia's deployments track strategic self-interest, not humanitarian need.",
      },
    ],
    links: [
      { label: "Read the paper", href: "/papers/erta-paper.pdf" },
      { label: "Methodology", href: "/papers/erta-methodology.pdf" },
    ],
  },
  {
    slug: "att-agency",
    nav: "ATT Agency",
    title: "ATT Agency",
    deskObject: "Laptop / monitor",
    tagline: "A dev studio modernizing Colorado small businesses.",
    blurb:
      "I co-founded ATT Agency to help Colorado small businesses hurt by the digital divide modernize their digital infrastructure. As lead business executive I run clients, taxes, development, and deployment — we've shipped four sites plus a Thriftly paid-ad campaign.",
    stats: [
      { value: "4", label: "client sites shipped" },
      { value: "~$10k", label: "projected ARR (FY27)" },
      { value: "Co-founder", label: "clients · dev · deploy" },
    ],
    narrative: [
      {
        kicker: "Co-founder & lead business executive",
        heading: "Closing the digital divide, one storefront at a time",
        body:
          "ATT Agency exists for the Colorado small businesses the digital divide left behind — the shops whose web presence doesn't match the quality of what they sell. We modernize their digital infrastructure end to end, and as lead business executive I manage clients, taxes, development, and deployment.",
        bullets: [
          "Shipped four client sites, plus a paid-ad campaign for Thriftly.",
          "On track for roughly $10k ARR in FY27.",
        ],
      },
    ],
    links: [{ label: "Visit attagency.co", href: "https://attagency.co" }],
  },
  {
    slug: "markets",
    nav: "Markets",
    title: "Markets",
    deskObject: "Ticker / trading screen",
    tagline: "A value-investing model that beat the S&P 500.",
    blurb:
      "At VSD Investments I built a value-investing predictive formula that screens for supply bottlenecks in emerging trends, weights entries against Federal Reserve rate cycles, and scores company fundamentals into a composite trustworthiness index — compounding at roughly 27% and outpacing the S&P 500.",
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
          "The formula starts where demand outruns supply: it screens for supply bottlenecks inside emerging trends — nuclear power constraining the AI data-center buildout, for example — then weights entry timing against Federal Reserve rate cycles and scores company fundamentals into a composite trustworthiness index.",
        bullets: [
          "~27.0% CAGR, beating the S&P 500 over the same period.",
          "Grew the portfolio from $35k to $91k.",
          "Top 8% finish as an Investopedia competitor.",
        ],
      },
      {
        kicker: "Peak to Peak Finance Club",
        heading: "Member to president",
        body:
          "I joined the club as a freshman, served as Secretary junior year, and now lead it as President — growing membership to 85 students. Competing in the CEE National Personal Finance Challenge, our team won the state championship and reached the national semifinals.",
        bullets: [
          "Member (9th, 10th) → Secretary (11th) → President (12th).",
          "Grew the club to 85 members.",
          "CEE National Personal Finance Challenge: State Champion & National Semifinalist.",
        ],
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
    blurb:
      "I'm a varsity NSDA debater and school co-captain — a 2× World Schools National Qualifier with 960+ points. As Senior Director on the iStartValley Youth Committee I launched the iStart Insider podcast and pitched a $300k startup concept, and I've served across the American Legion Colorado Boys State senate and courts, Economics For Leaders, and Sewa's Design to Lead.",
    stats: [
      { value: "2×", label: "NSDA National Qualifier" },
      { value: "960+", label: "NSDA points" },
      { value: "2.3k+", label: "iStart Insider streams" },
    ],
    narrative: [
      {
        kicker: "iStartValley · Intern → Sr. Director, Youth Committee Board",
        heading: "iStart Insider and startup strategy",
        body:
          "On the iStartValley Youth Committee Board I launched the iStart Insider podcast — now past 2.3k streams and in Spotify's top 25% — ran product-market-fit analysis, and pitched a $300k startup concept.",
        bullets: [
          "iStartValley Innovator Award & International Semifinalist (won $300).",
          "Conrad Innovator.",
        ],
      },
      {
        kicker: "NSDA Debate · Varsity, School Co-Captain",
        heading: "Debate",
        body:
          "As varsity co-captain I've earned 960+ NSDA points, qualified for Nationals twice in World Schools, reached the Public Forum state final, and was named an Academic All-American.",
      },
      {
        kicker: "American Legion Colorado Boys State",
        heading: "Senate floor and courtroom",
        body:
          "Serving as Senator and committee chair, Director of Economic Relations, and Attorney/Judge, I chaired a Senate committee, sponsored small-business bills, managed financial-literacy grants, and litigated First and Sixth Amendment cases.",
      },
      {
        kicker: "Economics For Leaders · Sewa Design to Lead",
        heading: "Policy programs",
        body:
          "I was selected for the Economics For Leaders cohort, serving as a simulation executive, and through Sewa's Design to Lead applied the Stanford Biodesign process to lobbying for Colorado healthcare visa policy.",
      },
    ],
    links: [
      {
        label: "iStart Insider on Spotify",
        href: "https://open.spotify.com/show/4vbP7cvc3Qyb1N96vZN8Me",
      },
    ],
    honors: [
      "Congressional Award Silver Medalist & STEM Star",
      "President's Volunteer Service Award — Gold",
      "AP Scholar · Dean's List",
      "iStartValley Innovator Award & International Semifinalist",
    ],
  },
];
