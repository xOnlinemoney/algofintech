"use client";

import {
  Lock,
  ArrowRight,
  Search,
  LayoutDashboard,
  Users,
  RefreshCw,
  Shield,
  Star,
} from "lucide-react";

export default function ApiDocsPage() {
  const sidebarNav = [
    {
      title: "Getting Started",
      items: ["Introduction", "Authentication", "Rate Limits", "Errors & Responses"],
    },
    {
      title: "Core Platform",
      items: ["Agency Management", "Client Accounts", "White-Label Config", "User Permissions"],
    },
    {
      title: "Trading Engine",
      items: ["Algorithms", "Strategy Operations", "Market Data", "Orders & Positions"],
    },
    {
      title: "Financials",
      items: ["Performance Reports", "Commission Tracking", "Payments & Invoicing"],
    },
    {
      title: "Developers",
      items: ["Webhooks", "SDKs & Libraries", "Changelog"],
    },
  ];

  const capabilities = [
    {
      icon: LayoutDashboard,
      color: "blue",
      title: "Custom Dashboards",
      desc: "Build tailored analytics dashboards for your agency or clients using real-time performance data.",
    },
    {
      icon: Users,
      color: "purple",
      title: "Client Portals",
      desc: "Create fully branded client portals with live trading data integrated directly into your existing website.",
    },
    {
      icon: RefreshCw,
      color: "emerald",
      title: "Automated Workflows",
      desc: "Trigger custom actions based on system events, like sending welcome emails when a new client connects.",
    },
  ];

  const techSpecs = [
    { label: "Uptime SLA", value: "99.99%" },
    { label: "Global Latency", value: "< 50ms" },
    { label: "Rate Limit", value: "10k", suffix: "req/min" },
    { label: "Support", value: "24/7 Dev" },
  ];

  const roadmap = [
    {
      quarter: "Q1 2025",
      title: "GraphQL Support",
      desc: "Single endpoint for flexible data fetching and reduced over-fetching.",
      active: true,
    },
    {
      quarter: "Q2 2025",
      title: "WebSocket Streaming",
      desc: "Real-time bidirectional communication for order updates and market data.",
      active: false,
    },
    {
      quarter: "Q3 2025",
      title: "Advanced Analytics API",
      desc: "Programmatic access to complex historical datasets and backtesting engines.",
      active: false,
    },
  ];

  const faqs = [
    {
      q: "How do I get an API Key?",
      a: "API keys are generated in your partner dashboard immediately after your partnership application is approved.",
    },
    {
      q: "Is there a Sandbox?",
      a: "Yes, all partners receive access to a fully functional sandbox environment to test integrations safely.",
    },
    {
      q: "What SDKs are available?",
      a: "We provide official SDKs for Node.js, Python, PHP, Java, and Go. The API is accessible via any HTTP client.",
    },
    {
      q: "What are the rate limits?",
      a: "Limits are tiered by partner level. Enterprise partners enjoy up to 100k requests per minute.",
    },
  ];

  return (
    <section className="relative bg-[#020408] min-h-screen pt-24 pb-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-10 xl:gap-16">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto border-r border-white/5 pr-4 bg-[#020408]/50 backdrop-blur-sm">
          {/* Search */}
          <div className="relative mb-8 group">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search docs..."
              className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
            />
            <div className="absolute right-2 top-2 border border-white/10 rounded px-1.5 py-0.5 bg-white/5 text-[10px] font-mono text-slate-500">
              ⌘K
            </div>
          </div>

          {/* Nav Groups */}
          <nav className="space-y-8">
            {sidebarNav.map((group) => (
              <div key={group.title}>
                <h5 className="text-[11px] font-semibold text-white uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                  {group.title}
                  <Lock className="w-2.5 h-2.5 text-slate-600" />
                </h5>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="block px-2 py-1.5 rounded-md text-xs hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <div className="bg-gradient-to-br from-blue-950/30 to-slate-900/50 rounded-lg p-3 border border-blue-500/10 backdrop-blur-md">
              <h6 className="text-white font-semibold text-xs mb-1">
                Developer Support
              </h6>
              <p className="text-[10px] text-slate-400 mb-2">
                Priority technical assistance for all partners.
              </p>
              <a
                href="#"
                className="text-[10px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                Contact Support{" "}
                <ArrowRight className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Hero Header */}
          <div className="mb-16 border-b border-white/5 pb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                Partner Access Required
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              API Documentation
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
              Unlock full programmatic control over the AlgoStack platform. Our
              robust REST API enables you to manage clients, execute strategies,
              and build custom white-label integrations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-white text-black hover:bg-slate-200 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] flex items-center gap-2">
                Become a Partner
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button className="px-6 py-2.5 rounded-lg text-sm font-medium text-white border border-white/10 hover:bg-white/5 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="mb-20">
            <h2 className="text-xl font-semibold text-white mb-6">
              What You Can Build
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={cap.title}
                    className="p-5 rounded-xl bg-[#0B0E14] border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-${cap.color}-500/10 flex items-center justify-center text-${cap.color}-400 mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Locked Preview Section */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Endpoint Preview
              </h2>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-mono text-slate-500">
                  System Operational
                </span>
              </div>
            </div>

            {/* Blurred Code Block */}
            <div className="relative group rounded-xl border border-white/10 overflow-hidden bg-[#0D1016]">
              {/* Lock Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0D1016]/80 backdrop-blur-[3px] transition-opacity">
                <div className="bg-[#13161C] p-6 rounded-2xl border border-white/10 shadow-2xl text-center max-w-xs mx-4 transform transition-transform group-hover:scale-105 duration-500">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1.5">
                    Developer Access Locked
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Full documentation, response schemas, and production keys are
                    exclusive to partners.
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-900/20">
                    Become a Partner
                  </button>
                </div>
              </div>

              {/* Fake Interface */}
              <div className="flex border-b border-white/5 bg-[#13161C]">
                <div className="px-4 py-2.5 text-xs text-blue-400 border-b border-blue-400 font-medium bg-white/5">
                  Authentication
                </div>
                <div className="px-4 py-2.5 text-xs text-slate-500">
                  Client Management
                </div>
                <div className="px-4 py-2.5 text-xs text-slate-500">
                  Strategies
                </div>
              </div>

              <div className="p-6 opacity-30 select-none pointer-events-none grayscale-[0.5]">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        POST
                      </span>
                      <span className="font-mono text-sm text-slate-200">
                        /api/v1/auth/token
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                      Exchange your API credentials for a secure access token.
                      Tokens are valid for 60 minutes and must be refreshed.
                    </p>

                    <h5 className="text-[10px] font-semibold text-white uppercase tracking-wider mb-3">
                      Parameters
                    </h5>
                    <div className="space-y-2 font-mono text-[11px] border-t border-white/5 pt-2">
                      {[
                        {
                          name: "client_id",
                          type: "string",
                          desc: "Your unique agency identifier",
                        },
                        {
                          name: "client_secret",
                          type: "string",
                          desc: "Your private API secret key",
                        },
                        {
                          name: "grant_type",
                          type: "string",
                          desc: 'Must be "client_credentials"',
                        },
                      ].map((param) => (
                        <div key={param.name} className="flex gap-4">
                          <span className="text-blue-300 w-24">
                            {param.name}
                          </span>
                          <span className="text-slate-500">{param.type}</span>
                          <span className="text-slate-600">{param.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-80 bg-[#0A0C10] rounded-lg border border-white/5 p-4 font-mono text-[10px] leading-5">
                    <div className="flex justify-between items-center mb-3 text-slate-500 pb-2 border-b border-white/5">
                      <span>Request Example</span>
                      <span>JSON</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-purple-400">curl</span> -X POST
                      https://api.algostack.com/v1/auth/token \
                      <br />
                      &nbsp;&nbsp;-H{" "}
                      <span className="text-green-400">
                        &quot;Content-Type: application/json&quot;
                      </span>{" "}
                      \
                      <br />
                      &nbsp;&nbsp;-d{" "}
                      <span className="text-amber-400">
                        {`'{`}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&quot;client_id&quot;:
                        &quot;agency_847291&quot;,
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&quot;client_secret&quot;:
                        &quot;sk_live_938...&quot;,
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&quot;grant_type&quot;:
                        &quot;client_credentials&quot;
                        <br />
                        &nbsp;&nbsp;{`}'`}
                      </span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="text-slate-500 mb-1">
                        Response (200 OK)
                      </div>
                      <div className="text-amber-400">
                        {`{`}
                        <br />
                        &nbsp;&nbsp;&quot;access_token&quot;:
                        &quot;eyJhbGciOiJIUz...&quot;,
                        <br />
                        &nbsp;&nbsp;&quot;token_type&quot;:
                        &quot;Bearer&quot;,
                        <br />
                        &nbsp;&nbsp;&quot;expires_in&quot;: 3600
                        <br />
                        {`}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Specs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
            {techSpecs.map((spec) => (
              <div
                key={spec.label}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  {spec.label}
                </div>
                <div className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  {spec.value}
                  {spec.suffix && (
                    <span className="text-xs font-normal text-slate-500">
                      {spec.suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Roadmap */}
          <div className="mb-20">
            <h2 className="text-xl font-semibold text-white mb-6">
              API Roadmap
            </h2>
            <div className="border-l border-white/10 ml-3 space-y-8">
              {roadmap.map((item) => (
                <div key={item.title} className="relative pl-8">
                  <div
                    className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ring-4 ring-[#020408] ${
                      item.active ? "bg-blue-500" : "bg-white/20"
                    }`}
                  />
                  <h4
                    className={`text-sm font-semibold ${
                      item.active ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {item.quarter}: {item.title}
                  </h4>
                  <p
                    className={`text-xs mt-1 ${
                      item.active ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-[#0B0E14] p-6 rounded-xl border border-white/5 relative overflow-hidden mb-20">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white"
              >
                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex gap-0.5 text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed italic">
                &quot;The API documentation is incredible. We integrated the
                entire trading engine into our custom mobile app in less than two
                weeks. The SDKs saved us months of dev time.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-2 ring-white/10 flex items-center justify-center text-white text-xs font-bold">
                  SJ
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Sarah Jenkins
                  </div>
                  <div className="text-[10px] text-slate-500">
                    CTO, Elite Trading Partners
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-xl font-semibold text-white mb-6">
              Common Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="border border-white/5 rounded-lg bg-[#0D1016] p-4 hover:bg-[#13161C] transition-colors"
                >
                  <h4 className="text-xs font-semibold text-white mb-1.5">
                    {faq.q}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-medium text-emerald-400">
                  SOC 2 Type II Certified
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10">
                <Lock className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-medium text-blue-400">
                  256-bit TLS Encryption
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500">
              Latest API Version:{" "}
              <span className="text-slate-300 font-mono">v1.2.4</span>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
