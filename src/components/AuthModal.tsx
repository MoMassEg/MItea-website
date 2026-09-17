"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, Phone, Sparkles, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useOrder } from "@/context/OrderContext";

type AuthView = "signin" | "signup" | "forgot";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setCurrentUser, showToast } = useOrder();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [view, setView] = useState<AuthView>("signin");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setError(null);
    setForgotSuccess(false);
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setShowPassword(false);
  };

  const switchTab = (t: "signin" | "signup") => {
    setTab(t);
    setView(t);
    resetForm();
  };

  const goToForgot = () => {
    setView("forgot");
    setError(null);
    setForgotSuccess(false);
  };

  const goBackToSignIn = () => {
    setView("signin");
    setTab("signin");
    setError(null);
    setForgotSuccess(false);
  };

  // ─── Sign in / Sign up submit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === "signin") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to sign in");
        }

        setCurrentUser(data.user);
        const firstName = data.user.name?.split(' ')[0] || data.user.email;
        showToast(`Welcome back, ${firstName}! 🧋`, "success");
        closeAuthModal();
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, phone }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create account");
        }

        const firstName = name?.split(' ')[0] || data.user.email.split('@')[0];
        showToast(`Welcome to MiTea, ${firstName}! 🎉`, "success");
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: name || data.user.email.split("@")[0],
          role: "CUSTOMER",
        });
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot password submit ───────────────────────────────────────────────
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setForgotSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-warm-200 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />

          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {view === "forgot" ? (
            <>
              <button
                type="button"
                onClick={goBackToSignIn}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mb-3">
                <span className="text-2xl">🔐</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl tracking-tight">Forgot Password?</h2>
              <p className="text-white/80 text-xs mt-1">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mb-3">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>

              <h2 className="font-heading font-extrabold text-2xl tracking-tight">
                {tab === "signin" ? "Welcome Back to MiTea" : "Join the MiTea VIP Guild"}
              </h2>
              <p className="text-white/80 text-xs mt-1">
                {tab === "signin"
                  ? "Sign in to access your rewards, fast checkout, and order history"
                  : "Create an account to earn free drinks and exclusive members-only perks"}
              </p>

              {/* Tab Selector */}
              <div className="flex bg-black/20 p-1 rounded-2xl mt-5 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => switchTab("signin")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    tab === "signin"
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchTab("signup")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    tab === "signup"
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === "forgot" ? (
          <div className="p-6">
            {forgotSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-heading font-bold text-lg text-gray-800">Check Your Email</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If <strong>{email}</strong> has an account, we&apos;ve sent a password reset link.
                  Check your inbox (and spam folder) within a few minutes.
                </p>
                <button
                  onClick={goBackToSignIn}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-gray-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={goBackToSignIn}
                    className="text-xs text-gray-500 hover:text-brand-600 transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ── SIGN IN / SIGN UP VIEW ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {tab === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number (optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-gray-800"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-gray-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  Password
                </label>
                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={goToForgot}
                    className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {tab === "signup" && (
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Must be at least 6 characters
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === "signin" ? "Sign In" : "Create My Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-[11px] text-gray-500">
                By continuing, you agree to MiTea&apos;s Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
