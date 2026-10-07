import { fetchText, stripTags } from "./sources/http";
import type { Finding } from "./types";

const URL_RE = /https?:\/\/[^\s<>"'”)\]]+[^\s<>"'”)\].,;:]/g;

export interface LinkRef {
  url: string;
  start: number;
  end: number;
  /** Percentages and amounts in the sentence that cites this link. */
  figures: string[];
}

export function extractLinks(text: string): LinkRef[] {
  return [...text.matchAll(URL_RE)].map((m) => {
    const start = m.index!;
    const sentenceStart = Math.max(text.lastIndexOf(".", start - 2), text.lastIndexOf("\n", start)) + 1;
    const sentence = text.slice(sentenceStart, start);
    const figures = [...sentence.matchAll(/\d+(?:\.\d+)?\s?%|[£$€]\s?\d[\d,.]*\s*(?:bn|m|k)?/g)].map((f) =>
      f[0].replace(/\s/g, ""),
    );
    return { url: m[0], start, end: start + m[0].length, figures };
  });
}

/** Does the link work, and does the page mention the figures it's cited for? */
export async function checkLink(link: LinkRef): Promise<Omit<Finding, "id">> {
  const base = { kind: "link" as const, text: link.url, start: link.start, end: link.end, source: { label: "Open link", url: link.url } };
  const res = await fetchText(link.url);
  if (res.status === 404 || res.status === 410) {
    return { ...base, status: "error", verdict: "Link is broken", detail: `The page returns "${res.status} not found", so it can't support the claim it's cited for.` };
  }
  if (res.failed || res.status === 0 || res.status >= 400) {
    return { ...base, status: "unverifiable", verdict: "Couldn't reach this page", detail: res.status ? `The site answered with status ${res.status}. Check it by hand.` : "The site didn't respond in time. Check it by hand." };
  }
  if (link.figures.length === 0) {
    return { ...base, status: "verified", verdict: "Link works", detail: "The page exists and loads." };
  }
  const page = stripTags(res.body).replace(/\s/g, "");
  const missing = link.figures.filter((f) => !page.includes(f));
  if (missing.length === 0) {
    return { ...base, status: "verified", verdict: "Link supports the figure", detail: `The page loads and mentions ${link.figures.join(", ")}.` };
  }
  return {
    ...base,
    status: "warning",
    verdict: "Page doesn't mention the figure",
    detail: `The page loads, but ${missing.join(", ")} doesn't appear on it. The figure may come from somewhere else.`,
  };
}
