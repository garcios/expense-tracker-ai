"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Expense, ExpenseInput } from "@/types/expense";
import { loadExpenses, saveExpenses } from "@/lib/storage";
import { buildSampleExpenses } from "@/lib/sample-data";

interface ExpenseContextValue {
  expenses: Expense[];
  isLoaded: boolean;
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
  loadSampleData: () => void;
  clearAllExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
    hasLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveExpenses(expenses);
  }, [expenses]);

  const addExpense = useCallback((input: ExpenseInput) => {
    const expense: Expense = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...input } : e))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const loadSampleData = useCallback(() => {
    setExpenses(buildSampleExpenses());
  }, []);

  const clearAllExpenses = useCallback(() => {
    setExpenses([]);
  }, []);

  const value = useMemo(
    () => ({
      expenses,
      isLoaded,
      addExpense,
      updateExpense,
      deleteExpense,
      loadSampleData,
      clearAllExpenses,
    }),
    [expenses, isLoaded, addExpense, updateExpense, deleteExpense, loadSampleData, clearAllExpenses]
  );

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export function useExpenses(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpenseProvider");
  return ctx;
}
