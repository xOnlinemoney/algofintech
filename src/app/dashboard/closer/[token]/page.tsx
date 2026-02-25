"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  CreditCard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Target,
  Zap,
  Users,
  Wallet,
  Loader2,
  AlertCircle,
  Shield,
  ArrowUpDown,
  Calendar,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

type Client = {
  id: string;
  name: string;
  email: string;
  status: string;
  accounts: {
    id: string;
    account_number: string;
    account_label: string;
    platform: string;
    balance: number;
    equity: number;
    is_active: boolean;
  }[];
};

type Trade = {
  id: string;
  trade_id: string;
  symbol: string;
  algorithm_name: string | null;
  algorithm_color: string | null;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  position_size: string;
  pnl: number;
  net_pnl: number;
  status: string;
  duration: string;
  opened_at: string;
  closed_at: string | null;
  account: {
    platform: string;
    platform_short: string;
    platform_color: string;
    account_label: string;
  };
};

type Summary = {
  total_trades: number;
  open_count: number;
  closed_count: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
  total_pnl: number;
  avg_profit: number;
  best_trade: number;
  worst_trade: number;
};

type Period = {
  period: string;
  label: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  win_rate: number;
};

type PaymentData = {
  client: { id: string; name: string; email: string; status: string; joined: string } | null;
  summary: { total_balance: number; total_starting: number; total_pnl: number; total_trades: number; accounts_count: number };
  accounts: { id: string; label: string; platform: string; balance: number; equity: number; starting_balance: number; is_active: boolean; total_pnl: number }[];
  periods: Period[];
};

/* ── Helpers ─────────────────────────────────────────────── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/* ── Page ────────────────────────────────────────────────── */

