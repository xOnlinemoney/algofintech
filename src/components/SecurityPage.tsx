"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Activity,
  FileCheck,
  Globe,
  Server,
  Code2,
  Key,
  Network,
  Eye,
  ShieldOff,
  Landmark,
  Scale,
  Ban,
  Check,
  CheckCircle2,
  UserCheck,
  Building2,
  FileSearch,
  Database,
  UserX,
  ArrowLeftRight,
  FileText,
  Clock,
  ServerCrash,
  ExternalLink,
  ChevronDown,
  Download,
  Settings,
  Siren,
} from "lucide-react";

/* ─── FAQ Data ─── */
const faqs = [
  {
    q: "Can AlgoFintech withdraw my clients' funds?",
    a: "No. We have zero ability to access, withdraw, or transfer client funds. Funds remain with regulated brokers and clients maintain complete control at all times.",
  },
  {
    q: "Who performs KYC on the clients?",
    a: "KYC is performed entirely by the broker or platform where funds are held (e.g., Charles Schwab, NinjaTrader brokerage partners). This ensures full regulatory compliance without AlgoFintech holding sensitive personal documents.",
  },
  {
    q: "Is my data encrypted?",
    a: "Yes. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Encryption keys are managed securely using Hardware Security Modules (HSMs).",
  },
  {
    q: "What happens if there's a data breach?",
    a: "We have comprehensive incident response procedures, will notify affected parties within 72 hours per GDPR requirements, and take immediate remediation steps.",
  },
  {
    q: "Can clients disconnect at any time?",
    a: "Absolutely. Clients can revoke API access and disconnect from AlgoFintech at any time via their broker's dashboard or our platform settings.",
  },
];

/* ─── Security Architecture Cards ─── */
const archCards = [
  {
    icon: <Server className="w-6 h-6 text-blue-500" />,
    bg: "bg-blue-500/10",
    color: "text-blue-500",
    title: "Infrastructure Security",
    desc: "Our platform runs on hardened infrastructure with multiple layers of protection against cyber threats.",
    items: [
      "Enterprise-grade cloud (AWS/GCP)",
      "Redundant data centers",
      "DDoS protection & filtering",
    ],
  },
  {
    icon: <Lock className="w-6 h-6 text-emerald-500" />,
    bg: "bg-emerald-500/10",
    color: "text-emerald-500",
    title: "Data Encryption",
    desc: "All data is encrypted using military-grade encryption both in storage and during transmission.",
    items: [
      "AES-256 encryption at rest",
      "TLS 1.3 encryption in transit",
      "Hardware Security Modules (HSM)",
    ],
  },
  {
    icon: <Code2 className="w-6 h-6 text-purple-500" />,
    bg: "bg-purple-500/10",
    color: "text-purple-500",
    title: "Application Security",
    desc: "Our development practices follow OWASP top 10 guidelines and undergo continuous security testing.",
    items: [
      "Regular penetration testing",
      "Automated vulnerability scanning",
      "Web Application Firewall (WAF)",
    ],
  },
  {
    icon: <Key className="w-6 h-6 text-amber-500" />,
    bg: "bg-amber-500/10",
    color: "text-amber-500",
    title: "Access Control",
    desc: "Granular access controls ensure only authorized users can access sensitive data and functions.",
    items: [
      "Multi-factor authentication (MFA)",
      "Role-based access control (RBAC)",
      "IP whitelisting capabilities",
    ],
  },
  {
    icon: <Network className="w-6 h-6 text-cyan-500" />,
    bg: "bg-cyan-500/10",
    color: "text-cyan-500",
    title: "Network Security",
    desc: "Network-level security prevents unauthorized access and detects suspicious activity in real-time.",
    items: [
      "Isolated VPC segments",
      "Intrusion Detection Systems (IDS)",
      "Secure VPN for admins",
    ],
  },
  {
    icon: <Eye className="w-6 h-6 text-rose-500" />,
    bg: "bg-rose-500/10",
    color: "text-rose-500",
    title: "Monitoring & Response",
    desc: "Continuous monitoring and rapid response capabilities protect against emerging threats.",
    items: [
      "24/7 Security Operations Center",
      "Real-time threat detection",
      "Comprehensive audit logging",
    ],
  },
];

