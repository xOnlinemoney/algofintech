import {
  Bitcoin,
  CandlestickChart,
  Banknote,
  TrendingUp,
} from "lucide-react";

export default function AlgorithmsSection() {
  return (
    <section id="algos" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Institutional-Grade{" "}
            <span className="text-blue-500">Algorithms</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Don&apos;t just launch a firm. Launch a profitable one. Our
            whitelabel solution includes access to four proprietary trading
            engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
          {/* Crypto Card */}
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                  <Bitcoin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Crypto Algo
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  High-frequency volatility scalping on BTC, ETH, and SOL.
                  Auto-hedging capabilities across exchanges.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                24/7 Active
              </div>
            </div>
          </div>

          {/* Futures Card (Large) */}
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 md:col-span-2 bg-[#080a10]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent"></div>
            <div className="relative z-10 grid md:grid-cols-2 gap-8 h-full items-center">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                    <CandlestickChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    Futures &amp; Indices
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Trend-following systems for NQ, ES, and Gold. Designed for
                    prop firms to manage drawdown effectively while capturing big
                    moves.
                  </p>
                </div>
                <div className="flex gap-4">
                  {["NQ100", "ES500", "XAUUSD"].map((t) => (
                    <div
                      key={t}
                      className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative Graph */}
              <div className="h-full w-full bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col justify-end relative overflow-hidden">
                <svg
                  className="absolute bottom-0 left-0 w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="blueGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,100 C50,80 100,120 150,60 S250,40 350,10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,100 C50,80 100,120 150,60 S250,40 350,10 V150 H0 Z"
                    fill="url(#blueGrad)"
                    opacity="0.2"
                  />
                </svg>
                <div className="relative z-10 flex justify-between text-xs text-slate-500">
                  <span>09:00</span>
                  <span>16:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forex Card */}
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                  <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Forex Algo
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Mean reversion strategies for major currency pairs. Low
                  drawdown focus ideal for funded trader programs.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Multi-Currency
              </div>
            </div>
          </div>

          {/* Stock Card (Full Width) */}
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 md:col-span-4 lg:col-span-4 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-purple-900/10 to-transparent">
            <div className="w-full md:w-1/2">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">
                Stock Equities Engine
              </h3>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                Deep learning models analyzing volume profiles and order flow on
                US Blue Chip stocks. Provide your clients with
                institutional-level stock trading automation that adapts to
                earnings reports and market sentiment.
              </p>
              <div className="flex gap-4">
                <button className="text-sm font-medium text-white border-b border-purple-500 pb-0.5 hover:text-purple-400 transition-colors">
                  View Backtests
                </button>
                <button className="text-sm font-medium text-white border-b border-white/20 pb-0.5 hover:text-purple-400 transition-colors">
                  See Live Results
                </button>
              </div>
            </div>
            {/* Stock Viz */}
            <div className="w-full md:w-1/2 h-48 bg-[#050505] rounded-xl border border-white/10 p-4 grid grid-cols-4 gap-2">
              {[
                { sym: "TSLA", val: "+2.4%", up: true },
                { sym: "NVDA", val: "+5.1%", up: true },
                { sym: "AAPL", val: "-0.4%", up: false },
                { sym: "AMD", val: "+1.8%", up: true },
              ].map((s) => (
                <div
                  key={s.sym}
                  className="bg-white/5 rounded flex flex-col justify-center items-center p-2"
                >
                  <span className="text-xs text-slate-500">{s.sym}</span>
                  <span
                    className={`font-bold ${
                      s.up ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {s.val}
                  </span>
                </div>
              ))}
              <div className="col-span-4 bg-white/5 rounded h-full mt-2 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-around">
                  <div className="w-px h-full bg-white/5"></div>
                  <div className="w-px h-full bg-white/5"></div>
                  <div className="w-px h-full bg-white/5"></div>
                </div>
                <div className="absolute left-0 bottom-4 w-full h-px bg-white/10"></div>
                <div className="absolute left-[20%] top-[40%] w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                <div className="absolute left-[50%] top-[30%] w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                <div className="absolute left-[80%] top-[20%] w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
