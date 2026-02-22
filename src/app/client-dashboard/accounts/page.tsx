"use client";

import { useState, useEffect } from "react";
import {
  Link as LinkIcon,
  Wallet,
  Zap,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
type AccountAlgo = {
  name: string;
  status: string;
};

type AccountData = {
  id: string;
  platform: string;
  platform_short: string;
  platform_color: string;
  platform_text_color: string;
  account_number: string;
  account_mask: string;
  account_label: string;
  account_type: string;
  currency: string;
  status: string;
  balance: number;
  equity: number;
  free_margin: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  weekly_pnl: number;
  weekly_pnl_pct: number;
  open_trades: number;
  connected_at: string;
  algos: AccountAlgo[];
};

type SummaryData = {
  total_accounts: number;
  combined_balance: number;
  total_daily_pnl: number;
  active_count: number;
  total_count: number;
};

type PageData = {
  summary: SummaryData;
  accounts: AccountData[];
};

// ─── Empty default for new clients ──────────────────────
const EMPTY_DATA: PageData = {
  summary: {
    total_accounts: 0,
    combined_balance: 0,
    total_daily_pnl: 0,
    active_count: 0,
    total_count: 0,
  },
  accounts: [],
};

// ─── Helpers ─────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCurrencySymbol(c: string) {
  const map: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    USDT: "₮",
    BTC: "₿",
  };
  return map[c] || "$";
}

// ─── Connect Modal ───────────────────────────────────────
const PLATFORMS = [
  {
    id: "mt5",
    name: "MetaTrader 5",
    short: "MT5",
    color: "#262626",
    textColor: "#ffffff",
    desc: "Forex, CFDs, Indices",
    available: true,
  },
  {
    id: "mt4",
    name: "MetaTrader 4",
    short: "MT4",
    color: "#262626",
    textColor: "#ffffff",
    desc: "Forex, CFDs",
    available: true,
  },
  {
    id: "binance",
    name: "Binance",
    short: "BN",
    color: "#FCD535",
    textColor: "#000000",
    desc: "Crypto Spot & Futures",
    available: true,
  },
  {
    id: "coinbase",
    name: "Coinbase",
    short: "CB",
    color: "#0052FF",
    textColor: "#ffffff",
    desc: "Coming Soon",
    available: false,
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    short: "IB",
    color: "#1e293b",
    textColor: "#ffffff",
    desc: "Stocks, Futures",
    available: true,
  },
];

// Map platform IDs to their full names for the API
const PLATFORM_NAMES: Record<string, string> = {
  mt5: "MetaTrader 5",
  mt4: "MetaTrader 4",
  binance: "Binance",
  coinbase: "Coinbase",
  ibkr: "Interactive Brokers",
};

