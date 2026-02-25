import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

// Platform color mapping
const platformColors: Record<string, { color: string; textColor: string; short: string }> = {
  Tradovate: { color: "#262626", textColor: "#ffffff", short: "TV" },
  "MetaTrader 4": { color: "#262626", textColor: "#ffffff", short: "MT4" },
  "MetaTrader 5": { color: "#262626", textColor: "#ffffff", short: "MT5" },
  Binance: { color: "#FCD535", textColor: "#000000", short: "BN" },
  Bybit: { color: "#F7A600", textColor: "#000000", short: "BY" },
  Schwab: { color: "#00A0DF", textColor: "#ffffff", short: "SC" },
};

/**
 * Get trading activity for a client via closer token.
 * GET /api/closer/client-activity?token=X&client_id=Y
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

    // Fetch trades (same logic as /api/client-trading-activity)
    const { data: trades, error } = await supabase
      .from("client_trading_activity")
      .select("*, client_accounts(platform, account_number, account_label)")
      .eq("client_id", clientId)
      .order("opened_at", { ascending: false })
      .range(0, 4999);

    if (error) {
      return NextResponse.json({ data: null, error: error.message });
    }

    // Fetch accounts for filter dropdown
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("id, platform, account_number, account_label")
      .eq("client_id", clientId)
      .order("created_at");

    // Calculate summary stats
    const allTrades = trades || [];
    const closedTrades = allTrades.filter((t: any) => t.status === "Closed");
    const openTrades = allTrades.filter((t: any) => t.status === "Open");
    const wins = closedTrades.filter((t: any) => (t.pnl as number) > 0);
    const losses = closedTrades.filter((t: any) => (t.pnl as number) < 0);
    const totalPnl = closedTrades.reduce((sum: number, t: any) => sum + (Number(t.net_pnl) || 0), 0);
    const avgProfit = closedTrades.length > 0 ? totalPnl / closedTrades.length : 0;
    const bestTrade = closedTrades.length > 0
      ? Math.max(...closedTrades.map((t: any) => Number(t.net_pnl) || 0))
      : 0;
    const worstTrade = closedTrades.length > 0
      ? Math.min(...closedTrades.map((t: any) => Number(t.net_pnl) || 0))
      : 0;

    const symbols = [...new Set(allTrades.map((t: any) => t.symbol as string))];
    const algorithms = [...new Set(allTrades.filter((t: any) => t.algorithm_name).map((t: any) => t.algorithm_name as string))];

    // Format trades
    const formattedTrades = allTrades.map((t: any) => {
      const acct = t.client_accounts as any;
      const platform = acct?.platform || "Unknown";
      const colors = platformColors[platform] || { color: "#262626", textColor: "#ffffff", short: platform.substring(0, 2).toUpperCase() };
      return {
        id: t.id,
        trade_id: t.trade_id,
        symbol: t.symbol,
        symbol_category: t.symbol_category,
        algorithm_name: t.algorithm_name,
        algorithm_color: t.algorithm_color,
        trade_type: t.trade_type,
        entry_price: Number(t.entry_price),
        exit_price: t.exit_price ? Number(t.exit_price) : null,
        current_price: t.current_price ? Number(t.current_price) : null,
        stop_loss: t.stop_loss ? Number(t.stop_loss) : null,
        take_profit: t.take_profit ? Number(t.take_profit) : null,
        position_size: t.position_size,
        pnl: Number(t.pnl) || 0,
        pnl_pct: Number(t.pnl_pct) || 0,
        commission: Number(t.commission) || 0,
        swap: Number(t.swap) || 0,
        net_pnl: Number(t.net_pnl) || 0,
        status: t.status,
        duration: t.duration,
        slippage: t.slippage,
        entry_order_type: t.entry_order_type,
        exit_order_type: t.exit_order_type,
        risk_reward: t.risk_reward,
        risk_amount: t.risk_amount ? Number(t.risk_amount) : null,
        risk_pct: t.risk_pct ? Number(t.risk_pct) : null,
        pips: t.pips ? Number(t.pips) : null,
        pip_value: t.pip_value ? Number(t.pip_value) : null,
        notes: t.notes,
        tags: t.tags || [],
        opened_at: t.opened_at,
        closed_at: t.closed_at,
        account: {
          platform,
          platform_short: colors.short,
          platform_color: colors.color,
          platform_text_color: colors.textColor,
          account_label: acct?.account_label || platform,
        },
      };
    });

    return NextResponse.json({
      data: {
        summary: {
          total_trades: allTrades.length,
          open_count: openTrades.length,
          closed_count: closedTrades.length,
          win_count: wins.length,
          loss_count: losses.length,
          win_rate: closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0,
          total_pnl: Number(totalPnl.toFixed(2)),
          total_pnl_pct: 0,
          avg_profit: Number(avgProfit.toFixed(2)),
          best_trade: Number(bestTrade.toFixed(2)),
          worst_trade: Number(worstTrade.toFixed(2)),
        },
        trades: formattedTrades,
        filters: {
          accounts: (accounts || []).map((a: any) => ({
            id: a.id,
            platform: a.platform,
            label: a.account_label || a.platform,
          })),
          symbols,
          algorithms,
        },
      },
    });
  } catch (err) {
    console.error("Closer client activity error:", err);
    return NextResponse.json({ data: null });
  }
}
