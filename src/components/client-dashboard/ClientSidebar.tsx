"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Wallet,
  Activity,
  CreditCard,
  Settings,
  BarChart2,
  LogOut,
  HelpCircle,
  BookOpen,
  Link2,
  MessageCircleQuestion,
  X,
} from "lucide-react";

interface ClientSession {
  client_id: string;
  client_name: string;
  client_email: string;
  agency_name: string;
}

interface ClientSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS = [
  { href: "/client-dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/client-dashboard/accounts", icon: Wallet, label: "Accounts" },
  { href: "/client-dashboard/activity", icon: Activity, label: "Trading Activity" },
  { href: "/client-dashboard/payments", icon: CreditCard, label: "Payments" },
];

export default function ClientSidebar({ mobileOpen, onMobileClose }: ClientSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<ClientSession | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("client_session");
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("client_session");
    router.push("/client-login");
  }

  // Close mobile menu when navigating
  function handleNavClick() {
    if (onMobileClose) onMobileClose();
  }

  const agencyName = session?.agency_name || "";
  const userName = session?.client_name || "Client";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const sidebarContent = (
    <>
      {/* Logo / Agency Name */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/20 mr-3 group-hover:scale-105 transition-transform">
          <BarChart2 className="text-white w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-white tracking-tight block truncate">
            {agencyName}
          </span>
          <span className="text-[10px] text-slate-600 font-medium leading-tight">
            Client Portal
          </span>
        </div>
        {/* Close button — mobile only */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
              onClick={handleNavClick}
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

      {/* Help Center */}
      <div className="px-3 pb-4 space-y-1">
        <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 px-3 flex items-center gap-2">
          <HelpCircle className="w-3 h-3" />
          Help Center
        </div>
        <Link
          href="/client-dashboard/prop-firm-guide"
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            pathname === "/client-dashboard/prop-firm-guide"
              ? "text-white bg-white/5 border border-white/5"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <BookOpen className={`w-4 h-4 ${pathname === "/client-dashboard/prop-firm-guide" ? "text-blue-400" : "text-slate-500"}`} />
          <span className="font-medium text-sm">Get a Prop Firm Account</span>
        </Link>
        <Link
          href="/client-dashboard/connect-guide"
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            pathname === "/client-dashboard/connect-guide"
              ? "text-white bg-white/5 border border-white/5"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <Link2 className={`w-4 h-4 ${pathname === "/client-dashboard/connect-guide" ? "text-blue-400" : "text-slate-500"}`} />
          <span className="font-medium text-sm">How to Connect Your Account</span>
        </Link>
        <Link
          href="/client-dashboard/faq"
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            pathname === "/client-dashboard/faq"
              ? "text-white bg-white/5 border border-white/5"
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <MessageCircleQuestion className={`w-4 h-4 ${pathname === "/client-dashboard/faq" ? "text-blue-400" : "text-slate-500"}`} />
          <span className="font-medium text-sm">Frequently Asked Questions</span>
        </Link>
      </div>

      {/* User Profile + Logout */}
      <div className="p-3 border-t border-white/5 mt-auto space-y-1">
        <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-left group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10">
              {userInitials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#020408] rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{userName}</div>
            <div className="text-[10px] text-slate-500 truncate">
              {agencyName}
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
          <span className="text-xs font-medium text-slate-500 group-hover:text-red-400 transition-colors">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-[#020408] flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile overlay — visible when mobileOpen is true */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onMobileClose}
          />
          {/* Slide-in sidebar */}
          <aside className="md:hidden fixed inset-y-0 left-0 w-72 flex flex-col bg-[#020408] border-r border-white/10 z-50 animate-slide-in-left shadow-2xl shadow-black/50">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
