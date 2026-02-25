"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientSidebar from "@/components/client-dashboard/ClientSidebar";
import ClientHeader from "@/components/client-dashboard/ClientHeader";
import ChatWidget from "@/components/client-dashboard/ChatWidget";
import OnboardingFlow from "@/components/client-dashboard/OnboardingFlow";
import { useAgencyBranding } from "@/hooks/useAgencyBranding";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const { agencyName } = useAgencyBranding();

  // Auth guard — redirect to login if no client session
  useEffect(() => {
    try {
      const raw = localStorage.getItem("client_session");
      if (!raw) {
        router.replace("/client-login");
        return;
      }
      const session = JSON.parse(raw);
      if (!session.client_id) {
        router.replace("/client-login");
        return;
      }
      setAuthChecked(true);

      // Show onboarding on first login only
      const onboardingDone = localStorage.getItem("onboarding_completed");
      if (!onboardingDone) {
        setShowOnboarding(true);
      }
    } catch {
      router.replace("/client-login");
    }
  }, [router]);

  // Dynamically set page title to agency name so clients never see "AlgoFinTech"
  useEffect(() => {
    if (agencyName) {
      document.title = `${agencyName} - Client Portal`;
    }
  }, [agencyName]);

  // Show nothing while checking auth (prevents flash of dashboard content)
  if (!authChecked) {
    return (
      <div className="h-screen w-screen bg-[#020408] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

        {/* Floating Chat Widget */}
        <ChatWidget />
      </div>

      {/* Onboarding Flow — shown on first login only */}
      {showOnboarding && (
        <OnboardingFlow onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
