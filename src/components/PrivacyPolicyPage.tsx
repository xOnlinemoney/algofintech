"use client";

import { useState } from "react";
import {
  Info,
  TrendingUp,
  Monitor,
  Lock,
  ShieldCheck,
  Server,
  ChevronDown,
} from "lucide-react";

const tocItems = [
  { id: "intro", label: "1. Introduction & Scope" },
  { id: "collection", label: "2. Information We Collect" },
  { id: "usage", label: "3. How We Use Information" },
  { id: "sharing", label: "4. Data Sharing" },
  { id: "security", label: "5. Data Security" },
  { id: "rights", label: "6. Privacy Rights" },
  { id: "retention", label: "7. Data Retention" },
  { id: "cookies", label: "8. Cookies & Tracking" },
  { id: "international", label: "9. International Transfers" },
  { id: "children", label: "10. Children\u2019s Privacy" },
  { id: "thirdparty", label: "11. Third-Party Services" },
  { id: "california", label: "12. California Rights" },
  { id: "changes", label: "13. Policy Changes" },
  { id: "contact", label: "14. Contact Us" },
];

const retentionRows = [
  {
    category: "Active Accounts",
    period: "Duration of account",
    reason: "Service provision",
  },
  {
    category: "Trading Activity",
    period: "Active + 7 Years",
    reason: "Regulatory requirement",
  },
  {
    category: "Payment Records",
    period: "7 Years",
    reason: "Tax compliance",
  },
  {
    category: "Closed Accounts",
    period: "Deleted within 90 days*",
    reason: "Except legal holds",
  },
];

const cookieTypes = [
  {
    tag: "Necessary",
    desc: "Required for security, login, and fraud prevention. Cannot be disabled.",
  },
  {
    tag: "Functional",
    desc: "Remember preferences like language and theme.",
  },
  {
    tag: "Analytics",
    desc: "Help us understand usage (Google Analytics, Mixpanel).",
  },
];

const gdprRights = [
  {
    title: "Right to Access",
    desc: "Request a copy of personal data we hold.",
  },
  {
    title: "Right to Rectification",
    desc: "Correct inaccurate personal data.",
  },
  {
    title: "Right to Erasure",
    desc: '\u201CRight to be Forgotten\u201D \u2013 delete your data.',
  },
  {
    title: "Right to Object",
    desc: "Object to processing (including marketing).",
  },
];