export default function CloserPortalPage() {
  const params = useParams();
  const token = params.token as string;

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closerName, setCloserName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [tab, setTab] = useState<"activity" | "payments">("activity");

  // Activity data
  const [activityLoading, setActivityLoading] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  // Payments data
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  // Activity table state
  const [sortCol, setSortCol] = useState<string>("opened_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Verify token on mount
  useEffect(() => {
    if (!token) return;
    fetch(`/api/closer/verify?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Invalid link" : r.status === 410 ? "Link expired" : "Error");
        return r.json();
      })
      .then((data) => {
        setCloserName(data.closer_name || "");
        setAgencyName(data.agency?.name || "");
        setClients(data.clients || []);
        if (data.clients?.length > 0) {
          setSelectedClientId(data.clients[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Invalid link");
        setLoading(false);
      });
  }, [token]);

  // Fetch activity when client changes
  useEffect(() => {
    if (!selectedClientId || !token) return;
    if (tab !== "activity") return;
    setActivityLoading(true);
    fetch(`/api/closer/client-activity?token=${encodeURIComponent(token)}&client_id=${selectedClientId}`)
      .then((r) => r.json())
      .then((json) => {
        const d = json.data;
        if (d) {
          setTrades(d.trades || []);
          setSummary(d.summary || null);
        }
        setActivityLoading(false);
      })
      .catch(() => setActivityLoading(false));
  }, [selectedClientId, token, tab]);

  // Fetch payments when client changes
  useEffect(() => {
    if (!selectedClientId || !token) return;
    if (tab !== "payments") return;
    setPaymentsLoading(true);
    fetch(`/api/closer/client-payments?token=${encodeURIComponent(token)}&client_id=${selectedClientId}`)
      .then((r) => r.json())
      .then((json) => {
        setPaymentData(json.data || null);
        setPaymentsLoading(false);
      })
      .catch(() => setPaymentsLoading(false));
  }, [selectedClientId, token, tab]);

  // Sorted & paginated trades
  const sortedTrades = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === "Closed");
    return closedTrades.sort((a: any, b: any) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [trades, sortCol, sortDir]);

  const pagedTrades = sortedTrades.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedTrades.length / pageSize);

  // PNL map for calendar
  const pnlMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of trades) {
      if (t.status !== "Closed" || !t.closed_at) continue;
      const d = new Date(t.closed_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + (Number(t.net_pnl) || 0);
    }
    return map;
  }, [trades]);

  // Monthly PnL for calendar header
  const monthlyPnl = useMemo(() => {
    let total = 0;
    for (const [key, val] of Object.entries(pnlMap)) {
      const [y, m] = key.split("-").map(Number);
      if (y === calYear && m === calMonth + 1) total += val;
    }
    return total;
  }, [pnlMap, calMonth, calYear]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
    setPage(0);
  };

  // Loading / Error states
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-semibold text-white">Access Denied</h1>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-[#020408] text-white">
      {/* Top Bar */}
      <div className="border-b border-white/5 bg-[#020408]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{agencyName || "Trading Portal"}</p>
              <p className="text-[10px] text-slate-500">Closer: {closerName}</p>
            </div>
          </div>

          {/* Client Dropdown */}
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-slate-500" />
            <div className="relative">
              <select
                value={selectedClientId}
                onChange={(e) => { setSelectedClientId(e.target.value); setPage(0); }}
                className="bg-[#0a0e18] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer min-w-[200px]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex gap-0">
          <button
            onClick={() => setTab("activity")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              tab === "activity"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <Activity className="w-4 h-4" /> Trading Activity
          </button>
          <button
            onClick={() => setTab("payments")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              tab === "payments"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payments
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ── ACTIVITY TAB ───────────────────────────────── */}
        {tab === "activity" && (
          activityLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
          ) : (
            <div className="space-y-5">
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard icon={BarChart3} label="Total Trades" value={String(summary.total_trades)} color="indigo" />
                  <StatCard icon={Target} label="Win Rate" value={`${summary.win_rate}%`} color={summary.win_rate >= 50 ? "emerald" : "red"} />
                  <StatCard icon={DollarSign} label="Total P&L" value={`$${fmt(summary.total_pnl)}`} color={summary.total_pnl >= 0 ? "emerald" : "red"} />
                  <StatCard icon={TrendingUp} label="Avg Profit" value={`$${fmt(summary.avg_profit)}`} color={summary.avg_profit >= 0 ? "emerald" : "red"} />
                </div>
              )}

              {/* Performance Calendar */}
              <div className="bg-[#070a10] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-medium text-white">Daily Performance</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${monthlyPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {monthlyPnl >= 0 ? "+" : ""}${fmt(monthlyPnl)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="p-1 hover:bg-white/5 rounded">
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                      </button>
                      <span className="text-xs text-slate-400 w-28 text-center">
                        {new Date(calYear, calMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                      <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="p-1 hover:bg-white/5 rounded">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
                <MiniCalendar year={calYear} month={calMonth} pnlMap={pnlMap} />
              </div>

              {/* Trades Table */}
              <div className="bg-[#070a10] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-white/[0.02] text-slate-500 border-b border-white/5">
                      <tr>
                        {[
                          { key: "opened_at", label: "Date" },
                          { key: "symbol", label: "Symbol" },
                          { key: "trade_type", label: "Side" },
                          { key: "entry_price", label: "Entry" },
                          { key: "exit_price", label: "Exit" },
                          { key: "position_size", label: "Qty" },
                          { key: "net_pnl", label: "P&L" },
                          { key: "duration", label: "Duration" },
                        ].map((col) => (
                          <th
                            key={col.key}
                            onClick={() => handleSort(col.key)}
                            className="px-3 py-2.5 text-left cursor-pointer hover:text-white transition-colors select-none"
                          >
                            <div className="flex items-center gap-1">
                              {col.label}
                              {sortCol === col.key && <ArrowUpDown className="w-3 h-3 text-indigo-400" />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pagedTrades.map((t) => (
                        <tr key={t.id} className="hover:bg-white/[0.02] text-slate-300">
                          <td className="px-3 py-2.5">
                            <div className="text-white">{fmtDate(t.opened_at)}</div>
                            <div className="text-[10px] text-slate-600">{fmtTime(t.opened_at)}</div>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-white">{t.symbol}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              t.trade_type === "Buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>{t.trade_type}</span>
                          </td>
                          <td className="px-3 py-2.5 font-mono">{t.entry_price?.toFixed(2)}</td>
                          <td className="px-3 py-2.5 font-mono">{t.exit_price?.toFixed(2) || "—"}</td>
                          <td className="px-3 py-2.5">{t.position_size}</td>
                          <td className={`px-3 py-2.5 font-bold ${t.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {t.net_pnl >= 0 ? "+" : ""}${fmt(t.net_pnl)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">{t.duration || "—"}</td>
                        </tr>
                      ))}
                      {pagedTrades.length === 0 && (
                        <tr><td colSpan={8} className="px-3 py-12 text-center text-slate-600">No trades found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                    <span className="text-[10px] text-slate-600">
                      {sortedTrades.length} trades · Page {page + 1} of {totalPages}
                    </span>
                    <div className="flex gap-1">
                      <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-2 py-1 text-[10px] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded">Prev</button>
                      <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="px-2 py-1 text-[10px] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 rounded">Next</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* ── PAYMENTS TAB ───────────────────────────────── */}
        {tab === "payments" && (
          paymentsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
          ) : paymentData ? (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Wallet} label="Total Balance" value={`$${fmt(paymentData.summary.total_balance)}`} color="indigo" />
                <StatCard icon={DollarSign} label="Total P&L" value={`$${fmt(paymentData.summary.total_pnl)}`} color={paymentData.summary.total_pnl >= 0 ? "emerald" : "red"} />
                <StatCard icon={BarChart3} label="Total Trades" value={String(paymentData.summary.total_trades)} color="slate" />
                <StatCard icon={Target} label="Accounts" value={String(paymentData.summary.accounts_count)} color="indigo" />
              </div>

              {/* Account Balances */}
              <div className="bg-[#070a10] border border-white/5 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-slate-500" /> Account Balances
                </h3>
                <div className="space-y-2">
                  {paymentData.accounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-white">{a.label}</p>
                        <p className="text-[10px] text-slate-500">{a.platform} · Starting: ${fmt(a.starting_balance)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">${fmt(a.balance)}</p>
                        <p className={`text-[10px] font-medium ${a.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {a.total_pnl >= 0 ? "+" : ""}${fmt(a.total_pnl)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {paymentData.accounts.length === 0 && (
                    <p className="text-xs text-slate-600 text-center py-4">No accounts</p>
                  )}
                </div>
              </div>

              {/* Monthly Performance Periods */}
              <div className="bg-[#070a10] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <h3 className="text-sm font-medium text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" /> Monthly Performance
                  </h3>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-white/[0.02] text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Period</th>
                      <th className="px-4 py-2.5 text-right">P&L</th>
                      <th className="px-4 py-2.5 text-right">Trades</th>
                      <th className="px-4 py-2.5 text-right">Wins</th>
                      <th className="px-4 py-2.5 text-right">Losses</th>
                      <th className="px-4 py-2.5 text-right">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paymentData.periods.map((p) => (
                      <tr key={p.period} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white font-medium">{p.label}</td>
                        <td className={`px-4 py-3 text-right font-bold ${p.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {p.pnl >= 0 ? "+" : ""}${fmt(p.pnl)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400">{p.trades}</td>
                        <td className="px-4 py-3 text-right text-emerald-400">{p.wins}</td>
                        <td className="px-4 py-3 text-right text-red-400">{p.losses}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            p.win_rate >= 50 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>{p.win_rate}%</span>
                        </td>
                      </tr>
                    ))}
                    {paymentData.periods.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-600">No trading history</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-20">
              <p className="text-slate-600 text-sm">No payment data available</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    slate: "text-slate-400 bg-white/5 border-white/10",
  };
  const c = colors[color] || colors.slate;
  return (
    <div className={`border rounded-xl p-4 ${c.split(" ").slice(1).join(" ")}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${c.split(" ")[0]}`} />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-bold ${c.split(" ")[0]}`}>{value}</p>
    </div>
  );
}

/* ── Mini Calendar ───────────────────────────────────────── */

function MiniCalendar({ year, month, pnlMap }: { year: number; month: number; pnlMap: Record<string, number> }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="grid grid-cols-7 gap-1">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div key={d} className="text-[9px] text-slate-600 text-center py-1">{d}</div>
      ))}
      {days.map((d, i) => {
        if (d === null) return <div key={`empty-${i}`} />;
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const pnl = pnlMap[key];
        const hasData = pnl !== undefined;
        const isPositive = hasData && pnl >= 0;
        return (
          <div
            key={key}
            className={`text-center py-1.5 rounded text-[10px] ${
              hasData
                ? isPositive
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-red-500/15 text-red-300"
                : "text-slate-600"
            }`}
            title={hasData ? `$${pnl.toFixed(2)}` : undefined}
          >
            <div>{d}</div>
            {hasData && <div className="text-[8px] mt-0.5">${Math.abs(pnl) >= 1000 ? `${(pnl / 1000).toFixed(1)}k` : pnl.toFixed(0)}</div>}
          </div>
        );
      })}
    </div>
  );
}
