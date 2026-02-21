"use client";

import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  Activity,
  TrendingUp,
  Newspaper,
  Megaphone,
  Zap,
  CircleHelp,
  ChevronDown,
  Search,
  Bell,
  Calendar,
  Settings,
} from "lucide-react";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Chart: any;
  }
}

export default function DashboardPreview() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initChart = () => {
      if (!chartRef.current || !window.Chart) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      const blueGradient = ctx.createLinearGradient(0, 0, 0, 300);
      blueGradient.addColorStop(0, "rgba(59, 130, 246, 0.15)");
      blueGradient.addColorStop(1, "rgba(59, 130, 246, 0)");

      const emeraldGradient = ctx.createLinearGradient(0, 0, 0, 300);
      emeraldGradient.addColorStop(0, "rgba(16, 185, 129, 0.15)");
      emeraldGradient.addColorStop(1, "rgba(16, 185, 129, 0)");

      const purpleGradient = ctx.createLinearGradient(0, 0, 0, 300);
      purpleGradient.addColorStop(0, "rgba(168, 85, 247, 0.15)");
      purpleGradient.addColorStop(1, "rgba(168, 85, 247, 0)");

      chartInstanceRef.current = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: ["Oct", "Nov", "Dec", "Jan"],
          datasets: [
            {
              label: "Revenue",
              data: [115.2, 128.4, 136.9, 142.9],
              borderColor: "#3b82f6",
              backgroundColor: blueGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: "Profit",
              data: [78.5, 88.2, 94.1, 98.4],
              borderColor: "#10b981",
              backgroundColor: emeraldGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: "Performance Fee",
              data: [15.7, 17.6, 18.8, 19.7],
              borderColor: "#a855f7",
              backgroundColor: purpleGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(11, 14, 20, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderWidth: 1,
              titleColor: "#94a3b8",
              bodyColor: "#fff",
              padding: 12,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function (context: any) {
                  return (
                    " " +
                    context.dataset.label +
                    ": $" +
                    context.parsed.y.toFixed(1) +
                    "k"
                  );
                },
              },
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(255, 255, 255, 0.03)" },
              ticks: { color: "#64748b", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(255, 255, 255, 0.03)" },
              ticks: {
                color: "#64748b",
                font: { size: 11 },
                callback: function (value: number) {
                  return "$" + value + "k";
                },
              },
            },
          },
        },
      });
    };

    // Wait for Chart.js to load
    const checkChart = setInterval(() => {
      if (window.Chart) {
        clearInterval(checkChart);
        initChart();
      }
    }, 100);

    return () => {
      clearInterval(checkChart);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="mt-20 w-full max-w-6xl relative animate-float mx-auto">
      <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent z-20 h-full pointer-events-none"></div>

      {/* Main Dashboard Container */}
      <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-[#0A0C10] flex flex-col md:flex-row h-[700px] md:h-[650px] relative z-10">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex-col shrink-0 hidden md:flex">
          {/* Logo */}
          <div className="flex h-14 border-white/5 border-b px-4 items-center">
            <div className="flex items-center gap-3 p-2 -ml-2 rounded-lg w-full text-left group">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="16" height="16" x="4" y="4" rx="2" />
                  <rect width="6" height="6" x="9" y="9" rx="1" />
                  <path d="M15 2v2" />
                  <path d="M15 20v2" />
                  <path d="M2 15h2" />
                  <path d="M2 9h2" />
                  <path d="M20 15h2" />
                  <path d="M20 9h2" />
                  <path d="M9 2v2" />
                  <path d="M9 20v2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-200 tracking-tight leading-none">
                  AlgoStack
                </div>
                <div className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5">
                  Pro Environment
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pr-3 pb-4 pl-3 space-y-6">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Jump to..."
                className="w-full bg-[#13161C] border border-white/5 rounded-lg py-1.5 pl-8 pr-8 text-xs text-slate-300 focus:outline-none placeholder:text-slate-600"
                readOnly
              />
              <div className="absolute right-2 top-1.5 flex items-center gap-0.5 border border-white/10 rounded px-1.5 py-px bg-white/5">
                <span className="text-[9px] text-slate-500 font-medium">
                  ⌘
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  K
                </span>
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase flex font-semibold text-slate-500 tracking-wider mb-2 pr-2 pl-2 items-center justify-between">
                Platform
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
              <a className="flex items-center gap-2.5 text-sm font-medium text-blue-400 bg-blue-500/10 border-blue-500/10 border rounded-md pt-1.5 pr-2 pb-1.5 pl-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:text-slate-200 hover:bg-white/5 transition-colors">
                <Users className="w-4 h-4 text-slate-500" />
                Clients
              </a>
            </div>

            {/* Algorithms */}
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 pr-2 pl-2">
                Algorithms
              </div>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="flex-1">Alpha Scalp V2</span>
                <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  BTC
                </span>
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                <span className="flex-1">Gold Trend</span>
                <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  XAU
                </span>
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <span className="flex-1">Neural Net Eq</span>
                <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  NAS
                </span>
              </a>
            </div>

            {/* Payments */}
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 pr-2 pl-2">
                Payments &amp; Commissions
              </div>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <DollarSign className="w-4 h-4 text-slate-500" />
                Commission Earnings
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <CreditCard className="w-4 h-4 text-slate-500" />
                Payment Management
              </a>
            </div>

            {/* News */}
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 pr-2 pl-2">
                News &amp; Updates
              </div>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <Activity className="w-4 h-4 text-slate-500" />
                Platform Updates
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                New Strategies
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <Newspaper className="w-4 h-4 text-slate-500" />
                Industry News
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <Megaphone className="w-4 h-4 text-slate-500" />
                Announcements
              </a>
            </div>

            {/* Help */}
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 pr-2 pl-2">
                Help Center
              </div>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <Zap className="w-4 h-4 text-slate-500" />
                Features
              </a>
              <a className="flex items-center gap-2.5 text-sm font-medium text-slate-400 rounded-md pt-1.5 pr-2 pb-1.5 pl-2 hover:bg-white/5">
                <CircleHelp className="w-4 h-4 text-slate-500" />
                How To
              </a>
            </div>
          </div>

          {/* User */}
          <div className="p-3 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3 w-full p-2 rounded-lg text-left">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 ring-1 ring-white/10"></div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#0B0E14] rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  Ali Husni
                </div>
                <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  Pro Plan
                  <span className="inline-block w-0.5 h-0.5 rounded-full bg-slate-500"></span>
                  $240k
                </div>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0A0C10]">
          {/* Header */}
          <header className="flex h-14 border-white/5 border-b px-6 items-center justify-between shrink-0 bg-[#0A0C10]/95 backdrop-blur z-20">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">Platform</span>
              <span className="text-slate-700">/</span>
              <span className="text-white font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                System Operational
              </div>
              <div className="h-4 w-px bg-white/10 mx-1"></div>
              <button className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400">
                <Bell className="w-4.5 h-4.5" />
              </button>
              <button className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400">
                <CircleHelp className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="min-h-full flex flex-col pt-6">
              <div className="px-6 flex flex-col gap-6">
                {/* Welcome */}
                <div className="flex items-center justify-between shrink-0">
                  <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">
                      Overview
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                      Welcome back, here&apos;s what&apos;s happening today.
                    </p>
                  </div>
                  <button className="hover:bg-white/5 transition-colors flex text-sm font-medium text-white border-white/10 border rounded-lg pt-2 pr-4 pb-2 pl-4 gap-2 items-center">
                    <Calendar className="w-4 h-4" />
                    Dec 18 - Jan 18
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Active Clients"
                    value="847"
                    change="+24"
                    sub="this month"
                  />
                  <StatCard
                    label="Total AUM"
                    value="$2.4B"
                    change="+18.3%"
                    sub="vs last quarter"
                  />
                  <StatCard
                    label="P&L"
                    value="+$42.8M"
                    change="+12.7%"
                    sub="YTD"
                  />
                  <div className="p-5 rounded-xl border border-white/5 bg-[#13161C]">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
                      Active Positions
                    </div>
                    <div className="text-2xl font-semibold text-white tracking-tight mb-2">
                      1,284
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-medium text-xs">
                        892 Long
                      </span>
                      <span className="text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-medium text-xs">
                        392 Short
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chart + Strategies */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 gap-4">
                  {/* Chart */}
                  <div className="lg:col-span-8 flex flex-col overflow-hidden bg-[#13161C] border-white/5 border rounded-xl p-5 relative">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                      <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">
                          Agency Performance
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-xs text-slate-400 font-medium">
                              Revenue
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs text-slate-400 font-medium">
                              Profit
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span className="text-xs text-slate-400 font-medium">
                              Performance Fee
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                        {["1M", "3M", "6M", "YTD"].map((tf) => (
                          <button
                            key={tf}
                            className={`px-3 py-1 rounded-md text-xs font-medium ${
                              tf === "3M"
                                ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                                : "text-slate-400"
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 relative min-h-[240px] w-full">
                      <canvas ref={chartRef} className="w-full h-full block"></canvas>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-white/5 border-t mt-2 pt-4">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
                          Monthly Revenue
                        </div>
                        <div className="text-sm font-semibold text-white">
                          $142,890.00
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
                          Monthly Profit
                        </div>
                        <div className="text-sm font-semibold text-white">
                          $98,450.00
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
                          Performance Fee
                        </div>
                        <div className="text-sm font-semibold text-white">
                          $19,690.00
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Strategies */}
                  <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
                    <div className="flex-1 bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col min-h-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-sm font-semibold text-white">
                          Top Strategies
                        </h3>
                        <button className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium">
                          View All
                        </button>
                      </div>
                      <div className="flex-1 overflow-auto custom-scrollbar space-y-1 -mx-2 px-2">
                        <StrategyRow
                          initials="AS"
                          name="Alpha Scalp V2"
                          aum="$1.2M AUM"
                          change="+14.2%"
                          color="indigo"
                        />
                        <StrategyRow
                          initials="GT"
                          name="Gold Trend"
                          aum="$840k AUM"
                          change="+8.1%"
                          color="yellow"
                        />
                        <StrategyRow
                          initials="NN"
                          name="Neural Net Eq"
                          aum="$420k AUM"
                          change="+5.4%"
                          color="blue"
                        />
                        <StrategyRow
                          initials="L"
                          name="Legacy Mix"
                          aum="$180k AUM"
                          change="+1.2%"
                          color="slate"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  sub,
}: {
  label: string;
  value: string;
  change: string;
  sub: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-white/5 bg-[#13161C] hover:border-white/10 transition-colors">
      <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-2xl font-semibold text-white tracking-tight mb-2">
        {value}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium text-xs">
          <TrendingUp className="w-3 h-3" />
          {change}
        </span>
        <span className="text-slate-500 text-xs">{sub}</span>
      </div>
    </div>
  );
}

function StrategyRow({
  initials,
  name,
  aum,
  change,
  color,
}: {
  initials: string;
  name: string;
  aum: string;
  change: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    slate: "bg-slate-500/10 border-slate-500/20 text-slate-300",
  };
  const isPositive = change.startsWith("+") && parseFloat(change) > 2;

  return (
    <div className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${colorMap[color]}`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-white truncate">{name}</div>
          <div className="text-[10px] text-slate-500">{aum}</div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div
          className={`text-xs font-semibold ${
            isPositive ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          {change}
        </div>
        <div className="text-[10px] text-slate-500">30d</div>
      </div>
    </div>
  );
}
