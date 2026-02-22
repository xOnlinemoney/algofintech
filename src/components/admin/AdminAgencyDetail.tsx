"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Ban,
  Users,
  Cpu,
  LineChart,
  Wallet,
  FileText,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Globe,
  MapPin,
  Calendar,
  CreditCard,
  Activity,
  DollarSign,
  Pencil,
  Mail,
  ShieldCheck,
  Key,
  FileBarChart,
  Check,
  Flag,
  Trophy,
  UserPlus as UserPlusIcon,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface AgencyInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  license_key?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  sold_by?: string | null;
  contact_name?: string | null;
}

interface AgencyStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  suspendedClients: number;
  pendingClients: number;
  activePercent: number;
  totalPnl: number;
  totalLiquidity: number;
  profitableClients: number;
  unprofitableClients: number;
  totalBalance: number;
  totalEquity: number;
  totalOpenTrades: number;
  activeAccounts: number;
  totalAccounts: number;
  revenue: number;
}

interface AssetBreakdown {
  name: string;
  value: number;
  percent: number;
}

interface ClientData {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  liquidity: number;
  total_pnl: number;
  pnl_percentage: number;
  risk_level: string;
  broker: string;
  joined_at: string;
  last_active: string;
  active_strategies: number;
  accounts_count: number;
  active_accounts: number;
  aum: number;
}

interface HealthInfo {
  score: number;
  label: string;
  activityLevel: string;
  paymentStatus: string;
  growthRate: string;
}

interface ApiResponse {
  agency: AgencyInfo;
  stats: AgencyStats;
  assetBreakdown: AssetBreakdown[];
  clients: ClientData[];
  health: HealthInfo;
}

// ─── Helpers ────────────────────────────────────────────
function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatFullCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function joinedLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function tierLabel(plan: string): string {
  switch (plan) {
    case "enterprise": return "Enterprise";
    case "pro": return "Growth";
    default: return "Starter";
  }
}

function tierColor(plan: string): string {
  switch (plan) {
    case "enterprise": return "border-purple-500/20 bg-purple-500/10 text-purple-400";
    case "pro": return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    default: return "border-slate-500/20 bg-slate-500/10 text-slate-400";
  }
}

