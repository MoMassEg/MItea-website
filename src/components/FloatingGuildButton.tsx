"use client";

import React, { useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";
import { Sparkles, Gift } from "lucide-react";

export default function FloatingGuildButton() {
  const { openGuildModal } = useOrder();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Expands only when reaching the middle of the page (~35% to 40% down)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = docHeight > 0 ? window.scrollY / docHeight : 0;
      
      // True only in the middle of the page (or past 1000px)
      if (scrollRatio >= 0.35 || window.scrollY >= 1000) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isExpanded = isScrolled || isHovered;

  return (
    <div className="fixed right-0 top-[45%] -translate-y-1/2 z-35 flex items-center">
      <button
        type="button"
        onClick={openGuildModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group flex items-center bg-gradient-to-l from-accent-amber via-amber-400 to-amber-500 hover:from-accent-gold hover:to-amber-400 text-[#120602] font-heading font-extrabold uppercase tracking-wider rounded-l-2xl shadow-2xl border-l-2 border-y border-amber-200/90 cursor-pointer transition-all duration-500 ease-out active:scale-95 overflow-hidden ${
          isExpanded
            ? "pl-3.5 pr-2.5 py-2.5 shadow-amber-500/30"
            : "pl-2.5 pr-2 py-2 shadow-md opacity-90 hover:opacity-100"
        }`}
        aria-label="Open 15% Off VIP Guild"
      >
        {/* Sparkle Icon with Pulse */}
        <div className="relative flex items-center justify-center shrink-0">
          <Sparkles className={`transition-all duration-300 ${isExpanded ? "w-4 h-4 animate-pulse text-[#120602]" : "w-3.5 h-3.5 text-[#120602]"}`} />
          {/* Notification Ping Badge when small */}
          {!isExpanded && (
            <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-500 border border-white animate-ping" />
          )}
        </div>

        {/* Text container: collapsed when at top, slides out in the middle of page */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out flex items-center whitespace-nowrap ${
            isExpanded
              ? "max-w-[140px] opacity-100 ml-2"
              : "max-w-0 opacity-0 ml-0"
          }`}
        >
          <span className="text-[11px] font-extrabold tracking-wider">
            15% OFF VIP
          </span>
        </div>
      </button>
    </div>
  );
}
