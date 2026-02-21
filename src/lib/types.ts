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

// ─── New Algorithm Releases ──────────────────────────────
export interface NewAlgorithmRelease {
  algorithm_id: string;       // FK to Algorithm.id — syncs with existing algo
  released_at: string;        // e.g. "Dec 11, 2024"
  days_ago_label: string;     // e.g. "1w ago", "45d ago"
  is_featured: boolean;
  features: { icon: string; label: string }[]; // e.g. [{icon:"zap", label:"Momentum Based Entry"}]
}

export interface ComingSoonAlgorithm {
  id: string;
  name: string;
  description: string;
  icon: string;                // lucide icon name
  icon_color: string;          // tailwind color key like "indigo", "orange", "blue"
  eta: string;                 // e.g. "Q1 2025"
}

// ─── Industry News ──────────────────────────────────────
export type IndustryNewsCategory =
  | "All News"
  | "Market Analysis"
  | "Regulatory Updates"
  | "Technology"
  | "Trading Insights"
  | "Company News"
  | "Crypto";

export interface IndustryNewsArticle {
  id: string;
  title: string;
  description: string;
  category: IndustryNewsCategory;
  image_url: string | null;
  image_gradient: string | null;   // fallback gradient if no image
  author_name: string;
  author_avatar_gradient: string;  // tailwind gradient for avatar
  published_at: string;            // e.g. "Dec 18, 2024"
  read_time: string;               // e.g. "5 min read"
  is_featured: boolean;
  source?: string;                 // e.g. "Reuters", "Bloomberg"
}

export interface MarketSnapshotItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  change_positive: boolean;
}

export interface TrendingArticle {
  id: string;
  title: string;
  category: IndustryNewsCategory;
  read_time: string;
}

export interface EditorPick {
  id: string;
  title: string;
  category: IndustryNewsCategory;
  published_at: string;
}

// ─── Announcements ──────────────────────────────────────
export type AnnouncementPriority = "Critical" | "Important" | "General" | "Maintenance";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: AnnouncementPriority;
  category_label: string;        // e.g. "Security Alert", "Policy Update", "Maintenance"
  icon: string;                  // lucide icon name
  published_at: string;          // e.g. "Dec 20, 2:30 PM EST"
  time_ago?: string;             // e.g. "45 minutes ago", "2 hours ago"
  is_unread: boolean;
  is_banner?: boolean;           // if true, show as critical top banner
  attachment?: { label: string; href: string };
  affected_system?: string;      // e.g. "Execution API"
  cta?: { label: string; href: string };
}

export interface PreviousAnnouncement {
  id: string;
  title: string;
  priority: AnnouncementPriority;
  published_at: string;          // e.g. "Dec 14"
}

export interface UpcomingScheduleItem {
  id: string;
  title: string;
  month: string;                 // e.g. "Dec"
  day: string;                   // e.g. "22"
  time: string;                  // e.g. "2:00 AM - 4:00 AM EST"
  time_color: string;            // tailwind text color
  subtitle: string;              // e.g. "Platform Offline"
}
