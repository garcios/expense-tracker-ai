"use client";

import type { Expense } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

const PREVIEW_LIMIT = 6;

function formatCompactDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  if (!month || !day) return isoDate;
  return `${month}/${day}`;
}

interface ExportPreviewTableProps {
  expenses: Expense[];
}

export function ExportPreviewTable({ expenses }: ExportPreviewTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No expenses match the current filters.
      </div>
    );
  }

  const visible = expenses.slice(0, PREVIEW_LIMIT);
  const remaining = expenses.length - visible.length;

  return (
    <div className="rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs">
          <colgroup>
            <col className="w-[52px]" />
            <col className="w-[80px]" />
            <col />
            <col className="w-[68px]" />
          </colgroup>
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
            <tr>
              <th className="truncate px-2 py-2 font-medium">Date</th>
              <th className="truncate px-2 py-2 font-medium">Category</th>
              <th className="truncate px-2 py-2 font-medium">Description</th>
              <th className="truncate px-2 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((expense) => {
              const meta = CATEGORY_META[expense.category];
              return (
                <tr key={expense.id}>
                  <td className="truncate px-2 py-2 text-slate-600">
                    {formatCompactDate(expense.date)}
                  </td>
                  <td className="truncate px-2 py-2 text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dotClass}`} />
                      <span className="truncate">{expense.category}</span>
                    </span>
                  </td>
                  <td className="truncate px-2 py-2 text-slate-700">{expense.description}</td>
                  <td className="truncate px-2 py-2 text-right font-medium text-slate-900">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {remaining > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-center text-[11px] text-slate-500">
          + {remaining} more {remaining === 1 ? "row" : "rows"} not shown
        </div>
      )}
    </div>
  );
}
