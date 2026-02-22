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

    // Fetch all agencies
    const { data: agencies, error: agenciesErr } = await supabase
      .from("agencies")
      .select("*")
      .order("created_at", { ascending: true });

    if (agenciesErr) {
      console.error("Agencies fetch error:", agenciesErr);
      return NextResponse.json({ error: "Failed to fetch agencies." }, { status: 500 });
    }

    // Fetch all clients to compute per-agency stats
    const { data: allClients } = await supabase
      .from("clients")
      .select("id, agency_id, status, total_pnl, liquidity, name, email");

    // Fetch all client accounts for deeper stats
    const { data: allAccounts } = await supabase
      .from("client_accounts")
      .select("client_id, agency_id, balance, is_active, open_trades");

    // Build per-agency client stats
    const agencyClientStats: Record<
      string,
      {
        totalClients: number;
        activeClients: number;
        inactiveClients: number;
        suspendedClients: number;
        pendingClients: number;
        totalPnl: number;
        totalLiquidity: number;
      }
    > = {};

    if (allClients) {
      for (const c of allClients) {
        if (!agencyClientStats[c.agency_id]) {
          agencyClientStats[c.agency_id] = {
            totalClients: 0,
            activeClients: 0,
            inactiveClients: 0,
            suspendedClients: 0,
            pendingClients: 0,
            totalPnl: 0,
            totalLiquidity: 0,
          };
        }
        const s = agencyClientStats[c.agency_id];
        s.totalClients++;
        if (c.status === "active") s.activeClients++;
        else if (c.status === "inactive") s.inactiveClients++;
        else if (c.status === "suspended") s.suspendedClients++;
        else if (c.status === "pending") s.pendingClients++;
        s.totalPnl += c.total_pnl || 0;
        s.totalLiquidity += c.liquidity || 0;
      }
    }

    // Build per-agency account stats
    const agencyAccountStats: Record<
      string,
      {
        totalAccounts: number;
        activeAccounts: number;
        totalBalance: number;
        openTrades: number;
      }
    > = {};

    if (allAccounts) {
      for (const a of allAccounts) {
        const agId = a.agency_id;
        if (!agId) continue;
        if (!agencyAccountStats[agId]) {
          agencyAccountStats[agId] = {
            totalAccounts: 0,
            activeAccounts: 0,
            totalBalance: 0,
            openTrades: 0,
          };
        }
        const s = agencyAccountStats[agId];
        s.totalAccounts++;
        if (a.is_active) s.activeAccounts++;
        s.totalBalance += a.balance || 0;
        s.openTrades += a.open_trades || 0;
      }
    }

    // Combine into enriched agency list
    const enrichedAgencies = (agencies || []).map((agency) => {
      const cs = agencyClientStats[agency.id] || {
        totalClients: 0,
        activeClients: 0,
        inactiveClients: 0,
        suspendedClients: 0,
        pendingClients: 0,
        totalPnl: 0,
        totalLiquidity: 0,
      };
      const as = agencyAccountStats[agency.id] || {
        totalAccounts: 0,
        activeAccounts: 0,
        totalBalance: 0,
        openTrades: 0,
      };
      const activePercent =
        cs.totalClients > 0
          ? Math.round((cs.activeClients / cs.totalClients) * 100)
          : 0;

      return {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        plan: agency.plan || "starter",
        created_at: agency.created_at,
        // Client stats
        totalClients: cs.totalClients,
        activeClients: cs.activeClients,
        inactiveClients: cs.inactiveClients,
        suspendedClients: cs.suspendedClients,
        pendingClients: cs.pendingClients,
        activePercent,
        totalPnl: cs.totalPnl,
        totalLiquidity: cs.totalLiquidity,
        // Account stats
        totalAccounts: as.totalAccounts,
        activeAccounts: as.activeAccounts,
        totalBalance: as.totalBalance,
        openTrades: as.openTrades,
        // Revenue approximation (sum of absolute pnl as proxy)
        revenue: Math.abs(cs.totalPnl) + cs.totalLiquidity * 0.02,
      };
    });

    // Summary stats
    const totalAgencies = enrichedAgencies.length;
    const totalClientsAll = enrichedAgencies.reduce((s, a) => s + a.totalClients, 0);
    const suspendedAgencies = enrichedAgencies.filter(
      (a) => a.suspendedClients > 0
    ).length;

    return NextResponse.json(
      {
        agencies: enrichedAgencies,
        summary: {
          total: totalAgencies,
          totalClients: totalClientsAll,
          suspended: suspendedAgencies,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin agencies API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
