"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Palette,
  Globe,
  Mail,
  FileText,
  Server,
  Cpu,
  Shield,
  Layout,
  Smartphone,
  BookOpen,
  Check,
  ChevronDown,
  ArrowDown,
  EyeOff,
  Rocket,
  Presentation,
  FileCheck,
  LayoutTemplate,
  MailPlus,
  PieChart,
} from "lucide-react";

/* ─── FAQ ─── */
const faqs = [
  {
    q: "Will my clients ever see the AlgoFintech name?",
    a: "No. The platform is 100% white-labeled. Your clients will only see your branding, company name, and domain. There are no \"Powered by\" badges or references anywhere in the client portal, emails, or code.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes, absolutely. You provide your domain (e.g., trading.youragency.com) and we handle all the technical configuration, including SSL certificates and DNS mapping.",
  },
  {
    q: "Who owns the client data?",
    a: "You do. All client data belongs to your agency. You can export it at any time via CSV or API, and it is fully portable if you ever decide to leave.",
  },
  {
    q: "Can I operate multiple brands?",
    a: "Yes, Enterprise partners can operate multiple white-labeled brands (e.g., one for Retail, one for Institutional) on the same backend infrastructure, each with separate domains and visual identities.",
  },
];

/* ─── Customization Cards ─── */
const customCards = [
  {
    Icon: Palette,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    hoverBg: "group-hover:bg-pink-500",
    title: "Visual Identity",
    desc: "Customize logos, color schemes (primary, secondary, accent), typography, and button styles to match your brand guidelines perfectly.",
    checks: ["Custom CSS injection", "Dark/Light mode support"],
    checkColor: "text-pink-500",
  },
  {
    Icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    hoverBg: "group-hover:bg-blue-500",
    title: "Domain & URLs",
    desc: "Host the dashboard, client portal, and API endpoints on your own domains. We handle the SSL certificates and DNS mapping.",
    checks: ["Custom subdomains", "Auto-renewing SSL"],
    checkColor: "text-blue-500",
  },
  {
    Icon: Layout,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    hoverBg: "group-hover:bg-emerald-500",
    title: "Client Portal",
    desc: "A fully branded interface where your clients manage their accounts, view performance, and access support resources.",
    checks: ["Custom welcome screens", "Branded navigation"],
    checkColor: "text-emerald-500",
  },
  {
    Icon: Mail,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    hoverBg: "group-hover:bg-orange-500",
    title: "Email Communications",
    desc: "Transactional emails (welcome, password reset, trade alerts) sent from your domain using branded HTML templates.",
    checks: ["notifications@yourbrand.com", "Custom HTML templates"],
    checkColor: "text-orange-500",
  },
  {
    Icon: Smartphone,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    hoverBg: "group-hover:bg-purple-500",
    title: "Mobile Applications",
    desc: "Launch your own iOS and Android apps. Your app icon on their home screen, your name in the App Store.",
    checks: ["App Store submission handled", "Native push notifications"],
    checkColor: "text-purple-500",
  },
  {
    Icon: BookOpen,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    hoverBg: "group-hover:bg-cyan-500",
    title: "Support & Knowledge Base",
    desc: "Pre-written help articles and tutorials, rebranded for you. Save hundreds of hours writing documentation.",
    checks: ["Branded help center", "Video tutorials included"],
    checkColor: "text-cyan-500",
  },
];

/* ─── Tiers ─── */
const tiers = [
  {
    name: "Essential",
    desc: "Fast launch with core branding elements.",
    price: "Included",
    highlight: false,
    items: ["Logo & Color Palette", "Custom Domain", "Branded Emails (Basic)", "3-5 Day Setup"],
    btn: "Start Essential",
    btnClass: "border border-white/10 text-white hover:bg-white/5",
  },
  {
    name: "Advanced",
    desc: "Professional differentiation and full experience control.",
    price: "Premium",
    highlight: true,
    items: ["Everything in Essential", "Custom HTML Emails", "Custom Dashboard Layouts", "White-Label Mobile App"],
    btn: "Start Advanced",
    btnClass: "bg-purple-600 hover:bg-purple-500 text-white font-medium",
  },
  {
    name: "Enterprise",
    desc: "Bespoke integrations and multi-brand support.",
    price: "Custom",
    highlight: false,
    items: ["Completely Custom UI/UX", "Custom Algo Development", "Multiple Brands/Regions", "API Modifications"],
    btn: "Contact Sales",
    btnClass: "border border-white/10 text-white hover:bg-white/5",
  },
];

