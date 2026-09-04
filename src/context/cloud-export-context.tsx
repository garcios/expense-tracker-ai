"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CloudExportState,
  DestinationId,
  ExportHistoryEntry,
  ExportTemplateId,
  ScheduleFrequency,
  ScheduledExport,
  ServiceId,
  ShareLink,
} from "@/types/cloud-export";
import { loadCloudExportState, saveCloudExportState } from "@/lib/cloud-export-storage";
import {
  computeNextRun,
  simulateConnectService,
  simulateGenerateShareLink,
  simulateRunExport,
  simulateSync,
} from "@/lib/cloud-export-simulator";
import type { Expense } from "@/types/expense";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface CloudExportContextValue {
  state: CloudExportState;
  isLoaded: boolean;
  connectService: (id: ServiceId) => Promise<void>;
  disconnectService: (id: ServiceId) => void;
  syncService: (id: ServiceId) => Promise<void>;
  runExport: (input: {
    templateId: ExportTemplateId;
    destinationId: DestinationId;
    expenses: Expense[];
  }) => Promise<ExportHistoryEntry>;
  generateShareLink: (input: {
    entryId: string;
    access: ShareLink["access"];
    expiresInDays: number | null;
  }) => Promise<void>;
  revokeShareLink: (entryId: string) => void;
  createSchedule: (input: {
    templateId: ExportTemplateId;
    destinationId: DestinationId;
    frequency: ScheduleFrequency;
    dayOfWeek: number | null;
    dayOfMonth: number | null;
    time: string;
  }) => void;
  toggleSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;
}

const CloudExportContext = createContext<CloudExportContextValue | null>(null);

export function CloudExportProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CloudExportState>(() => ({
    services: {
      "google-sheets": { id: "google-sheets", connected: false, connectedAt: null, lastSyncAt: null },
      dropbox: { id: "dropbox", connected: false, connectedAt: null, lastSyncAt: null },
      onedrive: { id: "onedrive", connected: false, connectedAt: null, lastSyncAt: null },
    },
    history: [],
    schedules: [],
  }));
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    setState(loadCloudExportState());
    setIsLoaded(true);
    hasLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    saveCloudExportState(state);
  }, [state]);

  const connectService = useCallback(async (id: ServiceId) => {
    const { connectedAt } = await simulateConnectService();
    setState((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [id]: { id, connected: true, connectedAt, lastSyncAt: connectedAt },
      },
    }));
  }, []);

  const disconnectService = useCallback((id: ServiceId) => {
    setState((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [id]: { id, connected: false, connectedAt: null, lastSyncAt: null },
      },
    }));
  }, []);

  const syncService = useCallback(async (id: ServiceId) => {
    const { syncedAt } = await simulateSync();
    setState((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [id]: { ...prev.services[id], lastSyncAt: syncedAt },
      },
    }));
  }, []);

  const runExport = useCallback(
    async ({
      templateId,
      destinationId,
      expenses,
    }: {
      templateId: ExportTemplateId;
      destinationId: DestinationId;
      expenses: Expense[];
    }) => {
      const isServiceDestination = destinationId in state.services;
      const destinationConnected = isServiceDestination
        ? state.services[destinationId as ServiceId].connected
        : true;

      const pendingId = generateId();
      const pendingEntry: ExportHistoryEntry = {
        id: pendingId,
        templateId,
        destinationId,
        status: "processing",
        createdAt: new Date().toISOString(),
        completedAt: null,
        expenseCount: expenses.length,
        fileSizeKb: null,
        errorMessage: null,
        shareLink: null,
      };
      setState((prev) => ({ ...prev, history: [pendingEntry, ...prev.history] }));

      const result = await simulateRunExport({ templateId, destinationId, expenses, destinationConnected });
      const finalEntry: ExportHistoryEntry = { ...result, id: pendingId };

      setState((prev) => ({
        ...prev,
        history: prev.history.map((entry) => (entry.id === pendingId ? finalEntry : entry)),
        services:
          isServiceDestination && result.status === "completed"
            ? {
                ...prev.services,
                [destinationId as ServiceId]: {
                  ...prev.services[destinationId as ServiceId],
                  lastSyncAt: finalEntry.completedAt ?? prev.services[destinationId as ServiceId].lastSyncAt,
                },
              }
            : prev.services,
      }));

      return finalEntry;
    },
    [state.services]
  );

  const generateShareLink = useCallback(
    async ({
      entryId,
      access,
      expiresInDays,
    }: {
      entryId: string;
      access: ShareLink["access"];
      expiresInDays: number | null;
    }) => {
      const entry = state.history.find((e) => e.id === entryId);
      if (!entry) return;
      const shareLink = await simulateGenerateShareLink({
        entryId,
        templateId: entry.templateId,
        access,
        expiresInDays,
      });
      setState((prev) => ({
        ...prev,
        history: prev.history.map((e) => (e.id === entryId ? { ...e, shareLink } : e)),
      }));
    },
    [state.history]
  );

  const revokeShareLink = useCallback((entryId: string) => {
    setState((prev) => ({
      ...prev,
      history: prev.history.map((e) =>
        e.id === entryId && e.shareLink ? { ...e, shareLink: { ...e.shareLink, revoked: true } } : e
      ),
    }));
  }, []);

  const createSchedule = useCallback(
    ({
      templateId,
      destinationId,
      frequency,
      dayOfWeek,
      dayOfMonth,
      time,
    }: {
      templateId: ExportTemplateId;
      destinationId: DestinationId;
      frequency: ScheduleFrequency;
      dayOfWeek: number | null;
      dayOfMonth: number | null;
      time: string;
    }) => {
      const schedule: ScheduledExport = {
        id: generateId(),
        templateId,
        destinationId,
        frequency,
        dayOfWeek,
        dayOfMonth,
        time,
        enabled: true,
        createdAt: new Date().toISOString(),
        nextRunAt: computeNextRun(frequency, time, dayOfWeek, dayOfMonth),
      };
      setState((prev) => ({ ...prev, schedules: [schedule, ...prev.schedules] }));
    },
    []
  );

  const toggleSchedule = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    }));
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setState((prev) => ({ ...prev, schedules: prev.schedules.filter((s) => s.id !== id) }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      isLoaded,
      connectService,
      disconnectService,
      syncService,
      runExport,
      generateShareLink,
      revokeShareLink,
      createSchedule,
      toggleSchedule,
      deleteSchedule,
    }),
    [
      state,
      isLoaded,
      connectService,
      disconnectService,
      syncService,
      runExport,
      generateShareLink,
      revokeShareLink,
      createSchedule,
      toggleSchedule,
      deleteSchedule,
    ]
  );

  return <CloudExportContext.Provider value={value}>{children}</CloudExportContext.Provider>;
}

export function useCloudExport(): CloudExportContextValue {
  const ctx = useContext(CloudExportContext);
  if (!ctx) throw new Error("useCloudExport must be used within a CloudExportProvider");
  return ctx;
}
