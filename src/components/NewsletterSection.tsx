"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Gift } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

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
    }, 900);
  };

  const copyPromo = () => {
    navigator.clipboard?.writeText("GUILD15");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <section id="the-guild" className="relative py-20 lg:py-28 overflow-hidden scroll-mt-24" style={{ background: "#120602" }}>
      {/* Ambient background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-25 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #D4903A 0%, #6B3010 60%, transparent 80%)" }}
      />

      {/* Editorial Watermark */}
      <div className="absolute right-6 -bottom-10 select-none pointer-events-none opacity-[0.03] text-warm-100 font-editorial text-[180px] leading-none font-bold">
        MITEA
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="border border-warm-900/60 rounded-3xl p-8 sm:p-12 lg:p-16 backdrop-blur-sm" style={{ background: "linear-gradient(145deg, rgba(38,16,6,0.7) 0%, rgba(18,6,2,0.9) 100%)" }}>
          
          <div className="max-w-3xl mx-auto text-center">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-amber/30 mb-6" style={{ background: "rgba(212,144,58,0.08)" }}>
              <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
              <span className="text-accent-amber text-xs font-bold tracking-widest uppercase">
                The Tea Guild & VIP Reserve
              </span>
            </div>

            {/* Editorial Heading */}
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-warm-50 font-normal leading-tight tracking-tight">
              A private circle for <br className="hidden sm:block" />
              <span className="font-editorial-italic text-accent-amber">curious palates</span>.
            </h2>

            <p className="mt-5 text-sm sm:text-base text-warm-300 max-w-xl mx-auto leading-relaxed font-light">
              Join over 12,000 tea purists across the Twin Cities. Unlock <strong className="font-semibold text-warm-100">15% off your inaugural order</strong>, secret seasonal releases 48h early, and private invites to single-origin tastings.
            </p>

            {/* Email form */}
            <div className="mt-8 max-w-lg mx-auto">
              {status === "success" ? (
                <div className="p-6 rounded-2xl border border-accent-amber/40 bg-[#1A0A02] text-left transition-all animate-fadeIn">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-accent-amber/20 flex items-center justify-center text-accent-amber">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-warm-50 text-base">
                        Welcome to the Guild
                      </h4>
                      <p className="text-xs text-warm-300">
                        We sent your private tasting guide to <strong className="text-warm-100">{email}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-warm-900 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-accent-amber" />
                      <span className="text-xs text-warm-300">Your Welcome Code:</span>
                      <span className="font-mono font-bold text-accent-amber bg-brand-900 px-2 py-0.5 rounded border border-accent-amber/30 text-xs">
                        GUILD15
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={copyPromo}
                      className="text-xs font-bold text-warm-100 bg-brand-700 hover:bg-brand-600 px-3 py-1.5 rounded-lg border border-warm-800 transition-colors cursor-pointer"
                    >
                      {copiedCode ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <div className="relative flex-grow">
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
                      className="w-full bg-[#1A0904] text-warm-100 text-sm placeholder:text-warm-600 pl-11 pr-4 py-3.5 rounded-xl border border-warm-900 focus:border-accent-amber focus:ring-2 focus:ring-accent-amber/20 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center gap-2 bg-accent-amber hover:bg-accent-gold text-[#120602] font-heading font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-accent-amber/20 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {status === "loading" ? (
                      <span className="inline-block w-4 h-4 border-2 border-[#120602] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Claim 15% Off</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {status === "error" && (
                <p className="mt-2 text-xs text-red-400 text-left pl-2">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Trust points */}
            <div className="mt-8 pt-8 border-t border-warm-900/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-warm-100">Zero Spam Ever</h5>
                  <p className="text-[11px] text-warm-400 mt-0.5">Only curated brew drops and member perks. 1-click unsubscribe.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Gift className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-warm-100">Birthday Reserve</h5>
                  <p className="text-[11px] text-warm-400 mt-0.5">Complimentary handcrafted drink during your birth month.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-warm-100">VIP Masterclasses</h5>
                  <p className="text-[11px] text-warm-400 mt-0.5">Invitations to cupping sessions with Taiwanese tea masters.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
