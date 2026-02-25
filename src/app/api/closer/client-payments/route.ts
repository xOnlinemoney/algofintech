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
 * Get payment/invoice history for a client via closer token.
 * GET /api/closer/client-payments?token=X&client_id=Y
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    const clientId = req.nextUrl.searchParams.get("client_id");

    if (!token || !clientId) {
      return NextResponse.json({ error: "token and client_id are required." }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });

    // Verify token and check client_id is authorized
    const { data: link } = await supabase
      .from("closer_links")
      .select("client_ids, is_active, expires_at")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (!link) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 403 });
    }
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link expired." }, { status: 410 });
    }
    if (!(link.client_ids || []).includes(clientId)) {
      return NextResponse.json({ error: "Client not authorized for this link." }, { status: 403 });
    }

    // Fetch client info
    const { data: client } = await supabase
      .from("clients")
      .select("id, name, email, status, liquidity, total_pnl, created_at")
      .eq("id", clientId)
      .single();

    // Fetch client accounts for balance info
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("id, account_label, account_number, platform, balance, equity, starting_balance, is_active")
      .eq("client_id", clientId);

    // Fetch trades for P&L calculations grouped by month
    const { data: trades } = await supabase
      .from("client_trading_activity")
      .select("pnl, net_pnl, closed_at, account_id")
      .eq("client_id", clientId)
      .eq("status", "Closed")
      .order("closed_at", { ascending: false })
      .range(0, 4999);

    // Build monthly P&L breakdown (acts as "payment periods")
    const monthlyPnl: Record<string, { pnl: number; trades: number; wins: number; losses: number }> = {};
    for (const t of trades || []) {
      if (!t.closed_at) continue;
      const d = new Date(t.closed_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyPnl[key]) monthlyPnl[key] = { pnl: 0, trades: 0, wins: 0, losses: 0 };
      const pnl = Number(t.net_pnl || t.pnl) || 0;
      monthlyPnl[key].pnl += pnl;
      monthlyPnl[key].trades++;
      if (pnl > 0) monthlyPnl[key].wins++;
      else if (pnl < 0) monthlyPnl[key].losses++;
    }

    // Convert to sorted array
    const periods = Object.entries(monthlyPnl)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({
        period: month,
        label: new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        pnl: Number(data.pnl.toFixed(2)),
        trades: data.trades,
        wins: data.wins,
        losses: data.losses,
        win_rate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      }));

    // Account summaries
    const accountSummaries = (accounts || []).map((a: any) => ({
      id: a.id,
      label: a.account_label || a.account_number || "Unnamed",
      platform: a.platform || "Unknown",
      balance: a.balance || 0,
      equity: a.equity || 0,
      starting_balance: a.starting_balance || 0,
      is_active: a.is_active || false,
      total_pnl: (a.balance || 0) - (a.starting_balance || 0),
    }));

    const totalBalance = accountSummaries.reduce((s: number, a: any) => s + a.balance, 0);
    const totalStarting = accountSummaries.reduce((s: number, a: any) => s + a.starting_balance, 0);
    const totalPnl = (trades || []).reduce((s: number, t: any) => s + (Number(t.net_pnl || t.pnl) || 0), 0);

    return NextResponse.json({
      data: {
        client: client ? { id: client.id, name: client.name, email: client.email, status: client.status, joined: client.created_at } : null,
        summary: {
          total_balance: Number(totalBalance.toFixed(2)),
          total_starting: Number(totalStarting.toFixed(2)),
          total_pnl: Number(totalPnl.toFixed(2)),
          total_trades: (trades || []).length,
          accounts_count: (accounts || []).length,
        },
        accounts: accountSummaries,
        periods,
      },
    });
  } catch (err) {
    console.error("Closer client payments error:", err);
    return NextResponse.json({ data: null });
  }
}
