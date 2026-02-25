import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

/**
 * Verify a closer link token and return assigned clients with their accounts.
 * GET /api/closer/verify?token=X
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });

    // Look up the closer link
    const { data: link, error: linkErr } = await supabase
      .from("closer_links")
      .select("*")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (linkErr || !link) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });
    }

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: "This link has expired." }, { status: 410 });
    }

    // Fetch agency info
    const { data: agency } = await supabase
      .from("agencies")
      .select("id, name, slug")
      .eq("id", link.agency_id)
      .single();

    // Fetch assigned clients
    const clientIds = link.client_ids || [];
    if (clientIds.length === 0) {
      return NextResponse.json({
        closer_name: link.name,
        agency: agency ? { id: agency.id, name: agency.name } : null,
        clients: [],
      });
    }

    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, email, status")
      .in("id", clientIds)
      .order("name");

    // Fetch accounts for these clients
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("id, client_id, account_number, account_label, platform, balance, equity, is_active")
      .in("client_id", clientIds)
      .order("account_number");

    // Group accounts by client
    const accountsByClient: Record<string, any[]> = {};
    for (const acc of accounts || []) {
      if (!accountsByClient[acc.client_id]) accountsByClient[acc.client_id] = [];
      accountsByClient[acc.client_id].push(acc);
    }

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
        balance: a.balance || 0,
        equity: a.equity || 0,
        is_active: a.is_active || false,
      })),
    }));

    return NextResponse.json({
      closer_name: link.name,
      agency: agency ? { id: agency.id, name: agency.name } : null,
      clients: enrichedClients,
    });
  } catch (err) {
    console.error("Closer verify error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
