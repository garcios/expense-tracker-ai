"use client";

import { useState } from "react";
import { CloudUpload } from "lucide-react";
import type { Expense } from "@/types/expense";
import { ExportHubPanel } from "./export-hub-panel";

export function CloudExportLauncher({ expenses }: { expenses: Expense[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <CloudUpload className="h-4 w-4" />
        Export &amp; Share
      </button>
      <ExportHubPanel isOpen={isOpen} onClose={() => setIsOpen(false)} expenses={expenses} />
    </>
  );
}
