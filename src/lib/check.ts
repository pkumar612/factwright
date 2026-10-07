import { extractCases, extractLegislation, extractQuotes, type CaseRef, type LegislationRef, type ReportRef } from "./extract";
import { checkFigures } from "./figures";
import { checkLink, extractLinks } from "./links";
import { CASELAW_BASE, lookupJudgment, nameMatchScore, neutralCitationPath } from "./sources/caselaw";
import { lookupAct, lookupSection } from "./sources/legislation";
import { matchQuote } from "./text";
import type { Finding, Report, Status } from "./types";

type Draft = Omit<Finding, "id">;

/** What a quote can be checked against: the text of the source it cites. */
interface QuoteTarget {
  start: number;
  end: number;
  label: string;
  url?: string;
  text?: string;
  /** Why there is no text to check against, when there isn't. */
  missing?: "not_found" | "unreachable";
}

export async function checkDocument(text: string, documentName: string): Promise<Report> {
  const caseRefs = extractCases(text);
  const legRefs = extractLegislation(text);

  const [caseResults, legResults, linkResults] = await Promise.all([
    Promise.all(caseRefs.map(checkCase)),
    Promise.all(legRefs.map(checkLegislation)),
    Promise.all(extractLinks(text).map(checkLink)),
  ]);

  const targets = [...caseResults, ...legResults].map((r) => r.target).filter((t): t is QuoteTarget => !!t);
  const drafts: Draft[] = [
    ...caseResults.map((r) => r.finding),
    ...legResults.map((r) => r.finding),
    ...extractQuotes(text).flatMap((q) => checkQuote(q, targets)),
    ...checkFigures(text),
    ...linkResults,
  ].sort((a, b) => a.start - b.start);

  const findings = drafts.map((d, i) => ({ ...d, id: `f${i + 1}` }));
  const counts: Record<Status, number> = { verified: 0, warning: 0, error: 0, unverifiable: 0 };
  for (const f of findings) counts[f.status]++;

  return {
    documentName,
    checkedAt: new Date().toISOString(),
    wordCount: text.split(/\s+/).filter(Boolean).length,
    text,
    findings,
    counts,
  };
}

async function checkCase(ref: CaseRef | ReportRef): Promise<{ finding: Draft; target?: QuoteTarget }> {
  const shown = ref.name ? `${ref.name} ${ref.citation}` : ref.citation;
  const base = { kind: "case" as const, text: shown, start: ref.start, end: ref.end };

  if (ref.kind === "report") {
    return {
      finding: {
        ...base,
        status: "unverifiable",
        verdict: "Law report citation, check by hand",
        detail: "This cites a law report series. Those sit behind Westlaw or Lexis, so this preview can't check it automatically.",
      },
      target: { start: ref.start, end: ref.end, label: ref.citation, missing: "unreachable" },
    };
  }

  const path = neutralCitationPath(ref.year, ref.court, ref.number, ref.division);
  if (!path) {
    return {
      finding: { ...base, status: "unverifiable", verdict: "Court not covered yet", detail: "The National Archives' Find Case Law doesn't publish this court's judgments under this citation format." },
    };
  }

  const url = `${CASELAW_BASE}/${path}`;
  const result = await lookupJudgment(path);
  if (!result.found && result.reason === "unreachable") {
    return {
      finding: { ...base, status: "unverifiable", verdict: "Couldn't reach the National Archives", detail: "Find Case Law didn't respond. Try again shortly.", source: { label: "Find Case Law", url } },
      target: { start: ref.start, end: ref.end, label: ref.citation, missing: "unreachable" },
    };
  }
  if (!result.found) {
    const recent = Number(ref.year) >= 2008;
    return {
      finding: {
        ...base,
        status: recent ? "error" : "warning",
        verdict: "No judgment exists at this citation",
        detail: recent
          ? `The National Archives has no judgment published at ${ref.citation}. This is a strong sign the case is made up or the citation is wrong.`
          : `The National Archives has no judgment at ${ref.citation}. Its coverage of older cases is incomplete, so check this one by hand.`,
        source: { label: "Searched Find Case Law", url: `${CASELAW_BASE}/search?query=${encodeURIComponent(ref.citation)}` },
      },
      target: { start: ref.start, end: ref.end, label: ref.citation, missing: "not_found" },
    };
  }

  const { judgment } = result;
  const target: QuoteTarget = { start: ref.start, end: ref.end, label: judgment.title, url, text: judgment.text };
  const source = { label: "Read the judgment", url };
  if (!ref.name) {
    return {
      finding: { ...base, status: "verified", verdict: "Judgment exists", detail: `${ref.citation} is ${judgment.title}.`, source, evidence: judgment.title },
      target,
    };
  }
  const score = nameMatchScore(ref.name, judgment.title);
  if (score >= 0.5) {
    return {
      finding: { ...base, status: "verified", verdict: "Citation matches the case", detail: `${ref.citation} is ${judgment.title}, the case named.`, source, evidence: judgment.title },
      target,
    };
  }
  return {
    finding: {
      ...base,
      status: score === 0 ? "error" : "warning",
      verdict: score === 0 ? "Citation belongs to a different case" : "Case name only partly matches",
      detail: `${ref.citation} is ${judgment.title}, not ${ref.name}.`,
      source,
      evidence: judgment.title,
    },
    // A quote attributed to the named case can't be checked against a different case.
    target: score === 0 ? { start: ref.start, end: ref.end, label: ref.citation, missing: "not_found" } : target,
  };
}

