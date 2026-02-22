/**
 * Mock Data Store
 *
 * Structured to mirror Supabase tables. When you connect Supabase:
 *   1. Replace these exports with Supabase client queries
 *   2. Types in types.ts stay identical
 *   3. Components don't change — only the data source does
 *
 * Example Supabase swap:
 *   // Before (mock):
 *   import { mockClients } from "@/lib/mock-data";
 *   const clients = mockClients;
 *
 *   // After (Supabase):
 *   import { supabase } from "@/lib/supabase";
 *   const { data: clients } = await supabase
 *     .from("clients")
 *     .select("*")
 *     .eq("agency_id", agencyId);
 */

import type {
  Agency,
  AgencyUser,
  Client,
  ClientAccount,
  Strategy,
  Algorithm,
  AlgorithmDetail,
  DashboardStats,
  ChartData,
  PlatformUpdate,
  UpdateQuarterlyStats,
  NewAlgorithmRelease,
  ComingSoonAlgorithm,
  IndustryNewsArticle,
  MarketSnapshotItem,
  TrendingArticle,
  EditorPick,
  Announcement,
  PreviousAnnouncement,
  UpcomingScheduleItem,
} from "./types";

// ─── Agency ───────────────────────────────────────────────
export const mockAgency: Agency = {
  id: "agency_001",
  name: "Algo FinTech",
  slug: "algofintech",
  plan: "pro",
  created_at: "2024-01-15T00:00:00Z",
};

// ─── Agency User (logged-in user) ─────────────────────────
export const mockAgencyUser: AgencyUser = {
  id: "user_001",
  agency_id: "agency_001",
  name: "Ali Husni",
  email: "ali@algofintech.com",
  role: "owner",
  avatar_url: null,
  plan_label: "Pro Plan",
  aum_display: "$240k",
  created_at: "2024-01-15T00:00:00Z",
};

// ─── Strategies ───────────────────────────────────────────
export const mockStrategies: Strategy[] = [
  {
    id: "strat_001",
    agency_id: "agency_001",
    name: "Alpha Scalp V2",
    short_name: "AS",
    asset_tag: "BTC",
    status: "active",
    aum: 1200000,
    return_30d: 14.2,
    color: "indigo",
  },
  {
    id: "strat_002",
    agency_id: "agency_001",
    name: "Gold Trend",
    short_name: "GT",
    asset_tag: "XAU",
    status: "active",
    aum: 840000,
    return_30d: 8.1,
    color: "yellow",
  },
  {
    id: "strat_003",
    agency_id: "agency_001",
    name: "Neural Net Eq",
    short_name: "NN",
    asset_tag: "NAS",
    status: "paused",
    aum: 420000,
    return_30d: 5.4,
    color: "blue",
  },
  {
    id: "strat_004",
    agency_id: "agency_001",
    name: "Legacy Mix",
    short_name: "L",
    asset_tag: "MIX",
    status: "active",
    aum: 180000,
    return_30d: 1.2,
    color: "slate",
  },
];

// ─── Clients (matches HTML template 1:1) ──────────────────
export const mockClients: Client[] = [
  {
    id: "client_001",
    client_id: "CL-7829",
    agency_id: "agency_001",
    name: "Apex Capital Ltd",
    email: "contact@apexcapital.com",
    phone: "+1 (555) 012-3456",
    avatar_url: null,
    avatar_gradient: "from-blue-600 to-indigo-600",
    status: "active",
    liquidity: 450200,
    total_pnl: 32450,
    pnl_percentage: 7.76,
    active_strategies: 3,
    accounts_count: 4,
    risk_level: "low",
    sparkline_path: "M0,40 Q20,35 40,38 T80,30 T120,25 T160,15 T200,10 T240,5 T280,2",
    sparkline_color: "#10b981",
    broker: "Tradovate",
    joined_at: "2024-03-12T00:00:00Z",
    last_active: "2026-02-20T14:32:00Z",
  },
  {
    id: "client_002",
    client_id: "CL-9921",
    agency_id: "agency_001",
    name: "Marcus Chen",
    email: "m.chen@example.com",
    phone: null,
    avatar_url: null,
    avatar_gradient: null,
    status: "active",
    liquidity: 125400,
    total_pnl: 12340.5,
    pnl_percentage: 10.92,
    active_strategies: 2,
    accounts_count: 3,
    risk_level: "medium",
    sparkline_path: "M0,35 Q30,30 60,32 T120,25 T180,20 T240,15 T280,10",
    sparkline_color: "#10b981",
    broker: "MT5",
    joined_at: "2024-01-28T00:00:00Z",
    last_active: "2026-02-20T09:15:00Z",
  },
  {
    id: "client_003",
    client_id: "CL-3320",
    agency_id: "agency_001",
    name: "Sarah Jenkins",
    email: "sarah.j@gmail.com",
    phone: "+1 (555) 987-6543",
    avatar_url: null,
    avatar_gradient: null,
    status: "inactive",
    liquidity: 10050,
    total_pnl: -1250,
    pnl_percentage: -11.07,
    active_strategies: 0,
    accounts_count: 1,
    risk_level: "high",
    sparkline_path: "M0,20 Q30,25 60,35 T120,40 T180,38 T240,42 T280,45",
    sparkline_color: "#ef4444",
    broker: "Binance",
    joined_at: "2024-05-02T00:00:00Z",
    last_active: "2025-12-01T10:00:00Z",
  },
  {
    id: "client_004",
    client_id: "CL-8812",
    agency_id: "agency_001",
    name: "Quant Strategies",
    email: "info@quantstrat.io",
    phone: "+1 (212) 555-0999",
    avatar_url: null,
    avatar_gradient: "from-indigo-600 to-purple-600",
    status: "active",
    liquidity: 1250000,
    total_pnl: 150220,
    pnl_percentage: 13.66,
    active_strategies: 3,
    accounts_count: 5,
    risk_level: "low",
    sparkline_path: "M0,45 Q20,40 40,38 T80,35 T120,30 T160,20 T200,10 T240,5 T280,2",
    sparkline_color: "#10b981",
    broker: "Schwab",
    joined_at: "2024-02-14T00:00:00Z",
    last_active: "2026-02-20T11:20:00Z",
  },
  {
    id: "client_005",
    client_id: "CL-4512",
    agency_id: "agency_001",
    name: "David Ross",
    email: "david.r88@example.com",
    phone: "+1 (555) 444-3322",
    avatar_url: null,
    avatar_gradient: null,
    status: "suspended",
    liquidity: 55100,
    total_pnl: -4500,
    pnl_percentage: -7.55,
    active_strategies: 0,
    accounts_count: 2,
    risk_level: "high",
    sparkline_path: "M0,20 Q20,25 40,28 T80,35 T120,30 T160,35 T200,40 T240,42 T280,45",
    sparkline_color: "#ef4444",
    broker: "Tradovate",
    joined_at: "2024-06-15T00:00:00Z",
    last_active: "2025-10-20T09:30:00Z",
  },
  {
    id: "client_006",
    client_id: "CL-6721",
    agency_id: "agency_001",
    name: "Elena Rodriguez",
    email: "e.rodriguez@mail.com",
    phone: "+1 (555) 789-0123",
    avatar_url: null,
    avatar_gradient: null,
    status: "active",
    liquidity: 320000,
    total_pnl: 28400,
    pnl_percentage: 9.73,
    active_strategies: 2,
    accounts_count: 3,
    risk_level: "medium",
    sparkline_path: "M0,38 Q25,34 50,30 T100,26 T150,22 T200,16 T250,12 T280,8",
    sparkline_color: "#10b981",
    broker: "MT4",
    joined_at: "2024-04-20T00:00:00Z",
    last_active: "2026-02-20T08:55:00Z",
  },
  {
    id: "client_007",
    client_id: "CL-1190",
    agency_id: "agency_001",
    name: "BlueSky Trading",
    email: "ops@blueskytrading.co",
    phone: "+44 20 7946 0958",
    avatar_url: null,
    avatar_gradient: "from-cyan-600 to-blue-600",
    status: "active",
    liquidity: 890000,
    total_pnl: 112300,
    pnl_percentage: 14.44,
    active_strategies: 3,
    accounts_count: 4,
    risk_level: "low",
    sparkline_path: "M0,42 Q30,38 60,34 T120,28 T180,20 T240,12 T280,6",
    sparkline_color: "#10b981",
    broker: "Schwab",
    joined_at: "2024-01-05T00:00:00Z",
    last_active: "2026-02-20T13:10:00Z",
  },
  {
    id: "client_008",
    client_id: "CL-5544",
    agency_id: "agency_001",
    name: "Michael Chang",
    email: "m.chang@techfund.com",
    phone: "+1 (415) 555-7788",
    avatar_url: null,
    avatar_gradient: null,
    status: "active",
    liquidity: 675000,
    total_pnl: 81000,
    pnl_percentage: 13.64,
    active_strategies: 2,
    accounts_count: 3,
    risk_level: "medium",
    sparkline_path: "M0,36 Q25,32 50,28 T100,24 T150,20 T200,14 T250,10 T280,6",
    sparkline_color: "#10b981",
    broker: "Bybit",
    joined_at: "2024-07-22T00:00:00Z",
    last_active: "2026-02-20T15:45:00Z",
  },
];

