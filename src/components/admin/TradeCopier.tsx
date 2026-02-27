"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Activity,
  Users,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  Power,
  AlertTriangle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface CopierAccount {
  id: string;
  account_name: string;
  is_master: boolean;
  is_active: boolean;
  contract_size: number;
  agency_id: string | null;
  client_id: string | null;
  status: string;
  last_trade: string | null;
  trades_copied: number;
  notes: string | null;
  unrealized: number;
  realized: number;
  net_liquidation: number;
  position_qty: number;
  total_pnl: number;
  client_name: string;
  agency_name: string;
  created_at: string;
  updated_at: string;
}

interface TradeEvent {
  id: string;
  master_account: string;
  instrument: string;
  action: string;
  quantity: number;
  fill_price: number;
  fill_time: string;
  execution_id: string;
  slaves_copied: { account: string; qty: number; status: string }[];
  created_at: string;
}

interface CopierStats {
  trades_today: number;
  active_accounts: number;
  total_accounts: number;
  master_account: string | null;
  last_trade: TradeEvent | null;
}

interface CopierState {
  is_running: boolean;
  master_account: string;
  updated_at?: string;
}

interface CopierData {
  accounts: CopierAccount[];
  events: TradeEvent[];
  stats: CopierStats;
  copierState: CopierState;
}

// ─── Helpers ────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function actionColor(action: string): string {
  const a = action.toLowerCase();
  if (a === "buy" || a === "buytocover") return "text-emerald-400";
  if (a === "sell" || a === "sellshort") return "text-red-400";
  return "text-slate-400";
}

function actionBg(action: string): string {
  const a = action.toLowerCase();
  if (a === "buy" || a === "buytocover")
    return "bg-emerald-500/10 border-emerald-500/20";
  if (a === "sell" || a === "sellshort")
    return "bg-red-500/10 border-red-500/20";
  return "bg-slate-500/10 border-slate-500/20";
}

