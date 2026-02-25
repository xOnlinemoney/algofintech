import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ data: null, error: "No Supabase" });
  }

  try {
    // Get client_id (display ID like "CL-7829") from query params
    const clientDisplayId = req.nextUrl.searchParams.get("client_id");
    if (!clientDisplayId) {
      return NextResponse.json({ data: null, error: "client_id is required" });
    }

    // Look up the client — try display ID first, then UUID fallback
    let clientRow = null;
    const { data: byDisplay } = await supabase
      .from("clients")
      .select("id, agency_id, max_accounts")
      .eq("client_id", clientDisplayId)
      .single();
    if (byDisplay) {
      clientRow = byDisplay;
    } else {
      // Fallback: identifier might be a UUID (from old buggy sessions)
      const { data: byUuid } = await supabase
        .from("clients")
        .select("id, agency_id, max_accounts")
        .eq("id", clientDisplayId)
        .single();
      if (byUuid) clientRow = byUuid;
    }

    if (!clientRow) {
      // Client not found in clients table — return empty
      return NextResponse.json({
        data: {
          summary: {
            total_accounts: 0,
            combined_balance: 0,
            total_daily_pnl: 0,
            active_count: 0,
            total_count: 0,
          },
          accounts: [],
        },
      });
    }

    const clientUuid = clientRow.id;

    // Fetch accounts from client_accounts table
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("*")
      .eq("client_id", clientUuid)
      .order("created_at", { ascending: true });

    // Fetch real trade P&L per account from client_trading_activity
    const tradePnlByAccount: Record<string, number> = {};
    const tradeCountByAccount: Record<string, number> = {};
    const { data: tradeRows } = await supabase
      .from("client_trading_activity")
      .select("account_id, pnl")
      .eq("client_id", clientUuid);

    for (const t of (tradeRows || [])) {
      const pnl = Number(t.pnl) || 0;
      tradePnlByAccount[t.account_id] = (tradePnlByAccount[t.account_id] || 0) + pnl;
      tradeCountByAccount[t.account_id] = (tradeCountByAccount[t.account_id] || 0) + 1;
    }

    const platformColors: Record<
      string,
      { color: string; textColor: string; short: string }
    > = {
      Tradovate: { color: "#262626", textColor: "#ffffff", short: "TV" },
      "MetaTrader 4": { color: "#262626", textColor: "#ffffff", short: "MT4" },
      "MetaTrader 5": { color: "#262626", textColor: "#ffffff", short: "MT5" },
      Binance: { color: "#FCD535", textColor: "#000000", short: "BN" },
      Bybit: { color: "#F7A600", textColor: "#000000", short: "BY" },
      Schwab: { color: "#00A0DF", textColor: "#ffffff", short: "SC" },
      "Interactive Brokers": {
        color: "#1e293b",
        textColor: "#ffffff",
        short: "IB",
      },
      Coinbase: { color: "#0052FF", textColor: "#ffffff", short: "CB" },
    };

    const detailedAccounts = (accounts || []).map(
      (a: Record<string, unknown>) => {
        const plat = (a.platform as string) || "Tradovate";
        const colors = platformColors[plat] || {
          color: "#262626",
          textColor: "#ffffff",
          short: plat.substring(0, 2).toUpperCase(),
        };
        const accNum = (a.account_number as string) || "";
        const mask = accNum.length > 4 ? `••••${accNum.slice(-4)}` : accNum;
        const balance = Number(a.balance) || 0;
        const equity = Number(a.equity) || balance;
        const freeMargin = Number(a.free_margin) || equity * 0.9;
        const startingBal = Number(a.starting_balance) || 0;
        // Use real trade P&L, fallback to equity - balance
        const realPnl = tradePnlByAccount[a.id as string] || 0;
        const dailyPnl = realPnl || (equity - balance);
        const weeklyPnl = dailyPnl;

        return {
          id: a.id,
          platform: plat,
          platform_short: colors.short,
          platform_color: colors.color,
          platform_text_color: colors.textColor,
          account_number: accNum,
          account_mask: mask,
          account_label: a.account_label || `${plat} Account`,
          account_type: a.account_type || "Live",
          currency: (a.currency as string) || "USD",
          status: (a.is_active as boolean) ? "Active" : "Inactive",
          balance,
          equity,
          free_margin: freeMargin,
          daily_pnl: dailyPnl,
          daily_pnl_pct:
            balance > 0
              ? Number(((dailyPnl / balance) * 100).toFixed(2))
              : 0,
          weekly_pnl: weeklyPnl,
          weekly_pnl_pct:
            balance > 0
              ? Number(((weeklyPnl / balance) * 100).toFixed(2))
              : 0,
          open_trades: Number(a.open_trades) || 0,
          connected_at: a.created_at,
          algos: [] as { name: string; status: string }[],
        };
      }
    );

    // Calculate summary
    const totalBalance = detailedAccounts.reduce(
      (sum: number, a: { balance: number }) => sum + a.balance,
      0
    );
    const totalDailyPnl = detailedAccounts.reduce(
      (sum: number, a: { daily_pnl: number }) => sum + a.daily_pnl,
      0
    );
    const activeCount = detailedAccounts.filter(
      (a: { status: string }) => a.status === "Active"
    ).length;

    return NextResponse.json({
      data: {
        summary: {
          total_accounts: detailedAccounts.length,
          combined_balance: totalBalance,
          total_daily_pnl: totalDailyPnl,
          active_count: activeCount,
          total_count: detailedAccounts.length,
        },
        accounts: detailedAccounts,
      },
      max_accounts: clientRow.max_accounts ?? null,
    });
  } catch (err) {
    console.error("client-accounts-detail error:", err);
    return NextResponse.json({ data: null });
  }
}
