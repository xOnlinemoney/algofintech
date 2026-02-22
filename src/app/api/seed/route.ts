import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ONE-TIME seed endpoint.
 * Hit GET /api/seed to populate the database with mock data.
 * Safe to call multiple times — checks for existing records.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const log: string[] = [];

    // ─── 1. Seed Agency ──────────────────────────────────
    let agencyId: string;
    const { data: existingAgency } = await supabase
      .from("agencies")
      .select("id")
      .eq("slug", "algostack")
      .single();

    if (existingAgency) {
      agencyId = existingAgency.id;
      log.push(`Agency already exists: ${agencyId}`);
    } else {
      const { data, error } = await supabase
        .from("agencies")
        .insert({ name: "AlgoStack", slug: "algostack", plan: "pro" })
        .select("id")
        .single();
      if (error) throw new Error(`Agency insert failed: ${error.message}`);
      agencyId = data.id;
      log.push(`Agency created: ${agencyId}`);
    }

    // ─── 2. Seed Clients ─────────────────────────────────
    const CLIENTS = [
      { client_id: "CL-7829", name: "Apex Capital Ltd", email: "contact@apexcapital.com", phone: "+1 (555) 012-3456", avatar_gradient: "from-blue-600 to-indigo-600", status: "active", liquidity: 450200, total_pnl: 32450, pnl_percentage: 7.76, active_strategies: 3, risk_level: "low", broker: "Tradovate" },
      { client_id: "CL-9921", name: "Marcus Chen", email: "m.chen@example.com", status: "active", liquidity: 125400, total_pnl: 12340.5, pnl_percentage: 10.92, active_strategies: 2, risk_level: "medium", broker: "MT5" },
      { client_id: "CL-3320", name: "Sarah Jenkins", email: "sarah.j@gmail.com", phone: "+1 (555) 987-6543", status: "inactive", liquidity: 10050, total_pnl: -1250, pnl_percentage: -11.07, active_strategies: 0, risk_level: "high", broker: "Binance" },
      { client_id: "CL-8812", name: "Quant Strategies", email: "info@quantstrat.io", phone: "+1 (212) 555-0999", avatar_gradient: "from-indigo-600 to-purple-600", status: "active", liquidity: 1250000, total_pnl: 150220, pnl_percentage: 13.66, active_strategies: 3, risk_level: "low", broker: "Schwab" },
      { client_id: "CL-4512", name: "David Ross", email: "david.r88@example.com", phone: "+1 (555) 444-3322", status: "suspended", liquidity: 55100, total_pnl: -4500, pnl_percentage: -7.55, active_strategies: 0, risk_level: "high", broker: "Tradovate" },
      { client_id: "CL-6721", name: "Elena Rodriguez", email: "e.rodriguez@mail.com", phone: "+1 (555) 789-0123", status: "active", liquidity: 320000, total_pnl: 28400, pnl_percentage: 9.73, active_strategies: 2, risk_level: "medium", broker: "MT4" },
      { client_id: "CL-1190", name: "BlueSky Trading", email: "ops@blueskytrading.co", phone: "+44 20 7946 0958", avatar_gradient: "from-cyan-600 to-blue-600", status: "active", liquidity: 890000, total_pnl: 112300, pnl_percentage: 14.44, active_strategies: 3, risk_level: "low", broker: "Schwab" },
      { client_id: "CL-5544", name: "Michael Chang", email: "m.chang@techfund.com", phone: "+1 (415) 555-7788", status: "active", liquidity: 675000, total_pnl: 81000, pnl_percentage: 13.64, active_strategies: 2, risk_level: "medium", broker: "Bybit" },
    ];

    const clientMap: Record<string, string> = {};

    for (const client of CLIENTS) {
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .eq("client_id", client.client_id)
        .eq("agency_id", agencyId)
        .single();

      if (existing) {
        clientMap[client.client_id] = existing.id;
        log.push(`Client ${client.client_id} exists: ${existing.id}`);
      } else {
        const { data, error } = await supabase
          .from("clients")
          .insert({ ...client, agency_id: agencyId })
          .select("id")
          .single();
        if (error) {
          log.push(`Client ${client.client_id} FAILED: ${error.message}`);
          continue;
        }
        clientMap[client.client_id] = data.id;
        log.push(`Client ${client.client_id} created: ${data.id}`);
      }
    }

    // ─── 3. Seed Client Accounts ─────────────────────────
    const ACCOUNTS: Record<string, Array<Record<string, unknown>>> = {
      "CL-7829": [
        { account_name: "slave - tradovate - BLUERJPYWBEO", account_label: "tradovate Demo / BLUERJPYWBEO (USD)", platform: "Tradovate", account_type: "Demo", account_number: "BLUERJPYWBEO", currency: "USD", balance: 197363.40, credit: 0, equity: 197363.40, free_margin: 197363.40, open_trades: 0, asset_class: "Futures", is_active: false, status: "off" },
        { account_name: "slave - tradovate - XYZABC123", account_label: "tradovate Real / XYZABC123 (USD)", platform: "Tradovate", account_type: "Real", account_number: "XYZABC123", currency: "USD", balance: 105356.35, credit: 500, equity: 105856.35, free_margin: 98250.00, open_trades: 3, asset_class: "Futures", is_active: true, status: "active" },
        { account_name: "slave - MT5 - 12345678", account_label: "MetaTrader 5 Demo / 12345678 (EUR)", platform: "MetaTrader 5", account_type: "Demo", account_number: "12345678", currency: "EUR", balance: 62770.25, credit: 0, equity: 62770.25, free_margin: 62770.25, open_trades: 0, asset_class: "Forex", is_active: true, status: "active" },
        { account_name: "slave - Binance - SPOT-A1B2C3", account_label: "Binance Real / SPOT-A1B2C3 (USDT)", platform: "Binance", account_type: "Real", account_number: "SPOT-A1B2C3", currency: "USDT", balance: 84210.00, credit: 0, equity: 84210.00, free_margin: 78000.00, open_trades: 5, asset_class: "Crypto", is_active: true, status: "active" },
      ],
      "CL-9921": [
        { account_name: "slave - MT5 - 99001122", account_label: "MetaTrader 5 Real / 99001122 (USD)", platform: "MetaTrader 5", account_type: "Real", account_number: "99001122", currency: "USD", balance: 68200.00, credit: 0, equity: 68200.00, free_margin: 62100.00, open_trades: 2, asset_class: "Forex", is_active: true, status: "active" },
        { account_name: "slave - MT5 - 99001123", account_label: "MetaTrader 5 Demo / 99001123 (USD)", platform: "MetaTrader 5", account_type: "Demo", account_number: "99001123", currency: "USD", balance: 25000.00, credit: 0, equity: 25000.00, free_margin: 25000.00, open_trades: 0, asset_class: "Forex", is_active: false, status: "off" },
        { account_name: "slave - Binance - SPOT-MC01", account_label: "Binance Real / SPOT-MC01 (USDT)", platform: "Binance", account_type: "Real", account_number: "SPOT-MC01", currency: "USDT", balance: 32200.00, credit: 0, equity: 32200.00, free_margin: 30500.00, open_trades: 1, asset_class: "Crypto", is_active: true, status: "active" },
      ],
      "CL-3320": [
        { account_name: "slave - Binance - SPOT-SJ99", account_label: "Binance Real / SPOT-SJ99 (USDT)", platform: "Binance", account_type: "Real", account_number: "SPOT-SJ99", currency: "USDT", balance: 10050.00, credit: 0, equity: 10050.00, free_margin: 10050.00, open_trades: 0, asset_class: "Crypto", is_active: false, status: "off" },
      ],
      "CL-8812": [
        { account_name: "slave - Schwab - 44556677", account_label: "Schwab Real / 44556677 (USD)", platform: "Schwab", account_type: "Real", account_number: "44556677", currency: "USD", balance: 420000.00, credit: 0, equity: 420000.00, free_margin: 385000.00, open_trades: 4, asset_class: "Stocks", is_active: true, status: "active" },
        { account_name: "slave - tradovate - QS-FUT01", account_label: "tradovate Real / QS-FUT01 (USD)", platform: "Tradovate", account_type: "Real", account_number: "QS-FUT01", currency: "USD", balance: 310000.00, credit: 0, equity: 310000.00, free_margin: 275000.00, open_trades: 6, asset_class: "Futures", is_active: true, status: "active" },
        { account_name: "slave - MT5 - QS-FX01", account_label: "MetaTrader 5 Real / QS-FX01 (USD)", platform: "MetaTrader 5", account_type: "Real", account_number: "QS-FX01", currency: "USD", balance: 280000.00, credit: 0, equity: 280000.00, free_margin: 255000.00, open_trades: 3, asset_class: "Forex", is_active: true, status: "active" },
        { account_name: "slave - Schwab - QS-STK02", account_label: "Schwab Demo / QS-STK02 (USD)", platform: "Schwab", account_type: "Demo", account_number: "QS-STK02", currency: "USD", balance: 150000.00, credit: 0, equity: 150000.00, free_margin: 150000.00, open_trades: 0, asset_class: "Stocks", is_active: false, status: "off" },
        { account_name: "slave - Binance - QS-CRYPT01", account_label: "Binance Real / QS-CRYPT01 (USDT)", platform: "Binance", account_type: "Real", account_number: "QS-CRYPT01", currency: "USDT", balance: 90000.00, credit: 0, equity: 90000.00, free_margin: 82000.00, open_trades: 2, asset_class: "Crypto", is_active: true, status: "active" },
      ],
      "CL-4512": [
        { account_name: "slave - tradovate - DR-FUT01", account_label: "tradovate Real / DR-FUT01 (USD)", platform: "Tradovate", account_type: "Real", account_number: "DR-FUT01", currency: "USD", balance: 35100.00, credit: 0, equity: 35100.00, free_margin: 35100.00, open_trades: 0, asset_class: "Futures", is_active: false, status: "off" },
        { account_name: "slave - tradovate - DR-FUT02", account_label: "tradovate Demo / DR-FUT02 (USD)", platform: "Tradovate", account_type: "Demo", account_number: "DR-FUT02", currency: "USD", balance: 20000.00, credit: 0, equity: 20000.00, free_margin: 20000.00, open_trades: 0, asset_class: "Futures", is_active: false, status: "off" },
      ],
      "CL-6721": [
        { account_name: "slave - MT4 - ER-FX01", account_label: "MetaTrader 4 Real / ER-FX01 (USD)", platform: "MetaTrader 4", account_type: "Real", account_number: "ER-FX01", currency: "USD", balance: 180000.00, credit: 0, equity: 180000.00, free_margin: 165000.00, open_trades: 3, asset_class: "Forex", is_active: true, status: "active" },
        { account_name: "slave - MT4 - ER-FX02", account_label: "MetaTrader 4 Demo / ER-FX02 (USD)", platform: "MetaTrader 4", account_type: "Demo", account_number: "ER-FX02", currency: "USD", balance: 50000.00, credit: 0, equity: 50000.00, free_margin: 50000.00, open_trades: 0, asset_class: "Forex", is_active: false, status: "off" },
        { account_name: "slave - Schwab - ER-STK01", account_label: "Schwab Real / ER-STK01 (USD)", platform: "Schwab", account_type: "Real", account_number: "ER-STK01", currency: "USD", balance: 90000.00, credit: 0, equity: 90000.00, free_margin: 82000.00, open_trades: 1, asset_class: "Stocks", is_active: true, status: "active" },
      ],
      "CL-1190": [
        { account_name: "slave - Schwab - BST-STK01", account_label: "Schwab Real / BST-STK01 (USD)", platform: "Schwab", account_type: "Real", account_number: "BST-STK01", currency: "USD", balance: 350000.00, credit: 0, equity: 350000.00, free_margin: 320000.00, open_trades: 5, asset_class: "Stocks", is_active: true, status: "active" },
        { account_name: "slave - MT5 - BST-FX01", account_label: "MetaTrader 5 Real / BST-FX01 (USD)", platform: "MetaTrader 5", account_type: "Real", account_number: "BST-FX01", currency: "USD", balance: 240000.00, credit: 0, equity: 240000.00, free_margin: 220000.00, open_trades: 4, asset_class: "Forex", is_active: true, status: "active" },
        { account_name: "slave - tradovate - BST-FUT01", account_label: "tradovate Real / BST-FUT01 (USD)", platform: "Tradovate", account_type: "Real", account_number: "BST-FUT01", currency: "USD", balance: 200000.00, credit: 0, equity: 200000.00, free_margin: 185000.00, open_trades: 3, asset_class: "Futures", is_active: true, status: "active" },
        { account_name: "slave - Schwab - BST-STK02", account_label: "Schwab Demo / BST-STK02 (USD)", platform: "Schwab", account_type: "Demo", account_number: "BST-STK02", currency: "USD", balance: 100000.00, credit: 0, equity: 100000.00, free_margin: 100000.00, open_trades: 0, asset_class: "Stocks", is_active: false, status: "off" },
      ],
      "CL-5544": [
        { account_name: "slave - Binance - MC-CRYPT01", account_label: "Binance Real / MC-CRYPT01 (USDT)", platform: "Binance", account_type: "Real", account_number: "MC-CRYPT01", currency: "USDT", balance: 325000.00, credit: 0, equity: 325000.00, free_margin: 298000.00, open_trades: 7, asset_class: "Crypto", is_active: true, status: "active" },
        { account_name: "slave - Bybit - MC-CRYPT02", account_label: "Bybit Real / MC-CRYPT02 (USDT)", platform: "Bybit", account_type: "Real", account_number: "MC-CRYPT02", currency: "USDT", balance: 250000.00, credit: 0, equity: 250000.00, free_margin: 230000.00, open_trades: 4, asset_class: "Crypto", is_active: true, status: "active" },
        { account_name: "slave - Bybit - MC-DEMO01", account_label: "Bybit Demo / MC-DEMO01 (USDT)", platform: "Bybit", account_type: "Demo", account_number: "MC-DEMO01", currency: "USDT", balance: 100000.00, credit: 0, equity: 100000.00, free_margin: 100000.00, open_trades: 0, asset_class: "Crypto", is_active: false, status: "off" },
      ],
    };

    for (const [displayId, accounts] of Object.entries(ACCOUNTS)) {
      const clientUuid = clientMap[displayId];
      if (!clientUuid) {
        log.push(`Skipping accounts for ${displayId} — no UUID found`);
        continue;
      }

      for (const account of accounts) {
        const { data: existing } = await supabase
          .from("client_accounts")
          .select("id")
          .eq("client_id", clientUuid)
          .eq("account_number", account.account_number as string)
          .eq("platform", account.platform as string)
          .single();

        if (existing) {
          log.push(`Account ${account.account_number} already exists`);
          continue;
        }

        const { error } = await supabase.from("client_accounts").insert({
          ...account,
          client_id: clientUuid,
          agency_id: agencyId,
        });

        if (error) {
          log.push(`Account ${account.account_number} FAILED: ${error.message}`);
        } else {
          log.push(`Account ${account.account_number} created for ${displayId}`);
        }
      }
    }

    // ─── 4. Create algorithms table if needed & Seed ─────
    try {
      await supabase.rpc("exec_sql", {
        query: `CREATE TABLE IF NOT EXISTS algorithms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
          name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, category TEXT,
          status TEXT DEFAULT 'active', risk_level TEXT, roi TEXT, drawdown TEXT, win_rate TEXT,
          sharpe_ratio DECIMAL(5,2), pairs TEXT, agencies_count INT DEFAULT 0, clients_count INT DEFAULT 0,
          last_updated TIMESTAMPTZ DEFAULT NOW(), created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      });
      log.push("Algorithms table ensured via RPC");
    } catch {
      log.push("RPC exec_sql not available — table must exist or be created in Supabase dashboard");
    }

    const ALGORITHMS = [
      { slug: "forex-alpha-scalp-fx", name: "Alpha Scalp FX", description: "High-frequency scalping algorithm targeting major currency pairs during London overlap.", category: "Forex", roi: "+142%", drawdown: "8.4%", win_rate: "68%", status: "active", risk_level: "high", sharpe_ratio: 1.85, pairs: "XAUUSD", agencies_count: 42, clients_count: 1204 },
      { slug: "crypto-bitwave-ai", name: "BitWave AI", description: "Neural network model optimized for Bitcoin volatility patterns and trend reversals.", category: "Crypto", roi: "+284%", drawdown: "12.1%", win_rate: "54%", status: "active", risk_level: "high", sharpe_ratio: 2.10, pairs: "BTC/USD", agencies_count: 38, clients_count: 980 },
      { slug: "stocks-equity-shield", name: "Equity Shield", description: "Long-short equity strategy focused on tech sector volatility reduction.", category: "Stocks", roi: "+45%", drawdown: "4.2%", win_rate: "72%", status: "active", risk_level: "low", sharpe_ratio: 2.40, pairs: "SPY/QQQ", agencies_count: 25, clients_count: 620 },
      { slug: "futures-gold-trend-v2", name: "Gold Trend V2", description: "Automated system tracking macro trends in Gold and Silver futures.", category: "Futures", roi: "+88%", drawdown: "9.5%", win_rate: "62%", status: "active", risk_level: "medium", sharpe_ratio: 1.65, pairs: "GC/SI", agencies_count: 30, clients_count: 540 },
      { slug: "forex-euro-impulse", name: "Euro Impulse", description: "Breakout strategy specifically designed for EUR/USD volatility.", category: "Forex", roi: "+76%", drawdown: "5.8%", win_rate: "65%", status: "active", risk_level: "medium", sharpe_ratio: 1.92, pairs: "EURUSD", agencies_count: 22, clients_count: 415 },
      { slug: "crypto-ether-momentum", name: "Ether Momentum", description: "Captures strong momentum moves in Ethereum cross pairs.", category: "Crypto", roi: "+190%", drawdown: "15.4%", win_rate: "51%", status: "beta", risk_level: "high", sharpe_ratio: 1.45, pairs: "ETH/BTC", agencies_count: 8, clients_count: 89 },
      { slug: "stocks-nasdaq-runner", name: "Nasdaq Runner", description: "Intraday trend following on QQQ and tech-heavy constituents.", category: "Stocks", roi: "+62%", drawdown: "7.1%", win_rate: "59%", status: "active", risk_level: "medium", sharpe_ratio: 1.70, pairs: "NQ/QQQ", agencies_count: 18, clients_count: 310 },
      { slug: "futures-oil-swing-pro", name: "Oil Swing Pro", description: "Crude oil inventory news trading algorithm with tight risk control.", category: "Futures", roi: "+56%", drawdown: "6.3%", win_rate: "60%", status: "active", risk_level: "medium", sharpe_ratio: 1.55, pairs: "CL", agencies_count: 15, clients_count: 245 },
      { slug: "forex-cable-breakout", name: "Cable Breakout", description: "GBP/USD breakout system utilizing London open volatility.", category: "Forex", roi: "+92%", drawdown: "10.1%", win_rate: "58%", status: "beta", risk_level: "high", sharpe_ratio: 1.38, pairs: "GBPUSD", agencies_count: 6, clients_count: 72 },
      { slug: "crypto-defi-yield-hunter", name: "DeFi Yield Hunter", description: "Arbitrage algorithm working across major decentralized exchanges.", category: "Crypto", roi: "+310%", drawdown: "18.2%", win_rate: "75%", status: "active", risk_level: "high", sharpe_ratio: 2.25, pairs: "Multi-DEX", agencies_count: 35, clients_count: 870 },
      { slug: "stocks-blue-chip-growth", name: "Blue Chip Growth", description: "Conservative growth strategy focusing on S&P 500 dividend payers.", category: "Stocks", roi: "+22%", drawdown: "3.1%", win_rate: "82%", status: "active", risk_level: "low", sharpe_ratio: 2.80, pairs: "SPX/DIA", agencies_count: 28, clients_count: 510 },
      { slug: "futures-treasury-bond-arb", name: "Treasury Bond Arb", description: "Yield curve arbitrage trading on 10-year and 2-year notes.", category: "Futures", roi: "+18%", drawdown: "2.5%", win_rate: "92%", status: "active", risk_level: "low", sharpe_ratio: 3.10, pairs: "ZN/ZT", agencies_count: 12, clients_count: 198 },
      { slug: "forex-yen-carrier", name: "Yen Carrier", description: "Carry trade strategy focused on USD/JPY and EUR/JPY interest differentials.", category: "Forex", roi: "+41%", drawdown: "12.5%", win_rate: "70%", status: "active", risk_level: "medium", sharpe_ratio: 1.50, pairs: "USDJPY/EURJPY", agencies_count: 20, clients_count: 380 },
      { slug: "crypto-solana-speed", name: "Solana Speed", description: "Scalping algorithm optimized for Solana's block times.", category: "Crypto", roi: "+165%", drawdown: "14.3%", win_rate: "55%", status: "beta", risk_level: "high", sharpe_ratio: 1.60, pairs: "SOL/USD", agencies_count: 5, clients_count: 65 },
      { slug: "stocks-small-cap-rocket", name: "Small Cap Rocket", description: "High volatility breakout strategy for Russell 2000 stocks.", category: "Stocks", roi: "+98%", drawdown: "16.5%", win_rate: "48%", status: "beta", risk_level: "high", sharpe_ratio: 1.20, pairs: "IWM/RTY", agencies_count: 4, clients_count: 42 },
      { slug: "futures-agri-commodity-cycle", name: "Agri-Commodity Cycle", description: "Seasonal trading model for Wheat, Corn, and Soybeans.", category: "Futures", roi: "+34%", drawdown: "8.8%", win_rate: "65%", status: "active", risk_level: "medium", sharpe_ratio: 1.75, pairs: "ZW/ZC/ZS", agencies_count: 10, clients_count: 155 },
      { slug: "forex-global-macro-fx", name: "Global Macro FX", description: "Long-term trend following based on central bank interest rate policies.", category: "Forex", roi: "+67%", drawdown: "11.2%", win_rate: "55%", status: "deprecated", risk_level: "medium", sharpe_ratio: 1.30, pairs: "G10 FX", agencies_count: 0, clients_count: 0 },
      { slug: "crypto-bitcoin-trend-follower", name: "Bitcoin Trend Follower", description: "Classic Donchian channel strategy adapted for BTC/USD.", category: "Crypto", roi: "+112%", drawdown: "18.5%", win_rate: "45%", status: "deprecated", risk_level: "high", sharpe_ratio: 0.95, pairs: "BTC/USD", agencies_count: 0, clients_count: 0 },
      { slug: "stocks-tech-sector-rotation", name: "Tech Sector Rotation", description: "Monthly rotation strategy moving between semiconductor and software ETFs.", category: "Stocks", roi: "+38%", drawdown: "6.1%", win_rate: "64%", status: "active", risk_level: "low", sharpe_ratio: 2.00, pairs: "SMH/IGV", agencies_count: 16, clients_count: 290 },
      { slug: "futures-e-mini-scalper", name: "E-Mini Scalper", description: "Rapid fire execution on S&P 500 E-mini futures order flow.", category: "Futures", roi: "+104%", drawdown: "9.3%", win_rate: "72%", status: "active", risk_level: "medium", sharpe_ratio: 1.88, pairs: "ES", agencies_count: 21, clients_count: 350 },
    ];

    for (const algo of ALGORITHMS) {
      const { data: existing } = await supabase
        .from("algorithms")
        .select("id")
        .eq("slug", algo.slug)
        .single();

      if (existing) {
        log.push(`Algorithm ${algo.slug} already exists`);
        continue;
      }

      const { error } = await supabase
        .from("algorithms")
        .insert({ ...algo, agency_id: agencyId });

      if (error) {
        log.push(`Algorithm ${algo.slug} FAILED: ${error.message}`);
      } else {
        log.push(`Algorithm ${algo.slug} created`);
      }
    }

    return NextResponse.json({ success: true, log, clientMap }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
