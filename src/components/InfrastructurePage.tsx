"use client";

import { useState } from "react";
import {
  Cpu,
  Server,
  LayoutDashboard,
  Activity,
  Scale,
  Network,
  Users,
  Globe,
  ScanLine,
  Scaling,
  Zap,
  RefreshCw,
  Check,
  ShieldCheck,
  Key,
  Cloud,
  Database,
  Code2,
  ChevronDown,
} from "lucide-react";

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "What programming languages are used?",
    a: "Our backend is primarily built with Node.js and Python for microservices, while the core Copy Trading Engine is written in C++ for ultra-low latency execution. Frontend interfaces use React and TypeScript.",
  },
  {
    q: "How does the copy trading latency compare to direct VPS?",
    a: "Direct VPS is theoretically faster (<50ms) as it executes directly on the exchange connection. However, our Copy Trading replication adds minimal overhead (<500ms), which is negligible for most strategies excluding high-frequency arbitrage.",
  },
  {
    q: "Do you provide API access?",
    a: "Yes, partners receive full REST and WebSocket API access. We provide comprehensive documentation, SDKs, and a sandbox environment for testing integrations before going live.",
  },
  {
    q: "How scalable is the system?",
    a: "We use horizontal scaling with Kubernetes. The system is load-tested to handle 50,000+ concurrent connections and 100,000+ daily trades with auto-scaling capabilities during market volatility.",
  },
];

/* ─── Copy Engine Steps ─── */
const copySteps = [
  {
    num: "01",
    Icon: ScanLine,
    color: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    title: "Trade Detection",
    desc: "Monitors master accounts in real-time, detecting new positions, modifications, and closures with full context capture.",
  },
  {
    num: "02",
    Icon: Scaling,
    color: "bg-blue-500/10",
    iconColor: "text-blue-400",
    title: "Position Scaling",
    desc: "Automatically calculates lot sizes based on individual client equity, applying custom risk parameters and safety limits.",
  },
  {
    num: "03",
    Icon: Zap,
    color: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    title: "Intelligent Execution",
    desc: "Routes orders to appropriate brokers via optimized paths to minimize slippage and handle partial fills gracefully.",
  },
  {
    num: "04",
    Icon: RefreshCw,
    color: "bg-purple-500/10",
    iconColor: "text-purple-400",
    title: "Synchronization",
    desc: "Continuous reconciliation ensures client positions align with the master strategy, auto-correcting any drift.",
  },
];

/* ─── VPS Features ─── */
const vpsFeatures = [
  {
    Icon: Server,
    title: "Dedicated Resources",
    desc: "8-16 CPU cores, 32GB RAM, and NVMe SSDs per instance.",
  },
  {
    Icon: Globe,
    title: "Global Data Centers",
    desc: "Deployed in US East, Europe, and Asia-Pacific regions.",
  },
  {
    Icon: ShieldCheck,
    title: "Licensing System",
    desc: "Built-in license key management to control algorithm access.",
  },
];

/* ─── Comparison Table ─── */
const compRows = [
  { feature: "Setup Complexity", copy: "Simple (1-Click)", vps: "Moderate (Install)" },
  { feature: "Client Control", copy: "Hands-off", vps: "Full Access" },
  { feature: "Infrastructure", copy: "Fully Managed", vps: "Dedicated VPS" },
  { feature: "Scalability", copy: "Unlimited", vps: "Per Instance" },
  { feature: "Monitoring", copy: "Central Dashboard", vps: "Remote Desktop" },
  { feature: "Best For", copy: "Retail Clients", vps: "Power Users", bold: true },
];

/* ─── Infra Grid ─── */
const infraCards = [
  {
    Icon: Cloud,
    color: "text-blue-500",
    bg: "bg-blue-600/20",
    title: "Multi-Region Cloud",
    desc: "AWS & Azure deployments with N+1 redundancy and automatic failover across zones.",
    tags: ["AWS", "Azure", "GCP"],
  },
  {
    Icon: Database,
    color: "text-green-500",
    bg: "bg-green-600/20",
    title: "High-Perf Data Layer",
    desc: "PostgreSQL & MongoDB clusters with in-memory Redis caching for sub-ms queries.",
    tags: ["Redis", "TimescaleDB"],
  },
  {
    Icon: Code2,
    color: "text-orange-500",
    bg: "bg-orange-600/20",
    title: "WebSocket APIs",
    desc: "Real-time bi-directional data streams handling 10,000+ requests per second.",
    tags: ["REST", "WebSocket"],
  },
];

/* ─── Status services ─── */
const statusServices = [
  { name: "Copy Engine", pct: 100 },
  { name: "API Gateway", pct: 100 },
  { name: "Broker Feeds", pct: 98 },
  { name: "VPS Network", pct: 100 },
];

