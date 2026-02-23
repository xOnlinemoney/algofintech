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

// ─── Main Component ─────────────────────────────────────
export default function AdminAgencyDetail({ agencyId }: { agencyId: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("clients");
  const [clientSearch, setClientSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSection, setEditSection] = useState("basic");
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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
  });

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-500 text-sm">Loading agency details...</div>
        </div>
      </div>
    );
  }

  if (!data || !data.agency) {
    return (
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

  return (
    <div className="space-y-6">
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
                        <>Less Details <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>More Details <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/5 space-y-2 pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Email</span>
                          <span className="text-slate-300">{client.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Phone</span>
                          <span className="text-slate-300">{client.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Broker</span>
                          <span className="text-slate-300">{client.broker || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Active Accounts</span>
                          <span className="text-emerald-400">{client.active_accounts}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Risk Level</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${
                            client.risk_level === "low" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            client.risk_level === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {client.risk_level || "Medium"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Status</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border capitalize ${statusBadge(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
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
          <div className="bg-[#0B0E14] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-semibold text-white">Edit Agency</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update agency information and settings</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sidebar Tabs */}
            <div className="flex flex-1 overflow-hidden">
              <div className="w-48 border-r border-white/5 py-2 shrink-0">
                {[
                  { key: "basic", label: "Basic Info", icon: Building2 },
                  { key: "contact", label: "Primary Contact", icon: Users },
                  { key: "account", label: "Account Details", icon: Key },
                  { key: "tier", label: "Tier & Status", icon: Shield },
                  { key: "notifications", label: "Notifications", icon: Bell },
                  { key: "api", label: "API Access", icon: Globe },
                  { key: "notes", label: "Internal Notes", icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setEditSection(item.key)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                        editSection === item.key
                          ? "text-white bg-blue-500/10 border-r-2 border-blue-500"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {editSection === "basic" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Agency Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Agency Slug</label>
                        <div className="flex items-center gap-0">
                          <input
                            type="text"
                            value={editForm.slug}
                            onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-l-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                          />
                          <span className="px-3 py-2 bg-white/[0.02] border border-l-0 border-white/10 rounded-r-lg text-xs text-slate-500">
                            .algofintech.com
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editSection === "contact" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white">Primary Contact</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Contact Name</label>
                        <input
                          type="text"
                          value={editForm.contact_name}
                          onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={editForm.contact_email}
                          onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={editForm.contact_phone}
                          onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editSection === "account" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white">Account Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">License Key</label>
                        <input
                          type="text"
                          value={editForm.license_key}
                          readOnly
                          className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono cursor-not-allowed"
                        />
                        <p className="text-[10px] text-slate-600 mt-1">License keys are auto-generated and cannot be changed.</p>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Sold By</label>
                        <input
                          type="text"
                          value={editForm.sold_by}
                          onChange={(e) => setEditForm({ ...editForm, sold_by: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editSection === "tier" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white">Tier & Status</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">Partnership Tier</label>
                        <select
                          value={editForm.plan}
                          onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="starter" className="bg-[#0B0E14]">Starter</option>
                          <option value="pro" className="bg-[#0B0E14]">Growth (Pro)</option>
                          <option value="enterprise" className="bg-[#0B0E14]">Enterprise</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {editSection === "notifications" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <div className="text-xs text-slate-500">Notification preferences will be configurable soon.</div>
                  </div>
                )}

                {editSection === "api" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white">API Access</h3>
                    <div className="text-xs text-slate-500">API key management will be available soon.</div>
                  </div>
                )}

                {editSection === "notes" && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-white">Internal Notes</h3>
                    <textarea
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none h-32"
                      placeholder="Add private notes about this agency..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/agencies/${agencyId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editForm),
                    });
                    if (res.ok) {
                      // Refresh data
                      const updated = await fetch(`/api/admin/agencies/${agencyId}`).then((r) => r.json());
                      setData(updated);
                      setShowEditModal(false);
                    }
                  } catch (err) {
                    console.error("Failed to save:", err);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
