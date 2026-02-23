import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AgencyStatusBanner from "@/components/dashboard/AgencyStatusBanner";
import { SavedAlgorithmsProvider } from "@/context/SavedAlgorithmsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SavedAlgorithmsProvider>
      <div className="overflow-hidden h-screen w-screen">
        <div className="fixed inset-0 flex w-full h-full bg-[#020408] font-sans text-slate-400 selection:bg-blue-500/30">
          <Sidebar />

          <main className="flex-1 flex flex-col min-w-0 bg-[#0A0C10]">
            <AgencyStatusBanner />
            <DashboardHeader />

            <div className="flex-1 overflow-auto custom-scrollbar">
              <div className="min-h-full flex flex-col pt-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SavedAlgorithmsProvider>
  );
}
