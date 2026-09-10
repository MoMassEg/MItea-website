"use client";

import React from "react";
import Image from "next/image";
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
  PartyPopper,
  Heart
} from "lucide-react";

export default function Hero() {
  const { setActiveCategory, openSendGiftModal, openRewardsModal, openLocationModal, openCateringModal } = useOrder();

  const handleExplore = () => {
    setActiveCategory("all");
    const target = document.getElementById("all") || document.getElementById("menu-sections");
    if (target) {
      const navOffset = 137;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="hero-outer relative overflow-hidden bg-gradient-to-b from-[#F8847F] via-[#F98E89] to-[#F5746E] text-gray-900">
      {/* Dynamic atmospheric radial glows */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full pointer-events-none opacity-30 blur-[130px]"
        style={{ background: "radial-gradient(circle, #FFFFFF 0%, #FEE5E1 50%, transparent 75%)" }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-25 blur-[110px]"
        style={{ background: "radial-gradient(circle, #FFF6F2 0%, #FDCFD0 60%, transparent 80%)" }}
      />

      {/* Editorial Watermark background */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.04] text-black font-editorial text-[220px] sm:text-[320px] leading-none font-bold tracking-tighter">
        MITEA
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Centered Editorial Content */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">

          {/* Top Pill Chip (Mirroring the top DONE pill in reference) */}
          <div className="inline-flex items-center gap-2 bg-white/95 border border-white px-4 py-1.5 rounded-full shadow-xs mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#F8847F]" />
            <span className="text-[11px] font-heading font-extrabold uppercase tracking-widest text-gray-900">
              Twin Cities&apos; Favorite Craft Tea House
            </span>
          </div>

          {/* High-Contrast Serif Title */}
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-gray-900 font-normal leading-[1.05] tracking-tight">
            Your day&apos;s <br />
            <span className="font-editorial-italic font-medium text-[#B93630]">
              favorite handcrafted
            </span>{" "}
            tea &amp; mochi
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-gray-800 leading-relaxed font-normal max-w-xl">
            MiTea is the artisanal boba you&apos;ll actually finish and crave again tomorrow. Hand-simmered Kokuto brown sugar pearls, organic dairy, and fresh Pon de Ring mochi donuts.
          </p>

          {/* Mascot Logo Artwork Showcase */}
          <div className="relative my-8 group">
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 bg-white/40 rounded-full blur-2xl scale-110 pointer-events-none" />

            <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-white/95 p-3 shadow-2xl border-4 border-white flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/images/logo.jpeg"
                  alt="MiTea Official Logo Artwork"
                  fill
                  sizes="(max-width: 640px) 192px, 240px"
                  className="object-contain p-2"
                  priority
                />
              </div>
            </div>


          </div>

          {/* Dietary & Quality Pill Tags — zero brown */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mt-4 mb-8">
            <span className="px-4 py-2 rounded-full text-xs font-heading font-bold text-white bg-[#E35843] shadow-xs flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" />
              <span>Whole Loose Leaf</span>
            </span>

            <span className="px-4 py-2 rounded-full text-xs font-heading font-bold text-white bg-[#C87A2E] shadow-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Organic Dairy &amp; Oat</span>
            </span>

            <span className="px-4 py-2 rounded-full text-xs font-heading font-bold text-gray-900 bg-[#F0E5DA] border border-[#E2D2C2] shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#DF9749]" />
              <span>Zero Powder Mixes</span>
            </span>

            <span className="px-4 py-2 rounded-full text-xs font-heading font-bold text-white bg-[#DF9749] shadow-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>4-Hour Steeping Cycle</span>
            </span>

            <span className="px-4 py-2 rounded-full text-xs font-heading font-bold text-white bg-[#F58F85] shadow-xs flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>Fresh Daily Boba</span>
            </span>

            <span className="px-4 py-2 rounded-full text-xs font-heading font-bold text-white bg-[#D98357] shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handmade Mochi Donuts</span>
            </span>
          </div>

          {/* Main Action Pill Buttons — zero brown buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExplore}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white hover:bg-white/95 text-[#E14E47] font-heading font-extrabold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-full transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <span>Order Drinks Now</span>
              <ArrowUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={openCateringModal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-gray-900 border border-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-full transition-all shadow-md cursor-pointer"
            >
              <PartyPopper className="w-4 h-4 text-[#DF9749]" />
              <span>Catering &amp; Events</span>
            </button>

            <button
              type="button"
              onClick={openSendGiftModal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-gray-900 border border-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-full transition-all shadow-md cursor-pointer"
            >
              <Gift className="w-4 h-4 text-[#DF9749]" />
              <span>Send Drink</span>
            </button>

            <button
              type="button"
              onClick={openRewardsModal}
              className="inline-flex items-center gap-1.5 text-xs text-gray-800 hover:text-black font-heading font-bold uppercase tracking-wider px-4 py-2 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#DF9749]" />
              <span>VIP Club</span>
            </button>
          </div>

          {/* Location Banner */}
          <div
            onClick={() => openLocationModal("pickup")}
            className="mt-8 pt-5 border-t border-black/10 flex items-center justify-center gap-2 text-xs text-gray-800 hover:text-black cursor-pointer transition-colors group"
          >
            <MapPin className="w-3.5 h-3.5 text-gray-700 shrink-0 group-hover:scale-110 transition-transform" />
            <span>7724 Olson Mem Hwy, Golden Valley, MN 55427 · <strong className="text-black underline">Pickup ready in 10–15 min</strong></span>
          </div>
        </div>
      </div>

      {/* Metrics Strip — Transitioning into the page */}
      <div className="border-t border-b border-black/10 bg-white/70 backdrop-blur-md relative z-10 py-5">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-gray-900 block">4.9 ★</span>
            <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">2,400+ Verified Reviews</span>
          </div>

          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-gray-900 block">Golden Valley</span>
            <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">7724 Olson Mem Hwy</span>
          </div>

          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-gray-900 block">100% Whole Leaf</span>
            <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Zero Powder Concentrates</span>
          </div>

          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-gray-900 block">4-Hour Cycle</span>
            <span className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider">Fresh Steeping Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
