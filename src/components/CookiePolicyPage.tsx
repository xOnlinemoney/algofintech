"use client";

import {
  Cookie,
  Shield,
  BarChart3,
  Settings,
  Pencil,
  ArrowRight,
  Chrome,
  Compass,
  Globe,
  Monitor,
  Mail,
  User,
  ExternalLink,
  Info,
} from "lucide-react";

const tocItems = [
  { id: "definitions", label: "1. What Are Cookies?" },
  { id: "why-use", label: "2. Why We Use Cookies" },
  { id: "categories", label: "3. Detailed Categories" },
  { id: "third-party", label: "4. Third-Party Services" },
  { id: "management", label: "5. How to Manage" },
  { id: "other-tech", label: "6. Other Technologies" },
  { id: "children", label: "7. Children\u2019s Privacy" },
  { id: "international", label: "8. International Transfer" },
  { id: "updates", label: "9. Policy Updates" },
  { id: "contact", label: "10. Contact Us" },
];

const whyCards = [
  {
    icon: Shield,
    color: "emerald",
    title: "Essential Functionality",
    desc: "Required for authentication, security (protecting against fraud), session management, and load balancing. The platform cannot function without these.",
  },
  {
    icon: BarChart3,
    color: "blue",
    title: "Performance & Analytics",
    desc: "Helps us understand how visitors use our site, identify technical errors, test new features (A/B testing), and optimize load times.",
  },
  {
    icon: Settings,
    color: "purple",
    title: "Personalization",
    desc: "Remembers settings like language, timezone, dark mode preference, and dashboard layout so you don\u2019t have to reset them every visit.",
  },
  {
    icon: Pencil,
    color: "amber",
    title: "Marketing",
    desc: "Used for campaign measurement, retargeting (showing ads on other sites), and understanding which marketing channels drive sign-ups.",
  },
];

const colorBorderMap: Record<string, string> = {
  emerald: "border-t-emerald-500/50",
  blue: "border-t-blue-500/50",
  purple: "border-t-purple-500/50",
  amber: "border-t-amber-500/50",
};
const colorTextMap: Record<string, string> = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
};

const necessaryCookies = [
  { name: "session_id", purpose: "Maintains your login session", duration: "Session", provider: "Algo FinTech" },
  { name: "csrf_token", purpose: "Protects against cross-site request forgery", duration: "Session", provider: "Algo FinTech" },
  { name: "__cf_bm", purpose: "Bot management and security", duration: "30 min", provider: "Cloudflare" },
  { name: "cookie_consent", purpose: "Stores your cookie preferences", duration: "1 year", provider: "Algo FinTech" },
];

const analyticsCookies = [
  { name: "_ga", purpose: "Google Analytics - distinguishes users", duration: "2 years", provider: "Google" },
  { name: "_gid", purpose: "Google Analytics - distinguishes users", duration: "24 hours", provider: "Google" },
  { name: "mp_*", purpose: "Mixpanel analytics - user tracking", duration: "1 year", provider: "Mixpanel" },
];

const marketingCookies = [
  { name: "_gcl_au", purpose: "Google Ads - Conversion tracking", duration: "90 days", provider: "Google" },
  { name: "fr, _fbp", purpose: "Facebook Pixel - Ad delivery & tracking", duration: "90 days", provider: "Facebook" },
  { name: "li_sugr", purpose: "LinkedIn - Browser identification", duration: "90 days", provider: "LinkedIn" },
];

const thirdPartyServices = [
  { name: "Google Analytics", desc: "Usage tracking & analytics", link: "https://policies.google.com/privacy", domain: "policies.google.com" },
  { name: "Mixpanel", desc: "Product analytics", link: "https://mixpanel.com/legal/privacy-policy", domain: "mixpanel.com" },
  { name: "Intercom", desc: "Customer chat support", link: "https://www.intercom.com/legal/privacy", domain: "intercom.com" },
  { name: "Stripe", desc: "Payment processing", link: "https://stripe.com/privacy", domain: "stripe.com" },
  { name: "Cloudflare", desc: "CDN & Security", link: "https://www.cloudflare.com/privacypolicy", domain: "cloudflare.com" },
  { name: "Meta / Facebook", desc: "Ad targeting", link: "https://www.facebook.com/privacy/explanation", domain: "facebook.com" },
];

