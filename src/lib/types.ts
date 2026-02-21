/**
 * Database Types — mirrors Supabase table schemas
 *
 * When connecting to Supabase, replace mock-data.ts imports
 * with actual Supabase client queries. These types stay the same.
 *
 * Tables:
 *   agencies        — the agency (whitelabel firm) itself
 *   agency_users     — agency owners / staff
 *   clients          — end clients managed by the agency
 *   strategies       — algorithms available to the agency
 *   client_strategies — join table: which client runs which strategy
 *   positions        — active trading positions
 *   transactions     — deposits, withdrawals, fees
 */

// ─── Agency ───────────────────────────────────────────────
export interface Agency {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "enterprise";
  created_at: string;
}

// ─── Agency User (owner / staff) ──────────────────────────
export interface AgencyUser {
  id: string;
  agency_id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "viewer";
  avatar_url: string | null;
  plan_label: string;
  aum_display: string;
  created_at: string;
}

// ─── Client ───────────────────────────────────────────────
export type ClientStatus = "active" | "inactive" | "pending" | "suspended";
export type RiskLevel = "low" | "medium" | "high";

export interface Client {
  id: string;
  client_id: string; // display ID like "CL-7829"
  agency_id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  avatar_gradient: string | null; // e.g. "from-blue-600 to-indigo-600"
  status: ClientStatus;
  liquidity: number;
  total_pnl: number;
  pnl_percentage: number;
  active_strategies: number;
  risk_level: RiskLevel;
  sparkline_path: string; // SVG path for mini chart
  sparkline_color: string; // hex color for the sparkline stroke
  broker: string;
  joined_at: string;
  last_active: string;
}

// ─── Strategy / Algorithm ─────────────────────────────────
export type StrategyStatus = "active" | "paused" | "deprecated";

export interface Strategy {
  id: string;
  agency_id: string;
  name: string;
  short_name: string;
  asset_tag: string;
  status: StrategyStatus;
  aum: number;
  return_30d: number;
  color: string; // tailwind color key: "indigo" | "yellow" | "blue" | "slate"
}

// ─── Client ↔ Strategy join ──────────────────────────────
export interface ClientStrategy {
  id: string;
  client_id: string;
  strategy_id: string;
  allocation: number; // dollar amount allocated
  started_at: string;
}

// ─── Algorithm (Algorithms Overview page) ────────────────
export type AlgorithmCategory = "Forex" | "Crypto" | "Stocks" | "Futures";

export interface Algorithm {
  id: string;
  slug: string;      // URL-friendly path: "forex-alpha-scalp-fx"
  agency_id: string;
  name: string;
  description: string;
  category: AlgorithmCategory;
  image_url: string;
  roi: string;       // e.g. "+142%"
  drawdown: string;  // e.g. "8.4%"
  win_rate: string;   // e.g. "68%"
}

// ─── Algorithm Detail (Performance page) ─────────────────
export interface AlgorithmMetrics {
  total_return: string;
  win_rate: string;
  profit_factor: string;
  max_drawdown: string;
  sharpe_ratio: string;
  avg_duration: string;
}

export interface AlgorithmMonthlyReturn {
  year: number;
  months: (string | null)[]; // 12 entries, null = no data
  ytd: string;
}

export interface AlgorithmTrade {
  instrument: string;
  instrument_symbol: string;
  instrument_type: string;
  icon_bg: string;
  icon_text_color: string;
  trade_type: "LONG" | "SHORT";
  entry: string;
  exit: string;
  size: string;
  max_dd: string;
  pnl: string;
  pnl_positive: boolean;
  return_pct: string;
  return_positive: boolean;
}

export interface AlgorithmInfo {
  timeframe: string;
  min_account: string;
  instruments: string;
  trades_per_month: string;
}

export interface AlgorithmReleaseNote {
  version: string;
  date: string;
  description: string;
  is_latest: boolean;
}

export interface AlgorithmEquityChart {
  labels: string[];
  data: number[];
}

export interface AlgorithmDetail {
  algorithm_id: string; // FK to Algorithm.id
  metrics: AlgorithmMetrics;
  monthly_returns: AlgorithmMonthlyReturn[];
  trades: AlgorithmTrade[];
  info: AlgorithmInfo;
  release_notes: AlgorithmReleaseNote[];
  equity_chart: AlgorithmEquityChart;
}

// ─── Dashboard Stats (computed / aggregated) ──────────────
export interface DashboardStats {
  active_clients: number;
  active_clients_change: number;
  total_aum: string;
  aum_change: string;
  pnl: string;
  pnl_change: string;
  active_positions: number;
  long_positions: number;
  short_positions: number;
}

// ─── Performance Chart Data ───────────────────────────────
export interface ChartTimeframeData {
  labels: string[];
  revenue: number[];
  profit: number[];
  fee: number[];
}

export type ChartData = Record<string, ChartTimeframeData>;

// ─── Platform Updates ────────────────────────────────────
export type UpdateCategory =
  | "New Feature"
  | "Improvement"
  | "Bug Fix"
  | "New Strategy"
  | "Announcement"
  | "Integration"
  | "New Asset Class"
  | "Security";

export interface PlatformUpdate {
  id: string;
  date: string;            // e.g. "Dec 18, 2024"
  category: UpdateCategory;
  version?: string;        // e.g. "v2.4.0"
  title: string;
  description: string;
  is_featured?: boolean;
  /** Optional image for strategy cards */
  image_url?: string;
  /** Optional metadata tags shown below description */
  tags?: { label: string }[];
  /** Optional CTA */
  cta?: { label: string; href: string };
}

export interface UpdateQuarterlyStats {
  new_features: number;
  strategies_added: number;
  bugs_squashed: number;
}
