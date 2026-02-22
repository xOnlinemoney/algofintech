"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  Cpu,
  LineChart,
  Wallet,
  FileText,
  Settings,
  Bell,
  ChevronDown,
  Search,
  Download,
  Plus,
  MoreHorizontal,
  TrendingUp,
  BarChart2,
  Activity,
  Layers,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface AlgorithmData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  risk_level?: string;
  roi?: string;
  drawdown?: string;
  win_rate?: string;
  sharpe_ratio?: number | null;
  pairs?: string | null;
  agencies_count: number;
  clients_count: number;
  last_updated?: string | null;
  created_at: string;
}

interface ApiResponse {
  algorithms: AlgorithmData[];
  summary: { total: number; active: number; beta: number; paused: number; deprecated: number };
}

// ─── Helpers ────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parsePercent(val: string): number {
  return parseFloat(val.replace(/[^0-9.\-]/g, "")) || 0;
}

// ─── Category Styling ───────────────────────────────────
function getCategoryStyle(category: string) {
  switch (category) {
    case "Forex":
      return { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", icon: TrendingUp };
    case "Crypto":
      return { bg: "bg-purple-500/10 border-purple-500/20 text-purple-400", icon: BarChart2 };
    case "Stocks":
      return { bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400", icon: Layers };
    case "Futures":
      return { bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", icon: Activity };
    default:
      return { bg: "bg-slate-500/10 border-slate-500/20 text-slate-400", icon: Cpu };
  }
}

// ─── Sidebar Nav Item ───────────────────────────────────
function NavItem({
  icon: Icon,
  label,
  active,
  badge,
  badgeColor,
  href,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
  badgeColor?: string;
  href?: string;
}) {
  return (
    <a
      href={href || "#"}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
        active
          ? "text-white bg-blue-500/10 border border-blue-500/10"
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "group-hover:text-slate-300"}`} />
      <span className={active ? "font-medium" : ""}>{label}</span>
      {badge && (
        <span
          className={`ml-auto text-[10px] px-1.5 py-0.5 rounded border ${
            badgeColor || "bg-red-500/20 text-red-400 border-red-500/20"
          }`}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

// ─── Status Badge ───────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
        </span>
      );
    case "beta":
    case "paused":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> {status === "paused" ? "Paused" : "Beta"}
        </span>
      );
    case "deprecated":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/30 border border-slate-600/30 text-slate-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Deprecated
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {status}
        </span>
      );
  }
}

// ─── Risk Bar ───────────────────────────────────────────
function RiskBar({ level }: { level: string }) {
  const config: Record<string, { label: string; color: string; bars: number }> = {
    low: { label: "Low Risk", color: "bg-blue-500", bars: 1 },
    medium: { label: "Medium", color: "bg-yellow-500", bars: 2 },
    high: { label: "High Risk", color: "bg-orange-500", bars: 3 },
  };
  const c = config[level] || config.medium;
  const labelColor = level === "low" ? "text-blue-400" : level === "high" ? "text-orange-400" : "text-yellow-400";

  return (
    <div className="flex flex-col gap-1">
      <span className={`text-xs font-medium ${labelColor}`}>{c.label}</span>
      <div className="flex gap-0.5 h-1 w-12">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 ${i <= c.bars ? c.color : "bg-white/10"} ${i === 1 ? "rounded-l-sm" : ""} ${i === 3 ? "rounded-r-sm" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function AdminAlgorithmLibrary() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "beta" | "paused" | "deprecated">("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("performance");

  useEffect(() => {
    fetch("/api/admin/algorithms")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter & sort
  let filtered = data?.algorithms || [];

  if (activeTab !== "all") {
    // "beta" tab shows both "beta" and "paused" statuses
    if (activeTab === "beta") {
      filtered = filtered.filter((a) => a.status === "beta" || a.status === "paused");
    } else {
      filtered = filtered.filter((a) => a.status === activeTab);
    }
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        (a.description || "").toLowerCase().includes(term) ||
        (a.pairs || "").toLowerCase().includes(term)
    );
  }
  if (assetFilter !== "all") {
    filtered = filtered.filter((a) => a.category === assetFilter);
  }
  if (riskFilter !== "all") {
    filtered = filtered.filter((a) => a.risk_level === riskFilter);
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "performance":
        return parsePercent(b.roi || "0%") - parsePercent(a.roi || "0%");
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "users":
        return b.clients_count - a.clients_count;
      default:
        return 0;
    }
  });

  return (
    <div className="antialiased h-screen w-screen overflow-hidden flex text-sm font-sans text-slate-400" style={{ background: "#020408" }}>
      {/* Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .custom-checkbox {
          appearance: none; background-color: rgba(255,255,255,0.05); margin: 0;
          width: 1.15em; height: 1.15em; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.25em; display: grid; place-content: center; transition: all 0.2s; cursor: pointer;
        }
        .custom-checkbox::before {
          content: ""; width: 0.65em; height: 0.65em; transform: scale(0);
          transition: 120ms transform ease-in-out; box-shadow: inset 1em 1em white;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .custom-checkbox:checked { background-color: #3b82f6; border-color: #3b82f6; }
        .custom-checkbox:checked::before { transform: scale(1); }
        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
      `}</style>

      {/* ═══ Sidebar ═══ */}
      <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex flex-col shrink-0 z-20">
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-white font-semibold tracking-tight">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            AlgoFinTech Admin
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Agency Management</div>
          <NavItem icon={Building2} label="All Agencies" href="/dashboard/agencies" />
          <NavItem icon={UserPlus} label="Pending Invitations" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Client Management</div>
          <NavItem icon={Users} label="All Clients" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Algorithms</div>
          <NavItem icon={Cpu} label="Algorithm Library" active href="/dashboard/algorithms" />
          <NavItem icon={LineChart} label="Performance" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Finance</div>
          <NavItem icon={Wallet} label="Revenue Overview" />
          <NavItem icon={FileText} label="Invoices" />
        </nav>
        <div className="p-3 border-t border-white/5">
          <NavItem icon={Settings} label="System Settings" />
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#020408" }}>
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Algorithms</span>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium">Library</span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020408]" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-lg transition-colors">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff" alt="Admin" className="w-7 h-7 rounded-md" />
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-white">Admin</div>
                <div className="text-[10px] text-slate-500">Super Admin</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto custom-scrollbar flex flex-col">
          <div className="px-8 pt-8 pb-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Algorithm Library</h1>
                <p className="text-slate-500 text-xs">Manage trading strategies, risk profiles, and agency assignments.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 hover:text-white rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> Add New Algorithm
                </button>
              </div>
            </div>

            {/* Tabs & Filters */}
            <div className="flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "all" ? "text-white border-blue-500" : "text-slate-400 hover:text-white border-transparent hover:border-white/10"}`}
                >
                  All Algorithms
                </button>
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "active" ? "text-white border-blue-500" : "text-slate-400 hover:text-white border-transparent hover:border-white/10"}`}
                >
                  Active{" "}
                  <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-slate-300">
                    {data?.summary.active || 0}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("beta")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "beta" ? "text-white border-blue-500" : "text-slate-400 hover:text-white border-transparent hover:border-white/10"}`}
                >
                  Beta{" "}
                  <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-slate-300">
                    {(data?.summary.beta || 0) + (data?.summary.paused || 0)}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("deprecated")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === "deprecated" ? "text-white border-blue-500" : "text-slate-400 hover:text-white border-transparent hover:border-white/10"}`}
                >
                  Deprecated
                </button>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center py-2">
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search algorithms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden sm:block" />
                  <select
                    value={assetFilter}
                    onChange={(e) => setAssetFilter(e.target.value)}
                    className="custom-select bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="all">Asset Class: All</option>
                    <option value="Forex">Forex</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Stocks">Stocks</option>
                    <option value="Futures">Futures</option>
                  </select>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="custom-select bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    <option value="all">Risk: All</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 self-end xl:self-auto">
                  <span className="text-xs text-slate-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="custom-select bg-transparent border-none py-2 pr-6 text-xs text-white font-medium focus:outline-none cursor-pointer p-0"
                  >
                    <option value="performance">Performance (High to Low)</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="date">Date Added</option>
                    <option value="users">Most Users</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-8 pb-8 flex-1">
            <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden w-full">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.02] text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="pl-5 pr-3 py-3 w-10"><input type="checkbox" className="custom-checkbox" /></th>
                      <th className="px-4 py-3 min-w-[240px]">Algorithm</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Risk Profile</th>
                      <th className="px-4 py-3 min-w-[200px]">Performance Metrics (30d)</th>
                      <th className="px-4 py-3 text-right">Agencies</th>
                      <th className="px-4 py-3 text-right">Clients</th>
                      <th className="px-4 py-3">Last Updated</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="pl-5 pr-3 py-4"><div className="w-4 h-4 bg-white/5 rounded" /></td>
                          <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/5 rounded-lg" /><div className="space-y-2"><div className="h-4 bg-white/5 rounded w-32" /><div className="h-3 bg-white/5 rounded w-20" /></div></div></td>
                          <td className="px-4 py-4"><div className="h-6 bg-white/5 rounded w-16" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                          <td className="px-4 py-4"><div className="grid grid-cols-2 gap-2"><div className="h-8 bg-white/5 rounded" /><div className="h-8 bg-white/5 rounded" /></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-8 ml-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-12 ml-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-20" /></td>
                          <td className="px-4 py-4" />
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                          {searchTerm || assetFilter !== "all" || riskFilter !== "all"
                            ? "No algorithms match your filters."
                            : "No algorithms found."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((algo) => {
                        const catStyle = getCategoryStyle(algo.category);
                        const CatIcon = catStyle.icon;
                        const roiNum = parsePercent(algo.roi || "0%");

                        return (
                          <tr key={algo.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="pl-5 pr-3 py-4"><input type="checkbox" className="custom-checkbox" /></td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${catStyle.bg}`}>
                                  <CatIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors cursor-pointer">{algo.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-medium">{algo.category}</span>
                                    <span className="text-[10px] text-slate-500">{algo.pairs || ""}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4"><StatusBadge status={algo.status} /></td>
                            <td className="px-4 py-4"><RiskBar level={algo.risk_level || "medium"} /></td>
                            <td className="px-4 py-4">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                <div>
                                  <div className="text-slate-500 text-[10px] uppercase">Return</div>
                                  <div className={`font-bold ${roiNum >= 0 ? "text-emerald-400" : "text-red-400"}`}>{algo.roi || "—"}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 text-[10px] uppercase">Max DD</div>
                                  <div className="text-white font-medium">{algo.drawdown || "—"}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 text-[10px] uppercase">Win Rate</div>
                                  <div className="text-white font-medium">{algo.win_rate || "—"}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 text-[10px] uppercase">Sharpe</div>
                                  <div className="text-white font-medium">{algo.sharpe_ratio?.toFixed(1) || "—"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-slate-300 font-medium">{algo.agencies_count.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right text-slate-300 font-medium">{algo.clients_count.toLocaleString()}</td>
                            <td className="px-4 py-4 text-xs text-slate-500">{timeAgo(algo.last_updated || algo.created_at)}</td>
                            <td className="px-4 py-4 text-right">
                              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
