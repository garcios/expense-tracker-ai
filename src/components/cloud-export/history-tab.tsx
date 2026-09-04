"use client";

import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { DESTINATIONS, EXPORT_TEMPLATES } from "@/types/cloud-export";
import { useCloudExport } from "@/context/cloud-export-context";
import { DestinationIcon, DESTINATION_ACCENTS } from "./destination-icon";
import { StatusPill } from "./status-pill";
import { ShareLinkCard } from "./share-link-card";
import { EmptyState } from "@/components/empty-state";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HistoryTab() {
  const { state } = useCloudExport();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (state.history.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No exports yet"
        description="Run an export from the Export tab and it will show up here with its status and share link."
      />
    );
  }

  return (
    <div className="space-y-2">
      {state.history.map((entry) => {
        const isExpanded = expandedId === entry.id;
        return (
          <div key={entry.id} className="rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              className="flex w-full items-center justify-between gap-3 p-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${DESTINATION_ACCENTS[entry.destinationId]}`}
                >
                  <DestinationIcon id={entry.destinationId} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {EXPORT_TEMPLATES[entry.templateId].name} &rarr; {DESTINATIONS[entry.destinationId].name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTimestamp(entry.createdAt)} &middot; {entry.expenseCount} expenses
                    {entry.fileSizeKb ? ` · ${entry.fileSizeKb} KB` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={entry.status} />
                {entry.status === "completed" && (
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isExpanded ? "rotate-180" : ""}`} />
                )}
              </div>
            </button>

            {isExpanded && entry.status === "completed" && (
              <div className="border-t border-slate-100 p-3">
                <ShareLinkCard entry={entry} />
              </div>
            )}
            {isExpanded && entry.status === "failed" && (
              <div className="border-t border-slate-100 p-3">
                <p className="text-xs text-rose-600">{entry.errorMessage}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
