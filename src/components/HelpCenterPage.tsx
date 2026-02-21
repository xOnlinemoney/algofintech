"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Rocket,
  Handshake,
  DollarSign,
  Palette,
  BarChart3,
  Cpu,
  Users,
  ShieldCheck,
  PlayCircle,
  Play,
  FileText,
  ArrowRight,
  Eye,
  Compass,
  Send,
  Calendar,
  LayoutGrid,
  Calculator,
  Receipt,
  Layers,
  Filter,
  Scale,
  CheckSquare,
  BarChart2,
  Shield,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  ChevronDown,
  Check,
} from "lucide-react";

/* ─── data ─── */

const categories = [
  {
    icon: Rocket,
    color: "emerald",
    title: "Getting Started",
    desc: "New to AlgoStack? Start here to understand how we work and how to become a partner",
    count: "25+ articles",
    articles: [
      "What is AlgoStack?",
      "How does the white-label model work?",
      "Who is AlgoStack for?",
      "Partnership requirements",
    ],
    cta: "View all articles",
  },
  {
    icon: Handshake,
    color: "blue",
    title: "Partnership & Onboarding",
    desc: "Everything about becoming a partner, the application process, and getting set up",
    count: "30+ articles",
    articles: [
      "How to apply for partnership",
      "Partnership approval process",
      "Onboarding timeline (7-day process)",
      "Partnership tiers explained",
    ],
    cta: "View all articles",
  },
  {
    icon: DollarSign,
    color: "amber",
    title: "Pricing & Fees",
    desc: "Understand our pricing structure, fees, and how to maximize ROI",
    count: "20+ articles",
    articles: [
      "Pricing model explained",
      "Setup fee: What\u2019s included",
      "How to calculate your ROI",
      "No hidden fees guarantee",
    ],
    cta: "View all articles",
  },
  {
    icon: Palette,
    color: "purple",
    title: "White-Label Solutions",
    desc: "Learn about our white-label capabilities and how to brand the platform as your own",
    count: "35+ articles",
    articles: [
      'What does "white-label" mean?',
      "Branding customization options",
      "Custom domain setup",
      "Multi-brand support",
    ],
    cta: "View all articles",
  },
  {
    icon: BarChart3,
    color: "cyan",
    title: "Algorithms & Strategies",
    desc: "Understand our algorithms, how they\u2019re developed, and how to choose the right ones",
    count: "40+ articles",
    articles: [
      "30+ algorithms available",
      "Algorithm categories by asset class",
      "Understanding backtesting results",
      "7-stage development process",
    ],
    cta: "View all articles",
  },
  {
    icon: Cpu,
    color: "indigo",
    title: "Platform & Technology",
    desc: "Technical information about our platform, integrations, and infrastructure",
    count: "45+ articles",
    articles: [
      "Platform overview and features",
      "Copy trading vs. VPS deployment",
      "Supported trading platforms",
      "99.9% uptime SLA",
    ],
    cta: "View all articles",
  },
  {
    icon: Users,
    color: "pink",
    title: "Client Management",
    desc: "How to onboard, manage, and support your clients using AlgoStack",
    count: "30+ articles",
    articles: [
      "How to onboard new clients",
      "Client dashboard overview",
      "Client reporting and analytics",
      "Best practices for client success",
    ],
    cta: "View all articles",
  },
  {
    icon: ShieldCheck,
    color: "green",
    title: "Compliance & Security",
    desc: "Learn about our security measures, compliance standards, and regulatory considerations",
    count: "25+ articles",
    articles: [
      "Is AlgoStack regulated?",
      "Non-custodial architecture explained",
      "SOC 2 Type II certification",
      "GDPR and data privacy",
    ],
    cta: "View all articles",
  },
  {
    icon: PlayCircle,
    color: "red",
    title: "Video Tutorials",
    desc: "Watch step-by-step video guides for visual learners",
    count: "50+ videos",
    badge: "Videos",
    articles: [
      "Platform walkthrough series",
      "White-label setup guide",
      "Client onboarding tutorial",
      "Algorithm selection masterclass",
    ],
    articleIcon: Play,
    cta: "Watch all videos",
  },
];

