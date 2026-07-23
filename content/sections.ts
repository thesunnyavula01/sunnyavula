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
  stats: Stat[];
  narrative: NarrativeBlock[];
  links: OutboundLink[];
  honors?: string[];
};

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Sunny Avula",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "abhiram.avula01@gmail.com",
  github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/divcollective01",
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
    tagline: "A dev studio modernizing Colorado small businesses.",
    blurb:
      "I co-founded ATT Agency to help Colorado small businesses hurt by the digital divide modernize their digital infrastructure. I own the business and accounting side, so when you reach out I am your first point of contact: I handle client calls, scoping, and scheduling, and I make sure every project ships on time. So far we have shipped four sites plus a paid-ad campaign for Thriftly.",
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
          "ATT Agency exists for the Colorado small businesses the digital divide left behind, the shops whose web presence does not match the quality of what they sell. We modernize their digital infrastructure end to end. As lead business executive I run the business and accounting side: client calls, scoping, scheduling, taxes, development, and deployment, and I keep every engagement on schedule.",
        bullets: [
          "First point of contact for every prospective and active client.",
          "Shipped four client sites, plus a paid-ad campaign for Thriftly.",
          "On track for roughly $10k ARR in FY27.",
        ],
      },
      {
        kicker: "Performance marketing",
        heading: "Certified for the ad side of the work",
        body:
          "The agency's growth work leans on paid media, so I earned two Google Skillshop certifications to back it: Measurement and Analytics, and AI-Powered Performance Ads. That foundation is what sits behind campaigns like the paid-ad push we ran for Thriftly.",
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
    blurb:
      "I am a varsity NSDA debater and school co-captain, a 2x World Schools National Qualifier with 960+ career points. As Senior Director on the iStartValley Youth Committee I launched the iStart Insider podcast and pitched a $300k startup concept, and I have led on the floor and in the courts of American Legion Colorado Boys State, in Economics For Leaders, and through Sewa's Design to Lead, where research turned into real lobbying.",
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
          "As varsity co-captain I have earned 960+ NSDA points across Public Forum, Congressional, and World Schools, qualified for Nationals twice in World Schools, reached the Public Forum state final, and was named an Academic All-American. As Secretary of the Colorado Chapter of Equality in Forensics, a student-led nonprofit that makes debate more accessible, I helped grow the chapter from 5 members to more than 40.",
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
      "4× Dean's List",
    ],
  },
];
