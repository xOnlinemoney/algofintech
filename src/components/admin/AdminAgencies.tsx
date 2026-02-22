"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Ban,
  Users,
  Cpu,
  LineChart,
  Wallet,
  FileText,
  Settings,
  Bell,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Plus,
  Filter,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  Send,
  Building,
  User,
  ExternalLink,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface AgencyData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  suspendedClients: number;
  pendingClients: number;
  activePercent: number;
  totalPnl: number;
  totalLiquidity: number;
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  openTrades: number;
  revenue: number;
}

interface ApiResponse {
  agencies: AgencyData[];
  summary: { total: number; totalClients: number; suspended: number };
}

// ─── Helpers ────────────────────────────────────────────
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function joinedLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `Joined ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const initialColors = [
  "bg-indigo-500/20 text-indigo-400",
  "bg-cyan-500/20 text-cyan-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
  "bg-purple-500/20 text-purple-400",
  "bg-teal-500/20 text-teal-400",
  "bg-orange-500/20 text-orange-400",
  "bg-pink-500/20 text-pink-400",
  "bg-blue-500/20 text-blue-400",
];

// ─── Sidebar Nav Item ───────────────────────────────────
function NavItem({
  icon: Icon,
  label,
  active,
  badge,
  badgeColor,
  href,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
  badgeColor?: string;
  href?: string;
}) {
  return (
    <a
      href={href || "#"}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
        active
          ? "text-white bg-blue-500/10 border border-blue-500/10"
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "group-hover:text-slate-300"}`} />
      <span className={active ? "font-medium" : ""}>{label}</span>
      {badge && (
        <span
          className={`ml-auto text-[10px] px-1.5 py-0.5 rounded border ${
            badgeColor || "bg-red-500/20 text-red-400 border-red-500/20"
          }`}
        >
          {badge}
        </span>
      )}
    </a>
  );
}

// ─── Tier Badge ─────────────────────────────────────────
function TierBadge({ plan }: { plan: string }) {
  switch (plan) {
    case "enterprise":
      return (
        <span className="px-2 py-0.5 rounded border border-purple-500/20 bg-purple-500/10 text-purple-400 text-[10px] font-medium">
          Enterprise
        </span>
      );
    case "pro":
      return (
        <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-medium">
          Growth
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded border border-slate-500/20 bg-slate-500/10 text-slate-400 text-[10px] font-medium">
          Starter
        </span>
      );
  }
}

