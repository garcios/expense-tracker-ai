"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Wallet, CalendarDays, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useExpenses } from "@/context/expense-context";
import { useToast } from "@/context/toast-context";
import { StatCard } from "@/components/stat-card";
import { StatCardSkeleton, ChartSkeleton, ExpenseRowSkeleton } from "@/components/skeletons";
import { Modal } from "@/components/modal";
import { ExportTriggerButton } from "@/components/export/export-trigger-button";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseRow } from "@/components/expense-row";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { MonthlyBarChart } from "@/components/monthly-bar-chart";
import {
  averageDailySpending,
  currentMonthSpending,
  monthlyTrend,
  spendingByCategory,
  topCategory,
  totalSpending,
} from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import type { Expense, ExpenseInput } from "@/types/expense";

export default function DashboardPage() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense, loadSampleData } =
    useExpenses();
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const total = useMemo(() => totalSpending(expenses), [expenses]);
  const thisMonth = useMemo(() => currentMonthSpending(expenses), [expenses]);
  const categoryTotals = useMemo(() => spendingByCategory(expenses), [expenses]);
  const leadingCategory = useMemo(() => topCategory(expenses), [expenses]);
  const dailyAverage = useMemo(() => averageDailySpending(expenses), [expenses]);
  const trend = useMemo(() => monthlyTrend(expenses), [expenses]);
  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [expenses]
  );

  function openAddForm() {
    setEditingExpense(null);
    setIsFormOpen(true);
  }

  function openEditForm(expense: Expense) {
    setEditingExpense(expense);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingExpense(null);
  }

  function handleSubmit(input: ExpenseInput) {
    if (editingExpense) {
      updateExpense(editingExpense.id, input);
      showToast("Expense updated successfully.");
    } else {
      addExpense(input);
      showToast("Expense added successfully.");
    }
    closeForm();
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteExpense(pendingDelete.id);
    showToast("Expense deleted.", "info");
    setPendingDelete(null);
  }

  function handleLoadSampleData() {
    loadSampleData();
    showToast("Sample data loaded.");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            An overview of your spending activity and trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportTriggerButton expenses={expenses} />
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add expense
          </button>
        </div>
      </div>

      {!isLoaded ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Welcome to ExpenseTracker"
          description="You haven't added any expenses yet. Add your first expense, or load sample data to explore the dashboard."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={openAddForm}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add expense
              </button>
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Load sample data
              </button>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total spending"
              value={formatCurrency(total)}
              icon={Wallet}
              accent="bg-indigo-50 text-indigo-600"
              sublabel={`${expenses.length} total expenses`}
            />
            <StatCard
              label="This month"
              value={formatCurrency(thisMonth)}
              icon={CalendarDays}
              accent="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              label="Top category"
              value={leadingCategory ? leadingCategory.category : "—"}
              icon={TrendingUp}
              accent="bg-orange-50 text-orange-600"
              sublabel={leadingCategory ? formatCurrency(leadingCategory.total) : undefined}
            />
            <StatCard
              label="Daily average"
              value={formatCurrency(dailyAverage)}
              icon={Sparkles}
              accent="bg-purple-50 text-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
              <h2 className="text-sm font-semibold text-slate-900">Spending trend (6 months)</h2>
              <MonthlyBarChart data={trend} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900">Spending by category</h2>
              <div className="mt-2">
                <CategoryPieChart data={categoryTotals} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Recent expenses</h2>
              <Link
                href="/expenses"
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={openEditForm}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoaded && (
        <div className="space-y-4">
          <ChartSkeleton />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <ExpenseRowSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      <Modal
        title={editingExpense ? "Edit expense" : "Add expense"}
        isOpen={isFormOpen}
        onClose={closeForm}
      >
        <ExpenseForm initialExpense={editingExpense ?? undefined} onSubmit={handleSubmit} onCancel={closeForm} />
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete expense"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.description}"? This cannot be undone.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
