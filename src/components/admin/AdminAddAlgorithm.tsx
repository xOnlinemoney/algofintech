"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Sidebar links
const sidebarSections = [
  {
    label: null,
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
    ],
  },
  {
    label: "Agency Management",
    items: [
      { name: "All Agencies", href: "/dashboard/agencies", icon: "building-2" },
      { name: "Pending Invitations", href: "/dashboard/invitations", icon: "user-plus" },
    ],
  },
  {
    label: "Client Management",
    items: [
      { name: "All Clients", href: "/dashboard/clients", icon: "users" },
    ],
  },
  {
    label: "Algorithms",
    items: [
      { name: "Algorithm Library", href: "/dashboard/algorithms", icon: "cpu", active: true },
      { name: "Performance", href: "/dashboard/performance", icon: "line-chart" },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Revenue Overview", href: "/dashboard/revenue", icon: "wallet" },
    ],
  },
];

function generateAlgoId() {
  const d = new Date();
  const ds = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const r = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `ALGO-${ds}-${r}`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminAddAlgorithm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [algoId] = useState(generateAlgoId);

  // Form state
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [masterAccount, setMasterAccount] = useState("");
  const [assetClass, setAssetClass] = useState("Forex");
  const [tradingSymbols, setTradingSymbols] = useState("");
  const [riskProfile, setRiskProfile] = useState("Medium");
  const [timeframe, setTimeframe] = useState("1 Min (M1)");
  const [strategyType, setStrategyType] = useState("");
  const [trackingMode, setTrackingMode] = useState("automatic");
  const [totalReturn, setTotalReturn] = useState("");
  const [winRate, setWinRate] = useState("");
  const [profitFactor, setProfitFactor] = useState("");
  const [maxDrawdown, setMaxDrawdown] = useState("");
  const [globalAvailability, setGlobalAvailability] = useState(false);
  const [tierEnterprise, setTierEnterprise] = useState(false);
  const [tierPro, setTierPro] = useState(false);
  const [tierStarter, setTierStarter] = useState(false);
  const [licensingFee, setLicensingFee] = useState("");
  const [trialDays, setTrialDays] = useState("");
  const [status, setStatus] = useState("draft");
  const [deploymentNotes, setDeploymentNotes] = useState("");
  // Advanced
  const [version, setVersion] = useState("1.0.0");
  const [maxUsers, setMaxUsers] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [copyDelay, setCopyDelay] = useState("");
  const [riskDisclaimer, setRiskDisclaimer] = useState("");

  async function handleSave(asDraft: boolean) {
    if (!name.trim()) {
      alert("Algorithm name is required.");
      return;
    }
    if (!shortDescription.trim()) {
      alert("Short description is required.");
      return;
    }

    setSaving(true);
    const finalStatus = asDraft ? "draft" : status === "draft" ? "active" : status;

    const slug = `${assetClass.toLowerCase()}-${slugify(name)}`;

    const body: any = {
      name: name.trim(),
      slug,
      description: shortDescription.trim(),
      category: assetClass,
      status: finalStatus,
      risk_level: riskProfile.toLowerCase().split(" ")[0],
      image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80",
      roi: totalReturn ? `+${totalReturn}%` : "0%",
      drawdown: maxDrawdown ? `${maxDrawdown}%` : "0%",
      win_rate: winRate ? `${winRate}%` : "0%",
      info: {
        timeframe: timeframe,
        instruments: tradingSymbols || assetClass,
        strategy_type: strategyType,
        min_account: minBalance ? `$${Number(minBalance).toLocaleString()}` : "N/A",
        trades_per_month: "N/A",
        detailed_description: detailedDescription,
        master_account: masterAccount,
        tracking_mode: trackingMode,
        deployment_notes: deploymentNotes,
        version: version,
        max_users: maxUsers,
        copy_delay: copyDelay,
        risk_disclaimer: riskDisclaimer,
        trial_days: trialDays,
        licensing_fee: licensingFee,
        global_availability: globalAvailability,
        tier_enterprise: tierEnterprise,
        tier_pro: tierPro,
        tier_starter: tierStarter,
      },
      metrics: {
        total_return: totalReturn ? `+${totalReturn}%` : "0%",
        win_rate: winRate ? `${winRate}%` : "0%",
        profit_factor: profitFactor || "0",
        max_drawdown: maxDrawdown ? `${maxDrawdown}%` : "0%",
        sharpe_ratio: "0",
        avg_duration: "N/A",
      },
      equity_chart: { labels: [], data: [] },
      monthly_returns: [],
    };

    try {
      const res = await fetch("/api/admin/algorithms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to save algorithm"}${err.details ? `\n\nDetails: ${err.details}` : ""}`);
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (asDraft) {
        // Navigate to the detail page for the new draft
        router.push(`/dashboard/algorithms/${data.algorithm?.id || ""}`);
      } else {
        // Navigate back to algorithm library
        router.push("/dashboard/algorithms");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save algorithm. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden flex text-sm"
      style={{ backgroundColor: "#020408", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ─── Sidebar ─── */}
      <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex flex-col shrink-0 z-20">
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            AlgoFinTech Admin
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {sidebarSections.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">{section.label}</div>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={
                    ("active" in item && item.active)
                      ? "flex items-center gap-3 px-3 py-2 text-white bg-blue-500/10 border border-blue-500/10 rounded-lg group"
                      : "flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                  }
                >
                  <SidebarIcon name={item.icon} active={"active" in item && !!item.active} />
                  <span className={"active" in item && item.active ? "font-medium" : ""}>{item.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg>
            <span>System Settings</span>
          </Link>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="flex-1 flex flex-col bg-[#020408] overflow-hidden relative">
        {/* Header */}
        <header className="h-14 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">Dashboard</Link>
            <span className="text-slate-700">/</span>
            <Link href="/dashboard/algorithms" className="text-slate-500 hover:text-slate-300 transition-colors">Algorithms</Link>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium">New Algorithm</span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" /></svg>
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="w-full max-w-[1400px] mx-auto pt-8 px-6 pb-6 flex-1">
            {/* Header Section */}
            <div className="mb-8">
              <Link href="/dashboard/algorithms" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-medium mb-4 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                Back to Algorithm Library
              </Link>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add New Algorithm</h1>
                <p className="text-slate-400 text-sm">Create a new trading algorithm and configure its settings</p>
              </div>
            </div>

            <div className="space-y-6 pb-24">
              {/* ── Section 1: Basic Information ── */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                    <p className="text-slate-500 text-xs">Core details about your trading algorithm</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Algorithm Name <span className="text-red-500">*</span></label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value.slice(0, 50))} placeholder="e.g., Gold Scalper Pro, BTC Momentum Trader" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 transition-colors shadow-sm" />
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-slate-500">Give your algorithm a descriptive, memorable name</span>
                        <span className="text-[10px] text-slate-600">{name.length}/50</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Short Description <span className="text-red-500">*</span></label>
                      <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="e.g., High-frequency scalping strategy optimized for XAUUSD" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 transition-colors shadow-sm" />
                      <span className="block mt-1.5 text-[10px] text-slate-500">Brief one-line description (appears in algorithm cards)</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Algorithm ID</label>
                      <div className="w-full bg-[#020408]/50 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-slate-500 font-mono select-all">{algoId}</div>
                      <span className="block mt-1.5 text-[10px] text-slate-600">Auto-generated unique identifier</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Algorithm Thumbnail</label>
                      <div className="w-full h-[140px] border-2 border-dashed border-white/10 bg-[#020408] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500/30 hover:bg-white/[0.02] transition-all group">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 5h6" /><path d="M19 2v6" /><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /><circle cx="9" cy="9" r="2" /></svg>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Drop image here or click to browse</p>
                          <p className="text-[10px] text-slate-600 mt-1">JPG, PNG, WebP up to 2MB (400x300px)</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Detailed Description</label>
                      <textarea rows={4} value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} placeholder="Provide a comprehensive description of the algorithm's strategy..." className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 resize-none transition-colors shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Trading Configuration ── */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9" /><path d="M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Trading Configuration</h2>
                    <p className="text-slate-500 text-xs">Define the algorithm&apos;s trading parameters and master account</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Master Trader Algo Account <span className="text-red-500">*</span></label>
                    <select value={masterAccount} onChange={(e) => setMasterAccount(e.target.value)} className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer shadow-sm" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                      <option value="" disabled>Select an account...</option>
                      <option>MT4 - 882910 (Gold Scalper Main)</option>
                      <option>MT5 - 102938 (Aggressive Setup)</option>
                      <option>cTrader - 99281 (Safe Mode)</option>
                    </select>
                    <span className="block mt-1.5 text-[10px] text-slate-500">This account will be copy-traded by client accounts in real-time</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Asset Class <span className="text-red-500">*</span></label>
                    <select value={assetClass} onChange={(e) => setAssetClass(e.target.value)} className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer shadow-sm" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                      <option>Forex</option>
                      <option>Crypto</option>
                      <option>Stocks</option>
                      <option>Futures</option>
                      <option>Commodities</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Recommended Trading Symbols</label>
                    <input type="text" value={tradingSymbols} onChange={(e) => setTradingSymbols(e.target.value)} placeholder="e.g., XAUUSD, EURUSD" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Risk Profile <span className="text-red-500">*</span></label>
                    <select value={riskProfile} onChange={(e) => setRiskProfile(e.target.value)} className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer shadow-sm" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                      <option value="Low">Low Risk (Conservative)</option>
                      <option value="Medium">Medium Risk (Balanced)</option>
                      <option value="High">High Risk (Aggressive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Timeframe <span className="text-red-500">*</span></label>
                    <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer shadow-sm" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                      <option>1 Min (M1)</option>
                      <option>5 Min (M5)</option>
                      <option>15 Min (M15)</option>
                      <option>1 Hour (H1)</option>
                      <option>4 Hours (H4)</option>
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Strategy Type</label>
                    <input type="text" value={strategyType} onChange={(e) => setStrategyType(e.target.value)} placeholder="e.g., Trend Following, Mean Reversion, Breakout" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                  </div>
                </div>
              </div>

              {/* ── Section 3: Performance Tracking ── */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Performance Tracking Setup</h2>
                    <p className="text-slate-500 text-xs">Configure how performance will be tracked and displayed</p>
                  </div>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  <p className="text-xs text-blue-200/80 leading-relaxed">Performance metrics will be automatically calculated based on trades from the connected master account. You can also manually import historical performance data to display past results.</p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-4 rounded-xl border cursor-pointer hover:border-blue-500/50 transition-colors group ${trackingMode === "automatic" ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 bg-[#020408]"}`} onClick={() => setTrackingMode("automatic")}>
                      <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center transition-colors ${trackingMode === "automatic" ? "border-blue-500 bg-blue-500" : "border-slate-500"}`}>
                        {trackingMode === "automatic" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white mb-0.5 group-hover:text-blue-400 transition-colors">Automatic Tracking</div>
                        <div className="text-[10px] text-slate-500">Real-time sync from master account</div>
                      </div>
                    </label>
                    <label className={`relative flex items-center p-4 rounded-xl border cursor-pointer hover:border-blue-500/50 transition-colors group ${trackingMode === "import" ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 bg-[#020408]"}`} onClick={() => setTrackingMode("import")}>
                      <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center transition-colors ${trackingMode === "import" ? "border-blue-500 bg-blue-500" : "border-slate-500"}`}>
                        {trackingMode === "import" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white mb-0.5 group-hover:text-blue-400 transition-colors">Import Historical Data</div>
                        <div className="text-[10px] text-slate-500">Upload CSV with past trade history</div>
                      </div>
                    </label>
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-400 mb-3">Initial Performance Metrics (Optional Manual Entry)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Total Return (%)</label>
                        <input type="number" value={totalReturn} onChange={(e) => setTotalReturn(e.target.value)} placeholder="0.00" className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Win Rate (%)</label>
                        <input type="number" value={winRate} onChange={(e) => setWinRate(e.target.value)} placeholder="0.00" className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Profit Factor</label>
                        <input type="number" value={profitFactor} onChange={(e) => setProfitFactor(e.target.value)} placeholder="0.00" className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Max Drawdown (%)</label>
                        <input type="number" value={maxDrawdown} onChange={(e) => setMaxDrawdown(e.target.value)} placeholder="0.00" className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Availability & Pricing ── */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Availability &amp; Pricing</h2>
                    <p className="text-slate-500 text-xs">Control access and licensing fees</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#020408] border border-white/5">
                      <div>
                        <div className="text-sm font-medium text-white">Global Availability</div>
                        <div className="text-[10px] text-slate-500">Make available to all agencies</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={globalAvailability} onChange={(e) => setGlobalAvailability(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-3">Tier Restrictions</label>
                      <div className="space-y-3">
                        {[
                          { label: "Enterprise Agencies", checked: tierEnterprise, set: setTierEnterprise },
                          { label: "Pro Agencies", checked: tierPro, set: setTierPro },
                          { label: "Starter Agencies", checked: tierStarter, set: setTierStarter },
                        ].map((tier) => (
                          <label key={tier.label} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input type="checkbox" checked={tier.checked} onChange={(e) => tier.set(e.target.checked)} className="peer appearance-none w-4 h-4 border border-slate-600 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 transition-colors" />
                              <svg xmlns="http://www.w3.org/2000/svg" className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-0.5 left-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{tier.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Monthly Licensing Fee</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-500 text-sm">$</span>
                        <input type="number" value={licensingFee} onChange={(e) => setLicensingFee(e.target.value)} placeholder="0.00" className="w-full bg-[#020408] border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                      </div>
                      <span className="block mt-1.5 text-[10px] text-slate-500">Charged per agency monthly</span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Free Trial Period (Days)</label>
                      <input type="number" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} placeholder="0" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                      <span className="block mt-1.5 text-[10px] text-slate-500">0 = No trial period</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 5: Status & Deployment ── */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.1 2.75-.45 3.1 1.09" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Status &amp; Deployment</h2>
                    <p className="text-slate-500 text-xs">Set the initial status and deployment settings</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-3">Initial Algorithm Status <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {[
                        { value: "draft", label: "Draft", color: "slate-400", bg: "white/5" },
                        { value: "beta", label: "Beta Testing", color: "purple-500", bg: "purple-500/10" },
                        { value: "active", label: "Active", color: "emerald-500", bg: "emerald-500/10" },
                        { value: "paused", label: "Paused", color: "amber-500", bg: "amber-500/10" },
                      ].map((opt) => (
                        <label key={opt.value} className="relative cursor-pointer group" onClick={() => setStatus(opt.value)}>
                          <div className={`w-full p-3 rounded-lg border text-center transition-all ${status === opt.value ? `border-${opt.color} bg-${opt.bg}` : "border-white/10 bg-[#020408] group-hover:border-white/20"}`}>
                            <span className={`block text-xs font-medium ${status === opt.value ? `text-${opt.color}` : "text-slate-300"}`}>{opt.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Internal Deployment Notes</label>
                    <textarea rows={3} value={deploymentNotes} onChange={(e) => setDeploymentNotes(e.target.value)} placeholder="Notes about this deployment (internal only)..." className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 resize-none shadow-sm" />
                  </div>
                </div>
              </div>

              {/* ── Section 6: Advanced (Collapsible) ── */}
              <details className="bg-[#0B0E14] border border-white/5 rounded-xl group overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/20 border border-white/10 flex items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Advanced Configuration</h2>
                      <p className="text-slate-500 text-xs">Additional technical settings</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 transition-transform duration-300 group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="p-6 pt-0 border-t border-white/5 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Version Number</label>
                      <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Maximum Concurrent Users</label>
                      <input type="number" value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} placeholder="Unlimited" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Minimum Account Balance ($)</label>
                      <input type="number" value={minBalance} onChange={(e) => setMinBalance(e.target.value)} placeholder="0" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Copy Trading Delay (ms)</label>
                      <input type="number" value={copyDelay} onChange={(e) => setCopyDelay(e.target.value)} placeholder="0" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-sm" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Custom Risk Disclaimer</label>
                      <textarea rows={2} value={riskDisclaimer} onChange={(e) => setRiskDisclaimer(e.target.value)} placeholder="Additional risk warning shown to agencies/clients..." className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 resize-none shadow-sm" />
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* ── Sticky Footer ── */}
          <div className="sticky bottom-0 w-full border-t border-white/10 bg-[#0B0E14] p-4 z-20 mt-auto shadow-lg shadow-black/50 backdrop-blur-sm">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <Link href="/dashboard/algorithms" className="px-6 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                Cancel
              </Link>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => handleSave(true)} disabled={saving} className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors text-sm font-medium disabled:opacity-50">
                  {saving ? "Saving..." : "Save as Draft"}
                </button>
                <button type="button" onClick={() => handleSave(false)} disabled={saving} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] tracking-wide flex items-center gap-2 disabled:opacity-50">
                  {saving ? "Creating..." : "Create Algorithm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sidebar Icon Helper ───
function SidebarIcon({ name, active }: { name: string; active?: boolean }) {
  const cls = active ? "w-4 h-4 text-blue-400" : "w-4 h-4 group-hover:text-slate-300";
  switch (name) {
    case "layout-dashboard":
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
    case "building-2":
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>;
    case "user-plus":
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>;
    case "users":
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "cpu":
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="8" y="8" width="8" height="8" rx="1" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M17 2v2" /><path d="M17 20v2" /><path d="M2 17h2" /><path d="M20 17h2" /><path d="M7 2v2" /><path d="M7 20v2" /><path d="M2 7h2" /><path d="M20 7h2" /></svg>;
    case "line-chart":
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg>;
    case "wallet":
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>;
    default:
      return <div className="w-4 h-4" />;
  }
}
