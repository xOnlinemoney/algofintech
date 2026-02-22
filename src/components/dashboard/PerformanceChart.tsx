"use client";

import { BarChart3 } from "lucide-react";

export default function PerformanceChart() {
  return (
    <div className="lg:col-span-8 flex flex-col overflow-hidden bg-[#13161C] border-white/5 border rounded-xl p-5 relative">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Agency Performance
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-xs text-slate-400 font-medium">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-slate-400 font-medium">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="text-xs text-slate-400 font-medium">Performance Fee</span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
          {["1M", "3M", "6M", "YTD"].map((tf) => (
            <button
              key={tf}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                tf === "3M"
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[240px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4">
          <BarChart3 className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-400 mb-1">No performance data yet</p>
        <p className="text-xs text-slate-600 max-w-xs">
          Performance metrics will appear here once your clients start trading with connected algorithms.
        </p>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4 border-white/5 border-t mt-2 pt-4">
        <div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
            Monthly Revenue
          </div>
          <div className="text-sm font-semibold text-white">$0.00</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
            Monthly Profit
          </div>
          <div className="text-sm font-semibold text-white">$0.00</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
            Performance Fee
          </div>
          <div className="text-sm font-semibold text-white">$0.00</div>
        </div>
      </div>
    </div>
  );
}