// ─── Invite Modal ───────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  function handleNext() {
    if (step < 3) setStep(step + 1);
    else setSuccess(true);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform rounded-xl bg-[#1a1a1a] border border-white/10 text-left shadow-2xl w-full max-w-[800px] flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0 rounded-t-xl">
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Invite New Agency Partner</h3>
                <p className="mt-1 text-sm text-slate-400">Create a custom payment link to onboard a new agency</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-6 border-b border-white/5 shrink-0">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 -z-0" />
                {[1, 2, 3].map((s) => {
                  const labels = ["Agency Info", "Configuration", "Review & Send"];
                  const isComplete = s < step || success;
                  const isCurrent = s === step && !success;
                  return (
                    <div key={s} className={`flex flex-col items-center gap-2 bg-[#1a1a1a] px-3 z-10 relative ${!isCurrent && !isComplete ? "opacity-50" : ""}`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 border-[#1a1a1a] ${
                          isComplete
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {isComplete ? <Check className="w-3.5 h-3.5" /> : s}
                      </div>
                      <span className={`text-[10px] font-medium uppercase tracking-wider absolute -bottom-6 whitespace-nowrap ${isComplete ? "text-emerald-500" : isCurrent ? "text-blue-400" : "text-slate-500"}`}>
                        {labels[s - 1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            {!success ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                {step === 1 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Agency/Company Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="e.g., TradePro Solutions LLC" className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Primary Contact Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input type="text" placeholder="e.g., John Smith" className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Email <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input type="email" placeholder="e.g., john@tradepro.com" className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input type="tel" placeholder="+1 (555) 123-4567" className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input type="url" placeholder="https://tradepro.com" className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Internal Notes <span className="text-xs text-slate-500 font-normal ml-1">(Private)</span></label>
                      <textarea rows={3} placeholder="Add any internal notes about this agency..." className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-300">Select Partnership Tier <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: "starter", label: "Starter", price: "$5,000", color: "white/5", borderColor: "white/5", features: ["Essential branding", "Up to 10 algorithms", "Core assets (Forex)"] },
                          { key: "pro", label: "Growth", price: "$15,000", color: "blue-500/10", borderColor: "blue-500/30", recommended: true, features: ["Advanced branding", "Up to 25 algorithms", "Mobile Apps included"] },
                          { key: "enterprise", label: "Enterprise", price: "$25k+", color: "purple-500/10", borderColor: "white/5", features: ["Custom UI/UX", "All algorithms", "Dedicated Infrastructure"] },
                        ].map((tier) => (
                          <label key={tier.key} className={`relative flex flex-col p-4 bg-[#0f0f0f] border border-[#333333] rounded-xl cursor-pointer hover:border-blue-500/50 transition-all`}>
                            <input type="radio" name="tier" className="peer sr-only" defaultChecked={tier.key === "pro"} />
                            <div className="absolute inset-0 border-2 border-transparent peer-checked:border-blue-500 rounded-xl pointer-events-none" />
                            {tier.recommended && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">Recommended</div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-0.5 rounded-md bg-${tier.color} border border-${tier.borderColor} text-[10px] font-semibold uppercase tracking-wide ${tier.key === "enterprise" ? "text-purple-400" : tier.key === "pro" ? "text-blue-400" : "text-slate-300"}`}>{tier.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-0.5">{tier.price}</div>
                            <div className="text-[10px] text-slate-500 mb-4">Setup Fee</div>
                            <ul className="space-y-2 text-xs text-slate-400">
                              {tier.features.map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Link Expiration</label>
                        <select className="w-full bg-[#0f0f0f] border border-[#333333] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none">
                          <option>30 days (Recommended)</option>
                          <option>7 days</option>
                          <option>14 days</option>
                          <option>Never expires</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Auto-Activate</label>
                        <div className="flex items-center justify-between bg-[#0f0f0f] border border-[#333333] rounded-lg p-2.5">
                          <span className="text-sm text-slate-400">Activate on payment</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-[#0f0f0f] border border-[#333333] rounded-xl p-5">
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Invitation Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><div className="text-xs text-slate-500">Agency</div><div className="font-medium text-slate-200">New Agency Partner</div></div>
                        <div><div className="text-xs text-slate-500">Selected Tier</div><div className="font-medium text-blue-400">Growth ($15,000)</div></div>
                        <div><div className="text-xs text-slate-500">Link Expires</div><div className="font-medium text-slate-200">30 days</div></div>
                        <div><div className="text-xs text-slate-500">Auto-Activate</div><div className="font-medium text-emerald-400">Yes</div></div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Payment Link</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-[#0b0b0b] border border-[#333333] rounded-lg py-2.5 px-3 text-sm text-slate-400 font-mono truncate">
                          https://algofintech.com/invite/pay/ak_{Math.random().toString(36).slice(2, 12)}
                        </div>
                        <button className="bg-[#1f2937] hover:bg-[#374151] text-white p-2.5 rounded-lg border border-white/5 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                      <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600" />
                      <div>
                        <label className="font-medium text-white text-sm">Send Invitation Email</label>
                        <p className="text-xs text-slate-400 mt-1">Automatically send a branded email with the payment link and onboarding instructions.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Invitation Sent Successfully!</h3>
                <p className="text-slate-400 mb-8 max-w-sm">The invitation has been created with the payment link.</p>
                <button onClick={onClose} className="bg-[#1f2937] hover:bg-[#374151] border border-white/10 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm">
                  Return to Agencies
                </button>
              </div>
            )}

            {/* Footer */}
            {!success && (
              <div className="px-6 py-5 bg-[#131313] border-t border-white/5 flex items-center justify-between rounded-b-xl shrink-0">
                <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors" onClick={handleBack}>
                  {step === 1 ? "Cancel" : "Back"}
                </button>
                <button
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2"
                  onClick={handleNext}
                >
                  {step === 1 && <>Next: Configuration <ChevronRight className="w-4 h-4" /></>}
                  {step === 2 && <>Next: Review & Send <ChevronRight className="w-4 h-4" /></>}
                  {step === 3 && <>Send Invitation <Send className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function AdminAgencies() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetch("/api/admin/agencies")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredAgencies = (data?.agencies || []).filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="antialiased h-screen w-screen overflow-hidden flex text-sm font-sans text-slate-400" style={{ background: "#020408" }}>
      {/* Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .custom-checkbox {
          appearance: none; background-color: rgba(255,255,255,0.05); margin: 0;
          width: 1.15em; height: 1.15em; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.25em; display: grid; place-content: center; transition: all 0.2s; cursor: pointer;
        }
        .custom-checkbox::before {
          content: ""; width: 0.65em; height: 0.65em; transform: scale(0);
          transition: 120ms transform ease-in-out; box-shadow: inset 1em 1em white;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .custom-checkbox:checked { background-color: #3b82f6; border-color: #3b82f6; }
        .custom-checkbox:checked::before { transform: scale(1); }
      `}</style>

      {/* ═══ Sidebar ═══ */}
      <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex flex-col shrink-0 z-20">
        <div className="h-14 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-white font-semibold tracking-tight">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            AlgoFinTech Admin
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Agency Management</div>
          <NavItem icon={Building2} label="All Agencies" active href="/dashboard/agencies" />
          <NavItem icon={UserPlus} label="Pending Invitations" />
          <NavItem icon={Ban} label="Suspended" badge={String(data?.summary.suspended || 0)} />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Client Management</div>
          <NavItem icon={Users} label="All Clients" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Algorithms</div>
          <NavItem icon={Cpu} label="Algorithm Library" />
          <NavItem icon={LineChart} label="Performance" />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">Finance</div>
          <NavItem icon={Wallet} label="Revenue Overview" />
          <NavItem icon={FileText} label="Invoices" />
        </nav>
        <div className="p-3 border-t border-white/5">
          <NavItem icon={Settings} label="System Settings" />
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#020408" }}>
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 bg-[#020408]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Agency Management</span>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium">All Agencies</span>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#020408]" />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-lg transition-colors">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff" alt="Admin" className="w-7 h-7 rounded-md" />
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-white">Admin</div>
                <div className="text-[10px] text-slate-500">Super Admin</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Page Header & Tabs */}
          <div className="px-6 pt-6 pb-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Agency Management</h1>
                <p className="text-slate-500 text-xs mt-1">Manage partner agencies, view performance, and track revenue.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="hover:bg-blue-500 transition-colors flex gap-2 text-xs font-medium text-white bg-blue-600 rounded-lg py-2 px-3 shadow-[0_0_15px_rgba(59,130,246,0.4)] items-center"
                >
                  <Plus className="w-3.5 h-3.5" /> Invite New Agency
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-white/5">
              <button className="pb-3 text-sm font-medium text-white border-b-2 border-blue-500">
                All Agencies{" "}
                <span className="ml-1.5 text-xs bg-white/10 px-1.5 py-0.5 rounded-full text-white">
                  {data?.summary.total || 0}
                </span>
              </button>
              <button className="hover:text-white transition-colors text-sm font-medium text-slate-400 border-transparent border-b-2 pb-3">
                Suspended Agencies{" "}
                <span className="ml-1.5 text-xs bg-red-500/10 px-1.5 py-0.5 rounded-full text-red-400">
                  {data?.summary.suspended || 0}
                </span>
              </button>
            </div>
          </div>

          {/* Controls Toolbar */}
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="flex flex-col xl:flex-row gap-3 justify-between">
              <div className="flex flex-1 flex-col md:flex-row gap-3">
                <div className="relative group min-w-[280px]">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search agencies by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#13161C] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                  <button className="flex items-center gap-2 px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 rounded-lg text-xs text-slate-300 font-medium whitespace-nowrap">
                    Status: All <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-[#13161C] border border-white/10 hover:border-white/20 rounded-lg text-xs text-slate-300 font-medium whitespace-nowrap">
                    Tier: All <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                  <button className="px-3 py-2 bg-[#13161C] border border-dashed border-white/20 hover:border-white/30 rounded-lg text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <Filter className="w-3 h-3" /> More Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar px-6 pb-6">
            <div className="border border-white/5 rounded-lg bg-[#0B0E14] min-w-[1000px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-500 font-medium sticky top-0 z-10 backdrop-blur-sm">
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 w-10"><input type="checkbox" className="custom-checkbox" /></th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Agency Name</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Tier</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Clients</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider text-right">AUM</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider text-right">Total PnL</th>
                    <th className="px-4 py-3 font-medium uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4"><div className="w-4 h-4 bg-white/5 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-32" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-12" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-20" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-20" /></td>
                        <td className="px-4 py-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                        <td className="px-4 py-4" />
                      </tr>
                    ))
                  ) : filteredAgencies.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                        {searchTerm ? "No agencies match your search." : "No agencies found."}
                      </td>
                    </tr>
                  ) : (
                    filteredAgencies.map((agency, i) => {
                      const isExpanded = expandedRow === agency.id;
                      const hasSuspended = agency.suspendedClients > 0;
                      return (
                        <>
                          <tr
                            key={agency.id}
                            className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? "bg-blue-500/[0.04] border-l-2 border-blue-500" : ""} ${hasSuspended ? "bg-red-500/[0.02]" : ""}`}
                            onClick={() => setExpandedRow(isExpanded ? null : agency.id)}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="custom-checkbox" />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${initialColors[i % initialColors.length]}`}>
                                  {initials(agency.name)}
                                </div>
                                <div>
                                  <div className="font-medium text-white group-hover:text-blue-400 transition-colors">{agency.name}</div>
                                  <div className="text-[10px] text-slate-500">{joinedLabel(agency.created_at)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><TierBadge plan={agency.plan} /></td>
                            <td className="px-4 py-3">
                              {hasSuspended ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                  <span className="text-orange-400">Warning</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                  <span className="text-emerald-400">Active</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-slate-300 font-medium flex items-center gap-1">
                                {agency.totalClients}
                                {agency.activeClients > 0 && (
                                  <span className="text-emerald-500 bg-emerald-500/10 rounded px-1 text-[9px] flex items-center">
                                    <ArrowUp className="w-2.5 h-2.5" /> {agency.activeClients}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500">{agency.activePercent}% active</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="text-white font-medium">{formatCurrency(agency.totalBalance)}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className={`font-medium ${agency.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {agency.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(agency.totalPnl))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {timeAgo(agency.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>
                          {/* Expanded Detail */}
                          {isExpanded && (
                            <tr key={`${agency.id}-detail`} className="bg-blue-500/[0.02]">
                              <td colSpan={9} className="px-4 pb-4 pt-0 border-b border-white/5">
                                <div className="pl-14 pr-4">
                                  <div className="grid grid-cols-4 gap-6 pt-4">
                                    <div className="space-y-1">
                                      <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Client Breakdown</div>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between"><span className="text-slate-400">Active</span><span className="text-emerald-400">{agency.activeClients}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">Inactive</span><span className="text-slate-300">{agency.inactiveClients}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">Suspended</span><span className="text-red-400">{agency.suspendedClients}</span></div>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Account Stats</div>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between"><span className="text-slate-400">Connected Accounts</span><span className="text-white">{agency.totalAccounts}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">Active Accounts</span><span className="text-emerald-400">{agency.activeAccounts}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">Open Trades</span><span className="text-white">{agency.openTrades}</span></div>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Financial</div>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between"><span className="text-slate-400">Total Balance</span><span className="text-white">{formatCurrency(agency.totalBalance)}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">Total PnL</span><span className={agency.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}>{agency.totalPnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(agency.totalPnl))}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">Liquidity</span><span className="text-white">{formatCurrency(agency.totalLiquidity)}</span></div>
                                      </div>
                                    </div>
                                    <div className="flex items-end justify-end gap-2">
                                      <button className="text-xs px-3 py-1.5 bg-[#13161C] border border-white/10 hover:border-white/20 rounded text-slate-300 transition-colors">View Details</button>
                                      <button className="text-xs px-3 py-1.5 bg-[#13161C] border border-white/10 hover:border-white/20 rounded text-slate-300 transition-colors">Message</button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="border-t border-white/5 bg-[#020408] p-4 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500">
              Showing <span className="font-medium text-white">1-{filteredAgencies.length}</span> of{" "}
              <span className="font-medium text-white">{data?.summary.total || 0}</span> agencies
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-white/10 rounded text-xs text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-medium">1</button>
              </div>
              <button className="px-3 py-1.5 border border-white/10 rounded text-xs text-slate-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}
