"use client";

import { useState, useMemo } from "react";
import { Search, Plus, LayoutGrid } from "lucide-react";
import { mockAlgorithms, getCategoryColor } from "@/lib/mock-data";
import type { AlgorithmCategory } from "@/lib/types";

const FILTER_TABS: ("All" | AlgorithmCategory)[] = [
  "All",
  "Forex",
  "Crypto",
  "Stocks",
  "Futures",
];

export default function AlgorithmsGrid() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | AlgorithmCategory>("All");

  const filtered = useMemo(() => {
    let list = mockAlgorithms;
    if (activeFilter !== "All") {
      list = list.filter((a) => a.category === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeFilter]);

  return (
    <div className="flex flex-col max-w-[1600px] mx-auto gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Algorithms Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and deploy algorithmic trading strategies for your clients.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 bg-[#13161C] border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-slate-600 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="bg-[#13161C] border border-white/5 rounded-lg p-1 flex items-center overflow-x-auto max-w-full custom-scrollbar">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={
                  activeFilter === tab
                    ? "px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium shadow-sm transition-all whitespace-nowrap"
                    : "px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 text-xs font-medium transition-all whitespace-nowrap"
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
        {filtered.map((algo) => (
          <AlgorithmCard key={algo.id} algo={algo} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No algorithms found.</p>
            <p className="text-xs text-slate-600 mt-1">
              Try adjusting your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Individual Algorithm Card ───────────────────────────
function AlgorithmCard({
  algo,
}: {
  algo: (typeof mockAlgorithms)[number];
}) {
  const badge = getCategoryColor(algo.category);

  return (
    <div className="bg-[#13161C] border border-white/5 rounded-xl overflow-hidden group hover:border-white/10 transition-all flex flex-col shadow-sm">
      {/* Image */}
      <div className="h-32 w-full relative overflow-hidden bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={algo.image_url}
          alt={algo.name}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13161C] to-transparent opacity-60"></div>

        {/* Add button */}
        <div className="absolute top-2 right-2">
          <button className="h-7 w-7 rounded-md bg-black/40 hover:bg-blue-600 text-white backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text} border ${badge.border} backdrop-blur-md uppercase tracking-wide`}
          >
            {algo.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">{algo.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {algo.description}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 py-2 border-y border-white/5 mt-auto">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              ROI
            </div>
            <div className="text-xs font-medium text-emerald-400">{algo.roi}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Drawdown
            </div>
            <div className="text-xs font-medium text-slate-300">
              {algo.drawdown}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Win Rate
            </div>
            <div className="text-xs font-medium text-slate-300">
              {algo.win_rate}
            </div>
          </div>
        </div>

        {/* CTA button */}
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-lg text-xs font-medium text-white transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-lg group-hover:shadow-blue-900/20">
          See Performance
        </button>
      </div>
    </div>
  );
}
