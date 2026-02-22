import AdminAlgorithmLibrary from "@/components/admin/AdminAlgorithmLibrary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algorithm Library | AlgoFinTech Admin",
  description:
    "Manage trading algorithms, monitor performance, and track deployment across agencies.",
};

export default function AdminAlgorithmsPage() {
  return <AdminAlgorithmLibrary />;
}