/* ─── Roadmap ─── */
const roadmap = [
  {
    quarter: "Q1 2025",
    title: "Platform Expansion",
    active: true,
    items: [
      "AI-powered execution optimization",
      "Advanced portfolio rebalancing",
      "GraphQL API support",
    ],
  },
  {
    quarter: "Q2 2025",
    title: "Intelligence Layer",
    active: false,
    items: [
      "Machine learning slippage prediction",
      "Custom algorithm builder UI",
      "Mobile app enhancements",
    ],
  },
  {
    quarter: "Q3 2025",
    title: "Transparency & Speed",
    active: false,
    items: [
      "Blockchain trade verification",
      "Quantum-resistant encryption",
      "Options trading support",
    ],
  },
];

export default function InfrastructurePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#020408] selection:bg-cyan-500/20 selection:text-cyan-400">
      {/* ════════ Hero ════════ */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[800px] h-[600px] blur-[120px] pointer-events-none opacity-30"
          style={{ background: "radial-gradient(circle at center, rgba(6,182,212,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[800px] h-[600px] blur-[120px] pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs font-medium text-cyan-400 tracking-wide uppercase">
                  Infrastructure V2.0 Live
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-medium text-white tracking-tight mb-6 leading-[1.1]">
                Enterprise-Grade <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Technology Built for Scale
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
                From our custom copy trading engine to managed VPS
                infrastructure, we&apos;ve built every component for
                reliability, speed, and flexibility.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 border-y border-white/5 py-8 bg-white/[0.02]">
                {[
                  { val: "99.9%", label: "Uptime Guaranteed" },
                  { val: "<50ms", label: "Avg Latency" },
                  { val: "$2B+", label: "Traded Volume" },
                  { val: "10k+", label: "Connections" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={`text-center lg:text-left px-4 ${i > 0 ? "border-l border-white/5" : ""}`}
                  >
                    <div className="text-2xl font-semibold text-white mb-1">
                      {s.val}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Window Visual */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative bg-[#0B0E14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/10 flex flex-col">
                {/* Window Header */}
                <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  <div className="ml-auto text-xs font-mono text-slate-500">
                    api-gateway.js
                  </div>
                </div>
                {/* Terminal Content */}
                <div className="p-6 font-mono text-xs md:text-sm text-slate-300 overflow-hidden relative flex-1">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0E14]/80 pointer-events-none z-10" />
                  <div className="space-y-2 opacity-90">
                    <div>
                      <span className="text-purple-400">const </span>
                      <span className="text-blue-400">AlgoFintech </span>
                      <span className="text-slate-500">= </span>
                      <span className="text-orange-400">require</span>
                      <span className="text-slate-500">
                        (&apos;@algofintech/core&apos;);
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-400">const </span>
                      <span className="text-blue-400">engine </span>
                      <span className="text-slate-500">= </span>
                      <span className="text-purple-400">new </span>
                      <span className="text-yellow-400">TradeEngine</span>
                      <span className="text-slate-500">({"{"}</span>
                    </div>
                    <div className="pl-8 text-slate-400">
                      mode:{" "}
                      <span className="text-green-400">
                        &apos;ultra_low_latency&apos;
                      </span>
                      ,
                    </div>
                    <div className="pl-8 text-slate-400">
                      redundancy:{" "}
                      <span className="text-orange-400">true</span>,
                    </div>
                    <div className="pl-8 text-slate-400">
                      sync_interval_ms:{" "}
                      <span className="text-blue-400">10</span>
                    </div>
                    <div className="text-slate-500">{"}"});</div>
                    <div className="text-slate-500">
                      // Initialize WebSocket Stream
                    </div>
                    <div>
                      <span className="text-blue-400">engine</span>
                      <span className="text-slate-500">.</span>
                      <span className="text-yellow-400">on</span>
                      <span className="text-slate-500">(</span>
                      <span className="text-green-400">
                        &apos;signal&apos;
                      </span>
                      <span className="text-slate-500">, </span>
                      <span className="text-purple-400">async </span>
                      <span className="text-slate-500">(</span>
                      <span className="text-red-400">data</span>
                      <span className="text-slate-500">
                        ) =&gt; {"{"}
                      </span>
                    </div>
                    <div className="pl-8 text-slate-500">
                      // Replicate to connected clients
                    </div>
                    <div className="pl-8">
                      <span className="text-purple-400">await </span>
                      <span className="text-blue-400">replicator</span>
                      <span className="text-slate-500">.</span>
                      <span className="text-yellow-400">broadcast</span>
                      <span className="text-slate-500">(data);</span>
                    </div>
                    <div className="pl-8">
                      <span className="text-blue-400">metrics</span>
                      <span className="text-slate-500">.</span>
                      <span className="text-yellow-400">recordLatency</span>
                      <span className="text-slate-500">(Date.now());</span>
                    </div>
                    <div className="text-slate-500">{"}"});</div>
                    <div className="flex items-center gap-2 text-green-400">
                      <span>&gt; System Ready.</span>
                      <span className="animate-pulse">_</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Architecture Diagram ════════ */}
      <section className="py-24 bg-[#050609]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium text-white tracking-tight mb-4">
              Purpose-Built Technology
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every component designed specifically for the demands of automated
              trading at scale
            </p>
          </div>

          <div className="relative p-8 md:p-12 rounded-2xl bg-[#0B0E14] border border-white/5 overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundSize: "60px 60px",
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
              }}
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Left: Sources */}
              <div className="space-y-6">
                <div className="text-center md:text-right">
                  <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-2 block">
                    Sources
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-[#1A1E26] border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                    <span className="text-sm text-white font-medium">
                      Master Algo Accounts
                    </span>
                    <Server className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="bg-[#1A1E26] border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                    <span className="text-sm text-white font-medium">
                      Agency Dashboard
                    </span>
                    <LayoutDashboard className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Center: Core Engine */}
              <div className="relative">
                <div className="absolute top-1/2 -left-8 w-8 h-[1px] bg-gradient-to-r from-transparent to-cyan-500/50 hidden md:block" />
                <div className="absolute top-1/2 -right-8 w-8 h-[1px] bg-gradient-to-l from-transparent to-cyan-500/50 hidden md:block" />

                <div className="bg-[#020408] border border-cyan-500/30 p-6 rounded-2xl text-center shadow-[0_0_50px_-15px_rgba(6,182,212,0.2)]">
                  <div className="w-12 h-12 rounded-lg bg-cyan-950 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                    <Cpu className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    AlgoFintech Core™
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Latency: &lt;10ms
                  </p>

                  <div className="space-y-2 text-left">
                    {[
                      {
                        Icon: Activity,
                        color: "text-green-400",
                        label: "Trade Detection",
                      },
                      {
                        Icon: Scale,
                        color: "text-blue-400",
                        label: "Risk Scaling",
                      },
                      {
                        Icon: Network,
                        color: "text-purple-400",
                        label: "Order Routing",
                      },
                    ].map(({ Icon, color, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2 rounded"
                      >
                        <Icon className={`w-3 h-3 ${color}`} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Destinations */}
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <span className="text-xs font-mono text-purple-500 uppercase tracking-widest mb-2 block">
                    Destinations
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-[#1A1E26] border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white font-medium">
                      Client Accounts
                    </span>
                  </div>
                  <div className="bg-[#1A1E26] border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white font-medium">
                      Broker Networks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Copy Trading Engine ════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050609] to-[#020408]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-16">
            <span className="text-cyan-500 font-medium tracking-wide uppercase text-xs mb-2 block">
              Proprietary Technology
            </span>
            <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-6">
              AlgoStack Copy Trading Engine™
            </h2>
            <p className="text-slate-400 max-w-3xl text-lg font-light">
              Our proprietary software monitors master accounts and instantly
              replicates trades to connected client accounts with precision
              scaling, risk management, and intelligent execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copySteps.map((step) => (
              <div
                key={step.num}
                className="relative p-6 rounded-2xl bg-[#0B0E14]/60 backdrop-blur-xl border border-white/5 transition-all hover:border-cyan-500/30 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs z-10">
                  {step.num}
                </div>
                <div
                  className={`h-12 w-12 rounded-lg ${step.color} flex items-center justify-center mb-6`}
                >
                  <step.Icon className={`w-6 h-6 ${step.iconColor}`} />
                </div>
                <h3 className="text-lg font-medium text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Supported Platforms */}
          <div className="mt-12 p-6 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap gap-4 justify-center items-center">
            <span className="text-sm text-slate-500 uppercase tracking-wider mr-4">
              Supported Platforms:
            </span>
            {["NinjaTrader", "MetaTrader 5", "Charles Schwab", "HyperLiquid"].map(
              (p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300"
                >
                  <Check className="w-3 h-3 text-cyan-500" />
                  {p}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ════════ VPS & Comparison ════════ */}
      <section className="py-24 bg-[#050609] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* VPS Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-500/20 mb-6">
                <span className="text-xs font-medium text-purple-400 tracking-wide uppercase">
                  Direct Deployment Option
                </span>
              </div>
              <h2 className="text-3xl font-medium text-white tracking-tight mb-6">
                Managed VPS Infrastructure
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                For agencies preferring manual deployment, we operate a global
                network of high-performance Virtual Private Servers optimized
                specifically for algorithmic trading.
              </p>

              <ul className="space-y-4 mb-8">
                {vpsFeatures.map(({ Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white font-medium text-sm">
                        {title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <h5 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" /> License Management
                </h5>
                <p className="text-xs text-slate-400">
                  Generate, assign, and revoke license keys instantly from your
                  dashboard. Bind keys to hardware IDs for maximum security.
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-[#0B0E14] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-medium text-white">
                  Compare Deployment Models
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02]">
                    <tr>
                      <th className="p-4 text-slate-500 font-medium">
                        Feature
                      </th>
                      <th className="p-4 text-cyan-400 font-medium">
                        Copy Trading
                      </th>
                      <th className="p-4 text-purple-400 font-medium">
                        Direct VPS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {compRows.map((row) => (
                      <tr key={row.feature}>
                        <td className="p-4 text-slate-300">{row.feature}</td>
                        <td
                          className={`p-4 ${row.bold ? "text-white font-medium" : "text-slate-400"}`}
                        >
                          {row.copy}
                        </td>
                        <td
                          className={`p-4 ${row.bold ? "text-white font-medium" : "text-slate-400"}`}
                        >
                          {row.vps}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Enterprise Infrastructure Grid ════════ */}
      <section className="py-24 bg-[#020408]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-medium text-white tracking-tight mb-4">
              Enterprise Infrastructure
            </h2>
            <p className="text-slate-400">
              Cloud-native, globally distributed, and purpose-built for
              low-latency execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {infraCards.map((card) => (
              <div
                key={card.title}
                className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-[#0B0E14] to-transparent hover:border-white/10 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4 ${card.color}`}
                >
                  <card.Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-medium mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{card.desc}</p>
                <div className="flex gap-2">
                  {card.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-1 bg-white/5 rounded text-slate-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Monitoring & Status ════════ */}
      <section className="py-24 bg-[#050609] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0B0E14] border border-white/10 rounded-2xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-white mb-4">
                  24/7 Monitoring &amp; System Health
                </h2>
                <p className="text-slate-400 mb-8">
                  We practice radical transparency. Our systems are monitored
                  around the clock with automated alerting and public status
                  pages.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      title: "Real-time Alerting",
                      desc: "PagerDuty integration for immediate incident response.",
                    },
                    {
                      title: "Log Aggregation",
                      desc: "Centralized logging for audit trails and debugging.",
                    },
                    {
                      title: "Auto-Scaling",
                      desc: "Infrastructure expands automatically during volatility.",
                    },
                    {
                      title: "DDoS Protection",
                      desc: "Cloudflare Enterprise edge protection.",
                    },
                  ].map(({ title, desc }) => (
                    <div key={title}>
                      <h4 className="text-white text-sm font-medium mb-1">
                        {title}
                      </h4>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Widget */}
              <div className="w-full lg:w-96 bg-[#020408] rounded-xl border border-white/5 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-medium text-white">
                    System Status
                  </span>
                  <span className="text-xs text-green-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    All Systems Operational
                  </span>
                </div>
                <div className="space-y-4">
                  {statusServices.map((svc) => (
                    <div
                      key={svc.name}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs text-slate-400">{svc.name}</span>
                      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${svc.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                  <a
                    href="#"
                    className="text-xs text-cyan-500 hover:text-cyan-400"
                  >
                    View Historical Uptime →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Roadmap ════════ */}
      <section className="py-24 bg-[#020408]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-medium text-white text-center mb-16">
            Continuous Innovation
          </h2>

          <div className="relative border-l border-white/10 ml-6 md:ml-0 space-y-12">
            {roadmap.map((r) => (
              <div key={r.quarter} className="relative pl-8 md:pl-0">
                <div
                  className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ring-4 ring-[#020408] ${r.active ? "bg-cyan-500" : "bg-white/20"}`}
                />
                <div className="md:flex items-start justify-between group">
                  <div className="md:w-5/12 md:text-right md:pr-12 mb-2 md:mb-0">
                    <span
                      className={`text-xs font-mono mb-1 block ${r.active ? "text-cyan-400" : "text-slate-500"}`}
                    >
                      {r.quarter}
                    </span>
                    <h3
                      className={`font-medium ${r.active ? "text-white" : "text-slate-300"}`}
                    >
                      {r.title}
                    </h3>
                  </div>
                  <div className="md:w-5/12 md:pl-12">
                    <ul
                      className={`text-sm space-y-1 ${r.active ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {r.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="py-24 bg-[#050609] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-medium text-white text-center mb-10">
            Technology Questions Answered
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-[#0B0E14] rounded-xl border overflow-hidden transition-colors ${openFaq === i ? "border-cyan-500/20" : "border-white/5"}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full p-4 text-left font-medium text-white text-sm cursor-pointer"
                >
                  {faq.q}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
