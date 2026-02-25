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

    // Build equity curve from trades sorted chronologically
    const chronoTrades = [...allTrades].sort((a, b) => {
      const da = new Date(a.closed_at || a.opened_at).getTime();
      const db2 = new Date(b.closed_at || b.opened_at).getTime();
      return da - db2;
    });

    const equityCurve: { date: string; balance: number }[] = [];
    let runningBalance = totalStartingBalance;
    // Add starting point
    if (chronoTrades.length > 0) {
      const firstDate = new Date(chronoTrades[0].closed_at || chronoTrades[0].opened_at);
      const dayBefore = new Date(firstDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      equityCurve.push({
        date: dayBefore.toISOString(),
        balance: totalStartingBalance,
      });
    }
    // Group by date and accumulate
    const dailyPnlMap = new Map<string, number>();
    for (const t of chronoTrades) {
      const d = new Date(t.closed_at || t.opened_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyPnlMap.set(key, (dailyPnlMap.get(key) || 0) + (Number(t.pnl) || 0));
    }
    // Build curve points per day
    let cumBalance = totalStartingBalance;
    const sortedDays = Array.from(dailyPnlMap.keys()).sort();
    for (const day of sortedDays) {
      cumBalance += dailyPnlMap.get(day) || 0;
      equityCurve.push({
        date: `${day}T23:59:59Z`,
        balance: Number(cumBalance.toFixed(2)),
      });
    }

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

    // Fetch algorithms assigned to this client's accounts
    const algorithmIds = [...new Set(
      (sharedAccounts || [])
        .map((a: Record<string, unknown>) => a.algorithm_id as string)
        .filter(Boolean)
    )];
    interface AlgoInfo { id: string; name: string; category: string; category_color: string; win_rate: number; total_trades: number; profit: number }
    let activeAlgos: AlgoInfo[] = [];
    if (algorithmIds.length > 0) {
      const { data: algos } = await supabase
        .from("algorithms")
        .select("id, name, category, win_rate, metrics")
        .in("id", algorithmIds);

      const categoryColors: Record<string, string> = {
        Forex: "bg-blue-500/10 text-blue-400",
        Futures: "bg-amber-500/10 text-amber-400",
        Crypto: "bg-purple-500/10 text-purple-400",
        Stocks: "bg-emerald-500/10 text-emerald-400",
      };

      // Calculate per-algo trade stats from this client's trades
      const algoAccountMap: Record<string, string[]> = {};
      for (const acc of (sharedAccounts || [])) {
        const algoId = (acc as Record<string, unknown>).algorithm_id as string;
        const accId = (acc as Record<string, unknown>).id as string;
        if (algoId) {
          if (!algoAccountMap[algoId]) algoAccountMap[algoId] = [];
          algoAccountMap[algoId].push(accId);
        }
      }

      activeAlgos = (algos || []).map((algo: Record<string, unknown>) => {
        const algoAccounts = algoAccountMap[algo.id as string] || [];
        let algoTrades = 0;
        let algoProfit = 0;
        let algoWins = 0;
        for (const t of allTrades) {
          if (algoAccounts.includes(t.account_id as string)) {
            algoTrades++;
            const pnl = Number(t.pnl) || 0;
            algoProfit += pnl;
            if (pnl > 0) algoWins++;
          }
        }
        const winRate = algoTrades > 0 ? Math.round((algoWins / algoTrades) * 100) : parseFloat(String(algo.win_rate || "0"));
        const cat = (algo.category as string) || "Forex";
        return {
          id: algo.id as string,
          name: algo.name as string,
          category: cat,
          category_color: categoryColors[cat] || "bg-slate-500/10 text-slate-400",
          win_rate: winRate,
          total_trades: algoTrades,
          profit: algoProfit,
        };
      });
    }

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
        active_algos: activeAlgos,
        positions: [] as { id: string; symbol: string; symbol_icon: string; symbol_bg: string; symbol_text_color: string; type: string; entry: string; current: string; pnl: number }[],
        equity_curve: equityCurve,
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
