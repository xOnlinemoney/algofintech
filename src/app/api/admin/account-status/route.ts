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
    const { account_id, is_active } = body;

    if (!account_id || typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "account_id and is_active (boolean) are required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("client_accounts")
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account_id);

    if (error) {
      console.error("Update account status error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_active });
  } catch (err) {
    console.error("PATCH account-status error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
