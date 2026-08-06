// Numbers behind the charts on /research and /markets.
//
// Same rule as content/sections.ts: components must not hardcode figures. Every
// value here is transcribed from a real source, cited inline — the two PDFs in
// public/papers/ for the research page, CLAUDE.md → "Content facts" for markets.
// If a figure is not in one of those, it does not belong in this file.

/* ------------------------------------------------------------------ */
/* Research — ERTA study                                              */
/* ------------------------------------------------------------------ */

/**
 * Table 1 of the paper: US top 1% pre-tax national income share, WID.world.
 * The distribution chart and the Welch annotation are both derived from these
 * five columns and nothing else.
 */
export const ERTA_DESCRIPTIVES = {
  pre: {
    label: "Pre-ERTA",
    years: "1960–1980",
    n: 21,
    mean: 11.6,
    sd: 1.09,
    min: 10.35,
    max: 13.11,
    /** Least-squares trend within the period, pp/year. */
    trend: -0.156,
    /** Midpoint year the fitted trend is anchored on. */
    midYear: 1970,
  },
  post: {
    label: "Post-ERTA",
    years: "1981–2024",
    n: 44,
    mean: 16.45,
    sd: 2.77,
    min: 10.67,
    max: 20.73,
    trend: 0.206,
    midYear: 2002.5,
  },
  /** Difference in means, percentage points. */
  meanShift: 4.85,
  breakYear: 1981,
} as const;

/**
 * The five specifications the paper runs, plus the two additional ones the
 * methodology companion documents. Both nulls are here on purpose: the page
 * shows the whole specification curve, not the significant slice of it.
 */
export type Spec = {
  id: string;
  name: string;
  question: string;
  /**
   * One-sentence plain-English answer to `question`. This leads the row — the
   * notation follows it rather than standing in for it, so a reader who has
   * never seen an F-statistic still gets the result.
   */
  answer: string;
  /** Headline statistic, rendered verbatim. */
  stat: string;
  /**
   * What `stat` means with the notation taken out, printed directly above it.
   *
   * p-values are glossed as long-run frequencies UNDER THE NULL ("if nothing
   * had really changed, a gap this large would turn up less than once in a
   * thousand tries") — never as the probability that the finding is wrong,
   * which is the usual mistranslation and is not what a p-value says.
   */
  plainStat: string;
  /** "signal" = rejects the null, "null" = cannot. Never color-only — the
   *  ladder always prints this word next to the swatch. */
  verdict: "signal" | "null";
  finding: string;
  /** The honest read. Shown expanded; several of these cut against the thesis. */
  caveat?: string;
};

