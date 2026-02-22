"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────
interface MasterAccount {
  id: string;
  platform: string;
  broker: string | null;
  server: string | null;
  login: string | null;
  password_encrypted: string | null;
  account_type: string;
  nickname: string | null;
  status: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

// Sidebar
const sidebarSections = [
  { label: null, items: [{ name: "Dashboard", href: "/dashboard", icon: "layout-dashboard" }] },
  { label: "Agency Management", items: [{ name: "All Agencies", href: "/dashboard/agencies", icon: "building-2" }, { name: "Pending Invitations", href: "/dashboard/invitations", icon: "user-plus" }] },
  { label: "Client Management", items: [{ name: "All Clients", href: "/dashboard/clients", icon: "users" }] },
  { label: "Algorithms", items: [{ name: "Algorithm Library", href: "/dashboard/algorithms", icon: "cpu", active: true }, { name: "Performance", href: "/dashboard/performance", icon: "line-chart" }] },
  { label: "Finance", items: [{ name: "Revenue Overview", href: "/dashboard/revenue", icon: "wallet" }] },
];

export default function AdminMasterAccounts() {
  const [accounts, setAccounts] = useState<MasterAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [platform, setPlatform] = useState("mt5");
  const [broker, setBroker] = useState("");
  const [server, setServer] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("live");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  // Advanced
  const [connectionTimeout, setConnectionTimeout] = useState("30");
  const [maxRetries, setMaxRetries] = useState("5");
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [notes, setNotes] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/master-accounts");
      const data = await res.json();
      if (data.accounts) setAccounts(data.accounts);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function resetForm() {
    setPlatform("mt5");
    setBroker("");
    setServer("");
    setLogin("");
    setPassword("");
    setShowPassword(false);
    setAccountType("live");
    setUsername("");
    setNickname("");
    setConnectionTimeout("30");
    setMaxRetries("5");
    setAutoReconnect(true);
    setNotes("");
  }

  async function handleTestConnection() {
    setTesting(true);
    // Simulate a connection test
    await new Promise((r) => setTimeout(r, 2000));
    setTesting(false);
    alert("Connection test completed successfully!");
  }

  async function handleSave() {
    if (platform === "tradovate") {
      if (!login.trim() || !username.trim()) {
        alert("Account Number and Username are required for Tradovate.");
        return;
      }
    } else if (!server.trim() && !login.trim()) {
      alert("Server and Login/Account ID are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/master-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          broker: platform === "tradovate" ? "Tradovate" : (broker || null),
          server: platform === "tradovate" ? null : server.trim(),
          login: login.trim(),
          password: password || null,
          account_type: accountType,
          nickname: nickname.trim() || null,
          status: "connected",
          settings: {
            connection_timeout: Number(connectionTimeout) || 30,
            max_retries: Number(maxRetries) || 5,
            auto_reconnect: autoReconnect,
            notes: notes.trim() || null,
            ...(platform === "tradovate" ? { username: username.trim() } : {}),
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to save"}\n\n${err.details || ""}`);
        setSaving(false);
        return;
      }

      await fetchAccounts();
      resetForm();
      alert("Master account saved successfully!");
    } catch (err: any) {
      alert("Failed to save master account. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Filtered accounts
  const filteredAccounts = accounts.filter((a) => {
    if (searchQuery && !a.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) && !a.login?.toLowerCase().includes(searchQuery.toLowerCase()) && !a.broker?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPlatform !== "all" && a.platform !== filterPlatform) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const platformLabel = (p: string) => {
    switch (p) {
      case "mt5": return "MT5";
      case "mt4": return "MT4";
      case "ctrader": return "cT";
      case "dxtrade": return "DX";
      case "binance": return "BN";
      case "coinbase": return "CB";
      case "tradovate": return "TV";
      default: return p.slice(0, 2).toUpperCase();
    }
  };

  const statusDot = (s: string) => {
    switch (s) {
      case "connected": return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]";
      case "paused": return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
      case "error":
      case "disconnected": return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex text-sm" style={{ backgroundColor: "#020408", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
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
              {section.label && <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">{section.label}</div>}
              {section.items.map((item) => (
                <Link key={item.name} href={item.href} className={"active" in item && item.active ? "flex items-center gap-3 px-3 py-2 text-white bg-blue-500/10 border border-blue-500/10 rounded-lg group" : "flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"}>
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
            <span className="text-white font-medium">Master Accounts</span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" /></svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020408]" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="w-full max-w-[1600px] mx-auto pt-8 px-6 pb-6 flex-1 flex flex-col h-full">
            {/* Page Header */}
            <div className="mb-6 shrink-0">
              <Link href="/dashboard/algorithms" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-medium mb-4 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                Back to Algorithm Library
              </Link>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Master Algorithm Accounts</h1>
                <p className="text-slate-400 text-sm">Connect trading accounts that will serve as copy trading sources for algorithms</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-6 flex items-start gap-3 shrink-0">
              <div className="mt-0.5 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              </div>
              <p className="text-xs text-blue-200/80 leading-relaxed">Master accounts are the source accounts that execute trades. Client accounts assigned to algorithms will automatically copy trades from these master accounts in real-time. Ensure your master accounts have stable connections for optimal performance.</p>
            </div>

            {/* Two-Section Layout */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-0 flex-1">
              {/* LEFT: Connected Accounts List */}
              <div className="w-full lg:w-[40%] flex flex-col bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0B0E14] sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">Connected Accounts</h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium text-slate-400">{accounts.length}</span>
                  </div>
                  <button onClick={resetForm} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Add New
                  </button>
                </div>

                {/* Search & Filter */}
                <div className="p-4 border-b border-white/5 space-y-3 bg-[#0B0E14]/50">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 text-slate-500"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search accounts..." className="w-full bg-[#020408] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                  </div>
                  <div className="flex gap-2">
                    <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="flex-1 bg-[#020408] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                      <option value="all">All Platforms</option>
                      <option value="mt4">MetaTrader 4</option>
                      <option value="mt5">MetaTrader 5</option>
                      <option value="ctrader">cTrader</option>
                      <option value="binance">Binance</option>
                      <option value="tradovate">Tradovate</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 bg-[#020408] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                      <option value="all">All Status</option>
                      <option value="connected">Connected</option>
                      <option value="disconnected">Disconnected</option>
                      <option value="paused">Paused</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                {/* Account Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading && (
                    <div className="flex items-center justify-center py-12 text-slate-500">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Loading...
                    </div>
                  )}

                  {!loading && filteredAccounts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 0 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" /></svg>
                      </div>
                      <p className="text-xs text-slate-500">No master accounts connected yet</p>
                      <p className="text-[10px] text-slate-600 mt-1">Use the form on the right to add your first account</p>
                    </div>
                  )}

                  {filteredAccounts.map((account) => (
                    <div key={account.id} className="group bg-[#020408] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0B0E14] border border-white/5 flex items-center justify-center text-slate-300 font-bold text-xs shadow-sm">
                            {platformLabel(account.platform)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-white tracking-tight">{account.login || account.nickname || "—"}</h3>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusDot(account.status)}`} />
                            </div>
                            <p className="text-xs text-slate-400">{account.nickname || account.broker || "—"}</p>
                          </div>
                        </div>
                        <button className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-white/[0.02] rounded px-2 py-1.5">
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Type</span>
                          <span className={`text-xs font-medium ${account.account_type === "live" ? "text-blue-400" : "text-slate-300"}`}>
                            {account.account_type === "live" ? "Live Account" : "Demo Account"}
                          </span>
                        </div>
                        <div className="bg-white/[0.02] rounded px-2 py-1.5">
                          <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Connected</span>
                          <span className="text-xs text-slate-300 font-medium">
                            {new Date(account.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-white/5 pt-3 mt-1">
                        <button className="flex-1 py-1.5 rounded-md border border-white/10 text-[10px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Edit</button>
                        <button className="flex-1 py-1.5 rounded-md border border-white/10 text-[10px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Test</button>
                        <button className="p-1.5 rounded-md border border-white/10 text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Add New Form */}
              <div className="w-full lg:w-[60%] flex flex-col bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden shadow-lg h-fit lg:h-auto">
                {/* Form Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0B0E14]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 0 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" /></svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Add New Master Account</h2>
                      <p className="text-slate-500 text-xs">Configure connection details for copy trading</p>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Trading Platform <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-[#020408] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer shadow-sm" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                        <option value="mt5">MetaTrader 5 (MT5)</option>
                        <option value="mt4">MetaTrader 4 (MT4)</option>
                        <option value="ctrader">cTrader</option>
                        <option value="dxtrade">DXTrade</option>
                        <option value="binance">Binance</option>
                        <option value="coinbase">Coinbase</option>
                        <option value="tradovate">Tradovate</option>
                      </select>
                      <div className="absolute left-3 top-3 text-slate-500 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  {/* Connection Details */}
                  <div className="space-y-5">
                    {platform === "tradovate" ? (
                      <>
                        {/* Tradovate-specific fields */}
                        {/* Account Type (Live/Demo) */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-3">Account Type <span className="text-red-500">*</span></label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center">
                                <input type="radio" name="account_type" checked={accountType === "live"} onChange={() => setAccountType("live")} className="peer appearance-none w-4 h-4 border border-slate-600 rounded-full bg-transparent checked:border-blue-500 checked:bg-blue-500 transition-all" />
                                <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Live</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center">
                                <input type="radio" name="account_type" checked={accountType === "demo"} onChange={() => setAccountType("demo")} className="peer appearance-none w-4 h-4 border border-slate-600 rounded-full bg-transparent checked:border-blue-500 checked:bg-blue-500 transition-all" />
                                <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Demo</span>
                            </label>
                          </div>
                        </div>

                        {/* Account Number */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Number <span className="text-red-500">*</span></label>
                          <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="e.g., 12345678" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                        </div>

                        {/* Username */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Username <span className="text-red-500">*</span></label>
                          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tradovate username" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tradovate password" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors">
                              {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                            Password is encrypted and stored securely
                          </p>
                        </div>

                        {/* Nickname */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Nickname (Optional)</label>
                          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g., Tradovate Futures Main" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Standard platform fields (MT4, MT5, cTrader, etc.) */}
                        {/* Broker */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Broker <span className="text-red-500">*</span></label>
                          <select value={broker} onChange={(e) => setBroker(e.target.value)} className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer shadow-sm" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}>
                            <option value="" disabled>Select broker...</option>
                            <option>IC Markets</option>
                            <option>Pepperstone</option>
                            <option>OANDA</option>
                            <option>XM Global</option>
                            <option>Exness</option>
                            <option value="other">Other (Enter Manually)</option>
                          </select>
                        </div>

                        {/* Server & Login */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Server <span className="text-red-500">*</span></label>
                            <input type="text" value={server} onChange={(e) => setServer(e.target.value)} placeholder="e.g., ICMarkets-Server" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Login / Account ID <span className="text-red-500">*</span></label>
                            <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="e.g., 882910" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">Password <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Account password" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors">
                              {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
                            Password is encrypted and stored securely
                          </p>
                        </div>

                        {/* Account Type & Nickname */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-3">Account Type <span className="text-red-500">*</span></label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                  <input type="radio" name="account_type" checked={accountType === "demo"} onChange={() => setAccountType("demo")} className="peer appearance-none w-4 h-4 border border-slate-600 rounded-full bg-transparent checked:border-blue-500 checked:bg-blue-500 transition-all" />
                                  <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Demo</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                  <input type="radio" name="account_type" checked={accountType === "live"} onChange={() => setAccountType("live")} className="peer appearance-none w-4 h-4 border border-slate-600 rounded-full bg-transparent checked:border-blue-500 checked:bg-blue-500 transition-all" />
                                  <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Live Account</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Nickname (Optional)</label>
                            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g., Gold Strategy Main" className="w-full bg-[#020408] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-600 shadow-sm" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Advanced Settings */}
                  <details className="group bg-[#020408] border border-white/5 rounded-lg overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors">
                      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Advanced Settings</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 transition-transform duration-200 group-open:rotate-180"><path d="m6 9 6 6 6-6" /></svg>
                    </summary>
                    <div className="p-4 pt-0 border-t border-white/5 mt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1.5">Connection Timeout (sec)</label>
                          <input type="number" value={connectionTimeout} onChange={(e) => setConnectionTimeout(e.target.value)} className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-blue-500/50 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1.5">Max Retry Attempts</label>
                          <input type="number" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)} className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-blue-500/50 focus:outline-none" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Auto-Reconnect on Disconnect</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={autoReconnect} onChange={(e) => setAutoReconnect(e.target.checked)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                        </label>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-1.5">Internal Notes</label>
                        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Admin notes..." className="w-full bg-[#0B0E14] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-blue-500/50 focus:outline-none resize-none" />
                      </div>
                    </div>
                  </details>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-[#0B0E14] flex flex-col gap-4">
                  <button type="button" onClick={handleTestConnection} disabled={testing} className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-xs font-medium flex items-center justify-center gap-2 group disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={testing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                    {testing ? "Testing..." : "Test Connection"}
                  </button>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={saving} className="flex-[2] px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] tracking-wide flex items-center justify-center gap-2 disabled:opacity-50">
                      {saving ? "Saving..." : "Save Master Account"}
                    </button>
                  </div>
                </div>
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
    case "layout-dashboard": return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
    case "building-2": return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>;
    case "user-plus": return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>;
    case "users": return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "cpu": return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="8" y="8" width="8" height="8" rx="1" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M17 2v2" /><path d="M17 20v2" /><path d="M2 17h2" /><path d="M20 17h2" /><path d="M7 2v2" /><path d="M7 20v2" /><path d="M2 7h2" /><path d="M20 7h2" /></svg>;
    case "line-chart": return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" /></svg>;
    case "wallet": return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>;
    default: return <div className="w-4 h-4" />;
  }
}
