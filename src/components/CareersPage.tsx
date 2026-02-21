"use client";

import { useState } from "react";
import {
  ArrowRight,
  Target,
  Rocket,
  Globe,
  TrendingUp,
  Users,
  Scale,
  ChevronDown,
  Heart,
  DollarSign,
  Sun,
  Check,
  Code,
} from "lucide-react";

const whyCards = [
  {
    icon: Target,
    color: "pink",
    title: "Impact-Driven Work",
    description:
      "You\u2019re not building trivial features\u2014you\u2019re democratizing access to institutional trading technology for thousands of users.",
    footer: (
      <div className="border-t border-white/5 pt-4">
        <p className="text-xs text-slate-500 italic">
          &ldquo;Knowing code I write helps people achieve financial goals is
          incredibly fulfilling.&rdquo; &mdash; Sarah, Senior Dev
        </p>
      </div>
    ),
  },
  {
    icon: Rocket,
    color: "blue",
    title: "Modern Tech Stack",
    description:
      "Node.js, React, Python, C++, AWS, Kubernetes. Work on low-latency systems, distributed architectures, and AI.",
    footer: (
      <div className="flex gap-2 flex-wrap">
        {["AWS", "Rust", "React"].map((t) => (
          <span
            key={t}
            className="px-2 py-1 rounded bg-white/5 text-[10px] text-slate-400"
          >
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: Globe,
    color: "emerald",
    title: "Work From Anywhere",
    description:
      "We are remote-first from day one. Work from home, a co-working space, or anywhere with reliable internet.",
    footer: (
      <ul className="space-y-1">
        {["Async communication", "Home office budget"].map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-xs text-slate-500"
          >
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: TrendingUp,
    color: "amber",
    title: "Continuous Learning",
    description:
      "$2,000 annual learning budget per employee, conference attendance, and mentorship programs.",
  },
  {
    icon: Users,
    color: "purple",
    title: "No Egos, Just Team",
    description:
      "A diverse team from 15+ countries. We value transparency, flat hierarchy, and collaborative decision making.",
  },
  {
    icon: Scale,
    color: "cyan",
    title: "Respect For Time",
    description:
      "No crunch culture. We believe in sustainable pace, deep work blocks, and taking vacation without guilt.",
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  pink: { bg: "bg-pink-500/10", text: "text-pink-500" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500" },
};

interface JobRole {
  title: string;
  hot?: boolean;
  department: string;
  deptIcon: "users" | "code" | "growth";
  location: string;
  salary: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
}

const jobs: JobRole[] = [
  {
    title: "Customer Support Specialist",
    department: "Customer Success",
    deptIcon: "users",
    location: "Remote (US/EU)",
    salary: "$45k - $65k",
    description:
      "Be the voice of AlgoFintech. You\u2019ll help our agency partners and their clients succeed by providing world-class support, troubleshooting technical issues, and ensuring every customer interaction is positive.",
    responsibilities: [
      "Respond to customer inquiries via email, chat, and phone",
      "Troubleshoot platform issues and guide users through solutions",
    ],
    requirements: [
      "Excellent written and verbal communication skills",
      "Problem-solving ability and technical aptitude",
    ],
  },
  {
    title: "Quantitative Developer",
    hot: true,
    department: "Engineering",
    deptIcon: "code",
    location: "Remote (Global)",
    salary: "$100k - $180k + Equity",
    description:
      "Design, develop, and optimize algorithmic trading strategies across multiple asset classes. You\u2019ll work on cutting-edge quantitative systems that manage billions in trading volume.",
    responsibilities: [
      "Develop and optimize algorithmic trading strategies",
      "Backtest strategies using historical data",
    ],
    requirements: [
      "Strong programming skills: Python, C++, or C#",
      "Deep understanding of quantitative finance",
    ],
  },
  {
    title: "Partnerships Assistant",
    department: "Growth",
    deptIcon: "growth",
    location: "Remote (US)",
    salary: "$50k - $70k",
    description:
      "Support our partnerships team in onboarding new agency partners, managing relationships, and ensuring partner success.",
  },
];

const comingSoonRoles = [
  "Senior Full-Stack Developer",
  "DevOps Engineer",
];

const hiringSteps = [
  { num: "1", title: "Application", desc: "We review every application. No bots.", highlight: false },
  { num: "2", title: "Screening", desc: "30 min call to discuss background & role.", highlight: false },
  { num: "3", title: "Assessment", desc: "Practical take-home task. No whiteboards.", highlight: false },
  { num: "4", title: "Interviews", desc: "Meet the team and deep dive into skills.", highlight: false },
  { num: "5", title: "Offer", desc: "Transparent competitive offer.", highlight: true },
];

const faqs = [
  {
    q: "Is the company fully remote?",
    a: "Yes, we\u2019re remote-first and always will be. We have no physical offices\u2014everyone works remotely from wherever they\u2019re most productive.",
  },
  {
    q: "Do you hire internationally?",
    a: "Yes! We hire globally, though some roles may require overlap with specific time zones (usually US or EU). Check individual job postings for location requirements.",
  },
  {
    q: "What equipment do you provide?",
    a: "We provide the latest MacBook Pro or high-spec PC, multiple monitors, and a $1,500 home office setup budget. We want you to have the tools to do your best work.",
  },
  {
    q: "How does career advancement work?",
    a: "We have clear career ladders, regular performance reviews, and transparent promotion criteria. We strongly believe in promoting from within\u201440% of our current management started in junior roles.",
  },
];

const mapDots = [
  { top: "30%", left: "20%", title: "USA (West)", delay: "" },
  { top: "35%", left: "28%", title: "USA (East)", delay: "delay-75" },
  { top: "25%", left: "48%", title: "UK", delay: "delay-100" },
  { top: "30%", left: "52%", title: "Germany", delay: "delay-150" },
  { top: "45%", left: "75%", title: "Singapore", delay: "delay-200" },
  { top: "80%", left: "85%", title: "Australia", delay: "delay-300" },
];

export default function CareersPage() {
  const [openJob, setOpenJob] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const DeptIcon = ({ type }: { type: string }) => {
    if (type === "code") return <Code className="w-3 h-3" />;
    if (type === "growth") return <Users className="w-3 h-3" />;
    return <Users className="w-3 h-3" />;
  };

  return (
    <div className="bg-[#020408] text-slate-400">
      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5">
        {/* Grid BG */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] pointer-events-none opacity-30 bg-[radial-gradient(circle,rgba(168,85,247,0.15),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] blur-[120px] pointer-events-none opacity-20 bg-[radial-gradient(circle,rgba(6,182,212,0.15),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/30 border border-purple-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-medium text-purple-400 tracking-wide uppercase">
                  We are hiring
                </span>
              </div>

              <h1 className="text-4xl md:text-7xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
                Build the Future of <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                  Algorithmic Trading
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-light">
                Join our team of innovators transforming how agencies and traders
                access institutional-grade algorithms. We&apos;re a fast-growing
                fintech empowering 500+ agencies worldwide.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 border-y border-white/5 py-6">
                {[
                  { val: "50+", label: "Team Members" },
                  { val: "500+", label: "Partners" },
                  { val: "$2B+", label: "Volume" },
                  { val: "100%", label: "Remote" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-mono text-white mb-1">
                      {s.val}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#open-roles"
                  className="px-8 py-3.5 bg-white text-black hover:bg-slate-200 rounded-lg font-medium transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                >
                  View Open Positions
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#culture"
                  className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all"
                >
                  Learn About Culture
                </a>
              </div>
            </div>

            {/* Visual */}
            <div className="flex-1 w-full relative h-[400px] lg:h-[600px] hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-3xl -z-10 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-2xl rotate-3 backdrop-blur-sm bg-white/[0.01]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-2xl -rotate-3 backdrop-blur-sm bg-white/[0.01]" />

              {/* Floating Team Cards */}
              <div
                className="absolute top-[20%] right-[10%] p-4 rounded-xl shadow-2xl border border-white/5 bg-[rgba(11,14,20,0.6)] backdrop-blur-xl"
                style={{ animation: "float 6s ease-in-out infinite" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                  <div>
                    <div className="h-2 w-20 bg-white/20 rounded mb-2" />
                    <div className="h-2 w-12 bg-white/10 rounded" />
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-[25%] left-[10%] p-4 rounded-xl shadow-2xl border border-white/5 bg-[rgba(11,14,20,0.6)] backdrop-blur-xl"
                style={{ animation: "float 5s ease-in-out infinite 1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" />
                  <div>
                    <div className="h-2 w-24 bg-white/20 rounded mb-2" />
                    <div className="h-2 w-16 bg-white/10 rounded" />
                  </div>
                </div>
              </div>

              <div
                className="absolute top-[40%] left-[40%] p-4 rounded-xl shadow-2xl border border-white/5 bg-[rgba(11,14,20,0.6)] backdrop-blur-xl z-10"
                style={{ animation: "float 7s ease-in-out infinite 0.5s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" />
                  <div>
                    <div className="h-2 w-20 bg-white/20 rounded mb-2" />
                    <div className="h-2 w-10 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why AlgoFintech ─── */}
      <section className="py-24 bg-[#050609]" id="culture">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Why Work at AlgoFintech?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              More than just a job&mdash;be part of something transformative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyCards.map((card) => {
              const Icon = card.icon;
              const c = colorMap[card.color];
              return (
                <div
                  key={card.title}
                  className="p-8 rounded-2xl group hover:bg-white/[0.02] bg-[rgba(11,14,20,0.6)] backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-0.5"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center mb-6 ${c.text} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {card.description}
                  </p>
                  {card.footer}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Open Positions ─── */}
      <section
        className="py-24 bg-[#020408] border-t border-white/5"
        id="open-roles"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">
                Current Openings
              </h2>
              <p className="text-slate-400">
                Join our team&mdash;we&apos;re actively hiring for these roles.
              </p>
            </div>
            <div className="hidden md:block text-sm text-slate-500">
              Showing {jobs.length} of 8 positions
            </div>
          </div>

          <div className="space-y-4">
            {jobs.map((job, idx) => {
              const isOpen = openJob === idx;
              return (
                <div
                  key={job.title}
                  className={`group bg-[#0B0E14] border rounded-2xl overflow-hidden transition-colors ${
                    isOpen
                      ? "border-purple-500/30"
                      : "border-white/5 hover:border-purple-500/30"
                  }`}
                >
                  <button
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 w-full text-left cursor-pointer"
                    onClick={() => setOpenJob(isOpen ? null : idx)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-medium text-white group-hover:text-purple-400 transition-colors">
                          {job.title}
                        </h3>
                        {job.hot && (
                          <span className="text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                            Hot
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <DeptIcon type={job.deptIcon} />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                      <span className="text-sm font-medium text-white bg-white/5 px-3 py-1.5 rounded-full">
                        {job.salary}
                      </span>
                      <span className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 text-slate-400">
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-white/5 mt-2 pt-6 animate-[sweep_0.3s_ease-in-out]">
                      <p className="text-slate-300 mb-6 leading-relaxed">
                        {job.description}
                      </p>
                      {(job.responsibilities || job.requirements) && (
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                          {job.responsibilities && (
                            <div>
                              <h4 className="text-white font-medium text-sm uppercase tracking-wide mb-3">
                                Responsibilities
                              </h4>
                              <ul className="space-y-2 text-sm text-slate-400">
                                {job.responsibilities.map((r) => (
                                  <li key={r}>&bull; {r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {job.requirements && (
                            <div>
                              <h4 className="text-white font-medium text-sm uppercase tracking-wide mb-3">
                                Requirements
                              </h4>
                              <ul className="space-y-2 text-sm text-slate-400">
                                {job.requirements.map((r) => (
                                  <li key={r}>&bull; {r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      <button className="bg-white text-black px-6 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                        Apply for this Role
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Coming Soon */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 select-none">
              {comingSoonRoles.map((role) => (
                <div
                  key={role}
                  className="p-4 border border-white/5 border-dashed rounded-xl flex justify-between items-center"
                >
                  <span className="text-sm text-slate-400">{role}</span>
                  <span className="text-xs px-2 py-1 rounded bg-white/5">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comprehensive Benefits ─── */}
      <section className="py-24 bg-[#020408] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Comprehensive Benefits
            </h2>
            <p className="text-slate-400">
              We take care of our team so you can do your best work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Health */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-pink-500/10 text-pink-500">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  Health &amp; Wellness
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "100% Medical, Dental, Vision (US)",
                  "Health stipend for Int'l team",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-slate-400"
                  >
                    <Check className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  Financial &amp; Growth
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Competitive global salaries",
                  "Equity / Stock options",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-slate-400"
                  >
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Lifestyle */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-amber-500/10 text-amber-500">
                  <Sun className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  Time &amp; Lifestyle
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Unlimited PTO (Min 3 weeks)",
                  "$1,500 Home Office Setup",
                ].map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 text-sm text-slate-400"
                  >
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Where We Work / Map ─── */}
      <section className="py-24 bg-[#050609] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundSize: "60px 60px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-purple-500 font-medium tracking-wide uppercase text-xs mb-2 block">
              Remote-First
            </span>
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-4">
              Where We Work
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We believe the best talent is everywhere. Our team spans 15+
              countries.
            </p>
          </div>

          {/* Abstract Map */}
          <div className="h-[400px] w-full border border-white/5 rounded-2xl bg-[#020408] relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(#475569 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {mapDots.map((dot) => (
              <div
                key={dot.title}
                className={`absolute w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7] group-hover:scale-110 transition-transform ${dot.delay}`}
                style={{ top: dot.top, left: dot.left }}
                title={dot.title}
              >
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-purple-500/50 rounded-full animate-ping" />
              </div>
            ))}

            <div className="absolute bottom-6 left-6 bg-[#0B0E14]/90 backdrop-blur border border-white/10 p-4 rounded-xl">
              <div className="text-sm font-medium text-white mb-1">
                Globally Distributed
              </div>
              <div className="text-xs text-slate-400">
                Team members in 15+ countries working asynchronously.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Hiring Process ─── */}
      <section className="py-24 bg-[#020408]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-white tracking-tight mb-12 text-center">
            Our Hiring Process
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Line connector desktop */}
            <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-white/5 -z-10" />

            {hiringSteps.map((step) => (
              <div
                key={step.num}
                className="bg-[#0B0E14] p-6 rounded-xl border border-white/5 relative"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium mb-4 text-sm z-10 relative ${
                    step.highlight
                      ? "bg-purple-600 border border-purple-500"
                      : "bg-[#020408] border border-white/10"
                  }`}
                >
                  {step.num}
                </div>
                <h4 className="text-white font-medium mb-2">{step.title}</h4>
                <p className="text-xs text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24 bg-[#050609] border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-white text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`bg-[#0B0E14] rounded-xl border overflow-hidden transition-colors ${
                    isOpen ? "border-purple-500/20" : "border-white/5"
                  }`}
                >
                  <button
                    className="flex items-center justify-between p-4 w-full font-medium text-white text-sm hover:bg-white/5 cursor-pointer"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    {faq.q}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-4 animate-[sweep_0.3s_ease-in-out]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14] to-[#020408]" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Application */}
            <div className="bg-[#0F1218] border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all">
              <h3 className="text-xl font-medium text-white mb-2">
                Don&apos;t see your dream job?
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                We&apos;re always looking for exceptional talent. Send us your
                resume and tell us how you can contribute.
              </p>
              <button className="w-full py-3 bg-white text-black rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors">
                Submit General Application
              </button>
            </div>

            {/* Referral */}
            <div className="bg-[#020408] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-medium text-white">
                  Know someone great?
                </h3>
                <span className="bg-purple-500/20 text-purple-400 text-[10px] uppercase font-bold px-2 py-1 rounded">
                  Earn $5,000
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Refer talented people to AlgoFintech and earn a bonus when they
                get hired.
              </p>
              <button className="w-full py-3 bg-white/5 text-white border border-white/10 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
                Submit a Referral
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-500 max-w-2xl mx-auto">
              AlgoFintech is an equal opportunity employer. We celebrate
              diversity and are committed to creating an inclusive environment
              for all employees. We do not discriminate based upon race,
              religion, color, national origin, gender, sexual orientation, age,
              or status.
            </p>
          </div>
        </div>
      </section>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes sweep {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
