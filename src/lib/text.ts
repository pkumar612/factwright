/** Lowercase, straighten quotes and dashes, collapse whitespace. */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function words(s: string): string[] {
  return normalise(s)
    .replace(/[^a-z0-9' ]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

export interface QuoteMatch {
  /** 1 = exact; share of quote words matched in the best window otherwise. */
  score: number;
  /** The closest passage in the source, in the source's own words. */
  passage: string;
  /** Quote words that differ from the closest passage. */
  differences: { quoted: string; source: string }[];
}

/**
 * Find a quotation in a source text. Exact (after normalising) scores 1;
 * otherwise slide a window the length of the quote over the source and keep
 * the window sharing the most words in the same positions.
 */
export function matchQuote(quote: string, source: string): QuoteMatch {
  const q = words(quote);
  const s = words(source);
  if (q.length === 0 || s.length === 0) return { score: 0, passage: "", differences: [] };

  if (` ${s.join(" ")} `.includes(` ${q.join(" ")} `)) {
    return { score: 1, passage: quote, differences: [] };
  }

  let best = { score: 0, at: 0 };
  for (let i = 0; i + q.length <= s.length; i++) {
    let same = 0;
    for (let j = 0; j < q.length; j++) if (s[i + j] === q[j]) same++;
    const score = same / q.length;
    if (score > best.score) best = { score, at: i };
  }
  if (s.length < q.length) best = { score: 0, at: 0 };

  const window = s.slice(best.at, best.at + q.length);
  const differences = q
    .map((w, j) => ({ quoted: w, source: window[j] ?? "" }))
    .filter((d) => d.quoted !== d.source);
  return { score: best.score, passage: window.join(" "), differences };
}

/**
 * Split text into sentences, keeping each sentence's start offset. A full stop
 * only ends a sentence when followed by whitespace, so "£2.0m" and URLs stay whole.
 */
export function sentences(text: string): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const endsHere = c === "\n" || (/[.!?]/.test(c) && (i + 1 === text.length || /\s/.test(text[i + 1])));
    if (endsHere || i + 1 === text.length) {
      const piece = text.slice(start, i + 1);
      if (piece.trim()) out.push({ text: piece, start });
      start = i + 1;
    }
  }
  return out;
}
