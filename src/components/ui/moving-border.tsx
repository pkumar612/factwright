import Link from "next/link";
import { cn } from "@/lib/cn";

/** A pill button whose border has a light running around it. */
export function MovingBorderLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group relative inline-flex overflow-hidden rounded-full p-px", className)}>
      <span
        aria-hidden
        className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_90deg_at_50%_50%,#3876ba_0%,#fbf8f2_40%,#3f6b4f_60%,#fbf8f2_80%,#3876ba_100%)]"
      />
      <span className="relative inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-forest backdrop-blur-xl transition group-hover:bg-cream">
        {children}
      </span>
    </Link>
  );
}
