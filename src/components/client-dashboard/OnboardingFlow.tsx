"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Rocket,
  TrendingUp,
  Shield,
  Zap,
  ExternalLink,
  Check,
  Monitor,
  Smartphone,
  Globe,
  BarChart3,
  Wallet,
  Link2,
} from "lucide-react";

// ─── Prop Firm Data ─────────────────────────────────────────
const PROP_FIRMS = [
  {
    name: "Apex Trader Funding",
    description: "Best for beginners. Frequent 80%+ off sales.",
    sizes: "$25K – $300K",
    minDays: "7 days",
    profitSplit: "100% first $25K, then 90/10",
    drawdown: "Trailing",
    activation: "$85",
    url: "https://apextraderfunding.com",
    color: "blue",
  },
  {
    name: "BluSky Trading",
    description: "No activation fee! End-of-day drawdown.",
    sizes: "$25K – $250K",
    minDays: "5 days",
    profitSplit: "100% first $10K, then 90/10",
    drawdown: "End-of-day",
    activation: "FREE",
    url: "https://bluskytrading.com",
    color: "cyan",
  },
  {
    name: "MyFundedFutures (MFF)",
    description: "No minimum trading days. Pass fast.",
    sizes: "$50K – $150K",
    minDays: "0 days",
    profitSplit: "100% first $10K, then 90/10",
    drawdown: "End-of-day / Trailing",
    activation: "Varies",
    url: "https://myfundedfutures.com",
    color: "purple",
  },
  {
    name: "Take Profit Trader",
    description: "End-of-day drawdown. Solid reputation.",
    sizes: "$25K – $150K",
    minDays: "5 days",
    profitSplit: "80/20",
    drawdown: "End-of-day",
    activation: "$130",
    url: "https://takeprofittrader.com",
    color: "green",
  },
  {
    name: "Elite Trader Funding",
    description: "Flexible evaluations. 1-step or 2-step.",
    sizes: "$25K – $300K",
    minDays: "Varies",
    profitSplit: "80/20",
    drawdown: "End-of-day",
    activation: "$80",
    url: "https://elitetraderfunding.com",
    color: "amber",
  },
  {
    name: "TradeDay",
    description: "No activation fee. Trailing drawdown.",
    sizes: "$25K – $150K",
    minDays: "5 days",
    profitSplit: "90/10",
    drawdown: "Trailing",
    activation: "FREE",
    url: "https://tradeday.com",
    color: "rose",
  },
];

// ─── Platform Connection Steps ──────────────────────────────
const PLATFORMS = [
  {
    name: "MetaTrader 5 (MT5)",
    icon: "📊",
    needs: ["Broker Name", "Login ID", "Server", "Password"],
    tip: "Check the welcome email from your broker for login details. Use your TRADING password, not the investor/read-only password.",
  },
  {
    name: "MetaTrader 4 (MT4)",
    icon: "📈",
    needs: ["Broker Name", "Login ID", "Server", "Password"],
    tip: "Same setup as MT5. Your broker email has all the credentials you need.",
  },
  {
    name: "Tradovate",
    icon: "⚡",
    needs: ["Account Type", "Account Number", "Username", "Password"],
    tip: "IMPORTANT: You MUST sign the Tradovate agreement first before connecting. Log into Tradovate and sign any pending agreements.",
    notice: "Tradovate accounts take 24–48 hours to be fully connected and active after you submit your credentials.",
  },
  {
    name: "Binance",
    icon: "🪙",
    needs: ["API Key", "Secret Key"],
    tip: "NEVER enable 'Enable Withdrawals' on your API key. Only enable 'Enable Reading' and 'Enable Spot & Margin Trading'.",
  },
  {
    name: "Interactive Brokers",
    icon: "🏦",
    needs: ["Account ID (U1234567)", "API Token"],
    tip: "Find your API token in IBKR Settings → API → API Keys.",
  },
];

