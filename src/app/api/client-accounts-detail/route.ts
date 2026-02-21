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
    // Get the client dashboard to find the client_id
    const { data: dashboard, error } = await supabase
      .from("client_dashboards")
      .select("*")
      .limit(1)
      .single();

    if (error || !dashboard) {
      return NextResponse.json({ data: null });
    }

    const clientId = dashboard.client_id;
    if (!clientId) {
      return NextResponse.json({ data: null, error: "No linked client" });
    }

    // Fetch accounts from the shared client_accounts table
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });

    // Fetch algos linked to this dashboard (for showing which algos run on which accounts)
    const { data: algos } = await supabase
      .from("client_dashboard_algos")
      .select("*")
      .eq("dashboard_id", dashboard.id)
      .order("created_at");

    const platformColors: Record<
      string,
      { color: string; textColor: string; short: string }
    > = {
      Tradovate: { color: "#262626", textColor: "#ffffff", short: "TV" },
      "MetaTrader 4": { color: "#262626", textColor: "#ffffff", short: "MT4" },
      "MetaTrader 5": { color: "#262626", textColor: "#ffffff", short: "MT5" },
      Binance: { color: "#FCD535", textColor: "#000000", short: "BN" },
      Bybit: { color: "#F7A600", textColor: "#000000", short: "BY" },
      Schwab: { color: "#00A0DF", textColor: "#ffffff", short: "SC" },
      "Interactive Brokers": {
        color: "#1e293b",
        textColor: "#ffffff",
        short: "IB",
      },
      Coinbase: { color: "#0052FF", textColor: "#ffffff", short: "CB" },
    };

    const detailedAccounts = (accounts || []).map(
      (a: Record<string, unknown>) => {
        const plat = (a.platform as string) || "Tradovate";
        const colors = platformColors[plat] || {
          color: "#262626",
          textColor: "#ffffff",
          short: plat.substring(0, 2).toUpperCase(),
        };
        const accNum = (a.account_number as string) || "";
        const mask = accNum.length > 4 ? `••••${accNum.slice(-4)}` : accNum;
        const balance = Number(a.balance) || 0;
        const equity = Number(a.equity) || balance;
        const freeMargin = Number(a.free_margin) || equity * 0.9;
        const dailyPnl = equity - balance;
        const weeklyPnl = dailyPnl * 4.5; // approximation for display

        return {
          id: a.id,
          platform: plat,
          platform_short: colors.short,
          platform_color: colors.color,
          platform_text_color: colors.textColor,
          account_number: accNum,
          account_mask: mask,
          account_label: a.account_label || `${plat} Account`,
          account_type: a.account_type || "Live",
          currency: (a.currency as string) || "USD",
          status: (a.is_active as boolean) ? "Active" : "Inactive",
          balance,
          equity,
          free_margin: freeMargin,
          daily_pnl: dailyPnl,
          daily_pnl_pct:
            balance > 0
              ? Number(((dailyPnl / balance) * 100).toFixed(2))
              : 0,
          weekly_pnl: weeklyPnl,
          weekly_pnl_pct:
            balance > 0
              ? Number(((weeklyPnl / balance) * 100).toFixed(2))
              : 0,
          open_trades: Number(a.open_trades) || 0,
          connected_at: a.created_at,
          // Assign algos round-robin to accounts for display
          algos: [] as { name: string; status: string }[],
        };
      }
    );

    // Distribute algos across accounts for display
    if (algos && algos.length > 0 && detailedAccounts.length > 0) {
      algos.forEach(
        (algo: Record<string, unknown>, idx: number) => {
          const accountIdx = idx % detailedAccounts.length;
          detailedAccounts[accountIdx].algos.push({
            name: algo.name as string,
            status: "active",
          });
        }
      );
    }

    // Calculate summary
    const totalBalance = detailedAccounts.reduce(
      (sum: number, a: { balance: number }) => sum + a.balance,
      0
    );
    const totalDailyPnl = detailedAccounts.reduce(
      (sum: number, a: { daily_pnl: number }) => sum + a.daily_pnl,
      0
    );
    const activeCount = detailedAccounts.filter(
      (a: { status: string }) => a.status === "Active"
    ).length;

    return NextResponse.json({
      data: {
        summary: {
          total_accounts: detailedAccounts.length,
          combined_balance: totalBalance,
          total_daily_pnl: totalDailyPnl,
          active_count: activeCount,
          total_count: detailedAccounts.length,
        },
        accounts: detailedAccounts,
      },
    });
  } catch {
    return NextResponse.json({ data: null });
  }
}
