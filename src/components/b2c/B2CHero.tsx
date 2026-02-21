"use client";

import { ArrowRight } from "lucide-react";
import B2CDashboardPreview from "./B2CDashboardPreview";

export default function B2CHero() {
  return (
    <section className="overflow-hidden md:pb-32 md:pt-25 pt-32 pb-24 relative">
      <div className="absolute inset-0 grid-bg -z-10"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 opacity-50"></div>

      <div className="flex flex-col z-10 text-center max-w-7xl mr-auto ml-auto pr-6 pl-6 relative items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Now supporting Crypto, Forex, Futures &amp; Stocks
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 max-w-5xl leading-[1.1]">
          Automate your <br />
          <span className="bg-clip-text text-glow text-transparent bg-gradient-to-b from-white to-white/60">
            Trading Portfolio
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Connect your brokerage account and let our institutional-grade
          algorithms trade for you. Crypto, Stocks, Forex, and Futures —
          all on autopilot from a single dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]">
            <span className="flex items-center gap-2">
              Book a Call
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button className="glass-card hover:bg-white/5 transition-all font-medium text-white rounded-full pt-4 pr-8 pb-4 pl-8">
            See How It Works
          </button>
        </div>

        <B2CDashboardPreview />
      </div>
    </section>
  );
}
