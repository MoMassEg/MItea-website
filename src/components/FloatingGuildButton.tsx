"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import { Mail, Sparkles } from "lucide-react";

export default function FloatingGuildButton() {
  const { openGuildModal } = useOrder();

  return (
    <div className="fixed right-0 top-[45%] -translate-y-1/2 z-35 flex items-center">
      <button
        type="button"
        onClick={openGuildModal}
        className="group relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-l from-accent-amber via-amber-400 to-amber-500 hover:from-accent-gold hover:to-amber-400 text-black rounded-l-2xl shadow-xl border-l-2 border-y border-amber-200/90 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        aria-label="Subscribe for 10% Off"
        title="Email Subscription - Claim 10% Off"
      >
        <Mail className="w-4 h-4 text-black transition-transform group-hover:scale-110" />
        
        {/* Tiny 10% discount badge */}
        <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white font-mono text-[9px] font-extrabold px-1 rounded-full shadow-sm border border-white">
          10%
        </span>
      </button>
    </div>
  );
}
