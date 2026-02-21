import {
  Palette,
  Banknote,
  LayoutDashboard,
  Megaphone,
  Users,
  GraduationCap,
  Activity,
  Globe,
  ShieldCheck,
  Zap,
  Smartphone,
  Server,
  Code2,
  Rss,
  Scaling,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  return (
    <section className="relative bg-[#020408] border-y border-white/5 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-20 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* Hero Subsection */}
      <div className="border-white/5 border-b pt-20 px-6 pb-32 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            For Modern Agencies
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
            Everything Your Agency Needs to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Offer Algorithmic Trading
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete white-label platform designed for agencies to deliver
            professional, automated trading solutions to their clients under
            their own brand.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button className="px-8 py-4 bg-white text-[#020408] rounded-full font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
              Schedule a Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-semibold hover:bg-white/10 transition-all">
              View Pricing Models
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto rounded-xl border border-white/10 shadow-2xl bg-[#0B0E14] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80"
              alt="Platform Dashboard"
              className="w-full h-auto opacity-90"
            />
            {/* Floating Stats Badge */}
            <div className="absolute bottom-8 right-8 bg-[#0B0E14]/90 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="text-emerald-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Client Returns
                  </p>
                  <p className="text-lg font-semibold text-white">
                    +24.8%{" "}
                    <span className="text-xs font-normal text-slate-500">
                      avg. YTD
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Stats */}
        <div className="max-w-6xl mx-auto mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-12">
          {[
            { value: "500+", label: "Agency Partners" },
            { value: "$2B+", label: "Assets Managed" },
            { value: "99.9%", label: "Platform Uptime" },
            { value: "30+", label: "Proven Strategies" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section A: For Agencies */}
      <div className="py-24 px-6 border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm">
              Partnership Benefits
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold text-white mt-3 tracking-tight">
              Built for Agency Success
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Palette className="text-blue-400 w-6 h-6" />,
                iconBg: "bg-blue-500/10",
                title: "Your Brand, Our Tech",
                description:
                  "Fully white-label platform. Customize logos, colors, and domains to maintain your brand identity while we handle the backend.",
              },
              {
                icon: <Banknote className="text-emerald-400 w-6 h-6" />,
                iconBg: "bg-emerald-500/10",
                title: "Lucrative Revenue Share",
                description:
                  "Earn competitive commissions on every client. Transparent tracking and automated payouts ensure you're rewarded for growth.",
              },
              {
                icon: <LayoutDashboard className="text-purple-400 w-6 h-6" />,
                iconBg: "bg-purple-500/10",
                title: "Agency Dashboard",
                description:
                  "Manage all clients from one centralized portal. Track performance, monitor commissions, and oversee accounts in real-time.",
              },
              {
                icon: <Megaphone className="text-orange-400 w-6 h-6" />,
                iconBg: "bg-orange-500/10",
                title: "Marketing Support",
                description:
                  "Access professional marketing materials, pitch decks, and sales collateral to help you close deals faster.",
              },
              {
                icon: <Users className="text-pink-400 w-6 h-6" />,
                iconBg: "bg-pink-500/10",
                title: "Streamlined Onboarding",
                description: "Get your clients trading in minutes.",
              },
              {
                icon: <GraduationCap className="text-indigo-400 w-6 h-6" />,
                iconBg: "bg-indigo-500/10",
                title: "Support",
                description:
                  "Dedicated partner support to ensure your team is ready to sell and serve.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section B: For Clients */}
      <div className="py-24 px-6 bg-[#05080e]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">
                Platform Capabilities
              </span>
              <h2 className="text-3xl md:text-5xl font-semibold text-white mt-3 tracking-tight">
                Features Your Clients Will Love
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Large Card */}
            <div className="lg:col-span-2 row-span-2 p-8 rounded-3xl bg-[#0B0E14] border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                  <Activity className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Vetted Algorithm Library
                </h3>
                <p className="text-slate-400 mb-8 max-w-sm">
                  Access 30+ professionally developed strategies. Every
                  algorithm is rigorously backtested and forward-tested.
                </p>
                <div className="rounded-xl border border-white/10 bg-[#020408]/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                    <span className="text-sm text-white font-medium">
                      Alpha Prime Strategy
                    </span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                      +124.5%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[75%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smaller Feature Cards */}
            {[
              {
                icon: <Globe className="text-indigo-400 w-6 h-6" />,
                title: "Multi-Asset Trading",
                description:
                  "Forex, Crypto, Stocks, and Futures from one account.",
              },
              {
                icon: <ShieldCheck className="text-emerald-400 w-6 h-6" />,
                title: "Risk Management",
                description:
                  "Built-in stop losses, position sizing, and equity protection.",
              },
              {
                icon: <Zap className="text-yellow-400 w-6 h-6" />,
                title: "Automated Execution",
                description:
                  "24/7 trading without human intervention. Never miss a trade.",
              },
              {
                icon: <Smartphone className="text-purple-400 w-6 h-6" />,
                title: "Mobile Access",
                description:
                  "Monitor performance and manage settings from any device.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-3xl bg-[#0B0E14] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section C: Technology */}
      <div className="py-24 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Enterprise-Grade Infrastructure
            </h2>
            <p className="text-slate-400">
              Built on a stack that scales with your agency.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Server className="text-blue-400 w-5 h-5" />,
                title: "99.9% Uptime",
                description:
                  "Redundant systems ensure uninterrupted trading operations.",
              },
              {
                icon: <Code2 className="text-indigo-400 w-5 h-5" />,
                title: "Robust API",
                description:
                  "Developer-friendly endpoints for custom integrations.",
              },
              {
                icon: <Rss className="text-purple-400 w-5 h-5" />,
                title: "Real-Time Data",
                description:
                  "Low-latency institutional feeds for optimal execution.",
              },
              {
                icon: <Scaling className="text-emerald-400 w-5 h-5" />,
                title: "Auto-Scaling",
                description:
                  "Infrastructure that grows effortlessly from 10 to 10k clients.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  {feature.icon}
                </div>
                <h4 className="text-white font-medium mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="overflow-hidden mt-5 mb-5 pt-24 px-6 pb-24 relative">
        <div className="absolute inset-0 bg-blue-600/5 -z-10" />
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl border border-white/10 bg-[#0B0E14] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />

          <h2 className="md:text-5xl text-3xl font-semibold text-white tracking-tight mb-6">
            Ready to Transform Your Trading Company?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
            Join hundreds of companies offering algorithmic trading to their
            clients. Get started with our white-label solution today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
