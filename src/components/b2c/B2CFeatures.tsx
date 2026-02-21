import { Shield, Eye, Zap, Lock } from "lucide-react";

export default function B2CFeatures() {
  return (
    <section className="py-24 bg-[#030508] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6">
            YOUR MONEY, YOUR CONTROL
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Trade smarter, not <span className="text-blue-500">harder</span>.
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Our algorithms do the heavy lifting. You keep full custody of your
            funds, set your own risk limits, and can pause or disconnect at any time.
          </p>

          <div className="space-y-6">
            <Feature
              icon={<Lock className="text-blue-500 w-5 h-5" />}
              title="You Keep Full Custody"
              desc="Your funds never leave your broker. We connect via read/trade API — no withdrawal access, ever."
            />
            <Feature
              icon={<Shield className="text-blue-500 w-5 h-5" />}
              title="Built-In Risk Management"
              desc="Set max drawdown, daily loss limits, and position sizing. The algo respects your rules automatically."
            />
            <Feature
              icon={<Eye className="text-blue-500 w-5 h-5" />}
              title="Full Transparency"
              desc="See every trade in real time. Full trade history, entry/exit prices, and performance breakdowns — nothing hidden."
            />
            <Feature
              icon={<Zap className="text-blue-500 w-5 h-5" />}
              title="Pause Anytime"
              desc="One click to pause or disconnect an algorithm. You're always in control of what trades and when."
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full"></div>
          <div className="relative glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <div className="text-sm text-slate-400">Your Portfolio Summary</div>
                <div className="text-3xl font-bold text-white">$38,420.00</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-green-400 text-sm font-semibold">+$13,420</span>
                <span className="text-[10px] text-slate-500">All-time return</span>
              </div>
            </div>

            <div className="space-y-3">
              <AccountRow
                broker="Tradovate"
                gradient="from-blue-500 to-cyan-600"
                balance="$18,240"
                algos="2 active"
                status="Connected"
              />
              <AccountRow
                broker="MetaTrader 5"
                gradient="from-purple-500 to-indigo-600"
                balance="$12,180"
                algos="1 active"
                status="Connected"
              />
              <AccountRow
                broker="Binance"
                gradient="from-yellow-500 to-orange-600"
                balance="$8,000"
                algos="1 active"
                status="Connected"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Win Rate</div>
                  <div className="text-sm font-semibold text-white">72.4%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Trade</div>
                  <div className="text-sm font-semibold text-emerald-400">+$58.20</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Max DD</div>
                  <div className="text-sm font-semibold text-white">-4.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <h4 className="text-white font-semibold text-lg">{title}</h4>
        <p className="text-slate-500 text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

function AccountRow({ broker, gradient, balance, algos, status }: { broker: string; gradient: string; balance: string; algos: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
          {broker[0]}
        </div>
        <div>
          <div className="text-white text-sm font-medium">{broker}</div>
          <div className="text-slate-500 text-xs">{algos}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white text-sm font-medium">{balance}</div>
        <div className="text-green-400 text-xs font-medium">{status}</div>
      </div>
    </div>
  );
}
