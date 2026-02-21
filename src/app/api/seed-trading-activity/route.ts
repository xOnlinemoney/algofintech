import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "No Supabase" });

  try {
    // Step 1: Create the table via raw SQL
    const { error: createError } = await supabase.rpc("exec_sql", {
      query: `
        CREATE TABLE IF NOT EXISTS client_trading_activity (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          account_id UUID REFERENCES client_accounts(id) ON DELETE CASCADE,
          client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
          trade_id TEXT NOT NULL,
          symbol TEXT NOT NULL,
          symbol_category TEXT DEFAULT 'Forex',
          algorithm_name TEXT,
          algorithm_color TEXT DEFAULT '#8b5cf6',
          trade_type TEXT NOT NULL,
          entry_price NUMERIC NOT NULL,
          exit_price NUMERIC,
          current_price NUMERIC,
          stop_loss NUMERIC,
          take_profit NUMERIC,
          position_size TEXT NOT NULL,
          pnl NUMERIC DEFAULT 0,
          pnl_pct NUMERIC DEFAULT 0,
          commission NUMERIC DEFAULT 0,
          swap NUMERIC DEFAULT 0,
          net_pnl NUMERIC DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'Open',
          duration TEXT,
          slippage TEXT,
          entry_order_type TEXT DEFAULT 'Market',
          exit_order_type TEXT,
          risk_reward TEXT,
          risk_amount NUMERIC,
          risk_pct NUMERIC,
          pips NUMERIC,
          pip_value NUMERIC,
          notes TEXT,
          tags TEXT[],
          opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          closed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
    });

    // If rpc doesn't exist, try direct SQL approach via REST
    let tableCreated = !createError;

    if (createError) {
      // Table might already exist - try inserting anyway
      tableCreated = true;
    }

    // Step 2: Get the client and their accounts
    const { data: dashboard } = await supabase
      .from("client_dashboards")
      .select("*")
      .limit(1)
      .single();

    if (!dashboard?.client_id) {
      return NextResponse.json({ error: "No client linked to dashboard" });
    }

    const clientId = dashboard.client_id;

    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("id, platform, account_number")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: "No accounts found" });
    }

    // Map accounts by platform for easy reference
    const tradovateAccounts = accounts.filter((a) => a.platform === "Tradovate");
    const mt5Accounts = accounts.filter((a) => a.platform === "MetaTrader 5");
    const binanceAccounts = accounts.filter((a) => a.platform === "Binance");

    const mt5Account = mt5Accounts[0] || tradovateAccounts[0] || accounts[0];
    const binanceAccount = binanceAccounts[0] || accounts[accounts.length - 1];
    const tradovateAccount = tradovateAccounts[0] || accounts[0];

    // Step 3: Delete existing trading activity for this client
    await supabase.from("client_trading_activity").delete().eq("client_id", clientId);

    // Step 4: Insert mock trading activity data
    const now = new Date();
    const trades = [
      // Open Trade 1 - EUR/USD on MT5/Tradovate
      {
        account_id: mt5Account.id,
        client_id: clientId,
        trade_id: "T-00236",
        symbol: "EUR/USD",
        symbol_category: "Forex",
        algorithm_name: "EURUSD Trend",
        algorithm_color: "#8b5cf6",
        trade_type: "Buy",
        entry_price: 1.085,
        exit_price: null,
        current_price: 1.0873,
        stop_loss: 1.082,
        take_profit: 1.09,
        position_size: "0.1 lots",
        pnl: 23.0,
        pnl_pct: 0.21,
        commission: -0.5,
        swap: 0,
        net_pnl: 22.5,
        status: "Open",
        duration: "2h 15m",
        slippage: "0.2 pips",
        entry_order_type: "Market",
        exit_order_type: null,
        risk_reward: "1:2",
        risk_amount: 30,
        risk_pct: 2.86,
        pips: 23,
        pip_value: 1.0,
        notes: "Trade entered based on algorithm signal. Golden cross detected on 15m timeframe.",
        tags: ["Trending Market", "High Probability", "Golden Cross"],
        opened_at: new Date(now.getTime() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
        closed_at: null,
      },
      // Open Trade 2 - BTC/USDT on Binance
      {
        account_id: binanceAccount.id,
        client_id: clientId,
        trade_id: "T-00235",
        symbol: "BTC/USDT",
        symbol_category: "Crypto",
        algorithm_name: "BTC Trend",
        algorithm_color: "#f97316",
        trade_type: "Buy",
        entry_price: 43250.0,
        exit_price: null,
        current_price: 43485.5,
        stop_loss: 42800.0,
        take_profit: 44000.0,
        position_size: "0.05 BTC",
        pnl: 11.78,
        pnl_pct: 0.54,
        commission: -1.2,
        swap: 0,
        net_pnl: 10.58,
        status: "Open",
        duration: "3h 00m",
        slippage: "0.5 pts",
        entry_order_type: "Market",
        exit_order_type: null,
        risk_reward: "1:1.5",
        risk_amount: 22.5,
        risk_pct: 1.15,
        pips: null,
        pip_value: null,
        notes: "BTC showing strong momentum after breaking resistance.",
        tags: ["Breakout", "Momentum"],
        opened_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        closed_at: null,
      },
      // Open Trade 3 - XAUUSD on Tradovate/MT5
      {
        account_id: tradovateAccount.id,
        client_id: clientId,
        trade_id: "T-00234",
        symbol: "XAUUSD",
        symbol_category: "Commodity",
        algorithm_name: "Gold Scalper",
        algorithm_color: "#eab308",
        trade_type: "Sell",
        entry_price: 2045.5,
        exit_price: null,
        current_price: 2048.2,
        stop_loss: 2055.0,
        take_profit: 2030.0,
        position_size: "0.05 lots",
        pnl: -13.5,
        pnl_pct: -0.13,
        commission: -0.3,
        swap: 0,
        net_pnl: -13.8,
        status: "Open",
        duration: "4h 45m",
        slippage: "0.1 pts",
        entry_order_type: "Market",
        exit_order_type: null,
        risk_reward: "1:1.6",
        risk_amount: 47.5,
        risk_pct: 0.45,
        pips: -27,
        pip_value: 0.5,
        notes: "Short entry on resistance rejection. Market showing indecision.",
        tags: ["Resistance Rejection", "Scalp"],
        opened_at: new Date(now.getTime() - 4 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
        closed_at: null,
      },
      // Closed Trade 1 - EUR/USD Win
      {
        account_id: mt5Account.id,
        client_id: clientId,
        trade_id: "T-00233",
        symbol: "EUR/USD",
        symbol_category: "Forex",
        algorithm_name: "EURUSD Trend",
        algorithm_color: "#8b5cf6",
        trade_type: "Buy",
        entry_price: 1.082,
        exit_price: 1.0865,
        current_price: 1.0865,
        stop_loss: 1.079,
        take_profit: 1.087,
        position_size: "0.1 lots",
        pnl: 45.0,
        pnl_pct: 0.41,
        commission: -0.5,
        swap: 0,
        net_pnl: 44.5,
        status: "Closed",
        duration: "45m",
        slippage: "0.1 pips",
        entry_order_type: "Market",
        exit_order_type: "Take Profit",
        risk_reward: "1:1.5",
        risk_amount: 30,
        risk_pct: 2.86,
        pips: 45,
        pip_value: 1.0,
        notes: "Clean trend continuation trade. TP hit.",
        tags: ["Trend Continuation", "TP Hit"],
        opened_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        closed_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 3.25 * 60 * 60 * 1000).toISOString(),
      },
      // Closed Trade 2 - ETH/USDT Win
      {
        account_id: binanceAccount.id,
        client_id: clientId,
        trade_id: "T-00232",
        symbol: "ETH/USDT",
        symbol_category: "Crypto",
        algorithm_name: "ETH Scalper",
        algorithm_color: "#06b6d4",
        trade_type: "Sell",
        entry_price: 2285.0,
        exit_price: 2270.5,
        current_price: 2270.5,
        stop_loss: 2300.0,
        take_profit: 2265.0,
        position_size: "0.1 ETH",
        pnl: 14.5,
        pnl_pct: 0.63,
        commission: -0.8,
        swap: 0,
        net_pnl: 13.7,
        status: "Closed",
        duration: "1h 45m",
        slippage: "0.3 pts",
        entry_order_type: "Limit",
        exit_order_type: "Take Profit",
        risk_reward: "1:1.3",
        risk_amount: 15,
        risk_pct: 0.77,
        pips: null,
        pip_value: null,
        notes: "Short scalp on ETH weakness. Clean exit.",
        tags: ["Scalp", "Mean Reversion"],
        opened_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        closed_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 4.25 * 60 * 60 * 1000).toISOString(),
      },
      // Closed Trade 3 - XAUUSD Loss
      {
        account_id: mt5Account.id,
        client_id: clientId,
        trade_id: "T-00231",
        symbol: "XAUUSD",
        symbol_category: "Commodity",
        algorithm_name: "Gold Scalper",
        algorithm_color: "#eab308",
        trade_type: "Buy",
        entry_price: 2038.0,
        exit_price: 2035.2,
        current_price: 2035.2,
        stop_loss: 2035.0,
        take_profit: 2050.0,
        position_size: "0.05 lots",
        pnl: -14.0,
        pnl_pct: -0.14,
        commission: -0.3,
        swap: 0,
        net_pnl: -14.3,
        status: "Closed",
        duration: "32m",
        slippage: "0.2 pts",
        entry_order_type: "Market",
        exit_order_type: "Stop Loss",
        risk_reward: "1:4",
        risk_amount: 15,
        risk_pct: 0.14,
        pips: -28,
        pip_value: 0.5,
        notes: "SL hit. Unexpected news spike.",
        tags: ["News Event", "SL Hit"],
        opened_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(),
        closed_at: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 9.47 * 60 * 60 * 1000).toISOString(),
      },
      // Closed Trade 4 - BTC/USDT Win
      {
        account_id: binanceAccount.id,
        client_id: clientId,
        trade_id: "T-00230",
        symbol: "BTC/USDT",
        symbol_category: "Crypto",
        algorithm_name: "BTC Trend",
        algorithm_color: "#f97316",
        trade_type: "Buy",
        entry_price: 42800.0,
        exit_price: 43150.0,
        current_price: 43150.0,
        stop_loss: 42500.0,
        take_profit: 43200.0,
        position_size: "0.02 BTC",
        pnl: 7.0,
        pnl_pct: 0.82,
        commission: -0.6,
        swap: 0,
        net_pnl: 6.4,
        status: "Closed",
        duration: "1h 35m",
        slippage: "1.0 pts",
        entry_order_type: "Market",
        exit_order_type: "Take Profit",
        risk_reward: "1:1.2",
        risk_amount: 6,
        risk_pct: 0.7,
        pips: null,
        pip_value: null,
        notes: "Trend following entry on BTC. Clean run to TP.",
        tags: ["Trend Following", "TP Hit"],
        opened_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000).toISOString(),
        closed_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 - 3.42 * 60 * 60 * 1000).toISOString(),
      },
      // More older closed trades for volume
      {
        account_id: tradovateAccount.id,
        client_id: clientId,
        trade_id: "T-00229",
        symbol: "EUR/USD",
        symbol_category: "Forex",
        algorithm_name: "EURUSD Trend",
        algorithm_color: "#8b5cf6",
        trade_type: "Sell",
        entry_price: 1.091,
        exit_price: 1.088,
        current_price: 1.088,
        stop_loss: 1.094,
        take_profit: 1.087,
        position_size: "0.15 lots",
        pnl: 45.0,
        pnl_pct: 0.41,
        commission: -0.75,
        swap: -0.12,
        net_pnl: 44.13,
        status: "Closed",
        duration: "2h 10m",
        slippage: "0.0 pips",
        entry_order_type: "Limit",
        exit_order_type: "Take Profit",
        risk_reward: "1:1",
        risk_amount: 45,
        risk_pct: 0.43,
        pips: 30,
        pip_value: 1.5,
        notes: "Reversal at resistance. Clean short.",
        tags: ["Reversal", "Resistance"],
        opened_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(),
        closed_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 5.83 * 60 * 60 * 1000).toISOString(),
      },
      {
        account_id: binanceAccount.id,
        client_id: clientId,
        trade_id: "T-00228",
        symbol: "ETH/USDT",
        symbol_category: "Crypto",
        algorithm_name: "ETH Scalper",
        algorithm_color: "#06b6d4",
        trade_type: "Buy",
        entry_price: 2250.0,
        exit_price: 2238.0,
        current_price: 2238.0,
        stop_loss: 2235.0,
        take_profit: 2275.0,
        position_size: "0.08 ETH",
        pnl: -9.6,
        pnl_pct: -0.53,
        commission: -0.4,
        swap: 0,
        net_pnl: -10.0,
        status: "Closed",
        duration: "55m",
        slippage: "0.5 pts",
        entry_order_type: "Market",
        exit_order_type: "Stop Loss",
        risk_reward: "1:1.7",
        risk_amount: 12,
        risk_pct: 0.67,
        pips: null,
        pip_value: null,
        notes: "False breakout. SL hit quickly.",
        tags: ["False Breakout", "SL Hit"],
        opened_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(),
        closed_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 11.08 * 60 * 60 * 1000).toISOString(),
      },
      {
        account_id: mt5Account.id,
        client_id: clientId,
        trade_id: "T-00227",
        symbol: "XAUUSD",
        symbol_category: "Commodity",
        algorithm_name: "Gold Scalper",
        algorithm_color: "#eab308",
        trade_type: "Buy",
        entry_price: 2020.0,
        exit_price: 2032.0,
        current_price: 2032.0,
        stop_loss: 2015.0,
        take_profit: 2035.0,
        position_size: "0.1 lots",
        pnl: 120.0,
        pnl_pct: 1.14,
        commission: -0.6,
        swap: -0.25,
        net_pnl: 119.15,
        status: "Closed",
        duration: "3h 20m",
        slippage: "0.0 pts",
        entry_order_type: "Limit",
        exit_order_type: "Take Profit",
        risk_reward: "1:2.4",
        risk_amount: 50,
        risk_pct: 0.48,
        pips: 120,
        pip_value: 1.0,
        notes: "Strong gold rally. Near-perfect entry at support.",
        tags: ["Support Bounce", "Strong Momentum"],
        opened_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        closed_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 - 2.67 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { data: inserted, error: insertError } = await supabase
      .from("client_trading_activity")
      .insert(trades)
      .select();

    if (insertError) {
      return NextResponse.json({
        error: insertError.message,
        hint: "Table may not exist. Creating via SQL...",
        tableCreated,
      });
    }

    return NextResponse.json({
      success: true,
      trades_inserted: inserted?.length || 0,
      client_id: clientId,
      accounts_used: {
        mt5: mt5Account?.id,
        binance: binanceAccount?.id,
        tradovate: tradovateAccount?.id,
      },
      message: "Trading activity data seeded successfully.",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
