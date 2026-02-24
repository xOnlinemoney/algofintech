"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  Eye,
  Building2,
  Palette,
  Globe,
  Mail,
  Type,
  Settings as SettingsIcon,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  Trash2,
  Camera,
  Bookmark,
  Info,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Star,
  X,
  Hourglass,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";

/* ─── Types ─── */
interface AgencyData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  created_at: string;
  logo_url: string | null;
  primary_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  website: string | null;
  license_key: string | null;
}

interface EmailTemplate {
  enabled: boolean;
  subject: string;
  body: string;
}

interface SettingsData {
  business_name: string;
  display_name: string;
  primary_color: string;
  secondary_color: string;
  bg_mode: string;
  card_bg_color: string;
  logo_url: string;
  favicon_url: string;
  custom_domain: string;
  sender_name: string;
  reply_to_email: string;
  use_custom_smtp: boolean;
  smtp_provider: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_email: string;
  email_templates: Record<string, EmailTemplate>;
  business_address: string;
  business_city: string;
  business_state: string;
  business_zip: string;
  business_country: string;
  tax_id: string;
  support_email: string;
  support_phone: string;
  support_url: string;
  welcome_message: string;
  api_enabled: boolean;
  webhook_url: string;
}

type TabId = "basic" | "branding" | "domain" | "business" | "support" | "api" | "team";

