"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES, type Category, type Expense, type ExpenseInput } from "@/types/expense";
import { todayISO } from "@/lib/format";

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSubmit: (input: ExpenseInput) => void;
  onCancel: () => void;
}

interface FormErrors {
  date?: string;
  amount?: string;
  category?: string;
  description?: string;
}

export function ExpenseForm({ initialExpense, onSubmit, onCancel }: ExpenseFormProps) {
  const [date, setDate] = useState(initialExpense?.date ?? todayISO());
  const [amount, setAmount] = useState(initialExpense?.amount.toString() ?? "");
  const [category, setCategory] = useState<Category>(initialExpense?.category ?? "Food");
  const [description, setDescription] = useState(initialExpense?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const parsedAmount = Number(amount);

    if (!date) {
      nextErrors.date = "Date is required.";
    } else if (date > todayISO()) {
      nextErrors.date = "Date cannot be in the future.";
    }

    if (!amount.trim()) {
      nextErrors.amount = "Amount is required.";
    } else if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Enter a valid amount greater than 0.";
    } else if (parsedAmount > 1_000_000) {
      nextErrors.amount = "Amount seems too large.";
    }

    if (!category) {
      nextErrors.category = "Category is required.";
    }

    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (description.trim().length > 120) {
      nextErrors.description = "Keep the description under 120 characters.";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      date,
      amount: Number(amount),
      category,
      description: description.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expense-date" className="mb-1 block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500/40 ${
              errors.date ? "border-rose-400" : "border-slate-300 focus:border-indigo-500"
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="expense-amount" className="mb-1 block text-sm font-medium text-slate-700">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full rounded-lg border py-2 pl-6 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500/40 ${
                errors.amount ? "border-rose-400" : "border-slate-300 focus:border-indigo-500"
              }`}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="expense-category" className="mb-1 block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="expense-description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <input
          id="expense-description"
          type="text"
          placeholder="e.g. Grocery shopping at Woolworths"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500/40 ${
            errors.description ? "border-rose-400" : "border-slate-300 focus:border-indigo-500"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          {initialExpense ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
