"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  FileUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  FileText,
  Trash2,
  Files,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

type QueuedFile = {
  id: string;
  file: File;
  accountNumber: string | null;
  status: "queued" | "importing" | "done" | "error" | "unmatched";
  result?: {
    imported_count: number;
    skipped_count: number;
    errors: string[];
    account_label?: string | null;
    client_name?: string | null;
  };
};

type ImportSummary = {
  total_imported: number;
  total_skipped: number;
  files_processed: number;
  files_failed: number;
  total_files: number;
};

/* ── Helpers ────────────────────────────────────────────── */

function extractAccountNumber(filename: string): string | null {
  const match = filename.match(/([A-Z]{2,}[-]?\d{8,})/i);
  return match ? match[1].toUpperCase().replace(/-/g, "") : null;
}

/* ── Page Component ─────────────────────────────────────── */

export default function UploadFilesPage() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: QueuedFile[] = [];
    const arr = Array.from(fileList);
    for (const file of arr) {
      if (!file.name.endsWith(".csv")) continue;
      newFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        accountNumber: extractAccountNumber(file.name),
        status: "queued",
      });
    }
    setQueue((prev) => [...prev, ...newFiles]);
    setSummary(null);
  }, []);

  const removeFile = (id: string) => {
    setQueue((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setQueue([]);
    setSummary(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleImportAll = async () => {
    if (queue.length === 0 || importing) return;
    setImporting(true);
    setSummary(null);

    setQueue((prev) =>
      prev.map((f) =>
        f.status === "queued" ? { ...f, status: "importing" as const } : f
      )
    );

    try {
      const formData = new FormData();
      for (const item of queue) {
        if (item.status === "queued" || item.status === "importing") {
          formData.append("files", item.file);
        }
      }

      const res = await fetch("/api/admin/multi-import-trades", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setQueue((prev) =>
          prev.map((f) => ({
            ...f,
            status: "error" as const,
            result: { imported_count: 0, skipped_count: 0, errors: [json.error || "Import failed"] },
          }))
        );
        setImporting(false);
        return;
      }

      const resultMap = new Map<string, (typeof json.results)[0]>();
      for (const r of json.results || []) resultMap.set(r.filename, r);

      setQueue((prev) =>
        prev.map((f) => {
          const r = resultMap.get(f.file.name);
          if (!r) return { ...f, status: "error" as const, result: { imported_count: 0, skipped_count: 0, errors: ["No result returned"] } };
          return {
            ...f,
            status: r.status === "unmatched" ? ("unmatched" as const) : r.status === "error" ? ("error" as const) : ("done" as const),
            result: {
              imported_count: r.imported_count,
              skipped_count: r.skipped_count,
              errors: r.errors,
              account_label: r.account_label,
              client_name: r.client_name,
            },
          };
        })
      );

      setSummary(json.summary);
    } catch (err) {
      setQueue((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as const,
          result: { imported_count: 0, skipped_count: 0, errors: [String(err)] },
        }))
      );
    } finally {
      setImporting(false);
    }
  };

  const queuedCount = queue.filter((f) => f.status === "queued" || f.status === "importing").length;

  return (
    <div className="min-h-screen bg-[#060910] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/5 bg-[#060910]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin-dashboard"
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Files className="w-5 h-5 text-indigo-400" />
                Multi-File Import
              </h1>
              <p className="text-xs text-slate-500">
                Drop multiple Tradovate CSVs — auto-matched to accounts by filename
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin-dashboard/upload-trades"
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              Switch to Master CSV
            </Link>
            {queue.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          } ${importing ? "pointer-events-none opacity-50" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-base text-slate-200 font-medium">
                Drop Tradovate CSV files here
              </p>
              <p className="text-sm text-slate-500 mt-1">
                or <span className="text-indigo-400 underline">browse files</span> — supports multiple files at once
              </p>
              <p className="text-[10px] text-slate-600 mt-2">
                Each file&apos;s account number is extracted from the filename (e.g. <span className="text-slate-400">APEX41449900000221</span>)
              </p>
            </div>
          </div>
        </div>

        {/* File Queue */}
        {queue.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">
                Files ({queue.length})
              </h2>
              {queuedCount > 0 && !importing && (
                <button
                  onClick={handleImportAll}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileUp className="w-4 h-4" />
                  Import All ({queuedCount} file{queuedCount !== 1 ? "s" : ""})
                </button>
              )}
              {importing && (
                <div className="flex items-center gap-2 text-sm text-indigo-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </div>
              )}
            </div>

            <div className="space-y-2">
              {queue.map((item) => (
                <FileQueueItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeFile(item.id)}
                  importing={importing}
                />
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="bg-[#070a10] border border-white/10 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Import Complete
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniStat label="Files Processed" value={String(summary.files_processed)} color="indigo" />
              <MiniStat label="Trades Imported" value={String(summary.total_imported)} color="emerald" />
              <MiniStat label="Duplicates Skipped" value={String(summary.total_skipped)} color="amber" />
              <MiniStat label="Files Failed" value={String(summary.files_failed)} color={summary.files_failed > 0 ? "red" : "slate"} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {queue.length === 0 && !summary && (
          <div className="bg-[#070a10] border border-white/5 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">How it works</h3>
            <p className="text-xs text-slate-400">
              Each CSV file should be a standard <span className="text-slate-300">Tradovate export</span> for a single account.
              The account number is automatically extracted from the filename.
            </p>
            <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-[10px] font-mono text-slate-500">
              <span className="text-slate-300">2:24:26 - </span><span className="text-indigo-300">APEX41449900000221</span><span className="text-slate-300">-ce7aa0e7.csv</span>
              <span className="text-slate-600 ml-4">← account number extracted</span>
            </div>
            <p className="text-[10px] text-slate-600">
              Drop as many files as you need — they&apos;ll all be processed in one batch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── File Queue Item ────────────────────────────────────── */

function FileQueueItem({
  item,
  onRemove,
  importing,
}: {
  item: QueuedFile;
  onRemove: () => void;
  importing: boolean;
}) {
  const statusConfig: Record<string, { bg: string; icon: React.ReactNode; text: string }> = {
    queued: {
      bg: "bg-white/5 border-white/10",
      icon: <FileText className="w-4 h-4 text-slate-400" />,
      text: "Ready",
    },
    importing: {
      bg: "bg-indigo-500/5 border-indigo-500/20",
      icon: <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />,
      text: "Importing...",
    },
    done: {
      bg: "bg-emerald-500/5 border-emerald-500/20",
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      text: "Done",
    },
    error: {
      bg: "bg-red-500/5 border-red-500/20",
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
      text: "Error",
    },
    unmatched: {
      bg: "bg-amber-500/5 border-amber-500/20",
      icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
      text: "No Match",
    },
  };

  const cfg = statusConfig[item.status] || statusConfig.queued;

  return (
    <div className={`border rounded-xl p-4 ${cfg.bg} transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {cfg.icon}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{item.file.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {item.accountNumber ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {item.accountNumber}
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  No account # detected
                </span>
              )}
              {item.result?.account_label && (
                <span className="text-[10px] text-slate-400">
                  &rarr; {item.result.account_label}
                  {item.result.client_name ? ` (${item.result.client_name})` : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-3">
          {item.result && item.status === "done" && (
            <div className="text-[10px] text-slate-400 text-right">
              <span className="text-emerald-400 font-medium">{item.result.imported_count}</span> imported
              {item.result.skipped_count > 0 && (
                <>, <span className="text-amber-400">{item.result.skipped_count}</span> skipped</>
              )}
            </div>
          )}
          {item.result && (item.status === "error" || item.status === "unmatched") && (
            <div className="text-[10px] text-red-400 max-w-[200px] truncate">
              {item.result.errors?.[0] || "Failed"}
            </div>
          )}

          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            item.status === "done" ? "bg-emerald-500/10 text-emerald-400" :
            item.status === "error" ? "bg-red-500/10 text-red-400" :
            item.status === "unmatched" ? "bg-amber-500/10 text-amber-400" :
            item.status === "importing" ? "bg-indigo-500/10 text-indigo-300" :
            "bg-white/5 text-slate-500"
          }`}>
            {cfg.text}
          </span>

          {!importing && (
            <button
              onClick={onRemove}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {item.result?.errors && item.result.errors.length > 0 && item.status !== "done" && (
        <div className="mt-2 pl-7 text-[10px] text-red-400/80 space-y-0.5">
          {item.result.errors.slice(0, 3).map((err, i) => (
            <p key={i}>&#8226; {err}</p>
          ))}
          {item.result.errors.length > 3 && (
            <p className="text-slate-600">+{item.result.errors.length - 3} more</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Mini Stat ──────────────────────────────────────────── */

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    slate: "text-slate-400",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <p className={`text-xl font-bold ${colorMap[color] || "text-white"}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
