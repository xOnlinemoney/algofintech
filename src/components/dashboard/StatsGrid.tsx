import { Users, DollarSign, TrendingUp, BarChart3 } from "lucide-react";

const stats = [
  {
    label: "Active Clients",
    value: "0",
    icon: Users,
    sublabel: "No clients yet",
  },
  {
    label: "Total AUM",
    value: "$0",
    icon: DollarSign,
    sublabel: "Assets under management",
  },
  {
    label: "P&L",
    value: "$0",
    icon: TrendingUp,
    sublabel: "Profit & Loss",
  },
  {
    label: "Active Positions",
    value: "0",
    icon: BarChart3,
    sublabel: "No open positions",
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
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              {stat.label}
            </div>
            <stat.icon className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-semibold text-white tracking-tight mb-2">
            {stat.value}
          </div>
          <div className="text-xs text-slate-500">
            {stat.sublabel}
          </div>
        </div>
      ))}
    </div>
  );
}
