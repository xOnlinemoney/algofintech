"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Download } from "lucide-react";
import { getCategoryColor } from "@/lib/mock-data";
import type { Algorithm, AlgorithmDetail as AlgorithmDetailType } from "@/lib/types";

// Chart.js loaded via CDN — we reference window.Chart
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Chart: any;
  }
}

export default function AlgorithmDetailView({
  algorithm,
  detail,
}: {
  algorithm: Algorithm;
  detail: AlgorithmDetailType;
}) {
  const badge = getCategoryColor(algorithm.category);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // ── Chart.js equity curve ──
  useEffect(() => {
    const init = () => {
      const ctx = chartRef.current;
      if (!ctx || typeof window === "undefined" || !window.Chart) return;

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const context = ctx.getContext("2d");
      if (!context) return;

      const gradient = context.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

      chartInstance.current = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: detail.equity_chart.labels,
          datasets: [
            {
              label: "Equity Growth",
              data: detail.equity_chart.data,
              borderColor: "#34d399",
              backgroundColor: gradient,
              borderWidth: 2,
              pointBackgroundColor: "#10b981",
              pointBorderColor: "#000",
              pointBorderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: "index" as const,
              intersect: false,
              backgroundColor: "#1e293b",
              titleColor: "#94a3b8",
              bodyColor: "#fff",
              borderColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: function (context: any) {
                  return "$" + context.parsed.y.toLocaleString();
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#64748b", font: { size: 10 } },
            },
            y: {
              grid: { color: "rgba(255, 255, 255, 0.05)" },
              ticks: {
                color: "#64748b",
                font: { size: 10 },
                callback: function (value: any) {
                  return "$" + Number(value) / 1000 + "k";
                },
              },
            },
          },
          interaction: { mode: "nearest" as const, axis: "x" as const, intersect: false },
        },
      });
    };

    // Chart.js loads via CDN — may not be ready immediately
    if (window.Chart) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.Chart) {
          clearInterval(interval);
          init();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [detail.equity_chart]);

  const m = detail.metrics;

  return (
    <div className="flex flex-col max-w-[1600px] mx-auto gap-6">
      {/* Navigation Back */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/algorithms"
          className="flex hover:text-slate-300 transition-colors group text-sm text-slate-500 gap-2 items-center"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Marketplace
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              {algorithm.name}.
            </h1>
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-semibold ${badge.bg} ${badge.text} border ${badge.border} uppercase tracking-wider`}
            >
              {algorithm.category}
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            {algorithm.description}
          </p>
        </div>
        <button className="flex gap-2 hover:bg-blue-500 transition-all shadow-blue-900/20 active:scale-[0.98] text-sm font-medium text-white bg-blue-600 rounded-lg py-2.5 px-5 shadow-lg items-center">
          <Plus className="w-4 h-4" />
          Add to My Algorithms
        </button>
      </div>

      {/* Performance Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Total Return" value={m.total_return} highlight />
        <MetricCard label="Win Rate" value={m.win_rate} />
        <MetricCard label="Profit Factor" value={m.profit_factor} />
        <MetricCard label="Max Drawdown" value={m.max_drawdown} />
        <MetricCard label="Sharpe Ratio" value={m.sharpe_ratio} />
        <MetricCard label="Avg Duration" value={m.avg_duration} />
      </div>

      {/* Main Chart Section */}
      <div className="bg-[#13161C] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Equity Growth</h3>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Trading
            </span>
          </div>
        </div>
        <div className="relative w-full h-80">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Detailed Stats & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Returns + Trades */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-[#13161C] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white">Monthly Returns</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  <th className="py-2 font-medium">Year</th>
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mo) => (
                    <th key={mo} className="py-2 font-medium text-center">{mo}</th>
                  ))}
                  <th className="py-2 font-medium text-right">YTD</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {detail.monthly_returns.map((row) => (
                  <tr key={row.year} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-medium text-slate-400">{row.year}</td>
                    {row.months.map((val, i) => (
                      <td key={i} className="py-3 text-center">
                        {val ? (
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              val.startsWith("-")
                                ? "text-rose-400 bg-rose-500/10"
                                : "text-emerald-400 bg-emerald-500/10"
                            }`}
                          >
                            {val}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 text-right font-semibold text-emerald-400">{row.ytd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="h-px bg-white/5 w-full my-2"></div>

          {/* Trades Taken */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Trades Taken</h3>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 transition-colors text-xs text-slate-400 hover:text-white">
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  <th className="py-2 font-medium pl-2">Instrument</th>
                  <th className="py-2 font-medium">Type</th>
                  <th className="py-2 font-medium">Entry</th>
                  <th className="py-2 font-medium">Exit</th>
                  <th className="py-2 font-medium text-right">Size</th>
                  <th className="py-2 font-medium text-right">Max DD</th>
                  <th className="py-2 font-medium text-right text-emerald-500">P/L</th>
                  <th className="py-2 font-medium text-right pr-2">Return</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {detail.trades.map((trade, i) => (
                  <tr key={i} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded ${trade.icon_bg} flex items-center justify-center text-[10px] font-bold ${trade.icon_text_color}`}>
                          {trade.instrument_symbol}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{trade.instrument}</span>
                          <span className="text-[10px] text-slate-500">{trade.instrument_type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                          trade.trade_type === "LONG"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {trade.trade_type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{trade.entry}</td>
                    <td className="py-3 text-slate-400">{trade.exit}</td>
                    <td className="py-3 text-right font-medium text-slate-400">{trade.size}</td>
                    <td className="py-3 text-right text-rose-400">{trade.max_dd}</td>
                    <td className={`py-3 text-right font-medium ${trade.pnl_positive ? "text-emerald-400" : "text-rose-400"}`}>
                      {trade.pnl}
                    </td>
                    <td className={`py-3 text-right pr-2 font-medium ${trade.return_positive ? "text-emerald-400" : "text-rose-400"}`}>
                      {trade.return_pct}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Strategy Info & Release Notes */}
        <div className="flex flex-col gap-6">
          {/* Information Card */}
          <div className="bg-[#13161C] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Strategy Information</h3>
            <div className="flex flex-col gap-3">
              <InfoRow label="Timeframe" value={detail.info.timeframe} />
              <div className="h-px bg-white/5 w-full"></div>
              <InfoRow label="Min. Account" value={detail.info.min_account} />
              <div className="h-px bg-white/5 w-full"></div>
              <InfoRow label="Instruments" value={detail.info.instruments} />
              <div className="h-px bg-white/5 w-full"></div>
              <InfoRow label="Trades / Month" value={detail.info.trades_per_month} />
            </div>
          </div>

          {/* Release Notes */}
          <div className="bg-[#13161C] border border-white/5 rounded-xl p-6 flex flex-col gap-4 flex-1">
            <h3 className="text-sm font-semibold text-white">Release Notes</h3>
            <div className="flex flex-col gap-4">
              {detail.release_notes.map((note, i) => {
                const isLast = i === detail.release_notes.length - 1;
                return (
                  <div key={note.version} className="flex gap-3 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${note.is_latest ? "bg-blue-500" : "bg-slate-600"}`}></div>
                      {!isLast && <div className="w-px h-full bg-white/10 my-1"></div>}
                    </div>
                    <div className={isLast ? "" : "pb-1"}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">{note.version}</span>
                        <span className="text-[10px] text-slate-500">{note.date}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{note.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-white/5 pt-6 mt-2">
        <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
          Trading foreign exchange on margin carries a high level of risk, and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose. CFTC RULE 4.41 - HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE CERTAIN LIMITATIONS. UNLIKE AN ACTUAL PERFORMANCE RECORD, SIMULATED RESULTS DO NOT REPRESENT ACTUAL TRADING. ALSO, SINCE THE TRADES HAVE NOT BEEN EXECUTED, THE RESULTS MAY HAVE UNDER-OR-OVER COMPENSATED FOR THE IMPACT, IF ANY, OF CERTAIN MARKET FACTORS, SUCH AS LACK OF LIQUIDITY.
        </p>
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────
function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#13161C] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-2xl font-semibold tracking-tight ${highlight ? "text-emerald-400" : "text-slate-200"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
