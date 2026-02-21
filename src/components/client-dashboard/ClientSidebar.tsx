"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  Activity,
  TrendingUp,
  CreditCard,
  Settings,
  BarChart2,
  HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/client-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/client-dashboard/accounts", icon: Wallet, label: "Accounts" },
  { href: "/client-dashboard/activity", icon: Activity, label: "Trading Activity" },
  { href: "/client-dashboard/performance", icon: TrendingUp, label: "Performance" },
  { href: "/client-dashboard/payments", icon: CreditCard, label: "Payments" },
  { href: "/client-dashboard/settings", icon: Settings, label: "Settings" },
];

export default function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-[#020408] flex-shrink-0 z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20 mr-3 group-hover:scale-105 transition-transform">
          <BarChart2 className="text-white w-4 h-4" />
        </div>
        <span className="font-semibold text-lg text-white tracking-tight">
          AlgoFinTech
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/client-dashboard"
              ? pathname === "/client-dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-white bg-white/5 border border-white/5"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-br from-blue-900/20 to-transparent p-4 rounded-xl border border-blue-500/10">
          <p className="text-xs font-medium text-white mb-1">Need help?</p>
          <p className="text-[10px] text-blue-200/60 mb-3">
            Contact your account manager for support.
          </p>
          <button className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-xs text-white transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
}