// ─── Client Accounts (shared between Clients list + Manage Accounts) ──
// Equity totals per client must match client.liquidity exactly.
// active_strategies = count of unique non-null algorithm_ids
// accounts_count   = total accounts in the array
export const mockClientAccounts: Record<string, ClientAccount[]> = {
  "CL-7829": [ // Apex Capital Ltd — liquidity: 450200, strategies: 3, accounts: 4
    { id: "acc_001", account_name: "slave - tradovate - BLUERJPYWBEO", account_label: "tradovate Demo / BLUERJPYWBEO (USD)", platform: "Tradovate", account_type: "Demo", account_number: "BLUERJPYWBEO", currency: "USD", balance: 197363.40, credit: 0, equity: 197363.40, free_margin: 197363.40, open_trades: 0, asset_class: "Futures", algorithm_id: null, is_active: false },
    { id: "acc_002", account_name: "slave - tradovate - XYZABC123", account_label: "tradovate Real / XYZABC123 (USD)", platform: "Tradovate", account_type: "Real", account_number: "XYZABC123", currency: "USD", balance: 105356.35, credit: 500, equity: 105856.35, free_margin: 98250.00, open_trades: 3, asset_class: "Futures", algorithm_id: "algo_001", is_active: true },
    { id: "acc_003", account_name: "slave - MT5 - 12345678", account_label: "MetaTrader 5 Demo / 12345678 (EUR)", platform: "MetaTrader 5", account_type: "Demo", account_number: "12345678", currency: "EUR", balance: 62770.25, credit: 0, equity: 62770.25, free_margin: 62770.25, open_trades: 0, asset_class: "Forex", algorithm_id: "algo_005", is_active: true },
    { id: "acc_004", account_name: "slave - Binance - SPOT-A1B2C3", account_label: "Binance Real / SPOT-A1B2C3 (USDT)", platform: "Binance", account_type: "Real", account_number: "SPOT-A1B2C3", currency: "USDT", balance: 84210.00, credit: 0, equity: 84210.00, free_margin: 78000.00, open_trades: 5, asset_class: "Crypto", algorithm_id: "algo_009", is_active: true },
  ],
  "CL-9921": [ // Marcus Chen — liquidity: 125400, strategies: 2, accounts: 3
    { id: "acc_005", account_name: "slave - MT5 - 99001122", account_label: "MetaTrader 5 Real / 99001122 (USD)", platform: "MetaTrader 5", account_type: "Real", account_number: "99001122", currency: "USD", balance: 68200.00, credit: 0, equity: 68200.00, free_margin: 62100.00, open_trades: 2, asset_class: "Forex", algorithm_id: "algo_001", is_active: true },
    { id: "acc_006", account_name: "slave - MT5 - 99001123", account_label: "MetaTrader 5 Demo / 99001123 (USD)", platform: "MetaTrader 5", account_type: "Demo", account_number: "99001123", currency: "USD", balance: 25000.00, credit: 0, equity: 25000.00, free_margin: 25000.00, open_trades: 0, asset_class: "Forex", algorithm_id: null, is_active: false },
    { id: "acc_007", account_name: "slave - Binance - SPOT-MC01", account_label: "Binance Real / SPOT-MC01 (USDT)", platform: "Binance", account_type: "Real", account_number: "SPOT-MC01", currency: "USDT", balance: 32200.00, credit: 0, equity: 32200.00, free_margin: 30500.00, open_trades: 1, asset_class: "Crypto", algorithm_id: "algo_009", is_active: true },
  ],
  "CL-3320": [ // Sarah Jenkins — liquidity: 10050, strategies: 0, accounts: 1
    { id: "acc_008", account_name: "slave - Binance - SPOT-SJ99", account_label: "Binance Real / SPOT-SJ99 (USDT)", platform: "Binance", account_type: "Real", account_number: "SPOT-SJ99", currency: "USDT", balance: 10050.00, credit: 0, equity: 10050.00, free_margin: 10050.00, open_trades: 0, asset_class: "Crypto", algorithm_id: null, is_active: false },
  ],
  "CL-8812": [ // Quant Strategies — liquidity: 1250000, strategies: 3, accounts: 5
    { id: "acc_009", account_name: "slave - Schwab - 44556677", account_label: "Schwab Real / 44556677 (USD)", platform: "Schwab", account_type: "Real", account_number: "44556677", currency: "USD", balance: 420000.00, credit: 0, equity: 420000.00, free_margin: 385000.00, open_trades: 4, asset_class: "Stocks", algorithm_id: "algo_001", is_active: true },
    { id: "acc_010", account_name: "slave - tradovate - QS-FUT01", account_label: "tradovate Real / QS-FUT01 (USD)", platform: "Tradovate", account_type: "Real", account_number: "QS-FUT01", currency: "USD", balance: 310000.00, credit: 0, equity: 310000.00, free_margin: 275000.00, open_trades: 6, asset_class: "Futures", algorithm_id: "algo_005", is_active: true },
    { id: "acc_011", account_name: "slave - MT5 - QS-FX01", account_label: "MetaTrader 5 Real / QS-FX01 (USD)", platform: "MetaTrader 5", account_type: "Real", account_number: "QS-FX01", currency: "USD", balance: 280000.00, credit: 0, equity: 280000.00, free_margin: 255000.00, open_trades: 3, asset_class: "Forex", algorithm_id: "algo_009", is_active: true },
    { id: "acc_012", account_name: "slave - Schwab - QS-STK02", account_label: "Schwab Demo / QS-STK02 (USD)", platform: "Schwab", account_type: "Demo", account_number: "QS-STK02", currency: "USD", balance: 150000.00, credit: 0, equity: 150000.00, free_margin: 150000.00, open_trades: 0, asset_class: "Stocks", algorithm_id: null, is_active: false },
    { id: "acc_013", account_name: "slave - Binance - QS-CRYPT01", account_label: "Binance Real / QS-CRYPT01 (USDT)", platform: "Binance", account_type: "Real", account_number: "QS-CRYPT01", currency: "USDT", balance: 90000.00, credit: 0, equity: 90000.00, free_margin: 82000.00, open_trades: 2, asset_class: "Crypto", algorithm_id: "algo_009", is_active: true },
  ],
  "CL-4512": [ // David Ross — liquidity: 55100, strategies: 0, accounts: 2
    { id: "acc_014", account_name: "slave - tradovate - DR-FUT01", account_label: "tradovate Real / DR-FUT01 (USD)", platform: "Tradovate", account_type: "Real", account_number: "DR-FUT01", currency: "USD", balance: 35100.00, credit: 0, equity: 35100.00, free_margin: 35100.00, open_trades: 0, asset_class: "Futures", algorithm_id: null, is_active: false },
    { id: "acc_015", account_name: "slave - tradovate - DR-FUT02", account_label: "tradovate Demo / DR-FUT02 (USD)", platform: "Tradovate", account_type: "Demo", account_number: "DR-FUT02", currency: "USD", balance: 20000.00, credit: 0, equity: 20000.00, free_margin: 20000.00, open_trades: 0, asset_class: "Futures", algorithm_id: null, is_active: false },
  ],
  "CL-6721": [ // Elena Rodriguez — liquidity: 320000, strategies: 2, accounts: 3
    { id: "acc_016", account_name: "slave - MT4 - ER-FX01", account_label: "MetaTrader 4 Real / ER-FX01 (USD)", platform: "MetaTrader 4", account_type: "Real", account_number: "ER-FX01", currency: "USD", balance: 180000.00, credit: 0, equity: 180000.00, free_margin: 165000.00, open_trades: 3, asset_class: "Forex", algorithm_id: "algo_005", is_active: true },
    { id: "acc_017", account_name: "slave - MT4 - ER-FX02", account_label: "MetaTrader 4 Demo / ER-FX02 (USD)", platform: "MetaTrader 4", account_type: "Demo", account_number: "ER-FX02", currency: "USD", balance: 50000.00, credit: 0, equity: 50000.00, free_margin: 50000.00, open_trades: 0, asset_class: "Forex", algorithm_id: null, is_active: false },
    { id: "acc_018", account_name: "slave - Schwab - ER-STK01", account_label: "Schwab Real / ER-STK01 (USD)", platform: "Schwab", account_type: "Real", account_number: "ER-STK01", currency: "USD", balance: 90000.00, credit: 0, equity: 90000.00, free_margin: 82000.00, open_trades: 1, asset_class: "Stocks", algorithm_id: "algo_001", is_active: true },
  ],
  "CL-1190": [ // BlueSky Trading — liquidity: 890000, strategies: 3, accounts: 4
    { id: "acc_019", account_name: "slave - Schwab - BST-STK01", account_label: "Schwab Real / BST-STK01 (USD)", platform: "Schwab", account_type: "Real", account_number: "BST-STK01", currency: "USD", balance: 350000.00, credit: 0, equity: 350000.00, free_margin: 320000.00, open_trades: 5, asset_class: "Stocks", algorithm_id: "algo_001", is_active: true },
    { id: "acc_020", account_name: "slave - MT5 - BST-FX01", account_label: "MetaTrader 5 Real / BST-FX01 (USD)", platform: "MetaTrader 5", account_type: "Real", account_number: "BST-FX01", currency: "USD", balance: 240000.00, credit: 0, equity: 240000.00, free_margin: 220000.00, open_trades: 4, asset_class: "Forex", algorithm_id: "algo_005", is_active: true },
    { id: "acc_021", account_name: "slave - tradovate - BST-FUT01", account_label: "tradovate Real / BST-FUT01 (USD)", platform: "Tradovate", account_type: "Real", account_number: "BST-FUT01", currency: "USD", balance: 200000.00, credit: 0, equity: 200000.00, free_margin: 185000.00, open_trades: 3, asset_class: "Futures", algorithm_id: "algo_009", is_active: true },
    { id: "acc_022", account_name: "slave - Schwab - BST-STK02", account_label: "Schwab Demo / BST-STK02 (USD)", platform: "Schwab", account_type: "Demo", account_number: "BST-STK02", currency: "USD", balance: 100000.00, credit: 0, equity: 100000.00, free_margin: 100000.00, open_trades: 0, asset_class: "Stocks", algorithm_id: null, is_active: false },
  ],
  "CL-5544": [ // Michael Chang — liquidity: 675000, strategies: 2, accounts: 3
    { id: "acc_023", account_name: "slave - Binance - MC-CRYPT01", account_label: "Binance Real / MC-CRYPT01 (USDT)", platform: "Binance", account_type: "Real", account_number: "MC-CRYPT01", currency: "USDT", balance: 325000.00, credit: 0, equity: 325000.00, free_margin: 298000.00, open_trades: 7, asset_class: "Crypto", algorithm_id: "algo_009", is_active: true },
    { id: "acc_024", account_name: "slave - Bybit - MC-CRYPT02", account_label: "Bybit Real / MC-CRYPT02 (USDT)", platform: "Bybit", account_type: "Real", account_number: "MC-CRYPT02", currency: "USDT", balance: 250000.00, credit: 0, equity: 250000.00, free_margin: 230000.00, open_trades: 4, asset_class: "Crypto", algorithm_id: "algo_001", is_active: true },
    { id: "acc_025", account_name: "slave - Bybit - MC-DEMO01", account_label: "Bybit Demo / MC-DEMO01 (USDT)", platform: "Bybit", account_type: "Demo", account_number: "MC-DEMO01", currency: "USDT", balance: 100000.00, credit: 0, equity: 100000.00, free_margin: 100000.00, open_trades: 0, asset_class: "Crypto", algorithm_id: null, is_active: false },
  ],
};

