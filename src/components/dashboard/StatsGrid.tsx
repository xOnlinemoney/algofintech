import { TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Active Clients",
    value: "847",
    change: "+24",
    changeLabel: "this month",
    changeType: "up" as const,
  },
  {
    label: "Total AUM",
    value: "$2.4B",
    change: "+18.3%",
    changeLabel: "vs last quarter",
    changeType: "up" as const,
  },
  {
    label: "P&L",
    value: "+$42.8M",
    change: "+12.7%",
    changeLabel: "YTD",
    changeType: "up" as const,
  },
  {
    label: "Active Positions",
    value: "1,284",
    changeTags: ["892 Long", "392 Short"],
    changeType: "neutral" as const,
  },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 shrink-0">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-5 rounded-xl border border-white/5 bg-[#13161C] hover:border-white/10 transition-colors"
        >
          <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
            {stat.label}
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight mb-2">
            {stat.value}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {stat.changeType === "up" && (
              <>
                <span className="text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium text-xs">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
                <span className="text-slate-500 text-xs">{stat.changeLabel}</span>
              </>
            )}
            {stat.changeTags &&
              stat.changeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-medium text-xs"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
