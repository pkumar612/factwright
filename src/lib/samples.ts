export interface Sample {
  id: string;
  title: string;
  blurb: string;
  name: string;
  text: string;
}

/**
 * Sample documents written for this demo. The legal sample reuses the citations
 * the High Court found to be fake in Ayinde v Haringey [2025] EWHC 1383 (Admin);
 * the surrounding wording is our own. The finance sample is invented and
 * modelled on the kinds of errors reported in published AI-assisted reports.
 */
export const SAMPLES: Sample[] = [
  {
    id: "legal",
    title: "Grounds for judicial review",
    blurb: "Built from the fake citations in Ayinde v Haringey (2025)",
    name: "Grounds for judicial review (sample).docx",
    text: `GROUNDS FOR JUDICIAL REVIEW

1. The Claimant challenges the Defendant's failure to provide interim accommodation pending review.

2. Under section 188(3) of the Housing Act 1996 the authority "must secure that accommodation is available for the applicant's occupation pending a decision on review". The duty is mandatory.

3. The Court has repeatedly held that a failure to consider interim accommodation is unlawful: see R (on the application of El Gendi) v Camden LBC [2020] EWHC 2435 (Admin); R (on the application of Ibrahim) v Waltham Forest LBC [2019] EWHC 1873 (Admin); and R (on the application of H) v Ealing LBC [2021] EWHC 939 (Admin).

4. In R (on the application of KN) v Barnet LBC [2020] EWHC 1066 (Admin) the court quashed a decision on materially identical facts. The Court of Appeal approved that approach in R (on the application of Balogun) v LB Lambeth [2020] EWCA Civ 1442.

5. Public decision-makers must not frustrate statutory functions without justification. As the Supreme Court put it, a decision "will be unlawful if the prorogation has the effect of frustrating or preventing, without reasonable justification, the ability of Parliament to carry out its constitutional functions": R (on the application of Miller) v The Prime Minister [2019] UKSC 41 at [50].

6. The Claimant also relies on Smith v Jones [1998] 2 WLR 455.`,
  },
  {
    id: "finance",
    title: "Board report on AI adoption",
    blurb: "Invented report with the errors seen in AI-drafted research",
    name: "Q3 board pack (sample).docx",
    text: `AI ADOPTION: Q3 BOARD REPORT

Executive summary
Our survey found that 312 of 480 clients (72%) now use generative AI in at least one finance process, and 120 of 480 (25%) use it in client reporting. Programme revenue rose from £2.0m in 2025 to £2.6m in 2026, an increase of 40%.

Spend
Total programme spend was £4.1m: £1.2m on licences, £1.5m on implementation and £0.9m on training.

Where the work happens
Usage is split across finance (45%), legal (35%) and operations (30%).

Market context
According to government figures, 70% of UK mid-market firms plan to adopt AI agents by 2027 (https://www.gov.uk/government/statistics/uk-ai-adoption-survey-2026-fw-demo).

Outlook
We expect programme revenue for 2026 of £2.8m, ahead of plan.`,
  },
];
