"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Menu, RefreshCw, X } from "lucide-react";

export default function ClientHeader() {
  const [tradingActive, setTradingActive] = useState(true);
  const [updatedAgo, setUpdatedAgo] = useState("just now");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const times = ["just now", "1s ago", "5s ago", "just now"];
      setUpdatedAgo(times[Math.floor(Math.random() * times.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function handleToggle() {
    if (tradingActive) {
      if (
        window.confirm(
          "Are you sure you want to pause all trading activity? This will prevent new trades from opening."
        )
      ) {
        setTradingActive(false);
      }
    } else {
      setTradingActive(true);
    }
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md sticky top-0 z-10">
      {/* Left */}
      <div className="flex flex-col justify-center">
        <h1 className="text-white font-semibold text-lg tracking-tight flex items-center gap-2">
          Dashboard
          <button
            className="md:hidden ml-2 text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Welcome back, Alex</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1">
            Updated {updatedAgo} <RefreshCw className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Trading Toggle */}
        <div className="hidden sm:flex items-center gap-3 pl-4 pr-1 py-1 rounded-full bg-[#0B0E14] border border-white/5">
          <span
            className={`text-xs font-medium ${
              tradingActive ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {tradingActive ? "Trading Active" : "Trading Paused"}
          </span>
          <button
            onClick={handleToggle}
            className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${
              tradingActive ? "bg-emerald-500" : "bg-slate-700"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                tradingActive ? "left-5" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-blue-500 rounded-full border border-[#020408]" />
          </button>

          <button className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-white/5 rounded-full transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold border border-white/10 shadow-inner">
              AL
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
