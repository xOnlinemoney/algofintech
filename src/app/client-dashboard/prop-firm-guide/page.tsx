"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Star,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  Check,
  Copy,
  Zap,
  Target,
  Clock,
  BarChart3,
  Users,
  Award,
  Tag,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Info,
} from "lucide-react";

// ─── Step Component (same style as connect-guide) ─────────
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

// ─── Detail Table Row ─────────────────────────────────────
function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500 shrink-0 w-40">{label}</span>
      <span
        className={`text-xs font-medium text-right ${highlight ? "text-emerald-400" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Coupon Code Chip ─────────────────────────────────────
function CouponChip({
  code,
  discount,
}: {
  code: string;
  discount: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
        >
          <code className="text-xs font-bold text-emerald-400 font-mono">
            {code}
          </code>
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-emerald-500/60" />
          )}
        </button>
        <span className="text-xs text-slate-400">{discount}</span>
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
          className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-400">{answer}</div>
      )}
    </div>
  );
}

// ─── Tip Item ─────────────────────────────────────────────
function TipItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
      <p className="text-xs text-slate-400">{children}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FIRM GUIDES
// ═══════════════════════════════════════════════════════════

// ─── Apex Trader Funding ──────────────────────────────────
function ApexGuide() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-400" />
            The Basics
          </h3>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">4.6</span>
            <span className="text-[10px] text-slate-500">
              (15,000+ reviews)
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Apex Trader Funding is one of the biggest and most popular futures
          prop firms. They started in 2021 in Austin, Texas. They have paid
          out over $500 million to traders. Apex runs big sales (up to 90%
          off) almost every month, making it one of the cheapest ways to get a
          funded account.
        </p>
        <a
          href="https://apextraderfunding.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          apextraderfunding.com
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Account Details */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          $150K Account Details
        </h3>
        <div className="divide-y divide-white/5">
          <DetailRow label="Plan name" value="150K Full (Tradovate)" />
          <DetailRow label="Normal price" value="$397 / month" />
          <DetailRow
            label="With 90% off sale"
            value="$39.70 for first month"
            highlight
          />
          <DetailRow label="Profit target" value="$9,000" />
          <DetailRow label="Max drawdown" value="$5,000 trailing" />
          <DetailRow label="Min trading days" value="7 days (sometimes 1)" />
          <DetailRow label="Max contracts" value="17 minis / 170 micros" />
          <DetailRow label="Daily loss limit" value="None" />
          <DetailRow label="Time limit" value="None — take as long as you need" />
        </div>
      </div>

      {/* Trailing Drawdown Explanation */}
      <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          How the Trailing Drawdown Works
        </h3>
        <p className="text-xs text-orange-200/70">
          Your drawdown starts at $145,000 ($150,000 minus $5,000). As your
          account goes up, the drawdown line moves up too — but it never moves
          back down. For example, if your account reaches $154,000 (even for a
          moment during a trade), your new drawdown line is $149,000. If your
          account then drops below $149,000, you fail.
        </p>
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-xs text-orange-300 font-medium">
            This is the #1 reason traders fail — be careful with it. On
            Tradovate, the trailing drawdown never stops trailing during the
            evaluation.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          How to Sign Up — Step by Step
        </h3>
        <div className="space-y-0">
          <StepCard number={1} title="Go to the website">
            <p>
              Open your web browser and go to{" "}
              <a
                href="https://apextraderfunding.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                apextraderfunding.com
              </a>
              .
            </p>
          </StepCard>

          <StepCard number={2} title="Find the Tradovate plans">
            <p>
              Scroll down on the main page until you see the pricing section.
              You will see tabs that say{" "}
              <span className="text-white font-medium">Rithmic</span>,{" "}
              <span className="text-white font-medium">Tradovate</span>, and{" "}
              <span className="text-white font-medium">WealthCharts</span>.
              Click on the{" "}
              <span className="text-white font-medium">Tradovate</span> tab.
            </p>
          </StepCard>

          <StepCard number={3} title="Pick the 150K plan">
            <p>
              Look for the plan called{" "}
              <span className="text-white font-medium">
                &quot;150K Full&quot;
              </span>{" "}
              under the Tradovate tab. Click the{" "}
              <span className="text-white font-medium">
                &quot;Start Now&quot;
              </span>{" "}
              button next to it.
            </p>
          </StepCard>

          <StepCard number={4} title="Fill in your information">
            <p>
              Type in your{" "}
              <span className="text-white font-medium">
                full legal name
              </span>{" "}
              (the name on your ID — this is very important), your email
              address, phone number, and home address.
            </p>
          </StepCard>

          <StepCard number={5} title="Enter your coupon code">
            <p>
              Look for the box that says &quot;Enter coupon code.&quot; Type in
              your code (see the coupon section below).
            </p>
            <div className="mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <p className="text-xs text-red-300 font-medium">
                Do NOT check the box that says &quot;I agree not to use a
                coupon code&quot; — if you check that box, you will pay full
                price and cannot undo it.
              </p>
            </div>
          </StepCard>

          <StepCard number={6} title="Agree to the rules">
            <p>
              Check all the boxes for the terms, privacy policy, and billing
              agreement. Then click{" "}
              <span className="text-white font-medium">&quot;Next.&quot;</span>
            </p>
          </StepCard>

          <StepCard number={7} title="Pay">
            <p>
              On the payment page, make sure the price shown matches the
              discounted price. Enter your credit or debit card information and
              click submit.
            </p>
          </StepCard>

          <StepCard number={8} title="Set up Tradovate">
            <p>
              After you pay, you will get Tradovate login details in your email
              and on your Apex dashboard. Go to{" "}
              <span className="text-white font-medium">
                trader.tradovate.com
              </span>{" "}
              in your web browser (use a computer, not the phone app). Log in
              with the username and password Apex gave you. Choose{" "}
              <span className="text-white font-medium">
                &quot;Non-Professional&quot;
              </span>{" "}
              when asked. Sign the data agreements. Wait 10–90 minutes for your
              data to turn on.
            </p>
          </StepCard>
        </div>
      </div>

      {/* Coupons */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" />
          Coupon Codes
        </h3>
        <p className="text-xs text-slate-500">
          As of February 2026, Apex is running a 90% off sale on all
          evaluations. First month is 90% off, recurring months are 50% off.
        </p>
        <div className="space-y-2">
          <CouponChip
            code="EPICC"
            discount="90% off first month, 50% off renewals"
          />
          <CouponChip
            code="SAVENOW"
            discount="Current sale percentage"
          />
          <CouponChip
            code="LIVESTREAM"
            discount="Up to 90% off"
          />
          <CouponChip
            code="MATCH"
            discount="90% off first month, 50% off renewals"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Tips for New Users
        </h3>
        <div className="space-y-2">
          <TipItem>
            Never pay full price. Always enter a coupon code before paying.
          </TipItem>
          <TipItem>
            Start with smaller contract sizes — you do not have to use all 17
            contracts right away.
          </TipItem>
          <TipItem>
            Close all your trades before{" "}
            <span className="text-white font-medium">
              4:59 PM Eastern Time
            </span>{" "}
            every day. If you leave a trade open, it could get auto-closed and
            you might fail.
          </TipItem>
          <TipItem>You cannot hold trades overnight.</TipItem>
          <TipItem>
            After passing, you pay a $105/month activation fee (or $280
            one-time) to start your funded account.
          </TipItem>
          <TipItem>
            Your profit split is 100% on the first $25,000 you earn, then
            90/10 after that.
          </TipItem>
        </div>
      </div>
    </div>
  );
}

// ─── BluSky Trading ───────────────────────────────────────
function BluSkyGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-400" />
            The Basics
          </h3>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">4.5</span>
            <span className="text-[10px] text-slate-500">(800+ reviews)</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          BluSky Trading Company is a newer prop firm that started in 2022,
          based in St. Petersburg, Florida. BluSky stands out because of their
          static (fixed) drawdown — meaning the drawdown line doesn&apos;t move
          — and they offer free one-on-one coaching.
        </p>
        <a
          href="https://blusky.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          blusky.pro <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          $150K Account Details
        </h3>
        <div className="divide-y divide-white/5">
          <DetailRow label="Plan name" value="150K Static Growth" />
          <DetailRow label="Normal price" value="$170 / month" />
          <DetailRow
            label="With 30% off (30OFF)"
            value="~$119 / month"
            highlight
          />
          <DetailRow label="Profit target" value="$3,000" />
          <DetailRow label="Drawdown" value="$1,000 static (fixed)" />
          <DetailRow label="Min trading days" value="4–8 days" />
          <DetailRow label="Max contracts" value="1 mini / 100 micros" />
          <DetailRow label="Daily loss limit" value="None" />
          <DetailRow
            label="Consistency rule"
            value="No single day > 30% of target ($900)"
          />
        </div>
      </div>

      {/* Tight drawdown warning */}
      <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Very Important: The Drawdown Is Tight
        </h3>
        <p className="text-xs text-orange-200/70">
          The drawdown on BluSky&apos;s 150K Static Growth plan is only $1,000.
          This means your account cannot drop below $149,000 — ever. Even a
          small losing streak can end your account. You are also limited to just
          1 mini contract (or 100 micros). Trade very carefully and use tight
          stop-losses.
        </p>
        <p className="text-xs text-orange-200/70">
          The upside is that the drawdown is{" "}
          <span className="text-orange-300 font-medium">static</span> — it
          does not trail upward. Once you make profit, you have more breathing
          room. The profit target ($3,000) is also lower than most firms.
        </p>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          How to Sign Up — Step by Step
        </h3>
        <div className="space-y-0">
          <StepCard number={1} title="Go to the website">
            <p>
              Open your web browser and go to{" "}
              <a href="https://blusky.pro" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                blusky.pro
              </a>.
            </p>
          </StepCard>
          <StepCard number={2} title='Click "Sign Up Today"'>
            <p>Click the signup button in the top-right corner of the page.</p>
          </StepCard>
          <StepCard number={3} title="Create your account">
            <p>Enter your email address or sign up with your Google account.</p>
          </StepCard>
          <StepCard number={4} title="Go to the Plans page">
            <p>
              Click on <span className="text-white font-medium">&quot;Plans&quot;</span> in the menu. You will see tabs for different plan types: Launch Plans, Premium Evaluations, Static Evaluations, and Instant Funding.
            </p>
          </StepCard>
          <StepCard number={5} title='Click on "Static Evaluations"'>
            <p>Click the <span className="text-white font-medium">Static Evaluations</span> tab. This is where the 150K plan lives.</p>
          </StepCard>
          <StepCard number={6} title="Pick the 150K Static Growth plan">
            <p>Find the plan called <span className="text-white font-medium">&quot;150K Static Growth&quot;</span> and click it.</p>
          </StepCard>
          <StepCard number={7} title="Choose Tradovate">
            <p>During checkout, you will be asked to pick your platform. Choose <span className="text-white font-medium">Tradovate</span> (not Rithmic).</p>
          </StepCard>
          <StepCard number={8} title="Enter your coupon code">
            <p>In the coupon code box, type <code className="text-emerald-400 bg-emerald-500/10 px-1 rounded text-xs font-mono">30OFF</code> (or another code from the list below). This gives you 30% off — and the discount stays forever on all renewals.</p>
          </StepCard>
          <StepCard number={9} title="Pay">
            <p>Enter your payment information and submit. Your account is usually set up the same evening.</p>
          </StepCard>
        </div>
      </div>

      {/* After you pass */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" />
          After You Pass the Evaluation
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-6 h-6 rounded bg-sky-500/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-sky-400">1</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-white">BluLive Stage</span>
              <p className="text-xs text-slate-500 mt-0.5">Make another $2,000 in profit (same $1,000 drawdown) to build a buffer.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-6 h-6 rounded bg-sky-500/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-sky-400">2</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-white">Sim Funded Account</span>
              <p className="text-xs text-slate-500 mt-0.5">Trade with a simulated funded account. Profit split is 90/10 (you keep 90%).</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-6 h-6 rounded bg-sky-500/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-sky-400">3</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-white">Live Brokerage Account</span>
              <p className="text-xs text-slate-500 mt-0.5">After $10,000 in total profit, you may qualify for a real live account.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" />
          Coupon Codes
        </h3>
        <div className="space-y-2">
          <CouponChip code="30OFF" discount="30% off all Static & Premium — lifetime discount on renewals" />
          <CouponChip code="TradingPlus" discount="30% off first month" />
          <CouponChip code="SOPF" discount="30% off all accounts" />
          <CouponChip code="TICKTICKBOOM" discount="50% off Launch Plans only" />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Tips for New Users
        </h3>
        <div className="space-y-2">
          <TipItem>The <span className="text-white font-medium">30OFF</span> code gives you a lifetime discount — every renewal stays at 30% off.</TipItem>
          <TipItem>If you fail your evaluation, your account resets for free when your subscription renews.</TipItem>
          <TipItem>Take advantage of the free one-on-one coaching and Discord community they offer.</TipItem>
          <TipItem>Do not hold hedging positions (both long and short at the same time) — this will get your account closed immediately.</TipItem>
          <TipItem>Your progress carries over between months. If you don&apos;t finish in 30 days, just let it renew and keep going.</TipItem>
        </div>
      </div>
    </div>
  );
}

// ─── MyFundedFutures ──────────────────────────────────────
function MFFGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            The Basics
          </h3>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">4.7</span>
            <span className="text-[10px] text-slate-500">(70,000+ traders)</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          MyFundedFutures (MFFU) started in late 2023 and quickly became one of
          the most popular prop firms. They offer two plan types for the $150K
          account: the Rapid Plan (cheaper, with daily payouts) and the Pro Plan
          (higher payout ceiling). The drawdown is calculated at the end of the
          day (not in real time), which gives you more breathing room.
        </p>
        <a href="https://myfundedfutures.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
          myfundedfutures.com <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Rapid Plan Details */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Rapid Plan — $150K
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            Recommended
          </span>
        </div>
        <div className="divide-y divide-white/5">
          <DetailRow label="Normal price" value="$347 / month" />
          <DetailRow label="Profit target" value="$9,000" />
          <DetailRow label="Max drawdown" value="$4,500 end-of-day trailing" />
          <DetailRow label="Min trading days" value="2 days" />
          <DetailRow label="Max contracts" value="15 minis / 150 micros" />
          <DetailRow label="Daily loss limit" value="None" />
          <DetailRow label="Consistency rule" value="50% — no single day > 50% of total" />
          <DetailRow label="Profit split" value="90/10 (you keep 90%)" highlight />
          <DetailRow label="Payout frequency" value="Daily" highlight />
        </div>
      </div>

      {/* Pro Plan Details */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          Pro Plan — $150K
        </h3>
        <div className="divide-y divide-white/5">
          <DetailRow label="Normal price" value="$477 / month" />
          <DetailRow label="Profit target" value="$9,000" />
          <DetailRow label="Max drawdown" value="$4,500 end-of-day trailing" />
          <DetailRow label="Min trading days" value="2 days" />
          <DetailRow label="Max contracts" value="9 minis / 90 micros" />
          <DetailRow label="Consistency rule" value="50%" />
          <DetailRow label="Profit split" value="80/20 (you keep 80%)" />
          <DetailRow label="Payout frequency" value="Every 14 days" />
        </div>
      </div>

      {/* EOD Drawdown */}
      <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-sky-300 mb-1">End-of-Day Drawdown Advantage</h4>
          <p className="text-xs text-sky-200/70">
            MFF&apos;s drawdown only updates at the end of each trading day, not in
            real time. If your account goes up during the day but comes back down
            before the market closes, the drawdown line does not move up. The
            drawdown stops trailing once it reaches $150,100.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          How to Sign Up — Step by Step
        </h3>
        <div className="space-y-0">
          <StepCard number={1} title="Go to the website">
            <p>Open your browser and go to <a href="https://myfundedfutures.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">myfundedfutures.com</a>.</p>
          </StepCard>
          <StepCard number={2} title='Click "Get Funded"'>
            <p>Click the <span className="text-white font-medium">&quot;Get Funded&quot;</span> button, or go directly to myfundedfutures.com/challenge.</p>
          </StepCard>
          <StepCard number={3} title="Pick your plan type">
            <p>For the $150K account, choose either:</p>
            <div className="flex flex-col gap-2 mt-2">
              <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                <span className="font-semibold">Rapid Plan</span> — $347/month, daily payouts, 90/10 split (recommended)
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                <span className="font-semibold">Pro Plan</span> — $477/month, higher payout cap, 80/20 split
              </div>
            </div>
          </StepCard>
          <StepCard number={4} title="Select the $150,000 account size">
            <p>Click on <span className="text-white font-medium">$150,000</span> within your chosen plan.</p>
          </StepCard>
          <StepCard number={5} title="Choose Tradovate">
            <p>When asked to pick your trading platform, choose <span className="text-white font-medium">Tradovate</span>.</p>
          </StepCard>
          <StepCard number={6} title="Enter your coupon code">
            <p>On the payment page, find the &quot;Coupon Code&quot; box. Type in your code and click &quot;Apply.&quot;</p>
          </StepCard>
          <StepCard number={7} title="Create your account and pay">
            <p>Fill in your name, email, and payment details. Click <span className="text-white font-medium">&quot;Place Order.&quot;</span></p>
          </StepCard>
          <StepCard number={8} title="Get your Tradovate login">
            <p>After you pay, go to your MFFU Dashboard. Your Tradovate login credentials will be right there. Go to <span className="text-white font-medium">trader.tradovate.com</span>, log in, sign the data agreement, and click &quot;Continue&quot; under Simulation.</p>
          </StepCard>
        </div>
      </div>

      {/* Coupons */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" />
          Coupon Codes
        </h3>
        <p className="text-xs text-slate-500">Always check myfundedfutures.com/coupons before you buy — they list their current official deals there.</p>
        <div className="space-y-2">
          <CouponChip code="UNCAPPED" discount="50% off (new) / 30% off (existing) — best for Pro Plan" />
          <CouponChip code="RAPID" discount="20% off — best for Rapid Plan" />
          <CouponChip code="MFFU" discount="5% off any plan" />
          <CouponChip code="STEADY" discount="~46% off Flex Plans only" />
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4" /> Tips for New Users
        </h3>
        <div className="space-y-2">
          <TipItem>The Rapid Plan is the best value — $130 cheaper/month than the Pro Plan, with daily payouts and a 90/10 split.</TipItem>
          <TipItem>You only need <span className="text-white font-medium">2 trading days</span> to pass — one of the lowest minimums in the industry.</TipItem>
          <TipItem>The 50% consistency rule means you need to spread profits across at least 2–3 days.</TipItem>
          <TipItem>You must make at least 1 trade per week on your funded account, or it can be closed.</TipItem>
          <TipItem>No activation fees on any plan — once you pass, you go straight to your funded account.</TipItem>
          <TipItem>Cancel your subscription right after passing to avoid being charged for another month.</TipItem>
        </div>
      </div>
    </div>
  );
}

// ─── Take Profit Trader ───────────────────────────────────
function TPTGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-green-400" />
            The Basics
          </h3>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">4.4</span>
            <span className="text-[10px] text-slate-500">(8,300+ reviews)</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Take Profit Trader (TPT) started in 2021 in Orlando, Florida. TPT is
          known for same-day payouts and supports over 15 trading platforms,
          including Tradovate. Their evaluation drawdown is calculated at the end
          of the day, which is trader-friendly.
        </p>
        <a href="https://takeprofittrader.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
          takeprofittrader.com <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          $150K Account Details
        </h3>
        <div className="divide-y divide-white/5">
          <DetailRow label="Plan name" value="$150K Test Account" />
          <DetailRow label="Normal price" value="$360 / month" />
          <DetailRow label="With NOFEE40 code" value="~$216 / month (40% off for life)" highlight />
          <DetailRow label="Profit target" value="$9,000" />
          <DetailRow label="Max drawdown" value="$4,500 end-of-day trailing" />
          <DetailRow label="Min trading days" value="5 days" />
          <DetailRow label="Max contracts" value="15 minis / 150 micros" />
          <DetailRow label="Consistency rule" value="50% — no single day > 50% of total" />
          <DetailRow label="Activation fee" value="$130 (waived with NOFEE codes)" />
          <DetailRow label="Commissions" value="$5 per round trip, $0.50 micros" />
        </div>
      </div>

      {/* Drawdown change warning */}
      <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Important: Drawdown Changes When Funded
        </h3>
        <p className="text-xs text-orange-200/70">
          During the test (evaluation), the drawdown is calculated end-of-day —
          very forgiving. But once you get funded (PRO account), the drawdown
          switches to <span className="text-orange-300 font-medium">intraday real-time trailing</span>. This is much
          stricter. Many traders are surprised by this change, so be prepared.
        </p>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-400" />
          How to Sign Up — Step by Step
        </h3>
        <div className="space-y-0">
          <StepCard number={1} title="Go to the website">
            <p>Open your browser and go to <a href="https://takeprofittrader.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">takeprofittrader.com</a>.</p>
          </StepCard>
          <StepCard number={2} title='Click "Get Started Now"'>
            <p>Click the button or scroll down to see the account options.</p>
          </StepCard>
          <StepCard number={3} title="Pick the $150K account">
            <p>Find the <span className="text-white font-medium">$150K</span> option and click on it.</p>
          </StepCard>
          <StepCard number={4} title="Create your account">
            <p>Enter your email address and create a password. Check your email and click the verification link they send you.</p>
          </StepCard>
          <StepCard number={5} title="Choose CQG/Tradovate">
            <p>You will be asked to pick your data feed. Choose <span className="text-white font-medium">CQG</span> — this is what connects to Tradovate.</p>
            <div className="mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <p className="text-xs text-red-300 font-medium">
                Do NOT pick Rithmic — that will not work with Tradovate.
              </p>
            </div>
          </StepCard>
          <StepCard number={6} title="Enter your coupon code">
            <p>In the discount code box, type <code className="text-emerald-400 bg-emerald-500/10 px-1 rounded text-xs font-mono">NOFEE40</code>. This gives you 40% off forever and removes activation fees.</p>
          </StepCard>
          <StepCard number={7} title="Pay">
            <p>Enter your credit card, debit card, or PayPal information. Click &quot;Place Order.&quot;</p>
          </StepCard>
          <StepCard number={8} title="Set up Tradovate">
            <p>You will receive Tradovate login details in your email. Go to <span className="text-white font-medium">trader.tradovate.com</span> and log in. Complete the Non-Professional Market Data Agreement. Your account will be ready in about 10–15 minutes.</p>
          </StepCard>
        </div>
      </div>

      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" /> Coupon Codes
        </h3>
        <div className="space-y-2">
          <CouponChip code="NOFEE40" discount="40% off for life + no activation fees (best overall)" />
          <CouponChip code="NOFEE30" discount="30% off for life + no activation fees" />
          <CouponChip code="50AND100" discount="50% off monthly + refund on initial fee" />
          <CouponChip code="BYEBYE" discount="50% off all accounts" />
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4" /> Tips for New Users
        </h3>
        <div className="space-y-2">
          <TipItem>Use the <span className="text-white font-medium">NOFEE40</span> code — it saves 40% on every payment forever and removes the $130 activation fee.</TipItem>
          <TipItem>Remember to choose <span className="text-white font-medium">CQG</span> (not Rithmic) as your data feed during signup.</TipItem>
          <TipItem>TPT is known for fast payouts — often same-day.</TipItem>
          <TipItem>You get day-one withdrawal ability on your funded account — but you must first build a $4,500 buffer.</TipItem>
          <TipItem>After earning about $5,000 in profit on your PRO account, you may be invited to a PRO+ account with a 90/10 split and a real live account.</TipItem>
        </div>
      </div>
    </div>
  );
}

// ─── Elite Trader Funding ─────────────────────────────────
function EliteGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            The Basics
          </h3>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">4.5+</span>
            <span className="text-[10px] text-slate-500">(13,000+ funded)</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Elite Trader Funding (ETF) started in February 2022 and is based in
          Delaware. They have paid over $12 million to 13,000+ funded traders.
          They offer several evaluation styles (1-Step, EOD, Static, Fast Track,
          and Diamond Hands). They fully support Tradovate and include a free
          NinjaTrader license with every account.
        </p>
        <a href="https://elitetraderfunding.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
          elitetraderfunding.com <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          $150K Account Details (1-Step)
        </h3>
        <div className="divide-y divide-white/5">
          <DetailRow label="Plan name" value="1-Step Evaluation — $150K" />
          <DetailRow label="Estimated price" value="~$300–350 / month (before discounts)" />
          <DetailRow label="Profit target" value="$9,000" />
          <DetailRow label="Max drawdown" value="$5,000 trailing (real-time)" />
          <DetailRow label="Min trading days" value="5 days" />
          <DetailRow label="Max contracts" value="15" />
          <DetailRow label="Daily loss limit" value="None" />
          <DetailRow label="Consistency rule" value="None during evaluation (40% on funded)" />
          <DetailRow label="Reset fee" value="$75" />
          <DetailRow label="Activation fee" value="$80/mo or $150–300 one-time" />
          <DetailRow label="Profit split" value="100% of first $12,500, then 90%" highlight />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          How to Sign Up — Step by Step
        </h3>
        <div className="space-y-0">
          <StepCard number={1} title="Go to the website">
            <p>Open your browser and go to <a href="https://elitetraderfunding.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">elitetraderfunding.com</a>.</p>
          </StepCard>
          <StepCard number={2} title='Click "Evaluations"'>
            <p>Click the <span className="text-white font-medium">Evaluations</span> link in the menu to see all plan types.</p>
          </StepCard>
          <StepCard number={3} title="Pick the 1-Step evaluation">
            <p>Choose <span className="text-white font-medium">&quot;1-Step Evaluation&quot;</span> — this is the simplest and most popular option.</p>
          </StepCard>
          <StepCard number={4} title="Choose the $150K account size">
            <p>Select <span className="text-white font-medium">$150K</span> from the account sizes listed. Click &quot;Buy Now.&quot;</p>
          </StepCard>
          <StepCard number={5} title="Enter your coupon code">
            <p>Find the &quot;Promo Code&quot; box. Type in your code and click &quot;Redeem.&quot; The price should drop.</p>
          </StepCard>
          <StepCard number={6} title="Fill in your details">
            <p>Enter your name, email address, and billing information.</p>
          </StepCard>
          <StepCard number={7} title="Choose Tradovate">
            <p>When asked to pick your trading platform, select <span className="text-white font-medium">Tradovate</span> (you can also pick TradingView, which connects through Tradovate).</p>
          </StepCard>
          <StepCard number={8} title="Pay">
            <p>Enter your payment details and submit. You will receive your Tradovate login credentials in your email and on your Trader Dashboard.</p>
          </StepCard>
          <StepCard number={9} title="Set up Tradovate">
            <p>Go to <span className="text-white font-medium">trader.tradovate.com</span>, log in with the credentials from your dashboard, and sign the data agreement. Start trading.</p>
          </StepCard>
        </div>
      </div>

      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" /> Coupon Codes
        </h3>
        <p className="text-xs text-slate-500">ETF runs huge holiday sales (up to 80–90% off) on Black Friday, Memorial Day, and Labor Day.</p>
        <div className="space-y-2">
          <CouponChip code="40OFF" discount="40% off first month (1-Step, EOD, Static)" />
          <CouponChip code="10OFF" discount="10% off Fast Track and Diamond Hands" />
          <CouponChip code="ETF4EVER" discount="Seasonal discount (varies)" />
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4" /> Tips for New Users
        </h3>
        <div className="space-y-2">
          <TipItem>The trailing drawdown follows unrealized profits — if your open trade is up $2,000 and comes back down, your drawdown line has already moved up.</TipItem>
          <TipItem>The 100% profit split on the first $12,500 is very generous — most firms only give 80–90%.</TipItem>
          <TipItem>A free NinjaTrader license is included with every evaluation.</TipItem>
          <TipItem>They have a rewards program — earn points for every dollar spent that can be used for free resets.</TipItem>
          <TipItem>Once funded, you need 10 Active Trading Days per payout cycle ($200+ in realized profit per day).</TipItem>
        </div>
      </div>
    </div>
  );
}

// ─── TradeDay ─────────────────────────────────────────────
function TradeDayGuide() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            The Basics
          </h3>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">4.6</span>
            <span className="text-[10px] text-slate-500">(1,200+ reviews)</span>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          TradeDay launched in 2023 and is based in Chicago, Illinois. Despite
          being newer, they have a 28% pass rate — one of the highest in the
          industry. TradeDay uses Tradovate as its primary broker, making it one
          of the best choices for Tradovate users. They have zero activation fees
          on all accounts.
        </p>
        <a href="https://tradeday.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
          tradeday.com <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Intraday (recommended) */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            $150K Intraday Evaluation
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            Best Value
          </span>
        </div>
        <div className="divide-y divide-white/5">
          <DetailRow label="Normal price" value="$300 / month" />
          <DetailRow label="With SAVE30 code" value="$210 / month" highlight />
          <DetailRow label="Profit target" value="$9,000" />
          <DetailRow label="Max drawdown" value="$4,000 trailing (intraday)" />
          <DetailRow label="Min trading days" value="5 days" />
          <DetailRow label="Max contracts" value="15 minis / 50 micros" />
          <DetailRow label="Consistency rule" value="30% — no single day > 30% of total" />
          <DetailRow label="Activation fee" value="$0 — None!" highlight />
          <DetailRow label="Profit split" value="80% from day one, scaling to 95%" />
        </div>
      </div>

      {/* Other options */}
      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          Other $150K Options
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <h4 className="text-xs font-semibold text-white mb-1">EOD</h4>
            <p className="text-[10px] text-slate-500">$262/mo (with SAVE30)</p>
            <p className="text-[10px] text-slate-500">$4,000 trailing (end-of-day)</p>
            <p className="text-[10px] text-slate-500">$9,000 target</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <h4 className="text-xs font-semibold text-white mb-1">Static</h4>
            <p className="text-[10px] text-slate-500">$245/mo (with SAVE30)</p>
            <p className="text-[10px] text-slate-500">$1,000 fixed drawdown</p>
            <p className="text-[10px] text-slate-500">$3,750 target</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          How to Sign Up — Step by Step
        </h3>
        <div className="space-y-0">
          <StepCard number={1} title="Go to the website">
            <p>Open your browser and go to <a href="https://tradeday.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">tradeday.com</a>.</p>
          </StepCard>
          <StepCard number={2} title="Go to the pricing page">
            <p>Click <span className="text-white font-medium">&quot;Our Pricing&quot;</span> in the menu.</p>
          </StepCard>
          <StepCard number={3} title="Pick your drawdown type">
            <p>TradeDay offers three types of $150K accounts. For most traders, the <span className="text-white font-medium">Intraday</span> option is the best value.</p>
          </StepCard>
          <StepCard number={4} title="Select the $150K size">
            <p>Click on the <span className="text-white font-medium">$150K</span> option within your chosen drawdown type.</p>
          </StepCard>
          <StepCard number={5} title='Click "Get Started"'>
            <p>This takes you to the signup page.</p>
          </StepCard>
          <StepCard number={6} title="Enter your coupon code">
            <p>Type <code className="text-emerald-400 bg-emerald-500/10 px-1 rounded text-xs font-mono">SAVE30</code> in the coupon box. This gives you 30% off plus no activation fees for life.</p>
          </StepCard>
          <StepCard number={7} title="Create your account">
            <p>Fill in your name, email, and other registration details.</p>
          </StepCard>
          <StepCard number={8} title="Pay">
            <p>Enter your credit card, debit card, or PayPal information and submit payment.</p>
          </StepCard>
          <StepCard number={9} title="Set up Tradovate">
            <p>You will receive Tradovate login details by email. Go to <span className="text-white font-medium">trader.tradovate.com</span>, log in, sign the data agreements, and you&apos;re ready to go.</p>
          </StepCard>
        </div>
      </div>

      <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" /> Coupon Codes
        </h3>
        <div className="space-y-2">
          <CouponChip code="SAVE30" discount="30% off + no activation fees for life" />
          <CouponChip code="TD40" discount="40% off" />
          <CouponChip code="PAVT" discount="40% off" />
          <CouponChip code="NOFEE30" discount="30% off + no activation fees" />
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
          <Info className="w-4 h-4" /> Tips for New Users
        </h3>
        <div className="space-y-2">
          <TipItem>TradeDay has <span className="text-white font-medium">no activation fee</span> — once you pass, you go straight to your funded account for free.</TipItem>
          <TipItem>Their 30% consistency rule is stricter than the 50% rule at other firms. Spread your profits across more days.</TipItem>
          <TipItem>TradeDay uses Tradovate as its primary broker, so the integration is excellent and seamless.</TipItem>
          <TipItem>Day-one payouts are available after you pass — processed within 24 hours.</TipItem>
          <TipItem>You can hold up to 6 accounts at the same time.</TipItem>
          <TipItem>Free reset on subscription renewal — if you fail, just let it renew and start over.</TipItem>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FIRM TABS DATA
// ═══════════════════════════════════════════════════════════
const FIRMS = [
  { id: "apex", name: "Apex", color: "#3b82f6", short: "APX" },
  { id: "blusky", name: "BluSky", color: "#0ea5e9", short: "BLU" },
  { id: "mff", name: "MFF", color: "#a855f7", short: "MFF" },
  { id: "tpt", name: "Take Profit", color: "#22c55e", short: "TPT" },
  { id: "elite", name: "Elite", color: "#f59e0b", short: "ETF" },
  { id: "tradeday", name: "TradeDay", color: "#6366f1", short: "TD" },
];

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function PropFirmGuidePage() {
  const [activeTab, setActiveTab] = useState("apex");

  const guideComponents: Record<string, React.ReactNode> = {
    apex: <ApexGuide />,
    blusky: <BluSkyGuide />,
    mff: <MFFGuide />,
    tpt: <TPTGuide />,
    elite: <EliteGuide />,
    tradeday: <TradeDayGuide />,
  };

  return (
    <div className="p-4 lg:p-8 overflow-auto">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <a href="/client-dashboard" className="hover:text-slate-300 transition-colors">Dashboard</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-300">Get a Prop Firm Account</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            How to Get a Prop Firm Account
          </h1>
          <p className="leading-relaxed md:text-base text-sm text-slate-400 max-w-2xl">
            Sign up for a futures prop firm evaluation account. Pass the test, and you get to trade with their money and keep most of the profits.
          </p>
        </div>

        {/* What is a prop firm evaluation */}
        <div className="bg-[#13161C] border border-white/5 rounded-xl p-6 lg:p-8 flex flex-col gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 relative z-10">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            What Is a Prop Firm Evaluation?
          </h2>
          <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
            A prop firm evaluation is like a test drive. The firm gives you a
            simulated account with $150,000 in it. You trade with that fake
            money. If you make enough profit without losing too much, you
            &quot;pass.&quot; Then the firm gives you a real funded account. You
            trade with their money and keep 80–100% of the profits you make.
          </p>
          <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
            Every firm has rules you must follow. The two biggest rules are the{" "}
            <span className="text-white font-medium">profit target</span> (how
            much you need to make) and the{" "}
            <span className="text-white font-medium">drawdown</span> (the most
            you&apos;re allowed to lose). If your account drops below the
            drawdown limit, you fail and have to start over.
          </p>
        </div>

        {/* Three Things to Remember */}
        <div className="bg-[#13161C] border border-white/5 rounded-xl p-6 lg:p-8 flex flex-col gap-5 relative overflow-hidden">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Three Things to Always Remember
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white mb-1">
                1
              </div>
              <h4 className="text-sm font-medium text-slate-200">
                You Need a Tradovate Login
              </h4>
              <p className="text-xs text-slate-400">
                That&apos;s what your trading service uses to place trades. Every
                firm below gives you Tradovate credentials after you sign up.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white mb-1">
                2
              </div>
              <h4 className="text-sm font-medium text-slate-200">
                Pick the $150K Account
              </h4>
              <p className="text-xs text-slate-400">
                Every time you sign up, choose the $150K account size. This is
                the recommended size for the best balance of cost and
                opportunity.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white mb-1">
                3
              </div>
              <h4 className="text-sm font-medium text-slate-200">
                Always Use a Coupon Code
              </h4>
              <p className="text-xs text-slate-400">
                Never pay full price. These firms almost always have discounts of
                20–90% off. Each firm section below has coupon codes you can copy.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Comparison Table */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Quick Comparison — All Six Firms
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-500">
                  <th className="text-left py-3 px-4 font-medium">Firm</th>
                  <th className="text-left py-3 px-4 font-medium">Cost (w/ discount)</th>
                  <th className="text-left py-3 px-4 font-medium">Target</th>
                  <th className="text-left py-3 px-4 font-medium">Drawdown</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Min Days</th>
                  <th className="text-left py-3 px-4 font-medium">Activation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setActiveTab("apex")}>
                  <td className="py-3 px-4 font-medium text-white">Apex</td>
                  <td className="py-3 px-4 text-emerald-400">~$40</td>
                  <td className="py-3 px-4">$9,000</td>
                  <td className="py-3 px-4">$5,000</td>
                  <td className="py-3 px-4">Trailing intraday</td>
                  <td className="py-3 px-4">7</td>
                  <td className="py-3 px-4">$105/mo</td>
                </tr>
                <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setActiveTab("blusky")}>
                  <td className="py-3 px-4 font-medium text-white">BluSky</td>
                  <td className="py-3 px-4 text-emerald-400">~$119</td>
                  <td className="py-3 px-4">$3,000</td>
                  <td className="py-3 px-4">$1,000</td>
                  <td className="py-3 px-4">Static (fixed)</td>
                  <td className="py-3 px-4">4–8</td>
                  <td className="py-3 px-4">$0</td>
                </tr>
                <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setActiveTab("mff")}>
                  <td className="py-3 px-4 font-medium text-white">MFF (Rapid)</td>
                  <td className="py-3 px-4 text-emerald-400">~$278</td>
                  <td className="py-3 px-4">$9,000</td>
                  <td className="py-3 px-4">$4,500</td>
                  <td className="py-3 px-4">Trailing EOD</td>
                  <td className="py-3 px-4">2</td>
                  <td className="py-3 px-4">$0</td>
                </tr>
                <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setActiveTab("tpt")}>
                  <td className="py-3 px-4 font-medium text-white">Take Profit</td>
                  <td className="py-3 px-4 text-emerald-400">~$216</td>
                  <td className="py-3 px-4">$9,000</td>
                  <td className="py-3 px-4">$4,500</td>
                  <td className="py-3 px-4">Trailing EOD</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">$130*</td>
                </tr>
                <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setActiveTab("elite")}>
                  <td className="py-3 px-4 font-medium text-white">Elite</td>
                  <td className="py-3 px-4 text-emerald-400">~$180–210</td>
                  <td className="py-3 px-4">$9,000</td>
                  <td className="py-3 px-4">$5,000</td>
                  <td className="py-3 px-4">Trailing intraday</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">$80/mo</td>
                </tr>
                <tr className="hover:bg-white/[0.02] cursor-pointer" onClick={() => setActiveTab("tradeday")}>
                  <td className="py-3 px-4 font-medium text-white">TradeDay</td>
                  <td className="py-3 px-4 text-emerald-400">~$210</td>
                  <td className="py-3 px-4">$9,000</td>
                  <td className="py-3 px-4">$4,000</td>
                  <td className="py-3 px-4">Trailing intraday</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4 text-emerald-400">$0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2 border-t border-white/5">
            <p className="text-[10px] text-slate-600">* Waived with NOFEE coupon codes. Click any row to jump to that firm&apos;s guide.</p>
          </div>
        </div>

        {/* Firm Tabs */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Detailed Sign-Up Guides
          </h2>

          {/* Tab Bar */}
          <div className="flex gap-1 bg-[#0B0E14] p-1 rounded-xl border border-white/5 overflow-x-auto">
            {FIRMS.map((firm) => (
              <button
                key={firm.id}
                onClick={() => setActiveTab(firm.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === firm.id
                    ? "bg-white/10 text-white border border-white/10 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ backgroundColor: firm.color, color: "#fff" }}
                >
                  {firm.short}
                </div>
                <span className="hidden sm:inline">{firm.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">{guideComponents[activeTab]}</div>
        </div>

        {/* Excluded Firms */}
        <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            Firms That Were Considered but Excluded
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
              <div>
                <span className="text-xs font-medium text-white">Topstep</span>
                <p className="text-xs text-slate-500 mt-0.5">No longer supports Tradovate. Since July 2025, all new accounts must use TopstepX (their own platform). Your trading service cannot connect through Tradovate.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
              <div>
                <span className="text-xs font-medium text-white">Earn2Trade</span>
                <p className="text-xs text-slate-500 mt-0.5">Uses Rithmic only. Does not support Tradovate at all.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
              <div>
                <span className="text-xs font-medium text-white">Bulenox</span>
                <p className="text-xs text-slate-500 mt-0.5">Primarily Rithmic-based. Does not offer native Tradovate login credentials.</p>
              </div>
            </div>
          </div>
        </div>

        {/* General Tips */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            General Tips That Apply to Every Firm
          </h2>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Before You Sign Up
            </h3>
            <div className="space-y-2">
              <TipItem>Always look for a coupon code first. Every firm runs regular discounts of 20–90% off. Never pay full price.</TipItem>
              <TipItem>Make sure you select <span className="text-white font-medium">Tradovate</span> as your platform (or CQG at Take Profit Trader, which connects to Tradovate).</TipItem>
              <TipItem>Always choose the <span className="text-white font-medium">$150K account size</span>.</TipItem>
              <TipItem>Use your <span className="text-white font-medium">real legal name</span> (the name on your government ID) when signing up. If your name doesn&apos;t match your ID, you will not be able to get paid later.</TipItem>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              After You Sign Up
            </h3>
            <div className="space-y-2">
              <TipItem>Go to <span className="text-white font-medium">trader.tradovate.com</span> on a computer (not the phone app) to set up your Tradovate account.</TipItem>
              <TipItem>When Tradovate asks if you are a &quot;Professional&quot; or &quot;Non-Professional,&quot; choose <span className="text-white font-medium">Non-Professional</span>.</TipItem>
              <TipItem>Sign all the data agreements so your market data turns on.</TipItem>
              <TipItem>Your Tradovate username and password are what you&apos;ll use to <a href="/client-dashboard/connect-guide" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">connect your account</a>. Keep them safe.</TipItem>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-blue-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              While Trading
            </h3>
            <div className="space-y-2">
              <TipItem>Close all trades before the market closes each day. Most firms require this by <span className="text-white font-medium">4:59 PM Eastern Time</span>.</TipItem>
              <TipItem>Never hold trades overnight or over the weekend.</TipItem>
              <TipItem>Watch your drawdown carefully — it is the #1 reason people fail evaluations.</TipItem>
              <TipItem>Start with a small number of contracts and work your way up. Just because you can trade 15 contracts doesn&apos;t mean you should.</TipItem>
              <TipItem>Be patient. There is no time limit at most firms, so take your time and trade carefully.</TipItem>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-500" />
            Common Questions
          </h2>
          <div className="space-y-2">
            <FAQItem
              question="What happens if I fail the evaluation?"
              answer={<p>Most firms let you reset your account for free when your monthly subscription renews. You start over with a fresh $150,000. Some firms also offer paid resets if you want to start over immediately without waiting.</p>}
            />
            <FAQItem
              question="How long does it take to pass?"
              answer={<p>It depends on the firm and your trading. Some firms only require 2 trading days (like MFF), while others require 5–7 days. There&apos;s usually no time limit, so you can take as long as you need.</p>}
            />
            <FAQItem
              question="Which firm should I pick?"
              answer={<p><span className="text-white font-medium">Apex</span> is the cheapest (as low as $40/month with a sale). <span className="text-white font-medium">MFF Rapid</span> has the fewest minimum trading days (just 2). <span className="text-white font-medium">TradeDay</span> has no activation fees and great Tradovate integration. It depends on what matters most to you — price, speed, or simplicity.</p>}
            />
            <FAQItem
              question="Can I have accounts at multiple firms?"
              answer={<p>Yes! Many traders have accounts at 2–3 firms at the same time. This diversifies your chances of passing and lets you compare the experience at each firm.</p>}
            />
            <FAQItem
              question="How do I connect my prop firm account after signing up?"
              answer={<p>After you sign up and get your Tradovate login, head over to our <a href="/client-dashboard/connect-guide" className="text-blue-400 hover:text-blue-300">Connection Guide</a> for step-by-step instructions on linking your Tradovate account to your dashboard.</p>}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; 2025 Algo FinTech Inc.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="/privacy-policy" className="hover:text-slate-400">Privacy Policy</a>
            <a href="/cookie-policy" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}
