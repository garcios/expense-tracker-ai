import type { CloudExportState, ServiceId } from "@/types/cloud-export";

const STORAGE_KEY = "expense-tracker:cloud-export:v1";
const SERVICE_IDS: ServiceId[] = ["google-sheets", "dropbox", "onedrive"];

function emptyState(): CloudExportState {
  return {
    services: {
      "google-sheets": { id: "google-sheets", connected: false, connectedAt: null, lastSyncAt: null },
      dropbox: { id: "dropbox", connected: false, connectedAt: null, lastSyncAt: null },
      onedrive: { id: "onedrive", connected: false, connectedAt: null, lastSyncAt: null },
    },
    history: [],
    schedules: [],
  };
}

export function loadCloudExportState(): CloudExportState {
  if (typeof window === "undefined") return emptyState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    const fallback = emptyState();
    return {
      services: SERVICE_IDS.reduce(
        (acc, id) => ({ ...acc, [id]: parsed?.services?.[id] ?? fallback.services[id] }),
        {} as CloudExportState["services"]
      ),
      history: Array.isArray(parsed?.history) ? parsed.history : [],
      schedules: Array.isArray(parsed?.schedules) ? parsed.schedules : [],
    };
  } catch (error) {
    console.error("Failed to load cloud export state from localStorage", error);
    return emptyState();
  }
}

export function saveCloudExportState(state: CloudExportState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save cloud export state to localStorage", error);
  }
}
