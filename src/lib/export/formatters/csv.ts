import type { Expense } from "@/types/expense";
import { formatDate } from "@/lib/format";

const COLUMNS = ["Date", "Category", "Description", "Amount"] as const;

function escapeCsvField(field: string): string {
  if (/[",\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function buildCsv(expenses: Expense[]): string {
  const rows = expenses.map((expense) => [
    formatDate(expense.date),
    expense.category,
    expense.description,
    expense.amount.toFixed(2),
  ]);

  return [COLUMNS, ...rows]
    .map((row) => row.map((field) => escapeCsvField(String(field))).join(","))
    .join("\n");
}

export function buildCsvBlob(expenses: Expense[]): Blob {
  return new Blob([buildCsv(expenses)], { type: "text/csv;charset=utf-8;" });
}
