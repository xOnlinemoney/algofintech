import { Metadata } from "next";
import AdminAlgorithmDetail from "@/components/admin/AdminAlgorithmDetail";

export const metadata: Metadata = {
  title: "Algorithm Detail | AlgoFinTech Admin",
  description: "View and edit algorithm details.",
};

export default async function AlgorithmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminAlgorithmDetail algorithmId={id} />;
}
