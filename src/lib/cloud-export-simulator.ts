import type {
  DestinationId,
  ExportHistoryEntry,
  ExportTemplateId,
  ScheduleFrequency,
  ShareLink,
} from "@/types/cloud-export";
import { EXPORT_TEMPLATES } from "@/types/cloud-export";
import type { Expense } from "@/types/expense";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(length = 10): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Simulates an OAuth-style connect flow (redirect + consent + token exchange). */
export async function simulateConnectService(): Promise<{ connectedAt: string }> {
  await delay(1400);
  return { connectedAt: new Date().toISOString() };
}

export async function simulateSync(): Promise<{ syncedAt: string }> {
  await delay(700);
  return { syncedAt: new Date().toISOString() };
}

interface RunExportInput {
  templateId: ExportTemplateId;
  destinationId: DestinationId;
  expenses: Expense[];
  destinationConnected: boolean;
}

/** Simulates a background export job: builds the file, "uploads"/"sends" it, and reports back. */
export async function simulateRunExport(input: RunExportInput): Promise<ExportHistoryEntry> {
  const { templateId, destinationId, expenses, destinationConnected } = input;
  const id = generateId();
  const createdAt = new Date().toISOString();

  const processingMs = 900 + Math.min(expenses.length, 40) * 25;
  await delay(processingMs);

  if (DESTINATION_REQUIRES_CONNECTION.has(destinationId) && !destinationConnected) {
    return {
      id,
      templateId,
      destinationId,
      status: "failed",
      createdAt,
      completedAt: new Date().toISOString(),
      expenseCount: expenses.length,
      fileSizeKb: null,
      errorMessage: `Not connected to ${DESTINATION_LABEL[destinationId]}. Connect it in the Integrations tab and try again.`,
      shareLink: null,
    };
  }

  const templateOverheadKb: Record<ExportTemplateId, number> = {
    "tax-report": 18,
    "monthly-summary": 9,
    "category-analysis": 12,
    "full-export": 4,
  };
  const fileSizeKb = Math.max(4, Math.round(expenses.length * 0.6 + templateOverheadKb[templateId]));

  return {
    id,
    templateId,
    destinationId,
    status: "completed",
    createdAt,
    completedAt: new Date().toISOString(),
    expenseCount: expenses.length,
    fileSizeKb,
    errorMessage: null,
    shareLink: null,
  };
}

const DESTINATION_REQUIRES_CONNECTION = new Set<DestinationId>(["google-sheets", "dropbox", "onedrive"]);
const DESTINATION_LABEL: Record<DestinationId, string> = {
  download: "Download",
  email: "Email",
  "google-sheets": "Google Sheets",
  dropbox: "Dropbox",
  onedrive: "OneDrive",
};

interface GenerateShareLinkInput {
  entryId: string;
  templateId: ExportTemplateId;
  access: ShareLink["access"];
  expiresInDays: number | null;
}

export async function simulateGenerateShareLink(input: GenerateShareLinkInput): Promise<ShareLink> {
  await delay(600);
  const slug = `${input.templateId}-${randomId(8)}`;
  const createdAt = new Date();
  const expiresAt =
    input.expiresInDays === null
      ? null
      : new Date(createdAt.getTime() + input.expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: generateId(),
    url: `https://share.expensetracker.app/x/${slug}`,
    access: input.access,
    createdAt: createdAt.toISOString(),
    expiresAt,
    revoked: false,
  };
}

export function computeNextRun(
  frequency: ScheduleFrequency,
  time: string,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  from: Date = new Date()
): string {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(from);
  next.setSeconds(0, 0);
  next.setHours(hours ?? 9, minutes ?? 0);

  if (frequency === "daily") {
    if (next <= from) next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  if (frequency === "weekly") {
    const target = dayOfWeek ?? 1;
    while (next.getDay() !== target || next <= from) {
      next.setDate(next.getDate() + 1);
    }
    return next.toISOString();
  }

  // monthly
  const target = Math.min(dayOfMonth ?? 1, 28);
  next.setDate(target);
  if (next <= from) {
    next.setMonth(next.getMonth() + 1);
    next.setDate(target);
  }
  return next.toISOString();
}

export function templateLabel(id: ExportTemplateId): string {
  return EXPORT_TEMPLATES[id].name;
}
