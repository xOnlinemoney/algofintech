"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Search,
  Bell,
  ChevronDown,
  CreditCard,
  Plus,
  AlertTriangle,
  ArrowUp,
  CheckCircle2,
  BarChart2,
  Ticket,
  Filter,
  X,
  Upload,
  Files,
  Link2,
  Copy,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface DashboardData {
  agencies: {
    total: number;
    list: { id: string; name: string; slug: string; plan: string; created_at: string }[];
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
    profitable: number;
    unprofitable: number;
  };
  aum: {
    total: number;
    fx: number;
    crypto: number;
    stocks: number;
    futures: number;
  };
  trading: {
    totalProfits: number;
    openTrades: number;
    activeAccounts: number;
    totalAccounts: number;
  };
  topAgencies: {
    id: string;
    name: string;
    plan: string;
    clients: number;
    activeClients: number;
    activePercent: number;
    revenue: number;
  }[];
  keys: {
    total: number;
    active: number;
    used: number;
  };
  algorithms: {
    total: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

// ─── Sparkline SVG ──────────────────────────────────────
function Sparkline({ data, color, fill }: { data: number[]; color: string; fill?: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const pathD = `M${points.join(" L")}`;
  const fillD = `${pathD} L${w},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} className="overflow-visible">
      {fill && (
        <path d={fillD} fill={color} fillOpacity="0.1" />
      )}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sidebar Nav Item ────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const growthChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const chartsInitialized = useRef(false);

  // Fetch dashboard data
  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Date/time
  useEffect(() => {
    function update() {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      );
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      );
    }
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, []);

  // Charts (Chart.js)
  const initCharts = useCallback(() => {
    if (chartsInitialized.current || !data || typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Chart = (window as any).Chart;
    if (!Chart) return;

    chartsInitialized.current = true;
    Chart.defaults.color = "#64748b";
    Chart.defaults.borderColor = "rgba(255, 255, 255, 0.05)";
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Growth Chart
    if (growthChartRef.current) {
      const ctx = growthChartRef.current.getContext("2d");
      if (ctx) {
        const gradBlue = ctx.createLinearGradient(0, 0, 0, 300);
        gradBlue.addColorStop(0, "rgba(59, 130, 246, 0.2)");
        gradBlue.addColorStop(1, "rgba(59, 130, 246, 0)");

        // Generate growth data from actual counts
        const totalAg = data.agencies.total;
        const totalCl = data.clients.total;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const agencyGrowth = months.map((_, i) =>
          Math.max(1, Math.round(totalAg * ((i + 1) / 12) * (0.8 + Math.random() * 0.4)))
        );
        agencyGrowth[11] = totalAg;
        const clientGrowth = months.map((_, i) =>
          Math.max(1, Math.round(totalCl * ((i + 1) / 12) * (0.8 + Math.random() * 0.4)))
        );
        clientGrowth[11] = totalCl;

        new Chart(ctx, {
          type: "line",
          data: {
            labels: months,
            datasets: [
              {
                label: "Agencies",
                data: agencyGrowth,
                borderColor: "#3b82f6",
                backgroundColor: gradBlue,
                fill: true,
                tension: 0.4,
                yAxisID: "y",
              },
              {
                label: "Clients",
                data: clientGrowth,
                borderColor: "#10b981",
                borderDash: [5, 5],
                tension: 0.4,
                yAxisID: "y1",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false } },
              y: { position: "left", grid: { color: "rgba(255,255,255,0.05)" } },
              y1: { position: "right", grid: { display: false } },
            },
          },
        });
      }
    }

    // Revenue Doughnut
    if (revenueChartRef.current) {
      const ctx2 = revenueChartRef.current.getContext("2d");
      if (ctx2) {
        new Chart(ctx2, {
          type: "doughnut",
          data: {
            labels: ["Forex", "Crypto", "Stocks", "Futures"],
            datasets: [
              {
                data: [
                  data.aum.fx || 1,
                  data.aum.crypto || 1,
                  data.aum.stocks || 1,
                  data.aum.futures || 1,
                ],
                backgroundColor: ["#3b82f6", "#10b981", "#a855f7", "#f59e0b"],
                borderWidth: 0,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "75%",
            plugins: { legend: { display: false } },
          },
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(initCharts, 300);
      return () => clearTimeout(timer);
    }
  }, [data, initCharts]);

  // Tier badge helper
  function tierBadge(plan: string) {
    switch (plan) {
      case "enterprise":
        return (
          <span className="px-1.5 py-0.5 rounded border border-purple-500/20 bg-purple-500/10 text-purple-400 text-[10px]">
            Enterprise
          </span>
        );
      case "pro":
        return (
          <span className="px-1.5 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px]">
            Growth
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded border border-slate-500/20 bg-slate-500/10 text-slate-400 text-[10px]">
            Starter
          </span>
        );
    }
  }

  // Rank medal
  function rankMedal(i: number) {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return null;
  }

  function rankClass(i: number) {
    if (i === 0) return "rank-1";
    if (i === 1) return "rank-2";
    if (i === 2) return "rank-3";
    return "border-l-2 border-transparent";
  }

  // Initials helper
  function initials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const initialColors = [
    "bg-indigo-500/20 text-indigo-400",
    "bg-cyan-500/20 text-cyan-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-amber-500/20 text-amber-400",
    "bg-rose-500/20 text-rose-400",
    "bg-purple-500/20 text-purple-400",
  ];

  // ────────────────────── RENDER ─────────────────────────
  return (
    <div className="antialiased h-screen w-screen overflow-hidden flex text-sm font-sans text-slate-400" style={{ background: "#020408" }}>
      {/* Rank styles */}
      <style jsx global>{`
        .rank-1 { background: linear-gradient(90deg, rgba(234, 179, 8, 0.1) 0%, transparent 100%); border-left: 2px solid #EAB308; }
        .rank-2 { background: linear-gradient(90deg, rgba(148, 163, 184, 0.1) 0%, transparent 100%); border-left: 2px solid #94A3B8; }
        .rank-3 { background: linear-gradient(90deg, rgba(180, 83, 9, 0.1) 0%, transparent 100%); border-left: 2px solid #B45309; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* ═══ Sidebar ═══ */}
      <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex flex-col shrink-0 z-20">
        {/* Logo */}
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active href="/dashboard" />

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Agency Management</div>
          <NavItem icon={Building2} label="All Agencies" href="/dashboard/agencies" />
          <NavItem icon={UserPlus} label="Pending Invitations" />
          <NavItem icon={Ban} label="Suspended" badge={String(data?.clients.suspended || 0)} />

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Client Management</div>
          <NavItem icon={Users} label="All Clients" />

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Algorithms</div>
          <NavItem icon={Cpu} label="Algorithm Library" href="/dashboard/algorithms" />
          <NavItem icon={LineChart} label="Performance" />

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Trade Management</div>
          <NavItem icon={Copy} label="Trade Copier" href="/admin-dashboard/trade-copier" />
          <NavItem icon={Upload} label="Master CSV Import" href="/admin-dashboard/upload-trades" />
          <NavItem icon={Files} label="Multi-File Import" href="/admin-dashboard/upload-files" />

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Sales</div>
          <NavItem icon={Link2} label="Closer Links" href="/admin-dashboard/closer-links" />

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Finance</div>
          <NavItem icon={Wallet} label="Revenue Overview" />
          <NavItem icon={FileText} label="Invoices" />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <NavItem icon={Settings} label="System Settings" />
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#020408" }}>
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search agencies, clients, algorithms..."
                className="w-full bg-[#13161C] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 ml-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020408]" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-lg transition-colors">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff"
                alt="Admin"
                className="w-7 h-7 rounded-md"
              />
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-white">Admin</div>
                <div className="text-[10px] text-slate-500">Super Admin</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Admin Dashboard</h1>
                <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                  <span>{dateStr}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>{timeStr}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select className="bg-[#13161C] text-slate-300 text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:border-white/20 transition-colors">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>This Quarter</option>
                  <option>This Year</option>
                </select>
                <button className="bg-[#13161C] text-slate-300 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  Review Payments
                </button>
                <button className="bg-[#13161C] text-slate-300 border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" />
                  Add Algo
                </button>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite Agency
                </button>
              </div>
            </div>

            {/* Alert */}
            <div className="bg-[#13161C] border border-red-500/20 rounded-lg p-3 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.05)] relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
              <div className="p-1.5 bg-red-500/10 rounded text-red-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="text-white text-sm font-medium">System Overview Alert</span>
                  <span className="text-slate-400 text-xs ml-2">
                    {data ? (
                      <>
                        {data.clients.suspended} suspended client{data.clients.suspended !== 1 ? "s" : ""} and {data.keys.active} active license key{data.keys.active !== 1 ? "s" : ""} pending assignment
                      </>
                    ) : (
                      "Loading metrics..."
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View Details</button>
                  <button className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ Key Metrics Cards ═══ */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#13161C] border border-white/5 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-24 mb-4" />
                    <div className="h-8 bg-white/5 rounded w-16 mb-4" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Agencies */}
                <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Agencies</div>
                    <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                      <ArrowUp className="w-3 h-3 mr-0.5" /> Live
                    </span>
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <div className="text-3xl font-semibold text-white tracking-tight">
                      {formatNumber(data.agencies.total)}
                    </div>
                    <div className="pb-1">
                      <Sparkline data={[1, 2, 3, 3, 4, data.agencies.total]} color="#10b981" />
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-medium border-t border-white/5 pt-3">
                    <span className="text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                      {data.agencies.list.filter((a) => a.plan === "pro" || a.plan === "enterprise").length} Pro+
                    </span>
                    <span className="text-blue-400 bg-blue-500/5 px-1.5 py-0.5 rounded">
                      {data.agencies.list.filter((a) => a.plan === "starter").length} Starter
                    </span>
                  </div>
                </div>

                {/* Card 2: Total Clients */}
                <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Clients</div>
                    <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                      <ArrowUp className="w-3 h-3 mr-0.5" /> Live
                    </span>
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <div className="text-3xl font-semibold text-white tracking-tight">
                      {formatNumber(data.clients.total)}
                    </div>
                    <div className="pb-1">
                      <Sparkline data={[2, 4, 5, 7, 8, data.clients.total]} color="#10b981" />
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-medium border-t border-white/5 pt-3">
                    <span className="text-slate-400">
                      Active: <span className="text-white">{formatNumber(data.clients.active)}</span>
                    </span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="text-slate-500">Inactive: {data.clients.inactive}</span>
                    {data.clients.suspended > 0 && (
                      <>
                        <span className="w-px h-3 bg-white/10" />
                        <span className="text-red-400">Suspended: {data.clients.suspended}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card 3: AUM */}
                <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Assets Under Mgmt</div>
                    <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">
                      <ArrowUp className="w-3 h-3 mr-0.5" /> Live
                    </span>
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <div className="text-3xl font-semibold text-white tracking-tight">
                      {formatCurrency(data.aum.total)}
                    </div>
                    <div className="pb-1">
                      <Sparkline data={[10, 20, 25, 30, 35, data.aum.total / 1000]} color="#3b82f6" />
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-medium border-t border-white/5 pt-3 flex-wrap">
                    <span className="text-slate-400">FX: <span className="text-white">{formatCurrency(data.aum.fx)}</span></span>
                    <span className="text-slate-400">Crypto: <span className="text-white">{formatCurrency(data.aum.crypto)}</span></span>
                    <span className="text-slate-400">Stocks: <span className="text-white">{formatCurrency(data.aum.stocks)}</span></span>
                    <span className="text-slate-400">Futures: <span className="text-white">{formatCurrency(data.aum.futures)}</span></span>
                  </div>
                </div>

                {/* Card 4: Trading Profits */}
                <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Trading Profits</div>
                    <span
                      className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded border ${
                        data.trading.totalProfits >= 0
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/10"
                          : "text-red-400 bg-red-500/10 border-red-500/10"
                      }`}
                    >
                      <ArrowUp className={`w-3 h-3 mr-0.5 ${data.trading.totalProfits < 0 ? "rotate-180" : ""}`} />
                      Live
                    </span>
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <div className={`text-3xl font-semibold tracking-tight ${data.trading.totalProfits >= 0 ? "text-white" : "text-red-400"}`}>
                      {data.trading.totalProfits >= 0 ? "+" : ""}
                      {formatCurrency(Math.abs(data.trading.totalProfits))}
                    </div>
                    <div className="pb-1">
                      <Sparkline
                        data={[5, 8, 7, 12, 15, Math.abs(data.trading.totalProfits / 1000)]}
                        color={data.trading.totalProfits >= 0 ? "#10b981" : "#ef4444"}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 text-[10px] font-medium border-t border-white/5 pt-3">
                    <span className="text-slate-400">
                      Open Trades: <span className="text-white">{data.trading.openTrades}</span>
                    </span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="text-slate-400">
                      Active Accts: <span className="text-white">{data.trading.activeAccounts}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* ═══ Revenue Metrics (Row 2) ═══ */}
            {data && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Platform Overview */}
                <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Platform Overview</span>
                      <span className="text-emerald-400 text-xs font-medium">Live</span>
                    </div>
                    <div className="text-2xl font-semibold text-white mb-4">
                      {formatCurrency(data.aum.total)}
                    </div>
                    {/* Progress Breakdown */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full flex overflow-hidden mb-2">
                      {data.aum.total > 0 && (
                        <>
                          <div className="h-full bg-blue-500" style={{ width: `${(data.aum.fx / data.aum.total) * 100}%` }} />
                          <div className="h-full bg-emerald-500" style={{ width: `${(data.aum.crypto / data.aum.total) * 100}%` }} />
                          <div className="h-full bg-purple-500" style={{ width: `${(data.aum.stocks / data.aum.total) * 100}%` }} />
                          <div className="h-full bg-amber-500" style={{ width: `${(data.aum.futures / data.aum.total) * 100}%` }} />
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> FX {formatCurrency(data.aum.fx)}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Crypto {formatCurrency(data.aum.crypto)}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Stocks {formatCurrency(data.aum.stocks)}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Futures {formatCurrency(data.aum.futures)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* License Keys Overview */}
                <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">License Keys</div>
                    <div className="text-2xl font-semibold text-white mb-4">{data.keys.total} Total</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400">Active (Unused)</span>
                        <span className="text-white font-medium">{data.keys.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-400">Used (Claimed)</span>
                        <span className="text-white font-medium">{data.keys.used}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Revoked / Expired</span>
                        <span className="text-white font-medium">
                          {data.keys.total - data.keys.active - data.keys.used}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <button className="w-full text-xs text-center text-slate-400 hover:text-white transition-colors">
                      Manage License Keys &rarr;
                    </button>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Connected Accounts</span>
                      <span className="text-emerald-400 text-xs font-medium">Live</span>
                    </div>
                    <div className="text-2xl font-semibold text-white mb-1">{data.trading.totalAccounts}</div>
                    <div className="text-[10px] text-slate-500 mb-4">
                      {data.trading.activeAccounts} active / {data.trading.totalAccounts - data.trading.activeAccounts} inactive
                    </div>
                    <div className="pb-1">
                      <Sparkline
                        data={[5, 8, 12, 15, 20, data.trading.totalAccounts]}
                        color="#10b981"
                        fill
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Charts Section ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Growth Trends (2/3) */}
              <div className="lg:col-span-2 bg-[#13161C] border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Platform Growth Trends</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Agencies vs Total Client Volume</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] text-slate-400">Agencies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400">Clients</span>
                    </div>
                    <select className="bg-white/5 border border-white/5 text-[10px] text-slate-300 rounded px-2 py-1 outline-none">
                      <option>Last 12 Months</option>
                    </select>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <canvas ref={growthChartRef} />
                </div>
              </div>

              {/* AUM Breakdown (1/3) */}
              <div className="bg-[#13161C] border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">AUM by Asset Class</h3>
                  <span className="text-[10px] text-slate-500">Live</span>
                </div>
                <div className="h-[200px] w-full relative flex items-center justify-center">
                  <canvas ref={revenueChartRef} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-500">Total AUM</span>
                    <span className="text-lg font-bold text-white">
                      {data ? formatCurrency(data.aum.total) : "..."}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mt-6">
                  {data && (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-slate-400">Forex</span>
                        </div>
                        <span className="text-white font-medium">
                          {formatCurrency(data.aum.fx)}{" "}
                          ({data.aum.total > 0 ? Math.round((data.aum.fx / data.aum.total) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-slate-400">Crypto</span>
                        </div>
                        <span className="text-white font-medium">
                          {formatCurrency(data.aum.crypto)}{" "}
                          ({data.aum.total > 0 ? Math.round((data.aum.crypto / data.aum.total) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="text-slate-400">Stocks</span>
                        </div>
                        <span className="text-white font-medium">
                          {formatCurrency(data.aum.stocks)}{" "}
                          ({data.aum.total > 0 ? Math.round((data.aum.stocks / data.aum.total) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-slate-400">Futures</span>
                        </div>
                        <span className="text-white font-medium">
                          {formatCurrency(data.aum.futures)}{" "}
                          ({data.aum.total > 0 ? Math.round((data.aum.futures / data.aum.total) * 100) : 0}%)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ Leaderboard & Activity ═══ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Top Agencies (2/3) */}
              <div className="xl:col-span-2 bg-[#13161C] border border-white/5 rounded-xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Top Performing Agencies</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ranked by total client count</p>
                  </div>
                  <div className="flex bg-white/5 rounded p-0.5">
                    <button className="px-2 py-1 text-[10px] bg-white/10 text-white rounded shadow-sm">Clients</button>
                    <button className="px-2 py-1 text-[10px] text-slate-500 hover:text-white transition-colors">Revenue</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.02] text-slate-500 uppercase font-medium">
                      <tr>
                        <th className="px-5 py-3">Rank</th>
                        <th className="px-5 py-3">Agency</th>
                        <th className="px-5 py-3">Tier</th>
                        <th className="px-5 py-3">Clients</th>
                        <th className="px-5 py-3">Revenue</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data?.topAgencies.map((agency, i) => (
                        <tr
                          key={agency.id}
                          className={`${rankClass(i)} group cursor-pointer hover:bg-white/5 transition-colors`}
                        >
                          <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                            #{i + 1}{" "}
                            {rankMedal(i) && <span className="text-base">{rankMedal(i)}</span>}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                                  initialColors[i % initialColors.length]
                                }`}
                              >
                                {initials(agency.name)}
                              </div>
                              <span className="text-white font-medium">{agency.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">{tierBadge(agency.plan)}</td>
                          <td className="px-5 py-3 text-slate-300">
                            {agency.clients}{" "}
                            <span className="text-slate-500 ml-1">({agency.activePercent}% active)</span>
                          </td>
                          <td className="px-5 py-3 text-emerald-400 font-medium">
                            {formatCurrency(agency.revenue)}
                          </td>
                          <td className="px-5 py-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button className="text-blue-400 hover:text-blue-300">View</button>
                          </td>
                        </tr>
                      ))}
                      {(!data || data.topAgencies.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                            No agencies found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-3 border-t border-white/5 text-center">
                  <button className="text-xs text-slate-500 hover:text-white transition-colors">
                    View All Agencies
                  </button>
                </div>
              </div>

              {/* Activity Feed (1/3) */}
              <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                  <button className="text-slate-500 hover:text-white">
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-2">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-white/5" />
                  <div className="space-y-6 pl-6">
                    {/* Dynamic activity items from data */}
                    {data?.agencies.list.slice(0, 1).map((a) => (
                      <div key={`act-${a.id}`} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#13161C]" />
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-white">{a.name}</span> registered as agency partner
                        </p>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Platform active</span>
                      </div>
                    ))}
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#13161C]" />
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-white">{data?.clients.total || 0}</span> total clients across all agencies
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Current count</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#13161C]" />
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-white">{data?.trading.totalAccounts || 0}</span> trading accounts connected
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{data?.trading.activeAccounts || 0} currently active</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-[#13161C]" />
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-white">{data?.keys.total || 0}</span> software license keys generated
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{data?.keys.active || 0} pending activation</span>
                    </div>
                    {data && data.clients.suspended > 0 && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-[#13161C]" />
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-white">{data.clients.suspended}</span> client account{data.clients.suspended !== 1 ? "s" : ""} currently suspended
                        </p>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Requires review</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ System Health & Quick Stats ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
              {/* System Health (3 cols) */}
              <div className="lg:col-span-3 bg-[#13161C] border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    System Health
                  </h3>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300">View Full Status</a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-white">Platform</span>
                    </div>
                    <div className="text-[10px] text-slate-400">99.97% Uptime</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-white">API</span>
                    </div>
                    <div className="text-[10px] text-slate-400">42ms Latency</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-white">Trading</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{data?.trading.activeAccounts || 0} Active</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-white">Database</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Optimal</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-white">Jobs</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Processing</div>
                  </div>
                </div>
              </div>

              {/* Quick Stat Grid (1 col) */}
              <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded text-blue-400">
                      <BarChart2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Active Algos</div>
                      <div className="text-sm font-semibold text-white">{data?.algorithms.total || 0}</div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-px bg-white/5" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-500/10 rounded text-purple-400">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Open Trades</div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {data?.trading.openTrades || 0}
                        {data && data.trading.openTrades > 0 && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1 rounded">Live</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
