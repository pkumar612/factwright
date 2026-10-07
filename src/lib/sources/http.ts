import { FIXTURES } from "./fixtures";

export interface FetchResult {
  status: number;
  body: string;
  /** True when the request failed before any HTTP status came back. */
  failed?: boolean;
}

const MAX_BODY = 3_000_000;
const cache = new Map<string, Promise<FetchResult>>();

/**
 * GET a URL with a timeout. Known source snapshots in FIXTURES are served
 * first, so the built-in samples work even when a source site is slow.
 * Results are cached for the life of the server process.
 */
export function fetchText(url: string, timeoutMs = 8000): Promise<FetchResult> {
  const fixture = FIXTURES[url];
  if (fixture) return Promise.resolve(fixture);
  let pending = cache.get(url);
  if (!pending) {
    pending = doFetch(url, timeoutMs);
    cache.set(url, pending);
  }
  return pending;
}

async function doFetch(url: string, timeoutMs: number): Promise<FetchResult> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "user-agent": "Factwright/0.1 (citation checker preview)",
        accept: "text/html,application/xml,application/atom+xml,*/*",
      },
    });
    const body = res.ok ? (await res.text()).slice(0, MAX_BODY) : "";
    return { status: res.status, body };
  } catch {
    return { status: 0, body: "", failed: true };
  }
}

/** Strip XML/HTML tags and collapse whitespace. */
export function stripTags(markup: string): string {
  return markup
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
