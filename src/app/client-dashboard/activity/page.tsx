"use client";

import { useState, useEffect, useCallback } from "react";
import { useAgencyBranding } from "@/hooks/useAgencyBranding";
import {
  BarChart3,
  Target,
  DollarSign,
  Calculator,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  RefreshCw,
  Check,
  TrendingUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
type TradeAccount = {
  platform: string;
  platform_short: string;
  platform_color: string;
  platform_text_color: string;
  account_label: string;
};

type Trade = {
  id: string;
  trade_id: string;
  symbol: string;
  symbol_category: string;
  algorithm_name: string | null;
  algorithm_color: string;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  current_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  position_size: string;
  pnl: number;
  pnl_pct: number;
  commission: number;
  swap: number;
  net_pnl: number;
  status: string;
  duration: string | null;
  slippage: string | null;
  entry_order_type: string | null;
  exit_order_type: string | null;
  risk_reward: string | null;
  risk_amount: number | null;
  risk_pct: number | null;
  pips: number | null;
  pip_value: number | null;
  notes: string | null;
  tags: string[];
  opened_at: string;
  closed_at: string | null;
  account: TradeAccount;
};

type Summary = {
  total_trades: number;
  open_count: number;
  closed_count: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
  total_pnl: number;
  total_pnl_pct: number;
  avg_profit: number;
  best_trade: number;
  worst_trade: number;
};

type FilterOption = { id: string; platform: string; label: string };

type PageData = {
  summary: Summary;
  trades: Trade[];
  filters: {
    accounts: FilterOption[];
    symbols: string[];
    algorithms: string[];
  };
};

// ─── Empty default data for new clients ──────────────────
const EMPTY_DATA: PageData = {
  summary: { total_trades: 0, open_count: 0, closed_count: 0, win_count: 0, loss_count: 0, win_rate: 0, total_pnl: 0, total_pnl_pct: 0, avg_profit: 0, best_trade: 0, worst_trade: 0 },
  trades: [],
  filters: { accounts: [], symbols: [], algorithms: [] },
};

// ─── Helpers ─────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function fmtPrice(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(4);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
}

