const strategies = [
  {
    initials: "AS",
    name: "Alpha Scalp V2",
    aum: "$1.2M AUM",
    return30d: "+14.2%",
    colorBg: "bg-indigo-500/10",
    colorBorder: "border-indigo-500/20",
    colorText: "text-indigo-400",
    hoverColor: "group-hover:text-indigo-300",
    returnColor: "text-emerald-400",
  },
  {
    initials: "GT",
    name: "Gold Trend",
    aum: "$840k AUM",
    return30d: "+8.1%",
    colorBg: "bg-yellow-500/10",
    colorBorder: "border-yellow-500/20",
    colorText: "text-yellow-400",
    hoverColor: "group-hover:text-yellow-300",
    returnColor: "text-emerald-400",
  },
  {
    initials: "NN",
    name: "Neural Net Eq",
    aum: "$420k AUM",
    return30d: "+5.4%",
    colorBg: "bg-blue-500/10",
    colorBorder: "border-blue-500/20",
    colorText: "text-blue-400",
    hoverColor: "group-hover:text-blue-300",
    returnColor: "text-emerald-400",
  },
  {
    initials: "L",
    name: "Legacy Mix",
    aum: "$180k AUM",
    return30d: "+1.2%",
    colorBg: "bg-slate-500/10",
    colorBorder: "border-slate-500/20",
    colorText: "text-slate-300",
    hoverColor: "group-hover:text-slate-300",
    returnColor: "text-slate-400",
  },
];

export default function TopStrategies() {
  return (
    <div className="flex-1 bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-sm font-semibold text-white">Top Strategies</h3>
        <button className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar space-y-1 -mx-2 px-2">
        {strategies.map((s) => (
          <div
            key={s.name}
            className="group flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg ${s.colorBg} border ${s.colorBorder} flex items-center justify-center ${s.colorText} font-bold text-xs shrink-0`}
              >
                {s.initials}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-medium text-white ${s.hoverColor} transition-colors truncate`}>
                  {s.name}
                </div>
                <div className="text-[10px] text-slate-500">{s.aum}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-xs font-semibold ${s.returnColor}`}>{s.return30d}</div>
              <div className="text-[10px] text-slate-500">30d</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
