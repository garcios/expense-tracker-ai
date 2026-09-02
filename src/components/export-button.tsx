"use client";

import { Download } from "lucide-react";
import type { Expense } from "@/types/expense";
import { downloadExpensesCsv } from "@/lib/csv";
import { useToast } from "@/context/toast-context";

interface ExportButtonProps {
  expenses: Expense[];
}

export function ExportButton({ expenses }: ExportButtonProps) {
  const { showToast } = useToast();

  function handleExport() {
    if (expenses.length === 0) {
      showToast("There are no expenses to export.", "error");
      return;
    }
    downloadExpensesCsv(expenses);
    showToast(`Exported ${expenses.length} expense${expenses.length === 1 ? "" : "s"} to CSV.`);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
