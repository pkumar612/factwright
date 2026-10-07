import { describe, expect, it } from "vitest";
import { checkDocument } from "../check";
import { caseNameBefore, extractCases, extractLegislation } from "../extract";
import { SAMPLES } from "../samples";
import { matchQuote } from "../text";

const legal = SAMPLES.find((s) => s.id === "legal")!;
const finance = SAMPLES.find((s) => s.id === "finance")!;

describe("extraction", () => {
  it("reads case names before neutral citations", () => {
    const text = "see R (on the application of El Gendi) v Camden LBC [2020] EWHC 2435 (Admin);";
    const start = text.indexOf("[2020]");
    expect(caseNameBefore(text, start)).toBe("R (on the application of El Gendi) v Camden LBC");
  });

  it("finds every citation in the legal sample", () => {
    const cases = extractCases(legal.text);
    expect(cases.map((c) => c.citation)).toEqual([
      "[2020] EWHC 2435 (Admin)",
      "[2019] EWHC 1873 (Admin)",
      "[2021] EWHC 939 (Admin)",
      "[2020] EWHC 1066 (Admin)",
      "[2020] EWCA Civ 1442",
      "[2019] UKSC 41",
      "[1998] 2 WLR 455",
    ]);
  });

  it("parses section references", () => {
    const [ref] = extractLegislation(legal.text);
    expect(ref).toMatchObject({ section: "188", subsections: ["3"], act: "Housing Act", year: "1996" });
  });
});

describe("quote matching", () => {
  it("spots a single changed word", () => {
    const m = matchQuote("the authority must secure that accommodation is available", "But the authority may secure that accommodation is available for the applicant");
    expect(m.score).toBeGreaterThan(0.8);
    expect(m.differences).toEqual([{ quoted: "must", source: "may" }]);
  });
});

describe("legal sample", () => {
  it("flags the Ayinde citations and passes the real ones", async () => {
    const report = await checkDocument(legal.text, legal.name);
    const byText = (s: string) => report.findings.find((f) => f.text.includes(s))!;

    expect(byText("El Gendi")).toMatchObject({ status: "error", verdict: "Citation belongs to a different case" });
    for (const fake of ["Ibrahim", "Ealing", "Barnet", "Balogun"]) {
      expect(byText(fake)).toMatchObject({ status: "error", verdict: "No judgment exists at this citation" });
    }
    expect(byText("Miller")).toMatchObject({ status: "verified" });
    expect(byText("section 188(3)")).toMatchObject({ status: "verified", verdict: "Section exists" });
    expect(byText("must secure")).toMatchObject({ status: "error", verdict: "Misquoted: wording differs from the source" });
    expect(byText("will be unlawful")).toMatchObject({ status: "verified" });
    expect(byText("WLR")).toMatchObject({ status: "unverifiable" });
  });
});

describe("finance sample", () => {
  it("catches each planted error", async () => {
    const report = await checkDocument(finance.text, finance.name);
    const verdicts = report.findings.map((f) => `${f.status}: ${f.verdict}`);
    expect(verdicts).toEqual([
      "error: Percentage doesn't match its numbers",
      "verified: Percentage adds up",
      "error: Change is calculated wrongly",
      "error: Parts don't add up to the total",
      "error: Breakdown doesn't sum to 100%",
      "error: Link is broken",
      "error: Same figure stated two different ways",
    ]);
  });
});
