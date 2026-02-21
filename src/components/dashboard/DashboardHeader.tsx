"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, HelpCircle } from "lucide-react";
import { getAlgorithmBySlug } from "@/lib/mock-data";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/clients": "Clients",
  "/dashboard/algorithms": "Algorithms Overview",
  "/dashboard/updates": "Platform Updates",
};

export default function DashboardHeader() {
  const pathname = usePathname();

  // Check if we're on an algorithm detail page: /dashboard/algorithms/[slug]
  const algoDetailMatch = pathname.match(/^\/dashboard\/algorithms\/(.+)$/);
  const isAlgoDetail = !!algoDetailMatch;
  const algoSlug = algoDetailMatch?.[1] ?? null;
  const algorithm = algoSlug ? getAlgorithmBySlug(algoSlug) : null;

  const pageLabel = breadcrumbMap[pathname] || "Dashboard";

  return (
    <header className="flex h-14 border-white/5 border-b px-6 items-center justify-between shrink-0 bg-[#0A0C10]/95 backdrop-blur z-20 sticky top-0">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
          Platform
        </span>
        <span className="text-slate-700">/</span>
        {isAlgoDetail && algorithm ? (
          <>
            <Link
              href="/dashboard/algorithms"
              className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
            >
              Algorithms Overview
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-white font-medium">{algorithm.name}</span>
          </>
        ) : (
          <span className="text-white font-medium">{pageLabel}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          System Operational
        </div>
        <div className="h-4 w-px bg-white/10 mx-1"></div>
        <button className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
        <button className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
