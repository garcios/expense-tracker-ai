"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CloudUpload, History, Plug, X } from "lucide-react";
import type { Expense } from "@/types/expense";
import { ExportTab } from "./export-tab";
import { ScheduleTab } from "./schedule-tab";
import { IntegrationsTab } from "./integrations-tab";
import { HistoryTab } from "./history-tab";

type TabId = "export" | "schedule" | "integrations" | "history";

const TABS: { id: TabId; label: string; icon: typeof CloudUpload }[] = [
  { id: "export", label: "Export", icon: CloudUpload },
  { id: "schedule", label: "Schedule", icon: CalendarClock },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "history", label: "History", icon: History },
];

interface ExportHubPanelProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export function ExportHubPanel({ isOpen, onClose, expenses }: ExportHubPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("export");

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Export & Share Hub"
        className="drawer-enter relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <CloudUpload className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Export &amp; Share Hub</h2>
              <p className="text-xs text-slate-500">Send data anywhere, on your schedule.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close export hub"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-200 px-4 pt-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "export" && <ExportTab expenses={expenses} />}
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "history" && <HistoryTab />}
        </div>
      </div>
    </div>
  );
}
