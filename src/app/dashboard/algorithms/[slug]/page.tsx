import { notFound } from "next/navigation";
import AlgorithmDetailView from "@/components/dashboard/AlgorithmDetail";
import { getAlgorithmBySlug, getAlgorithmDetail, mockAlgorithms } from "@/lib/mock-data";
import type { Metadata } from "next";

// ─── Static params for SSG ──────────────────────────────
export function generateStaticParams() {
  return mockAlgorithms.map((algo) => ({ slug: algo.slug }));
}

// ─── Dynamic metadata ───────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const algo = getAlgorithmBySlug(slug);
  return {
    title: algo ? `AlgoFinTech - ${algo.name}` : "AlgoFinTech - Algorithm",
    description: algo?.description ?? "Algorithm performance details.",
  };
}

// ─── Page Component ─────────────────────────────────────
export default async function AlgorithmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const algorithm = getAlgorithmBySlug(slug);
  const detail = algorithm ? getAlgorithmDetail(algorithm.id) : null;

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
