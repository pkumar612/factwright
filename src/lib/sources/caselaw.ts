import { fetchText, stripTags } from "./http";

export const CASELAW_BASE = "https://caselaw.nationalarchives.gov.uk";

const EWHC_DIVISIONS: Record<string, string> = {
  admin: "admin",
  ch: "ch",
  qb: "qb",
  kb: "kb",
  fam: "fam",
  comm: "comm",
  tcc: "tcc",
  pat: "pat",
  ipec: "ipec",
  costs: "scco",
  scco: "scco",
  admlty: "admlty",
  mercantile: "mercantile",
};

const UT_CHAMBERS: Record<string, string> = { iac: "iac", lc: "lc", tcc: "tcc", aac: "aac" };
const FTT_CHAMBERS: Record<string, string> = { tc: "tc", grc: "grc" };

/**
 * Map a UK neutral citation to its Find Case Law path, e.g.
 * "[2020] EWHC 2435 (Admin)" -> "ewhc/admin/2020/2435".
 * Returns null for courts Find Case Law doesn't cover.
 */
export function neutralCitationPath(
  year: string,
  court: string,
  number: string,
  division?: string,
): string | null {
  const c = court.replace(/\s+/g, " ").toUpperCase();
  const d = division?.trim().toLowerCase();
  switch (c) {
    case "UKSC":
      return `uksc/${year}/${number}`;
    case "UKPC":
      return `ukpc/${year}/${number}`;
    case "EWCA CIV":
      return `ewca/civ/${year}/${number}`;
    case "EWCA CRIM":
      return `ewca/crim/${year}/${number}`;
    case "EWHC":
      return d && EWHC_DIVISIONS[d] ? `ewhc/${EWHC_DIVISIONS[d]}/${year}/${number}` : null;
    case "EWFC":
      return `ewfc/${year}/${number}`;
    case "EWCOP":
      return `ewcop/${year}/${number}`;
    case "UKUT":
      return d && UT_CHAMBERS[d] ? `ukut/${UT_CHAMBERS[d]}/${year}/${number}` : null;
    case "UKFTT":
      return d && FTT_CHAMBERS[d] ? `ukftt/${FTT_CHAMBERS[d]}/${year}/${number}` : null;
    case "EAT":
      return `eat/${year}/${number}`;
    default:
      return null;
  }
}

export interface Judgment {
  title: string;
  text: string;
  url: string;
}

export type JudgmentLookup =
  | { found: true; judgment: Judgment }
  | { found: false; reason: "not_found" | "unreachable" };

export async function lookupJudgment(path: string): Promise<JudgmentLookup> {
  const url = `${CASELAW_BASE}/${path}`;
  const xml = await fetchText(`${url}/data.xml`);
  if (xml.failed || xml.status >= 500 || xml.status === 429 || xml.status === 403) {
    return { found: false, reason: "unreachable" };
  }
  if (xml.status === 404 || xml.status === 410) return { found: false, reason: "not_found" };
  if (xml.status !== 200 || !xml.body) return { found: false, reason: "unreachable" };

  const name = xml.body.match(/<FRBRname\s+value="([^"]+)"/)?.[1];
  const title = name ? decodeEntities(name) : titleFromBody(xml.body);
  return { found: true, judgment: { title, text: stripTags(xml.body), url } };
}

function titleFromBody(markup: string): string {
  const t = markup.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  return t ? decodeEntities(t).split(" - ")[0].trim() : "Untitled judgment";
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

const NAME_STOPWORDS = new Set([
  "r", "the", "of", "on", "application", "and", "v", "vs", "ex", "parte", "in", "re",
  "ltd", "limited", "plc", "llp", "lbc", "london", "borough", "council", "city",
  "county", "district", "court", "for", "secretary", "state", "home", "department",
  "others", "another", "anor", "ors", "co", "company", "a", "an", "rb", "lb",
]);

/** Distinctive words in a case name, e.g. "El Gendi v Camden LBC" -> gendi, camden. */
export function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !NAME_STOPWORDS.has(w));
}

/** Share of the cited name's distinctive words that appear in the real title. */
export function nameMatchScore(citedName: string, actualTitle: string): number {
  const cited = [...new Set(nameTokens(citedName))];
  if (cited.length === 0) return 1;
  const actual = new Set(nameTokens(actualTitle));
  return cited.filter((w) => actual.has(w)).length / cited.length;
}
