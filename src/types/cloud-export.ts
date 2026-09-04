export const EXPORT_TEMPLATE_IDS = ["tax-report", "monthly-summary", "category-analysis", "full-export"] as const;
export type ExportTemplateId = (typeof EXPORT_TEMPLATE_IDS)[number];

export interface ExportTemplate {
  id: ExportTemplateId;
  name: string;
  description: string;
  bestFor: string;
}

export const EXPORT_TEMPLATES: Record<ExportTemplateId, ExportTemplate> = {
  "tax-report": {
    id: "tax-report",
    name: "Tax Report",
    description: "Deductible categories grouped by quarter with running totals.",
    bestFor: "Accountants & year-end filing",
  },
  "monthly-summary": {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "A clean month-by-month rollup of spending and top categories.",
    bestFor: "Budget check-ins",
  },
  "category-analysis": {
    id: "category-analysis",
    name: "Category Analysis",
    description: "Deep breakdown of spending patterns within each category.",
    bestFor: "Spotting trends",
  },
  "full-export": {
    id: "full-export",
    name: "Full Export",
    description: "Every expense, every field, no aggregation.",
    bestFor: "Backups & raw data",
  },
};

export const DESTINATION_IDS = ["download", "email", "google-sheets", "dropbox", "onedrive"] as const;
export type DestinationId = (typeof DESTINATION_IDS)[number];

export interface DestinationMeta {
  id: DestinationId;
  name: string;
  description: string;
  requiresConnection: boolean;
}

export const DESTINATIONS: Record<DestinationId, DestinationMeta> = {
  download: {
    id: "download",
    name: "Download",
    description: "Save directly to this device.",
    requiresConnection: false,
  },
  email: {
    id: "email",
    name: "Email",
    description: "Send as an attachment to any address.",
    requiresConnection: false,
  },
  "google-sheets": {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Push into a live, auto-updating spreadsheet.",
    requiresConnection: true,
  },
  dropbox: {
    id: "dropbox",
    name: "Dropbox",
    description: "Sync a copy into your Dropbox folder.",
    requiresConnection: true,
  },
  onedrive: {
    id: "onedrive",
    name: "OneDrive",
    description: "Sync a copy into your OneDrive folder.",
    requiresConnection: true,
  },
};

export type ServiceId = Extract<DestinationId, "google-sheets" | "dropbox" | "onedrive">;

export interface CloudService {
  id: ServiceId;
  connected: boolean;
  connectedAt: string | null;
  lastSyncAt: string | null;
}

export type ExportStatus = "processing" | "completed" | "failed";

export interface ShareLink {
  id: string;
  url: string;
  access: "view" | "edit";
  createdAt: string;
  expiresAt: string | null;
  revoked: boolean;
}

export interface ExportHistoryEntry {
  id: string;
  templateId: ExportTemplateId;
  destinationId: DestinationId;
  status: ExportStatus;
  createdAt: string;
  completedAt: string | null;
  expenseCount: number;
  fileSizeKb: number | null;
  errorMessage: string | null;
  shareLink: ShareLink | null;
}

export type ScheduleFrequency = "daily" | "weekly" | "monthly";

export interface ScheduledExport {
  id: string;
  templateId: ExportTemplateId;
  destinationId: DestinationId;
  frequency: ScheduleFrequency;
  dayOfWeek: number | null; // 0-6, used when frequency === "weekly"
  dayOfMonth: number | null; // 1-28, used when frequency === "monthly"
  time: string; // "HH:MM"
  enabled: boolean;
  createdAt: string;
  nextRunAt: string;
}

export interface CloudExportState {
  services: Record<ServiceId, CloudService>;
  history: ExportHistoryEntry[];
  schedules: ScheduledExport[];
}
