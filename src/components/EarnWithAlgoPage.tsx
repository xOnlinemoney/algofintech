"use client";

import { useState } from "react";
import {
  ArrowRight,
  Wallet,
  Server,
  ShieldCheck,
  Mail,
  ChevronDown,
  Link as LinkIcon,
  Check,
  Flag,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function EarnWithAlgoPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    firm_name: "",
    strategy_name: "",
    asset_class: "",
    strategy_type: "",
    description: "",
    video_url: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");

    if (!form.full_name || !form.email || !form.strategy_name || !form.asset_class || !form.strategy_type || !form.description) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      setError("Please accept the certification checkbox.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-algorithm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="bg-[#020408] text-slate-400 antialiased">
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-4">Algorithm Submitted!</h1>
            <p className="text-slate-400 mb-2">
              Thank you for submitting your strategy. Our evaluation team will review your submission and reach out within 48 hours.
            </p>
            <p className="text-sm text-slate-500">Check your email at <span className="text-white">{form.email}</span> for a confirmation.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#020408] text-slate-400 antialiased">
      {/* ─── Hero ─── */}
      <header className="relative pt-32 pb-16 overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          }}
        />
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
              <div className="space-y-10">
                {/* Section 1: Developer Profile */}
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
                    <InputField label="Full Name" placeholder="John Doe" value={form.full_name} onChange={(v) => update("full_name", v)} required />
                    <InputField label="Email Address" type="email" placeholder="john@example.com" value={form.email} onChange={(v) => update("email", v)} required />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Our evaluation team will use this number to get in touch with you regarding your submission.
                      </p>
                    </div>
                    <InputField label="Firm / Team Name (Optional)" placeholder="e.g. AlphaQuant LLC" value={form.firm_name} onChange={(v) => update("firm_name", v)} />
                  </div>
                </div>

                {/* Section 2: Strategy Details */}
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      2. Strategy Details
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Provide an overview of your algorithm&apos;s mechanics and target market.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-300">Strategy Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Mean Reversion FX Alpha"
                        value={form.strategy_name}
                        onChange={(e) => update("strategy_name", e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>

                    <SelectField
                      label="Primary Asset Class"
                      placeholder="Select asset class..."
                      value={form.asset_class}
                      onChange={(v) => update("asset_class", v)}
                      options={["Equities", "Forex (FX)", "Cryptocurrency", "Commodities", "Multi-Asset / Mixed"]}
                      required
                    />
                    <SelectField
                      label="Strategy Type"
                      placeholder="Select strategy type..."
                      value={form.strategy_type}
                      onChange={(v) => update("strategy_type", v)}
                      options={["Trend Following", "Mean Reversion", "Arbitrage / StatArb", "Momentum", "High Frequency / Market Making", "Other"]}
                      required
                    />

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium text-slate-300">Description &amp; Edge <span className="text-red-400">*</span></label>
                      <textarea
                        rows={4}
                        placeholder="Briefly describe the core logic, execution frequency, and what gives this strategy its statistical edge..."
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Video Walkthrough Link */}
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      3. Video Walkthrough
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Share a link to a video demonstrating your algorithm, including backtesting and live results.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Video Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://www.loom.com/share/... or Google Drive, Jumpshare, etc."
                        value={form.video_url}
                        onChange={(e) => update("video_url", e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Supported platforms: Loom, Google Drive, Jumpshare, Dropbox, YouTube (unlisted), or any shareable video link.
                    </p>
                  </div>
                </div>

                {/* Checkbox & Submit */}
                <div className="pt-6 border-t border-white/5 space-y-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-[#0B0E14] checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-1 focus:ring-offset-[#020408]"
                      />
                      <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    <span className="text-xs text-slate-400 leading-relaxed select-none group-hover:text-slate-300 transition-colors">
                      I certify that I am the original creator of this algorithm
                      or have the legal right to submit it. I understand that
                      submitting this form initiates an evaluation process under
                      AlgoFintech&apos;s{" "}
                      <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        Non-Disclosure Agreement (NDA)
                      </a>
                      .
                    </span>
                  </label>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Algorithm
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
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
                  <PipelineStep num={1} title="Initial Review" desc="Video walkthrough & metrics analysis." active />
                  <PipelineStep num={2} title="Stress Testing" desc="Walk-forward & Monte Carlo runs." />
                  <PipelineStep num={3} title="Incubation" desc="3-6 months paper/live testing." />
                  <PipelineStep num={4} title="Live Marketplace" desc="Available to institutional clients." isFinal />
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-900/10 to-transparent border border-indigo-500/10">
                <p className="text-sm text-slate-400 mb-3">Have questions before submitting?</p>
                <a
                  href="mailto:devrelations@algofintech.com"
                  className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4" />
                  devrelations@algofintech.com
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
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
        >
          <option value="" disabled className="text-slate-600">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
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
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
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
          <div className={`w-2 h-2 rounded-full ${active ? "bg-indigo-500" : "bg-white/20"}`} />
        )}
      </div>
      <div>
        <h4 className={`text-sm font-medium ${active ? "text-white" : "text-slate-300"}`}>
          {num}. {title}
        </h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}
