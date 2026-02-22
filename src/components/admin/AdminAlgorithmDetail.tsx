"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  Cpu,
  LineChart,
  Settings,
  Bell,
  ChevronDown,
  TrendingUp,
  Save,
  Share2,
  Edit3,
  ImagePlus,
  UploadCloud,
  Plus,
  Edit2,
  Wallet,
  AlertTriangle,
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

// ─── Main Component ──────────────────────────────────────
export default function AdminAlgorithmDetail({
  algorithmId,
}: {
  algorithmId: string;
}) {
  const [algo, setAlgo] = useState<AlgorithmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showAddTrade, setShowAddTrade] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("Forex");
  const [editStatus, setEditStatus] = useState("active");
  const [editRoi, setEditRoi] = useState("");
  const [editDrawdown, setEditDrawdown] = useState("");
  const [editWinRate, setEditWinRate] = useState("");
  const [editSharpeRatio, setEditSharpeRatio] = useState("");
  const [editRiskLevel, setEditRiskLevel] = useState("Medium");
  const [editPairs, setEditPairs] = useState("");
  const [editTimeframe, setEditTimeframe] = useState("");
  const [editStrategyType, setEditStrategyType] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [licensingFee, setLicensingFee] = useState("199.00");

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);

  const fetchAlgorithm = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/algorithms/${algorithmId}`);
      if (!res.ok) throw new Error("Failed to fetch algorithm");
      const json = await res.json();
      setAlgo(json.algorithm);

      const a = json.algorithm;
      setEditName(a.name);
      setEditDescription(a.description);
      setEditCategory(a.category);
      setEditStatus(a.status);
      setEditRoi(a.roi);
      setEditDrawdown(a.drawdown);
      setEditWinRate(a.win_rate);
      setEditSharpeRatio(String(a.sharpe_ratio || ""));
      setEditRiskLevel(a.risk_level || "Medium");
      setEditPairs(a.pairs);
      setEditTimeframe((a.info as Record<string, string>)?.timeframe || "");
      setEditStrategyType((a.info as Record<string, string>)?.strategy_type || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [algorithmId]);

  useEffect(() => {
    fetchAlgorithm();
  }, [fetchAlgorithm]);

  // Render equity chart with emerald gradient
  useEffect(() => {
    if (!chartRef.current) return;
    const Chart = (window as any).Chart;
    if (!Chart) return;

    if (chartInstanceRef.current) {
      (chartInstanceRef.current as any).destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

    const chartData = algo?.equity_chart
      ? { labels: algo.equity_chart.labels, data: algo.equity_chart.data }
      : {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
          data: [10000, 10800, 10600, 11400, 12100, 11900, 12800, 13500, 13200, 14200],
        };

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Equity Growth",
            data: chartData.data,
            borderColor: "#10b981",
            backgroundColor: gradient,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
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
            mode: "index",
            intersect: false,
            backgroundColor: "#1e293b",
            titleColor: "#f8fafc",
            bodyColor: "#cbd5e1",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function (context: any) {
                let label = context.dataset.label || "";
                if (label) label += ": ";
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#64748b", font: { size: 10, family: "'Inter', sans-serif" } },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: {
              color: "#64748b",
              font: { size: 10, family: "'Inter', sans-serif" },
              callback: function (value: any) {
                return "$" + value / 1000 + "k";
              },
            },
          },
        },
        interaction: { intersect: false, mode: "index" },
      },
    });
  }, [algo, loading]);

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
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchAlgorithm();
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
      const res = await fetch(`/api/admin/algorithms/${algorithmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      window.location.href = "/dashboard/algorithms";
    } catch (err) {
      alert("Failed to delete algorithm: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleArchive = async () => {
    if (!confirm("Archive this algorithm? It will be hidden from new users.")) return;
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
  };

  const handleStatusUpdate = async () => {
    try {
      await fetch(`/api/admin/algorithms/${algorithmId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus }),
      });
      setStatusNotes("");
      fetchAlgorithm();
    } catch {
      alert("Failed to update status.");
    }
  };

  // ─── Loading / Error ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen bg-[#020408] text-white items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading algorithm...</p>
        </div>
      </div>
    );
  }

  if (error || !algo) {
    return (
      <div className="flex h-screen bg-[#020408] text-white items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Algorithm Not Found</h2>
          <p className="text-slate-400 mb-4">{error || "Could not load algorithm data."}</p>
          <a href="/dashboard/algorithms" className="text-blue-400 hover:text-blue-300 text-sm">
            &larr; Back to Algorithm Library
          </a>
        </div>
      </div>
    );
  }

  const metrics = (algo.metrics || {}) as Record<string, any>;
  const info = (algo.info || {}) as Record<string, any>;

  // Status badge color
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    paused: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    deprecated: "bg-red-500/10 border-red-500/20 text-red-400",
    beta: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
  const statusBadge = statusColors[algo.status] || statusColors.active;

  return (
    <div className="antialiased h-screen w-screen overflow-hidden flex text-sm" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#020408", color: "#94a3b8" }}>
      {/* ─── Sidebar ────────────────────────────────────── */}
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
            <LayoutDashboard className="w-4 h-4 group-hover:text-slate-300" />
            <span className="font-medium">Dashboard</span>
          </a>

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Agency Management</div>
          <a href="/dashboard/agencies" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
            <Building2 className="w-4 h-4 group-hover:text-slate-300" />
            <span>All Agencies</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
            <UserPlus className="w-4 h-4 group-hover:text-slate-300" />
            <span>Pending Invitations</span>
          </a>

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Client Management</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
            <Users className="w-4 h-4 group-hover:text-slate-300" />
            <span>All Clients</span>
          </a>

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Algorithms</div>
          <a href="/dashboard/algorithms" className="flex items-center gap-3 px-3 py-2 text-white bg-blue-500/10 border border-blue-500/10 rounded-lg group">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="font-medium">Algorithm Library</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
            <LineChart className="w-4 h-4 group-hover:text-slate-300" />
            <span>Performance</span>
          </a>

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Finance</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
            <Wallet className="w-4 h-4 group-hover:text-slate-300" />
            <span>Revenue Overview</span>
          </a>
        </nav>

        <div className="p-3 border-t border-white/5">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors mb-1">
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </a>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────── */}
      <main className="flex-1 flex flex-col bg-[#020408] overflow-hidden relative">
        {/* Header */}
        <header className="h-14 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-2 text-sm">
            <a href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">Dashboard</a>
            <span className="text-slate-700">/</span>
            <a href="/dashboard/algorithms" className="text-slate-500 hover:text-slate-300 transition-colors">Algorithms</a>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium">{algo.name}</span>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {/* Save success/error indicators */}
            {saveSuccess && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">Saved!</span>
            )}
            {saveError && (
              <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded border border-red-500/20">{saveError}</span>
            )}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Edit Mode</span>
              <label className="flex items-center cursor-pointer relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={editMode}
                  onChange={() => setEditMode(!editMode)}
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020408]" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="w-full max-w-7xl mx-auto pt-6 px-6 pb-6 space-y-6">

            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      readOnly={!editMode}
                      className="text-2xl font-semibold text-white tracking-tight bg-transparent w-64 rounded px-1 -ml-1 border border-transparent hover:border-white/10 focus:bg-[#0B0E14] focus:border-blue-500/50 focus:outline-none transition-all"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                      {algo.status.charAt(0).toUpperCase() + algo.status.slice(1)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    readOnly={!editMode}
                    className="text-slate-400 text-sm w-[400px] rounded px-1 -ml-1 bg-transparent border border-transparent hover:border-white/10 focus:bg-[#0B0E14] focus:border-blue-500/50 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 hover:text-white rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* ─── Left Column ──────────────────────────── */}
              <div className="xl:col-span-1 space-y-6">
                {/* Basic Information */}
                <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Basic Information</h3>
                    <button className="text-slate-500 hover:text-blue-400 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* Master Trader Algo Account */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Master Trader Algo Account</label>
                      <select className="w-full bg-[#020408] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:border-blue-500/50 focus:outline-none appearance-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                        <option>MT4 - 882910 (Gold Scalper Main)</option>
                        <option>MT5 - 102938 (Aggressive Setup)</option>
                        <option>cTrader - 99281 (Safe Mode)</option>
                        <option>Connect New Account...</option>
                      </select>
                    </div>
                    {/* Asset Class */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Asset Class</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:border-blue-500/50 focus:outline-none appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                      >
                        <option value="Forex">Forex</option>
                        <option value="Crypto">Crypto</option>
                        <option value="Stocks">Indices</option>
                        <option value="Futures">Commodities</option>
                      </select>
                    </div>
                    {/* Risk / Timeframe grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Risk Profile</label>
                        <select
                          value={editRiskLevel}
                          onChange={(e) => setEditRiskLevel(e.target.value)}
                          className="w-full bg-[#020408] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:border-blue-500/50 focus:outline-none appearance-none"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Timeframe</label>
                        <select
                          value={editTimeframe}
                          onChange={(e) => setEditTimeframe(e.target.value)}
                          className="w-full bg-[#020408] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:border-blue-500/50 focus:outline-none appearance-none"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                        >
                          <option value="M1">1 Min (M1)</option>
                          <option value="M5">5 Min (M5)</option>
                          <option value="M15">15 Min (M15)</option>
                          <option value="H1">1 Hour (H1)</option>
                          <option value="H4">4 Hour (H4)</option>
                          <option value="D1">Daily (D1)</option>
                        </select>
                      </div>
                    </div>
                    {/* Strategy Type */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Strategy Type</label>
                      <input
                        type="text"
                        value={editStrategyType}
                        onChange={(e) => setEditStrategyType(e.target.value)}
                        placeholder="Trend Following / Breakout"
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    {/* Recommended Markets */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Recommended Markets</label>
                      <input
                        type="text"
                        value={editPairs}
                        onChange={(e) => setEditPairs(e.target.value)}
                        placeholder="XAUUSD, XAGUSD"
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    {/* Algorithm Thumbnail */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Algorithm Thumbnail</label>
                      <div className="border border-dashed border-white/10 bg-[#020408] rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors group">
                        <ImagePlus className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                        <span className="text-[10px] text-slate-500">Click to upload image</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Agencies</div>
                    <div className="text-xl font-bold text-white tracking-tight">{algo.agencies_count}</div>
                    <div className="text-[10px] text-emerald-400 mt-1">+0 this week</div>
                  </div>
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Active Clients</div>
                    <div className="text-xl font-bold text-white tracking-tight">{algo.clients_count.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-400 mt-1">+0% vs last mo</div>
                  </div>
                </div>

                {/* Status Management */}
                <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-white mb-4">Status Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Current Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:border-blue-500/50 focus:outline-none appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                      >
                        <option value="active">Active</option>
                        <option value="beta">Beta Testing</option>
                        <option value="paused">Paused</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">Change Reason / Notes</label>
                      <textarea
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 px-3 text-xs text-white h-20 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
                        placeholder="Enter reason for status change..."
                      />
                    </div>
                    <button
                      onClick={handleStatusUpdate}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Right Column (2/3) ───────────────────── */}
              <div className="xl:col-span-2 space-y-6">

                {/* Performance Metrics */}
                <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-medium text-white">Performance Metrics</h3>
                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">Last 30 Days</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Total Return */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Total Return</div>
                      <div className="text-lg font-bold text-emerald-400">{algo.roi}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Ann: {metrics.annualized || "—"}</div>
                    </div>
                    {/* Win Rate */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Win Rate</div>
                      <div className="text-lg font-bold text-blue-400">{algo.win_rate}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{metrics.wins || "—"}/{metrics.total_trades || "—"}</div>
                    </div>
                    {/* Profit Factor */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Profit Factor</div>
                      <div className="text-lg font-bold text-white">{metrics.profit_factor || "—"}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{(metrics.profit_factor as number) >= 1.5 ? "Healthy" : "—"}</div>
                    </div>
                    {/* Max Drawdown */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Max Drawdown</div>
                      <div className="text-lg font-bold text-orange-400">{algo.drawdown}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{metrics.dd_status || "—"}</div>
                    </div>
                    {/* Sharpe Ratio */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Sharpe Ratio</div>
                      <div className="text-lg font-bold text-white">{algo.sharpe_ratio || "—"}</div>
                    </div>
                    {/* Avg Win */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Avg Win</div>
                      <div className="text-lg font-bold text-emerald-400">{metrics.avg_win || "—"}</div>
                    </div>
                    {/* Avg Loss */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Avg Loss</div>
                      <div className="text-lg font-bold text-red-400">{metrics.avg_loss || "—"}</div>
                    </div>
                    {/* Trades */}
                    <div className="p-3 rounded-lg bg-[#020408] border border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Trades</div>
                      <div className="text-lg font-bold text-white">{metrics.total_trades || info.trades_per_month || "—"}</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-[300px] w-full relative">
                    <canvas ref={chartRef} />
                  </div>
                </div>

                {/* Trade History */}
                <div className="bg-[#0B0E14] border border-white/5 rounded-xl flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-sm font-medium text-white">Trade History</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowImport(!showImport)}
                        className="px-3 py-1.5 bg-[#020408] border border-white/10 hover:border-white/20 hover:text-white rounded text-[10px] font-medium text-slate-400 transition-colors flex items-center gap-2"
                      >
                        <UploadCloud className="w-3 h-3" /> Import CSV
                      </button>
                      <button
                        onClick={() => setShowAddTrade(!showAddTrade)}
                        className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 rounded text-[10px] font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" /> Add Trade Manually
                      </button>
                    </div>
                  </div>

                  {/* Import Section */}
                  {showImport && (
                    <div className="bg-[#0e1116] p-4 border-b border-white/5">
                      <div className="border border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M8 13h2M14 13h2M8 17h2M14 17h2" /></svg>
                        <p className="text-sm text-white font-medium">Drop your CSV file here</p>
                        <p className="text-xs text-slate-500 mb-4">Columns: Date, Direction, Entry, Exit, Size, P/L</p>
                        <button className="px-3 py-1.5 bg-white text-black rounded text-xs font-bold">Browse Files</button>
                      </div>
                    </div>
                  )}

                  {/* Add Trade Form */}
                  {showAddTrade && (
                    <div className="bg-[#0e1116] p-4 border-b border-white/5">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
                        <div className="col-span-1">
                          <label className="text-[10px] text-slate-500 block mb-1">Entry Time</label>
                          <input type="datetime-local" className="w-full bg-[#0B0E14] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] text-slate-500 block mb-1">Exit Time</label>
                          <input type="datetime-local" className="w-full bg-[#0B0E14] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] text-slate-500 block mb-1">Dir</label>
                          <select className="w-full bg-[#0B0E14] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none appearance-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                            <option>Long</option>
                            <option>Short</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] text-slate-500 block mb-1">Entry ($)</label>
                          <input type="number" placeholder="0.00" className="w-full bg-[#0B0E14] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] text-slate-500 block mb-1">Exit ($)</label>
                          <input type="number" placeholder="0.00" className="w-full bg-[#0B0E14] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] text-slate-500 block mb-1">Size</label>
                          <input type="number" placeholder="1.0" className="w-full bg-[#0B0E14] border border-white/10 rounded py-1.5 px-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-1">
                          <button className="w-full py-1.5 bg-blue-600 text-white rounded text-xs font-medium">Save</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/[0.02] text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="pl-5 pr-3 py-3">ID</th>
                          <th className="px-3 py-3">Entry Time</th>
                          <th className="px-3 py-3">Dir</th>
                          <th className="px-3 py-3 text-right">Entry</th>
                          <th className="px-3 py-3 text-right">Exit</th>
                          <th className="px-3 py-3 text-right">Size</th>
                          <th className="px-3 py-3 text-right">P/L ($)</th>
                          <th className="px-3 py-3 text-right">Duration</th>
                          <th className="px-3 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {/* Sample Trade Rows */}
                        <tr className="group hover:bg-white/[0.02] transition-colors">
                          <td className="pl-5 pr-3 py-3 text-slate-500 text-xs font-mono">#TR-892</td>
                          <td className="px-3 py-3 text-xs text-white">Oct 24, 14:30</td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">LONG</span>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1984.50</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1988.20</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">2.0</td>
                          <td className="px-3 py-3 text-right text-emerald-400 font-medium text-xs">+$740.00</td>
                          <td className="px-3 py-3 text-right text-slate-500 text-xs">45m</td>
                          <td className="px-3 py-3 text-right">
                            <button className="text-slate-500 hover:text-white transition-colors"><Edit2 className="w-3 h-3" /></button>
                          </td>
                        </tr>
                        <tr className="group hover:bg-white/[0.02] transition-colors">
                          <td className="pl-5 pr-3 py-3 text-slate-500 text-xs font-mono">#TR-891</td>
                          <td className="px-3 py-3 text-xs text-white">Oct 24, 12:15</td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">SHORT</span>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1982.10</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1985.00</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1.5</td>
                          <td className="px-3 py-3 text-right text-red-400 font-medium text-xs">-$435.00</td>
                          <td className="px-3 py-3 text-right text-slate-500 text-xs">2h 10m</td>
                          <td className="px-3 py-3 text-right">
                            <button className="text-slate-500 hover:text-white transition-colors"><Edit2 className="w-3 h-3" /></button>
                          </td>
                        </tr>
                        <tr className="group hover:bg-white/[0.02] transition-colors">
                          <td className="pl-5 pr-3 py-3 text-slate-500 text-xs font-mono">#TR-890</td>
                          <td className="px-3 py-3 text-xs text-white">Oct 23, 09:00</td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">LONG</span>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1975.00</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1980.50</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1.0</td>
                          <td className="px-3 py-3 text-right text-emerald-400 font-medium text-xs">+$550.00</td>
                          <td className="px-3 py-3 text-right text-slate-500 text-xs">15m</td>
                          <td className="px-3 py-3 text-right">
                            <button className="text-slate-500 hover:text-white transition-colors"><Edit2 className="w-3 h-3" /></button>
                          </td>
                        </tr>
                        <tr className="group hover:bg-white/[0.02] transition-colors">
                          <td className="pl-5 pr-3 py-3 text-slate-500 text-xs font-mono">#TR-889</td>
                          <td className="px-3 py-3 text-xs text-white">Oct 22, 16:45</td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">LONG</span>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1970.20</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">1972.80</td>
                          <td className="px-3 py-3 text-right text-slate-300 text-xs">2.5</td>
                          <td className="px-3 py-3 text-right text-emerald-400 font-medium text-xs">+$650.00</td>
                          <td className="px-3 py-3 text-right text-slate-500 text-xs">12m</td>
                          <td className="px-3 py-3 text-right">
                            <button className="text-slate-500 hover:text-white transition-colors"><Edit2 className="w-3 h-3" /></button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 border-t border-white/5 flex justify-center">
                    <button className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                      View All History <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Settings & Danger Zone Grid ──────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">

              {/* Availability Settings */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Availability &amp; Pricing</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#020408] border border-white/5">
                    <div>
                      <div className="text-xs font-medium text-white">Global Availability</div>
                      <div className="text-[10px] text-slate-500">Available to all agencies</div>
                    </div>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input type="checkbox" defaultChecked name="toggle1" id="toggle1" className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300 cursor-pointer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-500">Tier Restrictions</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-[1.15em] h-[1.15em] rounded border border-white/10 bg-white/5 checked:bg-blue-500 checked:border-blue-500 appearance-none cursor-pointer" />
                        <span className="text-xs text-slate-300">Enterprise Agencies</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-[1.15em] h-[1.15em] rounded border border-white/10 bg-white/5 checked:bg-blue-500 checked:border-blue-500 appearance-none cursor-pointer" />
                        <span className="text-xs text-slate-300">Pro Agencies</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-[1.15em] h-[1.15em] rounded border border-white/10 bg-white/5 checked:bg-blue-500 checked:border-blue-500 appearance-none cursor-pointer" />
                        <span className="text-xs text-slate-300">Starter Agencies</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Licensing Fee (Monthly)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-500">$</span>
                      <input
                        type="number"
                        value={licensingFee}
                        onChange={(e) => setLicensingFee(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-6 pr-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#0B0E14] border border-red-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <h3 className="text-sm font-medium text-red-400 mb-4">Danger Zone</h3>
                <p className="text-xs text-slate-500 mb-6">Irreversible actions that affect all agencies and clients using this algorithm.</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/10 bg-red-500/5">
                    <div>
                      <div className="text-xs font-medium text-white">Archive Algorithm</div>
                      <div className="text-[10px] text-slate-500">Hide from new users, keep for existing.</div>
                    </div>
                    <button
                      onClick={handleArchive}
                      className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded text-xs font-medium transition-colors"
                    >
                      Archive
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/10 bg-red-500/5">
                    <div>
                      <div className="text-xs font-medium text-white">Delete Permanently</div>
                      <div className="text-[10px] text-slate-500">Remove all data and access.</div>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Chart.js CDN */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js" async />
    </div>
  );
}
