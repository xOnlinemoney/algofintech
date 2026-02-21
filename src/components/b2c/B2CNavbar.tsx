"use client";

import { Infinity as InfinityIcon } from "lucide-react";
import Link from "next/link";

export default function B2CNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020408]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/individual" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <InfinityIcon className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            AlgoFinTech
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#algos" className="hover:text-white transition-colors">
            Algorithms
          </a>
          <a href="#brokers" className="hover:text-white transition-colors">
            Supported Brokers
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        <button className="bg-white text-black hover:bg-slate-200 px-4 py-2 rounded-full text-sm font-semibold transition-all">
          Book a Call
        </button>
      </div>
    </nav>
  );
}
