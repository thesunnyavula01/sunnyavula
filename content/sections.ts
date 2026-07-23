// Single source of truth for site copy. Every headline number here traces to
// CLAUDE.md → "Content facts". Components must read from this file, not hardcode.

export type Stat = { value: string; label: string };
export type OutboundLink = { label: string; href: string };

export type Section = {
  slug: string; // route under "/"
  nav: string; // nav-bar label
  title: string; // page + hero title
  deskObject: string; // the desk hotspot this section maps to (Phase 1)
  tagline: string;
  blurb: string;
  stats: Stat[];
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
