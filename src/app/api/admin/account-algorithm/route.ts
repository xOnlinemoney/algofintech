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

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { account_id, algorithm_id } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: "account_id is required." },
        { status: 400 }
      );
    }

    // algorithm_id can be null (to unassign)
    const { error } = await supabase
      .from("client_accounts")
      .update({
        algorithm_id: algorithm_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account_id);

    if (error) {
      console.error("Update account algorithm error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, algorithm_id: algorithm_id || null });
  } catch (err) {
    console.error("PATCH account-algorithm error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