const popularArticles = [
  {
    icon: BookOpen,
    color: "emerald",
    tag: "Getting Started",
    time: "8 min read",
    title: "What Is AlgoStack and How Does It Work?",
    desc: "A comprehensive overview of AlgoStack\u2019s white-label algorithmic trading platform and how agencies use it to serve clients",
    views: "15K views",
  },
  {
    icon: DollarSign,
    color: "amber",
    tag: "Pricing & Fees",
    time: "10 min read",
    title: "Complete Pricing Guide: Setup Fees, Client Fees, and Performance Fees",
    desc: "Transparent breakdown of all costs associated with partnering with AlgoStack and how to calculate your ROI",
    views: "12K views",
  },
  {
    icon: Palette,
    color: "purple",
    tag: "White-Label",
    time: "6 min read",
    title: "White-Label Explained: What It Means and How It Benefits Your Agency",
    desc: "Understanding true white-label technology and why it\u2019s superior to co-branding or \u2018powered by\u2019 solutions",
    views: "10K views",
  },
  {
    icon: Calendar,
    color: "blue",
    tag: "Onboarding",
    time: "7 min read",
    title: "7-Day Launch Timeline: From Application to Live Platform",
    desc: "Step-by-step breakdown of what happens during your first week as an AlgoStack partner",
    views: "9K views",
  },
  {
    icon: BarChart3,
    color: "indigo",
    tag: "Platform",
    time: "12 min read",
    title: "Copy Trading vs. Direct VPS Deployment: Which Model Is Right for You?",
    desc: "Compare our two deployment models and learn which fits your agency\u2019s service model best",
    views: "8K views",
  },
  {
    icon: Shield,
    color: "green",
    tag: "Security",
    time: "9 min read",
    title: "Security & Fund Safety: Why AlgoStack Never Touches Client Money",
    desc: "Detailed explanation of our non-custodial architecture and how client funds remain secure with regulated brokers",
    views: "6K views",
  },
];

const gettingStartedSteps = [
  {
    num: 1,
    color: "indigo",
    title: "Understand What We Offer",
    time: "~20 min",
    desc: "Learn the basics of AlgoStack and how white-label algorithmic trading works",
    links: [
      { icon: FileText, color: "indigo", label: "What is AlgoStack?" },
      { icon: FileText, color: "indigo", label: "How white-label works" },
      { icon: FileText, color: "indigo", label: "Ideal partner profile" },
      { icon: PlayCircle, color: "red", label: "Platform Overview (5 min)" },
    ],
    cta: "Start here",
  },
  {
    num: 2,
    color: "purple",
    title: "Explore Our Algorithms",
    time: "~30 min",
    desc: "Discover the 30+ algorithms across Forex, Crypto, Stocks, and Futures",
    links: [
      { icon: FileText, color: "purple", label: "30+ algorithms available" },
      { icon: FileText, color: "purple", label: "Understanding performance data" },
      { icon: FileText, color: "purple", label: "Development process" },
      { icon: LayoutGrid, color: "cyan", label: "Browse Algorithm Catalog" },
    ],
    cta: "View algorithms",
  },
  {
    num: 3,
    color: "amber",
    title: "Review Pricing & Business Model",
    time: "~25 min",
    desc: "Understand costs, revenue potential, and calculate your expected ROI",
    links: [
      { icon: FileText, color: "amber", label: "Complete pricing breakdown" },
      { icon: FileText, color: "amber", label: "Calculate your ROI" },
      { icon: FileText, color: "amber", label: "Partnership tiers" },
      { icon: Calculator, color: "emerald", label: "ROI Calculator Tool" },
    ],
    cta: "Understand pricing",
  },
  {
    num: 4,
    color: "pink",
    title: "Learn About White-Label",
    time: "~30 min",
    desc: "Discover customization options and how to brand the platform as your own",
    links: [
      { icon: FileText, color: "pink", label: "White-label capabilities" },
      { icon: FileText, color: "pink", label: "Customization levels" },
      { icon: FileText, color: "pink", label: "7-day setup process" },
      { icon: PlayCircle, color: "red", label: "White-Label Demo (8 min)" },
    ],
    cta: "Learn white-label",
  },
  {
    num: 5,
    color: "green",
    title: "Understand Requirements & Compliance",
    time: "~20 min",
    desc: "Check if you qualify and understand regulatory considerations",
    links: [
      { icon: FileText, color: "green", label: "Partnership requirements" },
      { icon: FileText, color: "green", label: "Regulatory considerations" },
      { icon: FileText, color: "green", label: "Security overview" },
    ],
    cta: "Check requirements",
  },
];

