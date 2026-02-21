import { Link2, Cpu, BarChart3, Shield } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: <Link2 className="text-blue-500 w-5 h-5" />,
    title: "Connect Your Broker",
    desc: "Link your Tradovate, MT4/5, Schwab, or crypto exchange account in under 2 minutes. Your funds never leave your broker.",
  },
  {
    num: "02",
    icon: <Cpu className="text-blue-500 w-5 h-5" />,
    title: "Pick Your Algorithms",
    desc: "Browse our library of institutional-grade algos. Choose from Crypto, Forex, Futures, or Stock strategies based on your goals.",
  },
  {
    num: "03",
    icon: <Shield className="text-blue-500 w-5 h-5" />,
    title: "Set Your Risk",
    desc: "Configure max drawdown, daily loss limits, and position sizing. You stay in full control of your capital at all times.",
  },
  {
    num: "04",
    icon: <BarChart3 className="text-blue-500 w-5 h-5" />,
    title: "Watch It Trade",
    desc: "Your algos execute trades automatically. Track every position, P&L, and performance metric in real time from your dashboard.",
  },
];

export default function B2CHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#030508] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6">
            SIMPLE SETUP
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Start automated trading in <span className="text-blue-500">4 steps</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            No coding required. No complicated setup. Connect your existing
            broker account and our algorithms handle the rest.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%+0.5rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-white/10 to-transparent z-0"></div>
              )}
              <div className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 relative z-10 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
                    {step.icon}
                  </div>
                  <span className="text-3xl font-bold text-white/10">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