const browserLinks = [
  { name: "Google Chrome", icon: Chrome, href: "https://support.google.com/chrome/answer/95647" },
  { name: "Mozilla Firefox", icon: Compass, href: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" },
  { name: "Safari (Mac)", icon: Globe, href: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
  { name: "Microsoft Edge", icon: Monitor, href: "https://support.microsoft.com/en-us/microsoft-edge" },
];

function CookieTable({ rows }: { rows: { name: string; purpose: string; duration: string; provider: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/5">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-xs text-slate-300 uppercase tracking-wider">
            <th className="p-3 border-b border-white/10 font-medium">Cookie Name</th>
            <th className="p-3 border-b border-white/10 font-medium">Purpose</th>
            <th className="p-3 border-b border-white/10 font-medium w-24">Duration</th>
            <th className="p-3 border-b border-white/10 font-medium w-32">Provider</th>
          </tr>
        </thead>
        <tbody className="text-xs text-slate-400">
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="p-3 border-b border-white/5 font-mono text-white">{row.name}</td>
              <td className="p-3 border-b border-white/5">{row.purpose}</td>
              <td className="p-3 border-b border-white/5">{row.duration}</td>
              <td className="p-3 border-b border-white/5">{row.provider}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicyPage() {
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] pointer-events-none opacity-20 bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/30 border border-indigo-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-medium text-indigo-400 tracking-wide uppercase">
                Legal Compliance
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
              Cookie Policy
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="font-mono">GDPR Compliant</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Last Updated: December 20, 2024</span>
            </div>

            <p className="text-lg text-slate-400 max-w-3xl leading-relaxed font-light mt-2">
              This Cookie Policy explains how Algo FinTech (operated by AlgoFintech
              Inc.) uses cookies and similar tracking technologies on our website
              and platform. This policy should be read alongside our Privacy
              Policy, which provides more information about how we collect, use,
              and protect your personal data.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <button className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Cookies
              </button>
              <a
                href="/privacy-policy"
                className="hover:bg-white/10 transition-colors text-sm font-medium text-white bg-white/5 border-white/10 border rounded-full px-5 py-2.5"
              >
                Privacy Policy
              </a>
            </div>
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
                  Table of Contents
                </h4>
                <nav className="space-y-0.5 border-l border-white/10 text-sm">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block pl-3 py-1.5 text-slate-400 hover:text-white hover:border-l-2 hover:border-indigo-500 border-l-2 border-transparent transition-all truncate"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h5 className="text-white text-sm font-medium mb-2">
                    Privacy Team
                  </h5>
                  <p className="text-xs text-slate-400 mb-3">
                    Questions about cookies?
                  </p>
                  <a
                    href="mailto:privacy@algofintech.com"
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    privacy@algofintech.com
                    <ArrowRight className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              {/* 1. What Are Cookies */}
              <section id="definitions" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Cookie className="w-[18px] h-[18px]" />
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    What Are Cookies?
                  </h2>
                </div>

                <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-6 rounded-xl space-y-4 text-sm leading-7 text-slate-400 mb-6">
                  <h3 className="text-white font-medium text-base">
                    1.1 Definition
                  </h3>
                  <p>
                    Cookies are small text files that are placed on your
                    computer, smartphone, or other device when you visit a
                    website. They are widely used to make websites work more
                    efficiently and provide information to website owners.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Session Cookies:</strong> Temporary cookies
                      deleted when you close your browser.
                    </li>
                    <li>
                      <strong>Persistent Cookies:</strong> Remain on your device
                      for a set period or until manually deleted.
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0B0E14] border border-white/5 p-5 rounded-xl">
                    <h4 className="text-white font-medium text-sm mb-3">
                      1.2 What They Collect
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-indigo-500">&bull;</span> Browser
                        type &amp; operating system
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-500">&bull;</span> IP
                        Address (Approximate location)
                      </li>
                    </ul>
                  </div>
                  <div className="bg-[#0B0E14] border border-white/5 p-5 rounded-xl">
                    <h4 className="text-white font-medium text-sm mb-3">
                      1.3 Legal Basis
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-indigo-500">&bull;</span>
                        <span>
                          <strong>Consent:</strong> For analytics &amp;
                          marketing cookies.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-500">&bull;</span>
                        <span>
                          <strong>Legitimate Interest:</strong> For essential
                          security/functionality.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 2. Why We Use Cookies */}
              <section id="why-use" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono text-sm font-bold">
                    02
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    Why We Use Cookies
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whyCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.title}
                        className={`bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-6 rounded-xl border-t-2 ${colorBorderMap[card.color]}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Icon
                            className={`w-4 h-4 ${colorTextMap[card.color]}`}
                          />
                          <h3 className="text-white font-medium text-sm">
                            {card.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 3. Detailed Categories */}
              <section id="categories" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono text-sm font-bold">
                    03
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    Detailed Cookie Categories
                  </h2>
                </div>

                {/* Strictly Necessary */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-white font-medium">
                      3.1 Strictly Necessary Cookies
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Essential for website operation and security. These cannot be
                    disabled in our systems.
                  </p>
                  <CookieTable rows={necessaryCookies} />
                </div>

                {/* Analytics */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-white font-medium">
                      3.2 Analytics &amp; Performance
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Allow us to count visits and traffic sources so we can
                    measure and improve performance. Data is aggregated and
                    anonymized.
                  </p>
                  <CookieTable rows={analyticsCookies} />
                </div>

                {/* Marketing */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="text-white font-medium">
                      3.3 Marketing &amp; Advertising
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Set by our advertising partners to build a profile of your
                    interests and show relevant ads on other sites.
                  </p>
                  <CookieTable rows={marketingCookies} />
                </div>
              </section>

              {/* 4. Third-Party */}
              <section id="third-party" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono text-sm font-bold">
                    04
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    Third-Party Cookies
                  </h2>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Some cookies are set by third-party services we use. We
                  don&apos;t control these cookies&mdash;they are governed by the
                  third party&apos;s privacy policy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {thirdPartyServices.map((s) => (
                    <a
                      key={s.name}
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-[#0B0E14] border border-white/5 rounded-lg hover:border-indigo-500/30 transition-colors group"
                    >
                      <h5 className="text-white text-sm font-medium mb-1 group-hover:text-indigo-400 transition-colors">
                        {s.name}
                      </h5>
                      <p className="text-xs text-slate-500">{s.desc}</p>
                      <span className="text-[10px] text-slate-600 mt-2 block">
                        {s.domain} &rarr;
                      </span>
                    </a>
                  ))}
                </div>
              </section>

              {/* 5. How to Control */}
              <section id="management" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono text-sm font-bold">
                    05
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    How to Control Cookies
                  </h2>
                </div>

                <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium text-sm mb-1">
                      Preference Center
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage your consent for non-essential cookies on our site
                      directly.
                    </p>
                  </div>
                  <button className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors">
                    Open Cookie Settings
                  </button>
                </div>

                <h3 className="text-white font-medium text-sm mb-4">
                  Browser Settings
                </h3>
                <div className="space-y-4 text-sm text-slate-400">
                  <p>
                    You can block or delete cookies through your browser
                    settings. Be aware that blocking strictly necessary cookies
                    may cause our platform to stop working.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {browserLinks.map((b) => {
                      const Icon = b.icon;
                      return (
                        <a
                          key={b.name}
                          href={b.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-[#0B0E14] border border-white/5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-slate-300">
                            {b.name}
                          </span>
                        </a>
                      );
                    })}
                  </div>

                  <h3 className="text-white font-medium text-sm mt-6 mb-2">
                    Industry Opt-Out Tools
                  </h3>
                  <ul className="list-disc pl-5 text-xs space-y-2">
                    <li>
                      <a
                        href="http://optout.aboutads.info/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        Digital Advertising Alliance (DAA)
                      </a>
                    </li>
                    <li>
                      <a
                        href="http://www.youronlinechoices.eu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        European Interactive Digital Advertising Alliance (EDAA)
                      </a>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 6. Other Tech */}
              <section id="other-tech" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono text-sm font-bold">
                    06
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    Other Tracking Technologies
                  </h2>
                </div>
                <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-6 rounded-xl space-y-6">
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">
                      Web Beacons (Pixels)
                    </h4>
                    <p className="text-sm text-slate-400">
                      Small transparent images in emails and on web pages. We use
                      these to track email opens and verify page views. To
                      control these, you can disable images in your email client.
                    </p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-white font-medium text-sm mb-2">
                      Local Storage
                    </h4>
                    <p className="text-sm text-slate-400">
                      Allows us to store data locally on your browser (up to
                      10MB) to cache preferences and improve performance. This
                      data doesn&apos;t expire automatically but can be cleared
                      via browser settings.
                    </p>
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-white font-medium text-sm mb-2">
                      Device Fingerprinting
                    </h4>
                    <p className="text-sm text-slate-400">
                      We collect device characteristics (resolution, browser
                      version) primarily for fraud detection and security
                      monitoring, not for individual user tracking.
                    </p>
                  </div>
                </div>
              </section>

              {/* 7 & 8 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <section id="children" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-slate-500 font-mono text-sm font-bold">
                      07
                    </span>
                    <h2 className="text-xl font-semibold text-white">
                      Children&apos;s Privacy
                    </h2>
                  </div>
                  <div className="bg-[#0B0E14] p-6 rounded-lg border border-white/5 h-full">
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      Our services are not intended for individuals under 18. We
                      do not knowingly collect data from or set cookies on
                      devices used by children.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      If you believe a child has provided us with information,
                      please contact{" "}
                      <a
                        href="mailto:privacy@algofintech.com"
                        className="text-indigo-400 hover:underline"
                      >
                        privacy@algofintech.com
                      </a>{" "}
                      immediately.
                    </p>
                  </div>
                </section>

                <section id="international" className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-slate-500 font-mono text-sm font-bold">
                      08
                    </span>
                    <h2 className="text-xl font-semibold text-white">
                      International Transfers
                    </h2>
                  </div>
                  <div className="bg-[#0B0E14] p-6 rounded-lg border border-white/5 h-full">
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      Our servers are in the US. Cookie data may be processed
                      outside your home country. For EEA/UK users, we use
                      Standard Contractual Clauses (SCCs) for transfers.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      By using our service, you consent to this transfer as
                      described in our Privacy Policy.
                    </p>
                  </div>
                </section>
              </div>

              {/* 9. Updates */}
              <section id="updates" className="mb-16 scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-indigo-500 font-mono text-sm font-bold">
                    09
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    Updates to This Policy
                  </h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  We may update this policy to reflect changes in technology,
                  regulation, or our operations. Material changes will be
                  communicated via email or a prominent notice on the platform.
                </p>
                <p className="text-sm text-slate-400">
                  Check the &ldquo;Last Updated&rdquo; date at the top of this
                  page. Previous versions are available upon request.
                </p>
              </section>

              {/* 10. Contact */}
              <section id="contact" className="scroll-mt-32 pb-20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-indigo-500 font-mono text-sm font-bold">
                    10
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    Contact Us
                  </h2>
                </div>
                <div className="bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 p-8 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-white font-medium mb-4">
                        Have questions about cookies?
                      </h4>
                      <div className="space-y-4 text-sm text-slate-400">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-indigo-400 mt-0.5" />
                          <div>
                            <span className="block text-white font-medium">
                              Privacy Team
                            </span>
                            <a
                              href="mailto:privacy@algofintech.com"
                              className="hover:text-indigo-400 transition-colors"
                            >
                              privacy@algofintech.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-indigo-400 mt-0.5" />
                          <div>
                            <span className="block text-white font-medium">
                              Data Protection Officer
                            </span>
                            <a
                              href="mailto:dpo@algofintech.com"
                              className="hover:text-indigo-400 transition-colors"
                            >
                              dpo@algofintech.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-5 border border-white/5">
                      <h5 className="text-white font-medium text-xs uppercase tracking-wide mb-3">
                        Complaints
                      </h5>
                      <p className="text-xs text-slate-400 mb-3">
                        If you are in the EU/EEA, you have the right to lodge a
                        complaint with your local supervisory authority.
                      </p>
                      <a
                        href="https://edpb.europa.eu/about-edpb/board/members_en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        Find your authority
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
