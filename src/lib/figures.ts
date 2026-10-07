import { sentences } from "./text";
import type { Finding } from "./types";

type FigureFinding = Omit<Finding, "id">;

const MONEY = /([£$€])\s?(\d[\d,]*(?:\.\d+)?)\s*(bn|billion|m|million|k|thousand)?\b/gi;
const MULTIPLIER: Record<string, number> = {
  bn: 1e9, billion: 1e9, m: 1e6, million: 1e6, k: 1e3, thousand: 1e3,
};

function toNumber(digits: string, unit?: string): number {
  return parseFloat(digits.replace(/,/g, "")) * (unit ? MULTIPLIER[unit.toLowerCase()] ?? 1 : 1);
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString("en-GB") : n.toLocaleString("en-GB", { maximumFractionDigits: 1 });
}

/** Deterministic arithmetic checks on the figures in a document. */
export function checkFigures(text: string): FigureFinding[] {
  const out: FigureFinding[] = [];
  for (const s of sentences(text)) {
    out.push(...checkShares(s.text, s.start));
    out.push(...checkTotals(s.text, s.start));
    out.push(...checkGrowth(s.text, s.start));
    out.push(...checkBreakdown(s.text, s.start));
  }
  out.push(...checkRepeatedMetrics(text));
  return out;
}

