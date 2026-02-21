"use client";

import { useState } from "react";
import {
  ShieldCheck,
  BarChart2,
  Rocket,
  Lock,
  Unlock,
  Check,
  Plus,
  Star,
} from "lucide-react";
import { mockAlgorithms, getCategoryColor } from "@/lib/mock-data";
import type { AlgorithmCategory } from "@/lib/types";

const categoryBadgeBg: Record<string, string> = {
  Forex: "bg-blue-500",
  Crypto: "bg-purple-500",
  Stocks: "bg-orange-500",
  Futures: "bg-red-500",
};

const filterTabs: ("All" | AlgorithmCategory)[] = [
  "All",
  "Forex",
  "Crypto",
  "Stocks",
  "Futures",
];

// How many to show publicly before gating
const PUBLIC_LIMIT = 6;

export default function PublicAlgorithmsPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | AlgorithmCategory>(
    "All"
  );

  const allAlgos = mockAlgorithms;
  const filtered =
    activeFilter === "All"
      ? allAlgos
      : allAlgos.filter((a) => a.category === activeFilter);

  const publicAlgos = filtered.slice(0, PUBLIC_LIMIT);
  const hiddenCount = filtered.length - PUBLIC_LIMIT;
  const totalCount = allAlgos.length;

  return (
    <section className="relative bg-[#020408] border-y border-white/5 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-20 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="border-white/5 border-b pt-20 px-6 pb-32 relative">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
              Professional Trading Algorithms for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Every Market
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Proven, backtested strategies across Forex, Crypto, Stocks, and
              Futures that your clients will trust. Join our partner network to
              access our complete library.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-white/5 py-8 mb-10">
              {[
                { value: `${totalCount}+`, label: "Verified Strategies" },
                { value: "$2B+", label: "Traded Volume" },
                { value: "15+ Years", label: "Combined Dev" },
                {
                  value: "68%",
                  label: "Avg Win Rate",
                  color: "text-emerald-400",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p
                    className={`text-2xl font-semibold tracking-tight ${
                      s.color || "text-white"
                    }`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-3 bg-white text-[#020408] rounded-full font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
                Become a Partner
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={
                  activeFilter === tab
                    ? "px-5 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/10"
                    : "px-5 py-2 rounded-full bg-transparent text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium border border-transparent transition-colors"
                }
              >
                {tab === "All" ? "All Algorithms" : tab}
              </button>
            ))}
            <div className="w-full text-center mt-2">
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Showing {publicAlgos.length} of {totalCount}+ available
                algorithms
              </span>
            </div>
          </div>

          {/* Algorithms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {publicAlgos.map((algo, i) => {
              const catColor = getCategoryColor(algo.category);
              const badgeBg =
                categoryBadgeBg[algo.category] || "bg-slate-500";
              const hasImage = algo.image_url && i < 3; // First 3 get images
              const gradientColors = [
                "text-blue-500/20",
                "text-emerald-500/20",
                "text-purple-500/20",
                "text-orange-500/20",
                "text-indigo-500/20",
                "text-pink-500/20",
              ];

              return (
                <div
                  key={algo.id}
                  className="group relative rounded-xl bg-[#0B0E14] border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-300"
                >
                  {/* Card Image / Gradient */}
                  <div className="h-40 w-full overflow-hidden relative">
                    {hasImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={algo.image_url}
                        alt={algo.name}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                        <svg
                          className={`absolute bottom-0 left-0 w-full h-24 ${gradientColors[i % gradientColors.length]}`}
                          viewBox="0 0 100 40"
                          preserveAspectRatio="none"
                        >
                          <path
                            d={`M0,${35 - i * 2} L${10 + i * 3},${30 - i} L${20 + i * 2},32 L${40 - i},${20 + i} L${55 + i},${22 - i} L${65 + i * 2},15 L${75 - i},18 L${85 + i},${10 + i} L100,5 L100,40 L0,40 Z`}
                            fill="currentColor"
                          />
                        </svg>
                      </>
                    )}
                    {/* Top Performer badge for first */}
                    {i === 0 && (
                      <div className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                        Top Performer
                      </div>
                    )}
                    {/* Featured badge for some */}
                    {i === 1 && (
                      <div className="absolute top-3 right-3 bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                        Featured
                      </div>
                    )}
                    {/* Category badge */}
                    <div
                      className={`absolute top-3 left-3 ${badgeBg} text-white px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider`}
                    >
                      {algo.category}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {algo.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 line-clamp-2">
                      {algo.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-white/5 border border-white/5">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Return (12m)
                        </p>
                        <p className="text-lg font-semibold text-emerald-400">
                          {algo.roi}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Win Rate</p>
                        <p className="text-lg font-semibold text-white">
                          {algo.win_rate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Max DD</p>
                        <p className="text-sm font-medium text-red-400">
                          -{algo.drawdown}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Category</p>
                        <p className="text-sm font-medium text-slate-300">
                          {algo.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase">
                          Strategy
                        </span>
                        <span className="text-xs text-slate-300">
                          {algo.name}
                        </span>
                      </div>
                      <button className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gated Content Section */}
          {hiddenCount > 0 && (
            <div className="relative w-full overflow-hidden rounded-xl border border-white/5 mb-24">
              <div className="bg-[#0B0E14] border-b border-white/5 p-6 md:p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-400" />
                    Unlock {hiddenCount}+ Additional Premium Algorithms
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Access our complete library of institutional-grade trading
                    strategies
                  </p>
                </div>
              </div>

              <div className="relative bg-[#020408] p-6 h-[400px]">
                {/* Blurred placeholder cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 blur-sm pointer-events-none select-none">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="rounded-xl bg-[#0B0E14] border border-white/10 h-64 p-4"
                    >
                      <div className="h-32 bg-white/5 rounded-lg mb-4" />
                      <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/80 to-transparent z-10" />

                {/* CTA Box */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-2xl px-4">
                  <div className="bg-[#0B0E14]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                      <Unlock className="text-blue-400 w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      Become a Partner to Access All Algorithms
                    </h3>
                    <p className="text-slate-400 mb-8">
                      Join our agency partner program to get unlimited access to
                      all {totalCount}+ strategies, detailed backtests, and
                      white-label integration.
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-300 mb-8 text-left max-w-lg mx-auto">
                      {[
                        `Full access to ${totalCount}+ verified strategies`,
                        "Detailed performance analytics",
                        "New algorithms added monthly",
                        "White-label integration",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2"
                        >
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-blue-900/20">
                        Apply for Partnership
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                      Partnership approval typically within 48 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden algo name teaser */}
              <div className="bg-[#020408] border-t border-white/5 p-4">
                <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-600 uppercase">
                  {filtered.slice(PUBLIC_LIMIT, PUBLIC_LIMIT + 5).map((a, i) => (
                    <span key={a.id}>
                      {i > 0 && (
                        <span className="text-slate-700 mr-4">•</span>
                      )}
                      {a.name}
                    </span>
                  ))}
                  {hiddenCount > 5 && (
                    <>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-500 font-semibold">
                        + {hiddenCount - 5} more exclusive strategies
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Why Partner Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
              {
                icon: <ShieldCheck className="text-blue-400 w-5 h-5" />,
                iconBg: "bg-blue-500/10",
                title: "Rigorously Tested",
                description:
                  "Every algorithm undergoes extensive backtesting across 5+ years of historical data and 6+ months of forward testing before release.",
              },
              {
                icon: <BarChart2 className="text-indigo-400 w-5 h-5" />,
                iconBg: "bg-indigo-500/10",
                title: "Complete Transparency",
                description:
                  "Partners get access to detailed performance metrics, trade logs, drawdown analysis, and monthly reports for every strategy.",
              },
              {
                icon: <Rocket className="text-purple-400 w-5 h-5" />,
                iconBg: "bg-purple-500/10",
                title: "Continuous Innovation",
                description:
                  "Our team continuously develops new algorithms and optimizes existing ones. Partners get immediate access to all updates.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center mb-4`}
                >
                  {item.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Development Process */}
          <div className="mb-24">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold text-white mb-2">
                How We Build Institutional-Grade Algorithms
              </h3>
              <p className="text-slate-400 text-sm">
                Only strategies that pass our rigorous 4-stage testing process
                make it to partners
              </p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {[
                  {
                    num: "1",
                    title: "Strategy Design",
                    desc: "Research & conceptualization",
                    color: "bg-blue-600",
                  },
                  {
                    num: "2",
                    title: "Backtesting",
                    desc: "5+ years historical validation",
                    color: "bg-blue-600",
                  },
                  {
                    num: "3",
                    title: "Forward Testing",
                    desc: "6+ months live validation",
                    color: "bg-blue-600",
                  },
                  {
                    num: "4",
                    title: "Partner Release",
                    desc: "Documentation & support",
                    color: "bg-emerald-500",
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="bg-[#020408] p-4 text-center"
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${step.color} text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 ring-4 ring-[#020408]`}
                    >
                      {step.num}
                    </div>
                    <h5 className="text-white font-medium mb-1">
                      {step.title}
                    </h5>
                    <p className="text-xs text-slate-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-24">
            <h3 className="text-2xl font-semibold text-white mb-8 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {[
                "How are algorithms tested before release?",
                "Can algorithms be customized for specific clients?",
                "Do I need technical knowledge to offer these?",
              ].map((q) => (
                <div
                  key={q}
                  className="border border-white/5 rounded-lg bg-white/[0.02] p-4"
                >
                  <button className="flex items-center justify-between w-full text-left">
                    <span className="text-sm font-medium text-white">{q}</span>
                    <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
            {[
              {
                quote:
                  "Our clients love the transparency and performance of these algorithms. We've onboarded 50+ clients in just 6 months using AlgoFintech's white-label solution.",
                name: "Sarah Mitchell",
                initials: "SM",
                role: "CEO, Elite Trading Partners",
              },
              {
                quote:
                  "The reliability of the execution and the depth of the backtesting data gave us the confidence to scale our managed account service.",
                name: "David Kim",
                initials: "DK",
                role: "Director, QuantCapital",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="p-6 bg-[#0B0E14] border border-white/5 rounded-xl"
              >
                <div className="flex items-center gap-1 mb-4 text-emerald-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-3.5 h-3.5 fill-current stroke-none"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Ready to Offer Premium Algorithms to Your Clients?
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8">
              Join 100+ agencies worldwide offering institutional-grade trading
              strategies under their own brand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-3 bg-white text-[#020408] rounded-full font-semibold hover:bg-slate-200 transition-all w-full sm:w-auto">
                Become a Partner
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500 uppercase tracking-wide">
              <span>•</span>
              <span>24/7 Support</span>
              <span>•</span>
              <span>White-Label Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