/* ─── Launch Steps ─── */
const launchSteps = [
  { day: "1", title: "Brand Discovery (Day 1-2)", desc: "Share your assets, logos, and domain. We define your configuration." },
  { day: "2", title: "Platform Configuration (Day 2-4)", desc: "Our team applies branding, sets up DNS, and configures algorithms." },
  { day: "3", title: "Review & Training (Day 5-6)", desc: "Review your staged platform. We train your team on the dashboard." },
];

/* ─── Build vs Buy ─── */
const compareRows = [
  { factor: "Time to Market", wl: "~7 Days", diy: "18-24 Months" },
  { factor: "Upfront Cost", wl: "Low Setup Fee", diy: "$500k - $2M+" },
  { factor: "Dev Team", wl: "None Needed", diy: "10-20 Engineers" },
  { factor: "Maintenance", wl: "Included", diy: "$200k+/year" },
  { factor: "Compliance", wl: "Handled", diy: "Self-Managed" },
];

export default function WhiteLabelPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#020408] selection:bg-purple-500/20 selection:text-purple-400">
      {/* ════════ Hero ════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
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
          style={{ background: "radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/30 border border-purple-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-medium text-purple-400 tracking-wide uppercase">
                  Launch in 7 Days
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-medium text-white tracking-tight mb-6 leading-[1.1]">
                Your Brand, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                  Our Technology
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-light">
                Launch a fully-branded algorithmic trading platform without
                writing a line of code. We provide the enterprise-grade engine;
                you own the brand and client relationships.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto lg:mx-0">
                {["Zero Dev Costs", "100% Your Brand", "Enterprise Tech", "Custom Domain"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {t}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="hover:bg-slate-200 transition-all shadow-lg shadow-white/10 flex gap-2 font-medium text-black bg-white rounded-lg py-3.5 px-8 items-center justify-center">
                  Schedule a Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right – Dashboard Visual */}
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-3xl -z-10" />

              <div className="relative bg-[#0B0E14] rounded-2xl border border-white/10 shadow-2xl overflow-hidden group">
                {/* Header Bar */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#0B0E14] flex items-center pl-4 border-r border-white/5 z-10 transition-all duration-700 group-hover:w-0">
                    <div className="w-6 h-6 rounded bg-slate-700 mr-2" />
                    <div className="h-2 w-20 bg-slate-700 rounded" />
                  </div>
                  <div className="absolute inset-0 bg-[#0F1218] flex items-center justify-between px-4">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded bg-gradient-to-r from-amber-400 to-orange-500 mr-2 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-black">A</span>
                      </div>
                      <span className="font-semibold text-white tracking-tight">ApexCapital</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/5" />
                      <div className="w-6 h-6 rounded-full bg-white/5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 relative">
                  <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-xs text-white pointer-events-none group-hover:opacity-0 transition-opacity">
                    Hover to Brand
                  </div>

                  <div className="grid grid-cols-3 gap-4 pb-4">
                    {/* Sidebar */}
                    <div className="hidden md:block col-span-1 rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3 group-hover:border-amber-500/20 transition-colors duration-500">
                      <div className="h-8 w-full rounded-lg bg-white/5 group-hover:bg-amber-500/20 transition-colors duration-500" />
                      <div className="h-8 w-3/4 rounded-lg bg-white/5" />
                      <div className="h-8 w-5/6 rounded-lg bg-white/5" />
                      <div className="mt-8 h-px w-full bg-white/5" />
                      <div className="h-8 w-full rounded-lg bg-white/5" />
                    </div>

                    {/* Main */}
                    <div className="col-span-3 md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 p-4">
                          <div className="text-xs text-slate-500 mb-2">Total Equity</div>
                          <div className="text-2xl font-mono text-white group-hover:text-amber-400 transition-colors">$1,240,500</div>
                        </div>
                        <div className="h-24 rounded-xl bg-white/[0.02] border border-white/5 p-4">
                          <div className="text-xs text-slate-500 mb-2">Active Clients</div>
                          <div className="text-2xl font-mono text-white group-hover:text-amber-400 transition-colors">142</div>
                        </div>
                      </div>
                      <div className="h-48 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden p-4 group-hover:border-amber-500/20 transition-colors duration-500">
                        <svg className="w-full h-full text-slate-700 group-hover:text-amber-500/50 transition-colors duration-500" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path d="M0 35 C 20 35, 20 10, 40 20 C 60 30, 60 5, 80 15 L 100 10 V 40 H 0 Z" fill="currentColor" opacity="0.2" />
                          <path d="M0 35 C 20 35, 20 10, 40 20 C 60 30, 60 5, 80 15 L 100 10" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ What is White Label? ════════ */}
      <section className="py-24 bg-[#050609]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium text-white tracking-tight mb-4">
              What Does White-Label Mean?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything your clients see carries your brand not ours. We remain
              completely invisible while powering your infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="relative pl-8 border-l-2 border-purple-500">
                <h3 className="text-xl font-medium text-white mb-4">What Clients See</h3>
                <ul className="space-y-4">
                  {[
                    { Icon: Palette, label: "Your logo, colors, and visual identity" },
                    { Icon: Globe, label: "Your custom domain (trading.youragency.com)" },
                    { Icon: Mail, label: "Emails from your support address" },
                    { Icon: FileText, label: "Your Terms of Service & Legal Docs" },
                  ].map(({ Icon, label }) => (
                    <li key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-slate-300">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative pl-8 border-l-2 border-slate-700 opacity-75 hover:opacity-100 transition-opacity">
                <h3 className="text-xl font-medium text-white mb-4">What We Provide (Invisible)</h3>
                <ul className="space-y-4">
                  {[
                    { Icon: Server, label: "Enterprise backend infrastructure" },
                    { Icon: Cpu, label: "Algorithmic execution engine" },
                    { Icon: Shield, label: "Security & maintenance updates" },
                  ].map(({ Icon, label }) => (
                    <li key={label} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-400">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/5 rounded-3xl transform rotate-3" />
              <div className="bg-[#0B0E14]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 relative z-10">
                <div className="flex flex-col gap-6">
                  {/* Surface Layer */}
                  <div className="bg-[#0F1218] border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                      <span className="text-xs text-slate-500 uppercase tracking-widest">Client Interface</span>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      </div>
                    </div>
                    <div className="text-center py-6">
                      <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded mb-2">YOUR LOGO</div>
                      <div className="text-sm text-slate-400">portal.youragency.com</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="text-slate-600 animate-bounce" />
                  </div>

                  {/* Deep Layer */}
                  <div className="bg-[#0B0E14] border border-white/5 border-dashed rounded-xl p-4 opacity-60">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                      <span className="text-xs text-slate-600 uppercase tracking-widest">Core Engine (Hidden)</span>
                      <EyeOff className="w-3 h-3 text-slate-600" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 75, 150, 200].map((d) => (
                        <div key={d} className="h-10 bg-slate-800/50 rounded animate-pulse" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Customization Cards ════════ */}
      <section className="py-24 bg-[#020408] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-purple-500 font-medium tracking-wide uppercase text-xs mb-2 block">Total Control</span>
            <h2 className="text-3xl font-medium text-white tracking-tight mb-4">Every Element Reflects Your Brand</h2>
            <p className="text-slate-400 max-w-2xl">From the favicon to the email footer, customization is comprehensive.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customCards.map((card) => (
              <div key={card.title} className="group bg-[#0B0E14]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl transition-all hover:border-white/10 hover:-translate-y-0.5">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-4 ${card.color} ${card.hoverBg} group-hover:text-white transition-all`}>
                  <card.Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{card.desc}</p>
                <ul className="text-xs text-slate-500 space-y-2">
                  {card.checks.map((c) => (
                    <li key={c} className="flex gap-2">
                      <Check className={`w-3 h-3 ${card.checkColor}`} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Customization Tiers ════════ */}
      <section className="py-24 bg-[#050609]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium text-white tracking-tight mb-4">Choose Your Customization Level</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Scalable options for agencies of all sizes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  tier.highlight
                    ? "border border-purple-500/30 bg-[#0F1218] shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)]"
                    : "border border-white/5 bg-[#0B0E14]"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-medium text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-slate-400 mb-6 h-10">{tier.desc}</p>
                <div className="text-2xl font-medium text-white mb-6">{tier.price}</div>

                <ul className="space-y-4 mb-8 flex-1">
                  {tier.items.map((item) => (
                    <li
                      key={item}
                      className={`flex items-center gap-3 text-sm ${tier.highlight ? "text-white" : "text-slate-300"}`}
                    >
                      <Check className={`w-4 h-4 ${tier.highlight ? "text-purple-500" : "text-slate-500"}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg text-sm transition-colors ${tier.btnClass}`}>
                  {tier.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Launch Process + Comparison ════════ */}
      <section className="py-24 bg-[#020408] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            {/* Left – Timeline */}
            <div className="md:w-1/2">
              <h2 className="text-3xl font-medium text-white tracking-tight mb-6">
                From Concept to Launch in 7 Days
              </h2>
              <p className="text-slate-400 mb-8">
                Our streamlined onboarding process eliminates technical friction.
                We handle the heavy lifting while you prepare your go-to-market
                strategy.
              </p>

              <div className="space-y-8 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/10" />

                {launchSteps.map((step) => (
                  <div key={step.day} className="relative flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-[#0B0E14] border border-white/20 flex items-center justify-center shrink-0 z-10 text-white text-sm font-medium">
                      {step.day}
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                ))}

                {/* Final Step */}
                <div className="relative flex gap-6">
                  <div className="w-10 h-10 rounded-full bg-purple-600 border border-purple-500 flex items-center justify-center shrink-0 z-10 text-white text-sm font-medium shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Go Live (Day 7)</h4>
                    <p className="text-xs text-slate-400">DNS cutover. Your platform is live and ready for clients.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right – Comparison Table */}
            <div className="md:w-1/2">
              <div className="bg-[#0B0E14] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-lg font-medium text-white">Why White-Label vs. In-House?</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-4 text-slate-500 font-normal">Factor</th>
                      <th className="p-4 text-purple-400 font-medium bg-purple-500/5">Algo FinTech White-Label</th>
                      <th className="p-4 text-slate-400 font-medium">Build In-House</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {compareRows.map((row) => (
                      <tr key={row.factor}>
                        <td className="p-4 text-slate-300">{row.factor}</td>
                        <td className="p-4 text-white font-medium bg-purple-500/5">{row.wl}</td>
                        <td className="p-4 text-slate-500">{row.diy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Marketing Materials ════════ */}
      <section className="py-24 bg-[#050609]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Mockup Cards */}
            <div className="order-2 lg:order-1 flex-1 grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-[#0B0E14] border border-white/5 rounded-xl p-4 -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="h-2 w-12 bg-purple-500 rounded mb-4" />
                <div className="h-4 w-3/4 bg-slate-800 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-800 rounded mb-8" />
                <div className="h-24 w-full bg-slate-800/50 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-800 rounded" />
                  <div className="h-2 w-full bg-slate-800 rounded" />
                  <div className="h-2 w-2/3 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="aspect-[3/4] bg-[#0B0E14] border border-white/5 rounded-xl p-4 rotate-3 hover:rotate-0 transition-transform duration-300 mt-8">
                <div className="h-32 w-full bg-slate-800/50 rounded mb-4 flex items-center justify-center">
                  <PieChart className="w-8 h-8 text-slate-600" />
                </div>
                <div className="h-4 w-full bg-slate-800 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-800 rounded" />
              </div>
            </div>

            {/* Text */}
            <div className="order-1 lg:order-2 flex-1">
              <h2 className="text-3xl font-medium text-white tracking-tight mb-4">Marketing Materials Included</h2>
              <p className="text-slate-400 mb-8">
                Don&apos;t just launch a platform—sell it. We provide a complete
                white-label marketing kit to help you acquire clients from day
                one.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { Icon: Presentation, title: "Sales Decks", desc: "Editable PowerPoint/Keynote slides for investor or client meetings." },
                  { Icon: FileCheck, title: "One-Pagers", desc: "Algorithm performance sheets and platform feature overviews." },
                  { Icon: LayoutTemplate, title: "Landing Pages", desc: "Conversion-optimized HTML templates ready for your copy." },
                  { Icon: MailPlus, title: "Email Sequences", desc: "Drip campaigns for onboarding and lead nurturing." },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="py-24 bg-[#020408] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-medium text-white text-center mb-10">White-Label Questions</h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-[#0B0E14] rounded-xl border overflow-hidden transition-colors ${openFaq === i ? "border-purple-500/20" : "border-white/5"}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full p-4 text-left font-medium text-white text-sm cursor-pointer hover:bg-white/5"
                >
                  {faq.q}
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Final CTA spacer ════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14] to-[#020408]" />
      </section>
    </div>
  );
}
