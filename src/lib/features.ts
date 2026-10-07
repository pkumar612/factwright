export type FeatureStatus = "live" | "next" | "later";

export interface FeatureArea {
  id: string;
  name: string;
  summary: string;
  features: { name: string; detail: string; status: FeatureStatus }[];
}

/** Every feature decided so far. Mirrors the feature list in the design doc. */
export const FEATURE_AREAS: FeatureArea[] = [
  {
    id: "verify",
    name: "Verify",
    summary: "Checks every claim in a document against its source before it goes out.",
    features: [
      { name: "Case citations", detail: "UK neutral citations looked up on Find Case Law. Made-up cases, and citations that belong to a different case, are flagged.", status: "live" },
      { name: "Legislation", detail: "Sections and subsections checked on legislation.gov.uk.", status: "live" },
      { name: "Quotes", detail: "Quoted words matched against the judgment or statute, down to one changed word.", status: "live" },
      { name: "Figures", detail: "Percentages, totals, growth rates, breakdowns that should sum to 100%, and the same figure stated twice.", status: "live" },
      { name: "Links and sources", detail: "Cited links are opened, and the page is checked for the figure it's cited for.", status: "live" },
      { name: "Law report citations", detail: "WLR, AC and similar citations flagged for a manual check.", status: "live" },
      { name: "Upload, paste and samples", detail: "Word, PDF or text in; a highlighted document, verdict cards and a printable report out.", status: "live" },
      { name: "AI support check", detail: "After the plain lookups, an AI model checks whether the source actually supports the claim.", status: "next" },
      { name: "Word add-in", detail: "Checks inside Word, then Outlook, PowerPoint and Excel.", status: "next" },
      { name: "Verification certificate", detail: "A signed record of what was checked, by whom and when.", status: "next" },
      { name: "Figure tie-out for finance", detail: "Every figure traced to its spreadsheet, ledger or filing.", status: "next" },
      { name: "Unsourced figures", detail: "Statistics with no source flagged for the author.", status: "next" },
    ],
  },
  {
    id: "govern",
    name: "Govern",
    summary: "Control over every AI tool the firm uses, ours included.",
    features: [
      { name: "AI tool discovery", detail: "Finds the AI apps staff use through Microsoft 365 and Google Workspace.", status: "next" },
      { name: "AI register", detail: "Each tool with its vendor terms, data flows and a risk rating.", status: "next" },
      { name: "Client consent tracking", detail: "Client \"no AI on our matters\" instructions applied per matter.", status: "next" },
      { name: "Ethical walls", detail: "Matter permissions mirrored from iManage or NetDocuments.", status: "next" },
      { name: "AI policy sign-off", detail: "The AI policy rolled out to staff, with signed acknowledgement.", status: "next" },
      { name: "Usage logs and approvals", detail: "Logs, approval steps and a kill switch for every AI tool.", status: "next" },
    ],
  },
  {
    id: "compliance",
    name: "Compliance",
    summary: "One-click evidence for every regime a firm answers to.",
    features: [
      { name: "SRA and insurer evidence packs", detail: "Ready for the SRA, professional indemnity insurers and client AI questionnaires.", status: "next" },
      { name: "Data protection", detail: "UK GDPR and ICO DPIA templates.", status: "later" },
      { name: "Finance regimes", detail: "FCA Consumer Duty and SM&CR, plus DORA for firms with EU operations.", status: "later" },
      { name: "AI standards", detail: "ISO 42001, and the EU AI Act for firms with EU clients.", status: "later" },
    ],
  },
  {
    id: "memory",
    name: "Memory",
    summary: "The platform learns each matter, without ever treating memory as evidence.",
    features: [
      { name: "Matter memory", detail: "Learns reviewer corrections, house style and case context, with one memory per matter.", status: "later" },
    ],
  },
  {
    id: "decide",
    name: "Decide",
    summary: "Auditable case handling for high-volume work.",
    features: [
      { name: "Case chronologies", detail: "A timeline built from emails, documents and recordings.", status: "later" },
      { name: "Rule checklists and decisions", detail: "Firm or regulator rules applied, with the human decision and reasoning recorded.", status: "later" },
    ],
  },
  {
    id: "platform",
    name: "Platform",
    summary: "The foundations every module shares.",
    features: [
      { name: "Evidence graph and audit log", detail: "Every claim, source, check and AI call, append-only and tamper-evident.", status: "next" },
      { name: "Access control", detail: "Microsoft single sign-on, roles and matter permissions.", status: "next" },
      { name: "UK hosting and privacy", detail: "UK region only, zero data retention, no training on client data.", status: "next" },
      { name: "Integrations", detail: "iManage, NetDocuments and Microsoft 365, then practice-management systems.", status: "later" },
      { name: "Website", detail: "This site and the live demo.", status: "live" },
    ],
  },
];
