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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    // 1. Fetch the agency
    const { data: agency, error: agencyErr } = await supabase
      .from("agencies")
      .select("*")
      .eq("id", id)
      .single();

    if (agencyErr || !agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    // 2. Fetch all clients for this agency
    const { data: clients } = await supabase
      .from("clients")
      .select("*")
      .eq("agency_id", id)
      .order("created_at", { ascending: false });

    // 3. Fetch all client accounts for this agency
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("*")
      .eq("agency_id", id);

    // 4. Build client stats
    const clientList = (clients || []);
    const totalClients = clientList.length;
    const activeClients = clientList.filter((c) => c.status === "active").length;
    const inactiveClients = clientList.filter((c) => c.status === "inactive").length;
    const suspendedClients = clientList.filter((c) => c.status === "suspended").length;
    const pendingClients = clientList.filter((c) => c.status === "pending").length;
    const activePercent = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

    // 5. Build financial stats from clients
    let totalPnl = 0;
    let totalLiquidity = 0;
    let profitableClients = 0;
    let unprofitableClients = 0;

    for (const c of clientList) {
      totalPnl += c.total_pnl || 0;
      totalLiquidity += c.liquidity || 0;
      if ((c.total_pnl || 0) > 0) profitableClients++;
      else if ((c.total_pnl || 0) < 0) unprofitableClients++;
    }

    // 6. Build account stats & market distribution
    const accountList = (accounts || []);
    let totalBalance = 0;
    let totalEquity = 0;
    let totalOpenTrades = 0;
    let activeAccounts = 0;
    let totalAccounts = accountList.length;
    const assetDistribution: Record<string, number> = {};
    const platformDistribution: Record<string, number> = {};

    for (const acc of accountList) {
      totalBalance += acc.balance || 0;
      totalEquity += acc.equity || 0;
      totalOpenTrades += acc.open_trades || 0;
      if (acc.is_active) activeAccounts++;

      // Asset class distribution by balance
      const ac = acc.asset_class || "Other";
      assetDistribution[ac] = (assetDistribution[ac] || 0) + (acc.balance || 0);

      // Platform distribution
      const pl = acc.platform || "Unknown";
      platformDistribution[pl] = (platformDistribution[pl] || 0) + 1;
    }

    // Convert asset distribution to percentages
    const assetBreakdown = Object.entries(assetDistribution).map(([name, value]) => ({
      name,
      value,
      percent: totalBalance > 0 ? Math.round((value / totalBalance) * 100) : 0,
    }));

    // 7. Build per-client details with their accounts
    const clientAccountMap: Record<string, typeof accountList> = {};
    for (const acc of accountList) {
      if (!clientAccountMap[acc.client_id]) {
        clientAccountMap[acc.client_id] = [];
      }
      clientAccountMap[acc.client_id].push(acc);
    }

    const enrichedClients = clientList.map((client) => {
      const clientAccs = clientAccountMap[client.id] || [];
      const clientAUM = clientAccs.reduce((s, a) => s + (a.balance || 0), 0);
      const clientActiveAccounts = clientAccs.filter((a) => a.is_active).length;
      return {
        id: client.id,
        client_id: client.client_id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        liquidity: client.liquidity,
        total_pnl: client.total_pnl,
        pnl_percentage: client.pnl_percentage,
        risk_level: client.risk_level,
        broker: client.broker,
        joined_at: client.joined_at || client.created_at,
        last_active: client.last_active,
        active_strategies: client.active_strategies,
        accounts_count: clientAccs.length,
        active_accounts: clientActiveAccounts,
        aum: clientAUM,
      };
    });

    // 8. Revenue approximation
    const revenue = Math.abs(totalPnl) + totalLiquidity * 0.02;

    // 9. Compute health score (0-100)
    let healthScore = 50; // base
    if (activePercent >= 90) healthScore += 20;
    else if (activePercent >= 70) healthScore += 10;
    if (totalPnl > 0) healthScore += 15;
    if (suspendedClients === 0) healthScore += 10;
    if (totalClients >= 5) healthScore += 5;
    healthScore = Math.min(healthScore, 100);

    const healthLabel =
      healthScore >= 90
        ? "Excellent"
        : healthScore >= 70
        ? "Good"
        : healthScore >= 50
        ? "Fair"
        : "Needs Attention";

    return NextResponse.json(
      {
        agency: {
          id: agency.id,
          name: agency.name,
          slug: agency.slug,
          plan: agency.plan || "starter",
          created_at: agency.created_at,
        },
        stats: {
          totalClients,
          activeClients,
          inactiveClients,
          suspendedClients,
          pendingClients,
          activePercent,
          totalPnl,
          totalLiquidity,
          profitableClients,
          unprofitableClients,
          totalBalance,
          totalEquity,
          totalOpenTrades,
          activeAccounts,
          totalAccounts,
          revenue,
        },
        assetBreakdown,
        platformDistribution: Object.entries(platformDistribution).map(([name, count]) => ({ name, count })),
        clients: enrichedClients,
        health: {
          score: healthScore,
          label: healthLabel,
          activityLevel: activePercent >= 80 ? "High" : activePercent >= 50 ? "Medium" : "Low",
          paymentStatus: "On Time",
          growthRate: `${activePercent > 0 ? "+" : ""}${activePercent}%`,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin agency detail API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
