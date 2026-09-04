"use client";

import { FileSpreadsheet, FileJson, FileText, type LucideIcon } from "lucide-react";
import type { ExportFormat } from "@/types/export";

interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  icon: LucideIcon;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: "csv", label: "CSV", description: "Spreadsheet-friendly", icon: FileSpreadsheet },
  { value: "json", label: "JSON", description: "For developers & APIs", icon: FileJson },
  { value: "pdf", label: "PDF", description: "Formatted report", icon: FileText },
];

interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Export format">
      {FORMAT_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition ${
              isSelected
                ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Icon className={`h-5 w-5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
            <span
              className={`text-sm font-semibold ${isSelected ? "text-indigo-700" : "text-slate-700"}`}
            >
              {option.label}
            </span>
            <span className="text-[11px] leading-tight text-slate-500">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
