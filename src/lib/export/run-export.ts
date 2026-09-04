import type { Expense } from "@/types/expense";
import type { ExportOptions } from "@/types/export";
import { filterExpensesForExport } from "@/lib/export/filter";
import { buildFilename } from "@/lib/export/filename";
import { downloadBlob } from "@/lib/export/download";
import { buildCsvBlob } from "@/lib/export/formatters/csv";
import { buildJsonBlob } from "@/lib/export/formatters/json";
import { buildPdfBlob } from "@/lib/export/formatters/pdf";

export interface ExportResult {
  recordCount: number;
  filename: string;
}

export async function runExport(expenses: Expense[], options: ExportOptions): Promise<ExportResult> {
  const matched = filterExpensesForExport(expenses, options);
  const filename = buildFilename(options.filename, options.format);

  let blob: Blob;
  switch (options.format) {
    case "csv":
      blob = buildCsvBlob(matched);
      break;
    case "json":
      blob = buildJsonBlob(matched, options);
      break;
    case "pdf":
      blob = await buildPdfBlob(matched, options);
      break;
  }

  downloadBlob(blob, filename);

  return { recordCount: matched.length, filename };
}
