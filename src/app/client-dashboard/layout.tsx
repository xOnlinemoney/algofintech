"use client";

import { useState } from "react";
import ClientSidebar from "@/components/client-dashboard/ClientSidebar";
import ClientHeader from "@/components/client-dashboard/ClientHeader";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="overflow-hidden h-screen w-screen">
      <div className="fixed inset-0 flex w-full h-full bg-[#020408] font-sans text-slate-400 selection:bg-blue-500/30">
        <ClientSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-[#020408] relative">
          <ClientHeader
            onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
          />

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
