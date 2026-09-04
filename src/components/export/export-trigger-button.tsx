"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import type { Expense } from "@/types/expense";
import { ExportDrawer } from "@/components/export/export-drawer";

interface ExportTriggerButtonProps {
  expenses: Expense[];
}

export function ExportTriggerButton({ expenses }: ExportTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Export data
      </button>
      <ExportDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} expenses={expenses} />
    </>
  );
}
