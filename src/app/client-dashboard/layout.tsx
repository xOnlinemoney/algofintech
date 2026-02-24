"use client";

import { useState, useEffect } from "react";
import ClientSidebar from "@/components/client-dashboard/ClientSidebar";
import ClientHeader from "@/components/client-dashboard/ClientHeader";
import { useAgencyBranding } from "@/hooks/useAgencyBranding";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { agencyName } = useAgencyBranding();

  // Dynamically set page title to agency name so clients never see "AlgoFinTech"
  useEffect(() => {
    if (agencyName) {
      document.title = `${agencyName} - Client Portal`;
    }
  }, [agencyName]);

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
