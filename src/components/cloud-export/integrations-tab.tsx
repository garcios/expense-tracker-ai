"use client";

import { useState } from "react";
import { Plug, RefreshCw, Unplug } from "lucide-react";
import type { ServiceId } from "@/types/cloud-export";
import { DESTINATIONS } from "@/types/cloud-export";
import { useCloudExport } from "@/context/cloud-export-context";
import { useToast } from "@/context/toast-context";
import { DestinationIcon, DESTINATION_ACCENTS } from "./destination-icon";

const SERVICE_IDS: ServiceId[] = ["google-sheets", "dropbox", "onedrive"];

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function IntegrationsTab() {
  const { state, connectService, disconnectService, syncService } = useCloudExport();
  const { showToast } = useToast();
  const [connectingId, setConnectingId] = useState<ServiceId | null>(null);
  const [syncingId, setSyncingId] = useState<ServiceId | null>(null);

  async function handleConnect(id: ServiceId) {
    setConnectingId(id);
    try {
      await connectService(id);
      showToast(`Connected to ${DESTINATIONS[id].name}.`);
    } finally {
      setConnectingId(null);
    }
  }

  function handleDisconnect(id: ServiceId) {
    disconnectService(id);
    showToast(`Disconnected from ${DESTINATIONS[id].name}.`, "info");
  }

  async function handleSync(id: ServiceId) {
    setSyncingId(id);
    try {
      await syncService(id);
      showToast(`${DESTINATIONS[id].name} synced.`);
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Connect a service once, then export or schedule pushes straight into it.
      </p>
      {SERVICE_IDS.map((id) => {
        const service = state.services[id];
        const destination = DESTINATIONS[id];
        const isConnecting = connectingId === id;
        const isSyncing = syncingId === id;

        return (
          <div
            key={id}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${DESTINATION_ACCENTS[id]}`}>
                <DestinationIcon id={id} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">{destination.name}</p>
                <p className="text-xs text-slate-500">{destination.description}</p>
                {service.connected && (
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Synced {timeAgo(service.lastSyncAt)}
                  </p>
                )}
              </div>
            </div>

            {service.connected ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSync(id)}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing…" : "Sync now"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:bg-slate-50"
                >
                  <Unplug className="h-3.5 w-3.5" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleConnect(id)}
                disabled={isConnecting}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plug className="h-3.5 w-3.5" />
                {isConnecting ? "Connecting…" : "Connect"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
