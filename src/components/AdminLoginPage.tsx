"use client";

import { useState } from "react";
import { Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        try {
          localStorage.setItem(
            "admin_session",
            JSON.stringify({
              name: data.admin?.name || "Admin",
              email: data.admin?.email || email.trim(),
            })
          );
        } catch {
          /* ignore */
        }
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center min-h-screen overflow-hidden relative bg-[#020408] selection:bg-blue-500/30 selection:text-blue-200">
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[440px] px-6 relative z-10">
        <div className="bg-[#050609] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-white tracking-tight mb-2">Admin Portal Login</h1>
            <p className="text-xs text-slate-400">Enter your credentials to access the admin dashboard.</p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@algofintech.com" className="block w-full rounded-lg bg-[#0B0E14] border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="block w-full rounded-lg bg-[#0B0E14] border border-white/10 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                  {showPassword ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-[#0B0E14] text-blue-600 focus:ring-blue-500/50 focus:ring-offset-0" />
                <span className="ml-2 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">Forgot password?</a>
            </div>

            <button type="submit" disabled={submitting} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050609] focus:ring-blue-500 transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-600 select-none opacity-80 hover:opacity-100 transition-opacity">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Secure 256-bit Encryption</span>
          </div>
          <div className="flex gap-4 text-[11px] text-slate-600">
            <a href="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <span className="text-slate-700">&bull;</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}
