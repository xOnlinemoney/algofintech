"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  Activity,
  TrendingUp,
  Newspaper,
  Megaphone,
  Zap,
  HelpCircle,
  ChevronDown,
  Search,
  Settings,
  Cpu,
} from "lucide-react";
import { mockAgencyUser, mockStrategies } from "@/lib/mock-data";

export default function Sidebar() {
  const pathname = usePathname();

  const user = mockAgencyUser;
  const strategies = mockStrategies;

  return (
    <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex flex-col shrink-0">
      {/* Logo / Workspace */}
      <div className="flex h-14 border-white/5 border-b px-4 items-center">
        <button className="flex items-center gap-3 hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors w-full text-left group">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/20 ring-1 ring-white/10">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-slate-200 tracking-tight leading-none group-hover:text-white transition-colors">
              AlgoStack
            </div>
            <div className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5 group-hover:text-slate-500">
              Pro Environment
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-3 pb-4 space-y-6">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Jump to..."
            className="w-full bg-[#13161C] border border-white/5 rounded-lg py-1.5 pl-8 pr-8 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-slate-600 transition-all"
          />
          <div className="absolute right-2 top-1.5 flex items-center gap-0.5 border border-white/10 rounded px-1.5 py-px bg-white/5">
            <span className="text-[9px] text-slate-500 font-medium">⌘</span>
            <span className="text-[9px] text-slate-500 font-medium">K</span>
          </div>
        </div>

        {/* Platform */}
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase flex font-semibold text-slate-500 tracking-wider mb-2 px-2 items-center justify-between">
            Platform
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          </div>
          <NavLink
            href="/dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <NavLink
            href="/dashboard/clients"
            icon={<Users className="w-4 h-4" />}
            label="Clients"
            active={pathname === "/dashboard/clients"}
          />
        </div>

        {/* Algorithms */}
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase flex font-semibold text-slate-500 tracking-wider mb-2 px-2 items-center justify-between">
            Algorithms
          </div>
          {strategies.map((s) => {
            const dotColor =
              s.status === "active"
                ? "bg-green-500"
                : s.status === "paused"
                ? "bg-yellow-500"
                : "bg-slate-600";
            return (
              <Link
                key={s.id}
                href="#"
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors text-sm font-medium group"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                <span className="flex-1">{s.name}</span>
                <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  {s.asset_tag}
                </span>
              </Link>
            );
          })}
          <button className="flex hover:bg-white/5 hover:border-white/10 hover:text-slate-200 transition-all group cursor-pointer text-xs font-medium text-slate-400 w-full border-white/5 border rounded-md mt-2 py-1.5 px-3 gap-2 items-center justify-center">
            <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400 transition-colors" />
            View Algorithms
          </button>
        </div>

        {/* Payments & Commissions */}
        <NavSection
          title="Payments & Commissions"
          items={[
            { href: "#", icon: <DollarSign className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "Commission Earnings" },
            { href: "#", icon: <CreditCard className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "Payment Management" },
          ]}
          pathname={pathname}
        />

        {/* News & Updates */}
        <NavSection
          title="News & Updates"
          items={[
            { href: "#", icon: <Activity className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "Platform Updates" },
            { href: "#", icon: <TrendingUp className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "New Strategies" },
            { href: "#", icon: <Newspaper className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "Industry News" },
            { href: "#", icon: <Megaphone className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "Announcements" },
          ]}
          pathname={pathname}
        />

        {/* Help Center */}
        <NavSection
          title="Help Center"
          items={[
            { href: "#", icon: <Zap className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "Features" },
            { href: "#", icon: <HelpCircle className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />, label: "How To" },
          ]}
          pathname={pathname}
        />
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-white/5 mt-auto">
        <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#0B0E14] rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
              {user.plan_label}
              <span className="inline-block w-0.5 h-0.5 rounded-full bg-slate-500"></span>
              {user.aum_display}
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
        </button>
      </div>
    </aside>
  );
}

// ─── Reusable NavLink ─────────────────────────────────────
function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "flex items-center gap-2.5 text-sm font-medium text-blue-400 bg-blue-500/10 border-blue-500/10 border rounded-md py-1.5 px-2"
          : "flex items-center gap-2.5 hover:text-slate-200 hover:bg-white/5 transition-colors group text-sm font-medium text-slate-400 rounded-md py-1.5 px-2"
      }
    >
      {icon}
      {label}
    </Link>
  );
}

// ─── Reusable NavSection ──────────────────────────────────
function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: { href: string; icon: React.ReactNode; label: string }[];
  pathname: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] uppercase flex font-semibold text-slate-500 tracking-wider mb-2 px-2 items-center justify-between">
        {title}
      </div>
      {items.map((item) => (
        <NavLink
          key={item.label}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={pathname === item.href}
        />
      ))}
    </div>
  );
}
