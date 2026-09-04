"use client";

import { useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import type { DestinationId, ExportTemplateId, ScheduleFrequency } from "@/types/cloud-export";
import { DESTINATIONS, DESTINATION_IDS, EXPORT_TEMPLATES, EXPORT_TEMPLATE_IDS } from "@/types/cloud-export";
import { useCloudExport } from "@/context/cloud-export-context";
import { useToast } from "@/context/toast-context";
import { DestinationIcon, DESTINATION_ACCENTS } from "./destination-icon";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function describeSchedule(
  frequency: ScheduleFrequency,
  time: string,
  dayOfWeek: number | null,
  dayOfMonth: number | null
): string {
  if (frequency === "daily") return `Every day at ${time}`;
  if (frequency === "weekly") return `Every ${WEEKDAYS[dayOfWeek ?? 1]} at ${time}`;
  return `Day ${dayOfMonth ?? 1} of every month at ${time}`;
}

function formatNextRun(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ScheduleTab() {
  const { state, createSchedule, toggleSchedule, deleteSchedule } = useCloudExport();
  const { showToast } = useToast();

  const [templateId, setTemplateId] = useState<ExportTemplateId>("monthly-summary");
  const [destinationId, setDestinationId] = useState<DestinationId>("email");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("weekly");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [time, setTime] = useState("09:00");

  function handleCreate() {
    createSchedule({
      templateId,
      destinationId,
      frequency,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : null,
      time,
    });
    showToast("Recurring export scheduled.");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">New recurring export</h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-600">
            Template
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as ExportTemplateId)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            >
              {EXPORT_TEMPLATE_IDS.map((id) => (
                <option key={id} value={id}>
                  {EXPORT_TEMPLATES[id].name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-600">
            Destination
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value as DestinationId)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            >
              {DESTINATION_IDS.map((id) => (
                <option key={id} value={id}>
                  {DESTINATIONS[id].name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-600">
            Frequency
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            >
              {(Object.keys(FREQUENCY_LABELS) as ScheduleFrequency[]).map((freq) => (
                <option key={freq} value={freq}>
                  {FREQUENCY_LABELS[freq]}
                </option>
              ))}
            </select>
          </label>

          {frequency === "weekly" && (
            <label className="text-xs font-medium text-slate-600">
              Day of week
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              >
                {WEEKDAYS.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          )}

          {frequency === "monthly" && (
            <label className="text-xs font-medium text-slate-600">
              Day of month
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="text-xs font-medium text-slate-600">
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add schedule
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Active schedules</h3>
        {state.schedules.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No recurring exports set up yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {state.schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${DESTINATION_ACCENTS[schedule.destinationId]}`}
                  >
                    <DestinationIcon id={schedule.destinationId} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {EXPORT_TEMPLATES[schedule.templateId].name} &rarr; {DESTINATIONS[schedule.destinationId].name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {describeSchedule(schedule.frequency, schedule.time, schedule.dayOfWeek, schedule.dayOfMonth)}
                    </p>
                    {schedule.enabled && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-indigo-600">
                        <CalendarClock className="h-3 w-3" />
                        Next: {formatNextRun(schedule.nextRunAt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      schedule.enabled
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                        : "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200"
                    }`}
                  >
                    {schedule.enabled ? "Enabled" : "Paused"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSchedule(schedule.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete schedule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
