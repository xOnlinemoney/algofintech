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
  if (!supabase) return NextResponse.json({ data: null, error: "No Supabase" });

  try {
    // Get client from dashboard
    const { data: dashboard } = await supabase
      .from("client_dashboards")
      .select("*, client_dashboard_algos(*)")
      .limit(1)
      .single();

    if (!dashboard?.client_id) {
      return NextResponse.json({ data: null });
    }

    const clientId = dashboard.client_id;

    // Fetch all trades for this client
    const { data: trades } = await supabase
      .from("client_trading_activity")
      .select("*, client_accounts(platform, account_number, account_label, balance, equity, is_active)")
      .eq("client_id", clientId)
      .order("opened_at", { ascending: true })
      .limit(100000);

    // Fetch accounts
    const { data: accounts } = await supabase
      .from("client_accounts")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at");

    const allTrades = (trades || []) as Record<string, unknown>[];
    const closedTrades = allTrades.filter(t => t.status === "Closed");
    const openTrades = allTrades.filter(t => t.status === "Open");
    const wins = closedTrades.filter(t => (Number(t.net_pnl) || 0) > 0);
    const losses = closedTrades.filter(t => (Number(t.net_pnl) || 0) < 0);

    // ---------- Summary Metrics ----------
    const totalPnl = closedTrades.reduce((s, t) => s + (Number(t.net_pnl) || 0), 0);
    const totalGross = closedTrades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const winAmount = wins.reduce((s, t) => s + (Number(t.net_pnl) || 0), 0);
    const lossAmount = Math.abs(losses.reduce((s, t) => s + (Number(t.net_pnl) || 0), 0));
    const profitFactor = lossAmount > 0 ? Number((winAmount / lossAmount).toFixed(1)) : winAmount > 0 ? 99.9 : 0;
    const winRate = closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0;
    const avgTrade = closedTrades.length > 0 ? Number((totalPnl / closedTrades.length).toFixed(2)) : 0;
    const avgWin = wins.length > 0 ? Number((winAmount / wins.length).toFixed(2)) : 0;
    const avgLoss = losses.length > 0 ? Number((Math.abs(losses.reduce((s, t) => s + (Number(t.net_pnl) || 0), 0)) / losses.length).toFixed(2)) : 0;
    const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => Number(t.net_pnl) || 0)) : 0;
    const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => Number(t.net_pnl) || 0)) : 0;

    // Starting / ending balance from accounts
    const totalBalance = (accounts || []).reduce((s: number, a: Record<string, unknown>) => s + (Number(a.balance) || 0), 0);
    const startingBalance = totalBalance - totalPnl;
    const totalReturn = startingBalance > 0 ? Number(((totalPnl / startingBalance) * 100).toFixed(1)) : 0;

    // Win/Loss streaks
    let maxWinStreak = 0, maxLossStreak = 0, currentWinStreak = 0, currentLossStreak = 0;
    closedTrades.forEach(t => {
      if ((Number(t.net_pnl) || 0) > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
      }
    });

    // Max drawdown calculation
    let peak = startingBalance;
    let maxDrawdown = 0;
    let maxDrawdownDate = "";
    let runningBalance = startingBalance;
    closedTrades.forEach(t => {
      runningBalance += Number(t.net_pnl) || 0;
      if (runningBalance > peak) peak = runningBalance;
      const dd = peak > 0 ? ((peak - runningBalance) / peak) * 100 : 0;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
        maxDrawdownDate = (t.closed_at as string) || (t.opened_at as string) || "";
      }
    });

    // Average duration (parse "Xh Ym" format)
    function parseDurationMinutes(d: string | null | undefined): number {
      if (!d) return 0;
      const ds = String(d);
      let mins = 0;
      const hMatch = ds.match(/(\d+)h/);
      const mMatch = ds.match(/(\d+)m/);
      if (hMatch) mins += parseInt(hMatch[1]) * 60;
      if (mMatch) mins += parseInt(mMatch[1]);
      return mins;
    }
    const totalDurationMins = closedTrades.reduce((s, t) => s + parseDurationMinutes(t.duration as string), 0);
    const avgDurationMins = closedTrades.length > 0 ? Math.round(totalDurationMins / closedTrades.length) : 0;
    const avgDurationH = Math.floor(avgDurationMins / 60);
    const avgDurationM = avgDurationMins % 60;
    const avgDurationStr = avgDurationH > 0 ? `${avgDurationH}h ${avgDurationM}m` : `${avgDurationM}m`;

    // Trading days count
    const tradingDays = new Set(allTrades.map(t => {
      const d = new Date(t.opened_at as string);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;

    // Sharpe & Sortino ratios (simplified)
    const returns = closedTrades.map(t => Number(t.net_pnl) || 0);
    const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance = returns.length > 1 ? returns.reduce((s, r) => s + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1) : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? Number((meanReturn / stdDev * Math.sqrt(252)).toFixed(1)) : 0;
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVariance = downsideReturns.length > 1 ? downsideReturns.reduce((s, r) => s + Math.pow(r, 2), 0) / downsideReturns.length : 0;
    const downsideDev = Math.sqrt(downsideVariance);
    const sortinoRatio = downsideDev > 0 ? Number((meanReturn / downsideDev * Math.sqrt(252)).toFixed(1)) : 0;

    // ---------- Equity Curve ----------
    const equityCurve: { date: string; balance: number }[] = [];
    let balance = startingBalance;
    closedTrades.forEach(t => {
      balance += Number(t.net_pnl) || 0;
      const dateStr = t.closed_at ? new Date(t.closed_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
      if (dateStr) equityCurve.push({ date: dateStr, balance: Number(balance.toFixed(2)) });
    });
    // Add starting point
    if (equityCurve.length > 0) {
      equityCurve.unshift({ date: "Start", balance: startingBalance });
    }

    // ---------- P&L Distribution ----------
    const pnlBuckets = [
      { label: "< -$50", min: -Infinity, max: -50, count: 0 },
      { label: "-$50 to -$25", min: -50, max: -25, count: 0 },
      { label: "-$25 to $0", min: -25, max: 0, count: 0 },
      { label: "$0 to $25", min: 0, max: 25, count: 0 },
      { label: "$25 to $50", min: 25, max: 50, count: 0 },
      { label: "$50 to $100", min: 50, max: 100, count: 0 },
      { label: "> $100", min: 100, max: Infinity, count: 0 },
    ];
    closedTrades.forEach(t => {
      const pnl = Number(t.net_pnl) || 0;
      for (const b of pnlBuckets) {
        if (pnl >= b.min && pnl < b.max) { b.count++; break; }
      }
    });
    // Find which bucket has most trades
    const maxBucket = pnlBuckets.reduce((max, b) => b.count > max.count ? b : max, pnlBuckets[0]);
    const maxBucketPct = closedTrades.length > 0 ? Math.round((maxBucket.count / closedTrades.length) * 100) : 0;

    // ---------- Win Rate by Week ----------
    const weeklyWinRate: { label: string; rate: number }[] = [];
    const tradesByWeek = new Map<string, { wins: number; total: number }>();
    closedTrades.forEach(t => {
      const d = new Date(t.closed_at as string || t.opened_at as string);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const entry = tradesByWeek.get(key) || { wins: 0, total: 0 };
      entry.total++;
      if ((Number(t.net_pnl) || 0) > 0) entry.wins++;
      tradesByWeek.set(key, entry);
    });
    tradesByWeek.forEach((v, k) => {
      weeklyWinRate.push({ label: k, rate: Math.round((v.wins / v.total) * 100) });
    });

    // ---------- Performance by Day of Week ----------
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayPerf = dayNames.map(name => ({ day: name, avgPnl: 0, count: 0, totalPnl: 0 }));
    closedTrades.forEach(t => {
      const d = new Date(t.opened_at as string);
      const dayIdx = d.getDay();
      dayPerf[dayIdx].totalPnl += Number(t.net_pnl) || 0;
      dayPerf[dayIdx].count++;
    });
    dayPerf.forEach(d => {
      d.avgPnl = d.count > 0 ? Number((d.totalPnl / d.count).toFixed(2)) : 0;
    });
    const bestDay = dayPerf.reduce((best, d) => d.avgPnl > best.avgPnl ? d : best, dayPerf[0]);

    // ---------- Performance by Hour ----------
    const hourPerf: { hour: string; avgPnl: number; count: number; totalPnl: number }[] = [];
    for (let h = 6; h <= 20; h++) {
      const label = h < 12 ? `${h}AM` : h === 12 ? "12PM" : `${h - 12}PM`;
      hourPerf.push({ hour: label, avgPnl: 0, count: 0, totalPnl: 0 });
    }
    closedTrades.forEach(t => {
      const d = new Date(t.opened_at as string);
      const h = d.getHours();
      const idx = h - 6;
      if (idx >= 0 && idx < hourPerf.length) {
        hourPerf[idx].totalPnl += Number(t.net_pnl) || 0;
        hourPerf[idx].count++;
      }
    });
    hourPerf.forEach(h => {
      h.avgPnl = h.count > 0 ? Number((h.totalPnl / h.count).toFixed(2)) : 0;
    });
    // Find best trading window
    let bestWindowStart = 0, bestWindowPnl = -Infinity;
    for (let i = 0; i <= hourPerf.length - 4; i++) {
      const windowPnl = hourPerf.slice(i, i + 4).reduce((s, h) => s + h.avgPnl, 0);
      if (windowPnl > bestWindowPnl) { bestWindowPnl = windowPnl; bestWindowStart = i; }
    }
    const bestWindowLabel = `${hourPerf[bestWindowStart]?.hour || "8AM"} - ${hourPerf[bestWindowStart + 4]?.hour || "12PM"} EST`;
    // % of profitable trades in that window
    let windowProfitable = 0, windowTotal = 0;
    closedTrades.forEach(t => {
      const d = new Date(t.opened_at as string);
      const h = d.getHours();
      if (h >= bestWindowStart + 6 && h < bestWindowStart + 10) {
        windowTotal++;
        if ((Number(t.net_pnl) || 0) > 0) windowProfitable++;
      }
    });
    const windowProfitPct = windowTotal > 0 ? Math.round((windowProfitable / windowTotal) * 100) : 0;

    // ---------- Account Breakdown ----------
    const platformColors: Record<string, { color: string; textColor: string; short: string }> = {
      Tradovate: { color: "#262626", textColor: "#ffffff", short: "TV" },
      "MetaTrader 4": { color: "#262626", textColor: "#ffffff", short: "MT4" },
      "MetaTrader 5": { color: "#262626", textColor: "#ffffff", short: "MT5" },
      Binance: { color: "#FCD535", textColor: "#000000", short: "BN" },
      Bybit: { color: "#F7A600", textColor: "#000000", short: "BY" },
      Schwab: { color: "#00A0DF", textColor: "#ffffff", short: "SC" },
    };

    const accountBreakdown = (accounts || []).map((a: Record<string, unknown>) => {
      const plat = (a.platform as string) || "Unknown";
      const colors = platformColors[plat] || { color: "#262626", textColor: "#ffffff", short: plat.substring(0, 2).toUpperCase() };
      const accountTrades = closedTrades.filter(t => t.account_id === a.id);
      const accountWins = accountTrades.filter(t => (Number(t.net_pnl) || 0) > 0);
      const accountPnl = accountTrades.reduce((s, t) => s + (Number(t.net_pnl) || 0), 0);
      const accBalance = Number(a.balance) || 0;
      const accountReturn = accBalance > 0 ? Number(((accountPnl / (accBalance - accountPnl)) * 100).toFixed(1)) : 0;
      const accountWinRate = accountTrades.length > 0 ? Math.round((accountWins.length / accountTrades.length) * 100) : 0;

      return {
        id: a.id,
        platform: plat,
        platform_short: colors.short,
        platform_color: colors.color,
        platform_text_color: colors.textColor,
        account_label: a.account_label || `${plat} Account`,
        trade_count: accountTrades.length,
        pnl: Number(accountPnl.toFixed(2)),
        return_pct: accountReturn,
        win_rate: accountWinRate,
        is_active: a.is_active,
        contribution: totalPnl > 0 ? Math.round((accountPnl / totalPnl) * 100) : 0,
      };
    });

    const bestAccount = accountBreakdown.reduce((best: Record<string, unknown> | null, a: Record<string, unknown>) =>
      !best || (a.return_pct as number) > (best.return_pct as number) ? a : best, null);

    // ---------- Algorithm Performance ----------
    const algoMap = new Map<string, { name: string; color: string; category: string; pnl: number; trades: number; wins: number }>();
    closedTrades.forEach(t => {
      const name = (t.algorithm_name as string) || "Manual";
      if (!algoMap.has(name)) {
        algoMap.set(name, {
          name,
          color: (t.algorithm_color as string) || "#8b5cf6",
          category: (t.symbol_category as string) || "Forex",
          pnl: 0,
          trades: 0,
          wins: 0,
        });
      }
      const entry = algoMap.get(name)!;
      entry.pnl += Number(t.net_pnl) || 0;
      entry.trades++;
      if ((Number(t.net_pnl) || 0) > 0) entry.wins++;
    });
    const algoPerformance = Array.from(algoMap.values()).map(a => ({
      ...a,
      pnl: Number(a.pnl.toFixed(2)),
      win_rate: a.trades > 0 ? Math.round((a.wins / a.trades) * 100) : 0,
    })).sort((a, b) => b.pnl - a.pnl);

    // ---------- Asset Class Breakdown ----------
    const assetMap = new Map<string, { category: string; pnl: number; trades: number }>();
    closedTrades.forEach(t => {
      const cat = (t.symbol_category as string) || "Other";
      if (!assetMap.has(cat)) assetMap.set(cat, { category: cat, pnl: 0, trades: 0 });
      const entry = assetMap.get(cat)!;
      entry.pnl += Number(t.net_pnl) || 0;
      entry.trades++;
    });
    const assetBreakdown = Array.from(assetMap.values()).map(a => ({
      ...a,
      pnl: Number(a.pnl.toFixed(2)),
      pct: totalPnl > 0 ? Number(((a.pnl / totalPnl) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.pnl - a.pnl);

    // ---------- Top Symbols ----------
    const symbolMap = new Map<string, { symbol: string; pnl: number; trades: number; wins: number }>();
    closedTrades.forEach(t => {
      const sym = (t.symbol as string) || "Unknown";
      if (!symbolMap.has(sym)) symbolMap.set(sym, { symbol: sym, pnl: 0, trades: 0, wins: 0 });
      const entry = symbolMap.get(sym)!;
      entry.pnl += Number(t.net_pnl) || 0;
      entry.trades++;
      if ((Number(t.net_pnl) || 0) > 0) entry.wins++;
    });
    const topSymbols = Array.from(symbolMap.values())
      .map(s => ({
        ...s,
        pnl: Number(s.pnl.toFixed(2)),
        win_rate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);

    // ---------- Daily P&L Calendar ----------
    const dailyPnl = new Map<string, number>();
    closedTrades.forEach(t => {
      const d = new Date(t.closed_at as string || t.opened_at as string);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyPnl.set(key, (dailyPnl.get(key) || 0) + (Number(t.net_pnl) || 0));
    });
    const calendarData = Array.from(dailyPnl.entries()).map(([date, pnl]) => ({
      date,
      pnl: Number(pnl.toFixed(2)),
    }));

    // ---------- Risk Analysis ----------
    const riskRewardRatio = avgLoss > 0 ? `1:${(avgWin / avgLoss).toFixed(1)}` : "N/A";
    const currentDrawdown = peak > 0 ? Number((((peak - balance) / peak) * 100).toFixed(1)) : 0;
    // Value at Risk (simplified - 95th percentile)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var95 = sortedReturns.length > 0 ? Math.abs(sortedReturns[var95Index] || 0) : 0;

    return NextResponse.json({
      data: {
        summary: {
          net_pnl: Number(totalPnl.toFixed(2)),
          total_return: totalReturn,
          win_rate: winRate,
          win_count: wins.length,
          loss_count: losses.length,
          profit_factor: profitFactor,
          max_drawdown: Number(maxDrawdown.toFixed(1)),
          max_drawdown_date: maxDrawdownDate,
          total_trades: allTrades.length,
          closed_trades: closedTrades.length,
          open_trades: openTrades.length,
          avg_trade: avgTrade,
          avg_win: avgWin,
          avg_loss: avgLoss,
          best_trade: Number(bestTrade.toFixed(2)),
          worst_trade: Number(worstTrade.toFixed(2)),
          win_streak: maxWinStreak,
          loss_streak: maxLossStreak,
          avg_duration: avgDurationStr,
          trading_days: tradingDays,
          sharpe_ratio: sharpeRatio,
          sortino_ratio: sortinoRatio,
          starting_balance: Number(startingBalance.toFixed(2)),
          ending_balance: Number(balance.toFixed(2)),
        },
        equity_curve: equityCurve,
        pnl_distribution: {
          buckets: pnlBuckets.map(b => ({ label: b.label, count: b.count })),
          max_bucket_label: maxBucket.label,
          max_bucket_pct: maxBucketPct,
        },
        win_rate_trend: weeklyWinRate,
        day_performance: dayPerf.map(d => ({ day: d.day, avgPnl: d.avgPnl })),
        best_day: { day: bestDay.day, avgPnl: bestDay.avgPnl },
        hour_performance: hourPerf.map(h => ({ hour: h.hour, avgPnl: h.avgPnl })),
        best_window: { label: bestWindowLabel, pct: windowProfitPct },
        account_breakdown: accountBreakdown,
        best_account: bestAccount ? { label: (bestAccount as Record<string, unknown>).account_label, return_pct: (bestAccount as Record<string, unknown>).return_pct } : null,
        algo_performance: algoPerformance,
        asset_breakdown: assetBreakdown,
        top_symbols: topSymbols,
        calendar: calendarData,
        risk: {
          max_drawdown: Number(maxDrawdown.toFixed(1)),
          max_drawdown_date: maxDrawdownDate ? new Date(maxDrawdownDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
          current_drawdown: currentDrawdown,
          risk_reward: riskRewardRatio,
          var_95: Number(var95.toFixed(2)),
        },
      },
    });
  } catch (e) {
    console.error("Performance API error:", e);
    return NextResponse.json({ data: null });
  }
}
