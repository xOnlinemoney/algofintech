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

    const list = algorithms || [];

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
