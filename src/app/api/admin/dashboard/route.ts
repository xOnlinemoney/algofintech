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

    // ─── 1. Total Agencies ──────────────────────────────
    const { count: totalAgencies } = await supabase
      .from("agencies")
      .select("id", { count: "exact", head: true });

    // Agency status breakdown (using plan as proxy for now)
    const { data: agenciesData } = await supabase
      .from("agencies")
      .select("id, name, slug, plan, created_at");

    // ─── 2. Total Clients (across ALL agencies) ─────────
    const { count: totalClients } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true });

    const { count: activeClients } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    const { count: inactiveClients } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "inactive");

    const { count: pendingClients } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: suspendedClients } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "suspended");

    // ─── 3. Assets Under Management (sum of all account balances) ─
    const { data: accountsData } = await supabase
      .from("client_accounts")
      .select("balance, equity, asset_class, is_active, open_trades");

    let totalAUM = 0;
    let fxAUM = 0;
    let cryptoAUM = 0;
    let stocksAUM = 0;
    let futuresAUM = 0;
    let totalOpenTrades = 0;
    let activeAccounts = 0;

    if (accountsData) {
      for (const acc of accountsData) {
        const bal = acc.balance || 0;
        totalAUM += bal;
        totalOpenTrades += acc.open_trades || 0;
        if (acc.is_active) activeAccounts++;

        switch (acc.asset_class) {
          case "Forex":
            fxAUM += bal;
            break;
          case "Crypto":
            cryptoAUM += bal;
            break;
          case "Stocks":
            stocksAUM += bal;
            break;
          case "Futures":
            futuresAUM += bal;
            break;
        }
      }
    }

    // ─── 4. Trading Profits (sum of all client total_pnl) ──
    const { data: clientsPnl } = await supabase
      .from("clients")
      .select("total_pnl, pnl_percentage");

    let totalProfits = 0;
    let profitableClients = 0;
    let unprofitableClients = 0;

    if (clientsPnl) {
      for (const c of clientsPnl) {
        totalProfits += c.total_pnl || 0;
        if ((c.total_pnl || 0) > 0) profitableClients++;
        else if ((c.total_pnl || 0) < 0) unprofitableClients++;
      }
    }

    // ─── 5. Top Agencies by client count ──────────────────
    const { data: allClients } = await supabase
      .from("clients")
      .select("agency_id, status, total_pnl, liquidity");

    // Build agency stats
    const agencyStats: Record<
      string,
      {
        clientCount: number;
        activeCount: number;
        totalRevenue: number;
      }
    > = {};

    if (allClients) {
      for (const c of allClients) {
        if (!agencyStats[c.agency_id]) {
          agencyStats[c.agency_id] = {
            clientCount: 0,
            activeCount: 0,
            totalRevenue: 0,
          };
        }
        agencyStats[c.agency_id].clientCount++;
        if (c.status === "active") agencyStats[c.agency_id].activeCount++;
        agencyStats[c.agency_id].totalRevenue += Math.abs(c.total_pnl || 0);
      }
    }

    // Build top agencies leaderboard
    const topAgencies = (agenciesData || [])
      .map((agency) => {
        const stats = agencyStats[agency.id] || {
          clientCount: 0,
          activeCount: 0,
          totalRevenue: 0,
        };
        return {
          id: agency.id,
          name: agency.name,
          plan: agency.plan,
          clients: stats.clientCount,
          activeClients: stats.activeCount,
          activePercent:
            stats.clientCount > 0
              ? Math.round((stats.activeCount / stats.clientCount) * 100)
              : 0,
          revenue: stats.totalRevenue,
        };
      })
      .sort((a, b) => b.clients - a.clients)
      .slice(0, 10);

    // ─── 6. Software Keys stats ───────────────────────────
    const { count: totalKeys } = await supabase
      .from("software_keys")
      .select("id", { count: "exact", head: true });

    const { count: activeKeys } = await supabase
      .from("software_keys")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    const { count: usedKeys } = await supabase
      .from("software_keys")
      .select("id", { count: "exact", head: true })
      .eq("status", "used");

    // ─── 7. Algorithm count ───────────────────────────────
    let totalAlgorithms = 0;
    try {
      const { count } = await supabase
        .from("algorithms")
        .select("id", { count: "exact", head: true });
      totalAlgorithms = count || 0;
    } catch {
      // Table might not exist
    }

    return NextResponse.json(
      {
        agencies: {
          total: totalAgencies || 0,
          list: agenciesData || [],
        },
        clients: {
          total: totalClients || 0,
          active: activeClients || 0,
          inactive: inactiveClients || 0,
          pending: pendingClients || 0,
          suspended: suspendedClients || 0,
          profitable: profitableClients,
          unprofitable: unprofitableClients,
        },
        aum: {
          total: totalAUM,
          fx: fxAUM,
          crypto: cryptoAUM,
          stocks: stocksAUM,
          futures: futuresAUM,
        },
        trading: {
          totalProfits,
          openTrades: totalOpenTrades,
          activeAccounts,
          totalAccounts: accountsData?.length || 0,
        },
        topAgencies,
        keys: {
          total: totalKeys || 0,
          active: activeKeys || 0,
          used: usedKeys || 0,
        },
        algorithms: {
          total: totalAlgorithms,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin dashboard API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
