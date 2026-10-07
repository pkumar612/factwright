import Link from "next/link";
import { cn } from "@/lib/cn";

/** A pill button whose border has a light running around it. */
export function MovingBorderLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group relative inline-flex overflow-hidden rounded-full p-px", className)}>
      <span
        aria-hidden
        className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_90deg_at_50%_50%,#818cf8_0%,#0b0d12_40%,#34d399_60%,#0b0d12_80%,#818cf8_100%)]"
      />
      <span className="relative inline-flex items-center gap-2 rounded-full bg-panel px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition group-hover:bg-[#12151d]">
        {children}
      </span>
    </Link>
  );
}
