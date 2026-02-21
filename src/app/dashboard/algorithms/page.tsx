import AlgorithmsGrid from "@/components/dashboard/AlgorithmsGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlgoFinTech - Algorithms Overview",
  description:
    "Browse and deploy algorithmic trading strategies for your clients.",
};

export default function AlgorithmsPage() {
  return (
    <div className="px-6 pb-6">
      <AlgorithmsGrid />
    </div>
  );
}
