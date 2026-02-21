"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Mail,
  BarChart3,
  Star,
  Loader2,
} from "lucide-react";
import {
  mockIndustryNewsArticles,
  mockMarketSnapshot,
  mockTrendingArticles,
  mockEditorPicks,
  getNewsCategoryColor,
} from "@/lib/mock-data";
import type { IndustryNewsCategory } from "@/lib/types";

const filterTabs: IndustryNewsCategory[] = [
  "All News",
  "Market Analysis",
  "Regulatory Updates",
  "Technology",
  "Trading Insights",
  "Company News",
  "Crypto",
];

export default function IndustryNews() {
  const [activeFilter, setActiveFilter] = useState<IndustryNewsCategory>("All News");
  const [searchQuery, setSearchQuery] = useState("");

  const featured = mockIndustryNewsArticles.find((a) => a.is_featured);
  const articles = mockIndustryNewsArticles.filter((a) => !a.is_featured);

  const filtered =
    activeFilter === "All News"
      ? articles
      : articles.filter((a) => a.category === activeFilter);

  const searched = searchQuery
    ? filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filtered;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Industry News & Insights
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Stay informed with the latest market analysis, regulatory updates,
            and trading insights.
          </p>
        </div>
        <div className="relative group shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-slate-600 w-64 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={
              activeFilter === tab
                ? "px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20 whitespace-nowrap"
                : "px-4 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-slate-300 transition-colors whitespace-nowrap"
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Featured Article */}
          {featured && activeFilter === "All News" && !searchQuery && (
            <div className="relative rounded-xl overflow-hidden border border-white/5 group cursor-pointer">
              <div className="aspect-[21/9] bg-gradient-to-br from-blue-900/50 to-indigo-900/50 relative">
                {featured.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.image_url}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const c = getNewsCategoryColor(featured.category);
                      return (
                        <span
                          className={`${c.bg} ${c.text} ${c.border} border text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded`}
                        >
                          {featured.category}
                        </span>
                      );
                    })()}
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featured.read_time}
                    </span>
                    {featured.source && (
                      <span className="text-slate-500 text-xs">
                        {featured.source}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-slate-400 line-clamp-2 max-w-2xl">
                    {featured.description}
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${featured.author_avatar_gradient} flex items-center justify-center text-white text-[10px] font-bold ring-1 ring-white/10`}
                    >
                      {featured.author_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-300">
                        {featured.author_name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {featured.published_at}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searched.map((article) => {
              const catColor = getNewsCategoryColor(article.category);
              return (
                <div
                  key={article.id}
                  className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all cursor-pointer group"
                >
                  {/* Card Image / Gradient */}
                  <div className="h-36 relative">
                    {article.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${article.image_gradient} opacity-40 group-hover:opacity-50 transition-opacity`}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`${catColor.bg} ${catColor.text} ${catColor.border} border text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded`}
                      >
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full bg-gradient-to-br ${article.author_avatar_gradient} flex items-center justify-center text-white text-[8px] font-bold ring-1 ring-white/10`}
                        >
                          {article.author_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {article.author_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600">
                        <span>{article.published_at}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-slate-600" />
                        <span>{article.read_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {searched.length > 0 && (
            <div className="flex justify-center pt-2">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <Loader2 className="w-4 h-4" />
                Load More Articles
              </button>
            </div>
          )}

          {searched.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm">
                No articles found matching your criteria.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-72 shrink-0 space-y-5 hidden xl:block">
          {/* Market Snapshot */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                Market Snapshot
              </h3>
              <span className="text-[10px] text-slate-600">Live</span>
            </div>
            <div className="space-y-3">
              {mockMarketSnapshot.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-medium text-white">
                      {item.symbol}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-white">
                      {item.price}
                    </div>
                    <div
                      className={`text-[10px] font-medium ${
                        item.change_positive
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {item.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending This Week */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Trending This Week
            </h3>
            <div className="space-y-3">
              {mockTrendingArticles.map((item, i) => {
                const catColor = getNewsCategoryColor(item.category);
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-600 mt-0.5 w-4 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 line-clamp-2 group-hover:text-blue-400 transition-colors leading-relaxed">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] ${catColor.text} font-medium`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {item.read_time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editor's Picks */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2 mb-4">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Editor&apos;s Picks
            </h3>
            <div className="space-y-3">
              {mockEditorPicks.map((item) => {
                const catColor = getNewsCategoryColor(item.category);
                return (
                  <div
                    key={item.id}
                    className="group cursor-pointer"
                  >
                    <p className="text-xs text-slate-300 line-clamp-2 group-hover:text-blue-400 transition-colors leading-relaxed">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] ${catColor.text} font-medium`}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {item.published_at}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Newsletter Subscribe */}
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-white">
                Newsletter
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
              Get weekly market insights and trading analysis delivered to your
              inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600"
              />
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