export const ERTA_SPECS: Spec[] = [
  {
    id: "welch",
    name: "Welch two-sample t-test",
    question: "Did the top 1%'s share of income actually change after 1981?",
    answer:
      "Yes. The average went from 11.6% to 16.5% of all US income — a jump of 4.85 points.",
    stat: "t = −10.10, p < 0.001",
    plainStat:
      "If nothing had really changed, a gap this large would turn up less than once in a thousand tries.",
    verdict: "signal",
    finding:
      "The mean rose 4.85pp, from 11.60% to 16.45%, and the variance more than doubled (σ 1.09 → 2.77). Equality of means is rejected at the highest conventional level.",
    caveat:
      "A difference in means says the two periods differ. On its own it says nothing about what caused the difference, or when inside the window it happened.",
  },
  {
    id: "chow",
    name: "Chow structural-break test",
    question: "Is 1981 a real break, or just one long trend bending?",
    answer:
      "A real break. The line does not bend — it turns around and heads the other way.",
    stat: "F(2, 61) = 86.03, p < 0.001",
    plainStat:
      "The years before and after 1981 fit far better as two separate lines than as one. Again, less than a one-in-a-thousand fluke.",
    verdict: "signal",
    finding:
      "The break at 1981 is statistically overwhelming, and the trend does not merely steepen — it reverses. The pre-1981 slope is −0.156pp/year; the post-1981 slope is +0.206pp/year.",
    caveat:
      "A Chow test has to be told where to look. Handing it 1981 and getting a break at 1981 is weaker evidence than finding 1981 without being told — which is what the next test is for.",
  },
  {
    id: "quandt",
    name: "Quandt-Andrews supremum test",
    question: "If you don't tell the test where to look, which year does it pick?",
    answer:
      "1977 — four years before ERTA was signed. 1981 comes second.",
    stat: "max F = 107.8 at 1977 · 1981 F = 96.2",
    plainStat:
      "Every candidate year in the series was scored as a possible break point. 1977 scored highest at 107.8; 1981 scored 96.2.",
    verdict: "signal",
    finding:
      "Searching every candidate year with 15% trimming, the maximum break statistic lands on 1977 — four years before ERTA was enacted. 1981 comes second.",
    caveat:
      "This complicates a strict 'ERTA was the trigger' timeline. Trucking and airline deregulation began in 1978–79, the Volcker tightening in October 1979, and private-sector unionization was already falling. It supports the weaker, defensible claim: ERTA accelerated and locked in a shift that had started.",
  },
  {
    id: "placebo",
    name: "OECD placebo test",
    question: "Did countries that never cut their top rate break in 1981 too?",
    answer:
      "Yes — all six of them. This is the result that damages the simple story.",
    stat: "6 of 6 significant · F 5.0 → 97.1",
    plainStat:
      "Six comparison countries, six significant 1981 breaks. The US score of 96.2 lands inside their range, not beyond it.",
    verdict: "signal",
    finding:
      "The same Chow test applied to six OECD economies with no comparable 1979–83 top-rate reduction finds a significant 1981 break in every one. The US statistic of 96.2 is not distinguishable from that placebo distribution.",
    caveat:
      "This is the single most damaging result for a naive causal claim, and the paper leads with it rather than burying it. The break was global; the magnitude was American. ERTA is the policy architecture that channelled a worldwide shift into uniquely concentrated US outcomes.",
  },
  {
    id: "panel",
    name: "Two-way fixed-effects panel",
    question: "Across 17 rich economies, does cutting the top rate raise the top share?",
    answer:
      "No measurable effect. A 10-point cut moves the top share about a tenth of a point — indistinguishable from zero.",
    stat: "β = −0.0097, clustered SE 0.0286, p = 0.738",
    plainStat:
      "A result at least this large would turn up about three times in four even if rate cuts did nothing at all.",
    verdict: "null",
    finding:
      "On 812 country-year observations from 1965–2020 with country and year fixed effects, a 10pp rate cut is associated with a 0.097pp rise in the top-1% share. Neither statistically nor economically significant.",
    caveat:
      "In tension with Hope and Limberg (2022), who find an effect using propensity-score matching on a similar sample. Three likely causes: patchy pre-1982 income-share data for Germany and the UK, noisier pre-2000 marginal rates, and a pooled event set that mixes heterogeneous reforms.",
  },
  {
    id: "event",
    name: "Event study, 42 tax cuts",
    question: "Do top incomes move in the five years after a big tax cut?",
    answer:
      "No. Across 42 major tax cuts worldwide, nothing moves in any of the five years that follow.",
    stat: "all horizons k = 0…5, p > 0.30",
    plainStat:
      "Every year from the cut through five years later is indistinguishable from no change, and the estimates lean slightly negative.",
    verdict: "null",
    finding:
      "Across 42 events of 5pp or more — ERTA (−19pp), Thatcher (−15pp), Sweden (−24pp), New Zealand (−18pp) — every estimated coefficient is indistinguishable from zero. Point estimates run slightly negative: −0.04 at k=0, −0.15 at k=5.",
    caveat:
      "Pooling heterogeneous reforms dilutes the signal; the Nordic 1990–91 restructurings paired cuts with base-broadening. The confidence intervals are wide enough to contain economically meaningful effects in both directions.",
  },
  {
    id: "fd",
    name: "First differences, Newey-West",
    question: "Strip the long-run trend out. Is there still a same-year effect?",
    answer:
      "Yes. Cut the top rate by one point and the top 1%'s share rises about 0.05 points that same year.",
    stat: "β = −0.053, SE 0.025, t = −2.16, p = 0.031",
    plainStat:
      "Roughly a 3-in-100 chance of seeing this by luck alone. This is the estimate the ~12% figure is built on.",
    verdict: "signal",
    finding:
      "First-differencing removes the trend and resolves the unit-root concern flagged by a Durbin-Watson of 0.237 in levels; DW improves to 1.80. A 1pp cut in the top marginal rate is associated with a 0.053pp rise in the top-1% share the same year.",
    caveat:
      "Real GDP growth is the dominant short-run predictor in this specification (β = 15.27, p < 0.001). This is the estimate the 12% attribution is built on, and it is the cleanest result in the paper.",
  },
];

