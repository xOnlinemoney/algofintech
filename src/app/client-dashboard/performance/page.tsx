"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAgencyBranding } from "@/hooks/useAgencyBranding";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Divide,
  Trophy,
  ArrowUp,
  Info,
  RefreshCw,
  CheckCircle,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Lightbulb,
  Clock,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  X,
} from "lucide-react";

/* ========== Types ========== */
interface SummaryData {
  net_pnl: number;
  total_return: number;
  win_rate: number;
  win_count: number;
  loss_count: number;
  profit_factor: number;
  max_drawdown: number;
  max_drawdown_date: string;
  total_trades: number;
  closed_trades: number;
  open_trades: number;
  avg_trade: number;
  avg_win: number;
  avg_loss: number;
  best_trade: number;
  worst_trade: number;
  win_streak: number;
  loss_streak: number;
  avg_duration: string;
  trading_days: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  starting_balance: number;
  ending_balance: number;
}

interface EquityPoint { date: string; balance: number; }
interface PnlBucket { label: string; count: number; }
interface WinRatePoint { label: string; rate: number; }
interface DayPerf { day: string; avgPnl: number; }
interface HourPerf { hour: string; avgPnl: number; }

interface AccountBreakdown {
  id: string;
  platform: string;
  platform_short: string;
  platform_color: string;
  platform_text_color: string;
  account_label: string;
  trade_count: number;
  pnl: number;
  return_pct: number;
  win_rate: number;
  is_active: boolean;
  contribution: number;
}

interface AlgoPerf {
  name: string;
  color: string;
  category: string;
  pnl: number;
  trades: number;
  win_rate: number;
}

interface AssetBreakdown { category: string; pnl: number; pct: number; }
interface TopSymbol { symbol: string; pnl: number; trades: number; win_rate: number; }
interface CalendarDay { date: string; pnl: number; }

interface RiskData {
  max_drawdown: number;
  max_drawdown_date: string;
  current_drawdown: number;
  risk_reward: string;
  var_95: number;
}

interface PerformanceData {
  summary: SummaryData;
  equity_curve: EquityPoint[];
  pnl_distribution: { buckets: PnlBucket[]; max_bucket_label: string; max_bucket_pct: number };
  win_rate_trend: WinRatePoint[];
  day_performance: DayPerf[];
  best_day: { day: string; avgPnl: number };
  hour_performance: HourPerf[];
  best_window: { label: string; pct: number };
  account_breakdown: AccountBreakdown[];
  best_account: { label: string; return_pct: number } | null;
  algo_performance: AlgoPerf[];
  asset_breakdown: AssetBreakdown[];
  top_symbols: TopSymbol[];
  calendar: CalendarDay[];
  risk: RiskData;
}

/* ========== Empty default data for new clients ========== */

/* ========== Helper Components ========== */
function fmt(n: number, prefix = "$") {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtShort(n: number) {
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const ASSET_COLORS: Record<string, string> = {
  Forex: "#3b82f6",
  Crypto: "#a855f7",
  Commodity: "#f59e0b",
  Indices: "#06b6d4",
  Stocks: "#10b981",
};

/* ========== Mini Chart via Canvas ========== */
function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, color, height]);
  return <canvas ref={canvasRef} style={{ width: "100%", height }} />;
}

