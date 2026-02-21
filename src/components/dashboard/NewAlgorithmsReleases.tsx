"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Clock,
  ChevronDown,
  Bookmark,
  Bell,
  Mail,
  Check,
  Zap,
  BarChart2,
  Cpu,
  Target,
  Activity,
  Layers,
  TrendingUp,
  Moon,
  RefreshCw,
  Briefcase,
  Shield,
  Gem,
  Trash2,
} from "lucide-react";
import {
  getEnrichedReleases,
  mockComingSoonAlgorithms,
  getCategoryColor,
} from "@/lib/mock-data";
import { useSavedAlgorithms } from "@/context/SavedAlgorithmsContext";
import type { AlgorithmCategory, Algorithm } from "@/lib/types";

// ─── Icon resolver ───────────────────────────────────────
function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const props = { className: className || "w-3 h-3" };
  switch (name) {
    case "zap": return <Zap {...props} />;
    case "bar-chart-2": return <BarChart2 {...props} />;
    case "clock": return <Clock {...props} />;
    case "cpu": return <Cpu {...props} />;
    case "target": return <Target {...props} />;
    case "activity": return <Activity {...props} />;
    case "layers": return <Layers {...props} />;
    case "trending-up": return <TrendingUp {...props} />;
    case "moon": return <Moon {...props} />;
    case "refresh-cw": return <RefreshCw {...props} />;
    case "briefcase": return <Briefcase {...props} />;
    case "shield": return <Shield {...props} />;
    case "gem": return <Gem {...props} />;
    default: return <Zap {...props} />;
  }
}

const TIMEFRAME_TABS = ["All New Releases", "Last 30 Days", "Last 90 Days", "This Year"] as const;
type TimeframeTab = (typeof TIMEFRAME_TABS)[number];

const ASSET_TABS: ("All" | AlgorithmCategory)[] = ["All", "Forex", "Crypto", "Stocks", "Futures"];

export default function NewAlgorithmsReleases() {
  const [timeframe, setTimeframe] = useState<TimeframeTab>("All New Releases");
  const [assetFilter, setAssetFilter] = useState<"All" | AlgorithmCategory>("All");
  const { isSaved, addAlgorithm, removeAlgorithm } = useSavedAlgorithms();

  const allReleases = useMemo(() => getEnrichedReleases(), []);

  const filtered = useMemo(() => {
    return allReleases.filter((r) => {
      if (assetFilter !== "All" && r.algorithm.category !== assetFilter) return false;
      // Timeframe filtering would use real dates in production
      return true;
    });
  }, [allReleases, assetFilter]);

  const featured = filtered.find((r) => r.is_featured);
  const grid = filtered.filter((r) => !r.is_featured);

  return (
    <div className="flex flex-col max-w-[1200px] mx-auto w-full gap-10">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-white tracking-tight">
              New Algorithms Releases
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wide">
              Live Updates
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Discover our latest algorithm releases and expand your client
            offerings with cutting-edge trading systems.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-medium text-slate-500 mr-2 uppercase tracking-wider">
              Timeframe:
            </span>
            {TIMEFRAME_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeframe(tab)}
                className={
                  timeframe === tab
                    ? "px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/10 whitespace-nowrap"
                    : "px-3 py-1.5 rounded-full bg-[#13161C] text-slate-400 text-xs font-medium border border-white/5 whitespace-nowrap hover:text-white hover:border-white/10 transition-colors"
                }
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-medium text-slate-500 mr-2 uppercase tracking-wider">
              Asset:
            </span>
            {ASSET_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setAssetFilter(tab)}
                className={
                  assetFilter === tab
                    ? "px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/10 whitespace-nowrap"
                    : "px-3 py-1.5 rounded-full bg-[#13161C] text-slate-400 text-xs font-medium border border-white/5 whitespace-nowrap hover:text-white hover:border-white/10 transition-colors"
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Hero */}
      {featured && (
        <FeaturedHero
          algo={featured.algorithm}
          release={featured}
          isSaved={isSaved(featured.algorithm.id)}
          onToggle={() =>
            isSaved(featured.algorithm.id)
              ? removeAlgorithm(featured.algorithm.id)
              : addAlgorithm(featured.algorithm.id)
          }
        />
      )}

      {/* Strategy Grid */}
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-semibold text-white">Recent Releases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grid.map((r) => (
            <ReleaseCard
              key={r.algorithm.id}
              algo={r.algorithm}
              release={r}
              isSaved={isSaved(r.algorithm.id)}
              onToggle={() =>
                isSaved(r.algorithm.id)
                  ? removeAlgorithm(r.algorithm.id)
                  : addAlgorithm(r.algorithm.id)
              }
            />
          ))}
        </div>

        <button className="hover:bg-white/10 hover:text-white transition-all flex gap-2 text-xs font-medium text-slate-300 bg-white/5 border-white/5 border rounded-full mt-4 mx-auto py-3 px-6 items-center">
          Show More Algorithms
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col gap-6 pt-10 border-t border-white/5">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          In The Pipeline
          <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded bg-white/5 border border-white/5">
            Coming Q1 2025
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockComingSoonAlgorithms.map((cs) => (
            <ComingSoonCard key={cs.id} item={cs} />
          ))}
        </div>
      </div>

      {/* Subscribe Banner */}
      <SubscribeBanner />
    </div>
  );
}

