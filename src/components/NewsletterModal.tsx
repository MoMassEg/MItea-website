"use client";

import React, { useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";
import {
  X,
  Mail,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Gift,
  Award
} from "lucide-react";

export default function NewsletterModal() {
  const { isGuildModalOpen, closeGuildModal, applyPromo, showToast } = useOrder();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isGuildModalOpen) {
        closeGuildModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGuildModalOpen, closeGuildModal]);

  if (!isGuildModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      applyPromo("GUILD10");
      showToast("🎉 VIP 10% Off Code applied to your order!", "success");
    }, 800);
  };

  const copyPromo = () => {
    navigator.clipboard?.writeText("GUILD10");
    setCopiedCode(true);
    showToast("Promo code GUILD10 copied!", "success");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={closeGuildModal}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border-2 border-accent-amber/40 shadow-2xl overflow-hidden animate-scaleUp p-6 sm:p-8 bg-gradient-to-b from-[#1F0C05] via-[#160703] to-[#0E0401] text-warm-50">
        {/* Luxury Gold Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-amber/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-60 h-60 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeGuildModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-warm-200 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-white/10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-amber/40 bg-accent-amber/10 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
            <span className="text-accent-amber text-[11px] font-heading font-extrabold tracking-widest uppercase">
              The Tea Guild &amp; VIP Reserve
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-editorial text-3xl sm:text-4xl text-warm-50 leading-tight">
            A private circle for <br />
            <span className="font-editorial-italic text-accent-amber">curious palates</span>.
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-warm-300 max-w-md mx-auto leading-relaxed font-light">
            Join over 12,000 tea purists across the Twin Cities. Unlock <strong className="font-semibold text-warm-100">10% off your inaugural order</strong>, secret seasonal releases 48h early, and private invites to single-origin tastings.
          </p>

          {/* Form / Success State */}
          <div className="mt-6 text-left">
            {status === "success" ? (
              <div className="p-5 rounded-2xl border border-accent-amber/50 bg-[#1A0A02] text-left transition-all animate-fadeIn">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-accent-amber/20 flex items-center justify-center text-accent-amber shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-warm-50 text-sm sm:text-base">
                      Welcome to the Guild!
                    </h4>
                    <p className="text-xs text-warm-300">
                      10% discount has been unlocked for <strong className="text-warm-100">{email}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-warm-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-accent-amber" />
                    <span className="text-xs text-warm-300">Promo Code:</span>
                    <span className="font-mono font-bold text-accent-amber bg-black/50 px-2 py-0.5 rounded border border-accent-amber/30 text-xs">
                      GUILD10
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={copyPromo}
                    className="text-xs font-bold text-[#120602] bg-gradient-to-r from-accent-amber to-amber-500 hover:from-accent-gold hover:to-amber-400 px-3.5 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    {copiedCode ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-warm-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Enter your email address..."
                    required
                    className="w-full bg-[#1A0904] text-warm-100 text-sm placeholder:text-warm-600 pl-11 pr-4 py-3.5 rounded-xl border border-warm-800 focus:border-accent-amber focus:ring-2 focus:ring-accent-amber/20 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-amber to-amber-500 hover:from-accent-gold hover:to-amber-400 text-[#120602] font-heading font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg hover:shadow-accent-amber/20 cursor-pointer disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <span className="inline-block w-4 h-4 border-2 border-[#120602] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Claim 10% Off</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {status === "error" && (
                  <p className="text-xs text-red-400 text-left pl-1">
                    {errorMsg}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
