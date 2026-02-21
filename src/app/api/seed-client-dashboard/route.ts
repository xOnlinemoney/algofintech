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
    return NextResponse.json({ error: "No Supabase connection" }, { status: 500 });
  }

  try {
    // 1. Create the main dashboard record
    const { data: dashboard, error: dashErr } = await supabase
      .from("client_dashboards")
      .upsert(
        {
          client_name: "Alex",
          total_value: 12450.0,
          total_value_change: 3.7,
          todays_pnl: 127.5,
          todays_pnl_pct: 1.02,
          trades_today: 5,
          starting_balance: 10000.0,
          net_pnl: 2450.0,
          growth_pct: 24.5,
          payment_period: "Dec 1 - Dec 31",
          payment_status: "Paid",
          next_payment_date: "Jan 1, 2025",
          next_payment_amount: 99.0,
        },
        { onConflict: "client_name" }
      )
      .select()
      .single();

    if (dashErr) {
      return NextResponse.json({ error: dashErr.message }, { status: 500 });
    }

    const dashboardId = dashboard.id;

    // 2. Seed accounts
    // Clear old
    await supabase
      .from("client_dashboard_accounts")
      .delete()
      .eq("dashboard_id", dashboardId);

    const { error: accErr } = await supabase
      .from("client_dashboard_accounts")
      .insert([
        {
          dashboard_id: dashboardId,
          broker: "OANDA",
          broker_short: "MT5",
          broker_color: "#262626",
          broker_text_color: "#ffffff",
          account_mask: "••••5678",
          status: "Active",
          balance: 10500.0,
          daily_pnl: 75.0,
          health_pct: 75,
        },
        {
          dashboard_id: dashboardId,
          broker: "Binance",
          broker_short: "BN",
          broker_color: "#FCD535",
          broker_text_color: "#000000",
          account_mask: "••••1234",
          status: "Active",
          balance: 1950.0,
          daily_pnl: 52.5,
          health_pct: 50,
        },
      ]);

    if (accErr) {
      return NextResponse.json(
        { error: "Accounts: " + accErr.message },
        { status: 500 }
      );
    }

    // 3. Seed algos
    await supabase
      .from("client_dashboard_algos")
      .delete()
      .eq("dashboard_id", dashboardId);

    const { error: algoErr } = await supabase
      .from("client_dashboard_algos")
      .insert([
        {
          dashboard_id: dashboardId,
          name: "Gold Scalper",
          category: "Forex",
          category_color: "text-blue-400 bg-blue-500/10",
          win_rate: 68,
          total_trades: 147,
          profit: 1200,
        },
        {
          dashboard_id: dashboardId,
          name: "BTC Trend",
          category: "Crypto",
          category_color: "text-yellow-400 bg-yellow-500/10",
          win_rate: 72,
          total_trades: 89,
          profit: 1200,
        },
      ]);

    if (algoErr) {
      return NextResponse.json(
        { error: "Algos: " + algoErr.message },
        { status: 500 }
      );
    }

    // 4. Seed positions
    await supabase
      .from("client_dashboard_positions")
      .delete()
      .eq("dashboard_id", dashboardId);

    const { error: posErr } = await supabase
      .from("client_dashboard_positions")
      .insert([
        {
          dashboard_id: dashboardId,
          symbol: "BTC/USDT",
          symbol_icon: "₿",
          symbol_bg: "#F7931A",
          symbol_text_color: "#ffffff",
          position_type: "Long",
          entry_price: "$42,500",
          current_price: "$42,750",
          pnl: 125.0,
        },
        {
          dashboard_id: dashboardId,
          symbol: "EUR/USD",
          symbol_icon: "€",
          symbol_bg: "#475569",
          symbol_text_color: "#ffffff",
          position_type: "Short",
          entry_price: "1.0920",
          current_price: "1.0915",
          pnl: 50.0,
        },
        {
          dashboard_id: dashboardId,
          symbol: "XAU/USD",
          symbol_icon: "G",
          symbol_bg: "#FCD535",
          symbol_text_color: "#000000",
          position_type: "Long",
          entry_price: "2035.50",
          current_price: "2033.00",
          pnl: -25.0,
        },
      ]);

    if (posErr) {
      return NextResponse.json(
        { error: "Positions: " + posErr.message },
        { status: 500 }
      );
    }

    // 5. Seed recent trades
    await supabase
      .from("client_dashboard_trades")
      .delete()
      .eq("dashboard_id", dashboardId);

    const { error: tradeErr } = await supabase
      .from("client_dashboard_trades")
      .insert([
        {
          dashboard_id: dashboardId,
          trade_time: "14:25",
          symbol: "USD/JPY",
          trade_type: "Buy",
          result: 45.2,
          status: "Closed",
          entry_price: "142.500",
          exit_price: "142.650",
          duration: "12m 30s",
          algo_name: "Scalper Pro",
        },
        {
          dashboard_id: dashboardId,
          trade_time: "13:10",
          symbol: "GBP/USD",
          trade_type: "Sell",
          result: -12.5,
          status: "Closed",
        },
        {
          dashboard_id: dashboardId,
          trade_time: "11:45",
          symbol: "ETH/USDT",
          trade_type: "Long",
          result: 89.0,
          status: "Closed",
        },
      ]);

    if (tradeErr) {
      return NextResponse.json(
        { error: "Trades: " + tradeErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dashboard_id: dashboardId,
      message: "Client dashboard data seeded successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
