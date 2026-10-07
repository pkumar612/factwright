import { fetchText, stripTags } from "./http";

export const LEGISLATION_BASE = "https://www.legislation.gov.uk";

export type ActLookup =
  | { found: true; path: string; title: string }
  | { found: false; reason: "not_found" | "unreachable" };

/** Find a UK Public General Act by its short title and year, e.g. "Housing Act" 1996. */
export async function lookupAct(title: string, year: string): Promise<ActLookup> {
  const feedUrl = `${LEGISLATION_BASE}/ukpga/${year}/data.feed?title=${encodeURIComponent(title)}`;
  const feed = await fetchText(feedUrl);
  if (feed.failed || feed.status >= 500 || feed.status === 403 || feed.status === 429) {
    return { found: false, reason: "unreachable" };
  }
  if (feed.status !== 200) return { found: false, reason: "not_found" };

  const wanted = normaliseTitle(`${title} ${year}`);
  for (const entry of feed.body.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
    const entryTitle = entry.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] ?? "";
    const path = entry.match(/legislation\.gov\.uk\/id\/(ukpga\/\d{4}\/\d+)/)?.[1];
    if (path && normaliseTitle(entryTitle) === wanted) {
      return { found: true, path, title: entryTitle.trim() };
    }
  }
  return { found: false, reason: "not_found" };
}

export type SectionLookup =
  | { found: true; url: string; heading: string; text: string; subsections: string[] }
  | { found: false; reason: "not_found" | "unreachable"; url: string };

export async function lookupSection(actPath: string, section: string): Promise<SectionLookup> {
  const url = `${LEGISLATION_BASE}/${actPath}/section/${section}`;
  const res = await fetchText(`${url}/data.xml`);
  if (res.failed || res.status >= 500 || res.status === 403 || res.status === 429) {
    return { found: false, reason: "unreachable", url };
  }
  if (res.status !== 200 || !res.body) return { found: false, reason: "not_found", url };
  const heading = stripTags(res.body.match(/<Title>([\s\S]*?)<\/Title>/)?.[1] ?? "");
  const body = res.body.match(/<Body[\s\S]*<\/Body>/)?.[0] ?? res.body;
  // Subsection numbers sit in <Pnumber> elements, e.g. <P2><Pnumber>3</Pnumber>.
  const subsections = [...body.matchAll(/<P2\b[^>]*>\s*<Pnumber[^>]*>([^<]+)<\/Pnumber>/g)].map((m) =>
    m[1].trim().toLowerCase(),
  );
  return { found: true, url, heading, text: stripTags(body), subsections };
}

function normaliseTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
