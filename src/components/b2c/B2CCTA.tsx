export default function B2CCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-900/10 -z-10"></div>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Ready to put your portfolio on autopilot?
        </h2>
        <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
          Join thousands of traders who have automated their strategies with
          AlgoFinTech. Book a free call to see which algorithms fit your goals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-full text-base font-semibold transition-all shadow-lg">
            Book a Free Call
          </button>
          <button className="glass-card text-white hover:bg-white/5 px-8 py-4 rounded-full text-base font-semibold transition-all">
            View All Algorithms
          </button>
        </div>
      </div>
    </section>
  );
}