function formatPnl(val: number): string {
  if (val === 0 || val == null) return "$0.00";
  if (val < 0) return `($${Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pnlColor(val: number): string {
  if (val > 0) return "text-emerald-400";
  if (val < 0) return "text-red-400";
  return "text-slate-500";
}

function formatCurrency(val: number): string {
  if (val == null) return "$0.00";
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusIcon(status: string) {
  switch (status) {
    case "connected":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    case "error":
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    default:
      return <AlertCircle className="w-3.5 h-3.5 text-slate-500" />;
  }
}

// ─── Main Component ─────────────────────────────────────
export default function TradeCopier() {
  const [data, setData] = useState<CopierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_name: "",
    is_master: false,
    contract_size: 1,
    notes: "",
  });
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sendingCommand, setSendingCommand] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Fetch data
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/admin/copier");
      const json = await res.json();
      if (!json.error) setData(json);
    } catch {
      // silently fail
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10s for live PnL data
    const iv = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(iv);
  }, [fetchData]);

  // Toggle account active
  async function toggleActive(account: CopierAccount) {
    setUpdatingId(account.id);
    try {
      await fetch("/api/admin/copier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: account.id,
          is_active: !account.is_active,
        }),
      });
      await fetchData(true);
    } catch {
      // fail silently
    }
    setUpdatingId(null);
  }

  // Update contract size
  async function updateContractSize(account: CopierAccount, size: number) {
    setUpdatingId(account.id);
    try {
      await fetch("/api/admin/copier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: account.id, contract_size: size }),
      });
      await fetchData(true);
    } catch {
      // fail silently
    }
    setUpdatingId(null);
  }

  // Set as master
  async function setAsMaster(account: CopierAccount) {
    setUpdatingId(account.id);
    try {
      // Unset all masters first
      if (data) {
        for (const a of data.accounts.filter((a) => a.is_master)) {
          await fetch("/api/admin/copier", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: a.id, is_master: false }),
          });
        }
      }
      // Set this one as master
      await fetch("/api/admin/copier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: account.id,
          is_master: true,
          is_active: false,
        }),
      });
      await fetchData(true);
    } catch {
      // fail silently
    }
    setUpdatingId(null);
  }

  // Add account
  async function addAccount() {
    if (!newAccount.account_name.trim()) return;
    try {
      await fetch("/api/admin/copier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });
      setShowAddModal(false);
      setNewAccount({
        account_name: "",
        is_master: false,
        contract_size: 1,
        notes: "",
      });
      await fetchData(true);
    } catch {
      // fail silently
    }
  }

  // Delete account
  async function deleteAccount(id: string) {
    if (!confirm("Remove this account from the copier?")) return;
    try {
      await fetch(`/api/admin/copier?id=${id}`, { method: "DELETE" });
      await fetchData(true);
    } catch {
      // fail silently
    }
  }

  // Send command to NinjaTrader via API
  async function sendCommand(action: string, payload: Record<string, string> = {}) {
    setSendingCommand(true);
    try {
      await fetch("/api/admin/copier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      // Wait a moment then refresh to show updated state
      setTimeout(() => fetchData(true), 2000);
    } catch {
      // fail silently
    }
    setSendingCommand(false);
  }

  async function handleStartStop() {
    const isRunning = data?.copierState?.is_running || false;
    if (isRunning) {
      await sendCommand("stop_copier");
    } else {
      const master = data?.stats?.master_account || "";
      await sendCommand("start_copier", master ? { master_account: master } : {});
    }
  }

  async function handleCloseAllTrades() {
    setShowCloseConfirm(false);
    await sendCommand("close_all_trades");
  }

  async function handleSetMasterAndCommand(account: CopierAccount) {
    await setAsMaster(account);
    await sendCommand("set_master", { master_account: account.account_name });
  }

  const masterAccounts =
    data?.accounts.filter((a) => a.is_master) || [];
  const slaveAccounts =
    data?.accounts.filter((a) => !a.is_master) || [];
  const copierRunning = data?.copierState?.is_running || false;

  // ─── Render ───────────────────────────────────────────
  return (
    <div
      className="antialiased min-h-screen w-full text-sm font-sans text-slate-400"
      style={{ background: "#020408" }}
    >
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
                <Copy className="w-6 h-6 text-blue-400" />
                Trade Copier
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                NinjaTrader trade copier — manage master/slave accounts and
                monitor trade events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="bg-[#13161C] text-slate-300 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Account
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#13161C] border border-white/5 rounded-xl p-5 animate-pulse"
              >
                <div className="h-4 bg-white/5 rounded w-24 mb-4" />
                <div className="h-8 bg-white/5 rounded w-16" />
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Master Account */}
            <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-amber-500/10 rounded text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  Master Account
                </span>
              </div>
              <div className="text-lg font-semibold text-white truncate">
                {data.stats.master_account || "Not Set"}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Trades are copied from this account
              </div>
            </div>

            {/* Active Slaves */}
            <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  Active Slaves
                </span>
              </div>
              <div className="text-3xl font-semibold text-white">
                {data.stats.active_accounts}
                <span className="text-base text-slate-500 font-normal ml-1">
                  / {data.stats.total_accounts}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Receiving copied trades
              </div>
            </div>

            {/* Trades Today */}
            <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-500/10 rounded text-blue-400">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  Trades Today
                </span>
              </div>
              <div className="text-3xl font-semibold text-white">
                {data.stats.trades_today}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Master fills detected
              </div>
            </div>

            {/* Last Trade */}
            <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-500/10 rounded text-purple-400">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  Last Trade
                </span>
              </div>
              {data.stats.last_trade ? (
                <>
                  <div className="text-lg font-semibold text-white">
                    <span className={actionColor(data.stats.last_trade.action)}>
                      {data.stats.last_trade.action}
                    </span>{" "}
                    {data.stats.last_trade.quantity}x{" "}
                    {data.stats.last_trade.instrument}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    @ {data.stats.last_trade.fill_price.toFixed(2)} &middot;{" "}
                    {timeAgo(data.stats.last_trade.created_at)}
                  </div>
                </>
              ) : (
                <div className="text-lg font-semibold text-slate-500">
                  No trades yet
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Copier Control Panel */}
        {data && (
          <div className="bg-[#13161C] border border-white/5 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  copierRunning
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}>
                  <Power className={`w-4 h-4 ${copierRunning ? "text-emerald-400" : "text-red-400"}`} />
                  <span className={`text-sm font-semibold ${copierRunning ? "text-emerald-400" : "text-red-400"}`}>
                    {copierRunning ? "COPIER RUNNING" : "COPIER STOPPED"}
                  </span>
                </div>
                {data.copierState?.master_account && (
                  <span className="text-xs text-slate-500">
                    Master: <span className="text-amber-400">{data.copierState.master_account}</span>
                  </span>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-3">
                {/* Start/Stop */}
                <button
                  onClick={handleStartStop}
                  disabled={sendingCommand}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                    copierRunning
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  }`}
                >
                  {copierRunning ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      Stop Copier
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Start Copier
                    </>
                  )}
                </button>

                {/* Close All Trades */}
                <button
                  onClick={() => setShowCloseConfirm(true)}
                  disabled={sendingCommand || !copierRunning}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-amber-600/80 hover:bg-amber-500 text-white transition-all disabled:opacity-30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Close All Trades
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close All Trades Confirmation Modal */}
        {showCloseConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#13161C] border border-red-500/20 rounded-xl w-full max-w-sm p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Close All Trades?
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                This will flatten all positions on every active slave account. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseAllTrades}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Yes, Close All Trades
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Accounts Table (full width) */}
          <div className="bg-[#13161C] border border-white/5 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Copier Accounts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {masterAccounts.length} master &middot;{" "}
                  {slaveAccounts.length} slave accounts
                </p>
              </div>
            </div>

            {/* Master Section */}
            {masterAccounts.length > 0 && (
              <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/10">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  MASTER ACCOUNT
                </div>
                {masterAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between flex-wrap gap-y-1"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(acc.status)}
                      <span className="text-white font-medium text-sm">
                        {acc.account_name}
                      </span>
                      {acc.client_name && (
                        <span className="text-[11px] text-amber-300/70">
                          {acc.client_name}
                        </span>
                      )}
                      {acc.agency_name && (
                        <span className="text-[10px] text-slate-500">
                          ({acc.agency_name})
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {acc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-slate-500">Net Liq: <span className="text-white font-mono">{formatCurrency(acc.net_liquidation)}</span></span>
                      <span className="text-slate-500">Unrealized: <span className={`font-mono ${pnlColor(acc.unrealized)}`}>{formatPnl(acc.unrealized)}</span></span>
                      <span className="text-slate-500">Realized: <span className={`font-mono ${pnlColor(acc.realized)}`}>{formatPnl(acc.realized)}</span></span>
                      <span className="text-slate-500">{acc.trades_copied} trades</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Slave Accounts Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-500 uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Client Name</th>
                    <th className="px-4 py-3">Agency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Contracts</th>
                    <th className="px-4 py-3 text-right">Unrealized</th>
                    <th className="px-4 py-3 text-right">Realized</th>
                    <th className="px-4 py-3 text-right">Net Liquidation</th>
                    <th className="px-4 py-3 text-center">QTY</th>
                    <th className="px-4 py-3 text-right">Total PNL</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {slaveAccounts.map((acc) => (
                    <tr
                      key={acc.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Active Toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(acc)}
                          disabled={updatingId === acc.id}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            acc.is_active
                              ? "bg-emerald-500"
                              : "bg-white/10"
                          } ${updatingId === acc.id ? "opacity-50" : ""}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                              acc.is_active
                                ? "translate-x-[18px]"
                                : "translate-x-[3px]"
                            }`}
                          />
                        </button>
                      </td>
                      {/* Account Name */}
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">
                          {acc.account_name}
                        </span>
                      </td>
                      {/* Client Name */}
                      <td className="px-4 py-3">
                        <span className="text-slate-300">
                          {acc.client_name || "—"}
                        </span>
                      </td>
                      {/* Agency */}
                      <td className="px-4 py-3">
                        <span className="text-slate-400 text-[11px]">
                          {acc.agency_name || "—"}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {statusIcon(acc.status)}
                          <span
                            className={
                              acc.status === "connected"
                                ? "text-emerald-400"
                                : acc.status === "error"
                                ? "text-red-400"
                                : "text-slate-500"
                            }
                          >
                            {acc.status}
                          </span>
                        </div>
                      </td>
                      {/* Contracts */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              updateContractSize(
                                acc,
                                Math.max(1, acc.contract_size - 1)
                              )
                            }
                            disabled={
                              acc.contract_size <= 1 || updatingId === acc.id
                            }
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="text-white font-medium w-6 text-center">
                            {acc.contract_size}
                          </span>
                          <button
                            onClick={() =>
                              updateContractSize(acc, acc.contract_size + 1)
                            }
                            disabled={updatingId === acc.id}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      {/* Unrealized */}
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono ${pnlColor(acc.unrealized)}`}>
                          {formatPnl(acc.unrealized)}
                        </span>
                      </td>
                      {/* Realized */}
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono ${pnlColor(acc.realized)}`}>
                          {formatPnl(acc.realized)}
                        </span>
                      </td>
                      {/* Net Liquidation */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-white font-mono">
                          {formatCurrency(acc.net_liquidation)}
                        </span>
                      </td>
                      {/* QTY (position) */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-slate-300">
                          {acc.position_qty || 0}
                        </span>
                      </td>
                      {/* Total PNL */}
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono font-medium ${pnlColor(acc.total_pnl)}`}>
                          {formatPnl(acc.total_pnl)}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleSetMasterAndCommand(acc)}
                            className="text-[10px] text-amber-400 hover:text-amber-300"
                            title="Set as master"
                          >
                            Master
                          </button>
                          <button
                            onClick={() => deleteAccount(acc.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {slaveAccounts.length === 0 && (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 text-slate-600" />
                          <p>No slave accounts configured</p>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                          >
                            + Add Account
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trade Event Feed (1/3) */}
          <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col max-h-[700px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Trade Events
              </h3>
              <span className="text-[10px] text-slate-500">
                {data?.events.length || 0} events
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {data?.events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedEvent(
                        expandedEvent === ev.id ? null : ev.id
                      )
                    }
                    className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${actionBg(
                          ev.action
                        )} ${actionColor(ev.action)}`}
                      >
                        {ev.action}
                      </span>
                      <span className="text-white text-xs font-medium">
                        {ev.quantity}x {ev.instrument}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">
                        {timeAgo(ev.created_at)}
                      </span>
                      {expandedEvent === ev.id ? (
                        <ChevronUp className="w-3 h-3 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {expandedEvent === ev.id && (
                    <div className="px-3 pb-3 border-t border-white/5 pt-2 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Price</span>
                        <span className="text-white">
                          {ev.fill_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Master</span>
                        <span className="text-white">{ev.master_account}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Time</span>
                        <span className="text-white">
                          {new Date(ev.fill_time).toLocaleString()}
                        </span>
                      </div>
                      {ev.slaves_copied && ev.slaves_copied.length > 0 && (
                        <div className="mt-2">
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                            Copies Sent
                          </div>
                          {ev.slaves_copied.map((s, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-[11px] py-0.5"
                            >
                              <span className="text-slate-300">
                                {s.account}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">
                                  {s.qty}x
                                </span>
                                <span
                                  className={
                                    s.status === "filled"
                                      ? "text-emerald-400"
                                      : s.status === "error"
                                      ? "text-red-400"
                                      : "text-amber-400"
                                  }
                                >
                                  {s.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-600 mt-1 truncate">
                        ID: {ev.execution_id}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(!data || data.events.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Activity className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs">No trade events yet</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Events appear when the copier detects fills
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#13161C] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add Copier Account
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  value={newAccount.account_name}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      account_name: e.target.value,
                    })
                  }
                  placeholder="e.g. APEX41449900000221"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1.5">
                    Contract Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newAccount.contract_size}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        contract_size: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAccount.is_master}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          is_master: e.target.checked,
                        })
                      }
                      className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500/50"
                    />
                    <span className="text-xs text-slate-300">Master</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={newAccount.notes}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, notes: e.target.value })
                  }
                  placeholder="e.g. Client name or agency"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addAccount}
                disabled={!newAccount.account_name.trim()}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
