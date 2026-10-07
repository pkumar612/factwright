export type Status = "verified" | "warning" | "error" | "unverifiable";

export type FindingKind = "case" | "legislation" | "quote" | "figure" | "link";

export interface SourceRef {
  label: string;
  url: string;
}

export interface Finding {
  id: string;
  kind: FindingKind;
  /** The text as it appears in the document. */
  text: string;
  status: Status;
  /** One-line verdict, e.g. "Citation belongs to a different case". */
  verdict: string;
  /** Plain-English explanation of what was checked and found. */
  detail: string;
  source?: SourceRef;
  /** The passage from the source that the verdict rests on. */
  evidence?: string;
  start: number;
  end: number;
}

export interface Report {
  documentName: string;
  checkedAt: string;
  wordCount: number;
  text: string;
  findings: Finding[];
  counts: Record<Status, number>;
}
