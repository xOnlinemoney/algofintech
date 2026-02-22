import { Cpu } from "lucide-react";
import Link from "next/link";

export default function TopStrategies() {
  return (
    <div className="flex-1 bg-[#13161C] border border-white/5 rounded-xl p-5 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-sm font-semibold text-white">Top Strategies</h3>
        <Link
          href="/dashboard/algorithms"
          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Browse Algorithms
        </Link>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-3">
          <Cpu className="w-5 h-5 text-slate-500" />
        </div>
        <p className="text-xs font-medium text-slate-400 mb-1">No strategies active</p>
        <p className="text-[11px] text-slate-600 max-w-[200px]">
          Add algorithms from the library to start tracking strategy performance.
        </p>
      </div>
    </div>
  );
}
