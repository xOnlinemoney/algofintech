import { MonitorCheck, ShieldCheck, Wallet } from "lucide-react";

export default function WhyChooseSection() {
  return (
    <section id="features" className="py-24 bg-[#030508] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6">
            TURNKEY SOLUTION
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Everything you need to{" "}
            <span className="text-blue-500">scale</span> your trading firm.
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            We handle the backend, risk management, and algorithm maintenance.
            You focus on acquiring traders and growing your brand.
          </p>

          <div className="space-y-6">
            <Feature
              icon={<MonitorCheck className="text-blue-500 w-5 h-5" />}
              title="Custom Brand Portal"
              desc="Your logo, your domain, your rules. Clients never see AlgoStack."
            />
            <Feature
              icon={<ShieldCheck className="text-blue-500 w-5 h-5" />}
              title="Automated Risk Engine"
              desc="Set max drawdowns, daily loss limits, and profit targets automatically."
            />
            <Feature
              icon={<Wallet className="text-blue-500 w-5 h-5" />}
              title="Integrated Payments"
              desc="Accept Crypto, Stripe, and Bank Wires. Automated payouts to traders."
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full"></div>
          <div className="relative glass-card p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div>
                <div className="text-sm text-slate-400">
                  Total Revenue (This Month)
                </div>
                <div className="text-3xl font-bold text-white">
                  $284,920.00
                </div>
              </div>
              <div className="px-4 py-2 bg-blue-600 rounded-lg text-white text-sm font-medium">
                Withdraw
              </div>
            </div>

            <div className="space-y-4">
              <ClientRow
                initials="A"
                gradient="from-purple-500 to-indigo-600"
                name="Alpha Trading Co."
                plan="Enterprise Plan"
                status="Active"
                statusColor="text-green-400"
              />
              <ClientRow
                initials="Q"
                gradient="from-blue-500 to-cyan-600"
                name="Quant Capital"
                plan="Pro Plan"
                status="Active"
                statusColor="text-green-400"
              />
              <ClientRow
                initials="F"
                gradient="from-orange-500 to-red-600"
                name="FutureFlow Inc."
                plan="Starter Plan"
                status="Pending"
                statusColor="text-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-white font-semibold text-lg">{title}</h4>
        <p className="text-slate-500 text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

function ClientRow({
  initials,
  gradient,
  name,
  plan,
  status,
  statusColor,
}: {
  initials: string;
  gradient: string;
  name: string;
  plan: string;
  status: string;
  statusColor: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white font-bold text-xs`}
        >
          {initials}
        </div>
        <div>
          <div className="text-white text-sm font-medium">{name}</div>
          <div className="text-slate-500 text-xs">{plan}</div>
        </div>
      </div>
      <div className={`${statusColor} text-sm font-medium`}>{status}</div>
    </div>
  );
}