// ─── Featured Hero Card ──────────────────────────────────
function FeaturedHero({
  algo,
  release,
  isSaved,
  onToggle,
}: {
  algo: Algorithm;
  release: ReturnType<typeof getEnrichedReleases>[number];
  isSaved: boolean;
  onToggle: () => void;
}) {
  const badge = getCategoryColor(algo.category);
  return (
    <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-[#13161C]">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-[#0B0E14]/80 to-[#0B0E14] z-10"></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={algo.image_url}
        alt={algo.name}
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
      />

      <div className="relative z-20 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse">
              Just Released
            </span>
            <span className="text-blue-300 text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Released {release.days_ago_label}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {algo.name}
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
            {algo.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {release.features.slice(0, 2).map((f) => (
              <span
                key={f.label}
                className="px-2.5 py-1 rounded bg-white/10 border border-white/10 text-xs text-slate-300"
              >
                {f.label}
              </span>
            ))}
            <span
              className={`px-2.5 py-1 rounded ${badge.bg} ${badge.border} border text-xs ${badge.text} font-medium`}
            >
              {algo.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full md:w-auto">
          <div className="flex items-center gap-6 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Exp. Return
              </span>
              <span className="text-xl font-bold text-green-400">
                {algo.roi}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Win Rate
              </span>
              <span className="text-xl font-bold text-blue-400">
                {algo.win_rate}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Max DD
              </span>
              <span className="text-xl font-bold text-slate-200">
                {algo.drawdown}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onToggle}
              className={
                isSaved
                  ? "flex-1 hover:bg-red-500 transition-colors flex gap-2 text-sm font-semibold text-white bg-red-600 rounded-lg py-2.5 px-5 shadow-lg shadow-red-900/20 items-center justify-center"
                  : "flex-1 hover:bg-blue-500 transition-colors flex gap-2 text-sm font-semibold text-white bg-blue-600 rounded-lg py-2.5 px-5 shadow-lg shadow-blue-900/20 items-center justify-center"
              }
            >
              {isSaved ? (
                <>
                  Remove Algorithm <Trash2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Add to My Algorithms <Plus className="w-4 h-4" />
                </>
              )}
            </button>
            <Link
              href={`/dashboard/algorithms/${algo.slug}`}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors"
            >
              View Performance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Release Card ────────────────────────────────────────
function ReleaseCard({
  algo,
  release,
  isSaved,
  onToggle,
}: {
  algo: Algorithm;
  release: ReturnType<typeof getEnrichedReleases>[number];
  isSaved: boolean;
  onToggle: () => void;
}) {
  const badge = getCategoryColor(algo.category);
  const isNew = release.days_ago_label.includes("d ago") || release.days_ago_label.includes("w ago");

  return (
    <div className="group bg-[#13161C] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 hover:bg-[#181b21] transition-all duration-300 flex flex-col">
      <div className="relative h-40 overflow-hidden">
        {algo.image_url.startsWith("http") ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={algo.image_url}
              alt={algo.name}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13161C] to-transparent"></div>
        <div
          className={`absolute top-3 right-3 ${
            isNew ? "bg-blue-500/90" : "bg-slate-700/80"
          } text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg backdrop-blur-sm`}
        >
          {isNew ? `NEW - ${release.days_ago_label}` : release.days_ago_label}
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span
            className={`px-2 py-0.5 rounded ${badge.bg} ${badge.text} text-[10px] font-medium ${badge.border} border backdrop-blur-md`}
          >
            {algo.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <Link
              href={`/dashboard/algorithms/${algo.slug}`}
              className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors"
            >
              {algo.name}
            </Link>
            <button
              onClick={onToggle}
              title={isSaved ? "Remove from sidebar" : "Bookmark"}
              className={
                isSaved
                  ? "text-red-400 hover:text-red-300 transition-colors"
                  : "text-slate-500 hover:text-white transition-colors"
              }
            >
              {isSaved ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Released: {release.released_at}
          </p>
        </div>

        {release.features.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {release.features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <FeatureIcon name={f.icon} className="w-3 h-3 text-slate-500" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-xs text-green-400 font-semibold">
              {algo.roi}
            </div>
            <div className="text-[9px] text-slate-500 uppercase">Return</div>
          </div>
          <div className="text-center border-l border-white/5">
            <div className="text-xs text-white font-semibold">
              {algo.win_rate}
            </div>
            <div className="text-[9px] text-slate-500 uppercase">Win Rate</div>
          </div>
          <div className="text-center border-l border-white/5">
            <div className="text-xs text-slate-300 font-semibold">
              {algo.drawdown}
            </div>
            <div className="text-[9px] text-slate-500 uppercase">DD</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Coming Soon Card ────────────────────────────────────
function ComingSoonCard({
  item,
}: {
  item: (typeof mockComingSoonAlgorithms)[number];
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      indigo: { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/20" },
      orange: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/20" },
      blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/20" },
    };
  const c = colorMap[item.icon_color] || colorMap.blue;

  return (
    <div className="relative bg-[#13161C] border border-white/5 rounded-xl p-6 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] z-0"></div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 ${c.bg} rounded-lg ${c.text} border ${c.border}`}>
            <FeatureIcon name={item.icon} className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-white bg-slate-700 px-2 py-1 rounded">
            COMING SOON
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white mb-2">{item.name}</h4>
        <p className="text-xs text-slate-400 mb-4 flex-1">
          {item.description}
        </p>
        <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 rounded border border-white/10 transition-colors flex items-center justify-center gap-2">
          <Bell className="w-3 h-3" /> Notify Me
        </button>
      </div>
    </div>
  );
}

// ─── Subscribe Banner ────────────────────────────────────
function SubscribeBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-900/20 via-[#13161C] to-[#13161C] border border-blue-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4 max-w-lg">
        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Never Miss a Release
          </h3>
          <p className="text-sm text-slate-400">
            Get notified immediately when new high-performance strategies are
            deployed to the marketplace. Stay ahead of the curve.
          </p>
        </div>
      </div>
      <div className="flex w-full md:w-auto flex-col gap-3 min-w-[300px]">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Subscribe
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="w-4 h-4 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
              <Check className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-xs text-slate-500">
              I agree to receive product updates
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