const TABS: { id: TabId; label: string }[] = [
  { id: "basic", label: "Basic Information" },
  { id: "branding", label: "Branding & Theme" },
  { id: "domain", label: "Domain & Email" },
  { id: "business", label: "Business Details" },
  { id: "support", label: "Communication & Support" },
  { id: "api", label: "API & Integrations" },
  { id: "team", label: "Team & Security" },
];

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export default function WhiteLabelSettingsPage() {
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showTierFeatures, setShowTierFeatures] = useState(false);
  const [showPendingBanner, setShowPendingBanner] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [domainStatus, setDomainStatus] = useState<string | null>(null);
  const [domainVerifiedAt, setDomainVerifiedAt] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dnsResults, setDnsResults] = useState<any>(null);

  const originalSettings = useRef<SettingsData | null>(null);

  // Load data
  useEffect(() => {
    async function fetchSettings() {
      try {
        const stored = localStorage.getItem("agency_session");
        if (!stored) return;
        const session = JSON.parse(stored);
        const res = await fetch(`/api/agency/settings?agency_id=${session.agency_id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAgency(data.agency);
        setSettings(data.settings);
        originalSettings.current = { ...data.settings };
        if (data.domain) {
          setDomainStatus(data.domain.status);
          setDomainVerifiedAt(data.domain.verified_at);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Track changes
  const updateSetting = useCallback(
    <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
      setSettings((prev) => {
        if (!prev) return prev;
        const next = { ...prev, [key]: value };
        setHasChanges(true);
        return next;
      });
    },
    []
  );

  // Update agency-level fields (contact email, phone, website)
  function updateAgency<K extends keyof AgencyData>(key: K, value: AgencyData[K]) {
    setAgency((prev) => {
      if (!prev) return prev;
      setHasChanges(true);
      return { ...prev, [key]: value };
    });
  }

  // Save
  async function handleSave() {
    if (!agency || !settings) return;
    setSaving(true);
    try {
      const stored = localStorage.getItem("agency_session");
      if (!stored) return;
      const session = JSON.parse(stored);

      const res = await fetch("/api/agency/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agency_id: session.agency_id,
          name: settings.business_name || agency.name,
          contact_email: agency.contact_email,
          contact_phone: agency.contact_phone,
          contact_name: agency.contact_name,
          website: agency.website,
          settings,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      // Update localStorage agency_session so sidebar reflects new name immediately
      const updatedSession = {
        ...session,
        agency_name: settings.business_name || session.agency_name,
      };
      localStorage.setItem("agency_session", JSON.stringify(updatedSession));

      originalSettings.current = { ...settings };
      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }

  // Copy helper
  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  // Tab switch
  function switchTab(tabId: TabId) {
    setActiveTab(tabId);
  }

  // Format date
  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function timeAgo(dateStr: string) {
    const now = new Date();
    const then = new Date(dateStr);
    const months = (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
    if (months < 1) return "Less than a month ago";
    if (months === 1) return "1 month ago";
    return `${months} months ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!agency || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Failed to load settings.</p>
      </div>
    );
  }

  const planLabel = PLAN_LABELS[agency.plan] || agency.plan;
  const isEnterprise = agency.plan === "enterprise";

  return (
    <div className="min-h-full w-full">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0B0E14]/95 backdrop-blur border-b border-white/5">
        <div className="mx-auto w-full max-w-[87.5rem] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="hover:text-slate-300 transition-colors cursor-pointer">Dashboard</span>
                <span className="text-slate-700">/</span>
                <span className="hover:text-slate-300 transition-colors cursor-pointer">Settings</span>
                <span className="text-slate-700">/</span>
                <span className="text-slate-300">White-Label Customization</span>
              </div>
              <div className="mt-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  White-Label Settings
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Customize your branding and client experience
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button className="h-10 px-4 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Preview Changes</span>
                <span className="sm:hidden text-sm font-medium">Preview</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>

          {/* Banners */}
          <div className="mt-4 space-y-3">
            {showPendingBanner && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
                <div className="mt-0.5 text-amber-400">
                  <Hourglass className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">Changes Pending Admin Approval</div>
                  <div className="text-sm text-slate-300 mt-0.5">
                    Your custom domain configuration is awaiting review
                  </div>
                </div>
                <button
                  onClick={() => setShowPendingBanner(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showUpgradeBanner && !isEnterprise && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-purple-500/20 bg-purple-500/10">
                <div className="mt-0.5 text-purple-300">
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">Unlock More Features</div>
                  <div className="text-sm text-slate-300 mt-0.5">
                    Upgrade to Enterprise for custom CSS, advanced API, and priority support.
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button className="text-sm font-medium text-purple-200 hover:text-white transition-colors flex items-center gap-1">
                      View Plans
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgradeBanner(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-5 -mb-px">
            <div className="overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-6 min-w-max border-b border-white/5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`relative py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[87.5rem] px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          {/* TAB: BASIC */}
          {activeTab === "basic" && (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              {/* Agency Profile */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Building2 className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight">Agency Profile</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Basic information about your agency</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.business_name}
                      onChange={(e) => updateSetting("business_name", e.target.value)}
                      maxLength={100}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
                      placeholder="Your agency name"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">This appears throughout the client dashboard</p>
                      <p className="text-xs text-slate-500">
                        {settings.business_name.length}/100
                      </p>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Display Name (Optional)</label>
                    <input
                      type="text"
                      value={settings.display_name}
                      onChange={(e) => updateSetting("display_name", e.target.value)}
                      maxLength={50}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
                      placeholder="Short version of your name"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Used in compact spaces (defaults to Business Name if blank)
                      </p>
                      <p className="text-xs text-slate-500">{settings.display_name.length}/50</p>
                    </div>
                  </div>

                  {/* Primary Contact Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">
                      Primary Contact Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={agency.contact_email || ""}
                        onChange={(e) => updateAgency("contact_email", e.target.value)}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
                        placeholder="name@yourdomain.com"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button
                          onClick={() => copyToClipboard(agency.contact_email || "", "email")}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {copiedField === "email" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Main email for agency communications</p>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Phone Number</label>
                    <input
                      type="tel"
                      value={agency.contact_phone || ""}
                      onChange={(e) => updateAgency("contact_phone", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                    <p className="text-xs text-slate-500">Agency contact phone</p>
                  </div>

                  {/* License Key (Read-only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-slate-400">License Key</label>
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-200 border border-amber-500/15 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide">
                        <Lock className="w-3 h-3" />
                        Read-Only
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-3 text-sm font-mono text-slate-500 cursor-not-allowed select-text">
                        {agency.license_key || "No license key"}
                      </div>
                      <button
                        onClick={() => copyToClipboard(agency.license_key || "", "license")}
                        className="h-[46px] px-3 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        {copiedField === "license" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Copy</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Your unique license identifier (cannot be changed)</p>
                  </div>

                  {/* Agency ID (Read-only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-slate-400">Agency ID</label>
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/5 text-slate-300 border border-white/10 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide">
                        <Lock className="w-3 h-3" />
                        Read-Only
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-3 text-sm font-mono text-slate-500 cursor-not-allowed select-text truncate">
                        {agency.id}
                      </div>
                      <button
                        onClick={() => copyToClipboard(agency.id, "agencyId")}
                        className="h-[46px] w-[46px] inline-flex items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {copiedField === "agencyId" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Date Joined (Read-only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-slate-400">Date Joined</label>
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/5 text-slate-300 border border-white/10 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide">
                        <Lock className="w-3 h-3" />
                        Read-Only
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-3 text-sm text-slate-400 cursor-not-allowed">
                      {formatDate(agency.created_at)}
                    </div>
                    <p className="text-xs text-slate-500">{timeAgo(agency.created_at)}</p>
                  </div>

                  {/* Subscription Tier */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Subscription Tier</label>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 text-sm font-semibold text-blue-300">
                      <Star className="w-4 h-4" />
                      {planLabel}
                    </div>
                    <details
                      open={showTierFeatures}
                      onToggle={(e) => setShowTierFeatures((e.target as HTMLDetailsElement).open)}
                    >
                      <summary className="cursor-pointer text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 mt-3">
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${showTierFeatures ? "rotate-90" : ""}`}
                        />
                        View Tier Features
                      </summary>
                      <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-4">
                        <ul className="space-y-2 text-sm text-slate-300">
                          {[
                            "Unlimited clients",
                            "Custom domain",
                            "White-label branding",
                            "Custom email templates",
                            "API access",
                            "Priority support",
                          ].map((f) => (
                            <li key={f} className="flex items-center gap-2">
                              <span className="text-emerald-400">
                                <Check className="w-4 h-4" />
                              </span>
                              {f}
                            </li>
                          ))}
                          <li className="flex items-center gap-2">
                            <span className={isEnterprise ? "text-emerald-400" : "text-slate-600"}>
                              {isEnterprise ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </span>
                            <span className={isEnterprise ? "" : "text-slate-600"}>
                              Custom CSS (Enterprise only)
                            </span>
                          </li>
                        </ul>
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              {/* Logo & Visual Identity */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Palette className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight">Logo & Visual Identity</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Your brand logos and visual assets</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Main Logo */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-400">Main Logo</label>
                      <span className="text-xs text-slate-500">PNG, JPG, SVG, WebP · Max 2MB</span>
                    </div>
                    <div className="bg-white/5 border border-dashed border-white/10 rounded-lg p-4 flex items-center justify-center h-40">
                      {settings.logo_url ? (
                        <img
                          src={settings.logo_url}
                          alt="Main logo preview"
                          className="max-w-[12.5rem] max-h-20 object-contain"
                        />
                      ) : (
                        <div className="text-slate-600 text-sm">No logo uploaded</div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all inline-flex items-center gap-2 cursor-pointer">
                        <Camera className="w-4 h-4" />
                        Change Logo
                        <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp" className="hidden" />
                      </label>
                      {settings.logo_url && (
                        <button
                          onClick={() => updateSetting("logo_url", "")}
                          className="h-10 px-4 rounded-lg border border-red-500/30 text-red-300 hover:text-white hover:bg-red-500/10 transition-colors text-sm font-medium inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove Logo
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Displayed in client dashboard header and emails</p>
                  </div>

                  {/* Favicon */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-400">Favicon (Browser Tab Icon)</label>
                      <span className="text-xs text-slate-500">ICO, PNG · Max 100KB</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <label className="w-28 h-28 bg-white/5 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors cursor-pointer">
                        <Bookmark className="w-[18px] h-[18px] text-slate-400" />
                        <span className="text-xs font-medium text-slate-300">Upload</span>
                        <span className="text-[0.625rem] text-slate-500">32×32</span>
                        <input type="file" accept=".ico,.png" className="hidden" />
                      </label>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 mb-2">Preview</div>
                        <div className="rounded-lg border border-white/10 bg-[#020408] p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                              {settings.favicon_url ? (
                                <img
                                  src={settings.favicon_url}
                                  alt="Favicon"
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded bg-blue-500/20" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate">
                                {settings.business_name || agency.name}
                              </div>
                              <div className="text-xs text-slate-500 truncate">your client dashboard</div>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          Icon shown in browser tabs and bookmarks
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logo URL */}
                  <div className="lg:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">
                      Logo URL (Alternative to Upload)
                    </label>
                    <input
                      type="url"
                      value={settings.logo_url}
                      onChange={(e) => updateSetting("logo_url", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
                      placeholder="https://your-cdn.com/logo.png"
                    />
                    <p className="text-xs text-slate-500">For logos hosted externally (overrides uploaded logo)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BRANDING */}
          {activeTab === "branding" && (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              {/* Color Scheme */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      <Palette className="w-[18px] h-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white tracking-tight">Color Scheme</h3>
                      <p className="text-sm text-slate-400 mt-0.5">Customize colors for the client dashboard</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      updateSetting("primary_color", "#3b82f6");
                      updateSetting("secondary_color", "#10b981");
                      updateSetting("card_bg_color", "#0B0E14");
                      updateSetting("bg_mode", "dark");
                    }}
                    className="h-9 px-3 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    Reset to Default
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    {/* Primary Color */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Primary Brand Color</label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                          style={{ background: settings.primary_color }}
                        />
                        <input
                          type="text"
                          value={settings.primary_color}
                          onChange={(e) => updateSetting("primary_color", e.target.value)}
                          className="w-28 bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Main color for buttons, links, and accents</p>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                          style={{ background: settings.secondary_color }}
                        />
                        <input
                          type="text"
                          value={settings.secondary_color}
                          onChange={(e) => updateSetting("secondary_color", e.target.value)}
                          className="w-28 bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Used for success states, positive values, highlights</p>
                    </div>

                    {/* Background Style */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">Dashboard Background Style</label>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { mode: "dark", label: "Dark Mode", desc: "Dark theme (recommended)", swatch: "#020408" },
                          { mode: "light", label: "Light Mode", desc: "Light theme", swatch: "#ffffff" },
                          { mode: "custom", label: "Custom Color", desc: "Choose your own background", swatch: "#111827" },
                        ].map((opt) => (
                          <button
                            key={opt.mode}
                            type="button"
                            onClick={() => updateSetting("bg_mode", opt.mode)}
                            className={`bg-[#020408] border rounded-lg p-4 text-left transition-colors ${
                              settings.bg_mode === opt.mode
                                ? "border-blue-500/40 hover:border-blue-500/60"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-3 h-3 rounded-full border ${
                                    settings.bg_mode === opt.mode
                                      ? "border-blue-500 bg-blue-500/40"
                                      : "border-white/20 bg-white/5"
                                  }`}
                                />
                                <span
                                  className={`text-sm font-semibold ${
                                    settings.bg_mode === opt.mode ? "text-white" : "text-slate-200"
                                  }`}
                                >
                                  {opt.label}
                                </span>
                              </div>
                              <span
                                className="w-6 h-6 rounded-md border border-white/10"
                                style={{ background: opt.swatch }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Background */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Card Background Color</label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                          style={{ background: settings.card_bg_color }}
                        />
                        <input
                          type="text"
                          value={settings.card_bg_color}
                          onChange={(e) => updateSetting("card_bg_color", e.target.value)}
                          className="w-28 bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Background for cards and panels</p>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">Preview</div>
                        <div className="text-xs text-slate-500 mt-0.5">Updates as you change settings</div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-white/10 overflow-hidden">
                      <div
                        className="px-4 py-3 border-b border-white/10 flex items-center justify-between"
                        style={{ background: settings.card_bg_color }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                            {settings.logo_url ? (
                              <img src={settings.logo_url} alt="" className="w-6 h-6 object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded" style={{ background: settings.primary_color + "33" }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {settings.display_name || settings.business_name || agency.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">Client Dashboard</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                          Preview
                        </span>
                      </div>
                      <div className="p-4 bg-[#020408]">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-12 flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">Overview</div>
                            <a href="#" className="text-sm font-medium" style={{ color: settings.primary_color }}>
                              View report
                            </a>
                          </div>
                          <div className="col-span-12 sm:col-span-6">
                            <div
                              className="rounded-xl border border-white/10 p-4"
                              style={{ background: settings.card_bg_color }}
                            >
                              <div className="text-xs text-slate-500">Status</div>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 border text-xs font-semibold"
                                  style={{
                                    background: settings.secondary_color + "1f",
                                    borderColor: settings.secondary_color + "38",
                                    color: settings.secondary_color,
                                  }}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Active
                                </span>
                              </div>
                              <button
                                className="mt-3 h-10 px-4 rounded-lg text-sm font-semibold text-white transition-colors"
                                style={{ background: settings.primary_color }}
                              >
                                Primary Button
                              </button>
                            </div>
                          </div>
                          <div className="col-span-12 sm:col-span-6">
                            <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                              <div className="text-xs text-slate-500">Tip</div>
                              <div className="mt-1 text-sm text-slate-300">
                                Hover elements to see which color applies.
                              </div>
                              <div className="mt-3 text-xs text-slate-500">
                                Primary:{" "}
                                <span className="font-mono text-slate-300">{settings.primary_color}</span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                Secondary:{" "}
                                <span className="font-mono text-slate-300">{settings.secondary_color}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      Some changes apply instantly; sensitive changes may require admin approval.
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography (Locked) */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      <Type className="w-[18px] h-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white tracking-tight">Typography</h3>
                      <p className="text-sm text-slate-400 mt-0.5">Font selections for your client dashboard</p>
                    </div>
                  </div>
                  {!isEnterprise && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-200 border border-amber-500/15 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-wide">
                      <Lock className="w-3 h-3" />
                      Enterprise Only
                    </span>
                  )}
                </div>
                <div className="opacity-40 pointer-events-none">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Primary Font (Headings)</label>
                      <div className="bg-[#020408] border border-white/10 rounded-lg px-3 py-3 flex items-center justify-between">
                        <span className="text-sm text-white">Plus Jakarta Sans</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Secondary Font (Body Text)</label>
                      <div className="bg-[#020408] border border-white/10 rounded-lg px-3 py-3 flex items-center justify-between">
                        <span className="text-sm text-white">Inter</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>
                {!isEnterprise && (
                  <>
                    <div className="absolute inset-0 bg-[#020408]/55" />
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="text-center max-w-md">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
                          <Lock className="w-[22px] h-[22px]" />
                        </div>
                        <div className="mt-3 text-base font-semibold text-white tracking-tight">
                          Upgrade to unlock typography controls
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Select custom fonts for headings and body text.
                        </div>
                        <button className="mt-4 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all inline-flex items-center gap-2">
                          Upgrade to Enterprise
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* UI Customization (Locked) */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      <SettingsIcon className="w-[18px] h-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white tracking-tight">UI Customization</h3>
                      <p className="text-sm text-slate-400 mt-0.5">Fine-tune interface elements</p>
                    </div>
                  </div>
                </div>
                <div className="opacity-40 pointer-events-none">
                  <label className="text-sm font-medium text-slate-400">Custom CSS (Advanced)</label>
                  <div className="mt-2 bg-[#020408] border border-white/10 rounded-lg h-40" />
                </div>
                {!isEnterprise && (
                  <>
                    <div className="absolute inset-0 bg-[#020408]/55 backdrop-blur-[1px] z-10" />
                    <div className="absolute inset-0 flex items-center justify-center p-6 z-20">
                      <div className="text-center max-w-md">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
                          <Lock className="w-[22px] h-[22px]" />
                        </div>
                        <div className="mt-3 text-base font-semibold text-white tracking-tight">
                          Advanced Customization
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          Custom CSS requires Enterprise plan and security review.
                        </div>
                        <button className="mt-4 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
                          Upgrade to Enterprise
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: DOMAIN & EMAIL */}
          {activeTab === "domain" && (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              {/* Custom Domain */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Globe className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white tracking-tight">Custom Domain</h3>
                      {domainStatus && settings.custom_domain && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            domainStatus === "verified" || domainStatus === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : domainStatus === "pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {domainStatus === "verified" || domainStatus === "active" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : domainStatus === "pending" ? (
                            <Hourglass className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {domainStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Serve the client dashboard from your own URL
                      {domainVerifiedAt && (
                        <span className="text-slate-600">
                          {" "}
                          · Verified {new Date(domainVerifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Client Domain</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">https://</span>
                        <input
                          type="text"
                          value={settings.custom_domain}
                          onChange={(e) => {
                            updateSetting("custom_domain", e.target.value);
                            setVerifyMessage(null);
                          }}
                          className="w-full bg-[#020408] border border-white/10 rounded-lg pl-16 pr-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
                          placeholder="client.yourdomain.com"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        disabled={verifying || !settings.custom_domain}
                        onClick={async () => {
                          if (!agency || !settings.custom_domain) return;
                          setVerifying(true);
                          setVerifyMessage(null);
                          setDnsResults(null);
                          try {
                            const res = await fetch("/api/agency/verify-domain", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                agency_id: agency.id,
                                domain: settings.custom_domain.trim().toLowerCase(),
                              }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setDomainStatus("verified");
                              setDomainVerifiedAt(data.checked_at);
                              setVerifyMessage({ type: "success", text: data.message });
                            } else {
                              setDomainStatus(data.status || "failed");
                              setVerifyMessage({ type: "error", text: data.message || data.error || "Verification failed" });
                            }
                            // Store full DNS results for display
                            if (data.dns_records || data.issues || data.expected_target) {
                              setDnsResults(data);
                            }
                          } catch {
                            setVerifyMessage({ type: "error", text: "Failed to verify. Please save your settings first and try again." });
                          } finally {
                            setVerifying(false);
                          }
                        }}
                        className={`w-full h-[46px] rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          verifying || !settings.custom_domain
                            ? "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white"
                        }`}
                      >
                        {verifying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        {verifying ? "Verifying..." : "Verify DNS Records"}
                      </button>
                    </div>
                  </div>

                  {/* Verify result message */}
                  {verifyMessage && (
                    <div
                      className={`rounded-lg p-4 flex gap-3 ${
                        verifyMessage.type === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/10"
                          : "bg-red-500/10 border border-red-500/10"
                      }`}
                    >
                      {verifyMessage.type === "success" ? (
                        <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-[18px] h-[18px] text-red-400 mt-0.5 shrink-0" />
                      )}
                      <div
                        className={`text-sm ${
                          verifyMessage.type === "success" ? "text-emerald-300" : "text-red-300"
                        }`}
                      >
                        {verifyMessage.text}
                      </div>
                    </div>
                  )}

                  {/* DNS Records Found (after verify click) */}
                  {dnsResults && dnsResults.dns_records && dnsResults.dns_records.length > 0 && (
                    <div className="bg-[#020408] border border-white/10 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Current DNS Records Found
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="p-3 text-xs font-medium text-slate-500 w-20">Type</th>
                              <th className="p-3 text-xs font-medium text-slate-500">Value</th>
                              <th className="p-3 text-xs font-medium text-slate-500 w-24 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {dnsResults.dns_records.map((rec: any, i: number) => (
                              <tr key={i}>
                                <td className={`p-3 text-xs font-mono ${
                                  rec.type === "CNAME" ? "text-emerald-400" : rec.type === "A" ? "text-amber-400" : "text-blue-400"
                                }`}>{rec.type}</td>
                                <td className="p-3 text-xs font-mono text-slate-300">{rec.value}</td>
                                <td className="p-3 text-right">
                                  {rec.status === "correct" ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                      <Check className="w-3 h-3" /> Correct
                                    </span>
                                  ) : rec.status === "incorrect" ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-red-400">
                                      <AlertTriangle className="w-3 h-3" /> Wrong
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-500">Info</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Issues list */}
                  {dnsResults && dnsResults.issues && dnsResults.issues.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 space-y-2">
                      <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">Issues Detected</div>
                      {dnsResults.issues.map((issue: string, i: number) => (
                        <div key={i} className="flex gap-2 text-xs text-red-300">
                          <span className="text-red-500 mt-0.5 shrink-0">•</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Required DNS Record — uses Vercel's exact target */}
                  {(() => {
                    const d = (settings.custom_domain || "").trim().toLowerCase();
                    const parts = d.split(".").filter(Boolean);
                    const isRootDomain =
                      parts.length <= 2 ||
                      (parts.length === 3 &&
                        ["co", "com", "org", "net"].includes(parts[parts.length - 2]));
                    const subdomainHost = isRootDomain
                      ? "@"
                      : parts.slice(0, -2).join(".");
                    // Use the exact CNAME target from Vercel if available
                    const cnameTarget = dnsResults?.expected_target || "cname.vercel-dns.com";

                    return (
                      <>
                        <div className="bg-[#020408] border border-white/10 rounded-lg overflow-hidden">
                          <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Required DNS Record
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  isRootDomain ? "76.76.21.21" : cnameTarget,
                                  "cname-all"
                                )
                              }
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {copiedField === "cname-all" ? "Copied!" : "Copy Value"}
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="p-3 text-xs font-medium text-slate-500 w-20">Type</th>
                                  <th className="p-3 text-xs font-medium text-slate-500 w-32">Host</th>
                                  <th className="p-3 text-xs font-medium text-slate-500">Points To</th>
                                  <th className="p-3 text-xs font-medium text-slate-500 w-14 text-right">Copy</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {isRootDomain ? (
                                  <tr>
                                    <td className="p-3 text-xs font-mono text-amber-400">A</td>
                                    <td className="p-3 text-xs font-mono text-slate-300">@</td>
                                    <td className="p-3 text-xs font-mono text-slate-400">76.76.21.21</td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => copyToClipboard("76.76.21.21", "a-record")}
                                        className="text-slate-500 hover:text-white transition-colors"
                                      >
                                        {copiedField === "a-record" ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr>
                                    <td className="p-3 text-xs font-mono text-emerald-400">CNAME</td>
                                    <td className="p-3 text-xs font-mono text-slate-300">{subdomainHost}</td>
                                    <td className="p-3 text-xs font-mono text-slate-400 break-all">{cnameTarget}</td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => copyToClipboard(cnameTarget, "cname")}
                                        className="text-slate-500 hover:text-white transition-colors"
                                      >
                                        {copiedField === "cname" ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Client URL preview */}
                        {d && (
                          <div className="rounded-lg bg-white/[0.02] border border-white/5 px-4 py-3 flex items-center gap-3">
                            <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                            <div className="text-xs text-slate-500">
                              Your clients will access the dashboard at{" "}
                              <span className="text-blue-400 font-medium">
                                https://{d}/client-dashboard
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        <div className="rounded-lg bg-[#020408] border border-white/10 p-4 space-y-3">
                          <div className="text-sm font-medium text-white">Setup Instructions</div>
                          <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                            <li>Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)</li>
                            {isRootDomain ? (
                              <li>
                                Add an <span className="text-amber-400 font-mono">A</span> record with host{" "}
                                <span className="text-white font-mono">@</span> pointing to{" "}
                                <span className="text-white font-mono">76.76.21.21</span>
                              </li>
                            ) : (
                              <li>
                                Add a <span className="text-emerald-400 font-mono">CNAME</span> record with host{" "}
                                <span className="text-white font-mono">{subdomainHost}</span> pointing to{" "}
                                <span className="text-white font-mono break-all">{cnameTarget}</span>
                              </li>
                            )}
                            <li>Save your settings here, then click &quot;Verify DNS Records&quot;</li>
                            <li>Allow up to 48 hours for DNS propagation (usually much faster)</li>
                          </ol>
                        </div>

                        {/* SSL Certificate Info */}
                        <div className="rounded-lg bg-blue-500/10 border border-blue-500/10 p-4 flex gap-3">
                          <Info className="w-[18px] h-[18px] text-blue-400 mt-0.5 shrink-0" />
                          <div className="text-sm text-slate-300">
                            <span className="text-white font-medium">SSL Certificate:</span> We automatically provision a
                            free SSL certificate via Let&apos;s Encrypt once your DNS is verified. This process typically takes
                            15 minutes.
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight">Email Settings</h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Configure how transactional emails appear to clients
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Sender Name</label>
                      <input
                        type="text"
                        value={settings.sender_name}
                        onChange={(e) => updateSetting("sender_name", e.target.value)}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Agency Support"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Reply-To Address</label>
                      <input
                        type="email"
                        value={settings.reply_to_email}
                        onChange={(e) => updateSetting("reply_to_email", e.target.value)}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g. support@agency.com"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        type="button"
                        onClick={() => updateSetting("use_custom_smtp", !settings.use_custom_smtp)}
                        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                          settings.use_custom_smtp ? "bg-blue-600" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.use_custom_smtp ? "left-5" : "left-1"
                          }`}
                        />
                      </button>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          Use Custom SMTP Server
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Send emails through your own mail server instead of our default relay.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* SMTP Provider Selection & Configuration */}
                  {settings.use_custom_smtp && (
                    <div className="pt-4 space-y-5 border-t border-white/5 ml-[52px]">
                      {/* Provider Picker */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Gmail Card */}
                          <button
                            type="button"
                            onClick={() => {
                              updateSetting("smtp_provider", "gmail");
                              updateSetting("smtp_host", "smtp.gmail.com");
                              updateSetting("smtp_port", "587");
                            }}
                            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              (settings.smtp_provider || "") === "gmail"
                                ? "border-blue-500 bg-blue-500/5"
                                : "border-white/10 bg-[#020408] hover:border-white/20"
                            }`}
                          >
                            {(settings.smtp_provider || "") === "gmail" && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                                <path d="M22 6.5V17.5C22 18.88 20.88 20 19.5 20H4.5C3.12 20 2 18.88 2 17.5V6.5C2 5.12 3.12 4 4.5 4H19.5C20.88 4 22 5.12 22 6.5Z" fill="#EA4335" fillOpacity="0.1" stroke="#EA4335" strokeWidth="1.5"/>
                                <path d="M22 6.5L12 13L2 6.5" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">Gmail</div>
                              <div className="text-[11px] text-slate-500">Google Workspace / Gmail</div>
                            </div>
                          </button>

                          {/* Other / Custom Card */}
                          <button
                            type="button"
                            onClick={() => {
                              updateSetting("smtp_provider", "other");
                              // Don't auto-fill, let user enter manually
                              if ((settings.smtp_provider || "") === "gmail") {
                                updateSetting("smtp_host", "");
                                updateSetting("smtp_port", "587");
                              }
                            }}
                            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              (settings.smtp_provider || "") === "other"
                                ? "border-blue-500 bg-blue-500/5"
                                : "border-white/10 bg-[#020408] hover:border-white/20"
                            }`}
                          >
                            {(settings.smtp_provider || "") === "other" && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                              <SettingsIcon className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">Other</div>
                              <div className="text-[11px] text-slate-500">Custom SMTP server</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Gmail Config */}
                      {(settings.smtp_provider || "") === "gmail" && (
                        <div className="space-y-4">
                          {/* Gmail-specific info banner */}
                          <div className="rounded-xl bg-gradient-to-r from-red-500/5 via-amber-500/5 to-blue-500/5 border border-white/10 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Mail className="w-3.5 h-3.5 text-red-400" />
                              </div>
                              <span className="text-sm font-medium text-white">Gmail Setup Guide</span>
                            </div>
                            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
                              <li>Enable <span className="text-white">2-Step Verification</span> on your Google account</li>
                              <li>Go to <span className="text-blue-400">myaccount.google.com/apppasswords</span></li>
                              <li>Create an App Password for &quot;Mail&quot;</li>
                              <li>Use that 16-character password below (not your regular password)</li>
                            </ol>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-400">Gmail Address</label>
                            <input
                              type="email"
                              value={settings.smtp_user || ""}
                              onChange={(e) => {
                                updateSetting("smtp_user", e.target.value);
                                updateSetting("smtp_from_email", e.target.value);
                              }}
                              className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                              placeholder="your-email@gmail.com"
                            />
                            <p className="text-[10px] text-slate-600">This will also be used as the &quot;From&quot; address</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-400">App Password</label>
                            <input
                              type="password"
                              value={settings.smtp_pass || ""}
                              onChange={(e) => updateSetting("smtp_pass", e.target.value)}
                              className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 font-mono tracking-widest"
                              placeholder="xxxx xxxx xxxx xxxx"
                            />
                            <p className="text-[10px] text-slate-600">16-character app password from Google (no spaces needed)</p>
                          </div>

                          {/* Auto-configured fields (read-only display) */}
                          <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 space-y-2">
                            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Auto-Configured</span>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">SMTP Server</span>
                              <span className="text-slate-300 font-mono">smtp.gmail.com</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Port</span>
                              <span className="text-slate-300 font-mono">587 (TLS)</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Encryption</span>
                              <span className="text-slate-300">STARTTLS</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Other / Custom SMTP Config */}
                      {(settings.smtp_provider || "") === "other" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-1.5">
                              <label className="text-sm font-medium text-slate-400">SMTP Host</label>
                              <input
                                type="text"
                                value={settings.smtp_host || ""}
                                onChange={(e) => updateSetting("smtp_host", e.target.value)}
                                className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                                placeholder="e.g. mail.yourdomain.com"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-400">Port</label>
                              <div className="relative">
                                <select
                                  value={settings.smtp_port || "587"}
                                  onChange={(e) => updateSetting("smtp_port", e.target.value)}
                                  className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500"
                                >
                                  <option value="587">587 (TLS)</option>
                                  <option value="465">465 (SSL)</option>
                                  <option value="25">25 (Unencrypted)</option>
                                  <option value="2525">2525 (Alt)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-400">Username</label>
                              <input
                                type="text"
                                value={settings.smtp_user || ""}
                                onChange={(e) => updateSetting("smtp_user", e.target.value)}
                                className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                                placeholder="SMTP username or email"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-slate-400">Password</label>
                              <input
                                type="password"
                                value={settings.smtp_pass || ""}
                                onChange={(e) => updateSetting("smtp_pass", e.target.value)}
                                className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                                placeholder="••••••••••••"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-400">From Email Address</label>
                            <input
                              type="email"
                              value={settings.smtp_from_email || ""}
                              onChange={(e) => updateSetting("smtp_from_email", e.target.value)}
                              className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                              placeholder="noreply@yourdomain.com"
                            />
                          </div>

                          <div className="rounded-lg bg-blue-500/10 border border-blue-500/10 p-3 flex gap-2">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-300">
                              Common providers: Outlook (<span className="text-white font-mono text-[11px]">smtp-mail.outlook.com:587</span>), Yahoo (<span className="text-white font-mono text-[11px]">smtp.mail.yahoo.com:587</span>), Zoho (<span className="text-white font-mono text-[11px]">smtp.zoho.com:587</span>), SendGrid (<span className="text-white font-mono text-[11px]">smtp.sendgrid.net:587</span>)
                            </p>
                          </div>
                        </div>
                      )}

                      {/* No provider selected yet */}
                      {!(settings.smtp_provider || "") && (
                        <div className="rounded-lg bg-white/[0.02] border border-dashed border-white/10 p-6 text-center">
                          <Mail className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Select an email provider above to configure your SMTP settings</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Templates */}
              <EmailTemplateEditor
                settings={settings}
                updateSetting={updateSetting}
              />
            </div>
          )}

          {/* TAB: BUSINESS DETAILS */}
          {activeTab === "business" && (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Building2 className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight">Business Address</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Used on invoices and legal documents</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="lg:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Street Address</label>
                    <input
                      type="text"
                      value={settings.business_address}
                      onChange={(e) => updateSetting("business_address", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="123 Business Ave"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">City</label>
                    <input
                      type="text"
                      value={settings.business_city}
                      onChange={(e) => updateSetting("business_city", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">State / Province</label>
                    <input
                      type="text"
                      value={settings.business_state}
                      onChange={(e) => updateSetting("business_state", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={settings.business_zip}
                      onChange={(e) => updateSetting("business_zip", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Country</label>
                    <input
                      type="text"
                      value={settings.business_country}
                      onChange={(e) => updateSetting("business_country", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="United States"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Tax ID / EIN (Optional)</label>
                    <input
                      type="text"
                      value={settings.tax_id}
                      onChange={(e) => updateSetting("tax_id", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="XX-XXXXXXX"
                    />
                    <p className="text-xs text-slate-500">Encrypted and stored securely</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Website</label>
                    <input
                      type="url"
                      value={agency.website || ""}
                      onChange={(e) => updateAgency("website", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COMMUNICATION & SUPPORT */}
          {activeTab === "support" && (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Mail className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight">Support Contact Info</h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Displayed to clients who need help
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Support Email</label>
                    <input
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => updateSetting("support_email", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="support@youragency.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Support Phone</label>
                    <input
                      type="tel"
                      value={settings.support_phone}
                      onChange={(e) => updateSetting("support_phone", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Support URL / Help Center</label>
                    <input
                      type="url"
                      value={settings.support_url}
                      onChange={(e) => updateSetting("support_url", e.target.value)}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      placeholder="https://help.youragency.com"
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">Welcome Message (shown to new clients)</label>
                    <textarea
                      value={settings.welcome_message}
                      onChange={(e) => updateSetting("welcome_message", e.target.value)}
                      rows={4}
                      className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
                      placeholder="Welcome to our platform! We're here to help you succeed..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: API & INTEGRATIONS */}
          {activeTab === "api" && (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Globe className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight">API Settings</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Manage API access and webhooks</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => updateSetting("api_enabled", !settings.api_enabled)}
                      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                        settings.api_enabled ? "bg-blue-600" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.api_enabled ? "left-5" : "left-1"
                        }`}
                      />
                    </button>
                    <div>
                      <div className="text-sm font-medium text-white">Enable API Access</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Allow programmatic access to your agency data
                      </div>
                    </div>
                  </div>

                  {settings.api_enabled && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-400">Webhook URL</label>
                      <input
                        type="url"
                        value={settings.webhook_url}
                        onChange={(e) => updateSetting("webhook_url", e.target.value)}
                        className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                        placeholder="https://yourdomain.com/webhook"
                      />
                      <p className="text-xs text-slate-500">
                        We&apos;ll send event notifications to this URL
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TEAM & SECURITY */}
          {activeTab === "team" && (
            <div className="mx-auto w-full max-w-5xl space-y-6">
              <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white tracking-tight">Team & Security</h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Manage team members and security settings
                    </p>
                  </div>
                </div>
                <div className="text-center py-12 text-slate-500">
                  <Lock className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm">Team management coming soon.</p>
                  <p className="text-xs text-slate-600 mt-1">
                    You&apos;ll be able to invite team members and configure access controls.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="h-24" />
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
      >
        <div className="bg-[#0B0E14] border border-emerald-500/20 shadow-2xl shadow-black/50 rounded-xl p-4 flex items-center gap-4 w-80 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="relative min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white">Changes Saved</h4>
            <p className="text-xs text-slate-400 mt-0.5">Your settings have been updated.</p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="relative text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dynamic Field Pill ───────────────────────────────────
function DynamicFieldPill({ field, label }: { field: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(`{{${field}}}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
        copied
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
      }`}
      title={`Copy {{${field}}}`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {`{{${field}}}`}
      <span className="text-[9px] text-slate-600 font-sans ml-0.5">{label}</span>
    </button>
  );
}

// ─── Email Template Editor Component ──────────────────────
const DEFAULT_ONBOARDING_TEMPLATE: EmailTemplate = {
  enabled: true,
  subject: "Welcome to {{agency_name}} — Your Account is Ready!",
  body: "Hi {{client_name}},\n\nYour account has been created. Here are your login credentials:\n\nLicense Key: {{license_key}}\n\nTo get started, visit: {{signup_url}}\n\nIf you need help, reach out to us at {{support_email}}.\n\nBest regards,\n{{agency_name}}",
};

const DYNAMIC_FIELDS = [
  { field: "client_first_name", label: "First name" },
  { field: "client_last_name", label: "Last name" },
  { field: "client_name", label: "Full name" },
  { field: "client_email", label: "Client email" },
  { field: "client_license_key", label: "License key" },
  { field: "license_key", label: "License key (alt)" },
  { field: "agency_name", label: "Agency name" },
  { field: "agency_domain", label: "Agency domain" },
  { field: "signup_url", label: "Full signup URL" },
  { field: "support_email", label: "Support email" },
];

function EmailTemplateEditor({
  settings,
  updateSetting,
}: {
  settings: SettingsData;
  updateSetting: <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => void;
}) {
  const templates = settings.email_templates || {};
  const currentTemplate = templates.client_onboarding || DEFAULT_ONBOARDING_TEMPLATE;
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate] = useState("client_onboarding");

  function updateTemplate(updates: Partial<EmailTemplate>) {
    const newTemplates = {
      ...templates,
      [selectedTemplate]: {
        ...currentTemplate,
        ...updates,
      },
    };
    updateSetting("email_templates", newTemplates);
  }

  // Build preview with sample data
  function getPreviewHtml() {
    const agencyName = settings.business_name || "Your Agency";
    const domain = settings.custom_domain || "app.algofintech.com";
    const sampleFields: Record<string, string> = {
      // Standard fields
      client_name: "John Smith",
      client_email: "john@example.com",
      license_key: "ABCD-EFGH-JKLM-NPQR",
      agency_name: agencyName,
      signup_url: `https://${domain}/client-signup`,
      support_email: settings.support_email || settings.reply_to_email || "support@agency.com",
      // Alternate / extended fields
      client_first_name: "John",
      client_last_name: "Smith",
      first_name: "John",
      last_name: "Smith",
      client_license_key: "ABCD-EFGH-JKLM-NPQR",
      agency_domain: domain,
      domain: domain,
    };

    let subject = currentTemplate.subject || "";
    let body = currentTemplate.body || "";
    for (const [key, val] of Object.entries(sampleFields)) {
      subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
      body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
    }
    return { subject, body };
  }

  const preview = getPreviewHtml();

  return (
    <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
          <Mail className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white tracking-tight">Email Templates</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Customize the emails sent to your clients
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Template Selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-400">Template</label>
          <div className="relative">
            <select
              value={selectedTemplate}
              disabled
              className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 cursor-not-allowed"
            >
              <option value="client_onboarding">Client Onboarding</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
          </div>
          <p className="text-[10px] text-slate-600">Sent when you add a new client with &quot;Send Email&quot; enabled</p>
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateTemplate({ enabled: !currentTemplate.enabled })}
            className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
              currentTemplate.enabled ? "bg-emerald-500" : "bg-white/10"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                currentTemplate.enabled ? "left-5" : "left-1"
              }`}
            />
          </button>
          <span className="text-sm text-slate-300">
            {currentTemplate.enabled ? "Template enabled" : "Template disabled"}
          </span>
        </div>

        {currentTemplate.enabled && (
          <>
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400">Subject Line</label>
              <input
                type="text"
                value={currentTemplate.subject}
                onChange={(e) => updateTemplate({ subject: e.target.value })}
                className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                placeholder="Welcome to {{agency_name}}"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400">Email Body</label>
              <textarea
                value={currentTemplate.body}
                onChange={(e) => updateTemplate({ body: e.target.value })}
                rows={10}
                className="w-full bg-[#020408] border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 font-mono resize-y"
                placeholder="Hi {{client_name}},..."
              />
            </div>

            {/* Dynamic Fields Reference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Available Dynamic Fields
              </label>
              <p className="text-[10px] text-slate-600">Click to copy. Paste into subject or body above.</p>
              <div className="flex flex-wrap gap-2">
                {DYNAMIC_FIELDS.map((f) => (
                  <DynamicFieldPill key={f.field} field={f.field} label={f.label} />
                ))}
              </div>
            </div>

            {/* Preview Toggle */}
            <div className="pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Hide Preview" : "Preview Email"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPreview ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div className="bg-[#020408] border border-white/10 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Email Preview</span>
                  <span className="text-[10px] text-slate-600 ml-2">(with sample data)</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold w-16 shrink-0">Subject:</span>
                    <span className="text-sm text-white font-medium">{preview.subject}</span>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <div className="bg-white/[0.02] rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                      {preview.body}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reset to default */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => updateTemplate(DEFAULT_ONBOARDING_TEMPLATE)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset to default template
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
