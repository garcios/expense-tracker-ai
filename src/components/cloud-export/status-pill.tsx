import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { ExportStatus } from "@/types/cloud-export";

const STYLES: Record<ExportStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    icon: Loader2,
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    icon: XCircle,
  },
};

export function StatusPill({ status }: { status: ExportStatus }) {
  const { label, className, icon: Icon } = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      <Icon className={`h-3.5 w-3.5 ${status === "processing" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}
