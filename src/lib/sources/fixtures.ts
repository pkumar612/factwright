import type { FetchResult } from "./http";

/**
 * Snapshots of source responses used by the built-in samples, checked by hand
 * against the live sites on 7 October 2026. They keep the demo working if a
 * source site is slow; any URL not listed here is fetched live.
 */
const CASELAW = "https://caselaw.nationalarchives.gov.uk";
const LEG = "https://www.legislation.gov.uk";

const notFound: FetchResult = { status: 404, body: "" };

const judgmentXml = (title: string, text: string) =>
  `<akomaNtoso><judgment><meta><identification><FRBRWork><FRBRname value="${title}"/></FRBRWork></identification></meta><header><p>${title}</p></header><judgmentBody><p>${text}</p></judgmentBody></judgment></akomaNtoso>`;

export const FIXTURES: Record<string, FetchResult> = {
  // Ayinde v Haringey [2025] EWHC 1383 (Admin): four citations that don't exist...
  [`${CASELAW}/ewhc/admin/2019/1873/data.xml`]: notFound,
  [`${CASELAW}/ewhc/admin/2021/939/data.xml`]: notFound,
  [`${CASELAW}/ewhc/admin/2020/1066/data.xml`]: notFound,
  [`${CASELAW}/ewca/civ/2020/1442/data.xml`]: notFound,
  // ...and one that belongs to an unrelated case.
  [`${CASELAW}/ewhc/admin/2020/2435/data.xml`]: {
    status: 200,
    body: judgmentXml(
      "Preservation and Promotion of the Arts Ltd, R (On the Application Of) v Manchester Magistrates&#39; Court",
      "Judgment of the Administrative Court, Birmingham District Registry.",
    ),
  },
  // A real authority, quoted correctly in the sample.
  [`${CASELAW}/uksc/2019/41/data.xml`]: {
    status: 200,
    body: judgmentXml(
      "R (on the application of Miller) v The Prime Minister",
      "50. For the purposes of the present case, therefore, the relevant limit upon the power to prorogue can be expressed in this way: that a decision to prorogue Parliament (or to advise the monarch to prorogue Parliament) will be unlawful if the prorogation has the effect of frustrating or preventing, without reasonable justification, the ability of Parliament to carry out its constitutional functions as a legislature and as the body responsible for the supervision of the executive.",
    ),
  },
  [`${LEG}/ukpga/1996/data.feed?title=Housing%20Act`]: {
    status: 200,
    body: `<feed><entry><id>http://www.legislation.gov.uk/id/ukpga/1996/53</id><title>Housing Grants, Construction and Regeneration Act 1996</title></entry><entry><id>http://www.legislation.gov.uk/id/ukpga/1996/52</id><title>Housing Act 1996</title></entry></feed>`,
  },
  [`${LEG}/ukpga/1996/52/section/188/data.xml`]: {
    status: 200,
    body: `<Legislation><Primary><Body><P1group><Title>Interim duty to accommodate in case of apparent priority need</Title><P1><Pnumber>188</Pnumber><P1para><P2><Pnumber>3</Pnumber><P2para><Text>Otherwise, the duty under this section comes to an end in accordance with subsections (1ZA) to (1A), regardless of any review requested by the applicant under section 202. But the authority may secure that accommodation is available for the applicant&#39;s occupation pending a decision on review.</Text></P2para></P2></P1para></P1></P1group></Body></Primary></Legislation>`,
  },
  // Made-up link used in the finance sample.
  ["https://www.gov.uk/government/statistics/uk-ai-adoption-survey-2026-fw-demo"]: notFound,
};
