"use client";

import { useEffect } from "react";
import { Download, Loader2, X, AlertCircle } from "lucide-react";
import type { Expense } from "@/types/expense";
import { useExportBuilder } from "@/hooks/use-export-builder";
import { useToast } from "@/context/toast-context";
import { FormatSelector } from "@/components/export/format-selector";
import { CategoryFilterList } from "@/components/export/category-filter-list";
import { ExportPreviewTable } from "@/components/export/export-preview-table";
import { formatCurrency } from "@/lib/format";
import { buildFilename } from "@/lib/export/filename";

interface ExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export function ExportDrawer({ isOpen, onClose, expenses }: ExportDrawerProps) {
  const { showToast } = useToast();
  const {
    format,
    setFormat,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    categories,
    toggleCategory,
    clearCategories,
    filename,
    setFilename,
    status,
    errorMessage,
    matchedExpenses,
    totalAmount,
    handleExport,
    reset,
  } = useExportBuilder(expenses);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const isExporting = status === "exporting";

  async function onExportClick() {
    const succeeded = await handleExport();
    if (succeeded) {
      showToast(
        `Exported ${matchedExpenses.length} expense${matchedExpenses.length === 1 ? "" : "s"} as ${format.toUpperCase()}.`
      );
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={isExporting ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export data"
        className="drawer-enter relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Export data</h2>
            <p className="text-xs text-slate-500">Choose a format, filter the range, then export.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
            aria-label="Close export panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Format
            </h3>
            <FormatSelector value={format} onChange={setFormat} />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Start date</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">End date</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                />
              </label>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Categories
            </h3>
            <CategoryFilterList
              selected={categories}
              onToggle={toggleCategory}
              onClear={clearCategories}
            />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Filename
            </h3>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="expenses-export"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Saved as {buildFilename(filename, format)}
            </p>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preview
              </h3>
              <span className="text-xs text-slate-500">
                {matchedExpenses.length} {matchedExpenses.length === 1 ? "record" : "records"} ·{" "}
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <ExportPreviewTable expenses={matchedExpenses} />
          </section>

          {status === "error" && errorMessage && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onExportClick}
              disabled={isExporting || matchedExpenses.length === 0}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {matchedExpenses.length > 0 ? `(${matchedExpenses.length})` : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
