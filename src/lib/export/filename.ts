import type { ExportFormat } from "@/types/export";

const EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  json: "json",
  pdf: "pdf",
};

export function defaultExportFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `expenses-export-${stamp}`;
}

export function sanitizeFilename(raw: string): string {
  const trimmed = raw.trim().replace(/[\\/:*?"<>|]+/g, "-");
  return trimmed.length > 0 ? trimmed : "expenses-export";
}

export function buildFilename(rawName: string, format: ExportFormat): string {
  const base = sanitizeFilename(rawName).replace(/\.(csv|json|pdf)$/i, "");
  return `${base}.${EXTENSIONS[format]}`;
}
