import type { Expense } from "@/types/expense";
import type { ExportFilters } from "@/types/export";

interface JsonExportPayload {
  generatedAt: string;
  recordCount: number;
  totalAmount: number;
  filters: ExportFilters;
  expenses: Expense[];
}

export function buildJson(expenses: Expense[], filters: ExportFilters): string {
  const payload: JsonExportPayload = {
    generatedAt: new Date().toISOString(),
    recordCount: expenses.length,
    totalAmount: Number(expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)),
    filters,
    expenses,
  };
  return JSON.stringify(payload, null, 2);
}

export function buildJsonBlob(expenses: Expense[], filters: ExportFilters): Blob {
  return new Blob([buildJson(expenses, filters)], { type: "application/json;charset=utf-8;" });
}
