"use client";

import React, { useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";
import { apiClient } from '@/lib/api-client';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const data = await apiClient.post<{ promoCode?: string }>("/api/newsletter/subscribe", { email: email.trim() });
      if (data.promoCode) {
        applyPromo(data.promoCode);
      }
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to subscribe. Please try again.");
    }
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
      <div className="relative z-10 w-full max-w-lg rounded-3xl border-2 border-[#DF9749]/40 shadow-2xl overflow-hidden animate-scaleUp p-6 sm:p-8 bg-white text-gray-900">
        {/* Luxury Coral/Amber Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DF9749]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-60 h-60 bg-[#F8847F]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeGuildModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all cursor-pointer z-20 border border-gray-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#DF9749]/40 bg-amber-50 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#DF9749]" />
            <span className="text-[#DF9749] text-[11px] font-heading font-extrabold tracking-widest uppercase">
              The Tea Guild &amp; VIP Reserve
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-editorial text-3xl sm:text-4xl text-gray-900 leading-tight">
            A private circle for <br />
            <span className="font-editorial-italic text-[#DF9749]">curious palates</span>.
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed font-normal">
            Join over 12,000 tea purists across the Twin Cities. Unlock <strong className="font-semibold text-gray-900">10% off your inaugural order</strong>, secret seasonal releases 48h early, and private invites to single-origin tastings.
          </p>

          {/* Form / Success State */}
          <div className="mt-6 text-left">
            {status === "success" ? (
              <div className="p-5 rounded-2xl border border-[#DF9749]/50 bg-amber-50/60 text-left transition-all animate-fadeIn">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#DF9749]/20 flex items-center justify-center text-[#DF9749] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-gray-900 text-sm sm:text-base">
                      Welcome to the Guild!
                    </h4>
                    <p className="text-xs text-gray-600">
                      10% discount has been unlocked for <strong className="text-gray-900">{email}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#DF9749]" />
                    <span className="text-xs text-gray-600">Promo Code:</span>
                    <span className="font-mono font-bold text-[#DF9749] bg-white px-2 py-0.5 rounded border border-amber-300 text-xs shadow-xs">
                      GUILD10
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={copyPromo}
                    className="text-xs font-bold text-black bg-gradient-to-r from-[#DF9749] to-amber-400 hover:brightness-105 px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    {copiedCode ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Enter your email address..."
                    required
                    className="w-full bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#DF9749] focus:ring-2 focus:ring-[#DF9749]/20 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#F8847F] hover:bg-[#F56B65] text-white font-heading font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Claim 10% Off</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {status === "error" && (
                  <p className="text-xs text-red-500 text-center font-medium mt-1">
                    Please enter a valid email address.
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