// ─── Trade Detail Modal ──────────────────────────────────
function TradeModal({ trade, onClose }: { trade: Trade | null; onClose: () => void }) {
  if (!trade) return null;
  const opened = fmtDate(trade.opened_at);
  const closed = trade.closed_at ? fmtDate(trade.closed_at) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 rounded-xl bg-[#0B0E14] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#020408] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-white">Trade Details</h3>
            <span className="text-xs text-slate-500 font-mono">#{trade.trade_id}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/5 px-6 flex gap-6">
          <button className="py-3 text-xs font-medium text-white border-b-2 border-blue-500">Overview</button>
          <button className="py-3 text-xs font-medium text-slate-400 hover:text-white transition-colors">Chart</button>
          <button className="py-3 text-xs font-medium text-slate-400 hover:text-white transition-colors">Algorithm Logic</button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Trade Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Trade ID:</span><span className="text-white font-mono">#{trade.trade_id}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Account:</span><span className="text-white">{trade.account.platform}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Symbol:</span><span className="text-white">{trade.symbol}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Algorithm:</span><span style={{ color: trade.algorithm_color }}>{trade.algorithm_name || "Manual"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Trade Type:</span><span className={trade.trade_type === "Buy" ? "text-emerald-400" : "text-red-400"}>{trade.trade_type} ({trade.trade_type === "Buy" ? "Long" : "Short"})</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Pricing Details</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Entry Price:</span><span className="text-white font-mono">{fmtPrice(trade.entry_price)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">{trade.status === "Open" ? "Current Price:" : "Exit Price:"}</span><span className={`font-mono ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtPrice(trade.exit_price || trade.current_price || trade.entry_price)}</span></div>
                  {trade.stop_loss && <div className="flex justify-between"><span className="text-slate-500">Stop Loss:</span><span className="text-red-400 font-mono">{fmtPrice(trade.stop_loss)}</span></div>}
                  {trade.take_profit && <div className="flex justify-between"><span className="text-slate-500">Take Profit:</span><span className="text-emerald-400 font-mono">{fmtPrice(trade.take_profit)}</span></div>}
                </div>
              </div>
            </div>
            {/* Column 2 */}
            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Timing</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Entry Time:</span><span className="text-white">{opened.date} {opened.time}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Exit Time:</span><span className={closed ? "text-white" : "text-slate-500"}>{closed ? `${closed.date} ${closed.time}` : "Still Open"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Duration:</span><span className="text-white">{trade.duration || "—"}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Execution</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Entry Order:</span><span className="text-white">{trade.entry_order_type || "Market"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Exit Order:</span><span className={trade.exit_order_type ? "text-white" : "text-slate-500"}>{trade.exit_order_type || "Pending"}</span></div>
                  {trade.slippage && <div className="flex justify-between"><span className="text-slate-500">Slippage:</span><span className="text-white">{trade.slippage}</span></div>}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Position Info</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Position Size:</span><span className="text-white">{trade.position_size}</span></div>
                  {trade.pip_value != null && <div className="flex justify-between"><span className="text-slate-500">Pip Value:</span><span className="text-white">${trade.pip_value.toFixed(2)}</span></div>}
                  {trade.pips != null && <div className="flex justify-between"><span className="text-slate-500">Pips:</span><span className={trade.pips >= 0 ? "text-emerald-400" : "text-red-400"}>{trade.pips >= 0 ? "+" : ""}{trade.pips} pips</span></div>}
                </div>
              </div>
            </div>
            {/* Column 3 */}
            <div className="space-y-5">
              <div>
                <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Profit/Loss Breakdown</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Gross P&L:</span><span className={`font-mono ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trade.pnl >= 0 ? "+" : ""}{fmt(trade.pnl)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Commission:</span><span className="text-white font-mono">{fmt(trade.commission)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Swap:</span><span className="text-white font-mono">{fmt(trade.swap)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-white/5">
                    <span className="text-white font-medium">Net P&L:</span>
                    <span className={`font-semibold font-mono ${trade.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trade.net_pnl >= 0 ? "+" : ""}{fmt(trade.net_pnl)}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">ROI:</span><span className={trade.pnl_pct >= 0 ? "text-emerald-400" : "text-red-400"}>{trade.pnl_pct >= 0 ? "+" : ""}{trade.pnl_pct}%</span></div>
                </div>
              </div>
              {trade.risk_reward && (
                <div>
                  <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Risk Management</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Risk/Reward:</span><span className="text-white">{trade.risk_reward}</span></div>
                    {trade.risk_amount != null && <div className="flex justify-between"><span className="text-slate-500">Risk Amount:</span><span className="text-white">${trade.risk_amount} ({trade.risk_pct}%)</span></div>}
                  </div>
                </div>
              )}
              {trade.notes && (
                <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <h4 className="text-[10px] font-medium text-slate-400 mb-2">Notes</h4>
                  <p className="text-xs text-slate-300">{trade.notes}</p>
                </div>
              )}
            </div>
          </div>
          {trade.tags && trade.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
              {trade.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#020408] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Expanded Row ────────────────────────────────────────
function ExpandedRow({ trade }: { trade: Trade }) {
  const opened = fmtDate(trade.opened_at);
  const closed = trade.closed_at ? fmtDate(trade.closed_at) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <h4 className="text-xs font-medium text-white uppercase tracking-wider">Trade Information</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">Trade ID:</span><span className="text-white font-mono">#{trade.trade_id}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Account:</span><span className="text-white">{trade.account.platform} ({trade.account.account_label})</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Symbol:</span><span className="text-white">{trade.symbol}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Algorithm:</span><span style={{ color: trade.algorithm_color }}>{trade.algorithm_name || "Manual"}</span></div>
        </div>
        <h4 className="text-xs font-medium text-white uppercase tracking-wider pt-2">Pricing Details</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">Entry Price:</span><span className="text-white font-mono">{fmtPrice(trade.entry_price)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">{trade.status === "Open" ? "Current:" : "Exit:"}</span><span className={`font-mono ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtPrice(trade.exit_price || trade.current_price || 0)}</span></div>
          {trade.stop_loss && <div className="flex justify-between"><span className="text-slate-500">Stop Loss:</span><span className="text-red-400 font-mono">{fmtPrice(trade.stop_loss)}</span></div>}
          {trade.take_profit && <div className="flex justify-between"><span className="text-slate-500">Take Profit:</span><span className="text-emerald-400 font-mono">{fmtPrice(trade.take_profit)}</span></div>}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-xs font-medium text-white uppercase tracking-wider">Timing</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">Entry Time:</span><span className="text-white">{opened.date} at {opened.time}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Exit Time:</span><span className={closed ? "text-white" : "text-slate-500"}>{closed ? `${closed.date} at ${closed.time}` : "Still Open"}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Duration:</span><span className="text-white">{trade.duration || "—"}</span></div>
        </div>
        <h4 className="text-xs font-medium text-white uppercase tracking-wider pt-2">Position Info</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">Position Size:</span><span className="text-white">{trade.position_size}</span></div>
          {trade.pip_value != null && <div className="flex justify-between"><span className="text-slate-500">Pip Value:</span><span className="text-white">${trade.pip_value.toFixed(2)}</span></div>}
          {trade.pips != null && <div className="flex justify-between"><span className="text-slate-500">Pips:</span><span className={trade.pips >= 0 ? "text-emerald-400" : "text-red-400"}>{trade.pips >= 0 ? "+" : ""}{trade.pips} pips</span></div>}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-xs font-medium text-white uppercase tracking-wider">Profit/Loss Breakdown</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">{trade.status === "Open" ? "Unrealized" : "Realized"} P&L:</span><span className={`font-mono ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trade.pnl >= 0 ? "+" : ""}{fmt(trade.pnl)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Commission:</span><span className="text-white font-mono">{fmt(trade.commission)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Swap/Rollover:</span><span className="text-white font-mono">{fmt(trade.swap)}</span></div>
          <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
            <span className="text-white font-medium">Net P&L:</span>
            <span className={`font-medium font-mono ${trade.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trade.net_pnl >= 0 ? "+" : ""}{fmt(trade.net_pnl)}</span>
          </div>
        </div>
        {trade.risk_reward && (
          <>
            <h4 className="text-xs font-medium text-white uppercase tracking-wider pt-2">Risk Management</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Risk/Reward:</span><span className="text-white">{trade.risk_reward}</span></div>
              {trade.risk_amount != null && <div className="flex justify-between"><span className="text-slate-500">Risk Amount:</span><span className="text-white">${trade.risk_amount} ({trade.risk_pct}%)</span></div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function TradingActivityPage() {
  const { agencyName } = useAgencyBranding();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "open" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterSymbol, setFilterSymbol] = useState("all");
  const [filterAlgo, setFilterAlgo] = useState("all");
  const [filterPnl, setFilterPnl] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [modalTrade, setModalTrade] = useState<Trade | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 25;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client-trading-activity");
        const json = await res.json();
        if (json.data) setData(json.data);
        else setData(EMPTY_DATA);
      } catch { setData(EMPTY_DATA); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading trading activity...</span>
        </div>
      </div>
    );
  }

  const d = data || EMPTY_DATA;
  const s = d.summary;

  // Filter trades
  let filtered = d.trades;
  if (tab === "open") filtered = filtered.filter(t => t.status === "Open");
  if (tab === "closed") filtered = filtered.filter(t => t.status === "Closed");
  if (filterAccount !== "all") filtered = filtered.filter(t => t.account.platform.toLowerCase().includes(filterAccount.toLowerCase()));
  if (filterSymbol !== "all") filtered = filtered.filter(t => t.symbol === filterSymbol);
  if (filterAlgo !== "all") filtered = filtered.filter(t => t.algorithm_name === filterAlgo);
  if (filterPnl === "profit") filtered = filtered.filter(t => t.pnl > 0);
  if (filterPnl === "loss") filtered = filtered.filter(t => t.pnl < 0);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.symbol.toLowerCase().includes(q) ||
      (t.algorithm_name || "").toLowerCase().includes(q) ||
      t.account.platform.toLowerCase().includes(q) ||
      t.trade_id.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Win rate circle
  const circumference = 2 * Math.PI * 15.5;
  const winRateOffset = circumference - (s.win_rate / 100) * circumference;

  return (
    <>
      <TradeModal trade={modalTrade} onClose={() => setModalTrade(null)} />

      <div className="p-4 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-white font-semibold text-xl tracking-tight">Trading Activity</h1>
            <p className="text-xs text-slate-500 mt-1">Complete trade history across all accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group" title="Refresh trades">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Trades */}
          <div className="rounded-xl p-5 bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Trades (All Time)</p>
                <p className="text-3xl font-semibold text-white tracking-tight mt-1">{s.total_trades}</p>
                <p className="text-xs text-slate-400 mt-2">{s.closed_count} Closed, <span className="text-blue-400">{s.open_count} Open</span></p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className="rounded-xl p-5 bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Win Rate</p>
                <p className="text-3xl font-semibold text-white tracking-tight mt-1">{s.win_rate}%</p>
                <p className="text-xs text-slate-400 mt-2"><span className="text-emerald-400">{s.win_count} Wins</span>, <span className="text-red-400">{s.loss_count} Losses</span></p>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-full h-full" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e293b" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={winRateOffset} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Total P&L */}
          <div className="rounded-xl p-5 bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Profit/Loss</p>
                <p className={`text-3xl font-semibold tracking-tight mt-1 ${s.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{s.total_pnl >= 0 ? "+" : ""}{fmt(s.total_pnl)}</p>
                <p className={`text-xs mt-2 flex items-center gap-1 ${s.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  <TrendingUp className="w-3 h-3" /> {s.total_pnl_pct >= 0 ? "+" : ""}{s.total_pnl_pct}% overall
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Average Trade */}
          <div className="rounded-xl p-5 bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Profit Per Trade</p>
                <p className="text-3xl font-semibold text-white tracking-tight mt-1">{s.avg_profit >= 0 ? "+" : ""}{fmt(s.avg_profit)}</p>
                <p className="text-xs text-slate-400 mt-2">Best: <span className="text-emerald-400">+{fmt(s.best_trade)}</span>, Worst: <span className="text-red-400">{fmt(s.worst_trade)}</span></p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
                <Calculator className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-4 bg-[#0B0E14] border border-white/5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search by symbol, algorithm, or account..."
                className="w-full bg-[#020408] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select value={filterAccount} onChange={(e) => { setFilterAccount(e.target.value); setPage(1); }} className="bg-[#020408] border border-white/10 rounded-lg py-2.5 px-3 pr-8 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[140px]">
                  <option value="all">All Accounts</option>
                  {d.filters.accounts.map(a => <option key={a.id} value={a.platform}>{a.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={filterSymbol} onChange={(e) => { setFilterSymbol(e.target.value); setPage(1); }} className="bg-[#020408] border border-white/10 rounded-lg py-2.5 px-3 pr-8 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[130px]">
                  <option value="all">All Symbols</option>
                  {d.filters.symbols.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={filterAlgo} onChange={(e) => { setFilterAlgo(e.target.value); setPage(1); }} className="bg-[#020408] border border-white/10 rounded-lg py-2.5 px-3 pr-8 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[140px]">
                  <option value="all">All Algorithms</option>
                  {d.filters.algorithms.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select value={filterPnl} onChange={(e) => { setFilterPnl(e.target.value); setPage(1); }} className="bg-[#020408] border border-white/10 rounded-lg py-2.5 px-3 pr-8 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[130px]">
                  <option value="all">All Results</option>
                  <option value="profit">Profitable Only</option>
                  <option value="loss">Losses Only</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-4">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
              <span>{showAdvanced ? "Hide" : "Show"} Advanced Filters</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Trade Type</label>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white">All</button>
                    <button className="px-3 py-1.5 bg-transparent border border-white/10 rounded text-xs text-slate-400 hover:bg-white/5">Buy</button>
                    <button className="px-3 py-1.5 bg-transparent border border-white/10 rounded text-xs text-slate-400 hover:bg-white/5">Sell</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Min P&L ($)</label>
                  <input type="number" placeholder="0" className="w-24 bg-[#020408] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Max P&L ($)</label>
                  <input type="number" placeholder="1000" className="w-24 bg-[#020408] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trades Table */}
        <div className="rounded-xl overflow-hidden bg-[#0B0E14] border border-white/5">
          {/* Tabs */}
          <div className="border-b border-white/5 px-4 flex items-center gap-6">
            <button onClick={() => { setTab("all"); setPage(1); }} className={`relative py-4 text-sm font-medium transition-colors ${tab === "all" ? "text-white border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
              All Trades <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[10px]">{s.total_trades}</span>
            </button>
            <button onClick={() => { setTab("open"); setPage(1); }} className={`relative py-4 text-sm font-medium transition-colors ${tab === "open" ? "text-white border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
              Open Positions <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px]">{s.open_count}</span>
            </button>
            <button onClick={() => { setTab("closed"); setPage(1); }} className={`relative py-4 text-sm font-medium transition-colors ${tab === "closed" ? "text-white border-b-2 border-blue-500" : "text-slate-400 hover:text-white"}`}>
              Closed Trades <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-[10px]">{s.closed_count}</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#020408]/50 sticky top-0">
                <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Trade ID</th>
                  <th className="py-3 px-4 font-medium"><span className="flex items-center gap-1">Opened <ArrowUpDown className="w-3 h-3" /></span></th>
                  <th className="py-3 px-4 font-medium"><span className="flex items-center gap-1">Closed <ArrowUpDown className="w-3 h-3" /></span></th>
                  <th className="py-3 px-4 font-medium">Account</th>
                  <th className="py-3 px-4 font-medium">Symbol</th>
                  <th className="py-3 px-4 font-medium">Algorithm</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Entry</th>
                  <th className="py-3 px-4 font-medium">Exit</th>
                  <th className="py-3 px-4 font-medium">Size</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium"><span className="flex items-center gap-1">P&L <ArrowDown className="w-3 h-3 text-blue-400" /></span></th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-slate-500">
                      No trades found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((trade) => {
                    const opened = fmtDate(trade.opened_at);
                    const closed = trade.closed_at ? fmtDate(trade.closed_at) : null;
                    const isExpanded = expandedRows.has(trade.id);

                    return (
                      <React.Fragment key={trade.id}>
                        <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => toggleRow(trade.id)}>
                          <td className="py-4 px-4 text-xs text-slate-500 font-mono">#{trade.trade_id}</td>
                          <td className="py-4 px-4">
                            <div className="text-xs text-white">{opened.date}</div>
                            <div className="text-[10px] text-slate-500">{opened.time}</div>
                          </td>
                          <td className="py-4 px-4">
                            {closed ? (
                              <>
                                <div className="text-xs text-white">{closed.date}</div>
                                <div className="text-[10px] text-slate-500">{closed.time}</div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: trade.account.platform_color, color: trade.account.platform_text_color }}>
                                {trade.account.platform_short}
                              </div>
                              <span className="text-xs text-white">{trade.account.platform}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs font-medium text-white">{trade.symbol}</div>
                            <div className="text-[10px] text-slate-500">{trade.symbol_category}</div>
                          </td>
                          <td className="py-4 px-4">
                            {trade.algorithm_name ? (
                              <span className="px-2 py-1 rounded text-[10px]" style={{ backgroundColor: `${trade.algorithm_color}1a`, borderColor: `${trade.algorithm_color}33`, color: trade.algorithm_color, border: `1px solid ${trade.algorithm_color}33` }}>
                                {trade.algorithm_name}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">Manual</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`flex items-center gap-1 text-xs ${trade.trade_type === "Buy" ? "text-emerald-400" : "text-red-400"}`}>
                              {trade.trade_type === "Buy" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                              {trade.trade_type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-300 font-mono">{fmtPrice(trade.entry_price)}</td>
                          <td className="py-4 px-4">
                            {trade.status === "Open" ? (
                              <>
                                <div className={`text-xs font-mono ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtPrice(trade.current_price || trade.entry_price)}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-slate-300 font-mono">{trade.exit_price ? fmtPrice(trade.exit_price) : "—"}</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-300">{trade.position_size}</td>
                          <td className="py-4 px-4 text-xs text-slate-300">{trade.duration || "—"}</td>
                          <td className="py-4 px-4">
                            <div className={`text-sm font-medium ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trade.pnl >= 0 ? "+" : ""}{fmt(trade.pnl)}</div>
                            <div className={`text-[10px] ${trade.pnl >= 0 ? "text-emerald-500/70" : "text-red-500/70"}`}>{trade.pnl_pct >= 0 ? "+" : ""}{trade.pnl_pct}%</div>
                          </td>
                          <td className="py-4 px-4">
                            {trade.status === "Open" ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Open
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400">
                                <Check className="w-3 h-3" /> Closed
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <button onClick={(e) => { e.stopPropagation(); setModalTrade(trade); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        {/* Expanded row */}
                        {isExpanded && (
                          <tr className="bg-[#020408]/50">
                            <td colSpan={14} className="p-6">
                              <ExpandedRow trade={trade} />
                              {trade.tags && trade.tags.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                  <div className="flex gap-2">
                                    {trade.tags.map((tag, i) => (
                                      <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-slate-400">{tag}</span>
                                    ))}
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); toggleRow(trade.id); }} className="text-xs text-slate-400 hover:text-white">Collapse</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Showing <span className="text-white">{Math.min((page - 1) * perPage + 1, filtered.length)}-{Math.min(page * perPage, filtered.length)}</span> of <span className="text-white">{filtered.length}</span> trades
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-xs rounded transition-colors ${p === page ? "text-white bg-blue-600" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="px-2 text-slate-500">...</span>}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} {agencyName || "Your Agency"}. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </>
  );
}

// Need React import for React.Fragment
import React from "react";