export default function SecurityPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#020408] selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ════════ Hero ════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundSize: "40px 40px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(16,185,129,0.1) 0%, transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-500/20 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
              Bank-Level Security Standard
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
            Enterprise-Grade <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-white">
              Security &amp; Compliance
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Built with institutional-level security standards and designed to
            meet global regulatory requirements. Your clients&apos; security is
            our top priority.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { Icon: Lock, label: "Bank-Level Encryption" },
              { Icon: Activity, label: "99.9% Uptime SLA" },
              { Icon: FileCheck, label: "SOC 2 Type II Certified" },
              { Icon: Globe, label: "GDPR Compliant" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B0E14] border border-white/5"
              >
                <Icon className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-300">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Security Architecture ════════ */}
      <section className="py-24 bg-[#050609] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Comprehensive Security Architecture
            </h2>
            <p className="text-slate-400">
              Multiple layers of protection safeguarding your agency and client
              data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archCards.map((card) => (
              <div
                key={card.title}
                className="bg-[#0B0E14] border border-white/5 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/15"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-6`}
                >
                  {card.icon}
                </div>
                <h3 className="text-lg font-medium text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {card.desc}
                </p>
                <ul className="space-y-2">
                  {card.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <Check className={`w-3 h-3 ${card.color}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Fund Security ════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#020408]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(16,185,129,0.1) 0%, transparent 70%)" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-emerald-500 font-medium tracking-wide uppercase text-xs mb-2 block">
              Non-Custodial Architecture
            </span>
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Your Clients&apos; Funds Are Always Protected
            </h2>
            <p className="text-slate-400">
              We never have access to client funds — complete separation of
              technology and capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* We Cannot Withdraw */}
            <div className="bg-[#0B0E14] border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ban className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                  <ShieldOff className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  We Cannot Withdraw
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  AlgoFintech operates purely as a technology provider. We
                  integrate with trading platforms but have no ability to
                  withdraw, transfer, or access client funds.
                </p>
                <ul className="space-y-3">
                  {["Read-only account info access", "No withdrawal capabilities"].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Funds Stay With Brokers */}
            <div className="bg-[#0B0E14] border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                  <Landmark className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Funds Stay With Brokers
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Client funds are held directly at regulated financial
                  institutions like Charles Schwab or NinjaTrader. These
                  institutions maintain full custody and oversight.
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {["Charles Schwab (SIPC)", "NinjaTrader", "Interactive Brokers"].map((b) => (
                    <span
                      key={b}
                      className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded text-slate-300"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Regulated Partners */}
            <div className="bg-[#0B0E14] border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                  <Scale className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Regulated Partners
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  All our broker integrations are with entities that maintain
                  proper regulatory licenses. Your clients benefit from
                  institutional regulatory oversight.
                </p>
                <ul className="space-y-3">
                  {[
                    "SEC (Stocks)",
                    "CFTC / NFA (Futures & Forex)",
                    "FinCEN (AML Compliance)",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-purple-500" />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ KYC & Compliance ════════ */}
      <section className="py-24 bg-[#050609] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/20 border border-blue-500/20 mb-6">
                <span className="text-xs font-medium text-blue-400 tracking-wide uppercase">
                  Compliance &amp; Identity
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-6">
                KYC &amp; Anti-Money Laundering
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                We implement comprehensive safeguards to ensure ecosystem
                integrity while respecting the regulatory roles of our broker
                partners.
              </p>

              <div className="space-y-8">
                {[
                  {
                    Icon: UserCheck,
                    color: "text-emerald-500",
                    title: "Client KYC by Brokers",
                    desc: "Identity verification (KYC) is handled entirely by the custodial broker (e.g., Schwab). We do not collect sensitive ID documents from your clients.",
                  },
                  {
                    Icon: Building2,
                    color: "text-blue-500",
                    title: "Agency Partner Verification",
                    desc: "We conduct thorough due diligence on all agency partners, including business registration checks and regulatory status confirmation.",
                  },
                  {
                    Icon: FileSearch,
                    color: "text-amber-500",
                    title: "AML Monitoring",
                    desc: "Automated systems monitor for suspicious patterns, sanctions screening (OFAC), and unusual activity flagging.",
                  },
                ].map(({ Icon, color, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0B0E14] border border-white/10 flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">{title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column – GDPR Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-3xl blur-2xl" />
              <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-8 relative">
                <h3 className="text-xl font-medium text-white mb-6">
                  Data Privacy &amp; GDPR
                </h3>

                <div className="space-y-4">
                  {[
                    { Icon: Database, label: "Data Minimization" },
                    { Icon: UserX, label: "Right to Erasure" },
                    { Icon: ArrowLeftRight, label: "Data Portability" },
                    { Icon: FileText, label: "Processing Agreements (DPA)" },
                  ].map(({ Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#020408] border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300">{label}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <p className="text-xs text-slate-500 text-center">
                    We collect only data necessary to provide services. No
                    excessive data collection or storage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Certifications ════════ */}
      <section className="py-24 bg-[#020408]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Independently Verified
            </h2>
            <p className="text-slate-400">
              Industry-leading certifications and standards
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "SOC2", name: "SOC 2 Type II", status: "Certified", ring: "border-blue-500/20", text: "text-blue-500", bg: "bg-blue-500/10", size: "text-xl font-bold" },
              { label: "ISO", name: "ISO 27001", status: "Compliant", ring: "border-white/10", text: "text-white", bg: "bg-white/5", size: "text-sm font-bold" },
              { label: "GDPR", name: "GDPR", status: "Compliant", ring: "border-white/10", text: "text-white", bg: "bg-white/5", size: "text-xs font-bold" },
              { label: "CCPA", name: "CCPA", status: "Compliant", ring: "border-white/10", text: "text-white", bg: "bg-white/5", size: "text-xs font-bold" },
            ].map((cert) => (
              <div
                key={cert.name}
                className="p-6 rounded-2xl bg-[#0B0E14] border border-white/5 flex flex-col items-center justify-center text-center hover:border-blue-500/30 transition-colors group"
              >
                <div
                  className={`w-16 h-16 rounded-full ${cert.bg} flex items-center justify-center mb-4 ${cert.text} group-hover:scale-110 transition-transform ${cert.size} border-2 ${cert.ring}`}
                >
                  {cert.label}
                </div>
                <h3 className="text-white font-medium mb-1">{cert.name}</h3>
                <p className="text-xs text-slate-500">{cert.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Secure Integration Models ════════ */}
      <section className="py-24 bg-[#050609] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-12">
            Secure Integration Models
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NinjaTrader */}
            <IntegrationCard
              badge="NT"
              badgeBg="bg-white"
              badgeText="text-black"
              name="NinjaTrader Integration"
              rows={[
                { Icon: Key, color: "text-blue-500", title: "Authentication", desc: "OAuth 2.0 or secure API Key. No password storage." },
                { Icon: ShieldCheck, color: "text-emerald-500", title: "Permissions Scope", desc: <>Read Market Data, Place Orders. <span className="text-red-400">Withdrawals Disabled.</span></> },
              ]}
            />
            {/* Schwab */}
            <IntegrationCard
              badge="CS"
              badgeBg="bg-blue-600"
              badgeText="text-white"
              name="Charles Schwab Integration"
              rows={[
                { Icon: Key, color: "text-blue-500", title: "Authentication", desc: "OAuth 2.0 per Schwab API standards." },
                { Icon: ShieldCheck, color: "text-emerald-500", title: "Regulatory Adherence", desc: "SEC-compliant API usage. Client data handled per Schwab privacy policies." },
              ]}
            />
            {/* MT5 */}
            <IntegrationCard
              badge="MT5"
              badgeBg="bg-white border border-white/20"
              badgeText="text-black"
              name="MetaTrader 5 Integration"
              rows={[
                { Icon: Lock, color: "text-blue-500", title: "Connection", desc: "Encrypted connection to MT5 servers via Expert Advisor (EA)." },
                { Icon: ShieldCheck, color: "text-emerald-500", title: "Fund Safety", desc: "Broker maintains total fund custody. EA has no withdrawal rights." },
              ]}
            />
            {/* HyperLiquid */}
            <IntegrationCard
              badge="HL"
              badgeBg="bg-gradient-to-br from-indigo-500 to-purple-500"
              badgeText="text-white"
              name="HyperLiquid Integration"
              rows={[
                { Icon: Code2, color: "text-blue-500", title: "DeFi Security", desc: "On-chain transaction transparency. Client signs critical transactions." },
                { Icon: ShieldCheck, color: "text-emerald-500", title: "Non-Custodial", desc: "Smart contract architecture prevents any fund access." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ════════ Incident Response ════════ */}
      <section className="py-24 bg-[#020408]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0B0E14] border border-white/10 rounded-2xl p-8 lg:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Siren className="w-48 h-48 text-white" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">
                  Incident Response &amp; Business Continuity
                </h2>
                <p className="text-slate-400 mb-8">
                  We are prepared for any scenario with comprehensive plans for
                  detection, response, and recovery.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-900/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">
                        Rapid Response SLA
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Critical incidents assessed within 15 minutes by our
                        24/7 SOC team.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-900/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <ServerCrash className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">
                        Disaster Recovery
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Multi-region redundancy with RTO &lt; 4 hours and RPO
                        &lt; 1 hour.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Status */}
              <div className="bg-[#020408] rounded-xl border border-white/5 p-6">
                <h3 className="text-sm font-medium text-white mb-4">
                  Live Security Status
                </h3>
                <div className="space-y-4">
                  {["API Gateway", "Order Execution", "Market Data Feeds"].map(
                    (svc) => (
                      <div
                        key={svc}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-slate-400">{svc}</span>
                        <span className="text-emerald-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Operational
                        </span>
                      </div>
                    )
                  )}
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <a
                      href="#"
                      className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      View Full Status Page{" "}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="py-24 bg-[#050609] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-10 text-center">
            Security Questions Answered
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-[#0B0E14] rounded-xl border overflow-hidden transition-colors ${openFaq === i ? "border-white/10" : "border-white/5"}`}
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

      {/* ════════ Final CTA ════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14] to-[#020408]" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Security You Can Trust, Compliance You Can Verify
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Join 500+ agencies who trust AlgoFintech with their algorithmic
              trading technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Prospective Partners */}
            <div className="p-8 rounded-2xl bg-[#020408] border border-white/10 hover:border-emerald-500/30 transition-all text-center">
              <h3 className="text-lg font-medium text-white mb-4">
                For Prospective Partners
              </h3>
              <ul className="space-y-2 mb-8 text-left max-w-xs mx-auto">
                {[
                  "Speak with our security team",
                  "Review certifications",
                  "Discuss compliance needs",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-slate-400"
                  >
                    <Check className="w-3 h-3 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-500/20">
                Book Security Call
              </button>
              <p className="text-[10px] text-slate-500 mt-4">
                security@algofintech.com
              </p>
            </div>

            {/* Current Partners */}
            <div className="p-8 rounded-2xl bg-[#020408] border border-white/10 hover:border-white/20 transition-all text-center">
              <h3 className="text-lg font-medium text-white mb-4">
                For Current Partners
              </h3>
              <ul className="space-y-2 mb-8 text-left max-w-xs mx-auto">
                {[
                  { Icon: Download, text: "Download SOC 2 reports" },
                  { Icon: Download, text: "Access compliance docs" },
                  { Icon: Settings, text: "Configure security settings" },
                ].map(({ Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-2 text-xs text-slate-400"
                  >
                    <Icon className="w-3 h-3 text-slate-500" />
                    {text}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium text-sm transition-all">
                Partner Portal Login
              </button>
              <p className="text-[10px] text-slate-500 mt-4">
                compliance@algofintech.com
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-600 max-w-2xl mx-auto border-t border-white/5 pt-6">
              Disclaimer: AlgoFintech provides technology solutions. Each agency
              is responsible for obtaining appropriate licenses and registrations
              for their jurisdiction and activities. We provide tools to help you
              maintain compliance, but cannot provide legal or regulatory advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Helper: Integration Card ─── */
function IntegrationCard({
  badge,
  badgeBg,
  badgeText,
  name,
  rows,
}: {
  badge: string;
  badgeBg: string;
  badgeText: string;
  name: string;
  rows: { Icon: React.ElementType; color: string; title: string; desc: React.ReactNode }[];
}) {
  return (
    <div className="border border-white/10 rounded-2xl p-6 bg-[#0B0E14]">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 ${badgeBg} rounded-lg flex items-center justify-center ${badgeText} font-bold text-xs`}
        >
          {badge}
        </div>
        <h3 className="text-lg font-medium text-white">{name}</h3>
      </div>
      <div className="space-y-4">
        {rows.map(({ Icon, color, title, desc }) => (
          <div key={title} className="flex gap-3 items-start">
            <Icon className={`w-4 h-4 ${color} mt-0.5 shrink-0`} />
            <div>
              <p className="text-sm text-white font-medium">{title}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
