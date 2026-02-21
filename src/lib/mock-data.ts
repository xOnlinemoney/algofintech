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
