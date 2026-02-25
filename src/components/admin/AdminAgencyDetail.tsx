"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  MoreHorizontal,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Cpu,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  X,
  Globe,
  Calendar,
  Building2,
  Shield,
  Bell,
  Key,
  FileText,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Save,
  ExternalLink,
  AlertCircle,
  Crown,
  Check,
  User,
  Edit3,
  LayoutDashboard,
  UserPlus,
  Ban,
  LineChart,
  Wallet,
} from "lucide-react";
import AccountTradesModal from "./AccountTradesModal";

// ─── Types ──────────────────────────────────────────────
interface AgencyInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  created_at: string;
  license_key?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  sold_by?: string | null;
  contact_name?: string | null;
  website?: string | null;
  monthly_fee?: number;
  admin_notes?: string;
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

interface ClientAccount {
  id: string;
  account_name: string;
  account_label: string;
  platform: string;
  account_type: string;
  account_number: string;
  username: string;
  password: string;
  balance: number;
  equity: number;
  pnl: number;
  is_active: boolean;
  status: string;
  asset_class: string;
  broker: string;
  currency: string;
  algorithm_id: string | null;
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
  accounts: ClientAccount[];
}

interface HealthInfo {
  score: number;
  label: string;
  activityLevel: string;
  paymentStatus: string;
  growthRate: string;
}

