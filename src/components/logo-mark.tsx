"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

// The Factwright mark, "Cited": citation brackets holding one solid block, a claim held to its source.
// Geometry matches public/brand/factwright-symbol.svg (256 grid).
export const MARK = {
  left: "M44 36H96V64H72V192H96V220H44Z",
  right: "M212 36H160V64H184V192H160V220H212Z",
  block: { x: 98, y: 98, size: 60, radius: 6 },
};

const spring = { type: "spring", stiffness: 320, damping: 20 } as const;

interface LogoMarkProps {
  className?: string;
  /** Play the entrance when the mark appears. Change `replayKey` to play it again. */
  animate?: boolean;
  replayKey?: number;
  /** Colours for use on dark backgrounds. */
  reversed?: boolean;
}

export function LogoMark({ className, animate = true, replayKey = 0, reversed = false }: LogoMarkProps) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;
  const ink = reversed ? "#fbf8f2" : "#1f3b2d";
  const fact = reversed ? "#8cbfe8" : "#3876ba";
  const { x, y, size, radius } = MARK.block;

  return (
    <motion.svg
      key={replayKey}
      viewBox="32 32 192 192"
      className={cn("h-7 w-7", className)}
      initial={play ? "hidden" : "shown"}
      animate="shown"
      whileHover={play ? "hover" : undefined}
      aria-hidden
    >
      {/* The fact lands first... */}
      <motion.rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={radius}
        fill={fact}
        style={{ transformOrigin: "128px 128px" }}
        variants={{
          hidden: { scale: 0, rotate: -45 },
          shown: { scale: 1, rotate: 0, transition: { ...spring, delay: 0.1 } },
          hover: { scale: 0.88, rotate: 0, transition: spring },
        }}
      />
      {/* ...then the brackets close in around it, and open a little on hover. */}
      <motion.path
        d={MARK.left}
        fill={ink}
        variants={{
          hidden: { x: -48, opacity: 0 },
          shown: { x: 0, opacity: 1, transition: { ...spring, delay: 0.35 } },
          hover: { x: -10, opacity: 1, transition: spring },
        }}
      />
      <motion.path
        d={MARK.right}
        fill={ink}
        variants={{
          hidden: { x: 48, opacity: 0 },
          shown: { x: 0, opacity: 1, transition: { ...spring, delay: 0.35 } },
          hover: { x: 10, opacity: 1, transition: spring },
        }}
      />
    </motion.svg>
  );
}

/** The wordmark in Geist semibold, letters rising in after the mark. */
export function Wordmark({ className, animate = true, replayKey = 0, reversed = false }: LogoMarkProps) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;

  return (
    <span key={replayKey} className={cn("inline-flex font-semibold tracking-tight", reversed ? "text-cream" : "text-forest", className)} aria-label="Factwright">
      {"Factwright".split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={play ? { opacity: 0, y: 6, filter: "blur(4px)" } : false}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.5 + i * 0.04, duration: 0.35, ease: "easeOut" }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}
