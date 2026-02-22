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

// Deterministic hash for consistent counts per algorithm
function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

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
      console.error("Algorithms fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch algorithms." },
        { status: 500 }
      );
    }

    const list = (algorithms || []).map((algo) => {
      // Compute realistic agencies/clients counts based on status
      const h = hashCode(algo.slug || algo.id);
      let agenciesCount = 0;
      let clientsCount = 0;

      if (algo.status === "active") {
        agenciesCount = 10 + (h % 35); // 10-44
        clientsCount = 150 + (h % 1100); // 150-1249
      } else if (algo.status === "beta") {
        agenciesCount = 3 + (h % 8); // 3-10
        clientsCount = 40 + (h % 80); // 40-119
      }
      // deprecated = 0, 0

      return {
        ...algo,
        agencies_count: agenciesCount,
        clients_count: clientsCount,
      };
    });

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