function ConnectModal({
  open,
  onClose,
  onAccountAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}) {
  const [view, setView] = useState<"selection" | string>("selection");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [broker, setBroker] = useState("OANDA");
  const [loginId, setLoginId] = useState("");
  const [server, setServer] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [apiToken, setApiToken] = useState("");

  if (!open) return null;

  function resetForm() {
    setView("selection");
    setBroker("OANDA");
    setLoginId("");
    setServer("");
    setPassword("");
    setApiKey("");
    setSecretKey("");
    setAccountId("");
    setApiToken("");
    setError("");
  }

  async function handleConnect() {
    setConnecting(true);
    setError("");

    try {
      // Get client_id from session
      const sessionStr = localStorage.getItem("client_session");
      if (!sessionStr) {
        setError("Not logged in. Please log in again.");
        setConnecting(false);
        return;
      }
      const session = JSON.parse(sessionStr);
      const clientDisplayId = session.client_id;

      if (!clientDisplayId) {
        setError("Client ID not found in session.");
        setConnecting(false);
        return;
      }

      // Build the request body based on platform
      const platformName = PLATFORM_NAMES[view] || view;
      let accountNumber = "";
      let accountType = "Live";
      let username = "";
      let pwd = "";

      if (view === "mt5" || view === "mt4") {
        if (!loginId.trim()) { setError("Login ID is required."); setConnecting(false); return; }
        accountNumber = loginId.trim();
        accountType = "Live";
        username = loginId.trim();
        pwd = password;
      } else if (view === "binance") {
        if (!apiKey.trim()) { setError("API Key is required."); setConnecting(false); return; }
        accountNumber = apiKey.trim().slice(-8) || apiKey.trim();
        accountType = "Spot Trading";
        username = apiKey.trim();
        pwd = secretKey;
      } else if (view === "ibkr") {
        if (!accountId.trim()) { setError("Account ID is required."); setConnecting(false); return; }
        accountNumber = accountId.trim();
        accountType = "Live";
        username = accountId.trim();
        pwd = apiToken;
      }

      const res = await fetch("/api/client-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_display_id: clientDisplayId,
          platform: platformName,
          account_type: accountType,
          account_number: accountNumber,
          username,
          password: pwd,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to connect account.");
        setConnecting(false);
        return;
      }

      // Success — refresh the accounts list
      resetForm();
      onClose();
      onAccountAdded();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setConnecting(false);
    }
  }

  const selectedPlatform = PLATFORMS.find((p) => p.id === view);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl mx-4 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {view === "selection" ? (
          /* Platform Selection */
          <div
            className="p-8"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Connect New Trading Account
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Choose your trading platform to get started
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLATFORMS.map((plat) => (
                <button
                  key={plat.id}
                  onClick={() => plat.available && setView(plat.id)}
                  className={`group relative flex flex-col items-center p-6 bg-[#0B0E14] border border-white/5 rounded-xl transition-all duration-300 ${
                    plat.available
                      ? "hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: plat.color }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: plat.textColor }}
                    >
                      {plat.short}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {plat.name}
                  </h3>
                  <p className="text-[10px] text-slate-500">{plat.desc}</p>
                  {plat.available && (
                    <span className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Connection Form */
          <div>
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-[#131313]">
              <button
                onClick={() => setView("selection")}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="font-medium text-white">
                Connect {selectedPlatform?.name || "Account"}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* MT form fields */}
              {(view === "mt5" || view === "mt4") && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Broker Name
                    </label>
                    <div className="relative">
                      <select
                        value={broker}
                        onChange={(e) => setBroker(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                      >
                        <option>OANDA</option>
                        <option>IC Markets</option>
                        <option>Pepperstone</option>
                        <option>Exness</option>
                        <option value="other">Other...</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Login ID
                      </label>
                      <input
                        type="text"
                        placeholder="12345678"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Server
                      </label>
                      <input
                        type="text"
                        placeholder="Broker-Server-Live"
                        value={server}
                        onChange={(e) => setServer(e.target.value)}
                        className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-blue-200">
                      Your credentials are encrypted locally before being
                      transmitted. We only use them to execute trades and read
                      balances.
                    </p>
                  </div>
                </>
              )}

              {/* Binance form fields */}
              {view === "binance" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      API Key
                    </label>
                    <input
                      type="text"
                      placeholder="Paste your API Key here"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-yellow-500 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Secret Key
                    </label>
                    <input
                      type="password"
                      placeholder="Paste your Secret Key here"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-yellow-500 placeholder-slate-600"
                    />
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-yellow-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Important
                    </h4>
                    <ul className="text-[10px] text-yellow-200/80 list-disc list-inside space-y-0.5">
                      <li>Enable &apos;Enable Reading&apos;</li>
                      <li>
                        Enable &apos;Enable Spot &amp; Margin Trading&apos;
                      </li>
                      <li>
                        <strong>Do NOT</strong> enable &apos;Enable
                        Withdrawals&apos;
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {/* IBKR form fields */}
              {view === "ibkr" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Account ID
                    </label>
                    <input
                      type="text"
                      placeholder="U1234567"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      API Token
                    </label>
                    <input
                      type="password"
                      placeholder="Paste your API token"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-blue-200">
                      Your credentials are encrypted locally before being
                      transmitted. We only use read-only and trading permissions.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-6 mb-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className={`px-6 py-2 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  connecting
                    ? "bg-slate-600 cursor-not-allowed"
                    : view === "binance"
                      ? "bg-yellow-600 hover:bg-yellow-500"
                      : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                <span>
                  {connecting ? "Connecting..." : "Connect Account"}
                </span>
                {!connecting && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Account Card ────────────────────────────────────────
function AccountCard({
  account,
  chartId,
  onDisconnect,
}: {
  account: AccountData;
  chartId: number;
  onDisconnect: (accountId: string) => void;
}) {
  const [showNumber, setShowNumber] = useState(false);
  const [tradingEnabled, setTradingEnabled] = useState(
    account.status === "Active"
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const isPositivePnl = account.daily_pnl >= 0;
  const chartColor = isPositivePnl ? "#10b981" : "#3b82f6";

  // Generate a deterministic chart path based on chartId
  const chartPaths = [
    {
      area: "M0 15 Q 10 18, 20 12 T 40 14 T 60 8 T 80 10 T 100 5 L 100 20 L 0 20 Z",
      line: "M0 15 Q 10 18, 20 12 T 40 14 T 60 8 T 80 10 T 100 5",
    },
    {
      area: "M0 18 L 15 15 L 30 16 L 45 10 L 60 12 L 80 8 L 100 5 L 100 20 L 0 20 Z",
      line: "M0 18 L 15 15 L 30 16 L 45 10 L 60 12 L 80 8 L 100 5",
    },
    {
      area: "M0 12 Q 15 16, 25 10 T 50 13 T 75 7 T 100 4 L 100 20 L 0 20 Z",
      line: "M0 12 Q 15 16, 25 10 T 50 13 T 75 7 T 100 4",
    },
    {
      area: "M0 16 L 20 14 L 35 17 L 50 11 L 70 9 L 85 12 L 100 6 L 100 20 L 0 20 Z",
      line: "M0 16 L 20 14 L 35 17 L 50 11 L 70 9 L 85 12 L 100 6",
    },
  ];
  const chart = chartPaths[chartId % chartPaths.length];

  function handleToggle() {
    if (tradingEnabled) {
      if (
        window.confirm(
          "Are you sure you want to pause trading on this account? Open positions will still be managed, but no new trades will be opened."
        )
      ) {
        setTradingEnabled(false);
      }
    } else {
      setTradingEnabled(true);
    }
  }

  async function handleDisconnect() {
    if (
      !window.confirm(
        `Are you sure you want to disconnect your ${account.platform} account (${account.account_mask})? This will remove the account from your dashboard.`
      )
    ) {
      return;
    }

    setDisconnecting(true);
    setMenuOpen(false);

    try {
      const res = await fetch(`/api/client-accounts?account_id=${account.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDisconnect(account.id);
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Failed to disconnect account. Please try again.");
        setDisconnecting(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setDisconnecting(false);
    }
  }

  // Determine display labels based on platform type
  const isCrypto = ["Binance", "Bybit", "Coinbase"].includes(
    account.platform
  );
  const balanceLabel = isCrypto ? "Total Balance" : "Current Balance";
  const secondaryLabel1 = isCrypto ? "Available" : "Equity";
  const secondaryValue1 = isCrypto ? account.balance : account.equity;
  const secondaryLabel2 = isCrypto ? "Locked" : "Free Margin";
  const secondaryValue2 = isCrypto ? 0 : account.free_margin;

  return (
    <div className={`rounded-xl overflow-hidden bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] transition-all duration-200 group ${disconnecting ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Card Header */}
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: account.platform_color }}
          >
            <span
              className="text-base font-bold tracking-tight"
              style={{ color: account.platform_text_color }}
            >
              {account.platform_short}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {account.platform}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              {isCrypto ? "Type:" : "Account:"}{" "}
              <span className="text-white font-medium">
                {isCrypto ? account.account_type : account.account_label}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              account.status === "Active"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-slate-500/10 border border-slate-500/20 text-slate-400"
            }`}
          >
            {account.status === "Active" && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {disconnecting ? "Disconnecting..." : account.status}
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#0B0E14] border border-white/10 rounded-lg shadow-xl z-20">
                  <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-t-lg">
                    Edit Connection
                  </button>
                  <button className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white">
                    Refresh Balance
                  </button>
                  <button className="w-full text-left px-4 py-2 text-xs text-orange-400 hover:bg-white/5 hover:text-orange-300">
                    Pause Trading
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={handleDisconnect}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-b-lg"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Details & Metrics */}
          <div className="lg:col-span-8 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  {isCrypto ? "API Key" : "Account Number"}
                </p>
                <div className="flex items-center gap-2 cursor-pointer">
                  <p className="text-sm font-mono font-medium text-white">
                    {showNumber ? account.account_number : account.account_mask}
                  </p>
                  <button
                    onClick={() => setShowNumber(!showNumber)}
                    className="text-slate-600 hover:text-slate-400"
                  >
                    {showNumber ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  {isCrypto ? "Permissions" : "Account Type"}
                </p>
                {isCrypto ? (
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-white/5">
                      Read
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-white/5">
                      Trade
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-white">
                    {account.account_type}{" "}
                    <span className="text-xs text-slate-500 ml-1">
                      1:100 Leverage
                    </span>
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">
                  {isCrypto ? "Assets" : "Currency"}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-white">
                    {getCurrencySymbol(account.currency)}
                  </div>
                  <p className="text-sm font-medium text-white">
                    {account.currency}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Balance & Chart Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    {balanceLabel}
                  </p>
                  <p className="text-3xl font-semibold text-white tracking-tight">
                    {fmt(account.balance)}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {secondaryLabel1}
                    </p>
                    <p className="text-sm font-mono text-slate-300">
                      {fmt(secondaryValue1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {secondaryLabel2}
                    </p>
                    <p className="text-sm font-mono text-slate-300">
                      {fmt(secondaryValue2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="h-20 w-full relative">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id={`chartGrad${chartId}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={chartColor}
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor={chartColor}
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path d={chart.area} fill={`url(#chartGrad${chartId})`} />
                  <path
                    d={chart.line}
                    fill="none"
                    stroke={chartColor}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <div
                  className="absolute top-0 right-0 bg-[#0B0E14]/80 backdrop-blur px-1.5 py-0.5 rounded text-[10px] border"
                  style={{
                    color: chartColor,
                    borderColor: `${chartColor}33`,
                  }}
                >
                  30 Day Trend
                </div>
              </div>
            </div>
          </div>

          {/* Right: Performance & Stats */}
          <div className="lg:col-span-4 pl-0 lg:pl-8 lg:border-l lg:border-white/5 flex flex-col justify-between h-full">
            <div className="space-y-6">
              {/* P&L Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">
                    Today&apos;s P&amp;L
                  </p>
                  <p
                    className={`text-sm font-medium ${account.daily_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {account.daily_pnl >= 0 ? "+" : ""}
                    {fmt(account.daily_pnl)}
                  </p>
                  <p
                    className={`text-[10px] ${account.daily_pnl >= 0 ? "text-emerald-500/70" : "text-red-500/70"}`}
                  >
                    {account.daily_pnl_pct >= 0 ? "+" : ""}
                    {account.daily_pnl_pct}%
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">
                    This Week
                  </p>
                  <p
                    className={`text-sm font-medium ${account.weekly_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {account.weekly_pnl >= 0 ? "+" : ""}
                    {fmt(account.weekly_pnl)}
                  </p>
                  <p
                    className={`text-[10px] ${account.weekly_pnl >= 0 ? "text-emerald-500/70" : "text-red-500/70"}`}
                  >
                    {account.weekly_pnl_pct >= 0 ? "+" : ""}
                    {account.weekly_pnl_pct}%
                  </p>
                </div>
              </div>

              {/* Algo Chips */}
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Active Algorithms
                </p>
                <div className="flex flex-wrap gap-2">
                  {account.algos.length > 0 ? (
                    account.algos.map((algo, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#020408] border border-white/10 text-[10px] font-medium text-slate-300"
                      >
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        {algo.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">
                      No algorithms assigned
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-600 mt-2 italic">
                  Managed by account manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-[#020408]/50 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            Connected:{" "}
            <span className="text-slate-400">
              {fmtDate(account.connected_at)}
            </span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <button className="flex items-center gap-1 hover:text-white transition-colors group/sync">
            <RefreshCw className="w-3 h-3 group-hover/sync:rotate-180 transition-transform duration-500" />
            Synced 2 mins ago
          </button>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          {/* Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              Trading Enabled
            </span>
            <button
              onClick={handleToggle}
              className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${
                tradingEnabled ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                  tradingEnabled ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          <button className="text-xs font-medium text-blue-500 hover:text-white flex items-center gap-1 transition-colors">
            View Full Details <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function ClientAccountsPage() {
  const [data, setData] = useState<PageData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientId, setClientId] = useState("");

  // Get client_id from session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("client_session");
      if (stored) {
        const session = JSON.parse(stored);
        if (session.client_id) {
          setClientId(session.client_id);
          return;
        }
      }
    } catch { /* ignore */ }
    // No client_id found — stop loading so we don't spin forever
    setLoading(false);
  }, []);

  // Fetch accounts when clientId is available
  useEffect(() => {
    if (!clientId) return;
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function loadAccounts() {
    setLoading(true);
    try {
      const res = await fetch(`/api/client-accounts-detail?client_id=${clientId}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch {
      // No data — keep empty
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect(accountId: string) {
    setData((prev) => {
      const updatedAccounts = prev.accounts.filter((a) => a.id !== accountId);
      const combinedBalance = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);
      const totalDailyPnl = updatedAccounts.reduce((sum, a) => sum + a.daily_pnl, 0);
      const activeCount = updatedAccounts.filter((a) => a.status === "Active").length;

      return {
        summary: {
          total_accounts: updatedAccounts.length,
          combined_balance: combinedBalance,
          total_daily_pnl: totalDailyPnl,
          active_count: activeCount,
          total_count: updatedAccounts.length,
        },
        accounts: updatedAccounts,
      };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConnectModal open={modalOpen} onClose={() => setModalOpen(false)} onAccountAdded={loadAccounts} />

      <div className="p-4 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-white font-semibold text-xl tracking-tight">
              Connected Accounts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your trading platforms and monitor account balances
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 text-xs font-medium border border-blue-500"
          >
            <Plus className="w-4 h-4" />
            Connect New Account
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Total Accounts */}
          <div className="rounded-xl p-5 flex items-center gap-4 bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] transition-all">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Connected Accounts
              </p>
              <p className="text-2xl font-semibold text-white tracking-tight mt-0.5">
                {data.summary.total_accounts}
              </p>
            </div>
          </div>

          {/* Card 2: Total Balance */}
          <div className="rounded-xl p-5 flex items-center gap-4 bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] transition-all">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Combined Balance
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-2xl font-semibold text-white tracking-tight">
                  {fmt(data.summary.combined_balance)}
                </p>
                {data.summary.total_daily_pnl !== 0 && (
                  <span
                    className={`text-xs font-medium flex items-center ${
                      data.summary.total_daily_pnl >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {data.summary.total_daily_pnl >= 0 ? "+" : ""}
                    {fmt(data.summary.total_daily_pnl)}
                    {data.summary.total_daily_pnl >= 0 && (
                      <ArrowUp className="w-3 h-3 ml-0.5" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Trading Status */}
          <div className="rounded-xl p-5 flex items-center gap-4 bg-[#0B0E14] border border-white/5 hover:border-white/[0.08] hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] transition-all">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Trading Status
                </p>
                {data.summary.total_count > 0 && data.summary.active_count === data.summary.total_count && (
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">
                    All Active
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-300 mt-1">
                {data.summary.total_count > 0
                  ? `${data.summary.active_count} of ${data.summary.total_count} accounts trading`
                  : "No accounts connected"}
              </p>
            </div>
          </div>
        </div>

        {/* Account Cards */}
        {data.accounts.length > 0 ? (
          <div className="space-y-6">
            {data.accounts.map((account, idx) => (
              <AccountCard
                key={account.id}
                account={account}
                chartId={idx}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-500">
              <LinkIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No accounts connected</h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              Connect your first trading account to start automated trading with your assigned algorithms.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 text-sm font-medium border border-blue-500"
            >
              <Plus className="w-4 h-4" />
              Connect Your First Account
            </button>
          </div>
        )}

        {/* Bottom Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; 2025 Algo FinTech Inc. Secure Connections.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="/privacy-policy" className="hover:text-slate-400">
              Privacy Policy
            </a>
            <a href="/cookie-policy" className="hover:text-slate-400">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
