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

const platformColors: Record<string, { color: string; textColor: string; short: string }> = {
  Tradovate: { color: "#262626", textColor: "#ffffff", short: "TV" },
  "MetaTrader 4": { color: "#262626", textColor: "#ffffff", short: "MT4" },
  "MetaTrader 5": { color: "#262626", textColor: "#ffffff", short: "MT5" },
  Binance: { color: "#FCD535", textColor: "#000000", short: "BN" },
  Bybit: { color: "#F7A600", textColor: "#000000", short: "BY" },
  Schwab: { color: "#00A0DF", textColor: "#ffffff", short: "SC" },
};

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const accountId = req.nextUrl.searchParams.get("account_id");
    if (!accountId) {
      return NextResponse.json({ error: "account_id is required" }, { status: 400 });
    }

    // Fetch account info
    const { data: account } = await supabase
      .from("client_accounts")
      .select("id, platform, account_number, account_label, balance, equity, starting_balance")
      .eq("id", accountId)
      .single();

    // Fetch trades
    const { data: trades, error } = await supabase
      .from("client_trading_activity")
      .select("*")
      .eq("account_id", accountId)
      .order("opened_at", { ascending: false })
      .range(0, 4999);

    if (error) {
      console.error("Fetch trades error:", error);
      return NextResponse.json({ error: "Failed to fetch trades." }, { status: 500 });
    }

    const allTrades = trades || [];
    const closedTrades = allTrades.filter((t: Record<string, unknown>) => t.status === "Closed");
    const wins = closedTrades.filter((t: Record<string, unknown>) => (Number(t.pnl) || 0) > 0);
    const losses = closedTrades.filter((t: Record<string, unknown>) => (Number(t.pnl) || 0) < 0);
    const totalPnl = closedTrades.reduce((sum: number, t: Record<string, unknown>) => sum + (Number(t.net_pnl) || 0), 0);
    const avgProfit = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0;
    const bestTrade = closedTrades.length > 0
      ? Math.max(...closedTrades.map((t: Record<string, unknown>) => Number(t.net_pnl) || 0))
      : 0;
    const worstTrade = closedTrades.length > 0
      ? Math.min(...closedTrades.map((t: Record<string, unknown>) => Number(t.net_pnl) || 0))
      : 0;

    const platform = account?.platform || "Unknown";
    const colors = platformColors[platform] || { color: "#262626", textColor: "#ffffff", short: platform.substring(0, 2).toUpperCase() };

    const formattedTrades = allTrades.map((t: Record<string, unknown>) => ({
      id: t.id,
      trade_id: t.trade_id,
      symbol: t.symbol,
      symbol_category: t.symbol_category,
      algorithm_name: t.algorithm_name,
      algorithm_color: t.algorithm_color,
      trade_type: t.trade_type,
      entry_price: Number(t.entry_price),
      exit_price: t.exit_price ? Number(t.exit_price) : null,
      position_size: t.position_size,
      pnl: Number(t.pnl) || 0,
      pnl_pct: Number(t.pnl_pct) || 0,
      commission: Number(t.commission) || 0,
      swap: Number(t.swap) || 0,
      net_pnl: Number(t.net_pnl) || 0,
      status: t.status,
      duration: t.duration,
      opened_at: t.opened_at,
      closed_at: t.closed_at,
      notes: t.notes,
      tags: t.tags || [],
      account: {
        platform,
        platform_short: colors.short,
        platform_color: colors.color,
        platform_text_color: colors.textColor,
        account_label: account?.account_label || platform,
      },
    }));

    return NextResponse.json({
      data: {
        summary: {
          total_trades: allTrades.length,
          closed_count: closedTrades.length,
          win_count: wins.length,
          loss_count: losses.length,
          win_rate: closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0,
          total_pnl: Number(totalPnl.toFixed(2)),
          avg_profit: Number(avgProfit.toFixed(2)),
          best_trade: Number(bestTrade.toFixed(2)),
          worst_trade: Number(worstTrade.toFixed(2)),
        },
        trades: formattedTrades,
        account: account
          ? {
              id: account.id,
              platform: account.platform,
              account_number: account.account_number,
              account_label: account.account_label,
              balance: Number(account.balance) || 0,
              equity: Number(account.equity) || 0,
              starting_balance: Number(account.starting_balance) || 0,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("Account trades error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { account_id, starting_balance } = body;

    if (!account_id || starting_balance == null) {
      return NextResponse.json({ error: "account_id and starting_balance are required." }, { status: 400 });
    }

    // Update starting_balance and recalculate balance = starting_balance + total PnL
    const { data: trades } = await supabase
      .from("client_trading_activity")
      .select("pnl")
      .eq("account_id", account_id)
      .range(0, 4999);

    const totalPnl = (trades || []).reduce((sum: number, t: { pnl: number }) => sum + (Number(t.pnl) || 0), 0);
    const newBalance = starting_balance + totalPnl;

    const { error } = await supabase
      .from("client_accounts")
      .update({
        starting_balance: starting_balance,
        balance: newBalance,
        equity: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account_id);

    if (error) {
      console.error("Update balance error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, balance: newBalance });
  } catch (err) {
    console.error("PATCH account trades error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const accountId = req.nextUrl.searchParams.get("account_id");
    if (!accountId) {
      return NextResponse.json({ error: "account_id is required" }, { status: 400 });
    }

    // Delete all trades for this account
    const { error, count } = await supabase
      .from("client_trading_activity")
      .delete()
      .eq("account_id", accountId);

    if (error) {
      console.error("Delete trades error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Recalculate balance (no trades = starting_balance only)
    const { data: account } = await supabase
      .from("client_accounts")
      .select("starting_balance")
      .eq("id", accountId)
      .single();

    const startBal = Number(account?.starting_balance) || 0;
    await supabase
      .from("client_accounts")
      .update({
        balance: startBal,
        equity: startBal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", accountId);

    return NextResponse.json({ success: true, deleted_count: count || 0, new_balance: startBal });
  } catch (err) {
    console.error("DELETE account trades error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
