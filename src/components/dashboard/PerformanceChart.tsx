"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Chart: any;
  }
}

const chartData: Record<string, { labels: string[]; revenue: number[]; profit: number[]; fee: number[] }> = {
  "1M": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    revenue: [124.5, 132.8, 138.4, 142.9],
    profit: [85.2, 91.4, 95.8, 98.4],
    fee: [17.1, 18.2, 19.1, 19.7],
  },
  "3M": {
    labels: ["Oct", "Nov", "Dec", "Jan"],
    revenue: [115.2, 128.4, 136.9, 142.9],
    profit: [78.5, 88.2, 94.1, 98.4],
    fee: [15.7, 17.6, 18.8, 19.7],
  },
  "6M": {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    revenue: [98.4, 105.2, 115.2, 128.4, 136.9, 142.9],
    profit: [65.2, 72.4, 78.5, 88.2, 94.1, 98.4],
    fee: [13.1, 14.4, 15.7, 17.6, 18.8, 19.7],
  },
  YTD: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    revenue: [65, 72, 78, 82, 88, 92, 95, 98, 105, 115, 128, 142],
    profit: [42, 48, 52, 55, 58, 61, 63, 65, 72, 78, 88, 98],
    fee: [8.4, 9.6, 10.4, 11, 11.6, 12.2, 12.6, 13, 14.4, 15.6, 17.6, 19.7],
  },
};

const timeframes = ["1M", "3M", "6M", "YTD"] as const;

export default function PerformanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<string>("3M");

  useEffect(() => {
    const initChart = () => {
      if (!canvasRef.current || typeof window === "undefined") return;
      const Chart = window.Chart;
      if (!Chart) return;

      // Destroy previous
      if (chartInstanceRef.current) {
        (chartInstanceRef.current as { destroy: () => void }).destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const blueGradient = ctx.createLinearGradient(0, 0, 0, 300);
      blueGradient.addColorStop(0, "rgba(59, 130, 246, 0.15)");
      blueGradient.addColorStop(1, "rgba(59, 130, 246, 0)");

      const emeraldGradient = ctx.createLinearGradient(0, 0, 0, 300);
      emeraldGradient.addColorStop(0, "rgba(16, 185, 129, 0.15)");
      emeraldGradient.addColorStop(1, "rgba(16, 185, 129, 0)");

      const purpleGradient = ctx.createLinearGradient(0, 0, 0, 300);
      purpleGradient.addColorStop(0, "rgba(168, 85, 247, 0.15)");
      purpleGradient.addColorStop(1, "rgba(168, 85, 247, 0)");

      const data = chartData[activeTimeframe];

      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Revenue",
              data: data.revenue,
              borderColor: "#3b82f6",
              backgroundColor: blueGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "#3b82f6",
              pointHoverBorderColor: "#13161C",
              pointHoverBorderWidth: 2,
            },
            {
              label: "Profit",
              data: data.profit,
              borderColor: "#10b981",
              backgroundColor: emeraldGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "#10b981",
              pointHoverBorderColor: "#13161C",
              pointHoverBorderWidth: 2,
            },
            {
              label: "Performance Fee",
              data: data.fee,
              borderColor: "#a855f7",
              backgroundColor: purpleGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "#a855f7",
              pointHoverBorderColor: "#13161C",
              pointHoverBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(11, 14, 20, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderWidth: 1,
              titleColor: "#94a3b8",
              titleFont: { size: 11, weight: 500 },
              bodyColor: "#fff",
              bodyFont: { size: 12, weight: 600 },
              padding: 12,
              cornerRadius: 8,
              displayColors: true,
              boxWidth: 8,
              boxHeight: 8,
              boxPadding: 4,
              usePointStyle: true,
              callbacks: {
                label: function (context: { dataset: { label: string }; parsed: { y: number } }) {
                  return " " + context.dataset.label + ": $" + context.parsed.y.toFixed(1) + "k";
                },
              },
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(255, 255, 255, 0.03)" },
              ticks: { color: "#64748b", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(255, 255, 255, 0.03)" },
              ticks: {
                color: "#64748b",
                font: { size: 11 },
                callback: function (value: string | number) {
                  return "$" + value + "k";
                },
              },
            },
          },
        },
      });
    };

    // Poll for Chart.js global
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.Chart) {
        clearInterval(interval);
        initChart();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (chartInstanceRef.current) {
        (chartInstanceRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [activeTimeframe]);

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
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTimeframe === tf
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative min-h-[240px] w-full">
        <canvas ref={canvasRef} className="w-full h-full block"></canvas>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4 border-white/5 border-t mt-2 pt-4">
        <div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
            Monthly Revenue
          </div>
          <div className="text-sm font-semibold text-white">$142,890.00</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
            Monthly Profit
          </div>
          <div className="text-sm font-semibold text-white">$98,450.00</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1">
            Performance Fee
          </div>
          <div className="text-sm font-semibold text-white">$19,690.00</div>
        </div>
      </div>
    </div>
  );
}
