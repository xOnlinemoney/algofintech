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

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    // Fetch all algorithms
    const { data: algorithms, error } = await supabase
      .from("algorithms")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Algorithms fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch algorithms.", details: error.message },
        { status: 500 }
      );
    }

    // Fetch agency counts per algorithm (wrapped in try/catch so it doesn't break everything)
    let agencyCountMap: Record<string, number> = {};
    try {
      const { data: agencySaved } = await supabase
        .from("agency_saved_algorithms")
        .select("algorithm_id, agency_id");

      if (agencySaved) {
        const agencySetMap: Record<string, Set<string>> = {};
        for (const row of agencySaved) {
          if (!agencySetMap[row.algorithm_id]) {
            agencySetMap[row.algorithm_id] = new Set();
          }
          agencySetMap[row.algorithm_id].add(row.agency_id);
        }
        for (const [algoId, agencySet] of Object.entries(agencySetMap)) {
          agencyCountMap[algoId] = agencySet.size;
        }
      }
    } catch {
      agencyCountMap = {};
    }

    // Fetch client counts per algorithm (wrapped in try/catch)
    let clientCountMap: Record<string, number> = {};
    try {
      const { data: clientAccounts } = await supabase
        .from("client_accounts")
        .select("algorithm_id, client_id")
        .not("algorithm_id", "is", null);

      if (clientAccounts) {
        const clientSetMap: Record<string, Set<string>> = {};
        for (const row of clientAccounts) {
          if (!clientSetMap[row.algorithm_id]) {
            clientSetMap[row.algorithm_id] = new Set();
          }
          clientSetMap[row.algorithm_id].add(row.client_id);
        }
        for (const [algoId, clientSet] of Object.entries(clientSetMap)) {
          clientCountMap[algoId] = clientSet.size;
        }
      }
    } catch {
      clientCountMap = {};
    }

    // Normalize algorithm data — extract fields from JSONB if not top-level columns
    const list = (algorithms || []).map((algo: any) => {
      const metrics = algo.metrics || {};
      const info = algo.info || {};

      return {
        id: algo.id,
        slug: algo.slug,
        name: algo.name,
        description: algo.description || "",
        category: algo.category || "Forex",
        image_url: algo.image_url || null,
        // Performance fields — check top-level first, then metrics JSONB
        roi: algo.roi || metrics.total_return || metrics.roi || "0%",
        drawdown: algo.drawdown || metrics.max_drawdown || metrics.drawdown || "0%",
        win_rate: algo.win_rate || metrics.win_rate || "0%",
        sharpe_ratio: Number(algo.sharpe_ratio ?? metrics.sharpe_ratio ?? metrics.profit_factor ?? 0) || 0,
        // Risk & pairs — check top-level first, then info/metrics JSONB
        risk_level: algo.risk_level || info.risk_level || metrics.risk_level || "medium",
        pairs: algo.pairs || info.instruments || info.pairs || algo.category || "",
        // Status
        status: algo.status || "active",
        // Timestamps
        last_updated: algo.updated_at || algo.created_at,
        created_at: algo.created_at,
        // Computed counts from join tables
        agencies_count: agencyCountMap[algo.id] || 0,
        clients_count: clientCountMap[algo.id] || 0,
      };
    });

    const summary = {
      total: list.length,
      active: list.filter((a: any) => a.status === "active").length,
      beta: list.filter((a: any) => a.status === "beta").length,
      paused: list.filter((a: any) => a.status === "paused").length,
      deprecated: list.filter((a: any) => a.status === "deprecated").length,
    };

    return NextResponse.json({ algorithms: list, summary }, { status: 200 });
  } catch (err) {
    console.error("Admin algorithms API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/algorithms
 * Create a new algorithm in Supabase.
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Build the insert object — only columns that exist in the algorithms table
    // Note: risk_level is stored inside info JSONB, not a top-level column
    const info = body.info || {};
    if (body.risk_level) {
      info.risk_level = body.risk_level;
    }

    const insert: any = {
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      category: body.category || "Forex",
      status: body.status || "active",
      image_url: body.image_url || null,
      roi: body.roi || "0%",
      drawdown: body.drawdown || "0%",
      win_rate: body.win_rate || "0%",
      info: info,
      metrics: body.metrics || {},
      equity_chart: body.equity_chart || { labels: [], data: [] },
      monthly_returns: body.monthly_returns || [],
    };

    // The DB constraint only allows: 'active', 'paused', 'deprecated'
    // Map draft/beta to DB-compatible values, store true status in info JSONB
    const dbAllowed = ["active", "paused", "deprecated"];
    if (!dbAllowed.includes(insert.status)) {
      // Store the intended status in info for display purposes
      insert.info = { ...insert.info, intended_status: insert.status };
      // Map to DB-compatible: draft → paused, beta → active
      if (insert.status === "draft") {
        insert.status = "paused";
      } else if (insert.status === "beta") {
        insert.status = "active";
      } else {
        insert.status = "active";
      }
    }

    const { data, error } = await supabase
      .from("algorithms")
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error("Algorithm insert error:", error);
      return NextResponse.json(
        { error: "Failed to create algorithm.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ algorithm: data }, { status: 201 });
  } catch (err) {
    console.error("Admin algorithms POST error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
