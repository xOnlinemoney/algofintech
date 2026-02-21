export default function B2CBrokers() {
  const brokers = [
    { name: "Tradovate", markets: "Futures", status: "Full Support" },
    { name: "MetaTrader 4", markets: "Forex", status: "Full Support" },
    { name: "MetaTrader 5", markets: "Forex & Stocks", status: "Full Support" },
    { name: "Schwab", markets: "Stocks & Futures", status: "Full Support" },
    { name: "Binance", markets: "Crypto", status: "Full Support" },
    { name: "Bybit", markets: "Crypto", status: "Full Support" },
  ];

  return (
    <section id="brokers" className="py-24 border-t border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-4">
            Integrations
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
            Connect your existing broker
          </h2>
          <p className="text-slate-400 text-lg">
            Your money stays in your account. We just send the trade signals.
            No withdrawals, no transfers — you keep full custody.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {brokers.map((b) => (
            <div
              key={b.name}
              className="glass-card rounded-xl p-6 hover:-translate-y-1 transition-transform duration-300 text-center group"
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:border-blue-500/30 transition-colors">
                <span className="text-xl font-bold text-white">{b.name[0]}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{b.name}</h3>
              <p className="text-[11px] text-slate-500 mb-2">{b.markets}</p>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-green-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {b.status}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-slate-500">
            Don&apos;t see your broker?{" "}
            <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Request an integration
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
