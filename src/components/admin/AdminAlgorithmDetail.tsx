"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Cpu,
  LineChart,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowLeft,
  Pencil,
  Save,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Activity,
  Shield,
  Zap,
  Globe,
  Trash2,
  Archive,
  Upload,
  Plus,
  Check,
  X,
  AlertTriangle,
  Clock,
  DollarSign,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface AlgorithmData {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  image_url: string | null;
  roi: string;
  drawdown: string;
  win_rate: string;
  sharpe_ratio: number;
  risk_level: string;
  pairs: string;
  status: string;
  metrics: Record<string, unknown>;
  info: Record<string, unknown>;
  equity_chart: { labels: string[]; data: number[] } | null;
  monthly_returns: unknown[] | null;
  created_at: string;
  updated_at: string;
  agencies_count: number;
  clients_count: number;
}

// ─── Sidebar NavItem ──────────────────────────────────────
function NavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: string;
  href?: string;
}) {
  const cls = active
    ? "bg-[#1e2a3a] text-white"
    : "text-slate-400 hover:text-white hover:bg-[#1e2a3a]/50";
  const inner = (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${cls}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <span className="ml-auto text-[11px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

// ─── Status Badge ──────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    deprecated: "bg-red-500/10 text-red-400 border-red-500/20",
    beta: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || styles.active
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "active"
            ? "bg-emerald-400"
            : status === "paused"
            ? "bg-amber-400"
            : status === "deprecated"
            ? "bg-red-400"
            : "bg-blue-400"
        }`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Category Icon ──────────────────────────────────────
function CategoryIcon({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Forex: "from-blue-500 to-blue-600",
    Crypto: "from-purple-500 to-purple-600",
    Stocks: "from-emerald-500 to-emerald-600",
    Futures: "from-amber-500 to-amber-600",
  };
  const icons: Record<string, React.ReactNode> = {
    Forex: <DollarSign className="w-6 h-6 text-white" />,
    Crypto: <Zap className="w-6 h-6 text-white" />,
    Stocks: <BarChart3 className="w-6 h-6 text-white" />,
    Futures: <Activity className="w-6 h-6 text-white" />,
  };
  return (
    <div
      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
        colors[category] || colors.Forex
      } flex items-center justify-center`}
    >
      {icons[category] || icons.Forex}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function AdminAlgorithmDetail({
  algorithmId,
}: {
  algorithmId: string;
}) {
  const [algo, setAlgo] = useState<AlgorithmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Forex");
  const [editStatus, setEditStatus] = useState("active");
  const [editRoi, setEditRoi] = useState("");
  const [editDrawdown, setEditDrawdown] = useState("");
  const [editWinRate, setEditWinRate] = useState("");
  const [editSharpeRatio, setEditSharpeRatio] = useState("");
  const [editRiskLevel, setEditRiskLevel] = useState("medium");
  const [editPairs, setEditPairs] = useState("");
  const [editTimeframe, setEditTimeframe] = useState("");
  const [editStrategyType, setEditStrategyType] = useState("");
  const [editMinAccount, setEditMinAccount] = useState("");

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [algorithmsExpanded, setAlgorithmsExpanded] = useState(true);

  const fetchAlgorithm = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/algorithms/${algorithmId}`);
      if (!res.ok) throw new Error("Failed to fetch algorithm");
      const json = await res.json();
      setAlgo(json.algorithm);

      // Populate edit fields
      const a = json.algorithm;
      setEditName(a.name);
      setEditDescription(a.description);
      setEditCategory(a.category);
      setEditStatus(a.status);
      setEditRoi(a.roi);
      setEditDrawdown(a.drawdown);
      setEditWinRate(a.win_rate);
      setEditSharpeRatio(String(a.sharpe_ratio || ""));
      setEditRiskLevel(a.risk_level);
      setEditPairs(a.pairs);
      setEditTimeframe((a.info as Record<string, string>)?.timeframe || "");
      setEditStrategyType((a.info as Record<string, string>)?.strategy_type || "");
      setEditMinAccount((a.info as Record<string, string>)?.min_account || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [algorithmId]);

  useEffect(() => {
    fetchAlgorithm();
  }, [fetchAlgorithm]);

  // Render equity chart
  useEffect(() => {
    if (!algo?.equity_chart || !chartRef.current) return;
    const Chart = (window as unknown as Record<string, unknown>).Chart as unknown;
    if (!Chart) return;

    // Destroy previous chart
    if (chartInstanceRef.current) {
      (chartInstanceRef.current as { destroy: () => void }).destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const ChartConstructor = Chart as new (
      ctx: CanvasRenderingContext2D,
      config: unknown
    ) => unknown;

    chartInstanceRef.current = new ChartConstructor(ctx, {
      type: "line",
      data: {
        labels: algo.equity_chart.labels,
        datasets: [
          {
            label: "Equity",
            data: algo.equity_chart.data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e293b",
            titleColor: "#e2e8f0",
            bodyColor: "#94a3b8",
            borderColor: "#334155",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(148,163,184,0.08)" },
            ticks: { color: "#64748b", maxTicksLimit: 8 },
          },
          y: {
            grid: { color: "rgba(148,163,184,0.08)" },
            ticks: { color: "#64748b" },
          },
        },
      },
    });
  }, [algo?.equity_chart]);

  const handleSave = async () => {
    if (!algo) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const body: Record<string, unknown> = {
        name: editName,
        description: editDescription,
        category: editCategory,
        status: editStatus,
        roi: editRoi,
        drawdown: editDrawdown,
        win_rate: editWinRate,
        metrics: {
          ...(algo.metrics || {}),
          sharpe_ratio: parseFloat(editSharpeRatio) || 0,
          risk_level: editRiskLevel,
        },
        info: {
          ...(algo.info || {}),
          risk_level: editRiskLevel,
          instruments: editPairs,
          pairs: editPairs,
          timeframe: editTimeframe,
          strategy_type: editStrategyType,
          min_account: editMinAccount,
        },
      };

      const res = await fetch(`/api/admin/algorithms/${algorithmId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSaveSuccess(true);
      setEditMode(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchAlgorithm(); // Refresh data
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this algorithm? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/algorithms/${algorithmId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      window.location.href = "/dashboard/algorithms";
    } catch (err) {
      alert("Failed to delete algorithm: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  // ─── Render ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen bg-[#0a0f1a] text-white items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading algorithm...</p>
        </div>
      </div>
    );
  }

  if (error || !algo) {
    return (
      <div className="flex h-screen bg-[#0a0f1a] text-white items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Algorithm Not Found</h2>
          <p className="text-slate-400 mb-4">{error || "Could not load algorithm data."}</p>
          <a
            href="/dashboard/algorithms"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            &larr; Back to Algorithm Library
          </a>
        </div>
      </div>
    );
  }

  const metrics = algo.metrics as Record<string, unknown>;
  const info = algo.info as Record<string, unknown>;

  return (
    <div className="flex h-screen bg-[#0a0f1a] text-white overflow-hidden">
      {/* ─── Sidebar ────────────────────────────────────── */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-[#0d1420] border-r border-white/5 flex-shrink-0 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex flex-col h-full w-64">
          {/* Logo */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight">
                  AlgoFinTech
                </h1>
                <p className="text-[11px] text-slate-500">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              href="/dashboard"
            />
            <NavItem
              icon={Building2}
              label="All Agencies"
              href="/dashboard/agencies"
            />

            {/* Algorithm Library section */}
            <div>
              <button
                onClick={() => setAlgorithmsExpanded(!algorithmsExpanded)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors w-full text-left bg-[#1e2a3a] text-white"
              >
                <LineChart className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Algorithm Library</span>
                {algorithmsExpanded ? (
                  <ChevronDown className="w-4 h-4 ml-auto" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
              {algorithmsExpanded && (
                <div className="ml-6 mt-1 space-y-0.5">
                  <a
                    href="/dashboard/algorithms"
                    className="block px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-[#1e2a3a]/50 transition-colors"
                  >
                    All Algorithms
                  </a>
                  <span className="block px-3 py-1.5 text-sm text-blue-400 bg-blue-500/10 rounded-lg">
                    {algo.name}
                  </span>
                </div>
              )}
            </div>

            <NavItem icon={Users} label="Users" />
            <NavItem icon={Settings} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-[#0d1420] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#1a2332] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 w-72 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <a href="/dashboard" className="hover:text-slate-300 transition-colors">
                Dashboard
              </a>
              <ChevronRight className="w-4 h-4" />
              <a href="/dashboard/algorithms" className="hover:text-slate-300 transition-colors">
                Algorithms
              </a>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-300">{algo.name}</span>
            </div>

            {/* Header row */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-start gap-4">
                <a
                  href="/dashboard/algorithms"
                  className="mt-1 p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400" />
                </a>
                <CategoryIcon category={editMode ? editCategory : algo.category} />
                <div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-2xl font-bold bg-[#1a2332] border border-white/10 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500/50 w-full"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold">{algo.name}</h1>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <StatusBadge status={editMode ? editStatus : algo.status} />
                    <span className="text-slate-500 text-sm">
                      ID: {algo.id.slice(0, 8)}...
                    </span>
                    <span className="text-slate-500 text-sm">
                      Last updated:{" "}
                      {new Date(algo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg text-sm border border-emerald-500/20">
                    <Check className="w-4 h-4" />
                    Saved successfully
                  </div>
                )}
                {saveError && (
                  <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/20">
                    <X className="w-4 h-4" />
                    {saveError}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (editMode) {
                      // Cancel — reset fields
                      setEditName(algo.name);
                      setEditDescription(algo.description);
                      setEditCategory(algo.category);
                      setEditStatus(algo.status);
                      setEditRoi(algo.roi);
                      setEditDrawdown(algo.drawdown);
                      setEditWinRate(algo.win_rate);
                      setEditSharpeRatio(String(algo.sharpe_ratio || ""));
                      setEditRiskLevel(algo.risk_level);
                      setEditPairs(algo.pairs);
                    }
                    setEditMode(!editMode);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    editMode
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "bg-[#1a2332] text-slate-300 border border-white/10 hover:bg-[#1e2a3a]"
                  }`}
                >
                  {editMode ? (
                    <>
                      <X className="w-4 h-4" /> Cancel
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" /> Edit Mode
                    </>
                  )}
                </button>
                {editMode && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              {editMode ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 resize-none"
                  placeholder="Algorithm description..."
                />
              ) : (
                <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                  {algo.description}
                </p>
              )}
            </div>

            {/* ─── Two-column Layout ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ─── Left Column (1/3) ─────────────────── */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    {/* Asset Class */}
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Asset Class
                      </label>
                      {editMode ? (
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="Forex">Forex</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Stocks">Stocks</option>
                          <option value="Futures">Futures</option>
                        </select>
                      ) : (
                        <p className="text-sm text-white">{algo.category}</p>
                      )}
                    </div>
                    {/* Risk Profile */}
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Risk Profile
                      </label>
                      {editMode ? (
                        <select
                          value={editRiskLevel}
                          onChange={(e) => setEditRiskLevel(e.target.value)}
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      ) : (
                        <p className="text-sm text-white capitalize">
                          {algo.risk_level}
                        </p>
                      )}
                    </div>
                    {/* Timeframe */}
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Timeframe
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editTimeframe}
                          onChange={(e) => setEditTimeframe(e.target.value)}
                          placeholder="e.g. M15, H1, H4"
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-sm text-white">
                          {(info.timeframe as string) || "—"}
                        </p>
                      )}
                    </div>
                    {/* Strategy Type */}
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Strategy Type
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editStrategyType}
                          onChange={(e) => setEditStrategyType(e.target.value)}
                          placeholder="e.g. Scalping, Swing, Trend Following"
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-sm text-white">
                          {(info.strategy_type as string) || "—"}
                        </p>
                      )}
                    </div>
                    {/* Instruments */}
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Instruments / Pairs
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editPairs}
                          onChange={(e) => setEditPairs(e.target.value)}
                          placeholder="e.g. EURUSD, GBPUSD, USDJPY"
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-sm text-white">{algo.pairs || "—"}</p>
                      )}
                    </div>
                    {/* Min Account */}
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Minimum Account Size
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editMinAccount}
                          onChange={(e) => setEditMinAccount(e.target.value)}
                          placeholder="e.g. $5,000"
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-sm text-white">
                          {(info.min_account as string) || "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Usage Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {algo.agencies_count}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Agencies</p>
                    </div>
                    <div className="bg-[#1a2332] rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-400">
                        {algo.clients_count}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Clients</p>
                    </div>
                  </div>
                </div>

                {/* Status Management */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Status Management
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Current Status
                      </label>
                      {editMode ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full bg-[#1a2332] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="deprecated">Deprecated</option>
                        </select>
                      ) : (
                        <StatusBadge status={algo.status} />
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Created
                      </label>
                      <p className="text-sm text-white flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(algo.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Right Column (2/3) ─────────────────── */}
              <div className="lg:col-span-2 space-y-6">
                {/* Performance Metrics */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Total Return */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-500">
                          Total Return
                        </span>
                      </div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editRoi}
                          onChange={(e) => setEditRoi(e.target.value)}
                          className="w-full bg-[#0d1420] border border-white/10 rounded px-2 py-1 text-lg font-bold text-emerald-400 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-lg font-bold text-emerald-400">
                          {algo.roi}
                        </p>
                      )}
                    </div>
                    {/* Win Rate */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-500">
                          Win Rate
                        </span>
                      </div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editWinRate}
                          onChange={(e) => setEditWinRate(e.target.value)}
                          className="w-full bg-[#0d1420] border border-white/10 rounded px-2 py-1 text-lg font-bold text-blue-400 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-lg font-bold text-blue-400">
                          {algo.win_rate}
                        </p>
                      )}
                    </div>
                    {/* Max Drawdown */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-slate-500">
                          Max Drawdown
                        </span>
                      </div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editDrawdown}
                          onChange={(e) => setEditDrawdown(e.target.value)}
                          className="w-full bg-[#0d1420] border border-white/10 rounded px-2 py-1 text-lg font-bold text-red-400 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-lg font-bold text-red-400">
                          {algo.drawdown}
                        </p>
                      )}
                    </div>
                    {/* Sharpe Ratio */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-slate-500">
                          Sharpe Ratio
                        </span>
                      </div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editSharpeRatio}
                          onChange={(e) => setEditSharpeRatio(e.target.value)}
                          className="w-full bg-[#0d1420] border border-white/10 rounded px-2 py-1 text-lg font-bold text-purple-400 focus:outline-none focus:border-blue-500/50"
                        />
                      ) : (
                        <p className="text-lg font-bold text-purple-400">
                          {algo.sharpe_ratio}
                        </p>
                      )}
                    </div>
                    {/* Profit Factor */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-slate-500">
                          Profit Factor
                        </span>
                      </div>
                      <p className="text-lg font-bold text-yellow-400">
                        {(metrics.profit_factor as number) || "—"}
                      </p>
                    </div>
                    {/* Avg Win */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-500">Avg Win</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-400">
                        {(metrics.avg_win as string) || "—"}
                      </p>
                    </div>
                    {/* Avg Loss */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-slate-500">
                          Avg Loss
                        </span>
                      </div>
                      <p className="text-lg font-bold text-red-400">
                        {(metrics.avg_loss as string) || "—"}
                      </p>
                    </div>
                    {/* Total Trades */}
                    <div className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          Total Trades
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {(metrics.total_trades as number) ||
                          (info.trades_per_month as string) ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  {/* Equity Chart */}
                  <div>
                    <h4 className="text-xs text-slate-500 font-medium mb-3">
                      Equity Curve
                    </h4>
                    <div className="bg-[#1a2332] rounded-lg p-4 h-64">
                      {algo.equity_chart ? (
                        <canvas ref={chartRef} className="w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-600 text-sm">
                          No equity chart data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trade History */}
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-blue-400" />
                      Trade History
                    </h3>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1a2332] border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Import CSV
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        Add Trade
                      </button>
                    </div>
                  </div>
                  {/* Trade table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 text-xs border-b border-white/5">
                          <th className="text-left py-3 px-3 font-medium">
                            Trade ID
                          </th>
                          <th className="text-left py-3 px-3 font-medium">
                            Entry Time
                          </th>
                          <th className="text-left py-3 px-3 font-medium">
                            Direction
                          </th>
                          <th className="text-left py-3 px-3 font-medium">
                            Entry
                          </th>
                          <th className="text-left py-3 px-3 font-medium">
                            Exit
                          </th>
                          <th className="text-left py-3 px-3 font-medium">
                            Size
                          </th>
                          <th className="text-left py-3 px-3 font-medium">
                            P/L
                          </th>
                          <th className="text-left py-3 px-3 font-medium">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            colSpan={8}
                            className="py-12 text-center text-slate-600"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <LineChart className="w-8 h-8 text-slate-700" />
                              <p>No trade history available</p>
                              <p className="text-xs text-slate-700">
                                Import a CSV or add trades manually to see them
                                here
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Bottom Row ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Availability & Pricing */}
              <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Availability &amp; Pricing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Globally Available
                    </span>
                    <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <p className="text-xs text-slate-500 mb-3">
                      Available Tiers
                    </p>
                    <div className="space-y-2">
                      {["Enterprise", "Pro", "Starter"].map((tier) => (
                        <label
                          key={tier}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-4 h-4 rounded border border-blue-500 bg-blue-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-400" />
                          </div>
                          <span className="text-sm text-slate-300">{tier}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <label className="text-xs text-slate-500 block mb-1">
                      Monthly Fee Override
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                        $
                      </span>
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full bg-[#1a2332] border border-white/10 rounded-lg pl-7 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#111827] border border-red-500/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#1a2332] rounded-lg p-4">
                    <div>
                      <p className="text-sm text-white font-medium">
                        Archive Algorithm
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hides the algorithm from all agencies and clients.
                        Reversible.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("Archive this algorithm? It will be hidden from agencies and clients.")) return;
                        try {
                          await fetch(`/api/admin/algorithms/${algorithmId}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "deprecated" }),
                          });
                          fetchAlgorithm();
                        } catch {
                          alert("Failed to archive algorithm.");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-sm hover:bg-amber-500/20 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-[#1a2332] rounded-lg p-4">
                    <div>
                      <p className="text-sm text-white font-medium">
                        Delete Permanently
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Permanently deletes this algorithm and all associated
                        data. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chart.js CDN Script */}
      <script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"
        async
      />
    </div>
  );
}
