"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  BarChart,
  Link as LinkIcon,
  Activity,
  ArrowUpRight,
  X,
  Zap,
  PlusCircle,
  Sliders,
  ChevronRight,
  CreditCard,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
type DashboardData = {
  client_name: string;
  total_value: number;
  total_value_change: number;
  todays_pnl: number;
  todays_pnl_pct: number;
  trades_today: number;
  connected_accounts_count: number;
  active_trades_count: number;
  profitable_trades: number;
  losing_trades: number;
  starting_balance: number;
  net_pnl: number;
  growth_pct: number;
  accounts: DashboardAccount[];
  active_algos: DashboardAlgo[];
  positions: DashboardPosition[];
  recent_trades: DashboardTrade[];
  payment_status: PaymentStatus;
};

type DashboardAccount = {
  id: string;
  broker: string;
  broker_short: string;
  broker_color: string;
  broker_text_color: string;
  account_mask: string;
  status: string;
  balance: number;
  daily_pnl: number;
  health_pct: number;
};

type DashboardAlgo = {
  id: string;
  name: string;
  category: string;
  category_color: string;
  win_rate: number;
  total_trades: number;
  profit: number;
};

type DashboardPosition = {
  id: string;
  symbol: string;
  symbol_icon: string;
  symbol_bg: string;
  symbol_text_color: string;
  type: "Long" | "Short";
  entry: string;
  current: string;
  pnl: number;
};

type DashboardTrade = {
  id: string;
  time: string;
  symbol: string;
  type: string;
  result: number;
  status: string;
  entry?: string;
  exit?: string;
  duration?: string;
  algo?: string;
};

type PaymentStatus = {
  period: string;
  status: string;
  next_date: string;
  next_amount: number;
};

// ─── Mock Data (inline fallback) ─────────────────────────
const MOCK_DATA: DashboardData = {
  client_name: "Alex",
  total_value: 12450.0,
  total_value_change: 3.7,
  todays_pnl: 127.5,
  todays_pnl_pct: 1.02,
  trades_today: 5,
  connected_accounts_count: 2,
  active_trades_count: 3,
  profitable_trades: 2,
  losing_trades: 1,
  starting_balance: 10000.0,
  net_pnl: 2450.0,
  growth_pct: 24.5,
  accounts: [
    {
      id: "acc-1",
      broker: "OANDA",
      broker_short: "MT5",
      broker_color: "#262626",
      broker_text_color: "#ffffff",
      account_mask: "••••5678",
      status: "Active",
      balance: 10500.0,
      daily_pnl: 75.0,
      health_pct: 75,
    },
    {
      id: "acc-2",
      broker: "Binance",
      broker_short: "BN",
      broker_color: "#FCD535",
      broker_text_color: "#000000",
      account_mask: "••••1234",
      status: "Active",
      balance: 1950.0,
      daily_pnl: 52.5,
      health_pct: 50,
    },
  ],
  active_algos: [
    {
      id: "algo-1",
      name: "Gold Scalper",
      category: "Forex",
      category_color: "text-blue-400 bg-blue-500/10",
      win_rate: 68,
      total_trades: 147,
      profit: 1200,
    },
    {
      id: "algo-2",
      name: "BTC Trend",
      category: "Crypto",
      category_color: "text-yellow-400 bg-yellow-500/10",
      win_rate: 72,
      total_trades: 89,
      profit: 1200,
    },
  ],
  positions: [
    {
      id: "pos-1",
      symbol: "BTC/USDT",
      symbol_icon: "₿",
      symbol_bg: "#F7931A",
      symbol_text_color: "#ffffff",
      type: "Long",
      entry: "$42,500",
      current: "$42,750",
      pnl: 125.0,
    },
    {
      id: "pos-2",
      symbol: "EUR/USD",
      symbol_icon: "€",
      symbol_bg: "#475569",
      symbol_text_color: "#ffffff",
      type: "Short",
      entry: "1.0920",
      current: "1.0915",
      pnl: 50.0,
    },
    {
      id: "pos-3",
      symbol: "XAU/USD",
      symbol_icon: "G",
      symbol_bg: "#FCD535",
      symbol_text_color: "#000000",
      type: "Long",
      entry: "2035.50",
      current: "2033.00",
      pnl: -25.0,
    },
  ],
  recent_trades: [
    {
      id: "t-1",
      time: "14:25",
      symbol: "USD/JPY",
      type: "Buy",
      result: 45.2,
      status: "Closed",
      entry: "142.500",
      exit: "142.650",
      duration: "12m 30s",
      algo: "Scalper Pro",
    },
    {
      id: "t-2",
      time: "13:10",
      symbol: "GBP/USD",
      type: "Sell",
      result: -12.5,
      status: "Closed",
    },
    {
      id: "t-3",
      time: "11:45",
      symbol: "ETH/USDT",
      type: "Long",
      result: 89.0,
      status: "Closed",
    },
  ],
  payment_status: {
    period: "Dec 1 - Dec 31",
    status: "Paid",
    next_date: "Jan 1, 2025",
    next_amount: 99.0,
  },
};

