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

// GET: Load saved algorithm IDs for an agency
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ algorithm_ids: [] });
    }

    const agencyId = req.nextUrl.searchParams.get("agency_id");
    if (!agencyId) {
      return NextResponse.json({ algorithm_ids: [] });
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("settings")
      .eq("id", agencyId)
      .single();

    if (!agency) {
      return NextResponse.json({ algorithm_ids: [] });
    }

    const settings = (agency.settings as Record<string, unknown>) || {};
    const ids = (settings.saved_algorithm_ids as string[]) || [];

    return NextResponse.json({ algorithm_ids: ids });
  } catch (err) {
    console.error("Get saved algorithms error:", err);
    return NextResponse.json({ algorithm_ids: [] });
  }
}

// PUT: Save algorithm IDs for an agency
export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const body = await req.json();
    const { agency_id, algorithm_ids } = body;

    if (!agency_id || !Array.isArray(algorithm_ids)) {
      return NextResponse.json({ error: "agency_id and algorithm_ids are required." }, { status: 400 });
    }

    // Get current settings
    const { data: agency } = await supabase
      .from("agencies")
      .select("settings")
      .eq("id", agency_id)
      .single();

    const currentSettings = (agency?.settings as Record<string, unknown>) || {};

    // Update settings with saved algorithm IDs
    const { error } = await supabase
      .from("agencies")
      .update({
        settings: {
          ...currentSettings,
          saved_algorithm_ids: algorithm_ids,
        },
      })
      .eq("id", agency_id);

    if (error) {
      console.error("Save algorithms error:", error);
      // If settings column doesn't exist, fail gracefully
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Put saved algorithms error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
