"use client";

import { useMemo, useState } from "react";
import { FileText, Layers, Receipt, TrendingUp } from "lucide-react";
import type { DestinationId, ExportTemplateId } from "@/types/cloud-export";
import { DESTINATIONS, DESTINATION_IDS, EXPORT_TEMPLATES, EXPORT_TEMPLATE_IDS } from "@/types/cloud-export";
import { useCloudExport } from "@/context/cloud-export-context";
import { useToast } from "@/context/toast-context";
import { downloadExpensesCsv } from "@/lib/csv";
import type { Expense } from "@/types/expense";
import { DestinationIcon, DESTINATION_ACCENTS } from "./destination-icon";
import { StatusPill } from "./status-pill";
import { ShareLinkCard } from "./share-link-card";

const TEMPLATE_ICONS: Record<ExportTemplateId, typeof FileText> = {
  "tax-report": Receipt,
  "monthly-summary": Layers,
  "category-analysis": TrendingUp,
  "full-export": FileText,
};

export function ExportTab({ expenses }: { expenses: Expense[] }) {
  const { state, runExport } = useCloudExport();
  const { showToast } = useToast();
  const [templateId, setTemplateId] = useState<ExportTemplateId>("monthly-summary");
  const [destinationId, setDestinationId] = useState<DestinationId>("download");
  const [isRunning, setIsRunning] = useState(false);
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);
  const lastEntry = useMemo(
    () => state.history.find((entry) => entry.id === lastEntryId) ?? null,
    [state.history, lastEntryId]
  );

  const destinationConnected =
    destinationId === "google-sheets" || destinationId === "dropbox" || destinationId === "onedrive"
      ? state.services[destinationId].connected
      : true;

  const estimatedSizeKb = useMemo(() => Math.max(4, Math.round(expenses.length * 0.6 + 10)), [expenses.length]);

  async function handleExport() {
    if (expenses.length === 0) {
      showToast("There are no expenses to export.", "error");
      return;
    }
    setIsRunning(true);
    setLastEntryId(null);
    try {
      const entry = await runExport({ templateId, destinationId, expenses });
      setLastEntryId(entry.id);
      if (entry.status === "completed") {
        if (destinationId === "download") {
          downloadExpensesCsv(expenses);
        }
        showToast(`${EXPORT_TEMPLATES[templateId].name} sent to ${DESTINATIONS[destinationId].name}.`);
      } else {
        showToast(entry.errorMessage ?? "Export failed.", "error");
      }
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Choose a template</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EXPORT_TEMPLATE_IDS.map((id) => {
            const template = EXPORT_TEMPLATES[id];
            const Icon = TEMPLATE_ICONS[id];
            const isSelected = templateId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTemplateId(id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-slate-900">{template.name}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{template.description}</span>
                  <span className="mt-1 block text-[11px] font-medium uppercase tracking-wide text-indigo-500">
                    {template.bestFor}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Send to</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {DESTINATION_IDS.map((id) => {
            const destination = DESTINATIONS[id];
            const isSelected = destinationId === id;
            const connected =
              id === "google-sheets" || id === "dropbox" || id === "onedrive" ? state.services[id].connected : true;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setDestinationId(id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${DESTINATION_ACCENTS[id]}`}>
                  <DestinationIcon id={id} />
                </span>
                <span className="text-xs font-medium text-slate-900">{destination.name}</span>
                {destination.requiresConnection && (
                  <span className={`text-[10px] ${connected ? "text-emerald-600" : "text-slate-400"}`}>
                    {connected ? "Connected" : "Not connected"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {!destinationConnected && (
          <p className="mt-2 text-xs text-amber-600">
            Connect {DESTINATIONS[destinationId].name} in the Integrations tab before exporting here.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{expenses.length}</span> expenses &middot; est.{" "}
          <span className="font-semibold text-slate-700">{estimatedSizeKb} KB</span>
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? "Exporting…" : "Export now"}
        </button>
      </div>

      {lastEntry && (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">
              {EXPORT_TEMPLATES[lastEntry.templateId].name} &rarr; {DESTINATIONS[lastEntry.destinationId].name}
            </p>
            <StatusPill status={lastEntry.status} />
          </div>
          {lastEntry.status === "completed" && <ShareLinkCard entry={lastEntry} />}
          {lastEntry.status === "failed" && <p className="text-xs text-rose-600">{lastEntry.errorMessage}</p>}
        </div>
      )}
    </div>
  );
}
