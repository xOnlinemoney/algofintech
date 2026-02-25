import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/client-stats
 * Returns a map of client_display_id → { accounts_count, active_strategies, liquidity }
 * Used by the ClientsTable to show live counts.
 */
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url === "https://your-project.supabase.co") {
      return NextResponse.json({ data: {} }, { status: 200 });
    }

    const supabase = createClient(url, key);

    // Get all clients with their display IDs
    const { data: clients } = await supabase
      .from("clients")
      .select("id, client_id");

    if (!clients || clients.length === 0) {
      return NextResponse.json({ data: {} }, { status: 200 });
    }

    // Get all client accounts
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("client_id, equity, algorithm_id");

    if (!accounts) {
      return NextResponse.json({ data: {} }, { status: 200 });
    }

    // Get all trades to calculate real PnL per client
    const allClientIds = clients.map((c) => c.id);
    const { data: trades } = await supabase
      .from("client_trading_activity")
      .select("client_id, pnl")
      .in("client_id", allClientIds)
      .range(0, 4999);

    // Build PnL map: client UUID → total PnL
    const pnlByClient: Record<string, number> = {};
    for (const t of trades || []) {
      const cId = t.client_id;
      pnlByClient[cId] = (pnlByClient[cId] || 0) + (Number(t.pnl) || 0);
    }

    // Build stats map
    const statsMap: Record<
      string,
      { accounts_count: number; active_strategies: number; liquidity: number; total_pnl: number }
    > = {};

    for (const client of clients) {
      const clientAccounts = accounts.filter(
        (a) => a.client_id === client.id
      );
      const uniqueAlgos = new Set(
        clientAccounts
          .filter((a) => a.algorithm_id)
          .map((a) => a.algorithm_id)
      );
      const totalEquity = clientAccounts.reduce(
        (sum, a) => sum + (Number(a.equity) || 0),
        0
      );

      statsMap[client.client_id] = {
        accounts_count: clientAccounts.length,
        active_strategies: uniqueAlgos.size,
        liquidity: totalEquity,
        total_pnl: pnlByClient[client.id] || 0,
      };
    }

    return NextResponse.json({ data: statsMap }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
