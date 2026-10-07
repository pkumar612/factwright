"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

// The Factwright mark: an F whose middle arm turns into a tick.
export const MARK_PATHS = {
  stem: "M13 9.5V30.5",
  bar: "M13 9.5H28",
  tick: "M13 19.5H17L21 23.5L29 14.5",
};

const draw = (delay: number, duration: number) => ({
  hidden: { pathLength: 0, opacity: 0 },
  shown: { pathLength: 1, opacity: 1, transition: { pathLength: { delay, duration, ease: [0.65, 0, 0.35, 1] as const }, opacity: { delay, duration: 0.01 } } },
});

interface LogoMarkProps {
  className?: string;
  /** Draw the strokes in when the mark appears. Change `replayKey` to draw again. */
  animate?: boolean;
  replayKey?: number;
}

export function LogoMark({ className, animate = true, replayKey = 0 }: LogoMarkProps) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const play = animate && !reduce;

  return (
    <motion.svg
      key={replayKey}
      viewBox="0 0 40 40"
      className={cn("h-7 w-7", className)}
      initial={play ? "hidden" : "shown"}
      animate="shown"
      whileHover={play ? "hover" : undefined}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3876ba" />
          <stop offset="1" stopColor="#3f6b4f" />
        </linearGradient>
        <linearGradient id={`${id}-glint`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="40" height="40" rx="10" />
        </clipPath>
      </defs>

      <motion.rect
        width="40"
        height="40"
        rx="10"
        fill={`url(#${id}-bg)`}
        variants={{ hidden: { scale: 0.6, opacity: 0 }, shown: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 18 } } }}
        style={{ transformOrigin: "20px 20px" }}
      />

      <g fill="none" stroke="#fbf8f2" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d={MARK_PATHS.stem} variants={draw(0.25, 0.35)} />
        <motion.path d={MARK_PATHS.bar} variants={draw(0.5, 0.3)} />
        <motion.path d={MARK_PATHS.tick} variants={draw(0.75, 0.55)} />
      </g>

      {/* A light sweep after the tick lands, and again on hover. */}
      <g clipPath={`url(#${id}-clip)`}>
        <g transform="rotate(20 20 20)">
        <motion.rect
          y="-10"
          width="16"
          height="60"
          fill={`url(#${id}-glint)`}
          variants={{
            hidden: { x: -30 },
            shown: { x: 54, transition: { delay: 1.35, duration: 0.8, ease: "easeInOut" } },
            hover: { x: [-30, 54], transition: { duration: 0.8, ease: "easeInOut" } },
          }}
        />
        </g>
      </g>
    </motion.svg>
  );
}

/** The wordmark: "Fact" in forest, "wright" in moss, letters rising in after the mark. */
export function Wordmark({ className, animate = true, replayKey = 0 }: LogoMarkProps) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;
  const letters = "Factwright".split("");

  return (
    <span key={replayKey} className={cn("inline-flex font-semibold tracking-tight", className)} aria-label="Factwright">
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={i < 4 ? "text-forest" : "text-moss"}
          initial={play ? { opacity: 0, y: 6, filter: "blur(4px)" } : false}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.55 + i * 0.045, duration: 0.35, ease: "easeOut" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
