"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgencyBranding } from "@/hooks/useAgencyBranding";
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Monitor,
  Key,
  User,
  Lock,
  Server,
  Hash,
  HelpCircle,
  Link2,
  ChevronRight,
} from "lucide-react";

// ─── Platform Data ────────────────────────────────────────
const PLATFORMS = [
  {
    id: "mt5",
    name: "MetaTrader 5",
    short: "MT5",
    color: "#262626",
    textColor: "#ffffff",
    desc: "Forex, CFDs, Indices",
    icon: "MT5",
  },
  {
    id: "mt4",
    name: "MetaTrader 4",
    short: "MT4",
    color: "#262626",
    textColor: "#ffffff",
    desc: "Forex, CFDs",
    icon: "MT4",
  },
  {
    id: "binance",
    name: "Binance",
    short: "BN",
    color: "#FCD535",
    textColor: "#000000",
    desc: "Crypto Spot & Futures",
    icon: "BN",
  },
  {
    id: "tradovate",
    name: "Tradovate",
    short: "TV",
    color: "#0ea5e9",
    textColor: "#ffffff",
    desc: "Futures Trading",
    icon: "TV",
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    short: "IB",
    color: "#1e293b",
    textColor: "#ffffff",
    desc: "Stocks, Options, Futures",
    icon: "IB",
  },
];

// ─── Step Component ───────────────────────────────────────
function StepCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0 group-hover:bg-blue-500/20 transition-colors">
          {number}
        </div>
        <div className="flex-1 w-px bg-white/5 mt-2 group-last:hidden" />
      </div>
      <div className="flex-1 pb-8 group-last:pb-0">
        <h4 className="text-sm font-semibold text-white mb-2">{title}</h4>
        <div className="text-sm text-slate-400 space-y-2">{children}</div>
      </div>
    </div>
  );
}

