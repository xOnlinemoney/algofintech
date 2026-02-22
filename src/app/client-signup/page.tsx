"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  User,
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

export default function ClientSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [keyMessage, setKeyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Format license key as user types (auto-insert dashes) ──
  function handleKeyChange(raw: string) {
    // Strip everything except alphanumerics
    const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 16);
    // Insert dashes every 4 chars
    const parts = clean.match(/.{1,4}/g) || [];
    const formatted = parts.join("-");
    setLicenseKey(formatted);
  }

  // ── Validate license key once fully entered (16 chars = XXXX-XXXX-XXXX-XXXX) ──
  const validateKey = useCallback(async (key: string) => {
    setKeyStatus("checking");
    setKeyMessage("");
    try {
      const res = await fetch("/api/validate-license-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: key }),
      });
      const json = await res.json();
      if (json.valid) {
        setKeyStatus("valid");
        setKeyMessage(json.message || "License key is valid.");
      } else {
        setKeyStatus("invalid");
        setKeyMessage(json.message || "Invalid license key.");
      }
    } catch {
      setKeyStatus("invalid");
      setKeyMessage("Unable to verify key. Please try again.");
    }
  }, []);

  // Watch license key — validate when fully entered
  useEffect(() => {
    const stripped = licenseKey.replace(/-/g, "");
    if (stripped.length === 16) {
      validateKey(licenseKey);
    } else {
      // Reset if user edits after entering full key
      if (keyStatus !== "idle") {
        setKeyStatus("idle");
        setKeyMessage("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseKey, validateKey]);

  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (keyStatus !== "valid") return;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/client-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
          license_key: licenseKey,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        try {
          localStorage.setItem(
            "client_session",
            JSON.stringify({
              client_id: data.client?.client_id || "",
              client_name: data.client?.name || `${firstName.trim()} ${lastName.trim()}`,
              client_email: data.client?.email || email.trim(),
              agency_name: data.client?.agency_name || "",
            })
          );
        } catch {
          /* ignore */
        }
        window.location.href = "/client-dashboard";
      } else {
        setSubmitError(data.error || "Signup failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const keyBorderColor =
    keyStatus === "valid"
      ? "border-emerald-500/50 focus-within:border-emerald-500/50 focus-within:ring-emerald-500/50"
      : keyStatus === "invalid"
        ? "border-red-500/50 focus-within:border-red-500/50 focus-within:ring-red-500/50"
        : "border-white/10 focus-within:border-blue-500/50 focus-within:ring-blue-500/50";

  return (
    <div className="h-full flex flex-col items-center justify-center min-h-screen overflow-hidden relative bg-[#020408] selection:bg-blue-500/30 selection:text-blue-200">
      {/* Ambient Background Effects */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Centered Container */}
      <div className="w-full max-w-[440px] px-6 relative z-10">
        {/* Signup Card */}
        <div className="bg-[#050609] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Card Top Decoration */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Signup Header */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-white tracking-tight mb-2">
              Create Your Account
            </h1>
            <p className="text-xs text-slate-400">
              Enter your details and license key to get started.
            </p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
              {submitError}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="firstName"
                  className="block text-xs font-medium text-slate-300 ml-1"
                >
                  First Name<span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full rounded-lg bg-[#0B0E14] border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="lastName"
                  className="block text-xs font-medium text-slate-300 ml-1"
                >
                  Last Name<span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full rounded-lg bg-[#0B0E14] border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="block text-xs font-medium text-slate-300 ml-1"
              >
                Email Address<span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg bg-[#0B0E14] border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-password"
                className="block text-xs font-medium text-slate-300 ml-1"
              >
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="signup-password"
                  name="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg bg-[#0B0E14] border border-white/10 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* License Key Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="licenseKey"
                className="block text-xs font-medium text-slate-300 ml-1"
              >
                License Key<span className="text-red-500">*</span>
              </label>
              <div className={`relative group rounded-lg ${keyBorderColor}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  {keyStatus === "checking" ? (
                    <Loader2
                      className="w-4 h-4 animate-spin text-blue-400"
                      strokeWidth={1.5}
                    />
                  ) : keyStatus === "valid" ? (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-400"
                      strokeWidth={1.5}
                    />
                  ) : keyStatus === "invalid" ? (
                    <XCircle
                      className="w-4 h-4 text-red-400"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </div>
                <input
                  type="text"
                  id="licenseKey"
                  name="licenseKey"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  maxLength={19}
                  className={`block w-full rounded-lg bg-[#0B0E14] border ${keyBorderColor} pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all shadow-sm font-mono tracking-wider uppercase`}
                  required
                />
                {/* Status indicator on right */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {keyStatus === "checking" && (
                    <span className="text-[10px] text-blue-400 font-medium">
                      Checking...
                    </span>
                  )}
                  {keyStatus === "valid" && (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-400"
                      strokeWidth={2}
                    />
                  )}
                  {keyStatus === "invalid" && (
                    <XCircle
                      className="w-4 h-4 text-red-400"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </div>
              {/* Key validation message */}
              {keyMessage && (
                <p
                  className={`text-[11px] ml-1 ${
                    keyStatus === "valid"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {keyMessage}
                </p>
              )}
              <p className="text-[11px] text-slate-600 ml-1">
                Enter the license key provided by your agency.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                submitting ||
                keyStatus !== "valid" ||
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim() ||
                !password.trim()
              }
              className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050609] focus:ring-blue-500 transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:shadow-none mt-2"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Already have an account link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <a
                href="/client-login"
                className="font-medium text-blue-500 hover:text-blue-400 transition-colors hover:underline"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-600 select-none opacity-80 hover:opacity-100 transition-opacity">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Secure 256-bit Encryption
            </span>
          </div>

          <div className="flex gap-4 text-[11px] text-slate-600">
            <a
              href="#"
              className="hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-slate-700">&bull;</span>
            <a
              href="#"
              className="hover:text-slate-400 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