const assetColors: Record<string, string> = {
  Forex: "#3b82f6",
  Crypto: "#a855f7",
  Stocks: "#10b981",
  Futures: "#f59e0b",
  Other: "#6366f1",
};

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
        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded border ${badgeColor || "bg-red-500/20 text-red-400 border-red-500/20"}`}>
          {badge}
        </span>
      )}
    </a>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function AdminAgencyDetail({ agencyId }: { agencyId: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    fetch(`/api/admin/agencies/${agencyId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agencyId]);

  // Chart.js for market distribution
  const chartRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas || !data || data.assetBreakdown.length === 0) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Chart = (window as unknown as Record<string, unknown>).Chart as unknown;
      if (!Chart) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Destroy existing chart instance
      const existingChart = (canvas as unknown as Record<string, unknown>).__chartInstance;
      if (existingChart && typeof (existingChart as { destroy: () => void }).destroy === "function") {
        (existingChart as { destroy: () => void }).destroy();
      }

      const labels = data.assetBreakdown.map((a) => a.name);
      const values = data.assetBreakdown.map((a) => a.percent);
      const colors = data.assetBreakdown.map((a) => assetColors[a.name] || assetColors.Other);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ChartClass = Chart as any;
      const instance = new ChartClass(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }],
        },
        options: {
          cutout: "75%",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1e293b",
              padding: 12,
              cornerRadius: 8,
              bodyFont: { family: "Inter", size: 12 },
            },
          },
        },
      });
      (canvas as unknown as Record<string, unknown>).__chartInstance = instance;
    },
    [data]
  );

  if (loading) {
    return (
      <div className="antialiased h-screen w-screen overflow-hidden flex text-sm font-sans text-slate-400" style={{ background: "#020408" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-slate-500">Loading agency details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.agency) {
    return (
      <div className="antialiased h-screen w-screen overflow-hidden flex text-sm font-sans text-slate-400" style={{ background: "#020408" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-lg mb-2">Agency Not Found</div>
            <a href="/dashboard/agencies" className="text-blue-400 hover:text-blue-300">Back to All Agencies</a>
          </div>
        </div>
      </div>
    );
  }

  const { agency, stats, assetBreakdown, clients, health } = data;
  const hasSuspended = stats.suspendedClients > 0;

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.client_id.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="antialiased h-screen w-screen overflow-hidden flex text-sm font-sans text-slate-400" style={{ background: "#020408" }}>
      {/* Styles */}
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background-color: #020408; color: #94a3b8; }
        h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #020408; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .timeline-connector::before {
          content: ''; position: absolute; top: 2rem; bottom: -1rem; left: 15px;
          width: 2px; background-color: rgba(255,255,255,0.05); z-index: 0;
        }
        .timeline-item:last-child .timeline-connector::before { display: none; }
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
          <NavItem icon={Building2} label="All Agencies" active href="/dashboard/agencies" />
          <NavItem icon={UserPlus} label="Pending Invitations" />
          <NavItem icon={Ban} label="Suspended" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Client Management</div>
          <NavItem icon={Users} label="All Clients" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Algorithms</div>
          <NavItem icon={Cpu} label="Algorithm Library" />
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
        {/* Header */}
        <header className="h-14 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Agency Management</span>
            <span className="text-slate-700">/</span>
            <a href="/dashboard/agencies" className="text-slate-500 hover:text-slate-300 transition-colors">All Agencies</a>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium">{agency.name}</span>
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

        {/* Page Scroll Area */}
        <div className="flex-1 overflow-auto custom-scrollbar flex flex-col">
          {/* Agency Header & Actions */}
          <div className="px-8 pt-8 pb-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex gap-5">
                <div className="w-20 h-20 rounded-xl bg-indigo-500/20 text-indigo-400 border border-white/5 flex items-center justify-center text-2xl font-bold shadow-2xl shadow-indigo-900/20">
                  {initials(agency.name)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-heading font-semibold text-white tracking-tight">{agency.name}</h1>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-wide ${
                      hasSuspended
                        ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {hasSuspended ? "Warning" : "Active"}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-wide ${tierColor(agency.plan)}`}>
                      {tierLabel(agency.plan)}
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {agency.slug}.algofintech.com</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Platform Partner</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {joinedLabel(agency.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 hover:text-white rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> View Invoices
                </button>
                <button className="px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 hover:text-white rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Message
                </button>
                <button className="px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 hover:text-white rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2">
                  <Ban className="w-3.5 h-3.5" /> Suspend
                </button>
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
                  <Pencil className="w-3.5 h-3.5" /> Edit Agency
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto custom-scrollbar">
              {[
                { key: "overview", label: "Overview" },
                { key: "clients", label: "Clients", badge: String(stats.totalClients) },
                { key: "billing", label: "Billing & Payments" },
                { key: "timeline", label: "Activity Timeline" },
                { key: "communication", label: "Communication" },
                { key: "notes", label: "Internal Notes" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "text-white border-blue-500"
                      : "text-slate-400 hover:text-white border-transparent"
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-slate-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Container */}
          <div className="flex flex-col xl:flex-row flex-1 px-8 py-6 gap-6">
            {/* Main Content Column */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* ═══ TAB: OVERVIEW ═══ */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#0B0E14] border border-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Clients</span>
                        <Users className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">{stats.totalClients}</span>
                        <span className="text-xs font-medium text-emerald-400 flex items-center">{stats.activePercent}% active</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0B0E14] border border-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Clients</span>
                        <Activity className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">{stats.activeClients}</span>
                        <span className="text-xs font-medium text-emerald-400 flex items-center">{stats.activePercent}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0B0E14] border border-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assets Under Mgmt</span>
                        <DollarSign className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">{formatCurrency(stats.totalBalance)}</span>
                        <span className="text-xs font-medium text-emerald-400 flex items-center">
                          {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(stats.totalPnl))}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0B0E14] border border-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trading Profits</span>
                        <CreditCard className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold tracking-tight ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(stats.totalPnl))}
                        </span>
                        <span className="text-xs text-slate-500">
                          {stats.profitableClients}P / {stats.unprofitableClients}L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info & Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Agency Info */}
                    <div className="lg:col-span-2 bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-white mb-4">Agency Details</h3>
                      <div className="grid grid-cols-2 gap-y-4 text-xs">
                        <div>
                          <div className="text-slate-500 mb-1">Company Name</div>
                          <div className="text-slate-300 font-medium">{agency.name}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Agency Slug</div>
                          <div className="text-blue-400 font-medium">{agency.slug}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Partnership Tier</div>
                          <div className="text-slate-300 font-medium">{tierLabel(agency.plan)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Subdomain</div>
                          <div className="text-blue-400 font-medium">{agency.slug}.algofintech.com</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Email</div>
                          <div className="text-slate-300 font-medium flex items-center gap-1.5">
                            {agency.contact_email ? (
                              <><Mail className="w-3 h-3 text-blue-400" />{agency.contact_email}</>
                            ) : (
                              <span className="text-slate-600 italic">Not available</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Phone</div>
                          <div className="text-slate-300 font-medium">
                            {agency.contact_phone || <span className="text-slate-600 italic">Not available</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Sold By</div>
                          <div className="text-slate-300 font-medium">
                            {agency.sold_by || <span className="text-slate-600 italic">Not available</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">License Key</div>
                          <div className="text-emerald-400 font-mono font-medium tracking-wide">
                            {agency.license_key || <span className="text-slate-600 italic">No key assigned</span>}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/5">
                        <h3 className="text-sm font-semibold text-white mb-3">Account Statistics</h3>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-500 border-b border-white/5">
                              <th className="pb-2 font-medium">Metric</th>
                              <th className="pb-2 font-medium text-right">Value</th>
                              <th className="pb-2 font-medium text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            <tr>
                              <td className="py-2.5 text-slate-300">Connected Accounts</td>
                              <td className="py-2.5 text-right text-white font-medium">{stats.totalAccounts}</td>
                              <td className="py-2.5 text-right">
                                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
                                  {stats.activeAccounts} Active
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2.5 text-slate-300">Open Trades</td>
                              <td className="py-2.5 text-right text-white font-medium">{stats.totalOpenTrades}</td>
                              <td className="py-2.5 text-right">
                                <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[10px]">Live</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2.5 text-slate-300">Total Equity</td>
                              <td className="py-2.5 text-right text-white font-medium">{formatCurrency(stats.totalEquity)}</td>
                              <td className="py-2.5 text-right">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  stats.totalPnl >= 0
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}>
                                  {stats.totalPnl >= 0 ? "Profit" : "Loss"}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Market Pie Chart */}
                    <div className="lg:col-span-1 bg-[#0B0E14] border border-white/5 rounded-xl p-5 flex flex-col">
                      <h3 className="text-sm font-semibold text-white mb-4">Market Distribution</h3>
                      <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
                        {assetBreakdown.length > 0 ? (
                          <canvas ref={chartRef} />
                        ) : (
                          <div className="text-slate-500 text-xs">No account data</div>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        {assetBreakdown.map((ab) => (
                          <div key={ab.name} className="flex justify-between text-xs">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assetColors[ab.name] || assetColors.Other }} />
                              {ab.name}
                            </span>
                            <span className="text-slate-300 font-medium">{ab.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity (static for now) */}
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                      <button onClick={() => setActiveTab("timeline")} className="text-xs text-blue-400 hover:text-blue-300">View all</button>
                    </div>
                    <div className="divide-y divide-white/5">
                      <div className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-300">Agency has <span className="font-medium text-white">{stats.totalClients} clients</span> with <span className="text-emerald-400">{stats.activeClients} active</span></div>
                          <div className="text-[10px] text-slate-500">Current snapshot</div>
                        </div>
                      </div>
                      <div className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-300">Total AUM: <span className="font-medium text-white">{formatCurrency(stats.totalBalance)}</span> across {stats.totalAccounts} accounts</div>
                          <div className="text-[10px] text-slate-500">{stats.activeAccounts} active accounts</div>
                        </div>
                      </div>
                      <div className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-300">
                            Trading: <span className={`font-medium ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(stats.totalPnl))}
                            </span> total P&L with {stats.totalOpenTrades} open trades
                          </div>
                          <div className="text-[10px] text-slate-500">{stats.profitableClients} profitable / {stats.unprofitableClients} unprofitable clients</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ TAB: CLIENTS ═══ */}
              {activeTab === "clients" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] text-slate-500 font-medium">
                        <tr>
                          <th className="px-4 py-3">Client Name</th>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Date Added</th>
                          <th className="px-4 py-3">Broker</th>
                          <th className="px-4 py-3 text-right">AUM</th>
                          <th className="px-4 py-3 text-right">P/L (All Time)</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Accounts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredClients.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                              {clientSearch ? "No clients match your search." : "No clients found for this agency."}
                            </td>
                          </tr>
                        ) : (
                          filteredClients.map((client) => (
                            <tr key={client.id} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-3 font-medium text-white">{client.name}</td>
                              <td className="px-4 py-3 text-slate-500 font-mono">{client.client_id}</td>
                              <td className="px-4 py-3 text-slate-400">{formatDate(client.joined_at)}</td>
                              <td className="px-4 py-3 text-slate-300">{client.broker}</td>
                              <td className="px-4 py-3 text-right text-white">{formatFullCurrency(client.aum)}</td>
                              <td className={`px-4 py-3 text-right font-medium ${client.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {client.total_pnl >= 0 ? "+" : ""}{formatFullCurrency(Math.abs(client.total_pnl))}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`w-2 h-2 rounded-full inline-block ${
                                  client.status === "active"
                                    ? "bg-emerald-500"
                                    : client.status === "suspended"
                                    ? "bg-red-500"
                                    : client.status === "inactive"
                                    ? "bg-slate-500"
                                    : "bg-orange-500"
                                }`} />
                              </td>
                              <td className="px-4 py-3 text-center text-slate-300">
                                {client.accounts_count}
                                {client.active_accounts > 0 && (
                                  <span className="text-emerald-500 text-[9px] ml-1">({client.active_accounts} active)</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ═══ TAB: BILLING ═══ */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-[#0B0E14] border border-white/5 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">Total Revenue (Est.)</div>
                      <div className="text-xl font-bold text-white">{formatCurrency(stats.revenue)}</div>
                    </div>
                    <div className="p-4 bg-[#0B0E14] border border-white/5 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">Total AUM</div>
                      <div className="text-xl font-bold text-white">{formatCurrency(stats.totalBalance)}</div>
                    </div>
                    <div className="p-4 bg-[#0B0E14] border border-white/5 rounded-xl">
                      <div className="text-xs text-slate-500 mb-1">Total PnL</div>
                      <div className={`text-xl font-bold ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(stats.totalPnl))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Fee Breakdown (Estimated)</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs pb-3 border-b border-white/5">
                        <span className="text-slate-400">Platform Subscription ({tierLabel(agency.plan)})</span>
                        <span className="text-white font-medium">
                          {agency.plan === "enterprise" ? "$2,500.00" : agency.plan === "pro" ? "$1,250.00" : "$500.00"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pb-3 border-b border-white/5">
                        <span className="text-slate-400">Performance Fees (20% of PnL)</span>
                        <span className="text-white font-medium">
                          {formatFullCurrency(Math.max(0, stats.totalPnl * 0.2))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pb-3 border-b border-white/5">
                        <span className="text-slate-400">Client Signup Fees ({stats.totalClients} x $50)</span>
                        <span className="text-white font-medium">
                          {formatFullCurrency(stats.totalClients * 50)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-1">
                        <span className="text-white font-semibold">Total Estimated</span>
                        <span className="text-emerald-400 font-bold">
                          {formatFullCurrency(
                            (agency.plan === "enterprise" ? 2500 : agency.plan === "pro" ? 1250 : 500) +
                            Math.max(0, stats.totalPnl * 0.2) +
                            stats.totalClients * 50
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ TAB: TIMELINE ═══ */}
              {activeTab === "timeline" && (
                <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-8">
                  <div className="space-y-0">
                    <div className="relative pl-8 pb-8 timeline-item timeline-connector">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400 z-10">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Currently managing {stats.totalClients} clients</div>
                        <div className="text-xs text-slate-500 mt-1">{stats.activeClients} active, {stats.inactiveClients} inactive, {stats.suspendedClients} suspended</div>
                      </div>
                    </div>
                    <div className="relative pl-8 pb-8 timeline-item timeline-connector">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400 z-10">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Total AUM: {formatCurrency(stats.totalBalance)}</div>
                        <div className="text-xs text-slate-500 mt-1">Across {stats.totalAccounts} connected accounts ({stats.activeAccounts} active)</div>
                      </div>
                    </div>
                    <div className="relative pl-8 pb-8 timeline-item timeline-connector">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 z-10">
                        <UserPlusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-300">
                          Trading P&L: <span className={stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(stats.totalPnl))}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{stats.profitableClients} profitable / {stats.unprofitableClients} unprofitable</div>
                      </div>
                    </div>
                    <div className="relative pl-8 pb-0 timeline-item timeline-connector">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 z-10">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Agency Signup Approved</div>
                        <div className="text-xs text-slate-500 mt-1">{formatDate(agency.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ TAB: COMMUNICATION ═══ */}
              {activeTab === "communication" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button className="px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Log Call/Email
                    </button>
                  </div>
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-8 text-center">
                    <div className="text-slate-500 text-sm">No communication logs yet.</div>
                    <div className="text-slate-600 text-xs mt-1">Communication tracking will be available soon.</div>
                  </div>
                </div>
              )}

              {/* ═══ TAB: NOTES ═══ */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
                    <textarea
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none h-24"
                      placeholder="Add a private internal note..."
                    />
                    <div className="flex justify-end mt-3">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors">
                        Add Note
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-8 text-center">
                    <div className="text-slate-500 text-sm">No internal notes yet.</div>
                    <div className="text-slate-600 text-xs mt-1">Add notes above to keep track of important agency info.</div>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ Right Sidebar (Persistent) ═══ */}
            <aside className="w-full xl:w-72 shrink-0 space-y-6">
              {/* Health Score */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Agency Health</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke={health.score >= 70 ? "#10b981" : health.score >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${175.9}`}
                        strokeDashoffset={`${175.9 - (175.9 * health.score) / 100}`}
                      />
                    </svg>
                    <span className="absolute text-xl font-bold text-white">{health.score}</span>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      health.score >= 70 ? "text-emerald-400" : health.score >= 50 ? "text-amber-400" : "text-red-400"
                    }`}>{health.label}</div>
                    <div className="text-xs text-slate-500">
                      {health.score >= 90 ? "Top 5% of partners" : health.score >= 70 ? "Above average" : "Needs improvement"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Activity</span>
                    <span className={health.activityLevel === "High" ? "text-emerald-400" : health.activityLevel === "Medium" ? "text-amber-400" : "text-red-400"}>
                      {health.activityLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Payments</span>
                    <span className="text-emerald-400">{health.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Active Rate</span>
                    <span className="text-emerald-400">{stats.activePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Risk Indicators */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Assessment</h4>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                    stats.suspendedClients === 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  }`}>
                    {stats.suspendedClients === 0 ? "Low Risk" : "Medium Risk"}
                  </span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-white">Client Health</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {stats.suspendedClients === 0
                      ? "All clients in good standing. No suspended accounts."
                      : `${stats.suspendedClients} suspended client(s) require attention.`}
                  </div>
                </div>
                {stats.suspendedClients > 0 && (
                  <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Ban className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs font-medium text-red-400">Suspended Clients</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {stats.suspendedClients} client(s) currently suspended. Review required.
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Financial Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Balance</span>
                    <span className="text-white font-medium">{formatCurrency(stats.totalBalance)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Equity</span>
                    <span className="text-white font-medium">{formatCurrency(stats.totalEquity)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Liquidity</span>
                    <span className="text-white font-medium">{formatCurrency(stats.totalLiquidity)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-slate-400">Est. Revenue</span>
                    <span className="text-emerald-400 font-medium">{formatCurrency(stats.revenue)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 bg-[#0B0E14] border border-white/5 hover:border-white/20 rounded-lg group transition-colors">
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">Generate Report</span>
                    <FileBarChart className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-[#0B0E14] border border-white/5 hover:border-white/20 rounded-lg group transition-colors">
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">Reset Password</span>
                    <Key className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
