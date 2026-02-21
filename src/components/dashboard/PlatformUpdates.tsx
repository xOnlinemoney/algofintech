"use client";

import { useState, useMemo } from "react";
import {
  Star,
  ArrowRight,
  FileText,
  HelpCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import {
  mockPlatformUpdates,
  mockQuarterlyStats,
  getUpdateCategoryColor,
} from "@/lib/mock-data";
import type { UpdateCategory } from "@/lib/types";

const FILTER_TABS = [
  "All Updates",
  "New Features",
  "Strategies",
  "Improvements",
  "Bug Fixes",
  "Announcements",
] as const;

type FilterTab = (typeof FILTER_TABS)[number];

/** Map filter tab labels to UpdateCategory values */
function matchesFilter(
  category: string,
  filter: FilterTab
): boolean {
  switch (filter) {
    case "All Updates":
      return true;
    case "New Features":
      return category === "New Feature";
    case "Strategies":
      return category === "New Strategy" || category === "New Asset Class";
    case "Improvements":
      return category === "Improvement" || category === "Integration" || category === "Security";
    case "Bug Fixes":
      return category === "Bug Fix";
    case "Announcements":
      return category === "Announcement";
    default:
      return true;
  }
}

export default function PlatformUpdates() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Updates");

  const filtered = useMemo(() => {
    return mockPlatformUpdates.filter((u) =>
      matchesFilter(u.category, activeFilter)
    );
  }, [activeFilter]);

  const featured = filtered.find((u) => u.is_featured);
  const timeline = filtered.filter((u) => !u.is_featured);

  return (
    <div className="flex flex-col max-w-[1200px] mx-auto w-full gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Platform Updates
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Stay informed about the latest features, improvements, new trading
            strategies, and system announcements.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={
                activeFilter === tab
                  ? "px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/10 whitespace-nowrap hover:bg-white/15 transition-colors"
                  : "px-3 py-1.5 rounded-full bg-[#13161C] text-slate-400 text-xs font-medium border border-white/5 whitespace-nowrap hover:text-white hover:border-white/10 transition-colors"
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Pinned Feature Update */}
          {featured && <FeaturedCard update={featured} />}

          {/* Timeline */}
          <div className="relative pl-8 border-l border-white/5 space-y-12">
            {timeline.map((update) => (
              <TimelineItem key={update.id} update={update} />
            ))}
          </div>

          <div className="flex justify-center pt-8 border-t border-white/5">
            <button className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all border border-white/5">
              Load Older Updates
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
          <SubscribeWidget />
          <QuarterlyRecap />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}

// ─── Featured Card ───────────────────────────────────────
function FeaturedCard({
  update,
}: {
  update: (typeof mockPlatformUpdates)[number];
}) {
  return (
    <div className="group relative bg-gradient-to-br from-blue-900/20 via-[#13161C] to-[#13161C] border border-blue-500/20 rounded-2xl p-6 overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Star className="w-[120px] h-[120px] text-blue-500" strokeWidth={1} />
      </div>
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500 text-white uppercase tracking-wider shadow-lg shadow-blue-500/20">
            Featured Update
          </span>
          <span className="text-xs text-blue-200/60 font-medium">
            {update.date}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {update.title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {update.description}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-2">
          {update.cta && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
              {update.cta.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href="#"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            View Performance Report
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Item ───────────────────────────────────────
function TimelineItem({
  update,
}: {
  update: (typeof mockPlatformUpdates)[number];
}) {
  const badge = getUpdateCategoryColor(update.category);
  // dot border color from badge
  const dotBorderClass = badge.dot; // e.g. "border-blue-500"

  return (
    <div className="relative">
      <div
        className={`absolute -left-[37px] top-1 h-4 w-4 rounded-full bg-[#0A0C10] border-2 ${dotBorderClass} flex items-center justify-center`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${dotBorderClass.replace(
            "border-",
            "bg-"
          )}`}
        ></div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">
            {update.date}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-700"></span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text} ${badge.border} border uppercase tracking-wide`}
          >
            {update.category}
          </span>
          {update.version && (
            <span className="text-[10px] text-slate-600 font-mono">
              {update.version}
            </span>
          )}
        </div>

        <div className="bg-[#13161C] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
          {/* Strategy card with image */}
          {update.image_url ? (
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 bg-slate-800 rounded-lg overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={update.image_url}
                  alt={update.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-green-500/10"></div>
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-200 group-hover:text-white transition-colors mb-1">
                  {update.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  {update.description}
                </p>
                {update.tags && (
                  <div className="flex items-center gap-3">
                    {update.tags.map((tag) => (
                      <div
                        key={tag.label}
                        className="text-[10px] text-slate-500 font-medium bg-white/5 px-1.5 py-0.5 rounded"
                      >
                        {tag.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-slate-200 group-hover:text-white transition-colors mb-2">
                    {update.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {update.description}
                  </p>
                  {update.cta && (
                    <button className="mt-3 text-[10px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                      {update.cta.label}
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                {update.cta && (
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10 ml-4 shrink-0">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Subscribe Widget ────────────────────────────────────
function SubscribeWidget() {
  return (
    <div className="bg-[#13161C] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 17H2" />
            <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2" />
            <path d="M22 17V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10" />
            <path d="M6 10a2 2 0 0 1 4 0 2 2 0 0 1-4 0Z" />
            <path d="M16.5 10a.5.5 0 0 1 1 0v3" />
            <path d="M14 13.5a.5.5 0 0 1 1 0" />
            <path d="M17 16.5a.5.5 0 0 1 1 0" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Get Notified</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Subscribe to receive a weekly digest of platform changes and new
        strategy deployments.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="work@email.com"
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
        <button className="bg-white text-black hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors">
          Add
        </button>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          role="switch"
          className="bg-blue-600 relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        >
          <span className="translate-x-3 pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
        </button>
        <span className="text-[10px] font-medium text-slate-400">
          Push notifications enabled
        </span>
      </div>
    </div>
  );
}

// ─── Quarterly Recap ─────────────────────────────────────
function QuarterlyRecap() {
  const stats = mockQuarterlyStats;
  return (
    <div className="bg-[#13161C] border border-white/5 rounded-xl p-5">
      <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
        Quarterly Recap
      </h3>
      <div className="space-y-4">
        <StatBar
          label="New Features"
          value={stats.new_features}
          pct={75}
          color="bg-blue-500"
        />
        <StatBar
          label="Strategies Added"
          value={stats.strategies_added}
          pct={50}
          color="bg-green-500"
        />
        <StatBar
          label="Bugs Squashed"
          value={stats.bugs_squashed}
          pct={90}
          color="bg-orange-500"
        />
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
}

// ─── Quick Links ─────────────────────────────────────────
function QuickLinks() {
  const links = [
    { icon: <FileText className="w-4 h-4" />, label: "Documentation" },
    { icon: <HelpCircle className="w-4 h-4" />, label: "Help Center" },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Submit Feedback" },
  ];

  return (
    <div className="bg-[#13161C] border border-white/5 rounded-xl overflow-hidden">
      {links.map((link, i) => (
        <button
          key={link.label}
          className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group text-left ${
            i < links.length - 1 ? "border-b border-white/5" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-slate-500 group-hover:text-slate-300">
              {link.icon}
            </span>
            <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
              {link.label}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </button>
      ))}
    </div>
  );
}