const tools = [
  { icon: Calculator, color: "emerald", title: "ROI Calculator", desc: "Calculate your potential revenue as an AlgoStack partner based on client count and trading volume", cta: "Try Calculator" },
  { icon: Receipt, color: "amber", title: "Setup Cost Estimator", desc: "Estimate your AlgoStack setup costs based on asset classes, algorithms, and customization tier", cta: "Estimate Costs" },
  { icon: Layers, color: "purple", title: "Partnership Tier Selector", desc: "Answer a few questions to find the right partnership tier for your needs", cta: "Find My Tier" },
  { icon: Filter, color: "cyan", title: "Algorithm Selector", desc: "Find algorithms that match your client profile based on risk tolerance and preferences", cta: "Find Algorithms" },
  { icon: Scale, color: "pink", title: "Build vs. Buy Comparison", desc: "Compare costs and timelines: AlgoStack vs. building in-house", cta: "Compare Options" },
  { icon: CheckSquare, color: "blue", title: "Onboarding Checklist", desc: "Generate a personalized checklist of everything you need to get started", cta: "Get Checklist" },
];

const videos = [
  { gradient: "from-indigo-600/20 to-purple-600/20", duration: "5:24", title: "Introduction to AlgoStack Platform", meta: "Platform Walkthrough Series \u2022 15K views" },
  { gradient: "from-purple-600/20 to-pink-600/20", duration: "8:12", title: "White-Label Setup Guide", meta: "White-Label Series \u2022 12K views" },
  { gradient: "from-emerald-600/20 to-cyan-600/20", duration: "12:45", title: "Algorithm Selection Masterclass", meta: "Algorithm Education \u2022 10K views" },
  { gradient: "from-amber-600/20 to-orange-600/20", duration: "15:30", title: "Client Onboarding Tutorial", meta: "Client Management \u2022 8K views" },
];

const resources = [
  { icon: FileText, color: "red", title: "Partner Welcome Kit", desc: "Complete guide for new partners", size: "PDF \u2022 50 pages" },
  { icon: Palette, color: "purple", title: "White-Label Branding Guide", desc: "Customize your platform", size: "PDF \u2022 25 pages" },
  { icon: BarChart2, color: "cyan", title: "Algorithm Performance Report", desc: "Monthly updated stats", size: "PDF \u2022 Updated Monthly" },
  { icon: Shield, color: "green", title: "Compliance & Regulatory Guide", desc: "Regional requirements", size: "PDF \u2022 30 pages" },
];

const faqs = [
  {
    q: "What is AlgoStack?",
    a: "AlgoStack is a white-label algorithmic trading platform that enables agencies, wealth managers, and trading firms to offer institutional-grade automated trading to their clients under their own brand. We provide the technology, algorithms, and infrastructure\u2014you provide the client relationships.",
  },
  {
    q: "How much does it cost to get started?",
    a: "Setup fees range from $5,000 to $25,000+ depending on the number of asset classes, algorithms selected, and customization tier (Essential, Advanced, or Enterprise). There are no monthly subscription fees\u2014we earn through a $1,000 client signup fee and 2% performance fee structure that aligns our success with yours.",
  },
  {
    q: "How long does setup take?",
    a: "Most partners launch within 7 days using our Essential branding tier. Advanced customization takes 2-3 weeks, and Enterprise-level white-labeling with custom features takes 4-6 weeks. We provide a dedicated onboarding specialist to guide you through the entire process.",
  },
  {
    q: "Do you have access to client funds?",
    a: "Absolutely not. AlgoStack operates a non-custodial architecture. Client funds remain at their chosen regulated broker at all times. We only send trade signals\u2014we never hold, touch, or have access to client money. This is a fundamental security principle of our platform.",
  },
  {
    q: "What trading platforms do you support?",
    a: "We currently integrate with NinjaTrader, MetaTrader 5 (MT5), Charles Schwab, TradingView, and HyperLiquid. Additional platform integrations are available for Enterprise partners. Our copy trading system works with most major brokers.",
  },
  {
    q: "Do I need technical skills to use AlgoStack?",
    a: "No technical skills required. Our platform is designed for non-technical users with an intuitive interface. We handle all the complex technology\u2014you focus on your clients. Full training is included in your onboarding, and our support team is always available to help.",
  },
  {
    q: "What are the partnership requirements?",
    a: "We look for established businesses with existing client relationships in financial services, wealth management, or trading education. You should have a legitimate business entity, clear value proposition, and commitment to client success. We review each application individually\u2014approval typically takes 24-48 hours.",
  },
  {
    q: "How are your algorithms developed?",
    a: "Every algorithm goes through our rigorous 7-stage development process over 9-12 months: research, development, backtesting, optimization, forward testing, live testing, and continuous monitoring. Only algorithms that pass all stages with verified performance are released to partners.",
  },
];