/**
 * The first-differences estimate, run forward. This is the arithmetic behind the
 * headline "~12%" and behind the attribution slider — the slider is the reader
 * doing the paper's own calculation with a different rate cut.
 */
export const ERTA_ATTRIBUTION = {
  /** pp change in top-1% share per 1pp cut in the top marginal rate. */
  beta: 0.053,
  se: 0.025,
  /** ERTA cut the top rate 70% → 50% over 1981–82. */
  ertaCut: 19,
  /** Observed rise in the top-1% share, 1980 → 2024, in pp. */
  observedRise: 8,
  sliderMax: 40,
} as const;

/**
 * Placebo Chow statistics at 1981. Only three of the six countries have a
 * published F in either document; the other three are reported as significant
 * without a value, so the chart plots the range and labels what it knows.
 */
export const ERTA_PLACEBO = {
  countries: [
    { name: "New Zealand", f: 97.1 },
    { name: "Canada", f: 5.0 },
    { name: "Sweden", f: null },
    { name: "Finland", f: null },
    { name: "Switzerland", f: null },
    { name: "Australia", f: null },
  ] as { name: string; f: number | null }[],
  us: 96.2,
  range: [5.0, 97.1] as [number, number],
} as const;

/** The financialization control, from the paper's single-country regression. */
export const ERTA_FIRE = {
  rateBefore: { beta: 0.013, p: "0.778", label: "not significant" },
  rateAfter: { beta: -0.056, p: "0.015", label: "significant" },
  fire: { beta: 2.97, se: 0.28, p: "< 0.001" },
} as const;

/* ------------------------------------------------------------------ */
/* Markets — VSD Investments                                          */
/* ------------------------------------------------------------------ */

/**
 * The compounding chart. Deliberately UNDATED and deliberately not a trade
 * record: only the two endpoints and the CAGR are real, so the curve is the
 * compounding path those endpoints imply, and the caption says exactly that.
 * Never add fabricated intermediate marks or drawdowns here.
 */
export const VSD_COMPOUNDING = {
  start: 35000,
  end: 91000,
  cagr: 0.27,
  /** 35 × 1.27^4 ≈ 91.1 — the endpoints imply about four years. */
  years: 4,
  /** Long-run nominal S&P total return, the reference line. */
  baselineCagr: 0.1,
  baselineLabel: "10% / yr reference",
} as const;

export const VSD_STAGES = [
  {
    id: "bottleneck",
    label: "Screen",
    title: "Find the bottleneck, not the trend",
    body:
      "Everyone can see the trend. The formula looks one layer beneath it, for the input that physically cannot scale as fast as the demand pulling on it — the constraint that turns a story into pricing power.",
    example:
      "AI data centers need baseload power faster than baseload power can be built. The trend is AI; the bottleneck is generation.",
  },
  {
    id: "cycle",
    label: "Time",
    title: "Weight the entry against the rate cycle",
    body:
      "A good business bought at the wrong point in the cycle is still a bad entry. Position sizing is weighted against where the Federal Reserve is in its tightening or easing path, because that is what sets the discount rate every valuation runs through.",
    example:
      "The same bottleneck is worth paying up for late in a cutting cycle and worth waiting on in the middle of a hiking one.",
  },
  {
    id: "score",
    label: "Score",
    title: "Reduce the fundamentals to one number",
    body:
      "Company fundamentals are scored into a single composite trustworthiness index, so candidates that survive the first two filters can be ranked against each other rather than argued about one at a time.",
    example:
      "The screen tells you where to look and the cycle tells you when. The index decides which name in that pocket actually earns the capital.",
  },
] as const;

export const PEAK_TO_PEAK = [
  { grade: "9th", role: "Member" },
  { grade: "10th", role: "Member" },
  { grade: "11th", role: "Secretary" },
  { grade: "12th", role: "President" },
] as const;
