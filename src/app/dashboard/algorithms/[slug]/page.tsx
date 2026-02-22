import AlgorithmDetailClient from "@/components/dashboard/AlgorithmDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ─── Dynamic metadata ───────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Convert slug to readable name for title
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `AlgoFinTech - ${name}`,
    description: "Algorithm performance details.",
  };
}

// ─── Page Component ─────────────────────────────────────
export default async function AlgorithmPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="px-6 pb-6">
      {/* Chart.js CDN */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js" async />
      <AlgorithmDetailClient slug={slug} />
    </div>
  );
}
