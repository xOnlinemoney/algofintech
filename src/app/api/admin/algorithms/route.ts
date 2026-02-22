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
        { error: "Failed to fetch algorithms." },
        { status: 500 }
      );
    }

    // Fetch agency counts per algorithm from agency_saved_algorithms
    const { data: agencySaved } = await supabase
      .from("agency_saved_algorithms")
      .select("algorithm_id, agency_id");

    // Build a map: algorithm_id -> count of distinct agencies
    const agencyCountMap: Record<string, number> = {};
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

    // Fetch client counts per algorithm from client_accounts
    const { data: clientAccounts } = await supabase
      .from("client_accounts")
      .select("algorithm_id, client_id")
      .not("algorithm_id", "is", null);

    // Build a map: algorithm_id -> count of distinct clients
    const clientCountMap: Record<string, number> = {};
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

    // Merge counts into algorithm data
    const list = (algorithms || []).map((algo) => ({
      ...algo,
      agencies_count: agencyCountMap[algo.id] || 0,
      clients_count: clientCountMap[algo.id] || 0,
    }));

    const summary = {
      total: list.length,
      active: list.filter((a) => a.status === "active").length,
      beta: list.filter((a) => a.status === "beta").length,
      deprecated: list.filter((a) => a.status === "deprecated").length,
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
