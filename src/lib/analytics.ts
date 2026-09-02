import type { Category, Expense } from "@/types/expense";
import { CATEGORIES } from "@/types/expense";
import { formatMonthLabel } from "@/lib/format";

export function totalSpending(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function currentMonthSpending(expenses: Expense[]): number {
  const now = new Date();
  return monthSpending(expenses, now.getFullYear(), now.getMonth());
}

export function monthSpending(
  expenses: Expense[],
  year: number,
  monthIndex: number
): number {
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export interface CategoryTotal {
  category: Category;
  total: number;
  percentage: number;
}

export function spendingByCategory(expenses: Expense[]): CategoryTotal[] {
  const total = totalSpending(expenses);
  const totals = CATEGORIES.map((category) => {
    const categoryTotal = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      category,
      total: categoryTotal,
      percentage: total > 0 ? (categoryTotal / total) * 100 : 0,
    };
  });
  return totals
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function topCategory(expenses: Expense[]): CategoryTotal | null {
  const byCategory = spendingByCategory(expenses);
  return byCategory.length > 0 ? byCategory[0] : null;
}

export interface MonthlyTrendPoint {
  label: string;
  total: number;
}

export function monthlyTrend(
  expenses: Expense[],
  monthsBack = 6
): MonthlyTrendPoint[] {
  const now = new Date();
  const points: MonthlyTrendPoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const total = monthSpending(expenses, d.getFullYear(), d.getMonth());
    points.push({ label: formatMonthLabel(d.getFullYear(), d.getMonth()), total });
  }

  return points;
}

export function averageDailySpending(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const dates = expenses.map((e) => new Date(e.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dayCount = Math.max(
    1,
    Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1
  );
  return totalSpending(expenses) / dayCount;
}
