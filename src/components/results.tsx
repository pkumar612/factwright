"use client";

import { ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { AnimatedNumber } from "./ui/animated-number";
import { STATUS, STATUS_ORDER, StatusPill } from "./ui/status";
import type { Finding, Report, Status } from "@/lib/types";
import { cn } from "@/lib/cn";

const KIND_LABEL: Record<Finding["kind"], string> = {
  case: "Case citation",
  legislation: "Legislation",
  quote: "Quote",
  figure: "Figure",
  link: "Link",
};

const SEVERITY: Record<Status, number> = { error: 0, warning: 1, unverifiable: 2, verified: 3 };

export function Results({ report }: { report: Report }) {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [active, setActive] = useState<string | null>(null);

  const ordered = useMemo(
    () => [...report.findings].sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status] || a.start - b.start),
    [report.findings],
  );
  const visible = filter === "all" ? ordered : ordered.filter((f) => f.status === filter);
  const problems = report.counts.error + report.counts.warning;

  function focus(id: string) {
    setActive(id);
    setFilter("all");
    requestAnimationFrame(() => document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  return (
    <div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-stone-500">
          {report.wordCount.toLocaleString("en-GB")} words · checked {new Date(report.checkedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-forest sm:text-3xl">{report.documentName}</h1>
        <p className="mt-1 text-stone-600">
          {report.findings.length === 0
            ? "No citations, quotes, figures or links were found to check."
            : problems === 0
              ? `All ${report.findings.length} checks passed or need only a manual look.`
              : `${problems} of ${report.findings.length} claims need attention before this goes out.`}
        </p>
      </div>

      <div className="no-print mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={cn("rounded-2xl border bg-white p-4 text-left transition", filter === s ? cn("ring-1", STATUS[s].ring, "border-transparent") : "border-line hover:border-forest/25")}
          >
            <AnimatedNumber value={report.counts[s]} className={cn("text-3xl font-semibold tabular-nums", STATUS[s].text)} />
            <p className="mt-1 text-sm text-stone-600">{STATUS[s].label}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-line bg-white">
          <p className="border-b border-line px-5 py-3 text-xs uppercase tracking-wider text-stone-500">Document</p>
          <div className="max-h-[70vh] overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-[13px] leading-relaxed text-stone-700 print:max-h-none">
            <Highlighted report={report} active={active} onPick={focus} />
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={true}>
            {visible.map((f, i) => (
              <motion.article
                key={f.id}
                id={`card-${f.id}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.6), duration: 0.3 }}
                onClick={() => setActive(f.id)}
                className={cn(
                  "cursor-pointer rounded-2xl border bg-white p-5 transition break-inside-avoid",
                  active === f.id ? cn("ring-1", STATUS[f.status].ring, "border-transparent") : "border-line hover:border-forest/25",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={f.status} />
                  <span className="text-xs text-stone-500">{KIND_LABEL[f.kind]}</span>
                </div>
                <h3 className="mt-3 font-semibold text-forest">{f.verdict}</h3>
                <p className="mt-1 break-words font-mono text-xs text-stone-600">{f.text}</p>
                <p className="mt-3 text-sm leading-relaxed text-stone-700">{f.detail}</p>
                {f.evidence && (
                  <blockquote className="mt-3 border-l-2 border-forest/20 pl-3 text-sm italic text-stone-600">{f.evidence}</blockquote>
                )}
                {f.source && (
                  <a href={f.source.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand hover:text-forest">
                    {f.source.label} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** The document text with each checked claim underlined in its status colour. */
function Highlighted({ report, active, onPick }: { report: Report; active: string | null; onPick: (id: string) => void }) {
  const segments = useMemo(() => {
    // Most severe first, so a red claim wins when two overlap.
    const chosen: Finding[] = [];
    for (const f of [...report.findings].sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status])) {
      if (!chosen.some((c) => f.start < c.end && c.start < f.end)) chosen.push(f);
    }
    chosen.sort((a, b) => a.start - b.start);
    const out: { text: string; finding?: Finding }[] = [];
    let at = 0;
    for (const f of chosen) {
      if (f.start > at) out.push({ text: report.text.slice(at, f.start) });
      out.push({ text: report.text.slice(f.start, f.end), finding: f });
      at = f.end;
    }
    out.push({ text: report.text.slice(at) });
    return out;
  }, [report]);

  return (
    <>
      {segments.map((s, i) =>
        s.finding ? (
          <mark
            key={i}
            onClick={() => onPick(s.finding!.id)}
            title={s.finding.verdict}
            className={cn(
              "cursor-pointer rounded px-0.5 text-inherit underline decoration-2 underline-offset-4 transition",
              STATUS[s.finding.status].mark,
              active === s.finding.id && "ring-1 ring-forest/40",
            )}
          >
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