// ─── Info Field Row ───────────────────────────────────────
function FieldRow({
  icon: Icon,
  label,
  example,
  description,
}: {
  icon: React.ElementType;
  label: string;
  example: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white">{label}</span>
          <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">
            {example}
          </code>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── MT5 Guide ────────────────────────────────────────────
function MT5Guide() {
  return (
    <div className="space-y-6">
      {/* What You'll Need */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400" />
          What You&apos;ll Need
        </h3>
        <div className="space-y-2">
          <FieldRow
            icon={Monitor}
            label="Broker Name"
            example="OANDA, IC Markets, Pepperstone, Exness"
            description="The company where your MetaTrader 5 account lives"
          />
          <FieldRow
            icon={Hash}
            label="Login ID"
            example="12345678"
            description="The number your broker gave you when you opened your account"
          />
          <FieldRow
            icon={Server}
            label="Server"
            example="OANDA-Live or ICMarkets-MT5"
            description="Your broker's server name — find it in MetaTrader under File → Login"
          />
          <FieldRow
            icon={Lock}
            label="Password"
            example="••••••••"
            description="The password you use to log into MetaTrader 5"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-0">
        <StepCard number={1} title="Click on MetaTrader 5">
          <p>
            In the platform selection window, click the{" "}
            <span className="text-white font-medium">MetaTrader 5</span> box.
          </p>
        </StepCard>

        <StepCard number={2} title="Pick your broker">
          <p>
            Click the dropdown at the top and choose your broker. Available options:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {["OANDA", "IC Markets", "Pepperstone", "Exness", "Other"].map(
              (b) => (
                <span
                  key={b}
                  className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300"
                >
                  {b}
                </span>
              )
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            If your broker isn&apos;t listed, pick &quot;Other&quot; and type the name in.
          </p>
        </StepCard>

        <StepCard number={3} title="Enter your Login ID">
          <p>
            Type the number your broker gave you into the{" "}
            <span className="text-white font-medium">&quot;Login ID&quot;</span> box. It
            usually looks like a bunch of numbers (example:{" "}
            <code className="text-blue-400 bg-blue-500/10 px-1 rounded text-xs">
              12345678
            </code>
            ).
          </p>
        </StepCard>

        <StepCard number={4} title="Enter your Server">
          <p>
            Type your server name into the{" "}
            <span className="text-white font-medium">&quot;Server&quot;</span> box.
          </p>
          <div className="mt-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-blue-300">
              <span className="font-semibold">Don&apos;t know your server?</span>{" "}
              Open your MetaTrader 5 app → Go to{" "}
              <span className="font-medium">File → Login to Trade Account</span>{" "}
              → Your server name will be listed there.
            </p>
          </div>
        </StepCard>

        <StepCard number={5} title="Enter your Password">
          <p>
            Type your MetaTrader 5 password into the{" "}
            <span className="text-white font-medium">&quot;Password&quot;</span> box. This
            is the same password you use to log into the MetaTrader 5 app.
          </p>
        </StepCard>

        <StepCard number={6} title='Click "Connect Account"'>
          <p>
            Once all the fields are filled in, click the blue{" "}
            <span className="text-white font-medium">
              &quot;Connect Account&quot;
            </span>{" "}
            button at the bottom right.
          </p>
        </StepCard>

        <StepCard number={7} title="You're done!">
          <p>
            Your MetaTrader 5 account will now show up on your{" "}
            <a
              href="/client-dashboard/accounts"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Accounts page
            </a>
            . Your balance and details should appear within a few seconds.
          </p>
        </StepCard>
      </div>

      {/* Security Note */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-blue-300 mb-1">
            Your info is safe
          </h4>
          <p className="text-xs text-blue-200/70">
            Your login details are encrypted (scrambled so no one can read them)
            before they are sent. We only use them to read your balance and
            place trades on your behalf. We never share your information.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MT4 Guide ────────────────────────────────────────────
function MT4Guide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400" />
          What You&apos;ll Need
        </h3>
        <div className="space-y-2">
          <FieldRow
            icon={Monitor}
            label="Broker Name"
            example="OANDA, IC Markets, Pepperstone, Exness"
            description="The company where your MetaTrader 4 account lives"
          />
          <FieldRow
            icon={Hash}
            label="Login ID"
            example="12345678"
            description="The number your broker gave you when you opened your account"
          />
          <FieldRow
            icon={Server}
            label="Server"
            example="OANDA-Live or ICMarkets-MT4"
            description="Your broker's server name — find it in MetaTrader under File → Login"
          />
          <FieldRow
            icon={Lock}
            label="Password"
            example="••••••••"
            description="The password you use to log into MetaTrader 4"
          />
        </div>
      </div>

      <div className="space-y-0">
        <StepCard number={1} title="Click on MetaTrader 4">
          <p>
            In the platform selection window, click the{" "}
            <span className="text-white font-medium">MetaTrader 4</span> box.
          </p>
        </StepCard>

        <StepCard number={2} title="Pick your broker">
          <p>Click the dropdown at the top and choose your broker.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {["OANDA", "IC Markets", "Pepperstone", "Exness", "Other"].map(
              (b) => (
                <span
                  key={b}
                  className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300"
                >
                  {b}
                </span>
              )
            )}
          </div>
        </StepCard>

        <StepCard number={3} title="Enter your Login ID">
          <p>
            Type the number your broker gave you into the{" "}
            <span className="text-white font-medium">&quot;Login ID&quot;</span> box.
          </p>
        </StepCard>

        <StepCard number={4} title="Enter your Server">
          <p>
            Type your server name into the{" "}
            <span className="text-white font-medium">&quot;Server&quot;</span> box.
          </p>
          <div className="mt-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-blue-300">
              <span className="font-semibold">Don&apos;t know your server?</span>{" "}
              Open MetaTrader 4 → Go to{" "}
              <span className="font-medium">File → Login to Trade Account</span>{" "}
              → Your server name will be listed there.
            </p>
          </div>
        </StepCard>

        <StepCard number={5} title="Enter your Password">
          <p>
            Type your MetaTrader 4 password into the{" "}
            <span className="text-white font-medium">&quot;Password&quot;</span> box.
          </p>
        </StepCard>

        <StepCard number={6} title='Click "Connect Account"'>
          <p>
            Click the blue{" "}
            <span className="text-white font-medium">&quot;Connect Account&quot;</span>{" "}
            button at the bottom right.
          </p>
        </StepCard>

        <StepCard number={7} title="You're done!">
          <p>
            Your MetaTrader 4 account will now show up on your{" "}
            <a
              href="/client-dashboard/accounts"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Accounts page
            </a>
            .
          </p>
        </StepCard>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-blue-300 mb-1">
            Your info is safe
          </h4>
          <p className="text-xs text-blue-200/70">
            Your login details are encrypted before being sent. We only use them
            to read your balance and place trades on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Binance Guide ────────────────────────────────────────
function BinanceGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-yellow-400" />
          What You&apos;ll Need
        </h3>
        <div className="space-y-2">
          <FieldRow
            icon={Key}
            label="API Key"
            example="xK3m...8dF2"
            description="You create this inside your Binance account (we'll show you how)"
          />
          <FieldRow
            icon={Lock}
            label="Secret Key"
            example="••••••••••"
            description="Binance gives this to you when you create the API Key"
          />
        </div>
      </div>

      {/* How to create API key */}
      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-yellow-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          First: Create Your Binance API Key
        </h3>
        <p className="text-xs text-yellow-200/70">
          Before connecting, you need to create an API Key inside Binance.
          Follow these steps:
        </p>
        <ol className="text-xs text-yellow-200/70 space-y-2 list-decimal list-inside">
          <li>
            Log into your Binance account at{" "}
            <span className="text-yellow-300 font-medium">binance.com</span>
          </li>
          <li>Click your profile icon in the top right corner</li>
          <li>
            Click{" "}
            <span className="text-yellow-300 font-medium">
              &quot;API Management&quot;
            </span>
          </li>
          <li>
            Click{" "}
            <span className="text-yellow-300 font-medium">
              &quot;Create API&quot;
            </span>{" "}
            and name it (e.g., &quot;Trading Bot&quot;)
          </li>
          <li>Complete the security check</li>
          <li>
            Set permissions:
            <div className="mt-2 space-y-1.5 ml-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span>Turn ON &quot;Enable Reading&quot;</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span>Turn ON &quot;Enable Spot & Margin Trading&quot;</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-[10px] font-bold">✕</span>
                </div>
                <span className="font-semibold text-yellow-300">
                  DO NOT turn on &quot;Enable Withdrawals&quot;
                </span>
              </div>
            </div>
          </li>
          <li>
            Copy your{" "}
            <span className="text-yellow-300 font-medium">API Key</span> and{" "}
            <span className="text-yellow-300 font-medium">Secret Key</span> —
            you&apos;ll need them next
          </li>
        </ol>
      </div>

      <div className="space-y-0">
        <StepCard number={1} title="Click on Binance">
          <p>
            In the platform selection window, click the{" "}
            <span className="text-white font-medium">Binance</span> box.
          </p>
        </StepCard>

        <StepCard number={2} title="Paste your API Key">
          <p>
            Go to the box labeled{" "}
            <span className="text-white font-medium">&quot;API Key&quot;</span> and
            paste the API Key you copied from Binance.
          </p>
        </StepCard>

        <StepCard number={3} title="Paste your Secret Key">
          <p>
            Go to the box labeled{" "}
            <span className="text-white font-medium">&quot;Secret Key&quot;</span> and
            paste the Secret Key you copied from Binance.
          </p>
        </StepCard>

        <StepCard number={4} title='Click "Connect Account"'>
          <p>
            Click the yellow{" "}
            <span className="text-white font-medium">&quot;Connect Account&quot;</span>{" "}
            button at the bottom right.
          </p>
        </StepCard>

        <StepCard number={5} title="You're done!">
          <p>
            Your Binance account will now show up on your{" "}
            <a
              href="/client-dashboard/accounts"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Accounts page
            </a>
            .
          </p>
        </StepCard>
      </div>

      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-yellow-300 mb-1">
            Safety Reminder
          </h4>
          <p className="text-xs text-yellow-200/70">
            Always make sure &quot;Enable Withdrawals&quot; is turned OFF on your
            Binance API Key. This means even if someone had your API Key, they
            could never take money out of your Binance account. Your keys are
            encrypted before being sent.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Tradovate Guide ──────────────────────────────────────
function TradovateGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-sky-400" />
          What You&apos;ll Need
        </h3>
        <div className="space-y-2">
          <FieldRow
            icon={Monitor}
            label="Account Type"
            example="Demo or Real"
            description="Pick Demo if it's a practice account, or Real if it's a live account"
          />
          <FieldRow
            icon={Hash}
            label="Account Number"
            example="12345678"
            description="The number Tradovate assigned to your account"
          />
          <FieldRow
            icon={User}
            label="Username"
            example="your_username"
            description="The username you use to log into Tradovate"
          />
          <FieldRow
            icon={Lock}
            label="Password"
            example="••••••••"
            description="The password you use to log into Tradovate"
          />
        </div>
      </div>

      {/* Important: Sign Agreement First */}
      <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Important: Sign Your Tradovate Agreement First
        </h3>
        <p className="text-xs text-orange-200/70">
          Before you give us your login details, you <span className="text-orange-300 font-semibold">must</span> log into your
          Tradovate account and sign the account agreement. If you skip this step,
          the connection to our service <span className="text-orange-300 font-semibold">will not work</span>.
        </p>
        <div className="space-y-2 ml-1">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-orange-300 text-xs font-bold">1</span>
            </div>
            <p className="text-xs text-orange-200/70">
              Log into your Tradovate account at <span className="text-orange-300 font-medium">tradovate.com</span> or through the Tradovate app
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-orange-300 text-xs font-bold">2</span>
            </div>
            <p className="text-xs text-orange-200/70">
              Look for the <span className="text-orange-300 font-medium">account agreement</span> — Tradovate will show it to you when you first log in or under your account settings
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-orange-300 text-xs font-bold">3</span>
            </div>
            <p className="text-xs text-orange-200/70">
              <span className="text-orange-300 font-medium">Read and sign</span> the agreement — once it&apos;s signed, your account is ready to connect
            </p>
          </div>
        </div>
        <div className="mt-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-xs text-orange-300 font-medium">
            If you try to connect without signing the agreement, you will get an error. Make sure this is done first!
          </p>
        </div>
      </div>

      <div className="space-y-0">
        <StepCard number={1} title="Sign in to Tradovate and sign the agreement">
          <p>
            Before anything else, log into your Tradovate account and make sure you
            have <span className="text-white font-medium">signed the account agreement</span>.
            Without this, the connection will fail. See the orange box above for details.
          </p>
        </StepCard>

        <StepCard number={2} title="Click on Tradovate">
          <p>
            In the platform selection window, click the{" "}
            <span className="text-white font-medium">Tradovate</span> box.
          </p>
        </StepCard>

        <StepCard number={3} title="Choose your account type">
          <p>
            You&apos;ll see two buttons:{" "}
            <span className="text-white font-medium">Demo</span> and{" "}
            <span className="text-white font-medium">Real</span>. Click the one
            that matches your account.
          </p>
          <div className="flex gap-3 mt-2">
            <div className="px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
              <span className="font-semibold">Demo</span> — practice account,
              no real money
            </div>
            <div className="px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
              <span className="font-semibold">Real</span> — live account, real
              money
            </div>
          </div>
        </StepCard>

        <StepCard number={4} title="Enter your Account Number">
          <p>
            Type your Tradovate account number into the{" "}
            <span className="text-white font-medium">
              &quot;Account Number&quot;
            </span>{" "}
            box.
          </p>
        </StepCard>

        <StepCard number={5} title="Enter your Username">
          <p>
            Type your Tradovate username into the{" "}
            <span className="text-white font-medium">&quot;Username&quot;</span> box.
            This is the same username you use to log into the Tradovate website
            or app.
          </p>
        </StepCard>

        <StepCard number={6} title="Enter your Password">
          <p>
            Type your Tradovate password into the{" "}
            <span className="text-white font-medium">&quot;Password&quot;</span> box.
          </p>
        </StepCard>

        <StepCard number={7} title='Click "Connect Account"'>
          <p>
            Click the blue{" "}
            <span className="text-white font-medium">&quot;Connect Account&quot;</span>{" "}
            button at the bottom right.
          </p>
        </StepCard>

        <StepCard number={8} title="You're done!">
          <p>
            Your Tradovate account will now show up on your{" "}
            <a
              href="/client-dashboard/accounts"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Accounts page
            </a>
            . You&apos;ll see your balance and whether it&apos;s Demo or Real.
          </p>
        </StepCard>
      </div>

      <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-sky-300 mb-1">
            Your info is safe
          </h4>
          <p className="text-xs text-sky-200/70">
            Your Tradovate login details are encrypted before being sent. We
            only use them to read your account data and place trades on your
            behalf.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── IBKR Guide ───────────────────────────────────────────
function IBKRGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400" />
          What You&apos;ll Need
        </h3>
        <div className="space-y-2">
          <FieldRow
            icon={Hash}
            label="Account ID"
            example="U1234567"
            description="Starts with a letter followed by numbers — find this on your IBKR dashboard"
          />
          <FieldRow
            icon={Key}
            label="API Token"
            example="••••••••••"
            description="A special key you create inside Interactive Brokers"
          />
        </div>
      </div>

      <div className="space-y-0">
        <StepCard number={1} title="Click on Interactive Brokers">
          <p>
            In the platform selection window, click the{" "}
            <span className="text-white font-medium">
              Interactive Brokers
            </span>{" "}
            box.
          </p>
        </StepCard>

        <StepCard number={2} title="Enter your Account ID">
          <p>
            Type your Interactive Brokers Account ID into the{" "}
            <span className="text-white font-medium">&quot;Account ID&quot;</span>{" "}
            box. It starts with a letter (usually &quot;U&quot;) followed by numbers,
            like{" "}
            <code className="text-blue-400 bg-blue-500/10 px-1 rounded text-xs">
              U1234567
            </code>
            .
          </p>
        </StepCard>

        <StepCard number={3} title="Enter your API Token">
          <p>
            Paste your API Token into the{" "}
            <span className="text-white font-medium">&quot;API Token&quot;</span> box.
          </p>
        </StepCard>

        <StepCard number={4} title='Click "Connect Account"'>
          <p>
            Click the blue{" "}
            <span className="text-white font-medium">&quot;Connect Account&quot;</span>{" "}
            button at the bottom right.
          </p>
        </StepCard>

        <StepCard number={5} title="You're done!">
          <p>
            Your Interactive Brokers account will now show up on your{" "}
            <a
              href="/client-dashboard/accounts"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Accounts page
            </a>
            .
          </p>
        </StepCard>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-blue-300 mb-1">
            Your info is safe
          </h4>
          <p className="text-xs text-blue-200/70">
            Your credentials are encrypted before being sent. We only use
            read-only and trading permissions — we can never withdraw money from
            your account.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────
function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-medium text-white">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-400">{answer}</div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function ConnectGuidePage() {
  const router = useRouter();
  const { agencyName } = useAgencyBranding();
  const [activeTab, setActiveTab] = useState("mt5");

  const guideComponents: Record<string, React.ReactNode> = {
    mt5: <MT5Guide />,
    mt4: <MT4Guide />,
    binance: <BinanceGuide />,
    tradovate: <TradovateGuide />,
    ibkr: <IBKRGuide />,
  };

  return (
    <div className="p-4 lg:p-8 overflow-auto">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <a
            href="/client-dashboard"
            className="hover:text-slate-300 transition-colors"
          >
            Dashboard
          </a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-300">Connection Guide</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            How to Connect Your Trading Account
          </h1>
          <p className="leading-relaxed md:text-base text-sm text-slate-400 max-w-2xl">
            Follow this step-by-step guide to securely link your brokerage or
            exchange platform to your dashboard.
          </p>
        </div>

        {/* Getting Started */}
        <div className="bg-[#13161C] border border-white/5 rounded-xl p-6 lg:p-8 flex flex-col gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 relative z-10">
            <Zap className="w-5 h-5 text-blue-500" />
            Getting Started
          </h2>
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white mb-1">
                1
              </div>
              <h4 className="text-sm font-medium text-slate-200">
                Go to Dashboard
              </h4>
              <p className="text-xs text-slate-400">
                Make sure you are logged into your{" "}
                <a
                  href="/client-dashboard"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  client dashboard
                </a>
                .
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white mb-1">
                2
              </div>
              <h4 className="text-sm font-medium text-slate-200">
                Open the Connect Window
              </h4>
              <p className="text-xs text-slate-400">
                Click{" "}
                <button
                  onClick={() =>
                    router.push("/client-dashboard/accounts?connect=1")
                  }
                  className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2 cursor-pointer"
                >
                  Connect New Account
                </button>{" "}
                on your dashboard or Accounts page.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white mb-1">
                3
              </div>
              <h4 className="text-sm font-medium text-slate-200">
                Pick Your Platform
              </h4>
              <p className="text-xs text-slate-400">
                Choose the trading platform you use from the list, then follow
                the steps below.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() =>
              router.push("/client-dashboard/accounts?connect=1")
            }
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20 text-sm font-medium border border-blue-500"
          >
            <Link2 className="w-4 h-4" />
            Connect an Account Now
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="/client-dashboard/accounts"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all text-sm font-medium border border-white/10"
          >
            View My Accounts
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Platform Tabs */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Platform-Specific Instructions
          </h2>

          {/* Tab Bar */}
          <div className="flex gap-1 bg-[#0B0E14] p-1 rounded-xl border border-white/5 overflow-x-auto">
            {PLATFORMS.map((plat) => (
              <button
                key={plat.id}
                onClick={() => setActiveTab(plat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === plat.id
                    ? "bg-white/10 text-white border border-white/10 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{
                    backgroundColor: plat.color,
                    color: plat.textColor,
                  }}
                >
                  {plat.short}
                </div>
                <span className="hidden sm:inline">{plat.name}</span>
              </button>
            ))}
          </div>

          {/* Active Platform Description */}
          <div className="mt-1 px-1">
            <p className="text-xs text-slate-500">
              {PLATFORMS.find((p) => p.id === activeTab)?.desc}
            </p>
          </div>

          {/* Tab Content */}
          <div className="mt-6">{guideComponents[activeTab]}</div>
        </div>

        {/* Troubleshooting / FAQ */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-500" />
            Troubleshooting
          </h2>
          <div className="space-y-2">
            <FAQItem
              question='I see an error when I click "Connect Account"'
              answer={
                <p>
                  Make sure all the fields are filled in correctly.
                  Double-check that you didn&apos;t accidentally add a space at
                  the beginning or end of your Login ID, API Key, or password.
                  If you still see an error, try refreshing the page and
                  starting again.
                </p>
              }
            />
            <FAQItem
              question="My account isn't showing up after connecting"
              answer={
                <p>
                  Wait about 10 seconds, then refresh the page. If it still
                  doesn&apos;t show up, go to your{" "}
                  <a
                    href="/client-dashboard/accounts"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Accounts page
                  </a>{" "}
                  and try connecting again. Make sure the Login ID and password
                  are correct.
                </p>
              }
            />
            <FAQItem
              question="I don't know my Login ID / Server / API Key"
              answer={
                <p>
                  Contact your broker (the company you trade with). They can
                  send you your login details. You can also usually find them in
                  the email your broker sent when you first opened your account.
                </p>
              }
            />
            <FAQItem
              question="How do I disconnect an account?"
              answer={
                <p>
                  Go to your{" "}
                  <a
                    href="/client-dashboard/accounts"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Accounts page
                  </a>
                  , find the account you want to remove, click the three-dot
                  menu (⋮) on the right side of the account card, and click{" "}
                  <span className="text-white font-medium">
                    &quot;Disconnect&quot;
                  </span>
                  .
                </p>
              }
            />
            <FAQItem
              question="Is my information safe?"
              answer={
                <p>
                  Yes. All your login details, API keys, and passwords are
                  encrypted (scrambled so no one can read them) before they
                  leave your browser. We only use them to read your balances and
                  place trades. We never store passwords in plain text and never
                  share your information with anyone.
                </p>
              }
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Quick Links
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="/client-dashboard"
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-medium text-white group-hover:text-blue-400 transition-colors">
                  Go to Dashboard
                </span>
                <p className="text-[10px] text-slate-500">
                  View your portfolio overview
                </p>
              </div>
            </a>
            <a
              href="/client-dashboard/accounts"
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Link2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-medium text-white group-hover:text-emerald-400 transition-colors">
                  Manage Accounts
                </span>
                <p className="text-[10px] text-slate-500">
                  View and manage connected accounts
                </p>
              </div>
            </a>
            <button
              onClick={() =>
                router.push("/client-dashboard/accounts?connect=1")
              }
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <span className="text-xs font-medium text-white group-hover:text-purple-400 transition-colors">
                  Connect New Account
                </span>
                <p className="text-[10px] text-slate-500">
                  Open the connection modal directly
                </p>
              </div>
            </button>
            <a
              href="/client-dashboard/activity"
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <ExternalLink className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-medium text-white group-hover:text-amber-400 transition-colors">
                  Trading Activity
                </span>
                <p className="text-[10px] text-slate-500">
                  View your trade history
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} {agencyName || "Your Agency"}. Secure Connections.</p>
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
    </div>
  );
}
