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

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ data: null, error: "No Supabase" });
  }

  try {
    // For now, fetch the first client dashboard record
    // In production this would use auth to determine which client
    const { data: dashboard, error } = await supabase
      .from("client_dashboards")
      .select("*")
      .limit(1)
      .single();

    if (error || !dashboard) {
      return NextResponse.json({ data: null });
    }

    // Fetch associated accounts
    const { data: accounts } = await supabase
      .from("client_dashboard_accounts")
      .select("*")
      .eq("dashboard_id", dashboard.id)
      .order("created_at");

    // Fetch associated algos
    const { data: algos } = await supabase
      .from("client_dashboard_algos")
      .select("*")
      .eq("dashboard_id", dashboard.id)
      .order("created_at");

    // Fetch positions
    const { data: positions } = await supabase
      .from("client_dashboard_positions")
      .select("*")
      .eq("dashboard_id", dashboard.id)
      .order("created_at");

    // Fetch recent trades
    const { data: trades } = await supabase
      .from("client_dashboard_trades")
      .select("*")
      .eq("dashboard_id", dashboard.id)
      .order("trade_time", { ascending: false })
      .limit(10);

    return NextResponse.json({
      data: {
        client_name: dashboard.client_name,
        total_value: dashboard.total_value,
        total_value_change: dashboard.total_value_change,
        todays_pnl: dashboard.todays_pnl,
        todays_pnl_pct: dashboard.todays_pnl_pct,
        trades_today: dashboard.trades_today,
        connected_accounts_count: accounts?.length || 0,
        active_trades_count: positions?.length || 0,
        profitable_trades:
          positions?.filter((p: Record<string, unknown>) => (p.pnl as number) > 0).length || 0,
        losing_trades:
          positions?.filter((p: Record<string, unknown>) => (p.pnl as number) < 0).length || 0,
        starting_balance: dashboard.starting_balance,
        net_pnl: dashboard.net_pnl,
        growth_pct: dashboard.growth_pct,
        accounts: (accounts || []).map((a: Record<string, unknown>) => ({
          id: a.id,
          broker: a.broker,
          broker_short: a.broker_short,
          broker_color: a.broker_color,
          broker_text_color: a.broker_text_color,
          account_mask: a.account_mask,
          status: a.status,
          balance: a.balance,
          daily_pnl: a.daily_pnl,
          health_pct: a.health_pct,
        })),
        active_algos: (algos || []).map((al: Record<string, unknown>) => ({
          id: al.id,
          name: al.name,
          category: al.category,
          category_color: al.category_color,
          win_rate: al.win_rate,
          total_trades: al.total_trades,
          profit: al.profit,
        })),
        positions: (positions || []).map((p: Record<string, unknown>) => ({
          id: p.id,
          symbol: p.symbol,
          symbol_icon: p.symbol_icon,
          symbol_bg: p.symbol_bg,
          symbol_text_color: p.symbol_text_color,
          type: p.position_type,
          entry: p.entry_price,
          current: p.current_price,
          pnl: p.pnl,
        })),
        recent_trades: (trades || []).map((t: Record<string, unknown>) => ({
          id: t.id,
          time: t.trade_time,
          symbol: t.symbol,
          type: t.trade_type,
          result: t.result,
          status: t.status,
          entry: t.entry_price,
          exit: t.exit_price,
          duration: t.duration,
          algo: t.algo_name,
        })),
        payment_status: {
          period: dashboard.payment_period,
          status: dashboard.payment_status,
          next_date: dashboard.next_payment_date,
          next_amount: dashboard.next_payment_amount,
        },
      },
    });
  } catch {
    return NextResponse.json({ data: null });
  }
}
