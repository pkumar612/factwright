"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { STATUS, StatusPill } from "./ui/status";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/cn";

const LINES: { before: string; mark: string; after: string; status: Status; note: string }[] = [
  { before: "see ", mark: "R (El Gendi) v Camden LBC [2020] EWHC 2435 (Admin)", after: ";", status: "error", note: "That citation is a different case about business rates" },
  { before: "the authority ", mark: "“must secure that accommodation is available”", after: " (s.188(3))", status: "error", note: "The Housing Act says “may”, not “must”" },
  { before: "applying ", mark: "R (Miller) v The Prime Minister [2019] UKSC 41", after: " at [50]", status: "verified", note: "Real case, quote matches word for word" },
  { before: "our survey found ", mark: "312 of 480 clients (72%)", after: " use AI", status: "error", note: "312 of 480 is 65%, not 72%" },
];

/** A document being checked line by line, for the landing page. */
export function LivePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers = LINES.map((_, i) => setTimeout(() => setShown(i + 1), 700 + i * 900));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-3xl">
      <div aria-hidden className="absolute -inset-px rounded-2xl bg-gradient-to-b from-sky/30 via-transparent to-moss/20 blur-sm" />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-forest/10">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-forest/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-forest/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-forest/15" />
          <span className="ml-3 text-xs text-stone-500">Skeleton argument (draft).docx</span>
          <span className="ml-auto text-xs text-stone-500">{shown < LINES.length ? "Checking…" : `${LINES.length} checks done`}</span>
        </div>
        <div className="relative space-y-5 p-5 font-mono text-[13px] leading-relaxed text-stone-700 sm:p-7">
          {shown < LINES.length && inView && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-sky/10 to-transparent"
              animate={{ top: ["0%", "90%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          )}
          {LINES.map((line, i) => {
            const done = i < shown;
            return (
              <div key={line.mark} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <p>
                  {line.before}
                  <span className={cn("rounded px-0.5 underline decoration-2 underline-offset-4 transition-colors duration-500", done ? STATUS[line.status].mark : "decoration-transparent")}>
                    {line.mark}
                  </span>
                  {line.after}
                </p>
                <AnimatePresence>
                  {done && (
                    <motion.div
                      initial={{ opacity: 0, x: 12, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      className="shrink-0 sm:w-56"
                    >
                      <StatusPill status={line.status} />
                      <p className="mt-1.5 font-sans text-xs text-stone-600">{line.note}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
