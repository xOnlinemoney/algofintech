import AdminDashboard from "@/components/admin/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | AlgoFinTech",
  description:
    "AlgoFinTech admin command center — monitor agencies, clients, AUM, and trading performance.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
