export interface CaseRef {
  kind: "case";
  citation: string;
  name: string | null;
  year: string;
  court: string;
  number: string;
  division?: string;
  start: number;
  end: number;
}

export interface ReportRef {
  kind: "report";
  citation: string;
  name: string | null;
  start: number;
  end: number;
}

export interface LegislationRef {
  kind: "legislation";
  text: string;
  section: string;
  subsections: string[];
  act: string;
  year: string;
  start: number;
  end: number;
}

export interface QuoteRef {
  text: string;
  start: number;
  end: number;
}

export type LegalRef = CaseRef | ReportRef | LegislationRef;

const NEUTRAL =
  /\[(\d{4})\]\s+(UKSC|UKPC|UKHL|EWCA\s+Civ|EWCA\s+Crim|EWHC|EWFC|EWCOP|UKUT|UKFTT|EAT)\s+(\d+)(?:\s*\(([A-Za-z]+)\))?/g;

const LAW_REPORT =
  /[[(](\d{4})[\])]\s+(?:\d+\s+)?(AC|QB|KB|Ch|Fam|WLR|All\s+ER|Cr\s+App\s+R|Lloyd's\s+Rep|BCLC|EWLR|HLR|P\s*&\s*CR|ICR|IRLR)\s+(\d+)/g;

const LEGISLATION =
  /\b(?:section|sections|s\.|ss\.)\s*(\d+[A-Z]{0,2})((?:\(\w{1,4}\))*)\s+(?:of\s+)?(?:the\s+)?((?:[A-Z][A-Za-z'’]*|and|of|the|for)(?:\s+(?:[A-Z][A-Za-z'’]*|and|of|the|for))*?\s+Act)\s+(\d{4})/g;

const QUOTE = /[“"]([^“”"]{25,600})[”"]/g;

export function extractCases(text: string): (CaseRef | ReportRef)[] {
  const refs: (CaseRef | ReportRef)[] = [];
  for (const m of text.matchAll(NEUTRAL)) {
    const start = m.index!;
    refs.push({
      kind: "case",
      citation: m[0],
      name: caseNameBefore(text, start),
      year: m[1],
      court: m[2].replace(/\s+/g, " "),
      number: m[3],
      division: m[4],
      start,
      end: start + m[0].length,
    });
  }
  for (const m of text.matchAll(LAW_REPORT)) {
    const start = m.index!;
    if (refs.some((r) => start >= r.start && start < r.end)) continue;
    refs.push({
      kind: "report",
      citation: m[0],
      name: caseNameBefore(text, start),
      start,
      end: start + m[0].length,
    });
  }
  return refs.sort((a, b) => a.start - b.start);
}

export function extractLegislation(text: string): LegislationRef[] {
  return [...text.matchAll(LEGISLATION)].map((m) => ({
    kind: "legislation" as const,
    text: m[0],
    section: m[1],
    subsections: [...m[2].matchAll(/\((\w+)\)/g)].map((s) => s[1].toLowerCase()),
    act: m[3].replace(/\s+/g, " "),
    year: m[4],
    start: m.index!,
    end: m.index! + m[0].length,
  }));
}

export function extractQuotes(text: string): QuoteRef[] {
  return [...text.matchAll(QUOTE)]
    .filter((m) => m[1].trim().split(/\s+/).length >= 5)
    .map((m) => ({ text: m[1].trim(), start: m.index!, end: m.index! + m[0].length }));
}

const NAME_STOP = new Set(["In", "See", "Cf", "Also", "Following", "Applying", "Per", "And", "Both", "As"]);
const CONNECTORS = new Set(["of", "the", "on", "and", "for", "&", "de", "da", "von", "van", "ex", "parte"]);

/**
 * Read the case name that ends just before a citation, e.g.
 * "... see R (on the application of El Gendi) v Camden LBC [2020] ..."
 * -> "R (on the application of El Gendi) v Camden LBC".
 */
export function caseNameBefore(text: string, citationStart: number): string | null {
  const window = text.slice(Math.max(0, citationStart - 220), citationStart);
  const cut = Math.max(window.lastIndexOf("\n"), window.lastIndexOf(";"), window.lastIndexOf(". "), window.lastIndexOf(": "));
  const clause = window.slice(cut + 1).replace(/[\s,]+$/, "");
  const vAt = clause.search(/\sv\.?\s(?!.*\sv\.?\s)/);
  if (vAt < 0) return null;

  const right = clause.slice(vAt).replace(/^\s+v\.?\s+/, "").trim();
  const tokens = clause.slice(0, vAt).trim().split(/\s+/);
  let depth = 0;
  let first = tokens.length;
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i];
    depth += (t.match(/\)/g) ?? []).length - (t.match(/\(/g) ?? []).length;
    if (depth > 0) {
      first = i;
      continue;
    }
    const bare = t.replace(/[^\w&]/g, "");
    const startsUpper = /^[(A-Z0-9]/.test(t);
    if (NAME_STOP.has(bare) || (!startsUpper && !CONNECTORS.has(bare))) break;
    first = i;
  }
  while (first < tokens.length && CONNECTORS.has(tokens[first].toLowerCase())) first++;
  const left = tokens.slice(first).join(" ");
  if (!left || !right) return null;
  return `${left} v ${right}`;
}
