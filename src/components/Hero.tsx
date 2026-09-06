"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import {
  ArrowUp,
  Gift,
  Award,
  Sparkles,
  Clock,
  Leaf,
  ShieldCheck,
  MapPin,
} from "lucide-react";

export default function Hero() {
  const { setActiveCategory, openSendGiftModal, openRewardsModal, openLocationModal } = useOrder();

  const handleExplore = () => {
    setActiveCategory("all");
    document.getElementById("menu-sections")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="hero-outer relative overflow-hidden bg-[#100502]">
      {/* Dynamic atmospheric radial glows */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full pointer-events-none opacity-25 blur-[140px]"
        style={{ background: "radial-gradient(circle, #D4903A 0%, #6B3010 50%, transparent 75%)" }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #8B4513 0%, #2C1006 60%, transparent 80%)" }}
      />

      {/* Editorial Watermark background */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] text-warm-100 font-editorial text-[220px] sm:text-[300px] leading-none font-bold tracking-tighter">
        CRAFT
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        {/* Centered Editorial Content */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Cormorant Garamond Grand Title */}
          <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-warm-50 font-light leading-[1.06] tracking-tight">
            The art of the <br />
            <span className="font-editorial-italic font-normal text-accent-amber">
              perfectly steeped
            </span>{" "}
            cup.
          </h2>

          {/* Body Copy */}
          <p className="mt-6 text-sm sm:text-base lg:text-lg text-warm-300/90 leading-relaxed font-light max-w-2xl">
            Single-origin whole loose leaf teas from high-mountain Alishan and Uji, Kyoto. Slow-simmered Kokuto brown sugar pearls, fresh organic dairy, and handcrafted Pon de Ring mochi — brewed fresh to order every 4 hours in the Twin Cities.
          </p>

          {/* Quality Pillars - Centered */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 mb-8 w-full max-w-3xl">
            <div className="flex items-center justify-center gap-2 text-xs text-warm-200 bg-[#1A0802]/60 border border-warm-800/60 rounded-xl px-3.5 py-2.5">
              <Leaf className="w-4 h-4 text-accent-amber shrink-0" />
              <span className="font-medium">100% Whole Loose Leaf</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-warm-200 bg-[#1A0802]/60 border border-warm-800/60 rounded-xl px-3.5 py-2.5">
              <Clock className="w-4 h-4 text-accent-amber shrink-0" />
              <span className="font-medium">4-Hour Micro Steeping</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-warm-200 bg-[#1A0802]/60 border border-warm-800/60 rounded-xl px-3.5 py-2.5">
              <ShieldCheck className="w-4 h-4 text-accent-amber shrink-0" />
              <span className="font-medium">Organic Dairy &amp; Oat</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-warm-200 bg-[#1A0802]/60 border border-warm-800/60 rounded-xl px-3.5 py-2.5">
              <Sparkles className="w-4 h-4 text-accent-amber shrink-0" />
              <span className="font-medium">Daily Simmered Boba</span>
            </div>
          </div>

          {/* CTA Button Row - Centered */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExplore}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-accent-amber hover:bg-accent-gold text-[#120602] font-heading font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all shadow-xl hover:shadow-accent-amber/20 cursor-pointer"
            >
              <span>Explore Menu</span>
              <ArrowUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={openSendGiftModal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#1E0B04] hover:bg-[#2A1006] text-warm-100 border border-warm-800 font-heading font-bold text-xs sm:text-sm uppercase tracking-wider px-5 py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              <Gift className="w-4 h-4 text-accent-amber" />
              <span>Send Drink</span>
            </button>

            <button
              type="button"
              onClick={openRewardsModal}
              className="inline-flex items-center gap-1.5 text-xs text-warm-400 hover:text-accent-amber font-semibold uppercase tracking-wider px-3 py-2 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-accent-amber" />
              <span>Rewards Stamps</span>
            </button>
          </div>

          {/* Location Banner */}
          <div
            onClick={() => openLocationModal("pickup")}
            className="mt-8 pt-5 border-t border-warm-800/60 flex items-center justify-center gap-2 text-xs text-warm-400 hover:text-warm-200 cursor-pointer transition-colors group"
          >
            <MapPin className="w-3.5 h-3.5 text-accent-amber shrink-0 group-hover:scale-110 transition-transform" />
            <span>Flagship: 7724 Olson Mem Hwy, Golden Valley · <strong className="text-accent-amber">Pickup ready in 10–15 min</strong></span>
          </div>
        </div>
      </div>

      {/* Full-Width Metrics Strip */}
      <div className="border-t border-b border-warm-800/50 bg-[#0C0401]/90 backdrop-blur-md relative z-10 py-5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-accent-amber block">4.9 ★</span>
            <span className="text-[11px] text-warm-400 font-medium uppercase tracking-wider">2,400+ Verified Reviews</span>
          </div>

          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-accent-amber block">4 Locations</span>
            <span className="text-[11px] text-warm-400 font-medium uppercase tracking-wider">Across Twin Cities Metro</span>
          </div>

          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-accent-amber block">100% Leaf</span>
            <span className="text-[11px] text-warm-400 font-medium uppercase tracking-wider">Zero Powder Concentrates</span>
          </div>

          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-accent-amber block">4-Hour Cycle</span>
            <span className="text-[11px] text-warm-400 font-medium uppercase tracking-wider">Fresh Steeping Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