const glossary = [
  { term: "Algorithm", def: "A set of rules and calculations that automatically execute trades based on predefined criteria without human intervention." },
  { term: "Backtesting", def: "Testing a trading strategy using historical market data to evaluate how it would have performed in the past." },
  { term: "Copy Trading", def: "A method where trades from a master account are automatically replicated to follower accounts in real-time." },
  { term: "Drawdown", def: "The peak-to-trough decline in account value, measuring the maximum loss from a high point before a new high is reached." },
  { term: "White-Label", def: "A product or service produced by one company that other companies rebrand and sell as their own." },
  { term: "Non-Custodial", def: "An architecture where the service provider never holds or has access to client funds\u2014funds remain at the client\u2019s broker." },
];

const recentlyUpdated = [
  { badge: "New", badgeColor: "emerald", date: "Dec 15", title: "TradingView Integration Guide" },
  { badge: "Updated", badgeColor: "blue", date: "Dec 14", title: "2024 Pricing Changes" },
  { badge: "Updated", badgeColor: "blue", date: "Dec 12", title: "Algorithm Performance Report" },
  { badge: "New", badgeColor: "emerald", date: "Dec 10", title: "HyperLiquid Setup Guide" },
];

const contactOptions = [
  { icon: Mail, color: "indigo", title: "Contact Support", desc: "We respond within 24 hours", detail: "support@algostack.com", detailColor: "text-indigo-400" },
  { icon: Calendar, color: "purple", title: "Schedule a Call", desc: "Talk to our partnerships team", detail: "30-45 min consultation", detailColor: "text-indigo-400" },
  { icon: MessageCircle, color: "emerald", title: "Live Chat", desc: "Get instant answers", detail: "Online now", detailColor: "text-emerald-400", pulse: true },
  { icon: MessageSquarePlus, color: "amber", title: "Submit Feedback", desc: "Help us improve", detail: "Suggest an article", detailColor: "text-indigo-400" },
];

/* ─── color map helper ─── */
const bg = (c: string) =>
  ({
    emerald: "from-emerald-500/20 to-emerald-600/10",
    blue: "from-blue-500/20 to-blue-600/10",
    amber: "from-amber-500/20 to-amber-600/10",
    purple: "from-purple-500/20 to-purple-600/10",
    cyan: "from-cyan-500/20 to-cyan-600/10",
    indigo: "from-indigo-500/20 to-indigo-600/10",
    pink: "from-pink-500/20 to-pink-600/10",
    green: "from-green-500/20 to-green-600/10",
    red: "from-red-500/20 to-red-600/10",
  })[c] ?? "from-slate-500/20 to-slate-600/10";

const text = (c: string) =>
  ({
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    indigo: "text-indigo-400",
    pink: "text-pink-400",
    green: "text-green-400",
    red: "text-red-400",
  })[c] ?? "text-slate-400";

const tagBg = (c: string) =>
  ({
    emerald: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    amber: "bg-amber-500/10 text-amber-400",
    purple: "bg-purple-500/10 text-purple-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
    pink: "bg-pink-500/10 text-pink-400",
    green: "bg-green-500/10 text-green-400",
    red: "bg-red-500/10 text-red-400",
  })[c] ?? "bg-slate-500/10 text-slate-400";

const borderColor = (c: string) =>
  ({
    indigo: "border-indigo-500",
    purple: "border-purple-500",
    amber: "border-amber-500",
    pink: "border-pink-500",
    green: "border-green-500",
    emerald: "border-emerald-500",
  })[c] ?? "border-slate-500";

const bgSolid = (c: string) =>
  ({
    indigo: "bg-indigo-500/20",
    purple: "bg-purple-500/20",
    amber: "bg-amber-500/20",
    pink: "bg-pink-500/20",
    green: "bg-green-500/20",
    emerald: "bg-emerald-500/20",
  })[c] ?? "bg-slate-500/20";

const contactBg = (c: string) =>
  ({
    indigo: "bg-indigo-500/10",
    purple: "bg-purple-500/10",
    emerald: "bg-emerald-500/10",
    amber: "bg-amber-500/10",
  })[c] ?? "bg-slate-500/10";

