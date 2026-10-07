"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts up from 0 to `value` when it scrolls into view. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = Math.round(v).toString();
      },
    });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
