"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/** Words fade up out of a blur, one after another. */
export function TextGenerate({ words, className, highlight = [] }: { words: string; className?: string; highlight?: string[] }) {
  return (
    <span className={cn("inline", className)}>
      {words.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={cn("inline-block", highlight.includes(word) && "bg-gradient-to-r from-[#fff3cf] via-white to-[#d6f0c2] bg-clip-text text-transparent")}
          initial={{ opacity: 0, filter: "blur(10px)", y: 8 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: "easeOut" }}
        >
          {word}
          {" "}
        </motion.span>
      ))}
    </span>
  );
}