const ccpaRights = [
  { label: "Right to Know", desc: "Categories collected/shared." },
  { label: "Right to Delete", desc: "Request deletion." },
  { label: "Right to Correct", desc: "Fix inaccuracies." },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#020408] text-slate-400">
      {/* ─── Header ─── */}
      <header className="relative pt-32 pb-16 overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] pointer-events-none opacity-20 bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/30 border border-purple-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs font-medium text-purple-400 tracking-wide uppercase">
                Legal Documentation
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
              Privacy Policy
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="font-mono">Version 2.4</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Last Updated: December 20, 2024</span>
            </div>

            <p className="text-lg text-slate-400 max-w-3xl leading-relaxed font-light mt-2">
              At AlgoStack (operated by AlgoFintech Inc.), we take your privacy
              seriously. This Privacy Policy explains how we collect, use,
              protect, and share your personal information when you use our
              white-label algorithmic trading platform and related services. By
              using our services, you agree to the terms outlined in this
              policy.
            </p>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="relative bg-[#020408]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 pl-3">
                  Contents
                </h4>
                <nav className="space-y-0.5 border-l border-white/10">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block pl-3 py-2 text-sm text-slate-400 hover:text-white hover:border-l-2 hover:border-purple-500 border-l-2 border-transparent transition-all"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="text-white text-sm font-medium mb-2">
                    Have questions?
                  </h5>
                  <p className="text-xs text-slate-400 mb-3">
                    Our privacy team is available to help.
                  </p>
                  <a
                    href="mailto:privacy@algostack.com"
                    className="text-xs font-medium text-purple-400 hover:text-purple-300"
                  >
                    privacy@algostack.com &rarr;
                  </a>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              {/* 1. Introduction */}
              <section id="intro" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  1. Introduction and Scope
                </h2>
                <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-6 rounded-xl space-y-4 text-sm leading-7 text-slate-400">
                  <p>
                    This Privacy Policy applies to the AlgoStack platform
                    (www.algostack.com and all subdomains), agency partner
                    dashboards, client-facing portals, mobile applications,
                    APIs, and all related services.
                  </p>
                  <p>We collect personal information from:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Agency partners (businesses using our white-label
                      platform)
                    </li>
                    <li>
                      End clients (individuals trading through agency partners)
                    </li>
                    <li>Website visitors, job applicants, and vendors</li>
                  </ul>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-4">
                    <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Important Note for White-Label Partners
                    </h4>
                    <p className="text-blue-200/70 text-xs">
                      When you use AlgoStack&apos;s white-label platform under
                      your own brand, you are the{" "}
                      <strong>data controller</strong> for your clients&apos;
                      information. AlgoStack acts as a{" "}
                      <strong>data processor</strong>. You are responsible for
                      providing your own privacy policy to your clients and
                      obtaining necessary consents.
                    </p>
                  </div>

                  <p className="text-xs pt-2">
                    AlgoStack is a service provided by AlgoFintech Inc., a
                    Delaware corporation.
                  </p>
                </div>
              </section>

              {/* 2. Collection */}
              <section id="collection" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  2. Information We Collect
                </h2>
                <div className="space-y-6">
                  <div className="border-l-2 border-purple-500 pl-6">
                    <h3 className="text-lg font-medium text-white mb-3">
                      2.1 Information You Provide Directly
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>
                        <strong className="text-slate-300">
                          Account Information:
                        </strong>{" "}
                        Name, email, phone, business info, encrypted passwords,
                        payment details, and tax IDs.
                      </li>
                      <li>
                        <strong className="text-slate-300">
                          Profile &amp; Preferences:
                        </strong>{" "}
                        Settings, algorithm selections, risk parameters, and
                        notification preferences.
                      </li>
                      <li>
                        <strong className="text-slate-300">
                          Trading Connections:
                        </strong>{" "}
                        Encrypted API keys, broker identifiers, and OAuth
                        tokens.{" "}
                        <span className="text-slate-500 italic">
                          Note: We do NOT store broker passwords.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-cyan-500 pl-6">
                    <h3 className="text-lg font-medium text-white mb-3">
                      2.2 Information Collected Automatically
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>
                        <strong className="text-slate-300">Usage Data:</strong>{" "}
                        Features used, time spent, click patterns, and
                        navigation paths.
                      </li>
                      <li>
                        <strong className="text-slate-300">Device Data:</strong>{" "}
                        IP address, browser type, OS, device identifiers, and
                        ISP.
                      </li>
                      <li>
                        <strong className="text-slate-300">
                          Trading Activity:
                        </strong>{" "}
                        Execution records, strategy status, performance metrics,
                        and system logs.
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-pink-500 pl-6">
                    <h3 className="text-lg font-medium text-white mb-3">
                      2.3 Information from Third Parties
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>
                        <strong className="text-slate-300">
                          Integrated Platforms:
                        </strong>{" "}
                        Account balances and trade confirmations from
                        NinjaTrader, MT5, Schwab, etc.
                      </li>
                      <li>
                        <strong className="text-slate-300">
                          Payment Processors:
                        </strong>{" "}
                        Transaction status and billing validation.
                      </li>
                      <li>
                        <strong className="text-slate-300">
                          Data Enrichment:
                        </strong>{" "}
                        Business verification and fraud prevention data.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 3. Usage */}
              <section id="usage" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  3. How We Use Your Information
                </h2>
                <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                    <div className="p-6">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Core Services
                      </h4>
                      <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4">
                        <li>Execute algorithmic trading strategies</li>
                        <li>Connect to integrated broker platforms</li>
                        <li>
                          Monitor algorithm performance and system health
                        </li>
                      </ul>
                    </div>
                    <div className="p-6">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-500" />
                        Operations &amp; Security
                      </h4>
                      <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4">
                        <li>Process payments and calculate commissions</li>
                        <li>Detect and prevent fraudulent activity</li>
                        <li>Comply with legal and regulatory obligations</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 border-t border-white/5">
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-300">
                        Legal Basis (GDPR):
                      </strong>{" "}
                      We process data based on Contractual Necessity, Legitimate
                      Interests, Legal Obligation, and Consent.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Sharing */}
              <section id="sharing" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  4. How We Share Your Information
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  We do not sell your personal information. We share data only
                  in these circumstances:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Service Providers",
                      desc: "AWS/Google Cloud (Hosting), Stripe (Payments), SendGrid (Email), Zendesk (Support), Cloudflare (Security). Vendors are contractually obligated to protect data.",
                    },
                    {
                      title: "Trading Integrations",
                      desc: "NinjaTrader, MT5, Charles Schwab, HyperLiquid. Shared only as required for trade execution. Login credentials are never shared.",
                    },
                    {
                      title: "Agency Partners",
                      desc: "If you are an end client of a white-label partner, your data is shared with that agency. They act as your data controller.",
                    },
                    {
                      title: "Legal Requirements",
                      desc: "We disclose info if required by law, court orders, subpoenas, or to investigate fraud and protect safety.",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="p-5 rounded-lg border border-white/5 bg-[#0B0E14] hover:border-purple-500/30 transition-colors"
                    >
                      <h4 className="text-white font-medium mb-2">
                        {card.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Security */}
              <section id="security" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  5. Data Security
                </h2>
                <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-8 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full blur-2xl" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div>
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-emerald-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="text-white font-medium mb-2">
                        Encryption
                      </h4>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>TLS 1.3 for Data in Transit</li>
                        <li>AES-256 for Data at Rest</li>
                        <li>End-to-End API Encryption</li>
                      </ul>
                    </div>
                    <div>
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h4 className="text-white font-medium mb-2">
                        Access Control
                      </h4>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>Multi-Factor Authentication (MFA)</li>
                        <li>Role-Based Access (RBAC)</li>
                        <li>Regular Security Audits</li>
                      </ul>
                    </div>
                    <div>
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-emerald-400">
                        <Server className="w-5 h-5" />
                      </div>
                      <h4 className="text-white font-medium mb-2">
                        Compliance
                      </h4>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>Annual SOC 2 Type II Audits</li>
                        <li>Regular Penetration Testing</li>
                        <li>24/7 Threat Monitoring</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 text-xs text-slate-500">
                    <strong>Breach Response:</strong> In the event of a breach,
                    we will investigate immediately and notify affected
                    individuals within 72 hours as required by GDPR.
                  </div>
                </div>
              </section>

              {/* 6. Rights */}
              <section id="rights" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  6. Your Privacy Rights
                </h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
                      GDPR (EEA, UK, Switzerland)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gdprRights.map((r) => (
                        <div
                          key={r.title}
                          className="bg-[#0B0E14] p-4 rounded border border-white/5 text-sm text-slate-400"
                        >
                          <strong className="text-white block mb-1">
                            {r.title}
                          </strong>
                          {r.desc}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-2">
                      How to Exercise Your Rights
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      You can manage most settings in your account dashboard.
                      For formal requests:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="mailto:privacy@algostack.com"
                        className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-slate-200 transition-colors"
                      >
                        Email privacy@algostack.com
                      </a>
                      <span className="px-4 py-2 border border-white/10 text-white text-sm font-medium rounded bg-white/5">
                        Write to: AlgoFintech Inc, [Address]
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                      We verify identity before processing. Response times: 30
                      days (GDPR) or 45 days (CCPA).
                    </p>
                  </div>
                </div>
              </section>

              {/* 7. Retention */}
              <section id="retention" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  7. Data Retention
                </h2>
                <div className="overflow-hidden border border-white/5 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white">
                      <tr>
                        <th className="p-4 font-medium">Data Category</th>
                        <th className="p-4 font-medium">Retention Period</th>
                        <th className="p-4 font-medium hidden sm:table-cell">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-400 bg-[#0B0E14]">
                      {retentionRows.map((row) => (
                        <tr key={row.category}>
                          <td className="p-4">{row.category}</td>
                          <td className="p-4 text-white">{row.period}</td>
                          <td className="p-4 hidden sm:table-cell">
                            {row.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  *Backup copies are overwritten during normal cycles (30-90
                  days). Legal holds override standard retention.
                </p>
              </section>

              {/* 8. Cookies */}
              <section id="cookies" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  8. Cookies and Tracking
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  We use cookies to provide, maintain, and improve our
                  services. You can manage preferences via the Cookie Banner or
                  your browser.
                </p>
                <ul className="space-y-3 mb-4">
                  {cookieTypes.map((c) => (
                    <li
                      key={c.tag}
                      className="flex items-start gap-3 text-sm text-slate-400"
                    >
                      <span className="bg-white/10 px-2 py-0.5 rounded text-white text-xs font-mono shrink-0">
                        {c.tag}
                      </span>
                      {c.desc}
                    </li>
                  ))}
                </ul>
                <div className="text-sm text-slate-400">
                  We honor &ldquo;Do Not Track&rdquo; signals for non-essential
                  cookies.
                </div>
              </section>

              {/* 9. International */}
              <section id="international" className="mb-16 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  AlgoStack operates globally. Your data may be processed in
                  the US, EU, or APAC. For transfers from EEA/UK to countries
                  without adequacy decisions, we rely on:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-400">
                  <li>Standard Contractual Clauses (SCCs)</li>
                  <li>UK International Data Transfer Agreements (IDTA)</li>
                  <li>Technical safeguards including encryption</li>
                </ul>
              </section>

              {/* 10 & 11 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <section id="children" className="scroll-mt-24">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    10. Children&apos;s Privacy
                  </h2>
                  <p className="text-sm text-slate-400">
                    Our services are not intended for individuals under 18. We
                    do not knowingly collect data from children. If discovered,
                    we delete such data immediately. Contact us if you believe
                    a child has provided us with information.
                  </p>
                </section>
                <section id="thirdparty" className="scroll-mt-24">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    11. Third-Party Services
                  </h2>
                  <p className="text-sm text-slate-400">
                    We link to third-party services (brokers, payment
                    processors). We are not responsible for their privacy
                    practices. Review their policies before connecting your
                    accounts.
                  </p>
                </section>
              </div>

              {/* 12. California */}
              <section id="california" className="mb-16 scroll-mt-24">
                <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    12. California Privacy Rights (CCPA/CPRA)
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">
                    Residents of California have specific rights:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400 mb-6">
                    {ccpaRights.map((r) => (
                      <li
                        key={r.label}
                        className="flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        <span>
                          <strong>{r.label}:</strong> {r.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm text-slate-400">
                    <p className="mb-2">
                      <strong>Sale of Data:</strong> We do NOT sell personal
                      information as defined by CCPA.
                    </p>
                    <p>
                      <strong>Shine the Light:</strong> We do not share data
                      for third-party direct marketing.
                    </p>
                  </div>
                </div>
              </section>

              {/* 13. Changes */}
              <section id="changes" className="mb-12 scroll-mt-24">
                <h2 className="text-xl font-semibold text-white mb-4">
                  13. Changes to This Policy
                </h2>
                <p className="text-sm text-slate-400">
                  We may update this policy. Material changes will be notified
                  via email (30 days prior) or prominent website notice.
                  Continued use implies acceptance.
                </p>
              </section>

              {/* 14. Contact */}
              <section id="contact" className="scroll-mt-24">
                <h2 className="text-2xl font-semibold text-white mb-6">
                  14. Contact Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-6 rounded-xl">
                    <h4 className="text-white font-medium mb-1">
                      Privacy Team
                    </h4>
                    <a
                      href="mailto:privacy@algostack.com"
                      className="text-purple-400 text-sm hover:underline"
                    >
                      privacy@algostack.com
                    </a>
                    <p className="text-xs text-slate-500 mt-2">
                      For rights requests and data concerns.
                    </p>
                  </div>
                  <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-6 rounded-xl">
                    <h4 className="text-white font-medium mb-1">
                      Mailing Address
                    </h4>
                    <p className="text-sm text-slate-400">
                      AlgoFintech Inc.
                      <br />
                      Attn: Privacy Team
                      <br />
                      [Street Address]
                      <br />
                      [City, State ZIP]
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-sm text-slate-500">
                  <p className="mb-2">
                    <strong>Regulatory Authorities:</strong>
                  </p>
                  <p>
                    EU Users: Contact your local Data Protection Authority.
                  </p>
                  <p>
                    UK Users: Information Commissioner&apos;s Office (ICO).
                  </p>
                </div>
              </section>

              <section className="mt-12 text-xs text-slate-600">
                <h4 className="font-medium text-slate-500 mb-2">
                  Automated Decision Making &amp; DPIAs
                </h4>
                <p>
                  We use automated systems for fraud detection and security. We
                  conduct Data Protection Impact Assessments (DPIAs) for
                  high-risk processing. Contact us for details.
                </p>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
