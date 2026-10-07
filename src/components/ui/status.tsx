import { AlertTriangle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/cn";

export const STATUS: Record<Status, { label: string; text: string; bg: string; ring: string; mark: string; Icon: typeof CheckCircle2 }> = {
  error: { label: "Wrong", text: "text-error", bg: "bg-error/10", ring: "ring-error/30", mark: "bg-error/20 decoration-error", Icon: XCircle },
  warning: { label: "Needs a look", text: "text-warning", bg: "bg-warning/10", ring: "ring-warning/30", mark: "bg-warning/20 decoration-warning", Icon: AlertTriangle },
  verified: { label: "Verified", text: "text-verified", bg: "bg-verified/10", ring: "ring-verified/30", mark: "bg-verified/15 decoration-verified", Icon: CheckCircle2 },
  unverifiable: { label: "Check by hand", text: "text-unverifiable", bg: "bg-unverifiable/10", ring: "ring-unverifiable/30", mark: "bg-unverifiable/15 decoration-unverifiable", Icon: HelpCircle },
};

export const STATUS_ORDER: Status[] = ["error", "warning", "unverifiable", "verified"];

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-medium ring-1", s.text, s.bg, s.ring, className)}>
      <s.Icon className="h-3.5 w-3.5" aria-hidden />
      {s.label}
    </span>
  );
}
