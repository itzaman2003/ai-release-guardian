import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types";

const severityClasses: Record<Severity, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-red-200 bg-red-50 text-red-700",
  critical: "border-rose-300 bg-rose-100 text-rose-800",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold capitalize", severityClasses[severity])}>
      {severity}
    </span>
  );
}
