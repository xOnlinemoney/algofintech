"use client";

import {
  ArrowRight,
  Wallet,
  Server,
  ShieldCheck,
  Mail,
  ChevronDown,
  Upload,
  Video,
  Check,
  Flag,
} from "lucide-react";

export default function EarnWithAlgoPage() {
  return (
    <main className="bg-[#020408] text-slate-400 antialiased">
      {/* ─── Hero ─── */}
      <header className="relative pt-32 pb-16 overflow-hidden border-b border-white/5">
        {/* Grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          }}
        />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] blur-[120px] pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] mb-6">
            Submit Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              Algorithm
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
            Partner with us to scale your trading strategy. Get access to
            institutional capital, zero-latency infrastructure, and a generous
            revenue-sharing model.
          </p>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ── Left: Form ── */}
            <div className="lg:col-span-2 space-y-8">
              <form className="space-y-10">
                {/* Section 1 */}
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      1. Developer Profile
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Tell us about yourself or your quantitative team.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField label="Full Name" placeholder="John Doe" />
                    <InputField
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                    />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Our evaluation team will use this number to get in touch
                        with you regarding your submission.
                      </p>
                    </div>
                    <InputField
                      label="Firm / Team Name (Optional)"
                      placeholder="e.g. AlphaQuant LLC"
                    />
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      2. Strategy Details
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Provide an overview of your algorithm&apos;s mechanics and
                      target market.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-300">
                        Strategy Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mean Reversion FX Alpha"
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>

                    <SelectField
                      label="Primary Asset Class"
                      placeholder="Select asset class..."
                      options={[
                        "Equities",
                        "Forex (FX)",
                        "Cryptocurrency",
                        "Commodities",
                        "Multi-Asset / Mixed",
                      ]}
                    />
                    <SelectField
                      label="Strategy Type"
                      placeholder="Select strategy type..."
                      options={[
                        "Trend Following",
                        "Mean Reversion",
                        "Arbitrage / StatArb",
                        "Momentum",
                        "High Frequency / Market Making",
                        "Other",
                      ]}
                    />

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-300">
                        Description &amp; Edge
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Briefly describe the core logic, execution frequency, and what gives this strategy its statistical edge..."
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      3. Video Walkthrough
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload a video demonstrating your algorithm, including
                      backtesting and live results.
                    </p>
                  </div>

                  <label className="block w-full cursor-pointer group">
                    <div className="w-full border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-xl p-8 transition-all bg-[#0B0E14] hover:bg-[#0B0E14]/80 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-indigo-500/10 flex items-center justify-center mx-auto transition-colors">
                        <Video className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          MP4, MOV, or WebM (Max. 500MB)
                        </p>
                      </div>
                    </div>
                    <input type="file" accept="video/*" className="hidden" />
                  </label>
                </div>

                {/* Checkbox & Submit */}
                <div className="pt-6 border-t border-white/5 space-y-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-[#0B0E14] checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-1 focus:ring-offset-[#020408]"
                      />
                      <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    <span className="text-xs text-slate-400 leading-relaxed select-none group-hover:text-slate-300 transition-colors">
                      I certify that I am the original creator of this algorithm
                      or have the legal right to submit it. I understand that
                      submitting this form initiates an evaluation process under
                      AlgoFintech&apos;s{" "}
                      <a
                        href="#"
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Non-Disclosure Agreement (NDA)
                      </a>
                      .
                    </span>
                  </label>

                  <button
                    type="button"
                    className="w-full sm:w-auto px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Submit Algorithm
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* ── Right: Sidebar ── */}
            <div className="lg:col-span-1 space-y-6">
              {/* Why Partner */}
              <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white tracking-tight mb-6">
                  Why Partner With Us?
                </h3>

                <div className="space-y-6">
                  <SidebarItem
                    icon={<Wallet className="w-5 h-5 text-emerald-400" />}
                    iconBg="bg-emerald-500/10"
                    title="70/30 Revenue Share"
                    desc="Keep the lion's share of performance and management fees generated by your algorithm on our network."
                  />
                  <SidebarItem
                    icon={<Server className="w-5 h-5 text-blue-400" />}
                    iconBg="bg-blue-500/10"
                    title="Zero-Latency Infra"
                    desc="We provide the VPS, FIX API connections, and raw market data needed to execute perfectly."
                  />
                  <SidebarItem
                    icon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
                    iconBg="bg-indigo-500/10"
                    title="IP Protection"
                    desc="Your source code remains strictly confidential. We deploy the compiled logic within secure enclaves."
                  />
                </div>
              </div>

              {/* Evaluation Pipeline */}
              <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white tracking-tight mb-6">
                  Evaluation Pipeline
                </h3>

                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-px before:-translate-x-px before:bg-gradient-to-b before:from-white/10 before:to-transparent">
                  <PipelineStep
                    num={1}
                    title="Initial Review"
                    desc="Video walkthrough & metrics analysis."
                    active
                  />
                  <PipelineStep
                    num={2}
                    title="Stress Testing"
                    desc="Walk-forward & Monte Carlo runs."
                  />
                  <PipelineStep
                    num={3}
                    title="Incubation"
                    desc="3-6 months paper/live testing."
                  />
                  <PipelineStep
                    num={4}
                    title="Live Marketplace"
                    desc="Available to institutional clients."
                    isFinal
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/10 to-transparent border border-indigo-500/10">
                <p className="text-sm text-slate-400 mb-3">
                  Have questions before submitting?
                </p>
                <a
                  href="mailto:devrelations@algostack.com"
                  className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  devrelations@algostack.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ─── Sub-components ─── */

function InputField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  options,
}: {
  label: string;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <div className="relative">
        <select
          defaultValue=""
          className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
        >
          <option value="" disabled className="text-slate-600">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt.toLowerCase().replace(/\s+/g, "_")}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  iconBg,
  title,
  desc,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PipelineStep({
  num,
  title,
  desc,
  active = false,
  isFinal = false,
}: {
  num: number;
  title: string;
  desc: string;
  active?: boolean;
  isFinal?: boolean;
}) {
  return (
    <div className="relative flex items-start gap-4">
      <div
        className={`w-6 h-6 rounded-full bg-[#020408] border ${
          active ? "border-indigo-500" : "border-white/10"
        } flex items-center justify-center shrink-0 z-10 mt-0.5`}
      >
        {isFinal ? (
          <Flag className="w-2.5 h-2.5 text-white/50" />
        ) : (
          <div
            className={`w-2 h-2 rounded-full ${
              active ? "bg-indigo-500" : "bg-white/20"
            }`}
          />
        )}
      </div>
      <div>
        <h4
          className={`text-sm font-medium ${
            active ? "text-white" : "text-slate-300"
          }`}
        >
          {num}. {title}
        </h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}
