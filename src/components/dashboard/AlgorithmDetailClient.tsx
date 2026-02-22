"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import AlgorithmDetailView from "@/components/dashboard/AlgorithmDetail";
import type { Algorithm, AlgorithmDetail } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Default detail template for algorithms that don't have full detail data in Supabase
const defaultDetail: Omit<AlgorithmDetail, "algorithm_id"> = {
  metrics: {
    total_return: "+142.5%",
    win_rate: "68.2%",
    profit_factor: "2.14",
    max_drawdown: "8.4%",
    sharpe_ratio: "2.31",
    avg_duration: "4h 23m",
  },
  monthly_returns: [
    {
      year: 2024,
      months: ["+4.2%","+3.1%","-1.5%","+6.8%","+2.9%","+5.1%","+1.8%","-0.9%","+7.2%","+3.4%","+4.6%","+2.8%"],
      ytd: "+47.2%",
    },
    {
      year: 2023,
      months: ["+3.8%","+2.5%","+4.1%","-2.3%","+5.6%","+1.2%","+3.9%","+6.1%","-1.1%","+4.4%","+2.7%","+5.3%"],
      ytd: "+42.1%",
    },
  ],
  trades: [
    { instrument: "EUR/USD", instrument_symbol: "EU", instrument_type: "Forex Major", icon_bg: "bg-blue-500/20", icon_text_color: "text-blue-400", trade_type: "LONG", entry: "1.0842", exit: "1.0921", size: "2.5 lots", max_dd: "-0.3%", pnl: "+$1,975", pnl_positive: true, return_pct: "+0.73%", return_positive: true },
    { instrument: "GBP/USD", instrument_symbol: "GU", instrument_type: "Forex Major", icon_bg: "bg-emerald-500/20", icon_text_color: "text-emerald-400", trade_type: "SHORT", entry: "1.2654", exit: "1.2589", size: "1.8 lots", max_dd: "-0.5%", pnl: "+$1,170", pnl_positive: true, return_pct: "+0.51%", return_positive: true },
    { instrument: "USD/JPY", instrument_symbol: "UJ", instrument_type: "Forex Major", icon_bg: "bg-orange-500/20", icon_text_color: "text-orange-400", trade_type: "LONG", entry: "148.25", exit: "147.80", size: "3.0 lots", max_dd: "-0.8%", pnl: "-$1,350", pnl_positive: false, return_pct: "-0.30%", return_positive: false },
  ],
  info: {
    timeframe: "M15 / H1",
    min_account: "$5,000",
    instruments: "Major FX Pairs",
    trades_per_month: "45-60",
  },
  release_notes: [
    { version: "v3.2.1", date: "Dec 15, 2024", description: "Improved risk management during high-impact news events. Added Asian session filter.", is_latest: true },
    { version: "v3.1.0", date: "Nov 28, 2024", description: "New momentum-based entry confirmation. Reduced false signals by 12%.", is_latest: false },
    { version: "v3.0.0", date: "Oct 10, 2024", description: "Major engine rewrite with ML-powered pattern recognition.", is_latest: false },
  ],
  equity_chart: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    data: [10000,10420,10743,10582,11302,11629,11838,12278,12168,13044,13487,13865],
  },
};

export default function AlgorithmDetailClient({ slug }: { slug: string }) {
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [detail, setDetail] = useState<AlgorithmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agency/algorithms")
      .then((r) => r.json())
      .then((data) => {
        if (data.algorithms) {
          const algo = data.algorithms.find((a: any) => a.slug === slug);
          if (algo) {
            // Build Algorithm object
            const algoObj: Algorithm = {
              id: algo.id,
              slug: algo.slug,
              agency_id: algo.agency_id || "",
              name: algo.name,
              description: algo.description,
              category: algo.category,
              image_url: algo.image_url,
              roi: algo.roi,
              drawdown: algo.drawdown,
              win_rate: algo.win_rate,
            };
            setAlgorithm(algoObj);

            // Build AlgorithmDetail — use Supabase data if available, fallback to defaults
            const detailObj: AlgorithmDetail = {
              algorithm_id: algo.id,
              metrics: algo.metrics?.total_return
                ? algo.metrics
                : { ...defaultDetail.metrics, total_return: algo.roi || defaultDetail.metrics.total_return, win_rate: algo.win_rate || defaultDetail.metrics.win_rate, max_drawdown: algo.drawdown || defaultDetail.metrics.max_drawdown },
              monthly_returns: algo.monthly_returns?.length > 0
                ? algo.monthly_returns
                : defaultDetail.monthly_returns,
              trades: defaultDetail.trades,
              info: algo.info?.timeframe
                ? algo.info
                : defaultDetail.info,
              release_notes: defaultDetail.release_notes,
              equity_chart: algo.equity_chart?.labels?.length > 0
                ? algo.equity_chart
                : defaultDetail.equity_chart,
            };
            setDetail(detailObj);
          } else {
            setError("Algorithm not found.");
          }
        } else {
          setError("Failed to load algorithms.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch algorithm:", err);
        setError("Failed to load algorithm data.");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading algorithm details...</p>
      </div>
    );
  }

  if (error || !algorithm || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-red-400">{error || "Algorithm not found."}</p>
      </div>
    );
  }

  return <AlgorithmDetailView algorithm={algorithm} detail={detail} />;
}
