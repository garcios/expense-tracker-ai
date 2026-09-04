"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Eye, Pencil, QrCode, ShieldOff } from "lucide-react";
import QRCode from "qrcode";
import type { ExportHistoryEntry } from "@/types/cloud-export";
import { useCloudExport } from "@/context/cloud-export-context";
import { useToast } from "@/context/toast-context";

const EXPIRY_OPTIONS: { label: string; days: number | null }[] = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "Never", days: null },
];

export function ShareLinkCard({ entry }: { entry: ExportHistoryEntry }) {
  const { generateShareLink, revokeShareLink } = useCloudExport();
  const { showToast } = useToast();
  const [access, setAccess] = useState<"view" | "edit">("view");
  const [expiresInDays, setExpiresInDays] = useState<number | null>(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const shareLink = entry.shareLink;

  useEffect(() => {
    if (!shareLink || shareLink.revoked) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(shareLink.url, { width: 160, margin: 1, color: { dark: "#1e293b", light: "#ffffff" } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shareLink]);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      await generateShareLink({ entryId: entry.id, access, expiresInDays });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      showToast("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn't copy the link.", "error");
    }
  }

  if (!shareLink || shareLink.revoked) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-sm font-medium text-slate-900">Share this export</p>
        <p className="mt-1 text-xs text-slate-500">
          Generate a link anyone can open — no account required.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setAccess("view")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${
                access === "view" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Can view
            </button>
            <button
              type="button"
              onClick={() => setAccess("edit")}
              className={`flex items-center gap-1.5 border-l border-slate-300 px-3 py-1.5 text-xs font-medium transition ${
                access === "edit" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Can edit
            </button>
          </div>

          <select
            value={expiresInDays === null ? "never" : String(expiresInDays)}
            onChange={(e) => setExpiresInDays(e.target.value === "never" ? null : Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.days === null ? "never" : opt.days}>
                Expires in {opt.label.toLowerCase()}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating…" : "Generate link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Shareable link</p>
          <p className="mt-1 truncate text-xs font-mono text-indigo-700">{shareLink.url}</p>
          <p className="mt-1.5 text-xs text-slate-500">
            {shareLink.access === "view" ? "View only" : "Can edit"} &middot;{" "}
            {shareLink.expiresAt
              ? `Expires ${new Date(shareLink.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : "Never expires"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => revokeShareLink(entry.id)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 shadow-sm transition hover:bg-rose-50"
            >
              <ShieldOff className="h-3.5 w-3.5" />
              Revoke
            </button>
          </div>
        </div>

        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-slate-200">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR code for share link" className="h-full w-full" />
          ) : (
            <QrCode className="h-8 w-8 text-slate-300" />
          )}
        </div>
      </div>
    </div>
  );
}
