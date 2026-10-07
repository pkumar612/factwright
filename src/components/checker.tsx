"use client";

import { ArrowLeft, ClipboardPaste, FileText, Loader2, Printer, Sparkles, UploadCloud } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Results } from "./results";
import { CardSpotlight } from "./ui/card-spotlight";
import { GridBackground } from "./ui/grid-background";
import type { Report } from "@/lib/types";
import { cn } from "@/lib/cn";

type Mode = "samples" | "upload" | "paste";
type SampleCard = { id: string; title: string; blurb: string };

const STEPS = ["Reading the document", "Finding citations, quotes and figures", "Looking up the National Archives", "Checking legislation.gov.uk", "Recalculating the figures", "Opening cited links"];

export function Checker({ samples, initialMode }: { samples: SampleCard[]; initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(label: string, init: RequestInit) {
    setBusy(label);
    setError(null);
    try {
      const res = await fetch("/api/check", { method: "POST", ...init });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setReport(data as Report);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  const runSample = (s: SampleCard) =>
    run(s.title, { headers: { "content-type": "application/json" }, body: JSON.stringify({ sampleId: s.id }) });
  const runFile = (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return run(file.name, { body: form });
  };
  const runText = (text: string) =>
    run("Pasted text", { headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });

  if (report) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setReport(null)} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Check another document
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-200">
            <Printer className="h-4 w-4" /> Print or save as PDF
          </button>
        </div>
        <Results report={report} />
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <GridBackground />
      <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">Check a document</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
          Try a sample, or upload a public or redacted document. Please don&apos;t upload confidential client files to this preview.
        </p>

        <div className="mx-auto mt-8 flex w-fit rounded-full border border-line bg-panel p-1">
          {(
            [
              ["samples", "Samples", Sparkles],
              ["upload", "Upload", UploadCloud],
              ["paste", "Paste text", ClipboardPaste],
            ] as const
          ).map(([m, label, Icon]) => (
            <button key={m} onClick={() => setMode(m)} className={cn("relative rounded-full px-4 py-2 text-sm transition", mode === m ? "text-ink" : "text-slate-400 hover:text-white")}>
              {mode === m && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative inline-flex items-center gap-2">
                <Icon className="h-4 w-4" /> {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {busy ? (
                <Progress label={busy} />
              ) : mode === "samples" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {samples.map((s) => (
                    <button key={s.id} onClick={() => runSample(s)} className="text-left">
                      <CardSpotlight className="h-full transition hover:border-white/20">
                        <FileText className="h-5 w-5 text-brand" />
                        <h2 className="mt-4 font-semibold text-white">{s.title}</h2>
                        <p className="mt-1 text-sm text-slate-400">{s.blurb}</p>
                        <span className="mt-5 inline-block text-sm text-slate-300">Run the check →</span>
                      </CardSpotlight>
                    </button>
                  ))}
                </div>
              ) : mode === "upload" ? (
                <DropZone onFile={runFile} />
              ) : (
                <PasteBox onSubmit={runText} />
              )}
            </motion.div>
          </AnimatePresence>
          {error && <p className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}
        </div>
      </div>
    </section>
  );
}

function Progress({ label }: { label: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-2xl border border-line bg-panel p-8 text-center">
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
      <p className="mt-4 font-medium text-white">Checking {label}</p>
      <AnimatePresence mode="wait">
        <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-1 text-sm text-slate-400">
          {STEPS[step]}…
        </motion.p>
      </AnimatePresence>
      <div className="mx-auto mt-6 h-1 max-w-xs overflow-hidden rounded-full bg-white/5">
        <motion.div className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400" initial={{ width: "5%" }} animate={{ width: "92%" }} transition={{ duration: 4, ease: "easeOut" }} />
      </div>
    </div>
  );
}

function DropZone({ onFile }: { onFile: (f: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => input.current?.click()}
      className={cn("cursor-pointer rounded-2xl border border-dashed p-12 text-center transition", over ? "border-brand bg-brand/10" : "border-white/15 bg-panel hover:border-white/30")}
    >
      <UploadCloud className="mx-auto h-8 w-8 text-brand" />
      <p className="mt-4 font-medium text-white">Drop a Word, PDF or text file here</p>
      <p className="mt-1 text-sm text-slate-400">or click to choose one. Up to 5 MB.</p>
      <input ref={input} type="file" accept=".docx,.pdf,.txt,.md" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}

function PasteBox({ onSubmit }: { onSubmit: (t: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Paste a skeleton argument, an advice note or a report…"
        className="w-full resize-y bg-transparent p-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
      />
      <div className="flex justify-end">
        <button disabled={!text.trim()} onClick={() => onSubmit(text)} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-ink transition hover:bg-slate-200 disabled:opacity-40">
          Check this text
        </button>
      </div>
    </div>
  );
}
