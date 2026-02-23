import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get("agency_id");
    if (!agencyId) {
      return NextResponse.json({ error: "agency_id required" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const { data: agency, error } = await supabase
      .from("agencies")
      .select("id, status")
      .eq("id", agencyId)
      .single();

    if (error || !agency) {
      return NextResponse.json({ status: "active" }, { status: 200 });
    }

    return NextResponse.json({ status: agency.status || "active" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "active" }, { status: 200 });
  }
}
