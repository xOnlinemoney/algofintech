import ClientsGrid from "@/components/dashboard/ClientsTable";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlgoFinTech - Clients",
  description: "Manage your agency clients, monitor their accounts and performance.",
};

export default function ClientsPage() {
  return (
    <div className="px-6 pb-6">
      <ClientsGrid />
    </div>
  );
}