interface AssetBreakdown {
  name: string;
  value: number;
  percent: number;
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
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatFullCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function joinedLabel(dateStr: string): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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

function tierBadgeStyle(plan: string): string {
  switch (plan) {
    case "enterprise": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "pro": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "suspended": return "bg-red-500";
    case "inactive": return "bg-slate-500";
    default: return "bg-amber-500";
  }
}

function statusBadge(status: string): string {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "suspended": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "inactive": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default: return "bg-amber-500/10 text-amber-400 border-amber-500/20";
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

// ─── Main Component ─────────────────────────────────────
export default function AdminAgencyDetail({ agencyId }: { agencyId: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("clients");
  const [clientSearch, setClientSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [tradesModal, setTradesModal] = useState<{ id: string; label: string; clientName: string } | null>(null);

  const togglePasswordReveal = (accountId: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const [togglingAccount, setTogglingAccount] = useState<string | null>(null);

  const toggleAccountStatus = async (accountId: string, currentActive: boolean) => {
    setTogglingAccount(accountId);
    try {
      const res = await fetch("/api/admin/account-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId, is_active: !currentActive }),
      });
      if (res.ok) {
        // Update local state so the UI reflects immediately
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            clients: prev.clients.map((c) => ({
              ...c,
              accounts: c.accounts.map((a) =>
                a.id === accountId ? { ...a, is_active: !currentActive } : a
              ),
            })),
          };
        });
      }
    } catch (err) {
      console.error("Toggle account status error:", err);
    } finally {
      setTogglingAccount(null);
    }
  };

  // Algorithm assignment
  const [algorithms, setAlgorithms] = useState<{ id: string; name: string; category: string; status: string }[]>([]);
  const [assigningAlgo, setAssigningAlgo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/algorithms")
      .then((r) => r.json())
      .then((d) => {
        if (d.algorithms) {
          setAlgorithms(
            d.algorithms
              .filter((a: { status: string }) => a.status === "active")
              .map((a: { id: string; name: string; category: string; status: string }) => ({
                id: a.id,
                name: a.name,
                category: a.category,
                status: a.status,
              }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const assignAlgorithm = async (accountId: string, algorithmId: string | null) => {
    setAssigningAlgo(accountId);
    try {
      const res = await fetch("/api/admin/account-algorithm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId, algorithm_id: algorithmId }),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            clients: prev.clients.map((c) => ({
              ...c,
              accounts: c.accounts.map((a) =>
                a.id === accountId ? { ...a, algorithm_id: algorithmId } : a
              ),
            })),
          };
        });
      }
    } catch (err) {
      console.error("Assign algorithm error:", err);
    } finally {
      setAssigningAlgo(null);
    }
  };

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    contact_email: "",
    contact_phone: "",
    contact_name: "",
    plan: "starter",
    sold_by: "",
    license_key: "",
    website: "",
    monthly_fee: "0",
    status: "active",
    admin_notes: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [notifClientSignup, setNotifClientSignup] = useState(true);
  const [notifLowBalance, setNotifLowBalance] = useState(true);
  const [apiEnabled, setApiEnabled] = useState(true);
  const [apiRateLimit, setApiRateLimit] = useState("100");
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/agencies/${agencyId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d.agency) {
          setEditForm({
            name: d.agency.name || "",
            slug: d.agency.slug || "",
            contact_email: d.agency.contact_email || "",
            contact_phone: d.agency.contact_phone || "",
            contact_name: d.agency.contact_name || "",
            plan: d.agency.plan || "starter",
            sold_by: d.agency.sold_by || "",
            license_key: d.agency.license_key || "",
            website: d.agency.website || "",
            monthly_fee: String(d.agency.monthly_fee || (d.agency.plan === "enterprise" ? 2500 : d.agency.plan === "pro" ? 1250 : 500)),
            status: d.agency.status || "active",
            admin_notes: d.agency.admin_notes || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agencyId]);

  const toggleClientExpand = (id: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Sidebar + Header shell (used for all states) ───
  const renderShell = (content: React.ReactNode) => (
    <div className="antialiased h-screen w-screen overflow-hidden flex text-sm font-sans text-slate-400" style={{ background: "#020408" }}>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
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
          <NavItem icon={Cpu} label="Algorithm Library" href="/dashboard/algorithms" />
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
            <a href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">Dashboard</a>
            <span className="text-slate-700">/</span>
            <a href="/dashboard/agencies" className="text-slate-500 hover:text-slate-300 transition-colors">Agencies</a>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium">{data?.agency?.name || "Agency Detail"}</span>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {content}
        </div>
      </main>
    </div>
  );

  if (loading) {
    return renderShell(
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-500 text-sm">Loading agency details...</div>
        </div>
      </div>
    );
  }

  if (!data || !data.agency) {
    return renderShell(
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Agency Not Found</div>
          <a href="/dashboard/agencies" className="text-blue-400 hover:text-blue-300 text-sm">
            Back to All Agencies
          </a>
        </div>
      </div>
    );
  }

  const { agency, stats, clients } = data;

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.client_id.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  // Pagination
  const clientsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / clientsPerPage));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage
  );

  const tabs = [
    { key: "clients", label: "Clients", icon: Users },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "algorithms", label: "Algorithms", icon: Cpu },
    { key: "payments", label: "Payments", icon: Receipt },
    { key: "activity", label: "Activity Log", icon: Clock },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return renderShell(
    <div className="p-6 space-y-6">
      {/* ═══ Back Button ═══ */}
      <a
        href="/dashboard/agencies"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Agencies
      </a>

      {/* ═══ Agency Header ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
            {initials(agency.name)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-white tracking-tight">{agency.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${tierBadgeStyle(agency.plan)}`}>
                {tierLabel(agency.plan)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                Active
              </span>
            </div>
            <div className="text-slate-500 text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {joinedLabel(agency.created_at)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href={agency.contact_email ? `mailto:${agency.contact_email}` : "#"}
            className="px-4 py-2 bg-[#0B0E14] border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            Contact
          </a>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Mail className="w-3.5 h-3.5" />
            Edit Agency
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 bg-[#0B0E14] border border-white/10 hover:border-white/20 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMoreActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#13161C] border border-white/10 rounded-lg shadow-xl z-50 py-1">
                <button className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white">
                  Generate Report
                </button>
                <button className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white">
                  Export Data
                </button>
                <button className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white">
                  Reset Password
                </button>
                <div className="border-t border-white/5 my-1" />
                <button className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10">
                  Suspend Agency
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Metrics Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Clients */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">Total Clients</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
          <div className="text-[10px] text-emerald-400 mt-1">{stats.activeClients} active</div>
        </div>

        {/* Accounts */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalAccounts}</div>
          <div className="text-[10px] text-emerald-400 mt-1">{stats.activeAccounts} active</div>
        </div>

        {/* Total AUM */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">Total AUM</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalBalance)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across all accounts</div>
        </div>

        {/* Client P&L */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">Client P&L</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {stats.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(stats.totalPnl))}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {stats.profitableClients}P / {stats.unprofitableClients}L
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.revenue)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Estimated</div>
        </div>

        {/* Algorithms */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 font-medium">Algorithms</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalOpenTrades}</div>
          <div className="text-[10px] text-slate-500 mt-1">Active trades</div>
        </div>
      </div>

      {/* ═══ Agency Information Panel ═══ */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-5">Agency Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Information</h4>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Primary Contact</div>
                <div className="text-sm text-white">{agency.contact_name || agency.name}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Email Address</div>
                <div className="text-sm text-blue-400">{agency.contact_email || "Not set"}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Phone Number</div>
                <div className="text-sm text-slate-300">{agency.contact_phone || "Not set"}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Sold By</div>
                <div className="text-sm text-slate-300">{agency.sold_by || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Details</h4>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Agency ID</div>
                <div className="text-sm text-slate-300 font-mono">{agency.id.slice(0, 8)}...</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Subdomain</div>
                <div className="text-sm text-blue-400">{agency.slug}.algofintech.com</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">License Key</div>
                <div className="text-sm text-emerald-400 font-mono">{agency.license_key || "No key assigned"}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Max Clients</div>
                <div className="text-sm text-slate-300">
                  {agency.plan === "enterprise" ? "Unlimited" : agency.plan === "pro" ? "50" : "10"}
                </div>
              </div>
            </div>
          </div>

          {/* Billing & Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Billing & Status</h4>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Subscription Tier</div>
                <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${tierBadgeStyle(agency.plan)}`}>
                  {tierLabel(agency.plan)}
                </span>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Payment Status</div>
                <span className="inline-block px-2 py-0.5 rounded border text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  On Time
                </span>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Account Created</div>
                <div className="text-sm text-slate-300">{formatDate(agency.created_at)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Total Equity</div>
                <div className="text-sm text-white font-medium">{formatFullCurrency(stats.totalEquity)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Tabs ═══ */}
      <div className="border-b border-white/5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-white border-blue-500"
                    : "text-slate-500 hover:text-slate-300 border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.key === "clients" && (
                  <span className="ml-1 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-slate-400">
                    {stats.totalClients}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Tab Content ═══ */}

      {/* ─── CLIENTS TAB ─── */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          {/* Client Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <button className="px-3 py-2 bg-[#0B0E14] border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:border-white/20 transition-colors flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-[#0B0E14] border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Client Grid */}
          {filteredClients.length === 0 ? (
            <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-12 text-center">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <div className="text-slate-400 text-sm">
                {clientSearch ? "No clients match your search." : "No clients found for this agency."}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedClients.map((client) => {
                const isExpanded = expandedClients.has(client.id);
                return (
                  <div key={client.id} className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
                    {/* Card Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
                            {initials(client.name)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{client.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{client.client_id}</div>
                          </div>
                        </div>
                        <span className={`w-2 h-2 rounded-full mt-2 ${statusColor(client.status)}`} />
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="text-[10px] text-slate-500">AUM</div>
                          <div className="text-sm font-semibold text-white">{formatCurrency(client.aum)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">P&L</div>
                          <div className={`text-sm font-semibold ${(client.total_pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {(client.total_pnl || 0) >= 0 ? "+" : ""}{formatCurrency(Math.abs(client.total_pnl || 0))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{client.accounts_count} account{client.accounts_count !== 1 ? "s" : ""}</span>
                        <span>Joined {formatDate(client.joined_at)}</span>
                      </div>
                    </div>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => toggleClientExpand(client.id)}
                      className="w-full px-4 py-2 border-t border-white/5 bg-white/[0.02] text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
                    >
                      {isExpanded ? (
                        <>Collapse Accounts <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>{client.accounts_count} Connected Account{client.accounts_count !== 1 ? "s" : ""} <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>

                    {/* Expanded: Connected Accounts */}
                    {isExpanded && (
                      <div className="bg-[#0F1219] border-t border-white/5 p-4 space-y-3">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Connected Accounts</div>

                        {(!client.accounts || client.accounts.length === 0) ? (
                          <div className="text-xs text-slate-600 text-center py-4">No connected accounts</div>
                        ) : (
                          client.accounts.map((acc) => {
                            const isPasswordRevealed = revealedPasswords.has(acc.id);
                            const platformLower = acc.platform.toLowerCase();
                            return (
                              <div key={acc.id} className="bg-[#020408] border border-white/5 rounded-lg p-3 space-y-3">
                                {/* Account Header */}
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded text-[8px] flex items-center justify-center font-bold ${
                                      platformLower.includes("binance")
                                        ? "bg-[#F0B90B] text-black"
                                        : platformLower.includes("mt5") || platformLower.includes("metatrader 5")
                                        ? "bg-[#2a2e39] text-slate-300"
                                        : platformLower.includes("mt4") || platformLower.includes("metatrader 4")
                                        ? "bg-[#2a2e39] text-slate-300"
                                        : platformLower.includes("tradovate")
                                        ? "bg-blue-600 text-white"
                                        : platformLower.includes("bybit")
                                        ? "bg-orange-500 text-white"
                                        : "bg-slate-700 text-slate-300"
                                    }`}>
                                      {platformLower.includes("binance") ? "BIN" :
                                       platformLower.includes("mt5") || platformLower.includes("metatrader 5") ? "MT5" :
                                       platformLower.includes("mt4") || platformLower.includes("metatrader 4") ? "MT4" :
                                       platformLower.includes("tradovate") ? "TDV" :
                                       platformLower.includes("bybit") ? "BYB" :
                                       acc.platform.slice(0, 3).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium text-white">{acc.account_name}</div>
                                      <div className="text-[10px] text-slate-500">{acc.platform} &middot; {acc.account_type}</div>
                                    </div>
                                  </div>
                                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${acc.is_active ? "bg-emerald-500" : "bg-slate-500"}`} />
                                </div>

                                {/* Balance & P&L Row */}
                                <div className="flex justify-between items-end">
                                  <div>
                                    <div className="text-[10px] text-slate-500">Balance</div>
                                    <div className="text-sm font-semibold text-white">{formatCurrency(acc.balance)}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] text-slate-500">P&L</div>
                                    <div className={`text-sm font-semibold ${acc.pnl >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                                      {acc.pnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(acc.pnl))}
                                    </div>
                                  </div>
                                </div>

                                {/* Account Details */}
                                <div className="border-t border-white/5 pt-3 space-y-2">
                                  {/* Broker */}
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Broker</span>
                                    <span className="text-slate-300 font-medium">{acc.broker || acc.platform}</span>
                                  </div>

                                  {/* Account Number */}
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Account #</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-300 font-mono">{acc.account_number || "N/A"}</span>
                                      {acc.account_number && (
                                        <button
                                          onClick={() => copyToClipboard(acc.account_number)}
                                          className="text-slate-600 hover:text-slate-300 transition-colors"
                                          title="Copy"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Username */}
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Username</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-300 font-mono">{acc.username || "N/A"}</span>
                                      {acc.username && (
                                        <button
                                          onClick={() => copyToClipboard(acc.username)}
                                          className="text-slate-600 hover:text-slate-300 transition-colors"
                                          title="Copy"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Password */}
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Password</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-300 font-mono">
                                        {isPasswordRevealed ? (acc.password || "N/A") : "••••••••"}
                                      </span>
                                      <button
                                        onClick={() => togglePasswordReveal(acc.id)}
                                        className="text-slate-600 hover:text-slate-300 transition-colors"
                                        title={isPasswordRevealed ? "Hide password" : "Show password"}
                                      >
                                        {isPasswordRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                      </button>
                                      {acc.password && (
                                        <button
                                          onClick={() => copyToClipboard(acc.password)}
                                          className="text-slate-600 hover:text-slate-300 transition-colors"
                                          title="Copy"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setTradesModal({ id: acc.id, label: acc.account_label || `${acc.platform} / ${acc.account_number}`, clientName: client.name })}
                                    className="flex-1 py-1 rounded border border-white/10 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                  >
                                    View Trades
                                  </button>
                                  <button
                                    onClick={() => toggleAccountStatus(acc.id, acc.is_active)}
                                    disabled={togglingAccount === acc.id}
                                    className={`flex-1 py-1 rounded border text-[10px] transition-colors ${
                                      acc.is_active
                                        ? "border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5"
                                        : "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                                    } ${togglingAccount === acc.id ? "opacity-50 cursor-wait" : ""}`}
                                  >
                                    {togglingAccount === acc.id ? "..." : acc.is_active ? "Deactivate" : "Activate"}
                                  </button>
                                </div>

                                {/* Algorithm Selector */}
                                <div className="relative">
                                  <select
                                    value={acc.algorithm_id || ""}
                                    onChange={(e) => assignAlgorithm(acc.id, e.target.value || null)}
                                    disabled={assigningAlgo === acc.id}
                                    className={`w-full py-1.5 px-2 rounded border text-[10px] transition-colors appearance-none cursor-pointer bg-transparent pr-6 ${
                                      acc.algorithm_id
                                        ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/5"
                                        : "border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                                    } ${assigningAlgo === acc.id ? "opacity-50 cursor-wait" : ""}`}
                                  >
                                    <option value="" className="bg-[#0B0E14] text-slate-400">Select Algorithm</option>
                                    {algorithms.map((algo) => (
                                      <option key={algo.id} value={algo.id} className="bg-[#0B0E14] text-slate-300">
                                        {algo.name} ({algo.category})
                                      </option>
                                    ))}
                                  </select>
                                  <Cpu className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                                </div>
                              </div>
                            );
                          })
                        )}

                        <button
                          onClick={() => toggleClientExpand(client.id)}
                          className="w-full py-2 text-xs text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1 border-t border-white/5 mt-2"
                        >
                          <ChevronUp className="w-3 h-3" /> Collapse Accounts
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">AUM</th>
                    <th className="px-4 py-3 text-right">P&L</th>
                    <th className="px-4 py-3 text-center">Accounts</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedClients.map((client) => (
                    <tr key={client.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-[10px] font-bold">
                            {initials(client.name)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{client.name}</div>
                            <div className="text-[10px] text-slate-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{client.client_id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] border capitalize ${statusBadge(client.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColor(client.status)}`} />
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">{formatCurrency(client.aum)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${(client.total_pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {(client.total_pnl || 0) >= 0 ? "+" : ""}{formatCurrency(Math.abs(client.total_pnl || 0))}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">
                        {client.accounts_count}
                        {client.active_accounts > 0 && (
                          <span className="text-emerald-500 text-[9px] ml-1">({client.active_accounts})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(client.joined_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Showing {(currentPage - 1) * clientsPerPage + 1}-{Math.min(currentPage * clientsPerPage, filteredClients.length)} of {filteredClients.length} clients
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-[#0B0E14] border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-[#0B0E14] border border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-[#0B0E14] border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ANALYTICS TAB ─── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Balance</span>
                  <span className="text-white font-medium">{formatFullCurrency(stats.totalBalance)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Equity</span>
                  <span className="text-white font-medium">{formatFullCurrency(stats.totalEquity)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total P&L</span>
                  <span className={`font-medium ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {stats.totalPnl >= 0 ? "+" : ""}{formatFullCurrency(Math.abs(stats.totalPnl))}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Open Trades</span>
                  <span className="text-white font-medium">{stats.totalOpenTrades}</span>
                </div>
                <div className="flex justify-between text-xs pt-3 border-t border-white/5">
                  <span className="text-slate-400">Client Active Rate</span>
                  <span className="text-emerald-400 font-medium">{stats.activePercent}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Profitable Clients</span>
                  <span className="text-emerald-400 font-medium">{stats.profitableClients} of {stats.totalClients}</span>
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Agency Health</h3>
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="40" cy="40" r="34" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                    <circle
                      cx="40" cy="40" r="34"
                      stroke={data.health.score >= 70 ? "#10b981" : data.health.score >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${213.6}`}
                      strokeDashoffset={`${213.6 - (213.6 * data.health.score) / 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-white">{data.health.score}</span>
                </div>
                <div>
                  <div className={`text-lg font-semibold ${
                    data.health.score >= 70 ? "text-emerald-400" : data.health.score >= 50 ? "text-amber-400" : "text-red-400"
                  }`}>{data.health.label}</div>
                  <div className="text-xs text-slate-500">
                    {data.health.score >= 90 ? "Top 5% of partners" : data.health.score >= 70 ? "Above average" : "Needs improvement"}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Activity Level</span>
                  <span className={data.health.activityLevel === "High" ? "text-emerald-400" : data.health.activityLevel === "Medium" ? "text-amber-400" : "text-red-400"}>
                    {data.health.activityLevel}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="text-emerald-400">{data.health.paymentStatus}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Growth Rate</span>
                  <span className="text-emerald-400">{data.health.growthRate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ALGORITHMS TAB ─── */}
      {activeTab === "algorithms" && (
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-8 text-center">
          <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-slate-400 text-sm">Algorithm tracking coming soon.</div>
          <div className="text-slate-600 text-xs mt-1">Algorithms assigned to this agency will appear here.</div>
        </div>
      )}

      {/* ─── PAYMENTS TAB ─── */}
      {activeTab === "payments" && (
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
                <span className="text-white font-medium">{formatFullCurrency(Math.max(0, stats.totalPnl * 0.2))}</span>
              </div>
              <div className="flex justify-between text-xs pb-3 border-b border-white/5">
                <span className="text-slate-400">Client Signup Fees ({stats.totalClients} × $50)</span>
                <span className="text-white font-medium">{formatFullCurrency(stats.totalClients * 50)}</span>
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

      {/* ─── ACTIVITY LOG TAB ─── */}
      {activeTab === "activity" && (
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-8 text-center">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-slate-400 text-sm">Activity log coming soon.</div>
          <div className="text-slate-600 text-xs mt-1">Agency activity history will be tracked here.</div>
        </div>
      )}

      {/* ─── SETTINGS TAB ─── */}
      {activeTab === "settings" && (
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-8 text-center">
          <Settings className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-slate-400 text-sm">Agency settings coming soon.</div>
          <div className="text-slate-600 text-xs mt-1">Configuration options will be available here.</div>
        </div>
      )}

      {/* ═══ Edit Agency Modal ═══ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0E14] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0B0E14] shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Edit Agency</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-400 font-medium">{agency.name}</span>
                  <span className="text-xs font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    #{agency.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>

              {/* ── Section 1: Basic Information ── */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Building2 className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Basic Information</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Agency name and primary details</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Agency Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. TradePro Solutions"
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Display Name</label>
                    <input
                      type="text"
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Agency Logo</label>
                    <div className="flex items-center gap-4 p-3 bg-[#020408] border border-white/10 rounded-lg">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold border border-white/10">
                        {initials(editForm.name || agency.name)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">Current Logo</div>
                        <div className="text-xs text-slate-500">JPG, PNG or SVG. Max 2MB.</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium text-slate-300 hover:text-white transition-all">
                          Change
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Primary Contact ── */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <User className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Primary Contact</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Main point of contact for this agency</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Contact Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={editForm.contact_name}
                      onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Contact Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="email"
                        value={editForm.contact_email}
                        onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors pr-8"
                      />
                      {editForm.contact_email && editForm.contact_email.includes("@") && (
                        <Check className="absolute right-3 top-3 w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.contact_phone}
                      onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Website</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors pr-8 placeholder-slate-600"
                      />
                      {editForm.website && (
                        <a href={editForm.website} target="_blank" rel="noopener noreferrer" className="absolute right-2 top-2.5 text-slate-500 hover:text-white">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Account Details ── */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Settings className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Account Details</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Account configuration and access</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Account Manager</label>
                    <div className="flex items-center gap-2 bg-[#020408] border border-white/10 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-[8px] text-white font-bold ring-1 ring-white/10">
                        {editForm.sold_by ? initials(editForm.sold_by) : "??"}
                      </div>
                      <input
                        type="text"
                        value={editForm.sold_by}
                        onChange={(e) => setEditForm({ ...editForm, sold_by: e.target.value })}
                        placeholder="Account manager name"
                        className="flex-1 bg-transparent text-sm text-white font-medium focus:outline-none placeholder-slate-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">License Key</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={editForm.license_key || "No key assigned"}
                        className="flex-1 bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-300 focus:outline-none cursor-default"
                      />
                      <button
                        onClick={() => copyToClipboard(editForm.license_key)}
                        className="px-3 border border-white/10 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                        title="Copy license key"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Tier & Status ── */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <DollarSign className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Tier &amp; Status</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Subscription plan and access control</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Subscription Tier</label>
                    <select
                      value={editForm.plan}
                      onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="starter" className="bg-[#0B0E14]">Starter</option>
                      <option value="pro" className="bg-[#0B0E14]">Growth (Pro)</option>
                      <option value="enterprise" className="bg-[#0B0E14]">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Monthly Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                      <input
                        type="number"
                        value={editForm.monthly_fee}
                        onChange={(e) => setEditForm({ ...editForm, monthly_fee: e.target.value })}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg pl-6 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Next Billing Date</label>
                    <div className="bg-[#020408] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-300">
                      {(() => {
                        const d = new Date();
                        d.setMonth(d.getMonth() + 1, 1);
                        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                      })()}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-5">
                  <label className="text-xs font-medium text-slate-400 block mb-3">Agency Status</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Active */}
                    <label className="cursor-pointer group relative">
                      <input
                        type="radio"
                        name="editStatus"
                        checked={editForm.status === "active"}
                        onChange={() => setEditForm({ ...editForm, status: "active" })}
                        className="peer sr-only"
                      />
                      <div className={`p-3 rounded-lg border transition-all ${
                        editForm.status === "active"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-white/10 bg-[#020408] hover:border-emerald-500/50 hover:bg-emerald-500/5"
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${editForm.status === "active" ? "bg-emerald-500" : "border border-slate-500"}`} />
                          <span className={`font-semibold text-sm ${editForm.status === "active" ? "text-emerald-400" : "text-slate-300"}`}>Active</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 pl-5">Full system access</p>
                      </div>
                    </label>
                    {/* Paused */}
                    <label className="cursor-pointer group relative">
                      <input
                        type="radio"
                        name="editStatus"
                        checked={editForm.status === "paused"}
                        onChange={() => setEditForm({ ...editForm, status: "paused" })}
                        className="peer sr-only"
                      />
                      <div className={`p-3 rounded-lg border transition-all ${
                        editForm.status === "paused"
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-white/10 bg-[#020408] hover:border-amber-500/50 hover:bg-amber-500/5"
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${editForm.status === "paused" ? "bg-amber-500" : "border border-slate-500"}`} />
                          <span className={`font-semibold text-sm ${editForm.status === "paused" ? "text-amber-400" : "text-slate-300"}`}>Paused</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 pl-5">Temporarily disabled</p>
                      </div>
                    </label>
                    {/* Suspended */}
                    <label className="cursor-pointer group relative">
                      <input
                        type="radio"
                        name="editStatus"
                        checked={editForm.status === "suspended"}
                        onChange={() => setEditForm({ ...editForm, status: "suspended" })}
                        className="peer sr-only"
                      />
                      <div className={`p-3 rounded-lg border transition-all ${
                        editForm.status === "suspended"
                          ? "border-red-500 bg-red-500/10"
                          : "border-white/10 bg-[#020408] hover:border-red-500/50 hover:bg-red-500/5"
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${editForm.status === "suspended" ? "bg-red-500" : "border border-slate-500"}`} />
                          <span className={`font-semibold text-sm ${editForm.status === "suspended" ? "text-red-400" : "text-slate-300"}`}>Suspended</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 pl-5">Access revoked</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Section 5: Notifications & API (side by side) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notifications */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      <Bell className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">Client Signup</div>
                        <div className="text-[10px] text-slate-500">Alert on new user registration</div>
                      </div>
                      <button
                        onClick={() => setNotifClientSignup(!notifClientSignup)}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${notifClientSignup ? "bg-blue-600" : "bg-slate-700"}`}
                      >
                        <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all duration-300 ${notifClientSignup ? "left-[18px]" : "left-[2px]"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">Low Balance</div>
                        <div className="text-[10px] text-slate-500">Alert when funds below $500</div>
                      </div>
                      <button
                        onClick={() => setNotifLowBalance(!notifLowBalance)}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${notifLowBalance ? "bg-blue-600" : "bg-slate-700"}`}
                      >
                        <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all duration-300 ${notifLowBalance ? "left-[18px]" : "left-[2px]"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Access */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      <Globe className="w-[18px] h-[18px]" />
                    </div>
                    <h3 className="text-base font-semibold text-white">API Access</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">Enable REST API</div>
                        <div className="text-[10px] text-slate-500">Allow programmatic access</div>
                      </div>
                      <button
                        onClick={() => setApiEnabled(!apiEnabled)}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${apiEnabled ? "bg-emerald-500" : "bg-slate-700"}`}
                      >
                        <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-all duration-300 ${apiEnabled ? "left-[18px]" : "left-[2px]"}`} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Rate Limit (req/min)</label>
                        <input
                          type="number"
                          value={apiRateLimit}
                          onChange={(e) => setApiRateLimit(e.target.value)}
                          className="w-full bg-[#020408] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Webhook Active</label>
                        <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Yes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 6: Internal Notes & History (collapsible) ── */}
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAudit(!showAudit)}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      <Edit3 className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Internal Notes &amp; History</h3>
                      <p className="text-xs text-slate-500">Admin comments and audit log</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showAudit ? "rotate-180" : ""}`} />
                </button>
                {showAudit && (
                  <div className="px-6 pb-6 pt-0 border-t border-white/5">
                    <div className="mt-4">
                      <label className="text-xs font-medium text-amber-500 mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Private Admin Notes
                      </label>
                      <textarea
                        value={editForm.admin_notes}
                        onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                        className="w-full h-24 bg-[#020408] border border-amber-500/20 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 resize-none"
                        placeholder="Add notes visible only to admins..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4" />
            </div>

            {/* Footer Action Bar */}
            <div className="bg-[#0a0a0a] border-t border-white/10 p-5 flex items-center justify-between shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <button className="px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors border border-transparent hover:border-white/10">
                  Export Data
                </button>
                <button
                  disabled={editSaving}
                  onClick={async () => {
                    setEditSaving(true);
                    try {
                      const res = await fetch(`/api/admin/agencies/${agencyId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(editForm),
                      });
                      if (res.ok) {
                        const updated = await fetch(`/api/admin/agencies/${agencyId}`).then((r) => r.json());
                        setData(updated);
                        setShowEditModal(false);
                      }
                    } catch (err) {
                      console.error("Failed to save:", err);
                    } finally {
                      setEditSaving(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Account Trades Modal */}
      {tradesModal && (
        <AccountTradesModal
          isOpen={!!tradesModal}
          onClose={() => setTradesModal(null)}
          accountId={tradesModal.id}
          accountLabel={tradesModal.label}
          clientName={tradesModal.clientName}
        />
      )}
    </div>
  );
}
