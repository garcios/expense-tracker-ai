import { useMemo, useState } from "react";
import type { Expense } from "@/types/expense";
import type { Category } from "@/types/expense";
import type { ExportFormat, ExportOptions } from "@/types/export";
import { filterExpensesForExport } from "@/lib/export/filter";
import { defaultExportFilename } from "@/lib/export/filename";
import { runExport } from "@/lib/export/run-export";

export type ExportStatus = "idle" | "exporting" | "success" | "error";

export function useExportBuilder(expenses: Expense[]) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filename, setFilename] = useState(() => defaultExportFilename());
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const matchedExpenses = useMemo(
    () => filterExpensesForExport(expenses, { startDate, endDate, categories }),
    [expenses, startDate, endDate, categories]
  );

  const totalAmount = useMemo(
    () => matchedExpenses.reduce((sum, e) => sum + e.amount, 0),
    [matchedExpenses]
  );

  function toggleCategory(category: Category) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  function clearCategories() {
    setCategories([]);
  }

  function reset() {
    setFormat("csv");
    setStartDate("");
    setEndDate("");
    setCategories([]);
    setFilename(defaultExportFilename());
    setStatus("idle");
    setErrorMessage(null);
  }

  async function handleExport(): Promise<boolean> {
    if (matchedExpenses.length === 0) {
      setStatus("error");
      setErrorMessage("No expenses match these filters — adjust them and try again.");
      return false;
    }

    setStatus("exporting");
    setErrorMessage(null);

    const options: ExportOptions = { format, startDate, endDate, categories, filename };

    try {
      await runExport(expenses, options);
      setStatus("success");
      return true;
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Export failed. Please try again.");
      return false;
    }
  }

  return {
    format,
    setFormat,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    categories,
    toggleCategory,
    clearCategories,
    filename,
    setFilename,
    status,
    errorMessage,
    matchedExpenses,
    totalAmount,
    handleExport,
    reset,
  };
}