// ─── Component ──────────────────────────────────────────────
export default function OnboardingFlow({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
  const [hasExistingFirm, setHasExistingFirm] = useState<boolean | null>(null);

  const totalSteps = 3;

  const handleComplete = useCallback(() => {
    localStorage.setItem("onboarding_completed", "true");
    onClose();
  }, [onClose]);

  const handleSkip = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [step, handleComplete]);

  const handleClose = useCallback(() => {
    localStorage.setItem("onboarding_completed", "true");
    onClose();
  }, [onClose]);

  // Prevent body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020408]/95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors group"
      >
        <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
      </button>

      {/* Main Card */}
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#0A0E14] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
        {/* Step Indicator */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center gap-2">
                <div
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= step
                      ? "bg-blue-500"
                      : "bg-white/10"
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Step {step + 1} of {totalSteps}
          </p>
        </div>

        {/* Content Area (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          {/* ─── Step 1: Welcome ─────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="text-center space-y-4 pt-2">
                {/* Animated Graphic */}
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-2xl rotate-6 animate-pulse" />
                  <div className="absolute inset-0 bg-blue-600/30 rounded-2xl -rotate-3" />
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome! Let&apos;s Get You Set Up
                  </h1>
                  <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                    We&apos;ll have you up and running in just a few minutes. Here&apos;s how it works:
                  </p>
                </div>
              </div>

              {/* 3 Steps Preview */}
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">1. Get a Prop Firm Account</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sign up with one of our recommended prop firms that are compatible with our service.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">2. Connect Your Account</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Link your trading account to our platform. We&apos;ll show you exactly how — it takes under 2 minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">3. Sit Back & Watch</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Our algorithm trades for you automatically. Check your dashboard anytime to see how things are going.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Shield className="w-3.5 h-3.5 text-green-400" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>4+ years live trading</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>100% automated</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Pick Prop Firm ──────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Get a Prop Firm Account
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  A prop firm gives you money to trade with. Pick one below, sign up, and come back to connect it.
                </p>
              </div>

              {/* Already have one? */}
              {hasExistingFirm === null && (
                <div className="flex gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Already have a prop firm account?</p>
                    <p className="text-xs text-slate-400 mt-0.5">If you already have a Tradovate, MT5, or other trading account, skip ahead.</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setHasExistingFirm(true)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      Yes, skip
                    </button>
                    <button
                      onClick={() => setHasExistingFirm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    >
                      No, show me
                    </button>
                  </div>
                </div>
              )}

              {hasExistingFirm === true && (
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/15">
                  <p className="text-sm text-green-300">
                    Great! You&apos;re ready to connect your account. Click &quot;Next&quot; to see how.
                  </p>
                </div>
              )}

              {/* Prop Firm Cards */}
              {hasExistingFirm !== true && (
                <div className="space-y-3">
                  {PROP_FIRMS.map((firm) => (
                    <div
                      key={firm.name}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">{firm.name}</h3>
                            {firm.activation === "FREE" && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded">
                                NO ACTIVATION FEE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{firm.description}</p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            <span className="text-[11px] text-slate-500">
                              Sizes: <span className="text-slate-300">{firm.sizes}</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Min days: <span className="text-slate-300">{firm.minDays}</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Split: <span className="text-slate-300">{firm.profitSplit}</span>
                            </span>
                          </div>
                        </div>

                        <a
                          href={firm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                        >
                          Sign Up
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Step 3: Connect Account ─────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Connect Your Trading Account
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Select your platform below to see what you&apos;ll need, then head to your Accounts page to connect.
                </p>
              </div>

              {/* Platform Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map((platform, idx) => (
                  <button
                    key={platform.name}
                    onClick={() => setSelectedPlatform(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPlatform === idx
                        ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <p className={`text-xs font-medium mt-1 ${
                      selectedPlatform === idx ? "text-blue-300" : "text-slate-300"
                    }`}>
                      {platform.name}
                    </p>
                  </button>
                ))}
              </div>

              {/* Platform Details */}
              {selectedPlatform !== null && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-sm font-semibold text-white">
                    {PLATFORMS[selectedPlatform].icon} {PLATFORMS[selectedPlatform].name}
                  </h3>

                  <div>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                      What you&apos;ll need:
                    </p>
                    <div className="space-y-1.5">
                      {PLATFORMS[selectedPlatform].needs.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span className="text-xs text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <p className="text-xs text-amber-200/80">
                      <span className="font-semibold text-amber-300">Tip: </span>
                      {PLATFORMS[selectedPlatform].tip}
                    </p>
                  </div>

                  {/* Platform-specific notice (e.g. Tradovate 24-48hr) */}
                  {"notice" in PLATFORMS[selectedPlatform] && (PLATFORMS[selectedPlatform] as { notice?: string }).notice && (
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                      <p className="text-xs text-blue-200/80">
                        <span className="font-semibold text-blue-300">Note: </span>
                        {(PLATFORMS[selectedPlatform] as { notice?: string }).notice}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-400">
                    Head to your <strong className="text-slate-300">Accounts page</strong> and click
                    &quot;Connect New Account&quot; to enter these details. Need more help? Check the
                    full Connection Guide.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href="/client-dashboard/accounts?connect=1"
                  onClick={() => {
                    localStorage.setItem("onboarding_completed", "true");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
                >
                  Go to Accounts
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/client-dashboard/connect-guide"
                  onClick={() => {
                    localStorage.setItem("onboarding_completed", "true");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors"
                >
                  View Full Guide
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#080C12] flex items-center justify-between">
          <div>
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip this step
            </button>

            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
              >
                Done
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
