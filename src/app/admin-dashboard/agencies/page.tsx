import AdminAgencies from "@/components/admin/AdminAgencies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Agencies | AlgoFinTech Admin",
  description:
    "Manage all partner agencies — view clients, performance, revenue, and account details.",
};

export default function AdminAgenciesPage() {
  return <AdminAgencies />;
}
