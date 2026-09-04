import type { Category } from "@/types/expense";

export const EXPORT_FORMATS = ["csv", "json", "pdf"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export interface ExportFilters {
  startDate: string; // "" = no lower bound
  endDate: string; // "" = no upper bound
  categories: Category[]; // empty = all categories
}

export interface ExportOptions extends ExportFilters {
  format: ExportFormat;
  filename: string;
}
