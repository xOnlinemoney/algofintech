import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/agency/algorithms
 * Returns all active algorithms from Supabase for agency-side display.
 * Maps Supabase columns + JSONB fields to the shape the AlgorithmsGrid expects.
 */
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const { data: algorithms, error } = await supabase
      .from("algorithms")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Agency algorithms fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch algorithms.", details: error.message },
        { status: 500 }
      );
    }

    // Normalize to the shape AlgorithmsGrid / AlgorithmDetail expects
    const list = (algorithms || []).map((algo: any) => {
      const metrics = algo.metrics || {};
      const info = algo.info || {};
      const equityChart = algo.equity_chart || {};
      const monthlyReturns = algo.monthly_returns || [];

      return {
        id: algo.id,
        slug: algo.slug,
        name: algo.name,
        description: algo.description || "",
        category: algo.category || "Forex",
        image_url: algo.image_url || "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80",
        agency_id: algo.agency_id || "",
        // Performance fields
        roi: algo.roi || metrics.total_return || metrics.roi || "0%",
        drawdown: algo.drawdown || metrics.max_drawdown || metrics.drawdown || "0%",
        win_rate: algo.win_rate || metrics.win_rate || "0%",
        // Extended metrics for detail page
        metrics: {
          total_return: metrics.total_return || algo.roi || "0%",
          win_rate: metrics.win_rate || algo.win_rate || "0%",
          profit_factor: metrics.profit_factor || "0",
          max_drawdown: metrics.max_drawdown || algo.drawdown || "0%",
          sharpe_ratio: metrics.sharpe_ratio || "0",
          avg_duration: metrics.avg_duration || "N/A",
        },
        // Info for detail page
        info: {
          timeframe: info.timeframe || "N/A",
          min_account: info.min_account || "N/A",
          instruments: info.instruments || algo.category || "N/A",
          trades_per_month: info.trades_per_month || "N/A",
        },
        // Chart data
        equity_chart: {
          labels: equityChart.labels || [],
          data: equityChart.data || [],
        },
        // Monthly returns
        monthly_returns: monthlyReturns,
        // Status
        status: algo.status || "active",
      };
    });

    return NextResponse.json({ algorithms: list }, { status: 200 });
  } catch (err) {
    console.error("Agency algorithms API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