async function checkLegislation(ref: LegislationRef): Promise<{ finding: Draft; target?: QuoteTarget }> {
  const base = { kind: "legislation" as const, text: ref.text, start: ref.start, end: ref.end };
  const act = await lookupAct(ref.act, ref.year);
  if (!act.found) {
    const unreachable = act.reason === "unreachable";
    return {
      finding: {
        ...base,
        status: unreachable ? "unverifiable" : "warning",
        verdict: unreachable ? "Couldn't reach legislation.gov.uk" : "Couldn't find this Act",
        detail: unreachable
          ? "legislation.gov.uk didn't respond. Try again shortly."
          : `No UK Public General Act called "${ref.act} ${ref.year}" was found. Check the title and year (this preview only covers UK Public General Acts).`,
      },
      target: { start: ref.start, end: ref.end, label: ref.text, missing: unreachable ? "unreachable" : "not_found" },
    };
  }

  const section = await lookupSection(act.path, ref.section);
  if (!section.found) {
    const unreachable = section.reason === "unreachable";
    return {
      finding: {
        ...base,
        status: unreachable ? "unverifiable" : "error",
        verdict: unreachable ? "Couldn't reach legislation.gov.uk" : "Section doesn't exist",
        detail: unreachable ? "legislation.gov.uk didn't respond. Try again shortly." : `${act.title} has no section ${ref.section}.`,
        source: { label: act.title, url: section.url.replace(/\/section\/.*/, "/contents") },
      },
      target: { start: ref.start, end: ref.end, label: ref.text, missing: unreachable ? "unreachable" : "not_found" },
    };
  }

  const source = { label: `${act.title}, s.${ref.section}`, url: section.url };
  const target: QuoteTarget = { start: ref.start, end: ref.end, label: `${act.title}, s.${ref.section}`, url: section.url, text: section.text };
  const missingSub = ref.subsections.slice(0, 1).filter((s) => section.subsections.length > 0 && !section.subsections.includes(s));
  if (missingSub.length) {
    return {
      finding: { ...base, status: "error", verdict: "Subsection doesn't exist", detail: `Section ${ref.section} of ${act.title} has no subsection (${missingSub[0]}).`, source, evidence: section.heading },
      target,
    };
  }
  return {
    finding: {
      ...base,
      status: "verified",
      verdict: "Section exists",
      detail: `Section ${ref.section}${ref.subsections.length ? `(${ref.subsections.join(")(")})` : ""} of ${act.title} exists${section.heading ? `: "${section.heading}"` : ""}.`,
      source,
      evidence: section.heading || undefined,
    },
    target,
  };
}

/** Check a quotation against the source cited nearest to it. */
function checkQuote(q: { text: string; start: number; end: number }, targets: QuoteTarget[]): Draft[] {
  const nearest = targets
    .map((t) => ({
      t,
      gap: t.end <= q.start ? q.start - t.end : t.start >= q.end ? (t.start - q.end) * 2 : 0,
    }))
    .filter((x) => x.gap <= 400)
    .sort((a, b) => a.gap - b.gap)[0]?.t;
  if (!nearest) return [];

  const base = { kind: "quote" as const, text: `“${q.text}”`, start: q.start, end: q.end };
  if (!nearest.text) {
    return [
      nearest.missing === "unreachable"
        ? { ...base, status: "unverifiable", verdict: "Quote can't be checked", detail: `The source it's attributed to (${nearest.label}) couldn't be read.` }
        : { ...base, status: "error", verdict: "Quoted source doesn't exist", detail: `This quote is attributed to ${nearest.label}, which couldn't be found, so the quote can't be genuine as cited.` },
    ];
  }

  const match = matchQuote(q.text, nearest.text);
  const source = nearest.url ? { label: nearest.label, url: nearest.url } : undefined;
  if (match.score === 1) {
    return [{ ...base, status: "verified", verdict: "Quote matches the source word for word", detail: `Found verbatim in ${nearest.label}.`, source }];
  }
  if (match.score >= 0.6) {
    const diffs = match.differences
      .slice(0, 3)
      .map((d) => `the source says "${d.source}" where the document says "${d.quoted}"`)
      .join("; ");
    return [{ ...base, status: "error", verdict: "Misquoted: wording differs from the source", detail: `Closest passage in ${nearest.label}: ${diffs}.`, source, evidence: match.passage }];
  }
  return [{ ...base, status: "error", verdict: "Quote not found in the source", detail: `These words don't appear in ${nearest.label}.`, source }];
}
