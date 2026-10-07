"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/cn";

/** A card with a soft glow that follows the cursor. */
export function CardSpotlight({ children, className, color = "rgb(129 140 248 / 0.16)" }: { children: React.ReactNode; className?: string; color?: string }) {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const background = useMotionTemplate`radial-gradient(360px circle at ${x}px ${y}px, ${color}, transparent 75%)`;
  return (
    <div
      className={cn("group relative overflow-hidden rounded-2xl border border-line bg-panel/80 p-6", className)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onMouseLeave={() => {
        x.set(-400);
        y.set(-400);
      }}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background }} />
      <div className="relative">{children}</div>
    </div>
  );
}
