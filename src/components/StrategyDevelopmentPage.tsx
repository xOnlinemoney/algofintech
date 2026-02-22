"use client";

import { useState } from "react";
import {
  ArrowRight,
  Microscope,
  ShieldCheck,
  BarChart2,
  Lightbulb,
  PenTool,
  Code,
  History,
  Sliders,
  Play,
  Rocket,
  Check,
  ChevronDown,
  Code2,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

/* ── Philosophy cards ── */
const philosophyCards = [
  {
    icon: Microscope,
    color: "indigo",
    title: "Scientific Rigor",
    desc: "Every algorithm begins with quantitative research. We analyze historical data, identify market inefficiencies, and develop hypotheses based on statistical evidence\u2014not hunches.",
    bullets: ["Statistical pattern identification", "Hypothesis-driven development"],
  },
  {
    icon: ShieldCheck,
    color: "emerald",
    title: "Extensive Testing",
    desc: "Before release, algorithms undergo minimum 5 years of historical backtesting plus 6+ months of forward testing in real market conditions.",
    bullets: ["Minimum 5 years backtesting", "6+ months forward testing"],
  },
  {
    icon: BarChart2,
    color: "blue",
    title: "Transparent Performance",
    desc: "We don\u2019t optimize for past performance. Our algorithms are designed to adapt to future market conditions. All performance data is verifiable.",
    bullets: ["Walk-forward analysis", "Out-of-sample testing"],
  },
];

const philoColorMap: Record<string, { bg: string; text: string; dot: string }> = {
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", dot: "bg-indigo-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
};

/* ── 7 Stages ── */
const stages = [
  {
    num: "01",
    icon: Lightbulb,
    title: "Research & Ideation",
    duration: "2-4 Weeks",
    desc: "Quantitative researchers analyze historical data to identify market inefficiencies and statistically significant patterns.",
    bullets: ["Statistical pattern identification", "Academic literature review", "Hypothesis formulation"],
    accent: true,
    borderColor: "border-l-indigo-500",
    labelColor: "text-indigo-400",
    ring: false,
    critical: false,
  },
  {
    num: "02",
    icon: PenTool,
    title: "Strategy Design",
    duration: "3-6 Weeks",
    desc: "Translating research into trading logic. Defining entry/exit rules, position sizing, and risk frameworks.",
    deliverable: "Technical specification & pseudocode",
    accent: false,
    ring: false,
    critical: false,
  },
  {
    num: "03",
    icon: Code,
    title: "Development & Coding",
    duration: "4-8 Weeks",
    desc: "Implementation in Python/C++ using institutional-grade libraries. Includes unit testing and code reviews.",
    accent: false,
    ring: false,
    critical: false,
  },
  {
    num: "04",
    icon: History,
    title: "Extensive Backtesting",
    duration: "6-12 Weeks",
    desc: "Historical validation across market cycles (Bull, Bear, Crisis). We require min 5 years data.",
    accent: true,
    borderColor: "border-indigo-500/30",
    labelColor: "text-indigo-400",
    labelText: "Stage 04 - Critical",
    ring: true,
    ringColor: "ring-indigo-900/40",
    critical: true,
    criticalNote: "Failure Rate: 70-80% of strategies fail here and are discarded.",
    criticalBg: "bg-red-500/10",
    criticalBorder: "border-red-500/20",
    criticalText: "text-red-200",
  },
  {
    num: "05",
    icon: Sliders,
    title: "Optimization & Robustness",
    duration: "4-8 Weeks",
    desc: "Fine-tuning parameters to ensure stability across different market regimes. Sensitivity analysis and stress testing.",
    accent: false,
    ring: false,
    critical: false,
  },
  {
    num: "06",
    icon: Play,
    title: "Forward Testing (Incubation)",
    duration: "Minimum 6 Mo",
    desc: "Live market validation with real-time data and execution simulation. The ultimate reality check.",
    accent: true,
    borderColor: "border-emerald-500/30",
    labelColor: "text-emerald-400",
    labelText: "Stage 06 - The Filter",
    ring: true,
    ringColor: "ring-emerald-900/40",
    critical: true,
    criticalNote: "Only strategies that match backtest performance within \u00b110% proceed.",
    criticalBg: "bg-indigo-500/10",
    criticalBorder: "border-indigo-500/20",
    criticalText: "text-indigo-200",
  },
  {
    num: "07",
    icon: Rocket,
    title: "Deployment & Monitoring",
    duration: "Continuous",
    desc: "Live production release. Continuous 24/7 performance monitoring, automated health checks, and periodic review.",
    accent: false,
    ring: false,
    critical: false,
    labelColor: "text-emerald-500",
  },
];

/* ── QA Standards ── */
const qaCards = [
  { icon: Code2, color: "text-indigo-500", title: "Code Quality", items: ["Peer review by senior devs", "Unit test coverage >90%"] },
  { icon: TrendingUp, color: "text-emerald-500", title: "Performance", items: ["Sharpe Ratio > 1.0", "Max Drawdown < 25%"] },
  { icon: Shield, color: "text-amber-500", title: "Risk Limits", items: ["Hard stop-loss on every trade", "Max portfolio exposure limits"] },
  { icon: Zap, color: "text-blue-500", title: "Execution", items: ["Avg execution < 500ms", "Slippage tolerance checks"] },
];

/* ── Team ── */
const teamMembers = [
  { initials: "SC", gradient: "from-indigo-500 to-purple-500", name: "Dr. Sarah Chen, PhD", role: "Lead Quantitative Researcher", bio: "MIT Applied Math \u2022 Ex-Citadel" },
  { initials: "MT", gradient: "from-blue-500 to-cyan-500", name: "Michael Torres", role: "Senior Quant Developer", bio: "Stanford CS \u2022 Low Latency Specialist" },
  { initials: "JP", gradient: "from-emerald-500 to-teal-500", name: "Jennifer Park, CFA", role: "Head of Risk Management", bio: "15 Yrs Hedge Fund Risk" },
];

/* ── Comparison ── */
const comparisonRows = [
  { aspect: "Backtesting Period", typical: "1-2 years", algo: "5-10+ years minimum" },
  { aspect: "Forward Testing", typical: "None or minimal", algo: "Minimum 6 months" },
  { aspect: "Market Conditions", typical: "Bull markets only", algo: "All conditions (Bull/Bear/Crash)" },
  { aspect: "Out-of-Sample Testing", typical: "Rarely done", algo: "Mandatory (30-40% data)" },
  { aspect: "Success Rate to Production", typical: "90%+ approved", algo: "<20% make it through" },
];

/* ── Case Study ── */
const caseSteps = [
  { num: "1", title: "Research", desc: "Identified volatility expansion during London open. Analyzing 10 years of EUR/USD data revealed statistically significant edge in range breakouts.", highlight: false },
  { num: "2", title: "Backtesting (14 Yrs)", desc: null, highlight: false, stats: [{ label: "Return", value: "18% Ann.", color: "text-emerald-400" }, { label: "Sharpe", value: "1.4", color: "text-white" }, { label: "Max DD", value: "12%", color: "text-white" }] },
  { num: "3", title: "Forward Test (6 Mo)", desc: "Paper traded March-Aug 2024. Performance matched backtest expectations.", highlight: false, stats: [{ label: "Actual Return", value: "9.2% (6mo)", color: "text-emerald-400" }] },
  { num: "4", title: "Live Deployment", desc: "Released Oct 2024. Now running on 800+ client accounts with real-time performance tracking available to partners.", highlight: true },
];

/* ── FAQ ── */
const faqs = [
  { q: "How long does it take to develop a new strategy?", a: "Typically 9-12 months from initial research to live deployment. We don\u2019t rush\u2014quality and thorough testing are non-negotiable." },
  { q: "Why do you require 6 months of forward testing?", a: "Six months provides sufficient trade samples, captures various market conditions, and reveals execution issues that backtesting cannot predict. It\u2019s the minimum time needed to validate strategy robustness." },
  { q: "Do you optimize for maximum returns?", a: "No. We optimize for risk-adjusted returns and robustness. Strategies that look amazing in backtests (Curve-fitted) but lack real-world viability are rejected." },
  { q: "Can I request a custom strategy?", a: "Enterprise partners can request custom development. Requirements and feasibility are assessed by our research team, and custom development follows the same rigorous 7-stage process." },
];

export default function StrategyDevelopmentPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#020408] text-slate-400">
      {/* ─── Hero ─── */}
      <header className="relative pt-32 pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundSize: "60px 60px", backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)" }} />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] blur-[120px] pointer-events-none opacity-20 bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/30 border border-indigo-500/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-medium text-indigo-400 tracking-wide uppercase">Quant Methodology</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1]">
                Institutional-Grade <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Algorithm Development</span>
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-xl font-light">
                Every strategy undergoes rigorous testing, validation, and optimization before reaching your clients. Our proprietary process combines quantitative research, extensive backtesting, and forward testing to deliver algorithms you can trust.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="/algorithms" className="px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                  View Our Algorithms <ArrowRight className="w-4 h-4" />
                </a>
                <button className="px-6 py-3 bg-white/5 text-white border border-white/10 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                  Schedule Technical Discussion
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                {[{ val: "5+ Years", label: "Historical Testing" }, { val: "6+ Mo", label: "Forward Testing" }, { val: "95%", label: "Success Criteria" }, { val: "24/7", label: "Optimization" }].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-mono font-medium text-white">{s.val}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Window Visual */}
            <div className="lg:w-1/2 relative">
              <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-1 relative z-10">
                <div className="bg-[#05080f] rounded-xl overflow-hidden p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <div className="text-xs font-mono text-slate-500">pipeline_validation.py</div>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="text-indigo-400">def</span> <span className="text-yellow-200">validate_strategy</span>(self):
                    </div>
                    <div className="pl-4 space-y-2 border-l border-white/5 ml-1">
                      {[
                        { label: "\u2713 Backtest: 2018-2023", value: "Passed" },
                        { label: "\u2713 Monte Carlo Simulation", value: "99.9% Conf" },
                        { label: "\u2713 Slippage Analysis", value: "< 1.2 ticks" },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center bg-emerald-900/10 p-2 rounded border border-emerald-500/10">
                          <span className="text-emerald-400">{item.label}</span>
                          <span className="text-white">{item.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center bg-blue-900/10 p-2 rounded border border-blue-500/10 animate-pulse">
                        <span className="text-blue-400">&rarr; Forward Test (Live)</span>
                        <span className="text-white">Running...</span>
                      </div>
                    </div>
                    <div className="pt-2 text-slate-500">// Waiting for 6-month validation period completion</div>
                  </div>
                  <div className="h-32 mt-6 border-t border-white/5 pt-4 flex items-end">
                    <div className="w-full bg-indigo-500/10 h-full rounded-lg relative overflow-hidden">
                      <svg viewBox="0 0 100 40" className="absolute bottom-0 w-full h-full text-indigo-500 fill-indigo-500/20 stroke-current" preserveAspectRatio="none">
                        <path d="M0 40 L0 30 C10 25 20 35 30 20 C40 5 50 15 60 10 C70 5 80 15 90 5 L100 0 L100 40 Z" strokeWidth="0.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Philosophy ─── */}
      <section className="py-24 bg-[#020408]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white mb-4">Our Development Philosophy</h2>
            <p className="text-slate-400">Quality over quantity\u2014rigorous standards over rapid releases.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {philosophyCards.map((card) => {
              const Icon = card.icon;
              const c = philoColorMap[card.color];
              return (
                <div key={card.title} className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-8 rounded-xl hover:border-white/10 transition-all group">
                  <div className={`w-12 h-12 rounded-lg ${c.bg} ${c.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-white font-medium mb-3">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{card.desc}</p>
                  <ul className="text-xs text-slate-500 space-y-2">
                    {card.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <div className={`w-1 h-1 ${c.dot} rounded-full`} /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 7-Stage Process ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020408] via-indigo-950/5 to-[#020408]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold text-white mb-2">The 7-Stage Development Process</h2>
            <p className="text-slate-400">From concept to live deployment\u2014typically 9-12 months per strategy.</p>
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {stages.map((stage, idx) => {
              const Icon = stage.icon;
              const isOdd = idx % 2 === 0;
              return (
                <div key={stage.num} className={`relative flex items-center justify-between md:justify-normal ${isOdd ? "" : "md:flex-row-reverse"} group`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#020408] shadow shrink-0 md:order-1 ${isOdd ? "md:-translate-x-1/2" : "md:translate-x-1/2"} z-10 ${stage.ring ? `ring-4 ${stage.ringColor} text-white` : stage.labelColor === "text-emerald-500" ? "text-emerald-400" : stage.accent ? "text-indigo-500" : "text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-6 rounded-xl ${stage.accent && stage.borderColor ? stage.borderColor : ""} ${stage.accent && !stage.ring ? "border-l-4" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-mono uppercase tracking-wider ${stage.labelColor || "text-slate-500"}`}>
                        {stage.labelText || `Stage ${stage.num}`}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded">{stage.duration}</span>
                    </div>
                    <h3 className="text-white font-medium mb-2">{stage.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{stage.desc}</p>
                    {stage.bullets && (
                      <div className="space-y-2">
                        {stage.bullets.map((b) => (
                          <div key={b} className="flex items-center gap-2 text-xs text-slate-500">
                            <Check className="w-3 h-3 text-indigo-500" /> {b}
                          </div>
                        ))}
                      </div>
                    )}
                    {stage.deliverable && (
                      <div className="text-xs text-slate-500">Deliverable: {stage.deliverable}</div>
                    )}
                    {stage.critical && stage.criticalNote && (
                      <div className={`${stage.criticalBg} border ${stage.criticalBorder} p-3 rounded-lg mt-2`}>
                        <p className={`text-xs ${stage.criticalText}`}>
                          <span className="font-bold">{stage.criticalNote}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── QA & Team ─── */}
      <section className="py-24 bg-[#05080f] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-semibold text-white mb-8">Quality Assurance Standards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {qaCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="bg-[#0B0E14] border border-white/5 p-5 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={`w-5 h-5 ${card.color}`} />
                        <h4 className="text-white font-medium text-sm">{card.title}</h4>
                      </div>
                      <ul className="text-xs text-slate-400 space-y-2">
                        {card.items.map((item) => (
                          <li key={item}>&bull; {item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-white mb-8">World-Class Quant Team</h2>
              <p className="text-slate-400 mb-8 text-sm">Strategies are built by experts with decades of combined experience at top hedge funds and proprietary trading firms.</p>
              <div className="space-y-4">
                {teamMembers.map((m) => (
                  <div key={m.initials} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#0B0E14]">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white font-medium text-sm`}>{m.initials}</div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{m.name}</h4>
                      <div className="text-xs text-slate-500">{m.role}</div>
                      <div className="text-[10px] text-indigo-400 mt-1 font-mono">{m.bio}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-white mb-4">The Algo FinTech Advantage</h2>
          <p className="text-slate-400">How we differ from typical algorithm providers.</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-xs text-slate-300 uppercase tracking-wider">
                <th className="p-6 border-b border-white/10 font-medium w-1/3">Aspect</th>
                <th className="p-6 border-b border-white/10 font-medium w-1/3 text-slate-500">Typical Providers</th>
                <th className="p-6 border-b border-white/10 font-medium w-1/3 text-white bg-indigo-500/10">Algo FinTech</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {comparisonRows.map((row) => (
                <tr key={row.aspect}>
                  <td className="p-6 border-b border-white/5 text-slate-300 font-medium">{row.aspect}</td>
                  <td className="p-6 border-b border-white/5 text-slate-500">{row.typical}</td>
                  <td className="p-6 border-b border-white/5 text-indigo-400 bg-indigo-500/5 font-medium">{row.algo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Case Study ─── */}
      <section className="py-24 bg-gradient-to-b from-indigo-950/20 to-[#020408] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-400 uppercase">Case Study</span>
          </div>
          <h2 className="text-3xl font-semibold text-white mb-12">Development of &ldquo;London Breakout Elite&rdquo;</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caseSteps.map((step) => (
              <div key={step.num} className="space-y-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-medium ${step.highlight ? "bg-indigo-500" : "bg-white/10"}`}>{step.num}</div>
                <h4 className="text-white font-medium">{step.title}</h4>
                {step.desc && <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>}
                {step.stats && (
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2">
                    {step.stats.map((s) => (
                      <div key={s.label} className="flex justify-between text-xs">
                        <span className="text-slate-500">{s.label}</span>
                        <span className={s.color}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-white mb-12 text-center">Common Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`bg-[#0B0E14] rounded-xl border overflow-hidden transition-all ${isOpen ? "border-indigo-500/30" : "border-white/5"}`}>
                <button className="flex justify-between items-center p-6 w-full cursor-pointer text-white font-medium text-sm select-none" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                  {faq.q}
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4 animate-[sweep_0.3s_ease-in-out]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 bg-[#05080f] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 rounded-2xl p-12 border border-indigo-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px]" />
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 relative z-10">
              Ready to Offer Institutional-Grade Algorithms?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg font-light relative z-10">
              Join agencies offering strategies developed with the rigor of billion-dollar hedge funds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <a href="/algorithms" className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                Browse Algorithms <ArrowRight className="w-4 h-4" />
              </a>
              <button className="hover:bg-white/5 transition-colors font-medium text-white bg-transparent border-white/20 border rounded-full px-8 py-4">
                Schedule a Demo
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-8 relative z-10">
              Questions about our process? Contact research@algofintech.com
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes sweep {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