/** "12 of 40 respondents (35%)" — does 12 / 40 really equal 35%? */
function checkShares(s: string, offset: number): FigureFinding[] {
  const re = /(\d[\d,]*)\s+(?:of|out of)\s+(?:the\s+)?(\d[\d,]*)\b[^.%]{0,60}?\(?(\d+(?:\.\d+)?)\s?%/g;
  const out: FigureFinding[] = [];
  for (const m of s.matchAll(re)) {
    const part = toNumber(m[1]);
    const whole = toNumber(m[2]);
    const stated = parseFloat(m[3]);
    if (!whole) continue;
    const actual = (part / whole) * 100;
    const ok = Math.abs(actual - stated) <= 1;
    out.push({
      kind: "figure",
      text: m[0],
      status: ok ? "verified" : "error",
      verdict: ok ? "Percentage adds up" : "Percentage doesn't match its numbers",
      detail: ok
        ? `${fmt(part)} out of ${fmt(whole)} is ${fmt(actual)}%, consistent with the ${fmt(stated)}% stated.`
        : `${fmt(part)} out of ${fmt(whole)} is ${fmt(actual)}%, not the ${fmt(stated)}% stated.`,
      start: offset + m.index!,
      end: offset + m.index! + m[0].length,
    });
  }
  return out;
}

/** "a total of £4.1m: £1.2m, £1.5m and £0.9m" — do the parts sum to the total? */
function checkTotals(s: string, offset: number): FigureFinding[] {
  if (!/\btotal/i.test(s)) return [];
  const amounts = [...s.matchAll(MONEY)].map((m) => ({
    value: toNumber(m[2], m[3]),
    raw: m[0],
    at: m.index!,
  }));
  if (amounts.length < 3) return [];
  const totalWord = s.search(/\btotal(?:ling|ing|led|ed)?\b(?:\s+of)?/i);
  const total = amounts.find((a) => a.at > totalWord) ?? amounts[amounts.length - 1];
  const parts = amounts.filter((a) => a !== total);
  const sum = parts.reduce((acc, a) => acc + a.value, 0);
  const ok = Math.abs(sum - total.value) <= Math.max(1, total.value * 0.005);
  const symbol = total.raw.trim()[0];
  const show = (n: number) => `${symbol}${fmt(n >= 1e6 ? n / 1e6 : n)}${n >= 1e6 ? "m" : ""}`;
  return [
    {
      kind: "figure",
      text: s.trim(),
      status: ok ? "verified" : "error",
      verdict: ok ? "Total adds up" : "Parts don't add up to the total",
      detail: ok
        ? `The ${parts.length} amounts sum to ${show(sum)}, matching the stated total.`
        : `The ${parts.length} amounts listed sum to ${show(sum)}, but the stated total is ${show(total.value)}.`,
      start: offset + s.indexOf(s.trim()),
      end: offset + s.indexOf(s.trim()) + s.trim().length,
    },
  ];
}

/** "rose from £2.0m to £2.6m, an increase of 40%" — is the change right? */
function checkGrowth(s: string, offset: number): FigureFinding[] {
  const re =
    /from\s+([£$€]?)(\d[\d,]*(?:\.\d+)?)\s*(bn|billion|m|million|k)?\b(?:\s+in\s+\d{4})?\s+to\s+([£$€]?)(\d[\d,]*(?:\.\d+)?)\s*(bn|billion|m|million|k)?\b[^.%]{0,60}?(\d+(?:\.\d+)?)\s?%/gi;
  const out: FigureFinding[] = [];
  for (const m of s.matchAll(re)) {
    const from = toNumber(m[2], m[3]);
    const to = toNumber(m[5], m[6] ?? m[3]);
    const stated = parseFloat(m[7]);
    if (!from) continue;
    const actual = (Math.abs(to - from) / from) * 100;
    const ok = Math.abs(actual - stated) <= 1;
    out.push({
      kind: "figure",
      text: m[0],
      status: ok ? "verified" : "error",
      verdict: ok ? "Change is calculated correctly" : "Change is calculated wrongly",
      detail: ok
        ? `Going from ${m[1]}${m[2]}${m[3] ?? ""} to ${m[4]}${m[5]}${m[6] ?? ""} is a ${fmt(actual)}% change, as stated.`
        : `Going from ${m[1]}${m[2]}${m[3] ?? ""} to ${m[4]}${m[5]}${m[6] ?? ""} is a ${fmt(actual)}% change, not ${fmt(stated)}%.`,
      start: offset + m.index!,
      end: offset + m.index! + m[0].length,
    });
  }
  return out;
}

/** "split 45% / 35% / 30%" — a breakdown of a whole should sum to 100%. */
function checkBreakdown(s: string, offset: number): FigureFinding[] {
  if (!/\b(split|breakdown|broken down|comprised|made up of|divided)\b/i.test(s)) return [];
  const pcts = [...s.matchAll(/(\d+(?:\.\d+)?)\s?%/g)].map((m) => parseFloat(m[1]));
  if (pcts.length < 3) return [];
  const sum = pcts.reduce((a, b) => a + b, 0);
  const ok = Math.abs(sum - 100) <= 1;
  const t = s.trim();
  return [
    {
      kind: "figure",
      text: t,
      status: ok ? "verified" : "error",
      verdict: ok ? "Breakdown sums to 100%" : "Breakdown doesn't sum to 100%",
      detail: `The ${pcts.length} shares add up to ${fmt(sum)}%.`,
      start: offset + s.indexOf(t),
      end: offset + s.indexOf(t) + t.length,
    },
  ];
}

const METRIC =
  /\b(revenue|turnover|operating profit|net profit|profit|ebitda|headcount|market size|valuation|net assets|cash balance)\b/i;

/** The same metric for the same year stated with two different values. */
function checkRepeatedMetrics(text: string): FigureFinding[] {
  const seen = new Map<string, { value: number; raw: string }>();
  const out: FigureFinding[] = [];
  for (const s of sentences(text)) {
    const metric = s.text.match(METRIC)?.[1];
    if (!metric) continue;
    const years = [...new Set(s.text.match(/\b(?:19|20)\d{2}\b/g) ?? [])];
    for (const m of s.text.matchAll(MONEY)) {
      const at = m.index!;
      // Tie each amount to its year: "£2.6m in 2026" or "revenue for 2026 of £2.8m".
      const year =
        s.text.slice(at + m[0].length).match(/^\s*in\s+((?:19|20)\d{2})/)?.[1] ??
        s.text.slice(Math.max(0, at - 24), at).match(/(?:for|in)\s+((?:19|20)\d{2})\s+(?:of|was|is|at)?\s*$/)?.[1] ??
        (years.length === 1 ? years[0] : undefined);
      if (!year) continue;
      const value = toNumber(m[2], m[3]);
      const key = `${metric.toLowerCase()}|${year}`;
      const prev = seen.get(key);
      if (!prev) {
        seen.set(key, { value, raw: m[0].trim() });
      } else if (Math.abs(prev.value - value) > prev.value * 0.005) {
        const start = s.start + at;
        out.push({
          kind: "figure",
          text: m[0].trim(),
          status: "error",
          verdict: "Same figure stated two different ways",
          detail: `${capitalise(metric)} for ${year} is given as ${prev.raw} earlier in the document and ${m[0].trim()} here.`,
          start,
          end: start + m[0].trim().length,
        });
      }
    }
  }
  return out;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
