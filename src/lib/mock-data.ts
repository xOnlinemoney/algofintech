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
  Strategy,
  Algorithm,
  AlgorithmDetail,
  DashboardStats,
  ChartData,
} from "./types";

// ─── Agency ───────────────────────────────────────────────
export const mockAgency: Agency = {
  id: "agency_001",
  name: "AlgoStack",
  slug: "algostack",
  plan: "pro",
  created_at: "2024-01-15T00:00:00Z",
};

// ─── Agency User (logged-in user) ─────────────────────────
export const mockAgencyUser: AgencyUser = {
  id: "user_001",
  agency_id: "agency_001",
  name: "Ali Husni",
  email: "ali@algostack.com",
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
    active_strategies: 4,
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
    risk_level: "medium",
    sparkline_path: "M0,36 Q25,32 50,28 T100,24 T150,20 T200,14 T250,10 T280,6",
    sparkline_color: "#10b981",
    broker: "Bybit",
    joined_at: "2024-07-22T00:00:00Z",
    last_active: "2026-02-20T15:45:00Z",
  },
];

// ─── Algorithms (Algorithms Overview page — matches HTML 1:1) ──
export const mockAlgorithms: Algorithm[] = [
  { id: "algo_001", agency_id: "agency_001", name: "Alpha Scalp FX", description: "High-frequency scalping algorithm targeting major currency pairs during London overlap.", category: "Forex", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+142%", drawdown: "8.4%", win_rate: "68%" },
  { id: "algo_002", agency_id: "agency_001", name: "BitWave AI", description: "Neural network model optimized for Bitcoin volatility patterns and trend reversals.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+284%", drawdown: "12.1%", win_rate: "54%" },
  { id: "algo_003", agency_id: "agency_001", name: "Equity Shield", description: "Long-short equity strategy focused on tech sector volatility reduction.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+45%", drawdown: "4.2%", win_rate: "72%" },
  { id: "algo_004", agency_id: "agency_001", name: "Gold Trend V2", description: "Automated system tracking macro trends in Gold and Silver futures.", category: "Futures", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+88%", drawdown: "9.5%", win_rate: "62%" },
  { id: "algo_005", agency_id: "agency_001", name: "Euro Impulse", description: "Breakout strategy specifically designed for EUR/USD volatility.", category: "Forex", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+76%", drawdown: "5.8%", win_rate: "65%" },
  { id: "algo_006", agency_id: "agency_001", name: "Ether Momentum", description: "Captures strong momentum moves in Ethereum cross pairs.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+190%", drawdown: "15.4%", win_rate: "51%" },
  { id: "algo_007", agency_id: "agency_001", name: "Nasdaq Runner", description: "Intraday trend following on QQQ and tech-heavy constituents.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+62%", drawdown: "7.1%", win_rate: "59%" },
  { id: "algo_008", agency_id: "agency_001", name: "Oil Swing Pro", description: "Crude oil inventory news trading algorithm with tight risk control.", category: "Futures", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+56%", drawdown: "6.3%", win_rate: "60%" },
  { id: "algo_009", agency_id: "agency_001", name: "Cable Breakout", description: "GBP/USD breakout system utilizing London open volatility.", category: "Forex", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+92%", drawdown: "10.1%", win_rate: "58%" },
  { id: "algo_010", agency_id: "agency_001", name: "DeFi Yield Hunter", description: "Arbitrage algorithm working across major decentralized exchanges.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+310%", drawdown: "18.2%", win_rate: "75%" },
  { id: "algo_011", agency_id: "agency_001", name: "Blue Chip Growth", description: "Conservative growth strategy focusing on S&P 500 dividend payers.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+22%", drawdown: "3.1%", win_rate: "82%" },
  { id: "algo_012", agency_id: "agency_001", name: "Treasury Bond Arb", description: "Yield curve arbitrage trading on 10-year and 2-year notes.", category: "Futures", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+18%", drawdown: "2.5%", win_rate: "92%" },
  { id: "algo_013", agency_id: "agency_001", name: "Yen Carrier", description: "Carry trade strategy focused on USD/JPY and EUR/JPY interest differentials.", category: "Forex", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+41%", drawdown: "12.5%", win_rate: "70%" },
  { id: "algo_014", agency_id: "agency_001", name: "Solana Speed", description: "Scalping algorithm optimized for Solana's block times.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+165%", drawdown: "14.3%", win_rate: "55%" },
  { id: "algo_015", agency_id: "agency_001", name: "Small Cap Rocket", description: "High volatility breakout strategy for Russell 2000 stocks.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+98%", drawdown: "16.5%", win_rate: "48%" },
  { id: "algo_016", agency_id: "agency_001", name: "Agri-Commodity Cycle", description: "Seasonal trading model for Wheat, Corn, and Soybeans.", category: "Futures", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+34%", drawdown: "8.8%", win_rate: "65%" },
  { id: "algo_017", agency_id: "agency_001", name: "Global Macro FX", description: "Long-term trend following based on central bank interest rate policies.", category: "Forex", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+67%", drawdown: "11.2%", win_rate: "55%" },
  { id: "algo_018", agency_id: "agency_001", name: "Bitcoin Trend Follower", description: "Classic Donchian channel strategy adapted for BTC/USD.", category: "Crypto", image_url: "https://images.unsplash.com/photo-1724525647065-f948fc102e68?w=2160&q=80", roi: "+112%", drawdown: "18.5%", win_rate: "45%" },
  { id: "algo_019", agency_id: "agency_001", name: "Tech Sector Rotation", description: "Monthly rotation strategy moving between semiconductor and software ETFs.", category: "Stocks", image_url: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80", roi: "+38%", drawdown: "6.1%", win_rate: "64%" },
  { id: "algo_020", agency_id: "agency_001", name: "E-Mini Scalper", description: "Rapid fire execution on S&P 500 E-mini futures order flow.", category: "Futures", image_url: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80", roi: "+104%", drawdown: "9.3%", win_rate: "72%" },
];

// ─── Helper: category badge color ────────────────────────
export function getCategoryColor(category: string): { bg: string; text: string; border: string } {
  switch (category) {
    case "Forex":
      return { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/20" };
    case "Crypto":
      return { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/20" };
    case "Stocks":
      return { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/20" };
    case "Futures":
      return { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/20" };
    default:
      return { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/20" };
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
 * Get algorithm detail by algorithm ID.
 * In Supabase, this becomes a join query:
 *   const { data } = await supabase
 *     .from("algorithm_details")
 *     .select("*")
 *     .eq("algorithm_id", id)
 *     .single();
 */
export function getAlgorithmDetail(algorithmId: string): AlgorithmDetail | null {
  const algo = mockAlgorithms.find((a) => a.id === algorithmId);
  if (!algo) return null;
  return { algorithm_id: algorithmId, ...defaultAlgorithmDetail };
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
