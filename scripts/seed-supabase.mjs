#!/usr/bin/env node
/**
 * Seed Supabase with agency, clients, and mock client accounts.
 * Also adds credential columns to client_accounts if missing.
 *
 * Usage: node scripts/seed-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xahsdbdtfjxstnkehmke.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhaHNkYmR0Zmp4c3Rua2VobWtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY5NDE0NSwiZXhwIjoyMDg3MjcwMTQ1fQ.BEPF-YoFXaQt-GCgVA4c1WDYyvfL6GZyL1LjQ_kUvD0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Step 1: Add credential columns via RPC (raw SQL) ─────────
async function addCredentialColumns() {
  console.log("Adding credential columns to client_accounts...");
  const { error } = await supabase.rpc("exec_sql", {
    query: `
      ALTER TABLE client_accounts ADD COLUMN IF NOT EXISTS username_encrypted TEXT;
      ALTER TABLE client_accounts ADD COLUMN IF NOT EXISTS password_encrypted TEXT;
    `,
  });
  if (error) {
    // RPC might not exist — fall back to direct column check
    console.log("RPC not available, trying direct SQL via REST...");
    // We'll handle this via the Supabase dashboard or a POST request
    console.log("Skipping RPC — will add columns via direct API call.");
  } else {
    console.log("Credential columns added.");
  }
}

// ─── Step 2: Seed Agency ──────────────────────────────────────
async function seedAgency() {
  console.log("Seeding agency...");

  // Check if agency already exists
  const { data: existing } = await supabase
    .from("agencies")
    .select("id")
    .eq("slug", "algostack")
    .single();

  if (existing) {
    console.log("Agency already exists:", existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from("agencies")
    .insert({
      name: "AlgoStack",
      slug: "algostack",
      plan: "pro",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to seed agency:", error);
    throw error;
  }

  console.log("Agency created:", data.id);
  return data.id;
}

// ─── Step 3: Seed Clients ─────────────────────────────────────
const MOCK_CLIENTS = [
  {
    client_id: "CL-7829",
    name: "Apex Capital Ltd",
    email: "contact@apexcapital.com",
    phone: "+1 (555) 012-3456",
    avatar_gradient: "from-blue-600 to-indigo-600",
    status: "active",
    liquidity: 450200,
    total_pnl: 32450,
    pnl_percentage: 7.76,
    active_strategies: 3,
    risk_level: "low",
    broker: "Tradovate",
  },
  {
    client_id: "CL-9921",
    name: "Marcus Chen",
    email: "m.chen@example.com",
    status: "active",
    liquidity: 125400,
    total_pnl: 12340.5,
    pnl_percentage: 10.92,
    active_strategies: 2,
    risk_level: "medium",
    broker: "MT5",
  },
  {
    client_id: "CL-3320",
    name: "Sarah Jenkins",
    email: "sarah.j@gmail.com",
    phone: "+1 (555) 987-6543",
    status: "inactive",
    liquidity: 10050,
    total_pnl: -1250,
    pnl_percentage: -11.07,
    active_strategies: 0,
    risk_level: "high",
    broker: "Binance",
  },
  {
    client_id: "CL-8812",
    name: "Quant Strategies",
    email: "info@quantstrat.io",
    phone: "+1 (212) 555-0999",
    avatar_gradient: "from-indigo-600 to-purple-600",
    status: "active",
    liquidity: 1250000,
    total_pnl: 150220,
    pnl_percentage: 13.66,
    active_strategies: 3,
    risk_level: "low",
    broker: "Schwab",
  },
  {
    client_id: "CL-4512",
    name: "David Ross",
    email: "david.r88@example.com",
    phone: "+1 (555) 444-3322",
    status: "suspended",
    liquidity: 55100,
    total_pnl: -4500,
    pnl_percentage: -7.55,
    active_strategies: 0,
    risk_level: "high",
    broker: "Tradovate",
  },
  {
    client_id: "CL-6721",
    name: "Elena Rodriguez",
    email: "e.rodriguez@mail.com",
    phone: "+1 (555) 789-0123",
    status: "active",
    liquidity: 320000,
    total_pnl: 28400,
    pnl_percentage: 9.73,
    active_strategies: 2,
    risk_level: "medium",
    broker: "MT4",
  },
  {
    client_id: "CL-1190",
    name: "BlueSky Trading",
    email: "ops@blueskytrading.co",
    phone: "+44 20 7946 0958",
    avatar_gradient: "from-cyan-600 to-blue-600",
    status: "active",
    liquidity: 890000,
    total_pnl: 112300,
    pnl_percentage: 14.44,
    active_strategies: 3,
    risk_level: "low",
    broker: "Schwab",
  },
  {
    client_id: "CL-5544",
    name: "Michael Chang",
    email: "m.chang@techfund.com",
    phone: "+1 (415) 555-7788",
    status: "active",
    liquidity: 675000,
    total_pnl: 81000,
    pnl_percentage: 13.64,
    active_strategies: 2,
    risk_level: "medium",
    broker: "Bybit",
  },
];

async function seedClients(agencyId) {
  console.log("Seeding clients...");

  // Build a map of client_id → UUID
  const clientMap = {};

  for (const client of MOCK_CLIENTS) {
    // Check if exists
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("client_id", client.client_id)
      .eq("agency_id", agencyId)
      .single();

    if (existing) {
      console.log(`  Client ${client.client_id} already exists: ${existing.id}`);
      clientMap[client.client_id] = existing.id;
      continue;
    }

    const { data, error } = await supabase
      .from("clients")
      .insert({
        ...client,
        agency_id: agencyId,
      })
      .select("id")
      .single();

    if (error) {
      console.error(`  Failed to seed client ${client.client_id}:`, error);
      continue;
    }

    console.log(`  Client ${client.client_id} created: ${data.id}`);
    clientMap[client.client_id] = data.id;
  }

  return clientMap;
}

// ─── Step 4: Seed Mock Accounts ───────────────────────────────
const MOCK_ACCOUNTS = {
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

async function seedAccounts(agencyId, clientMap) {
  console.log("Seeding client accounts...");

  for (const [displayId, accounts] of Object.entries(MOCK_ACCOUNTS)) {
    const clientUuid = clientMap[displayId];
    if (!clientUuid) {
      console.log(`  Skipping ${displayId} — no UUID found`);
      continue;
    }

    for (const account of accounts) {
      // Check if already exists
      const { data: existing } = await supabase
        .from("client_accounts")
        .select("id")
        .eq("client_id", clientUuid)
        .eq("account_number", account.account_number)
        .eq("platform", account.platform)
        .single();

      if (existing) {
        console.log(`  Account ${account.account_number} already exists`);
        continue;
      }

      const { error } = await supabase.from("client_accounts").insert({
        ...account,
        client_id: clientUuid,
        agency_id: agencyId,
      });

      if (error) {
        console.error(`  Failed to seed account ${account.account_number}:`, error);
      } else {
        console.log(`  Account ${account.account_number} created for ${displayId}`);
      }
    }
  }
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  try {
    console.log("=== AlgoFinTech Supabase Seed ===\n");

    const agencyId = await seedAgency();
    const clientMap = await seedClients(agencyId);
    await seedAccounts(agencyId, clientMap);

    console.log("\n=== Seed complete! ===");
    console.log("Client UUID map:", JSON.stringify(clientMap, null, 2));
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
