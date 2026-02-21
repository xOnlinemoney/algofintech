import StatsGrid from "@/components/dashboard/StatsGrid";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import TopStrategies from "@/components/dashboard/TopStrategies";
import { Calendar } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlgoFinTech - Agency Dashboard",
  description:
    "Agency dashboard for managing clients, algorithms, and performance metrics.",
};

export default function DashboardPage() {
  return (
    <>
      <div className="px-6 flex flex-col gap-6">
        {/* Welcome & Actions */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Overview
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Welcome back, here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="hover:bg-white/5 transition-colors flex text-sm font-medium text-white border-white/10 border rounded-lg py-2 px-4 gap-2 items-center">
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
              Dec 18 - Jan 18
            </button>
          </div>
        </div>

        <StatsGrid />

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 gap-y-4 lg:gap-x-4">
          <PerformanceChart />

          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
            <TopStrategies />
          </div>
        </div>
      </div>

      {/* Footer spacer */}
      <footer className="bg-[#020408] border-t border-white/5 pt-16 pb-8 mt-6"></footer>
    </>
  );
}
