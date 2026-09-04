import type { Expense } from "@/types/expense";
import type { ExportFilters } from "@/types/export";

export function filterExpensesForExport(
  expenses: Expense[],
  filters: ExportFilters
): Expense[] {
  const { startDate, endDate, categories } = filters;
  const categorySet = categories.length > 0 ? new Set(categories) : null;

  return expenses
    .filter((expense) => {
      if (startDate && expense.date < startDate) return false;
      if (endDate && expense.date > endDate) return false;
      if (categorySet && !categorySet.has(expense.category)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}