/* ========== Bar Chart via Canvas ========== */
function BarChart({ data, labels, height = 200, posColor = "rgba(16,185,129,0.7)", negColor = "rgba(239,68,68,0.7)", yPrefix = "$" }: {
  data: number[]; labels: string[]; height?: number; posColor?: string; negColor?: string; yPrefix?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...data.map(Math.abs), 1);
    const padding = { left: 45, right: 10, top: 10, bottom: 25 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const barW = chartW / data.length * 0.7;
    const gap = chartW / data.length * 0.3;
    const hasNeg = data.some(d => d < 0);
    const zeroY = hasNeg ? padding.top + chartH * (max / (max * 2)) : padding.top + chartH;

    // Y axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${yPrefix}${max.toFixed(0)}`, padding.left - 5, padding.top + 10);
    ctx.fillText(`${yPrefix}0`, padding.left - 5, zeroY + 3);
    if (hasNeg) ctx.fillText(`-${yPrefix}${max.toFixed(0)}`, padding.left - 5, h - padding.bottom);

    // Zero line
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(w - padding.right, zeroY);
    ctx.stroke();

    // Bars
    data.forEach((v, i) => {
      const x = padding.left + i * (barW + gap) + gap / 2;
      const barH = (Math.abs(v) / max) * (hasNeg ? chartH / 2 : chartH);
      const y = v >= 0 ? zeroY - barH : zeroY;
      ctx.fillStyle = v >= 0 ? posColor : negColor;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();
      // X label
      ctx.fillStyle = "#64748b";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], x + barW / 2, h - 5);
    });
  }, [data, labels, height, posColor, negColor, yPrefix]);
  return <canvas ref={canvasRef} style={{ width: "100%", height }} />;
}

/* ========== Line Area Chart via Canvas ========== */
function AreaChart({ data, labels, height = 280, color = "#10b981", yPrefix = "$", showDots = false }: {
  data: number[]; labels: string[]; height?: number; color?: string; yPrefix?: string; showDots?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...data) * 0.98;
    const max = Math.max(...data) * 1.02;
    const range = max - min || 1;
    const padding = { left: 60, right: 15, top: 10, bottom: 30 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const step = chartW / (data.length - 1);

    // Y gridlines
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const val = max - (range / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${yPrefix}${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, padding.left - 5, y + 3);
    }

    // X labels
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(data.length / 8));
    labels.forEach((l, i) => {
      if (i % labelStep === 0 || i === labels.length - 1) {
        const x = padding.left + i * step;
        ctx.fillText(l, x, h - 5);
      }
    });

    // Line + fill
    const points = data.map((v, i) => ({
      x: padding.left + i * step,
      y: padding.top + chartH - ((v - min) / range) * chartH,
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, color + "4D"); // 30% opacity
    gradient.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cp1x, points[i - 1].y, cp1x, points[i].y, points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cp1x, points[i - 1].y, cp1x, points[i].y, points[i].x, points[i].y);
    }
    ctx.stroke();

    // Dots
    if (showDots) {
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    }
  }, [data, labels, height, color, yPrefix, showDots]);
  return <canvas ref={canvasRef} style={{ width: "100%", height }} />;
}

/* ========== Donut Chart ========== */
function DonutChart({ segments, height = 160 }: { segments: { value: number; color: string }[]; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || segments.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 5;
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let angle = -Math.PI / 2;
    segments.forEach(seg => {
      const sweep = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.arc(cx, cy, r * 0.7, angle + sweep, angle, true);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      angle += sweep;
    });
  }, [segments, height]);
  return <canvas ref={canvasRef} style={{ width: "100%", height }} />;
}

