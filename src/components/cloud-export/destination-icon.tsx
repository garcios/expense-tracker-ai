import { Box, CloudCog, Download, Mail, Sheet, type LucideIcon } from "lucide-react";
import type { DestinationId } from "@/types/cloud-export";

export const DESTINATION_ICONS: Record<DestinationId, LucideIcon> = {
  download: Download,
  email: Mail,
  "google-sheets": Sheet,
  dropbox: Box,
  onedrive: CloudCog,
};

export const DESTINATION_ACCENTS: Record<DestinationId, string> = {
  download: "bg-slate-100 text-slate-600",
  email: "bg-blue-50 text-blue-600",
  "google-sheets": "bg-emerald-50 text-emerald-600",
  dropbox: "bg-indigo-50 text-indigo-600",
  onedrive: "bg-sky-50 text-sky-600",
};

export function DestinationIcon({ id, className = "h-4 w-4" }: { id: DestinationId; className?: string }) {
  const Icon = DESTINATION_ICONS[id];
  return <Icon className={className} />;
}
