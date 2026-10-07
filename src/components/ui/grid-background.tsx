import { cn } from "@/lib/cn";

/** Fine grid lines that fade out towards the edges. */
export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 [background-size:56px_56px]",
        "[background-image:linear-gradient(to_right,rgb(31_59_45/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(31_59_45/0.06)_1px,transparent_1px)]",
        "[mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]",
        className,
      )}
    />
  );
}
