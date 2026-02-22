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

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No supabase" }, { status: 503 });
  }

  const emailParam = req.nextUrl.searchParams.get("email") || "";

  // Fetch all used keys
  const { data: keys, error } = await supabase
    .from("software_keys")
    .select("id, license_key, status, agency_id, metadata")
    .eq("status", "used");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Show summary of all used keys (mask sensitive data)
  const summary = (keys || []).map((k: Record<string, unknown>) => {
    const meta = (k.metadata as Record<string, string>) || {};
    return {
      key_id: k.id,
      license_key: k.license_key,
      agency_id: k.agency_id,
      signup_email: meta.signup_email || "(none)",
      has_password: meta.signup_password ? "YES" : "NO",
      signup_type: meta.signup_type || "(none)",
      signup_name: meta.signup_name || "(none)",
      email_match: emailParam
        ? meta.signup_email?.toLowerCase() === emailParam.toLowerCase()
        : null,
    };
  });

  return NextResponse.json({
    total_used_keys: summary.length,
    search_email: emailParam || "(none provided - add ?email=xxx to filter)",
    keys: summary,
  });
}
