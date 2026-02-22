import { Metadata } from "next";
import AdminAgencyDetail from "@/components/admin/AdminAgencyDetail";

export const metadata: Metadata = {
  title: "Agency Detail | AlgoFinTech Admin",
  description: "View detailed information about a partner agency.",
};

export default async function AgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminAgencyDetail agencyId={id} />;
}