/* ─── component ─── */

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <main className="bg-[#030712] text-slate-300 antialiased">
      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Base
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-4">
            How Can We Help You Today?
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 mb-3 max-w-2xl mx-auto">
            Everything you need to know about partnering with AlgoStack and launching your algorithmic trading business
          </p>
          <p className="text-sm text-slate-500 mb-10">
            Browse articles, watch tutorials, or search for specific answers
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div
              className={`relative rounded-2xl transition-all duration-300 bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] ${
                searchFocused ? "shadow-[0_0_0_2px_rgba(99,102,241,0.3),0_0_40px_rgba(99,102,241,0.15)]" : ""
              }`}
            >
              <div className="flex items-center">
                <Search className="absolute left-5 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search for answers... (e.g., 'How does white-label work?')"
                  className="w-full py-4 pl-14 pr-32 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
                <button className="absolute right-3 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                  Search
                </button>
              </div>
            </div>

            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden z-10">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Suggestions</div>
                  {["How does white-label work?", "Pricing and setup fees", "Partnership requirements"].map((s) => (
                    <a key={s} href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors">
                      <Search className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">{s}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <span className="text-xs text-slate-500">Popular:</span>
            {["Pricing", "Setup time", "White-label", "Algorithms", "Requirements"].map((t) => (
              <a key={t} href="#" className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors">
                {t}
              </a>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { val: "500+", label: "Articles" },
              { val: "50+", label: "Video Tutorials" },
              { val: "24/7", label: "Access" },
              { val: "Weekly", label: "Updates" },
            ].map((s) => (
              <div key={s.label} className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-white mb-1">{s.val}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Browse by Topic ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">Browse by Topic</h2>
            <p className="text-slate-400">Find what you&apos;re looking for quickly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const ArtIcon = cat.articleIcon ?? FileText;
              return (
                <div
                  key={cat.title}
                  className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 hover:border-indigo-500/40 relative overflow-hidden"
                >
                  {cat.badge && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded text-xs font-medium text-indigo-400">
                      {cat.badge}
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bg(cat.color)} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${text(cat.color)}`} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">{cat.count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{cat.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{cat.desc}</p>
                  <div className="space-y-2 mb-4">
                    {cat.articles.map((a) => (
                      <a key={a} href="#" className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                        <ArtIcon className="w-3.5 h-3.5" />
                        {a}
                      </a>
                    ))}
                  </div>
                  <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors group-hover:gap-3">
                    {cat.cta}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Popular Articles ─── */}
      <section className="py-20 bg-gradient-to-b from-slate-950/50 to-transparent border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">Most Popular Articles</h2>
              <p className="text-slate-400">Start with what others found most helpful</p>
            </div>
            <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
              View all articles
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((art) => {
              const Icon = art.icon;
              return (
                <a
                  key={art.title}
                  href="#"
                  className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5 transition-all duration-200 group hover:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${tagBg(art.color).split(" ")[0]} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${text(art.color)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${tagBg(art.color)}`}>{art.tag}</span>
                        <span className="text-xs text-slate-500">{art.time}</span>
                      </div>
                      <h3 className="text-base font-medium text-white mb-1.5 group-hover:text-indigo-400 transition-colors">{art.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{art.desc}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {art.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Getting Started Guide ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <Compass className="w-3.5 h-3.5" />
              Recommended Path
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">New to AlgoStack? Start Here</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Follow this guide to understand how we work and get started. Total estimated time: ~3 hours</p>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-emerald-500 hidden sm:block" />

            <div className="space-y-6">
              {gettingStartedSteps.map((step) => (
                <div key={step.num} className="relative flex gap-6">
                  <div className={`hidden sm:flex w-12 h-12 rounded-full ${bgSolid(step.color)} border-2 ${borderColor(step.color)} items-center justify-center shrink-0 z-10`}>
                    <span className={`${text(step.color)} font-semibold`}>{step.num}</span>
                  </div>
                  <div className="flex-1 bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`sm:hidden w-8 h-8 rounded-full ${bgSolid(step.color)} border ${borderColor(step.color)} flex items-center justify-center`}>
                        <span className={`${text(step.color)} font-semibold text-sm`}>{step.num}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                      <span className="text-xs text-slate-500 ml-auto">{step.time}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{step.desc}</p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      {step.links.map((link) => {
                        const LIcon = link.icon;
                        return (
                          <a key={link.label} href="#" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <LIcon className={`w-4 h-4 ${text(link.color)}`} />
                            <span className="text-sm text-slate-300">{link.label}</span>
                          </a>
                        );
                      })}
                    </div>
                    <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      {step.cta}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}

              {/* Step 6 - Ready */}
              <div className="relative flex gap-6">
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-emerald-500 items-center justify-center shrink-0 z-10">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="sm:hidden w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Ready to Apply?</h3>
                  </div>
                  <p className="text-sm text-slate-300 mb-5">You&apos;ve done your research! Take the next step toward becoming an AlgoStack partner.</p>
                  <div className="flex flex-wrap gap-3">
                    <a href="#" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm">
                      <Send className="w-4 h-4" />
                      Apply Now
                    </a>
                    <a href="#" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors text-sm">
                      <Calendar className="w-4 h-4" />
                      Schedule Consultation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tools & Calculators ─── */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-slate-950/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">Tools &amp; Calculators</h2>
            <p className="text-slate-400">Hands-on tools to help you make decisions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <a key={tool.title} href="#" className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 group hover:border-indigo-500/30 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bg(tool.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${text(tool.color)}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{tool.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{tool.desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 group-hover:gap-3 transition-all">
                    {tool.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Video Tutorials ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">Video Tutorials</h2>
              <p className="text-slate-400">Watch and learn at your own pace</p>
            </div>
            <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
              View all videos
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.map((vid) => (
              <a key={vid.title} href="#" className="group">
                <div className="aspect-video rounded-xl bg-slate-800 mb-3 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${vid.gradient}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs text-white">{vid.duration}</div>
                </div>
                <h4 className="text-sm font-medium text-white mb-1 group-hover:text-indigo-400 transition-colors">{vid.title}</h4>
                <p className="text-xs text-slate-500">{vid.meta}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Downloadable Resources ─── */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-slate-950/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">Downloadable Resources</h2>
            <p className="text-slate-400">Take these resources with you</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((res) => {
              const Icon = res.icon;
              return (
                <a key={res.title} href="#" className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5 hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${tagBg(res.color).split(" ")[0]} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${text(res.color)}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1 group-hover:text-indigo-400 transition-colors">{res.title}</h4>
                      <p className="text-xs text-slate-500 mb-2">{res.desc}</p>
                      <span className="text-xs text-slate-400">{res.size}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400">Quick answers to common questions</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex items-center justify-between w-full p-5 text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-400 border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              View all 60+ FAQs &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ─── Glossary ─── */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-slate-950/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">Algorithmic Trading Glossary</h2>
              <p className="text-slate-400">Common terms and definitions</p>
            </div>
            <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
              View full glossary (50+ terms)
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {glossary.map((g) => (
              <div key={g.term} className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-5">
                <h4 className="text-sm font-semibold text-white mb-2">{g.term}</h4>
                <p className="text-xs text-slate-400">{g.def}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Still Need Help ─── */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">Still Can&apos;t Find What You&apos;re Looking For?</h2>
            <p className="text-slate-400">We&apos;re here to help</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <a key={opt.title} href="#" className="bg-[rgba(15,23,42,0.6)] backdrop-blur-xl border border-white/[0.08] rounded-xl p-6 text-center hover:border-indigo-500/30 transition-all group">
                  <div className={`w-14 h-14 rounded-full ${contactBg(opt.color)} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${text(opt.color)}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{opt.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{opt.desc}</p>
                  {opt.pulse ? (
                    <span className="text-sm text-emerald-400 flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      {opt.detail}
                    </span>
                  ) : (
                    <span className={`text-sm ${opt.detailColor}`}>{opt.detail}</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Recently Updated ─── */}
      <section className="py-16 border-t border-white/5 bg-gradient-to-b from-slate-950/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h3 className="text-lg font-semibold text-white">Recently Updated</h3>
            <span className="text-xs text-slate-500">Last updated: December 15, 2024</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyUpdated.map((item) => (
              <a key={item.title} href="#" className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs ${tagBg(item.badgeColor)} rounded`}>{item.badge}</span>
                  <span className="text-xs text-slate-500">{item.date}</span>
                </div>
                <h4 className="text-sm text-white">{item.title}</h4>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Floating Chat Button ─── */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/25 flex items-center justify-center transition-all hover:scale-110 z-50">
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </main>
  );
}
