import type { Expense } from "@/types/expense";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function buildSampleExpenses(): Expense[] {
  const entries: Array<[number, number, Expense["category"], string]> = [
    [1, 42.5, "Food", "Grocery run at Woolworths"],
    [2, 18.9, "Transportation", "Uber to office"],
    [3, 15.0, "Entertainment", "Movie tickets"],
    [5, 89.99, "Shopping", "New running shoes"],
    [6, 120.0, "Bills", "Electricity bill"],
    [8, 9.5, "Food", "Coffee and pastry"],
    [10, 55.2, "Food", "Dinner with friends"],
    [12, 32.0, "Transportation", "Fuel top-up"],
    [15, 14.99, "Entertainment", "Streaming subscription"],
    [18, 65.0, "Shopping", "Books and stationery"],
    [21, 200.0, "Bills", "Internet & phone plan"],
    [24, 27.4, "Food", "Weekly groceries"],
    [28, 11.0, "Transportation", "Parking fees"],
    [33, 45.0, "Entertainment", "Concert tickets"],
    [40, 75.0, "Shopping", "Winter jacket"],
    [47, 130.0, "Bills", "Water & gas"],
    [52, 22.3, "Food", "Takeout dinner"],
    [58, 6.5, "Other", "Charity donation"],
  ];

  return entries.map(([daysAgo, amount, category, description], index) => ({
    id: `sample-${index}-${daysAgo}`,
    date: isoDaysAgo(daysAgo),
    amount,
    category,
    description,
    createdAt: new Date().toISOString(),
  }));
}
