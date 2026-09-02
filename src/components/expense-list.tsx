"use client";

import type { Expense } from "@/types/expense";
import { ExpenseRow } from "@/components/expense-row";
import { EmptyState } from "@/components/empty-state";
import { SearchX } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  hasAnyExpenses: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseList({ expenses, hasAnyExpenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={hasAnyExpenses ? "No expenses match your filters" : "No expenses yet"}
        description={
          hasAnyExpenses
            ? "Try adjusting your search, category, or date range."
            : "Add your first expense to start tracking your spending."
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
