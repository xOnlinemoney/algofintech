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
    return NextResponse.json({ data: null, error: "No Supabase" });
  }

  try {
    // Get the client_id from query params (display ID like "CL-1234" or UUID)
    const clientDisplayId = req.nextUrl.searchParams.get("client_id");
    if (!clientDisplayId) {
      return NextResponse.json({ data: null });
    }

    // Look up the client — try display ID first, then UUID fallback
    let clientRow: { id: string; name: string; agency_id: string } | null = null;
    const { data: byDisplay } = await supabase
      .from("clients")
      .select("id, name, agency_id")
      .eq("client_id", clientDisplayId)
      .single();

    if (byDisplay) {
      clientRow = byDisplay;
    } else {
      // Fallback: try as UUID (from old sessions)
      const { data: byUuid } = await supabase
        .from("clients")
        .select("id, name, agency_id")
        .eq("id", clientDisplayId)
        .single();
      if (byUuid) clientRow = byUuid;
    }

    if (!clientRow) {
      return NextResponse.json({ data: null });
    }

    const clientUuid = clientRow.id;

    // Fetch connected accounts
    const { data: sharedAccounts } = await supabase
      .from("client_accounts")
      .select("*")
      .eq("client_id", clientUuid)
      .order("created_at", { ascending: true });

    // Fetch ALL trades for this client
    const { data: tradeRows } = await supabase
      .from("client_trading_activity")
      .select("id, account_id, symbol, trade_type, entry_price, exit_price, pnl, net_pnl, status, opened_at, closed_at, duration, position_size")
      .eq("client_id", clientUuid)
      .order("opened_at", { ascending: false });

    const allTrades = tradeRows || [];

    // Compute trade P&L per account
    const tradePnlByAccount: Record<string, number> = {};
    let totalTradePnl = 0;
    let totalTradeCount = allTrades.length;
    let tradeWins = 0;
    let tradeLosses = 0;

    for (const t of allTrades) {
      const pnl = Number(t.pnl) || 0;
      tradePnlByAccount[t.account_id] = (tradePnlByAccount[t.account_id] || 0) + pnl;
      totalTradePnl += pnl;
      if (pnl > 0) tradeWins++;
      else if (pnl < 0) tradeLosses++;
    }

    // Build accounts list
    const platformColors: Record<string, { color: string; textColor: string; short: string }> = {
      Tradovate: { color: "#262626", textColor: "#ffffff", short: "TV" },
      "MetaTrader 4": { color: "#262626", textColor: "#ffffff", short: "MT4" },
      "MetaTrader 5": { color: "#262626", textColor: "#ffffff", short: "MT5" },
      Binance: { color: "#FCD535", textColor: "#000000", short: "BN" },
      Bybit: { color: "#F7A600", textColor: "#000000", short: "BY" },
      Schwab: { color: "#00A0DF", textColor: "#ffffff", short: "SC" },
    };

    const accountsList = (sharedAccounts || []);
    const accounts = accountsList.map((a: Record<string, unknown>) => {
      const plat = (a.platform as string) || "Tradovate";
      const colors = platformColors[plat] || { color: "#262626", textColor: "#ffffff", short: plat.substring(0, 2).toUpperCase() };
      const accNum = (a.account_number as string) || "";
      const mask = accNum.length > 4 ? `••••${accNum.slice(-4)}` : accNum;
      const accPnl = tradePnlByAccount[a.id as string] || 0;
      return {
        id: a.id,
        broker: plat,
        broker_short: colors.short,
        broker_color: colors.color,
        broker_text_color: colors.textColor,
        account_mask: mask,
        status: (a.is_active as boolean) ? "Active" : "Inactive",
        balance: Number(a.balance) || 0,
        daily_pnl: accPnl,
        health_pct: Number(a.balance) > 0 ? Math.min(100, Math.round((Number(a.equity || a.balance) / Number(a.balance)) * 100)) : 50,
        account_number: a.account_number,
        account_label: a.account_label,
        platform: a.platform,
        account_type: a.account_type,
      };
    });

    // Calculate total balance across all accounts
    const totalBalance = accountsList.reduce((sum: number, a: Record<string, unknown>) => sum + (Number(a.balance) || 0), 0);
    const totalStartingBalance = accountsList.reduce((sum: number, a: Record<string, unknown>) => sum + (Number(a.starting_balance) || 0), 0);
    const growthPct = totalStartingBalance > 0 ? Number(((totalTradePnl / totalStartingBalance) * 100).toFixed(2)) : 0;

    // Build recent trades from client_trading_activity (last 10)
    const recentTrades = allTrades.slice(0, 10).map((t: Record<string, unknown>) => ({
      id: t.id,
      time: t.closed_at || t.opened_at,
      symbol: t.symbol,
      type: t.trade_type,
      result: Number(t.pnl) || 0,
      status: t.status === "Closed" ? ((Number(t.pnl) || 0) >= 0 ? "Win" : "Loss") : "Open",
      entry: String(t.entry_price),
      exit: t.exit_price ? String(t.exit_price) : undefined,
      duration: t.duration || undefined,
      algo: undefined,
    }));

    // Try to fetch dashboard record for supplemental data (payment info, etc.)
    let dashboard: Record<string, unknown> | null = null;
    const { data: db } = await supabase
      .from("client_dashboards")
      .select("*")
      .eq("client_id", clientUuid)
      .limit(1)
      .single();
    dashboard = db;

    return NextResponse.json({
      data: {
        client_name: clientRow.name || dashboard?.client_name || "",
        total_value: totalBalance,
        total_value_change: totalTradePnl,
        todays_pnl: totalTradePnl,
        todays_pnl_pct: growthPct,
        trades_today: totalTradeCount,
        connected_accounts_count: accounts.length,
        active_trades_count: totalTradeCount,
        profitable_trades: tradeWins,
        losing_trades: tradeLosses,
        starting_balance: totalStartingBalance || (dashboard?.starting_balance as number) || 0,
        net_pnl: totalTradePnl,
        growth_pct: growthPct,
        accounts: accounts,
        active_algos: [] as { id: string; name: string; category: string; category_color: string; win_rate: number; total_trades: number; profit: number }[],
        positions: [] as { id: string; symbol: string; symbol_icon: string; symbol_bg: string; symbol_text_color: string; type: string; entry: string; current: string; pnl: number }[],
        recent_trades: recentTrades,
        payment_status: dashboard
          ? {
              period: dashboard.payment_period || "",
              status: dashboard.payment_status || "",
              next_date: dashboard.next_payment_date || "",
              next_amount: dashboard.next_payment_amount || 0,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("client-dashboard error:", err);
    return NextResponse.json({ data: null });
  }
}
