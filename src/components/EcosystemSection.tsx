import { Infinity as InfinityIcon } from "lucide-react";

const companies = [
  { label: "Alpha", icon: "A", left: "16.6%" },
  { label: "Quant", icon: "Q", left: "30%" },
  { label: "Global", icon: "globe", left: "43.3%" },
  { label: "North", icon: "arrow", left: "56.6%" },
  { label: "Sigma", icon: "S", left: "70%" },
  { label: "Blue", icon: "B", left: "83.3%" },
];

const paths = [
  { d: "M450 380 C 450 250, 150 250, 150 90", dur: "4s" },
  { d: "M450 380 C 450 250, 270 250, 270 90", dur: "3.5s" },
  { d: "M450 380 C 450 250, 390 200, 390 90", dur: "3s" },
  { d: "M450 380 C 450 250, 510 200, 510 90", dur: "3.2s" },
  { d: "M450 380 C 450 250, 630 250, 630 90", dur: "3.8s" },
  { d: "M450 380 C 450 250, 750 250, 750 90", dur: "4.2s" },
];

export default function EcosystemSection() {
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-4">
            Ecosystem
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4 leading-tight">
            Powering the next generation of Algorithmic Trading Firms
          </h2>
        </div>

        <div className="relative w-full max-w-5xl mx-auto h-[450px]">
          {/* Connection Lines SVG */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 900 450"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="connectGradient"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
              <filter
                id="glow-particle"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {paths.map((p, i) => (
              <g key={i}>
                <path
                  d={p.d}
                  stroke="url(#connectGradient)"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.3"
                />
                <circle r="3" fill="#60a5fa" filter="url(#glow-particle)">
                  <animateMotion
                    dur={p.dur}
                    repeatCount="indefinite"
                    path={p.d}
                    keyPoints="0;1"
                    keyTimes="0;1"
                    calcMode="linear"
                  />
                </circle>
              </g>
            ))}
          </svg>

          {/* Top Companies */}
          {companies.map((c) => (
            <div
              key={c.label}
              className="absolute top-[8%] -translate-x-1/2 flex flex-col items-center gap-2 hover:-translate-y-1 transition-transform duration-300"
              style={{ left: c.left }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#0B0E14] border border-white/10 flex items-center justify-center shadow-lg shadow-blue-500/10 hover:border-blue-500/50 hover:shadow-blue-500/20 transition-all">
                <span className="text-lg font-semibold text-white">
                  {c.icon === "globe" || c.icon === "arrow"
                    ? c.icon === "globe"
                      ? "+"
                      : "^"
                    : c.icon}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-[#0B0E14]/80 px-2 py-0.5 rounded border border-white/5 backdrop-blur-sm">
                {c.label}
              </span>
            </div>
          ))}

          {/* Bottom Logo */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[-20%] z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-2xl border border-blue-500/30 flex items-center justify-center shadow-[0_0_60px_-15px_rgba(59,130,246,0.6)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10"></div>
              <InfinityIcon className="text-blue-400 relative z-10 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] w-10 h-10" />
            </div>
            <div className="mt-4 flex flex-col items-center">
              <span className="text-lg font-bold text-white tracking-tight">
                AlgoFintech
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase mt-1">
                Core Infrastructure
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