// Helper: get accounts for a client by client_id
export function getClientAccounts(clientId: string): ClientAccount[] {
  return mockClientAccounts[clientId] || [];
}

// Helper: compute derived stats from accounts
export function getClientAccountStats(clientId: string) {
  const accounts = getClientAccounts(clientId);
  const liquidity = accounts.reduce((sum, a) => sum + a.equity, 0);
  const uniqueAlgos = new Set(accounts.filter(a => a.algorithm_id).map(a => a.algorithm_id));
  return {
    liquidity,
    active_strategies: uniqueAlgos.size,
    accounts_count: accounts.length,
  };
}

// ─── Algorithms (Algorithms Overview page — matches HTML 1:1) ──
export const mockAlgorithms: Algorithm[] = [
  { id: "algo_001", slug: "forex-alpha-scalp-fx", agency_id: "agency_001", name: "Alpha Scalp FX", description: "High-frequency scalping algorithm targeting major currency pairs during London overlap.", category: "Forex", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+142%", drawdown: "8.4%", win_rate: "68%" },
  { id: "algo_002", slug: "crypto-bitwave-ai", agency_id: "agency_001", name: "BitWave AI", description: "Neural network model optimized for Bitcoin volatility patterns and trend reversals.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+284%", drawdown: "12.1%", win_rate: "54%" },
  { id: "algo_003", slug: "stocks-equity-shield", agency_id: "agency_001", name: "Equity Shield", description: "Long-short equity strategy focused on tech sector volatility reduction.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+45%", drawdown: "4.2%", win_rate: "72%" },
  { id: "algo_004", slug: "futures-gold-trend-v2", agency_id: "agency_001", name: "Gold Trend V2", description: "Automated system tracking macro trends in Gold and Silver futures.", category: "Futures", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+88%", drawdown: "9.5%", win_rate: "62%" },
  { id: "algo_005", slug: "forex-euro-impulse", agency_id: "agency_001", name: "Euro Impulse", description: "Breakout strategy specifically designed for EUR/USD volatility.", category: "Forex", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+76%", drawdown: "5.8%", win_rate: "65%" },
  { id: "algo_006", slug: "crypto-ether-momentum", agency_id: "agency_001", name: "Ether Momentum", description: "Captures strong momentum moves in Ethereum cross pairs.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+190%", drawdown: "15.4%", win_rate: "51%" },
  { id: "algo_007", slug: "stocks-nasdaq-runner", agency_id: "agency_001", name: "Nasdaq Runner", description: "Intraday trend following on QQQ and tech-heavy constituents.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+62%", drawdown: "7.1%", win_rate: "59%" },
  { id: "algo_008", slug: "futures-oil-swing-pro", agency_id: "agency_001", name: "Oil Swing Pro", description: "Crude oil inventory news trading algorithm with tight risk control.", category: "Futures", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+56%", drawdown: "6.3%", win_rate: "60%" },
  { id: "algo_009", slug: "forex-cable-breakout", agency_id: "agency_001", name: "Cable Breakout", description: "GBP/USD breakout system utilizing London open volatility.", category: "Forex", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+92%", drawdown: "10.1%", win_rate: "58%" },
  { id: "algo_010", slug: "crypto-defi-yield-hunter", agency_id: "agency_001", name: "DeFi Yield Hunter", description: "Arbitrage algorithm working across major decentralized exchanges.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+310%", drawdown: "18.2%", win_rate: "75%" },
  { id: "algo_011", slug: "stocks-blue-chip-growth", agency_id: "agency_001", name: "Blue Chip Growth", description: "Conservative growth strategy focusing on S&P 500 dividend payers.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+22%", drawdown: "3.1%", win_rate: "82%" },
  { id: "algo_012", slug: "futures-treasury-bond-arb", agency_id: "agency_001", name: "Treasury Bond Arb", description: "Yield curve arbitrage trading on 10-year and 2-year notes.", category: "Futures", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+18%", drawdown: "2.5%", win_rate: "92%" },
  { id: "algo_013", slug: "forex-yen-carrier", agency_id: "agency_001", name: "Yen Carrier", description: "Carry trade strategy focused on USD/JPY and EUR/JPY interest differentials.", category: "Forex", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+41%", drawdown: "12.5%", win_rate: "70%" },
  { id: "algo_014", slug: "crypto-solana-speed", agency_id: "agency_001", name: "Solana Speed", description: "Scalping algorithm optimized for Solana's block times.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+165%", drawdown: "14.3%", win_rate: "55%" },
  { id: "algo_015", slug: "stocks-small-cap-rocket", agency_id: "agency_001", name: "Small Cap Rocket", description: "High volatility breakout strategy for Russell 2000 stocks.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+98%", drawdown: "16.5%", win_rate: "48%" },
  { id: "algo_016", slug: "futures-agri-commodity-cycle", agency_id: "agency_001", name: "Agri-Commodity Cycle", description: "Seasonal trading model for Wheat, Corn, and Soybeans.", category: "Futures", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+34%", drawdown: "8.8%", win_rate: "65%" },
  { id: "algo_017", slug: "forex-global-macro-fx", agency_id: "agency_001", name: "Global Macro FX", description: "Long-term trend following based on central bank interest rate policies.", category: "Forex", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+67%", drawdown: "11.2%", win_rate: "55%" },
  { id: "algo_018", slug: "crypto-bitcoin-trend-follower", agency_id: "agency_001", name: "Bitcoin Trend Follower", description: "Classic Donchian channel strategy adapted for BTC/USD.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+112%", drawdown: "18.5%", win_rate: "45%" },
  { id: "algo_019", slug: "stocks-tech-sector-rotation", agency_id: "agency_001", name: "Tech Sector Rotation", description: "Monthly rotation strategy moving between semiconductor and software ETFs.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+38%", drawdown: "6.1%", win_rate: "64%" },
  { id: "algo_020", slug: "futures-e-mini-scalper", agency_id: "agency_001", name: "E-Mini Scalper", description: "Rapid fire execution on S&P 500 E-mini futures order flow.", category: "Futures", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+104%", drawdown: "9.3%", win_rate: "72%" },
];

// ─── Helper: category badge color ────────────────────────
export function getCategoryColor(category: string): { bg: string; text: string; border: string; dot: string } {
  switch (category) {
    case "Forex":
      return { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/20", dot: "bg-blue-500" };
    case "Crypto":
      return { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/20", dot: "bg-purple-500" };
    case "Stocks":
      return { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/20", dot: "bg-orange-500" };
    case "Futures":
      return { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/20", dot: "bg-emerald-500" };
    default:
      return { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/20", dot: "bg-slate-500" };
  }
}

// ─── Algorithm Detail Data (Performance pages) ──────────────
// Default detail template — each algorithm gets one via getAlgorithmDetail()
const defaultAlgorithmDetail: Omit<AlgorithmDetail, "algorithm_id"> = {
  metrics: {
    total_return: "+142.5%",
    win_rate: "68.2%",
    profit_factor: "2.14",
    max_drawdown: "8.4%",
    sharpe_ratio: "1.85",
    avg_duration: "4h 12m",
  },
  monthly_returns: [
    {
      year: 2023,
      months: ["+4.2%", "+3.1%", "-1.2%", "+5.8%", "+2.4%", "+1.9%", "-0.5%", "+6.2%", "+3.3%", "+4.1%", null, null],
      ytd: "+29.3%",
    },
    {
      year: 2022,
      months: ["-2.1%", "+1.5%", "+8.4%", "+3.2%", "-4.1%", "+2.8%", "+5.1%", "+1.2%", "-0.8%", "+6.5%", "+2.2%", "+1.9%"],
      ytd: "+25.8%",
    },
  ],
  trades: [
    { instrument: "EURUSD", instrument_symbol: "€", instrument_type: "Forex", icon_bg: "bg-blue-500/10", icon_text_color: "text-blue-400", trade_type: "LONG", entry: "Oct 24, 14:30", exit: "Oct 24, 16:45", size: "2.50", max_dd: "-4.2 pips", pnl: "+$320.50", pnl_positive: true, return_pct: "+1.2%", return_positive: true },
    { instrument: "GBPUSD", instrument_symbol: "£", instrument_type: "Forex", icon_bg: "bg-indigo-500/10", icon_text_color: "text-indigo-400", trade_type: "SHORT", entry: "Oct 24, 09:15", exit: "Oct 24, 10:20", size: "3.00", max_dd: "-8.5 pips", pnl: "+$540.20", pnl_positive: true, return_pct: "+1.8%", return_positive: true },
    { instrument: "USDJPY", instrument_symbol: "¥", instrument_type: "Forex", icon_bg: "bg-yellow-500/10", icon_text_color: "text-yellow-400", trade_type: "LONG", entry: "Oct 23, 21:05", exit: "Oct 23, 23:30", size: "2.00", max_dd: "-12.1 pips", pnl: "-$180.00", pnl_positive: false, return_pct: "-0.9%", return_positive: false },
    { instrument: "BTCUSD", instrument_symbol: "₿", instrument_type: "Crypto", icon_bg: "bg-orange-500/10", icon_text_color: "text-orange-400", trade_type: "LONG", entry: "Oct 23, 14:12", exit: "Oct 23, 18:45", size: "0.50", max_dd: "-0.45%", pnl: "+$850.00", pnl_positive: true, return_pct: "+2.4%", return_positive: true },
    { instrument: "EURGBP", instrument_symbol: "€", instrument_type: "Forex", icon_bg: "bg-blue-500/10", icon_text_color: "text-blue-400", trade_type: "SHORT", entry: "Oct 22, 08:30", exit: "Oct 22, 11:15", size: "1.50", max_dd: "-3.2 pips", pnl: "+$125.40", pnl_positive: true, return_pct: "+0.5%", return_positive: true },
  ],
  info: {
    timeframe: "M5 (5 Minutes)",
    min_account: "$5,000",
    instruments: "EURUSD, GBPUSD",
    trades_per_month: "~145",
  },
  release_notes: [
    { version: "v2.1.0", date: "Oct 24, 2023", description: "Enhanced volatility filter for Asian session. Optimized entry logic for GBP pairs reducing false signals by 12%.", is_latest: true },
    { version: "v2.0.4", date: "Sep 12, 2023", description: "Fixed trailing stop execution latency. Minor adjustments to risk management parameters.", is_latest: false },
    { version: "v2.0.0", date: "Aug 01, 2023", description: "Major update: Integrated news filter API to automatically pause trading during high-impact economic events.", is_latest: false },
  ],
  equity_chart: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    data: [10000, 10420, 10850, 10720, 11340, 11600, 11850, 11790, 12500, 12950, 13450, 14250],
  },
};

/**
 * Get algorithm detail by slug.
 * In Supabase, this becomes a join query:
 *   const { data } = await supabase
 *     .from("algorithm_details")
 *     .select("*, algorithms(*)")
 *     .eq("algorithms.slug", slug)
 *     .single();
 */
export function getAlgorithmDetail(slugOrId: string): AlgorithmDetail | null {
  const algo = mockAlgorithms.find((a) => a.slug === slugOrId || a.id === slugOrId);
  if (!algo) return null;
  return { algorithm_id: algo.id, ...defaultAlgorithmDetail };
}

/**
 * Get algorithm by slug (or fallback to id).
 */
export function getAlgorithmBySlug(slug: string): (typeof mockAlgorithms)[number] | null {
  return mockAlgorithms.find((a) => a.slug === slug) ?? null;
}

/**
 * Get algorithm by ID.
 */
export function getAlgorithmById(algorithmId: string): (typeof mockAlgorithms)[number] | null {
  return mockAlgorithms.find((a) => a.id === algorithmId) ?? null;
}

// ─── Dashboard Stats ──────────────────────────────────────
export const mockDashboardStats: DashboardStats = {
  active_clients: 847,
  active_clients_change: 24,
  total_aum: "$2.4B",
  aum_change: "+18.3%",
  pnl: "+$42.8M",
  pnl_change: "+12.7%",
  active_positions: 1284,
  long_positions: 892,
  short_positions: 392,
};

// ─── Chart Data ───────────────────────────────────────────
export const mockChartData: ChartData = {
  "1M": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    revenue: [124.5, 132.8, 138.4, 142.9],
    profit: [85.2, 91.4, 95.8, 98.4],
    fee: [17.1, 18.2, 19.1, 19.7],
  },
  "3M": {
    labels: ["Oct", "Nov", "Dec", "Jan"],
    revenue: [115.2, 128.4, 136.9, 142.9],
    profit: [78.5, 88.2, 94.1, 98.4],
    fee: [15.7, 17.6, 18.8, 19.7],
  },
  "6M": {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    revenue: [98.4, 105.2, 115.2, 128.4, 136.9, 142.9],
    profit: [65.2, 72.4, 78.5, 88.2, 94.1, 98.4],
    fee: [13.1, 14.4, 15.7, 17.6, 18.8, 19.7],
  },
  YTD: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    revenue: [65, 72, 78, 82, 88, 92, 95, 98, 105, 115, 128, 142],
    profit: [42, 48, 52, 55, 58, 61, 63, 65, 72, 78, 88, 98],
    fee: [8.4, 9.6, 10.4, 11, 11.6, 12.2, 12.6, 13, 14.4, 15.6, 17.6, 19.7],
  },
};

// ─── Helper: format currency ──────────────────────────────
export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return "$" + (amount / 1_000_000).toFixed(1) + "M";
  }
  if (Math.abs(amount) >= 1_000) {
    return "$" + (amount / 1_000).toFixed(0) + "k";
  }
  return "$" + amount.toFixed(0);
}

// ─── Helper: format currency with decimals ────────────────
export function formatCurrencyFull(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return sign + "$" + Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Helper: format liquidity (no sign) ───────────────────
export function formatLiquidity(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

// ─── Helper: format date relative ─────────────────────────
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Helper: status badge color ───────────────────────────
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  dot: string;
  border: string;
} {
  switch (status) {
    case "active":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500", border: "border-emerald-500/20" };
    case "pending":
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500", border: "border-yellow-500/20" };
    case "inactive":
      return { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-500", border: "border-slate-500/20" };
    case "suspended":
      return { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500", border: "border-red-500/20" };
    default:
      return { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-500", border: "border-slate-500/20" };
  }
}

// ─── Platform Updates ─────────────────────────────────────
// Supabase swap:
//   const { data } = await supabase
//     .from("platform_updates")
//     .select("*")
//     .order("date", { ascending: false });
export const mockPlatformUpdates: PlatformUpdate[] = [
  {
    id: "upd_001",
    date: "Dec 18, 2024",
    category: "New Strategy",
    title: "New Crypto Strategy: Bitcoin Momentum Scalper",
    description: "We've just deployed our most advanced high-frequency crypto strategy yet. The Bitcoin Momentum Scalper utilizes proprietary order flow analysis to capitalize on micro-trends during periods of high volatility. Early backtests show a 15% increase in Sharpe ratio compared to previous iterations.",
    is_featured: true,
    cta: { label: "Deploy Strategy", href: "#" },
  },
  {
    id: "upd_002",
    date: "Dec 16, 2024",
    category: "Improvement",
    version: "v2.4.0",
    title: "Platform Performance Improvement",
    description: "We've optimized the core dashboard rendering engine, resulting in a 40% reduction in load times for client portfolios with large transaction histories. Data fetching is now parallelized for smoother navigation.",
  },
  {
    id: "upd_003",
    date: "Dec 14, 2024",
    category: "New Feature",
    version: "v2.3.5",
    title: "Enhanced Reporting: Export Client Performance to PDF",
    description: "You can now generate white-labeled PDF performance reports for individual clients directly from the client overview page. Includes customizable date ranges and metric selection.",
    cta: { label: "Try it out", href: "#" },
  },
  {
    id: "upd_004",
    date: "Dec 12, 2024",
    category: "Bug Fix",
    version: "v2.3.3",
    title: "Resolved Commission Calculation Display Issue",
    description: "Fixed a UI bug where accrued commissions were displaying in the wrong currency symbol for multi-currency accounts. This was a display-only issue; underlying calculations were correct.",
  },
  {
    id: "upd_005",
    date: "Dec 10, 2024",
    category: "New Strategy",
    title: "EUR/USD Range Trader Released",
    description: "A mean-reversion algorithm designed for low volatility sessions. Ideal for diversifying trend-following portfolios.",
    image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=200&q=80",
    tags: [{ label: "Risk: Low" }, { label: "Min: $5k" }],
  },
  {
    id: "upd_006",
    date: "Dec 08, 2024",
    category: "Announcement",
    title: "Scheduled Maintenance",
    description: "We will be performing scheduled database upgrades on Sunday, Dec 22nd from 2:00 AM to 4:00 AM EST. API access may be intermittent during this window.",
  },
  {
    id: "upd_007",
    date: "Dec 05, 2024",
    category: "New Feature",
    version: "v2.3.0",
    title: "Multi-Currency Account Support Added",
    description: "You can now hold balances in USD, EUR, GBP, and JPY within a single agency account. Conversions are handled automatically at spot rates with zero markup.",
  },
  {
    id: "upd_008",
    date: "Dec 02, 2024",
    category: "Integration",
    title: "MetaTrader 5 Now Supported",
    description: "Connect your MT5 accounts directly to Algo FinTech. This integration supports both hedging and netting accounts and includes full trade history synchronization.",
  },
  {
    id: "upd_009",
    date: "Nov 28, 2024",
    category: "New Asset Class",
    title: "Futures Trading Now Available",
    description: "We've expanded our asset coverage to include major index and commodity futures (ES, NQ, CL, GC). Margin requirements and contract specifications are available in the help center.",
  },
  {
    id: "upd_010",
    date: "Nov 25, 2024",
    category: "Security",
    title: "Two-Factor Authentication Improvements",
    description: "Added support for hardware security keys (YubiKey) and biometric authentication on supported devices for enhanced account security.",
  },
];

export const mockQuarterlyStats: UpdateQuarterlyStats = {
  new_features: 12,
  strategies_added: 8,
  bugs_squashed: 24,
};

/**
 * Get category color for platform update badges.
 */
export function getUpdateCategoryColor(category: string): { bg: string; text: string; border: string; dot: string } {
  switch (category) {
    case "New Feature":
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "border-blue-500" };
    case "Improvement":
      return { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", dot: "border-purple-500" };
    case "Bug Fix":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", dot: "border-orange-500" };
    case "New Strategy":
      return { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", dot: "border-green-500" };
    case "Announcement":
      return { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", dot: "border-pink-500" };
    case "Integration":
      return { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20", dot: "border-indigo-500" };
    case "New Asset Class":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "border-emerald-500" };
    case "Security":
      return { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", dot: "border-cyan-500" };
    default:
      return { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", dot: "border-slate-500" };
  }
}

// ─── New Algorithm Releases ───────────────────────────────
// Supabase swap:
//   const { data } = await supabase
//     .from("algorithm_releases")
//     .select("*, algorithm:algorithms(*)")
//     .order("released_at", { ascending: false });
export const mockNewAlgorithmReleases: NewAlgorithmRelease[] = [
  // Featured hero — BitWave AI (algo_002, Crypto, +284%)
  { algorithm_id: "algo_002", released_at: "Dec 15, 2024", days_ago_label: "3d ago", is_featured: true, features: [{ icon: "zap", label: "Quantum-Inspired Optimization" }, { icon: "bar-chart-2", label: "Sub-millisecond Latency" }, { icon: "clock", label: "1m Timeframe" }] },
  // Card 1 — Cable Breakout (algo_009, Forex, +92%)
  { algorithm_id: "algo_009", released_at: "Dec 11, 2024", days_ago_label: "1w ago", is_featured: false, features: [{ icon: "zap", label: "Momentum Based Entry" }, { icon: "bar-chart-2", label: "GBP/USD, EUR/GBP Focus" }, { icon: "clock", label: "15m Timeframe" }] },
  // Card 2 — Nasdaq Runner (algo_007, Stocks, +62%)
  { algorithm_id: "algo_007", released_at: "Dec 04, 2024", days_ago_label: "2w ago", is_featured: false, features: [{ icon: "cpu", label: "Neural Network Analysis" }, { icon: "target", label: "NASDAQ-100 Components" }, { icon: "clock", label: "4H Timeframe" }] },
  // Card 3 — Gold Trend V2 (algo_004, Futures, +88%)
  { algorithm_id: "algo_004", released_at: "Nov 28, 2024", days_ago_label: "3w ago", is_featured: false, features: [{ icon: "activity", label: "High Volatility Targeting" }, { icon: "layers", label: "GC Futures Only" }, { icon: "clock", label: "5m Timeframe" }] },
  // Card 4 — DeFi Yield Hunter (algo_010, Crypto, +310%)
  { algorithm_id: "algo_010", released_at: "Nov 05, 2024", days_ago_label: "45d ago", is_featured: false, features: [{ icon: "trending-up", label: "Trend Following" }, { icon: "coins", label: "Top 10 Altcoins" }] },
  // Card 5 — Yen Carrier (algo_013, Forex, +41%)
  { algorithm_id: "algo_013", released_at: "Oct 29, 2024", days_ago_label: "52d ago", is_featured: false, features: [{ icon: "moon", label: "Range Bound Strategy" }, { icon: "refresh-cw", label: "JPY Pairs" }] },
  // Card 6 — Blue Chip Growth (algo_011, Stocks, +22%)
  { algorithm_id: "algo_011", released_at: "Oct 21, 2024", days_ago_label: "60d ago", is_featured: false, features: [{ icon: "briefcase", label: "Long Term Hold" }, { icon: "shield", label: "Low Risk Profile" }] },
  // Card 7 — Oil Swing Pro (algo_008, Futures, +56%)
  { algorithm_id: "algo_008", released_at: "Oct 06, 2024", days_ago_label: "75d ago", is_featured: false, features: [] },
  // Card 8 — Bitcoin Trend Follower (algo_018, Crypto, +112%)
  { algorithm_id: "algo_018", released_at: "Oct 01, 2024", days_ago_label: "80d ago", is_featured: false, features: [] },
  // Card 9 — Euro Impulse (algo_005, Forex, +76%)
  { algorithm_id: "algo_005", released_at: "Aug 20, 2024", days_ago_label: "4m ago", is_featured: false, features: [] },
];

export const mockComingSoonAlgorithms: ComingSoonAlgorithm[] = [
  { id: "cs_001", name: "Multi-Pair Arbitrage AI", description: "Sophisticated triangular arbitrage system for major forex pairs. Zero-exposure market neutral strategy.", icon: "layers", icon_color: "indigo", eta: "Q1 2025" },
  { id: "cs_002", name: "Altcoin Season Detector", description: "On-chain analysis tool to detect capital rotation into small-cap cryptocurrencies before the pump.", icon: "gem", icon_color: "orange", eta: "Q1 2025" },
  { id: "cs_003", name: "Small Cap Growth Hunter", description: "Scans Russell 2000 for high-growth potential stocks with strong earnings momentum.", icon: "trending-up", icon_color: "blue", eta: "Q1 2025" },
];

/**
 * Get a new release enriched with algorithm data.
 */
export function getEnrichedReleases() {
  return mockNewAlgorithmReleases
    .map((r) => {
      const algo = getAlgorithmById(r.algorithm_id);
      if (!algo) return null;
      return { ...r, algorithm: algo };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

// ─── Agency Saved Algorithms (join table mock) ───────────
// Supabase swap:
//   const { data } = await supabase
//     .from("agency_saved_algorithms")
//     .select("algorithm_id")
//     .eq("agency_id", agencyId);
//   const savedIds = data.map(r => r.algorithm_id);
export const mockAgencySavedAlgorithmIds: string[] = [
  "algo_001", // Alpha Scalp FX
  "algo_005", // Gold Trend Pro
  "algo_009", // Neural Net Equity
];

// ─── Helper: risk level color ─────────────────────────────
export function getRiskColor(risk: string): string {
  switch (risk) {
    case "low":
      return "bg-emerald-500";
    case "medium":
      return "bg-yellow-500";
    case "high":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
}

// ─── Industry News Articles ──────────────────────────────
// Supabase swap:
//   const { data: articles } = await supabase
//     .from("industry_news")
//     .select("*")
//     .eq("agency_id", agencyId)
//     .order("published_at", { ascending: false });
export const mockIndustryNewsArticles: IndustryNewsArticle[] = [
  {
    id: "news_001",
    title: "Federal Reserve Signals Potential Rate Cuts in 2025 as Inflation Cools",
    description: "The Federal Reserve indicated it may begin reducing interest rates in 2025, citing cooling inflation data and improving economic conditions. Markets rallied on the news with major indices hitting new highs.",
    category: "Market Analysis",
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    image_gradient: null,
    author_name: "Sarah Chen",
    author_avatar_gradient: "from-blue-500 to-indigo-600",
    published_at: "Dec 18, 2024",
    read_time: "5 min read",
    is_featured: true,
    source: "Reuters",
  },
  {
    id: "news_002",
    title: "Bitcoin Surges Past $105K as Institutional Adoption Accelerates",
    description: "Bitcoin reached new all-time highs as major financial institutions announce cryptocurrency custody services and ETF inflows continue to break records.",
    category: "Crypto",
    image_url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&q=80",
    image_gradient: null,
    author_name: "Marcus Webb",
    author_avatar_gradient: "from-orange-500 to-amber-600",
    published_at: "Dec 17, 2024",
    read_time: "4 min read",
    is_featured: false,
    source: "CoinDesk",
  },
  {
    id: "news_003",
    title: "AI-Powered Trading Algorithms See 340% Growth in Hedge Fund Adoption",
    description: "A comprehensive study reveals that AI and machine learning-driven trading strategies have seen unprecedented adoption across the hedge fund industry.",
    category: "Technology",
    image_url: null,
    image_gradient: "from-violet-600 to-purple-700",
    author_name: "David Park",
    author_avatar_gradient: "from-violet-500 to-purple-600",
    published_at: "Dec 16, 2024",
    read_time: "6 min read",
    is_featured: false,
  },
  {
    id: "news_004",
    title: "SEC Approves New Framework for Algorithmic Trading Oversight",
    description: "The Securities and Exchange Commission has finalized new rules governing algorithmic and high-frequency trading, establishing clearer guidelines for risk management.",
    category: "Regulatory Updates",
    image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    image_gradient: null,
    author_name: "Jennifer Liu",
    author_avatar_gradient: "from-emerald-500 to-teal-600",
    published_at: "Dec 15, 2024",
    read_time: "7 min read",
    is_featured: false,
    source: "Bloomberg",
  },
  {
    id: "news_005",
    title: "EUR/USD Volatility Spikes Amid ECB Policy Divergence",
    description: "The euro-dollar pair experienced significant swings as the European Central Bank signaled a more dovish stance compared to the Fed's measured approach.",
    category: "Market Analysis",
    image_url: null,
    image_gradient: "from-blue-600 to-cyan-700",
    author_name: "Thomas Mueller",
    author_avatar_gradient: "from-blue-500 to-cyan-600",
    published_at: "Dec 14, 2024",
    read_time: "4 min read",
    is_featured: false,
  },
  {
    id: "news_006",
    title: "Goldman Sachs Launches Next-Gen Quantitative Trading Platform",
    description: "Goldman Sachs unveils a new quantitative trading platform aimed at providing institutional clients with advanced algorithmic strategies and real-time analytics.",
    category: "Company News",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    image_gradient: null,
    author_name: "Rachel Foster",
    author_avatar_gradient: "from-pink-500 to-rose-600",
    published_at: "Dec 13, 2024",
    read_time: "5 min read",
    is_featured: false,
    source: "Financial Times",
  },
  {
    id: "news_007",
    title: "Momentum Strategies Outperform in Q4 as Market Trends Strengthen",
    description: "Trend-following and momentum-based algorithmic strategies posted their strongest quarter in three years, with average returns exceeding 18%.",
    category: "Trading Insights",
    image_url: null,
    image_gradient: "from-emerald-600 to-green-700",
    author_name: "Alex Novak",
    author_avatar_gradient: "from-emerald-500 to-green-600",
    published_at: "Dec 12, 2024",
    read_time: "5 min read",
    is_featured: false,
  },
  {
    id: "news_008",
    title: "Japan's Nikkei 225 Hits Record High on BOJ Yield Curve Shift",
    description: "Japanese equities surged to fresh all-time highs as the Bank of Japan adjusted its yield curve control policy, attracting global capital flows.",
    category: "Market Analysis",
    image_url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80",
    image_gradient: null,
    author_name: "Yuki Tanaka",
    author_avatar_gradient: "from-red-500 to-orange-600",
    published_at: "Dec 11, 2024",
    read_time: "4 min read",
    is_featured: false,
    source: "Nikkei Asia",
  },
  {
    id: "news_009",
    title: "DeFi Protocols Surpass $200B in Total Value Locked",
    description: "Decentralized finance protocols collectively hit a new milestone in total value locked, driven by renewed interest in yield farming and liquid staking.",
    category: "Crypto",
    image_url: null,
    image_gradient: "from-amber-600 to-orange-700",
    author_name: "Chris Zhang",
    author_avatar_gradient: "from-amber-500 to-orange-600",
    published_at: "Dec 10, 2024",
    read_time: "6 min read",
    is_featured: false,
  },
];

// ─── Market Snapshot ─────────────────────────────────────
// Supabase swap:
//   const { data: snapshot } = await supabase
//     .from("market_snapshot")
//     .select("*")
//     .order("symbol");
export const mockMarketSnapshot: MarketSnapshotItem[] = [
  { symbol: "SPX", name: "S&P 500", price: "4,768.37", change: "+1.37%", change_positive: true },
  { symbol: "NDX", name: "Nasdaq 100", price: "16,831.48", change: "+1.82%", change_positive: true },
  { symbol: "BTC", name: "Bitcoin", price: "105,234.80", change: "+3.24%", change_positive: true },
  { symbol: "EUR/USD", name: "Euro/Dollar", price: "1.0891", change: "-0.15%", change_positive: false },
];

// ─── Trending Articles ───────────────────────────────────
export const mockTrendingArticles: TrendingArticle[] = [
  { id: "news_002", title: "Bitcoin Surges Past $105K as Institutional Adoption Accelerates", category: "Crypto", read_time: "4 min" },
  { id: "news_003", title: "AI-Powered Trading Algorithms See 340% Growth", category: "Technology", read_time: "6 min" },
  { id: "news_004", title: "SEC Approves New Framework for Algo Trading", category: "Regulatory Updates", read_time: "7 min" },
  { id: "news_007", title: "Momentum Strategies Outperform in Q4", category: "Trading Insights", read_time: "5 min" },
  { id: "news_008", title: "Japan's Nikkei 225 Hits Record High", category: "Market Analysis", read_time: "4 min" },
];

// ─── Editor's Picks ──────────────────────────────────────
export const mockEditorPicks: EditorPick[] = [
  { id: "news_003", title: "AI-Powered Trading Algorithms See 340% Growth in Hedge Fund Adoption", category: "Technology", published_at: "Dec 16, 2024" },
  { id: "news_004", title: "SEC Approves New Framework for Algorithmic Trading Oversight", category: "Regulatory Updates", published_at: "Dec 15, 2024" },
];

// ─── News Category Colors ────────────────────────────────
export function getNewsCategoryColor(category: string): { bg: string; text: string; border: string } {
  switch (category) {
    case "Market Analysis":
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" };
    case "Regulatory Updates":
      return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" };
    case "Technology":
      return { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" };
    case "Trading Insights":
      return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
    case "Company News":
      return { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" };
    case "Crypto":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" };
    default:
      return { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };
  }
}

// ─── Announcements ───────────────────────────────────────
// Supabase swap:
//   const { data: announcements } = await supabase
//     .from("announcements")
//     .select("*")
//     .eq("agency_id", agencyId)
//     .order("published_at", { ascending: false });
export const mockAnnouncements: Announcement[] = [
  {
    id: "ann_001",
    title: "Scheduled Maintenance: Platform Offline",
    description: "The trading platform will be offline for critical infrastructure upgrades on December 22, 2:00 AM - 4:00 AM EST. Please close all open positions before this window.",
    priority: "Critical",
    category_label: "System Maintenance",
    icon: "siren",
    published_at: "Dec 20, 2024",
    time_ago: "1 day ago",
    is_unread: true,
    is_banner: true,
  },
  {
    id: "ann_002",
    title: "Password Reset Required for Enhanced Protection",
    description: "We have deployed new encryption standards for user accounts. As a precautionary measure, all agency administrators are required to reset their passwords upon next login. 2FA sessions will also be refreshed.",
    priority: "Critical",
    category_label: "Security Alert",
    icon: "shield-alert",
    published_at: "Dec 20, 2:30 PM EST",
    time_ago: "45 minutes ago",
    is_unread: true,
    cta: { label: "Read full announcement", href: "#" },
  },
  {
    id: "ann_003",
    title: "Emergency Market Closure: Trading Suspended Due to Exchange Issues",
    description: "Trading on NYSE Arca symbols has been temporarily suspended due to technical issues at the primary exchange. Orders will be queued until further notice.",
    priority: "Critical",
    category_label: "Market Operations",
    icon: "octagon-alert",
    published_at: "Dec 19, 9:15 AM EST",
    is_unread: false,
    affected_system: "Execution API",
  },
  {
    id: "ann_004",
    title: "New Commission Structure Effective January 1, 2025",
    description: "We are updating our commission tiers for high-volume agencies. The new structure introduces deeper discounts for volumes exceeding $10M/month. Please review the attached PDF for full details.",
    priority: "Important",
    category_label: "Policy Update",
    icon: "file-text",
    published_at: "Dec 19, 2024",
    time_ago: "2 hours ago",
    is_unread: true,
    attachment: { label: "Download Rate Card 2025.pdf", href: "#" },
    cta: { label: "Read details", href: "#" },
  },
  {
    id: "ann_005",
    title: "Routine Database Optimization",
    description: "Minimal disruption expected. Historical data queries may be slower than usual during this window. Real-time execution services will remain fully operational.",
    priority: "Maintenance",
    category_label: "Maintenance",
    icon: "wrench",
    published_at: "Dec 28, 1-3am EST",
    time_ago: "Scheduled",
    is_unread: true,
  },
  {
    id: "ann_006",
    title: "Milestone Achievement: 10,000 Active Client Accounts!",
    description: "We are thrilled to announce that our platform now supports over 10,000 active institutional accounts. Thank you for your continued trust and partnership.",
    priority: "General",
    category_label: "Celebration",
    icon: "party-popper",
    published_at: "Dec 18, 2024",
    is_unread: false,
  },
  {
    id: "ann_007",
    title: "Welcome to Q4 2024: Platform Usage Statistics & Achievements",
    description: "A quarterly review of platform performance, new feature adoption rates, and our roadmap for early 2025.",
    priority: "General",
    category_label: "Informational",
    icon: "megaphone",
    published_at: "Dec 15, 2024",
    is_unread: false,
    cta: { label: "Read blog post", href: "#" },
  },
];

export const mockPreviousAnnouncements: PreviousAnnouncement[] = [
  { id: "ann_prev_001", title: "Updated Terms of Service: Review Required by December 31", priority: "Important", published_at: "Dec 14" },
  { id: "ann_prev_002", title: "Mobile App Update Deployment: Version 4.2", priority: "Maintenance", published_at: "Dec 12" },
  { id: "ann_prev_003", title: "New Tutorial Video Series Released: Onboarding Made Easy", priority: "General", published_at: "Dec 10" },
  { id: "ann_prev_004", title: "Critical Bug Fix Deployed: Please Refresh Your Dashboard", priority: "Critical", published_at: "Dec 08" },
  { id: "ann_prev_005", title: "Year-End Reporting Deadline: December 28, 2024", priority: "Important", published_at: "Dec 05" },
];

export const mockUpcomingSchedule: UpcomingScheduleItem[] = [
  { id: "sched_001", title: "System Maintenance", month: "Dec", day: "22", time: "2:00 AM - 4:00 AM EST", time_color: "text-red-400", subtitle: "Platform Offline" },
  { id: "sched_002", title: "Holiday Closure", month: "Dec", day: "25", time: "All Day", time_color: "text-blue-400", subtitle: "Support Team Unavailable" },
  { id: "sched_003", title: "Server Migration", month: "Jan", day: "05", time: "1:00 AM - 2:00 AM EST", time_color: "text-orange-400", subtitle: "Brief Intermittent Downtime" },
  { id: "sched_004", title: "API V3.0 Launch", month: "Jan", day: "15", time: "12:00 PM EST", time_color: "text-green-400", subtitle: "New Endpoints Available" },
];

// ─── Announcement Priority Colors ────────────────────────
export function getAnnouncementPriorityColor(priority: string): { bg: string; text: string; border: string; dot: string; leftBorder: string; iconBg: string } {
  switch (priority) {
    case "Critical":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/10", dot: "bg-red-500", leftBorder: "border-l-red-500", iconBg: "bg-red-500/10 text-red-500 border-red-500/10" };
    case "Important":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/10", dot: "bg-orange-500", leftBorder: "border-l-orange-500", iconBg: "bg-orange-500/10 text-orange-500 border-orange-500/10" };
    case "Maintenance":
      return { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/10", dot: "bg-purple-500", leftBorder: "border-l-purple-500", iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/10" };
    case "General":
    default:
      return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/10", dot: "bg-blue-500", leftBorder: "border-l-blue-500", iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/10" };
  }
}