// ─── Helpers ─────────────────────────────────────────────
function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatCompact(n: number): string {
  if (Math.abs(n) >= 1000) {
    return `$${(n / 1000).toFixed(1)}k`;
  }
  return formatCurrency(n);
}

// ─── Main Page ───────────────────────────────────────────
export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [showAlert, setShowAlert] = useState(true);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState("7D");

  // Fetch from API (falls back to mock)
  useEffect(() => {
    fetch("/api/client-dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setData(json.data);
      })
      .catch(() => {
        // Use mock data on failure
      });
  }, []);

  const floatingPnl = data.positions.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <div className="p-4 lg:p-8">
      {/* Alert Banner */}
      {showAlert && (
        <div className="mb-6 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
              <Zap className="w-3 h-3 text-blue-400" />
            </div>
            <p className="text-xs text-blue-200">
              <span className="font-semibold text-blue-100">
                New Algorithm Assigned:
              </span>{" "}
              BTC Trend Follower is now active on your account.
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-blue-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Account Value */}
        <MetricCard
          icon={<Wallet className="w-5 h-5" />}
          badge={`+${data.total_value_change}%`}
          badgePositive
          label="Total Account Value"
          value={formatCurrency(data.total_value)}
          valueColor="text-white"
          footer={
            <svg
              className="w-full h-8 overflow-visible"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
            >
              <path
                d="M0 15 Q 10 18, 20 12 T 40 14 T 60 8 T 80 10 T 100 5"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          }
        />

        {/* Today's P&L */}
        <MetricCard
          icon={<BarChart className="w-5 h-5" />}
          badge={`+${data.todays_pnl_pct}%`}
          badgePositive
          label="Today's Profit/Loss"
          value={`+${formatCurrency(data.todays_pnl)}`}
          valueColor="text-emerald-400"
          footer={
            <p className="text-xs text-slate-500">
              {data.trades_today} trades executed today
            </p>
          }
        />

        {/* Connected Accounts */}
        <MetricCard
          icon={<LinkIcon className="w-5 h-5" />}
          badge="Active"
          badgePositive
          label="Connected Accounts"
          value={String(data.connected_accounts_count)}
          valueColor="text-white"
          footer={
            <div className="flex -space-x-2">
              {data.accounts.map((a) => (
                <div
                  key={a.id}
                  className="w-6 h-6 rounded-full border border-[#0B0E14] flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: a.broker_color,
                    color: a.broker_text_color,
                  }}
                  title={a.broker}
                >
                  {a.broker_short[0]}
                </div>
              ))}
            </div>
          }
        />

        {/* Active Trades */}
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          badgeElement={
            <button className="text-xs text-blue-500 hover:text-white transition-colors">
              View All
            </button>
          }
          label="Active Trades"
          value={String(data.active_trades_count)}
          valueColor="text-white"
          footer={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                {data.profitable_trades} Profitable
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{" "}
                {data.losing_trades} At Loss
              </span>
            </div>
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Performance Chart */}
          <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6 hover:border-white/8 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Account Performance
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Total balance across all accounts
                </p>
              </div>
              <div className="flex p-1 bg-white/5 rounded-lg w-fit">
                {["24H", "7D", "1M", "ALL"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3 py-1 text-xs font-medium transition-colors rounded-md ${
                      chartTimeframe === tf
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-64 w-full">
              {/* Y-Axis */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-600 font-mono py-2">
                <span>$12.5k</span>
                <span>$11.8k</span>
                <span>$11.2k</span>
                <span>$10.5k</span>
                <span>$10.0k</span>
              </div>

              {/* Chart Area */}
              <div className="absolute left-10 right-0 top-0 bottom-0">
                {/* Grid Lines */}
                <div className="w-full h-full flex flex-col justify-between py-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-full h-px bg-white/5 border-t border-dashed border-white/5"
                    />
                  ))}
                </div>

                {/* SVG Chart */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 220 C 50 215, 100 200, 150 180 C 200 160, 250 190, 300 150 C 350 110, 400 130, 450 100 C 500 70, 550 80, 600 40 C 650 10, 700 30, 800 0 L 800 250 L 0 250 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0 220 C 50 215, 100 200, 150 180 C 200 160, 250 190, 300 150 C 350 110, 400 130, 450 100 C 500 70, 550 80, 600 40 C 650 10, 700 30, 800 0"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx="600"
                    cy="40"
                    r="4"
                    fill="#0B0E14"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                </svg>

                {/* Floating Tooltip */}
                <div className="absolute top-2 right-1/4 transform -translate-x-1/2 bg-[#131720] border border-white/10 rounded-lg p-2 shadow-xl pointer-events-none">
                  <p className="text-[10px] text-slate-400">Dec 20, 14:00</p>
                  <p className="text-sm font-bold text-white">$12,145.20</p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Starting Bal
                </p>
                <p className="text-sm font-medium text-slate-300 font-mono">
                  {formatCurrency(data.starting_balance)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Net P&L
                </p>
                <p className="text-sm font-medium text-emerald-400 font-mono">
                  +{formatCurrency(data.net_pnl)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Growth
                </p>
                <p className="text-sm font-medium text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
                  +{data.growth_pct}%
                </p>
              </div>
            </div>
          </div>

          {/* Active Positions */}
          <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden hover:border-white/8 transition-colors">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-white">
                  Active Positions
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 flex items-center gap-1">
                  <span className="relative w-2 h-2 rounded-full bg-blue-500 inline-block">
                    <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-40" />
                  </span>
                  {data.positions.length} Open
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="pl-5 pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Entry
                    </th>
                    <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Current
                    </th>
                    <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="pr-5 pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.positions.map((pos) => (
                    <tr
                      key={pos.id}
                      className="group cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="pl-5 py-3 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold"
                            style={{
                              backgroundColor: pos.symbol_bg,
                              color: pos.symbol_text_color,
                            }}
                          >
                            {pos.symbol_icon}
                          </div>
                          <span className="font-medium text-white">
                            {pos.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 border-b border-white/5">
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
                            pos.type === "Long"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/10"
                              : "text-red-400 bg-red-500/10 border-red-500/10"
                          }`}
                        >
                          {pos.type}
                        </span>
                      </td>
                      <td className="py-3 border-b border-white/5 font-mono text-slate-400">
                        {pos.entry}
                      </td>
                      <td className="py-3 border-b border-white/5 font-mono text-white">
                        {pos.current}
                      </td>
                      <td
                        className={`py-3 border-b border-white/5 font-mono font-medium ${
                          pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {pos.pnl >= 0 ? "+" : ""}
                        {formatCurrency(pos.pnl)}
                      </td>
                      <td className="pr-5 py-3 border-b border-white/5 text-right">
                        <button className="text-xs font-medium text-slate-500 hover:text-white transition-colors">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-xs px-5">
              <span className="text-slate-500">Total Floating P&L</span>
              <span
                className={`font-bold font-mono ${
                  floatingPnl >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {floatingPnl >= 0 ? "+" : ""}
                {formatCurrency(floatingPnl)}
              </span>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden hover:border-white/8 transition-colors">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Recent Trades
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Last 10 executions across accounts
                </p>
              </div>
              <button className="text-xs font-medium text-blue-500 hover:text-white transition-colors">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="pl-5 pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="pr-5 pb-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_trades.map((trade) => (
                    <tr key={trade.id}>
                      <td
                        className="pl-5 py-3 border-b border-white/5 text-slate-400 text-xs cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() =>
                          setExpandedTrade(
                            expandedTrade === trade.id ? null : trade.id
                          )
                        }
                        colSpan={0}
                      >
                        {trade.time}
                      </td>
                      <td
                        className="py-3 border-b border-white/5 text-white font-medium cursor-pointer hover:bg-white/[0.02]"
                        onClick={() =>
                          setExpandedTrade(
                            expandedTrade === trade.id ? null : trade.id
                          )
                        }
                      >
                        {trade.symbol}
                      </td>
                      <td
                        className={`py-3 border-b border-white/5 text-xs cursor-pointer hover:bg-white/[0.02] ${
                          trade.type === "Buy" || trade.type === "Long"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                        onClick={() =>
                          setExpandedTrade(
                            expandedTrade === trade.id ? null : trade.id
                          )
                        }
                      >
                        {trade.type}
                      </td>
                      <td
                        className={`py-3 border-b border-white/5 font-mono font-medium cursor-pointer hover:bg-white/[0.02] ${
                          trade.result >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                        onClick={() =>
                          setExpandedTrade(
                            expandedTrade === trade.id ? null : trade.id
                          )
                        }
                      >
                        {trade.result >= 0 ? "+" : ""}
                        {formatCurrency(trade.result)}
                      </td>
                      <td
                        className="pr-5 py-3 border-b border-white/5 text-right cursor-pointer hover:bg-white/[0.02]"
                        onClick={() =>
                          setExpandedTrade(
                            expandedTrade === trade.id ? null : trade.id
                          )
                        }
                      >
                        <span className="text-[10px] text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 hover:border-white/8 transition-colors">
            <h3 className="text-sm font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20 group">
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    Connect New Account
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all group">
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span className="font-medium text-sm">
                    Adjust Risk Settings
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 hover:border-white/8 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Accounts</h3>
              <button className="text-xs text-blue-500 hover:text-white transition-colors">
                Manage
              </button>
            </div>
            <div className="space-y-3">
              {data.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-lg bg-[#020408] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: acc.broker_color,
                          color: acc.broker_text_color,
                        }}
                      >
                        {acc.broker_short}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">
                          {acc.broker}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {acc.account_mask}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">
                      {acc.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-mono font-medium text-white">
                      {formatCurrency(acc.balance)}
                    </p>
                    <p className="text-xs font-mono text-emerald-400">
                      +{formatCurrency(acc.daily_pnl)}
                    </p>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${acc.health_pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-slate-500 hover:text-white hover:border-white/20 transition-all">
                + Connect Another Account
              </button>
            </div>
          </div>

          {/* Active Algorithms */}
          <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 hover:border-white/8 transition-colors">
            <h3 className="text-sm font-semibold text-white mb-1">
              Active Algorithms
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Assigned by your account manager
            </p>
            <div className="space-y-4">
              {data.active_algos.map((algo) => (
                <div key={algo.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-medium text-white">
                        {algo.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 rounded ${algo.category_color}`}
                    >
                      {algo.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 bg-white/5 p-2 rounded-lg border border-white/5">
                    <div className="text-center">
                      <p className="text-[9px] text-slate-500 uppercase">
                        Win Rate
                      </p>
                      <p className="text-xs font-medium text-white">
                        {algo.win_rate}%
                      </p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase">
                        Trades
                      </p>
                      <p className="text-xs font-medium text-white">
                        {algo.total_trades}
                      </p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase">
                        Profit
                      </p>
                      <p className="text-xs font-medium text-emerald-400">
                        +{formatCompact(algo.profit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 relative overflow-hidden hover:border-white/8 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Payment Status
                </h3>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[10px] text-slate-500 uppercase mb-1">
                  Current Period
                </p>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white">
                    {data.payment_status.period}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase">
                    {data.payment_status.status} ✓
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-[10px] text-slate-500 uppercase mb-1">
                  Next Payment
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white">
                    {data.payment_status.next_date}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    ~{formatCurrency(data.payment_status.next_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
        <p>© 2025 AlgoFinTech Inc. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="/privacy-policy" className="hover:text-slate-400">
            Privacy Policy
          </a>
          <a href="/cookie-policy" className="hover:text-slate-400">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Metric Card Component ───────────────────────────────
function MetricCard({
  icon,
  badge,
  badgePositive,
  badgeElement,
  label,
  value,
  valueColor,
  footer,
}: {
  icon: React.ReactNode;
  badge?: string;
  badgePositive?: boolean;
  badgeElement?: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  footer: React.ReactNode;
}) {
  return (
    <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/8 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-white transition-colors">
          {icon}
        </div>
        {badgeElement
          ? badgeElement
          : badge && (
              <span
                className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded border ${
                  badgePositive
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/10"
                    : "text-red-400 bg-red-400/10 border-red-400/10"
                }`}
              >
                {badge}
                {badgePositive && <ArrowUpRight className="w-3 h-3" />}
              </span>
            )}
      </div>
      <div className="mb-4">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </h3>
        <p className={`text-2xl font-semibold tracking-tight ${valueColor}`}>
          {value}
        </p>
      </div>
      {footer}
    </div>
  );
}
