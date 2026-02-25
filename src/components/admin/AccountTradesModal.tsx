"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Upload,
  BarChart3,
  Target,
  DollarSign,
  Calculator,
  ArrowUp,
  ArrowDown,
  FileUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Wallet,
  Save,
  Check,
  Trash2,
} from "lucide-react";

type Trade = {
  id: string;
  trade_id: string;
  symbol: string;
  symbol_category: string;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  position_size: string;
  pnl: number;
  net_pnl: number;
  status: string;
  duration: string | null;
  opened_at: string;
  closed_at: string | null;
  account: {
    platform: string;
    platform_short: string;
    platform_color: string;
    platform_text_color: string;
    account_label: string;
  };
};

type Summary = {
  total_trades: number;
  closed_count: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
  total_pnl: number;
  avg_profit: number;
  best_trade: number;
  worst_trade: number;
};

type AccountInfo = {
  id: string;
  platform: string;
  account_number: string;
  account_label: string;
  balance: number;
  equity: number;
  starting_balance: number;
};

interface AccountTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  accountLabel: string;
  clientName: string;
}

export default function AccountTradesModal({
  isOpen,
  onClose,
  accountId,
  accountLabel,
  clientName,
}: AccountTradesModalProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported_count?: number;
    skipped_count?: number;
    errors?: string[];
    error?: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [startingBalance, setStartingBalance] = useState("");
  const [savingBalance, setSavingBalance] = useState(false);
  const [balanceSaved, setBalanceSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTrades = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/account-trades?account_id=${accountId}`);
      const json = await res.json();
      if (json.data) {
        setTrades(json.data.trades || []);
        setSummary(json.data.summary || null);
        setAccount(json.data.account || null);
        if (json.data.account?.starting_balance != null) {
          setStartingBalance(String(json.data.account.starting_balance));
        }
      }
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (isOpen && accountId) {
      fetchTrades();
      setImportResult(null);
    }
  }, [isOpen, accountId, fetchTrades]);

  const handleImport = async (file: File) => {
    if (!file || !accountId) return;
    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("account_id", accountId);

      const res = await fetch("/api/admin/import-trades", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (res.ok) {
        setImportResult({
          success: true,
          imported_count: json.imported_count,
          skipped_count: json.skipped_count,
          errors: json.errors,
        });
        // Refresh trades after successful import
        await fetchTrades();
      } else {
        setImportResult({ success: false, error: json.error || "Import failed." });
      }
    } catch (err) {
      setImportResult({ success: false, error: String(err) });
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      handleImport(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleSaveBalance = async () => {
    const val = parseFloat(startingBalance);
    if (isNaN(val) || val < 0) return;
    setSavingBalance(true);
    setBalanceSaved(false);
    try {
      const res = await fetch("/api/admin/account-trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId, starting_balance: val }),
      });
      if (res.ok) {
        setBalanceSaved(true);
        await fetchTrades();
        setTimeout(() => setBalanceSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save balance:", err);
    } finally {
      setSavingBalance(false);
    }
  };


  const handleDeleteAllTrades = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    setDeleteConfirm(false);
    try {
      const res = await fetch(`/api/admin/account-trades?account_id=${accountId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok) {
        setImportResult({
          success: true,
          imported_count: 0,
          skipped_count: 0,
          errors: [`Deleted all trades. Balance reset to $${json.new_balance?.toLocaleString() || "0"}`],
        });
        await fetchTrades();
      } else {
        setImportResult({ success: false, error: json.error || "Delete failed." });
      }
    } catch (err) {
      setImportResult({ success: false, error: String(err) });
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (val: number) => {
    const abs = Math.abs(val);
    return `${val < 0 ? "-" : ""}$${abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[#0a0d13] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              {accountLabel || "Account Trades"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="ml-2 text-sm text-slate-400">Loading trades...</span>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <SummaryCard
                    icon={<BarChart3 className="w-4 h-4" />}
                    label="Total Trades"
                    value={String(summary.total_trades)}
                    color="indigo"
                  />
                  <SummaryCard
                    icon={<Target className="w-4 h-4" />}
                    label="Win Rate"
                    value={`${summary.win_rate}%`}
                    sub={`${summary.win_count}W / ${summary.loss_count}L`}
                    color="emerald"
                  />
                  <SummaryCard
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Total P&L"
                    value={formatCurrency(summary.total_pnl)}
                    color={summary.total_pnl >= 0 ? "emerald" : "red"}
                  />
                  <SummaryCard
                    icon={<Calculator className="w-4 h-4" />}
                    label="Avg Profit"
                    value={formatCurrency(summary.avg_profit)}
                    color={summary.avg_profit >= 0 ? "emerald" : "red"}
                  />
                </div>
              )}

              {/* Starting Balance */}
              <div className="bg-[#070a10] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Starting Balance</p>
                      <p className="text-[10px] text-slate-500">Set the initial account balance before trades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={startingBalance}
                        onChange={(e) => { setStartingBalance(e.target.value); setBalanceSaved(false); }}
                        placeholder="0.00"
                        className="w-36 pl-7 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-right"
                      />
                    </div>
                    <button
                      onClick={handleSaveBalance}
                      disabled={savingBalance || !startingBalance}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        balanceSaved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-40"
                      }`}
                    >
                      {savingBalance ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : balanceSaved ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      {balanceSaved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
                {/* Total Balance display */}
                {startingBalance && summary && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Balance (Starting + P&L)</span>
                    <span className={`text-sm font-bold ${(parseFloat(startingBalance) + summary.total_pnl) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatCurrency(parseFloat(startingBalance) + summary.total_pnl)}
                    </span>
                  </div>
                )}
              </div>

              {/* CSV Import Zone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Import Trades
                  </h3>
                  <button
                    onClick={fetchTrades}
                    className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  } ${importing ? "pointer-events-none opacity-60" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {importing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      <span className="text-sm text-slate-300">Importing trades...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <FileUp className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300">
                          Drop a Tradovate CSV here or{" "}
                          <span className="text-indigo-400 underline">browse</span>
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">
                          Supports Tradovate export format (.csv)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Import Result */}
                {importResult && (
                  <div
                    className={`rounded-lg p-3 text-xs flex items-start gap-2 ${
                      importResult.success
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                        : "bg-red-500/10 border border-red-500/20 text-red-300"
                    }`}
                  >
                    {importResult.success ? (
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    <div>
                      {importResult.success ? (
                        <>
                          <p className="font-medium">
                            Imported {importResult.imported_count} trade
                            {importResult.imported_count !== 1 ? "s" : ""} successfully
                            {importResult.skipped_count
                              ? ` (${importResult.skipped_count} duplicates skipped)`
                              : ""}
                          </p>
                          {importResult.errors && importResult.errors.length > 0 && (
                            <p className="text-yellow-400 mt-1">
                              {importResult.errors.length} warning(s):{" "}
                              {importResult.errors.slice(0, 3).join("; ")}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{importResult.error}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Trades Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Trade History ({trades.length})
                  </h3>
                  {trades.length > 0 && (
                    <button
                      onClick={handleDeleteAllTrades}
                      disabled={deleting}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1.5 ${
                        deleteConfirm
                          ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                      }`}
                    >
                      {deleting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      {deleting ? "Deleting..." : deleteConfirm ? "Click Again to Confirm" : "Delete All Trades"}
                    </button>
                  )}
                </div>

                {trades.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Upload className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No trades yet</p>
                    <p className="text-[10px] mt-1">Import a Tradovate CSV to get started</p>
                  </div>
                ) : (
                  <div className="bg-[#070a10] border border-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/[0.02] text-slate-500 font-medium">
                          <tr>
                            <th className="px-4 py-2.5">Symbol</th>
                            <th className="px-4 py-2.5">Type</th>
                            <th className="px-4 py-2.5 text-right">Entry</th>
                            <th className="px-4 py-2.5 text-right">Exit</th>
                            <th className="px-4 py-2.5 text-center">Qty</th>
                            <th className="px-4 py-2.5 text-right">P&L</th>
                            <th className="px-4 py-2.5">Duration</th>
                            <th className="px-4 py-2.5">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {trades.map((trade) => {
                            const isWin = trade.pnl > 0;
                            return (
                              <tr
                                key={trade.id}
                                className="hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">
                                      {trade.symbol}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">
                                      {trade.symbol_category}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                      trade.trade_type === "Buy"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-red-500/10 text-red-400"
                                    }`}
                                  >
                                    {trade.trade_type === "Buy" ? (
                                      <ArrowUp className="w-2.5 h-2.5" />
                                    ) : (
                                      <ArrowDown className="w-2.5 h-2.5" />
                                    )}
                                    {trade.trade_type}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-right text-slate-300 font-mono text-[11px]">
                                  {trade.entry_price?.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className="px-4 py-2.5 text-right text-slate-300 font-mono text-[11px]">
                                  {trade.exit_price?.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  }) ?? "—"}
                                </td>
                                <td className="px-4 py-2.5 text-center text-slate-400">
                                  {trade.position_size}
                                </td>
                                <td
                                  className={`px-4 py-2.5 text-right font-medium ${
                                    isWin ? "text-emerald-400" : "text-red-400"
                                  }`}
                                >
                                  {isWin ? "+" : ""}
                                  {formatCurrency(trade.pnl)}
                                </td>
                                <td className="px-4 py-2.5 text-slate-500">
                                  {trade.duration || "—"}
                                </td>
                                <td className="px-4 py-2.5 text-slate-500 text-[10px]">
                                  {formatDate(trade.opened_at)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card Sub-component ──────────────────────────
function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  const colors = colorMap[color] || colorMap.indigo;
  const textColor = color === "emerald" ? "text-emerald-400" : color === "red" ? "text-red-400" : "text-white";

  return (
    <div className="bg-[#070a10] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${colors}`}>
          {icon}
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-bold ${textColor}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
