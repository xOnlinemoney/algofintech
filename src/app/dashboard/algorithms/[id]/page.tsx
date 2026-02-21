import { notFound } from "next/navigation";
import AlgorithmDetailView from "@/components/dashboard/AlgorithmDetail";
import { getAlgorithmById, getAlgorithmDetail, mockAlgorithms } from "@/lib/mock-data";
import type { Metadata } from "next";

// ─── Static params for SSG ──────────────────────────────
export function generateStaticParams() {
  return mockAlgorithms.map((algo) => ({ id: algo.id }));
}

// ─── Dynamic metadata ───────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const algo = getAlgorithmById(id);
  return {
    title: algo ? `AlgoFinTech - ${algo.name}` : "AlgoFinTech - Algorithm",
    description: algo?.description ?? "Algorithm performance details.",
  };
}

// ─── Page Component ─────────────────────────────────────
export default async function AlgorithmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const algorithm = getAlgorithmById(id);
  const detail = getAlgorithmDetail(id);

  if (!algorithm || !detail) {
    notFound();
  }

  return (
    <div className="px-6 pb-6">
      {/* Chart.js CDN */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js" async />
      <AlgorithmDetailView algorithm={algorithm} detail={detail} />
    </div>
  );
}
