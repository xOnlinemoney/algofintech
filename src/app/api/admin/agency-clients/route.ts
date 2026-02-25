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

/**
 * Lightweight endpoint for cascading Agency → Client → Account dropdowns.
 * Returns clients and their accounts for a given agency_id.
 *
 * GET /api/admin/agency-clients?agency_id=UUID
 */
export async function GET(req: NextRequest) {
  try {
    const agencyId = req.nextUrl.searchParams.get("agency_id");
    if (!agencyId) {
      return NextResponse.json(
        { error: "agency_id query parameter is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    // Fetch clients for this agency
    const { data: clients, error: clientsErr } = await supabase
      .from("clients")
      .select("id, name, email, status")
      .eq("agency_id", agencyId)
      .order("name", { ascending: true });

    if (clientsErr) {
      console.error("Agency clients fetch error:", clientsErr);
      return NextResponse.json(
        { error: "Failed to fetch clients." },
        { status: 500 }
      );
    }

    // Fetch all accounts for this agency
    const { data: accounts, error: accountsErr } = await supabase
      .from("client_accounts")
      .select("id, client_id, account_number, account_label, platform, is_active")
      .eq("agency_id", agencyId)
      .order("account_number", { ascending: true });

    if (accountsErr) {
      console.error("Agency accounts fetch error:", accountsErr);
      return NextResponse.json(
        { error: "Failed to fetch accounts." },
        { status: 500 }
      );
    }

    // Group accounts by client_id
    const accountsByClient: Record<string, typeof accounts> = {};
    for (const acc of accounts || []) {
      if (!accountsByClient[acc.client_id]) {
        accountsByClient[acc.client_id] = [];
      }
      accountsByClient[acc.client_id].push(acc);
    }

    // Build response with clients and their accounts
    const enrichedClients = (clients || []).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      status: c.status,
      accounts: (accountsByClient[c.id] || []).map((a) => ({
        id: a.id,
        account_number: a.account_number || "",
        account_label: a.account_label || a.account_number || "Unnamed",
        platform: a.platform || "Unknown",
        is_active: a.is_active || false,
      })),
    }));

    return NextResponse.json({ clients: enrichedClients }, { status: 200 });
  } catch (err) {
    console.error("Agency clients API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