/* ========== Export Modal ========== */
function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0B0E14] rounded-xl border border-white/10 shadow-2xl z-10">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Export Performance Report</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Report Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-[#020408] rounded-lg border border-white/5 cursor-pointer hover:border-white/10">
                <input type="radio" name="report-type" defaultChecked className="w-4 h-4 accent-blue-600" />
                <div>
                  <p className="text-xs text-white">Summary Report</p>
                  <p className="text-[10px] text-slate-500">1-page overview</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#020408] rounded-lg border border-white/5 cursor-pointer hover:border-white/10">
                <input type="radio" name="report-type" className="w-4 h-4 accent-blue-600" />
                <div>
                  <p className="text-xs text-white">Detailed Report</p>
                  <p className="text-[10px] text-slate-500">Comprehensive, multi-page</p>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Format</label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600 rounded-lg cursor-pointer">
                <File className="w-4 h-4 text-white" /><span className="text-xs text-white">PDF</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#020408] rounded-lg border border-white/5 cursor-pointer hover:border-white/10">
                <FileSpreadsheet className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400">Excel</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#020408] rounded-lg border border-white/5 cursor-pointer hover:border-white/10">
                <FileText className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400">CSV</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Options</label>
            <div className="space-y-2">
              {["Include trade details", "Include charts", "Email report to me"].map((opt, i) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={i === 1} className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-xs text-slate-300">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white">Cancel</button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Calendar Component ========== */
function PerformanceCalendar({ data }: { data: CalendarDay[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const pnlMap = new Map<string, number>();
  data.forEach(d => pnlMap.set(d.date, d.pnl));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isFuture = (d: number) => new Date(year, month, d) > today;

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Daily Performance Calendar</h3>
          <p className="text-xs text-slate-500 mt-0.5">Visual breakdown of daily P&L</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonthOffset(m => m - 1)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-white font-medium min-w-[140px] text-center">{monthName}</span>
          <button onClick={() => setMonthOffset(m => m + 1)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-[10px] text-slate-500 uppercase py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (d === null) return <div key={`e${i}`} className="aspect-square" />;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const pnl = pnlMap.get(dateKey);
          const future = isFuture(d);
          const todayD = isToday(d);
          let bg = "bg-slate-800/30";
          if (future) bg = "bg-slate-800/20";
          else if (todayD) bg = "bg-blue-500/30 border border-blue-500/30";
          else if (pnl !== undefined) {
            if (pnl >= 150) bg = "bg-emerald-500/60";
            else if (pnl >= 50) bg = "bg-emerald-500/40";
            else if (pnl >= 0) bg = "bg-emerald-500/20";
            else if (pnl >= -30) bg = "bg-red-500/20";
            else bg = "bg-red-500/40";
          }
          return (
            <div key={d} className={`calendar-day aspect-square rounded-lg ${bg} flex flex-col items-center justify-center cursor-pointer relative group transition-transform hover:scale-110 hover:z-10`}>
              <span className={`text-[10px] ${future ? "text-slate-700" : pnl !== undefined && pnl >= 150 ? "text-white" : todayD ? "text-blue-400" : pnl === undefined ? "text-slate-600" : "text-slate-400"}`}>{d}</span>
              {pnl !== undefined && (
                <span className={`text-[8px] ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {pnl >= 0 ? "+" : ""}{fmtShort(pnl)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/5">
        {[
          { bg: "bg-red-500/40", label: "Heavy Loss" },
          { bg: "bg-red-500/20", label: "Loss" },
          { bg: "bg-slate-700", label: "No Trading" },
          { bg: "bg-emerald-500/20", label: "Profit" },
          { bg: "bg-emerald-500/60", label: "Heavy Profit" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${l.bg}`} />
            <span className="text-[10px] text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== Main Page ========== */
export default function PerformancePage() {
  const { agencyName } = useAgencyBranding();
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const lastFetch = useRef<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/client-performance");
      const json = await res.json();
      if (json?.data?.summary) {
        setData(json.data);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      lastFetch.current = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No Performance Data Yet</h2>
          <p className="text-sm text-slate-500 mb-6">
            Connect a trading account and start trading to see your performance analytics here.
          </p>
          <a href="/client-dashboard/accounts" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            Connect Account
          </a>
        </div>
      </div>
    );
  }

  const s = data.summary;
  const profitFactorLabel = s.profit_factor >= 2.0 ? "Excellent" : s.profit_factor >= 1.5 ? "Good" : s.profit_factor >= 1.0 ? "Fair" : "Poor";
  const riskLabel = s.max_drawdown < 10 ? "Low Risk Profile" : s.max_drawdown < 20 ? "Moderate Risk" : "High Risk";

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white font-semibold text-xl tracking-tight">Performance &amp; Analytics</h1>
            <p className="text-xs text-slate-500 mt-1">Detailed insights into your trading performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-4 pr-10 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer min-w-[160px]">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <button onClick={() => setExportOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0B0E14] border border-white/10 rounded-lg text-xs text-white hover:bg-white/5 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Net P&L */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Net P&L</p>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><DollarSign className="w-4 h-4" /></div>
            </div>
            <p className={`text-2xl font-semibold tracking-tight ${s.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(s.net_pnl)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs flex items-center gap-1 ${s.total_return >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                <TrendingUp className="w-3 h-3" /> {s.total_return >= 0 ? "+" : ""}{s.total_return}% Return
              </span>
            </div>
            <div className="mt-3 h-8">
              <Sparkline data={data.equity_curve.map(e => e.balance)} color="#10b981" />
            </div>
          </div>

          {/* Total Return */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Total Return</p>
              <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e293b" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${97.4}`} strokeDashoffset={`${97.4 - (97.4 * Math.min(s.total_return, 100)) / 100}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white">{s.total_return}%</span>
                </div>
              </div>
            </div>
            <p className={`text-2xl font-semibold tracking-tight ${s.total_return >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {s.total_return >= 0 ? "+" : ""}{s.total_return}%
            </p>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400">
              <Trophy className="w-3 h-3" />
              <span>Outperforming benchmarks</span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Win Rate</p>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Target className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-semibold text-white tracking-tight">{s.win_rate}%</p>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full" style={{ width: `${s.win_rate}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px]">
              <span className="text-emerald-400">{s.win_count} Wins</span>
              <span className="text-red-400">{s.loss_count} Losses</span>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Profit Factor</p>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Divide className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-semibold text-white tracking-tight">{s.profit_factor}</p>
            <div className="mt-2">
              <span className={`px-2 py-0.5 rounded text-[10px] ${s.profit_factor >= 2 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : s.profit_factor >= 1.5 ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"}`}>{profitFactorLabel}</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3" /><span>Total profits / Total losses</span>
            </div>
          </div>

          {/* Max Drawdown */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Max Drawdown</p>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><TrendingDown className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-semibold text-red-400 tracking-tight">-{s.max_drawdown}%</p>
            <div className="mt-2 text-[10px] text-slate-500">
              <span>Occurred on {data.risk.max_drawdown_date}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400">
              <RefreshCw className="w-3 h-3" /><span>Recovered</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Equity Curve */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Account Equity Growth</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Total balance across all accounts over time</p>
                </div>
              </div>
              <div style={{ height: 280 }}>
                <AreaChart data={data.equity_curve.map(e => e.balance)} labels={data.equity_curve.map(e => e.date)} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Starting Balance</p>
                  <p className="text-lg font-semibold text-slate-400">${s.starting_balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Ending Balance</p>
                  <p className="text-lg font-semibold text-white">${s.ending_balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Net Change</p>
                  <p className={`text-lg font-semibold ${s.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(s.net_pnl)} ({s.total_return >= 0 ? "+" : ""}{s.total_return}%)</p>
                </div>
              </div>
            </div>

            {/* P&L Distribution */}
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white">P&L Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">How your profits and losses are distributed</p>
              </div>
              <div style={{ height: 280 }}>
                <BarChart
                  data={data.pnl_distribution.buckets.map(b => b.count)}
                  labels={data.pnl_distribution.buckets.map(b => b.label)}
                  height={280}
                  yPrefix=""
                />
              </div>
              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-white/5">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="text-xs text-slate-400">
                    <p>Most of your trades ({data.pnl_distribution.max_bucket_pct}%) fall in the <span className="text-white">{data.pnl_distribution.max_bucket_label}</span></p>
                    <p className="mt-1">Largest win: <span className="text-emerald-400">{fmt(s.best_trade)}</span> | Largest loss: <span className="text-red-400">{fmt(s.worst_trade)}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Win Rate Trend */}
              <div className="glass-panel rounded-xl p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white">Win Rate Trend</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Your win rate percentage over time</p>
                </div>
                <div style={{ height: 200 }}>
                  <AreaChart
                    data={data.win_rate_trend.map(w => w.rate)}
                    labels={data.win_rate_trend.map(w => w.label)}
                    height={200}
                    color="#3b82f6"
                    yPrefix=""
                    showDots
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Current:</span>
                    <span className="text-white font-semibold ml-1">{s.win_rate}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-3 h-3" /><span>Improving</span>
                  </div>
                </div>
              </div>

              {/* Performance by Day */}
              <div className="glass-panel rounded-xl p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white">Performance by Day</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Which days are most profitable?</p>
                </div>
                <div style={{ height: 200 }}>
                  <BarChart
                    data={data.day_performance.map(d => d.avgPnl)}
                    labels={data.day_performance.map(d => d.day)}
                    height={200}
                  />
                </div>
                <div className="mt-4 p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Best day: {data.best_day.day} (+${data.best_day.avgPnl} avg)
                  </p>
                </div>
              </div>
            </div>

            {/* Performance by Hour */}
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-6">
                <h3 className="text-base font-semibold text-white">Performance by Hour</h3>
                <p className="text-xs text-slate-500 mt-0.5">Best trading hours based on your performance</p>
              </div>
              <div style={{ height: 180 }}>
                <BarChart
                  data={data.hour_performance.map(h => h.avgPnl)}
                  labels={data.hour_performance.map(h => h.hour)}
                  height={180}
                />
              </div>
              <div className="mt-4 flex items-center gap-4">
                {[
                  { bg: "bg-red-500", label: "Unprofitable" },
                  { bg: "bg-slate-600", label: "Neutral" },
                  { bg: "bg-emerald-500", label: "Profitable" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${l.bg}`} />
                    <span className="text-[10px] text-slate-400">{l.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="text-xs text-slate-400">
                    <p>Your best trading window: <span className="text-white font-medium">{data.best_window.label}</span></p>
                    <p className="text-[10px] mt-1">{data.best_window.pct}% of profitable trades occur during this period</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Stats */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Quick Stats</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Trades", value: s.total_trades.toString(), color: "text-white" },
                  { label: "Avg Trade", value: fmt(s.avg_trade), color: s.avg_trade >= 0 ? "text-emerald-400" : "text-red-400" },
                  { label: "Best Trade", value: fmt(s.best_trade), color: "text-emerald-400" },
                  { label: "Worst Trade", value: fmt(s.worst_trade), color: "text-red-400" },
                  { label: "Win Streak", value: s.win_streak.toString(), color: "text-white" },
                  { label: "Loss Streak", value: s.loss_streak.toString(), color: "text-white" },
                  { label: "Avg Win", value: fmt(s.avg_win), color: "text-emerald-400" },
                  { label: "Avg Loss", value: `-$${s.avg_loss.toFixed(2)}`, color: "text-red-400" },
                  { label: "Avg Duration", value: s.avg_duration, color: "text-white" },
                  { label: "Trading Days", value: s.trading_days.toString(), color: "text-white" },
                  { label: "Sharpe Ratio", value: s.sharpe_ratio.toString(), color: "text-white" },
                  { label: "Sortino Ratio", value: s.sortino_ratio.toString(), color: "text-white" },
                ].map(stat => (
                  <div key={stat.label} className="p-3 bg-[#020408] rounded-lg border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase">{stat.label}</p>
                    <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Breakdown */}
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Account Breakdown</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Performance per connected account</p>
              </div>
              <div className="space-y-4">
                {data.account_breakdown.map(a => (
                  <div key={a.id} className="p-4 bg-[#020408] rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: a.platform_color, color: a.platform_text_color }}>{a.platform_short}</div>
                        <div>
                          <p className="text-xs font-medium text-white">{a.account_label}</p>
                          <p className="text-[10px] text-slate-500">{a.trade_count} trades</p>
                        </div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${a.is_active ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-slate-500/10 border border-slate-500/20 text-slate-400"}`}>
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500">P&L:</span> <span className={a.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>{fmt(a.pnl)}</span></div>
                      <div><span className="text-slate-500">Return:</span> <span className="text-white ml-1">{a.return_pct >= 0 ? "+" : ""}{a.return_pct}%</span></div>
                      <div><span className="text-slate-500">Win Rate:</span> <span className="text-white ml-1">{a.win_rate}%</span></div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-500">Contribution</span>
                        <span className="text-slate-400">{a.contribution}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${a.contribution}%`, backgroundColor: a.platform === "Binance" ? "#eab308" : "#3b82f6" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {data.best_account && (
                <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-[10px] text-purple-400 flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Best Performing: {data.best_account.label} (+{data.best_account.return_pct}% return)
                  </p>
                </div>
              )}
            </div>

            {/* Algorithm Performance */}
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Algorithm Performance</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">How each algorithm is performing</p>
              </div>
              <div className="space-y-3">
                {data.algo_performance.map(algo => (
                  <div key={algo.name} className="p-3 bg-[#020408] rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${algo.color}1A`, borderColor: `${algo.color}33`, color: algo.color, border: `1px solid ${algo.color}33` }}>{algo.category}</span>
                        <span className="text-xs font-medium text-white">{algo.name}</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div><span className="text-slate-500">P&L</span><p className={algo.pnl >= 0 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>{fmt(algo.pnl)}</p></div>
                      <div><span className="text-slate-500">Trades</span><p className="text-white">{algo.trades}</p></div>
                      <div><span className="text-slate-500">Win Rate</span><p className="text-white">{algo.win_rate}%</p></div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-4 flex items-center gap-1">
                <Info className="w-3 h-3" /> Algorithms managed by account manager
              </p>
            </div>

            {/* Asset Class Breakdown */}
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Asset Class Breakdown</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Performance across markets</p>
              </div>
              <div className="flex items-center justify-center" style={{ height: 160 }}>
                <DonutChart segments={data.asset_breakdown.map(a => ({ value: Math.abs(a.pnl), color: ASSET_COLORS[a.category] || "#64748b" }))} />
              </div>
              <div className="mt-4 space-y-2">
                {data.asset_breakdown.map(a => (
                  <div key={a.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[a.category] || "#64748b" }} />
                      <span className="text-slate-300">{a.category}</span>
                    </div>
                    <div className="text-right">
                      <span className={a.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>{fmt(a.pnl)}</span>
                      <span className="text-slate-500 ml-2">{a.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Symbols */}
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Top Symbols</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Your best trading pairs</p>
              </div>
              <div className="space-y-3">
                {data.top_symbols.map((sym, i) => (
                  <div key={sym.symbol} className={`flex items-center justify-between py-2 ${i < data.top_symbols.length - 1 ? "border-b border-white/5" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 w-4">{i + 1}</span>
                      <div>
                        <p className="text-xs font-medium text-white">{sym.symbol}</p>
                        <p className="text-[10px] text-slate-500">{sym.trades} trades &bull; {sym.win_rate}% win</p>
                      </div>
                    </div>
                    <span className={`text-xs ${sym.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(sym.pnl)}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View All Symbols <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Risk Analysis */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Risk Analysis</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-[#020408] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 uppercase">Max Drawdown</span>
                    <span className="text-sm font-semibold text-red-400">-{data.risk.max_drawdown}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{data.risk.max_drawdown_date}</p>
                </div>
                <div className="p-3 bg-[#020408] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 uppercase">Current Drawdown</span>
                    <span className={`text-sm font-semibold ${data.risk.current_drawdown === 0 ? "text-emerald-400" : "text-red-400"}`}>{data.risk.current_drawdown}%</span>
                  </div>
                  {data.risk.current_drawdown === 0 && (
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> At Peak
                    </p>
                  )}
                </div>
                <div className="p-3 bg-[#020408] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 uppercase">Risk/Reward Ratio</span>
                    <span className="text-sm font-semibold text-white">{data.risk.risk_reward}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">For every $1 risked, you gain ${data.risk.risk_reward.split(":")[1] || "2.1"}</p>
                </div>
                <div className="p-3 bg-[#020408] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500 uppercase">Value at Risk (95%)</span>
                    <span className="text-sm font-semibold text-white">${data.risk.var_95.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">95% confidence max daily loss</p>
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg border flex items-center gap-2 ${s.max_drawdown < 10 ? "bg-emerald-500/10 border-emerald-500/20" : s.max_drawdown < 20 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                <ShieldCheck className={`w-4 h-4 ${s.max_drawdown < 10 ? "text-emerald-400" : s.max_drawdown < 20 ? "text-yellow-400" : "text-red-400"}`} />
                <span className={`text-xs font-medium ${s.max_drawdown < 10 ? "text-emerald-400" : s.max_drawdown < 20 ? "text-yellow-400" : "text-red-400"}`}>{riskLabel}</span>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Performance Insights</h3>
              </div>
              <div className="space-y-3">
                {[
                  { emoji: "\uD83C\uDFAF", text: `Profit factor of ${s.profit_factor} - ${profitFactorLabel}`, sub: s.profit_factor >= 2 ? "Top performer" : "Improving" },
                  { emoji: "\uD83D\uDCC8", text: `Win rate: ${s.win_rate}%`, sub: s.win_rate >= 65 ? "Above average" : "Room to improve" },
                  { emoji: "\u23F0", text: `Best hours: ${data.best_window.label}`, sub: "Consider focusing here" },
                  { emoji: "\uD83C\uDFB2", text: data.asset_breakdown.length > 1
                    ? `${data.asset_breakdown[0].category}: ${data.asset_breakdown.find(a => a.category === data.asset_breakdown[0].category)?.pct || 0}% vs ${data.asset_breakdown[1]?.category}: ${data.asset_breakdown[1]?.pct || 0}%`
                    : `Primary: ${data.asset_breakdown[0]?.category || "N/A"}`,
                    sub: "Consider adjusting allocation" },
                ].map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#020408] rounded-lg border border-white/5">
                    <span className="text-base">{insight.emoji}</span>
                    <div>
                      <p className="text-xs text-white">{insight.text}</p>
                      <span className="text-[10px] text-slate-400">{insight.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Bottom Section */}
        <div className="mt-6 space-y-6">
          {/* Calendar */}
          <PerformanceCalendar data={data.calendar} />

          {/* Performance Comparison Table */}
          <div className="glass-panel rounded-xl p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-white">Performance Comparison</h3>
              <p className="text-xs text-slate-500 mt-0.5">How you stack up against benchmarks</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                    <th className="py-3 px-4 font-medium">Metric</th>
                    <th className="py-3 px-4 font-medium text-center">You</th>
                    <th className="py-3 px-4 font-medium text-center">Agency Average</th>
                    <th className="py-3 px-4 font-medium text-center">Top 10%</th>
                    <th className="py-3 px-4 font-medium text-center">S&P 500</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { metric: "Total Return", you: `+${s.total_return}%`, avg: "+12.3%", top: "+35.0%", sp: "+8.2%" },
                    { metric: "Win Rate", you: `${s.win_rate}%`, avg: "58%", top: "75%", sp: "\u2014" },
                    { metric: "Max Drawdown", you: `-${s.max_drawdown}%`, avg: "-12.0%", top: "-5.2%", sp: "-15.3%" },
                    { metric: "Profit Factor", you: `${s.profit_factor}`, avg: "1.6", top: "2.8", sp: "\u2014" },
                    { metric: "Sharpe Ratio", you: `${s.sharpe_ratio}`, avg: "1.2", top: "2.3", sp: "0.9" },
                  ].map(row => (
                    <tr key={row.metric}>
                      <td className="py-4 px-4 text-xs text-slate-300">{row.metric}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-semibold text-emerald-400">{row.you}</span>
                        <span className="ml-1 text-[10px] text-emerald-400">&uarr;</span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-slate-400">{row.avg}</td>
                      <td className="py-4 px-4 text-center text-sm text-slate-400">{row.top}</td>
                      <td className="py-4 px-4 text-center text-sm text-slate-400">{row.sp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">You&apos;re in the <span className="font-semibold">top 25%</span> of traders using this platform</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} {agencyName || "Your Agency"}. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </>
  );
}
