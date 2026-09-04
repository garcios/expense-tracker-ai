"use client";

import { useMemo, useState } from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import { useExpenses } from "@/context/expense-context";
import { useToast } from "@/context/toast-context";
import { Modal } from "@/components/modal";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ExportTriggerButton } from "@/components/export/export-trigger-button";
import { FilterBar, type ExpenseFilters } from "@/components/filter-bar";
import { ExpenseRowSkeleton } from "@/components/skeletons";
import { formatCurrency } from "@/lib/format";
import { totalSpending } from "@/lib/analytics";
import type { Expense, ExpenseInput } from "@/types/expense";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "amount-desc": "Amount: high to low",
  "amount-asc": "Amount: low to high",
};

const EMPTY_FILTERS: ExpenseFilters = {
  search: "",
  category: "All",
  startDate: "",
  endDate: "",
};

export default function ExpensesPage() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("date-desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const result = expenses.filter((expense) => {
      if (search && !expense.description.toLowerCase().includes(search)) return false;
      if (filters.category !== "All" && expense.category !== filters.category) return false;
      if (filters.startDate && expense.date < filters.startDate) return false;
      if (filters.endDate && expense.date > filters.endDate) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "date-desc":
        default:
          return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      }
    });

    return result;
  }, [expenses, filters, sort]);

  const filteredTotal = useMemo(() => totalSpending(filteredExpenses), [filteredExpenses]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse, search, and manage every expense you&apos;ve logged.
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

      <FilterBar filters={filters} onChange={setFilters} resultCount={filteredExpenses.length} />

      {!isLoaded ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ExpenseRowSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-600">
              Total for filtered results:{" "}
              <span className="font-semibold text-slate-900">{formatCurrency(filteredTotal)}</span>
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ExpenseList
            expenses={filteredExpenses}
            hasAnyExpenses={expenses.length > 0}
            onEdit={openEditForm}
            onDelete={setPendingDelete}
          />
        </>
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
