"use client";

import React, { useEffect, useRef } from "react";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA } from "@/data/menu-data";
import {
  Flame,
  Coffee,
  Citrus,
  Leaf,
  Zap,
  Droplets,
  Cake,
  Utensils,
  Sparkles
} from "lucide-react";

export default function CategoryNav() {
  const { activeCategory, setActiveCategory, openCateringModal } = useOrder();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const isClickScrollingRef = useRef(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "flame":
        return <Flame className="w-4 h-4" />;
      case "coffee":
        return <Coffee className="w-4 h-4" />;
      case "citrus":
        return <Citrus className="w-4 h-4" />;
      case "leaf":
        return <Leaf className="w-4 h-4" />;
      case "zap":
        return <Zap className="w-4 h-4" />;
      case "droplets":
        return <Droplets className="w-4 h-4" />;
      case "cake":
        return <Cake className="w-4 h-4" />;
      case "utensils":
        return <Utensils className="w-4 h-4" />;
      case "sparkles":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  const scrollToCategory = (catId: string) => {
    isClickScrollingRef.current = true;
    setActiveCategory(catId);

    const targetEl =
      document.getElementById(catId) ||
      (catId === "all" ? document.getElementById("menu-sections") : null);

    if (targetEl) {
      // Offset for sticky Header (70px) + CategoryNav (~55px) + 12px breathing room
      const navOffset = 137;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth"
      });
    }

    // Release click scroll lock after animation settles
    setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 850);
  };

  // Keep active category button visible within the horizontal slider
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeButton = navContainerRef.current.querySelector<HTMLElement>(
      `[data-category-id="${activeCategory}"]`
    );
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest"
      });
    }
  }, [activeCategory]);

  // Scrollspy: update active category as user scrolls through the full menu
  useEffect(() => {
    const sectionIds = MENU_DATA.categories.map((c) => c.id);

    const handleScroll = () => {
      if (isClickScrollingRef.current) return;

      const navOffset = 150;
      const scrollPos = window.scrollY;

      // If near page top, highlight the first category ("all")
      if (scrollPos < 250) {
        if (activeCategory !== "all") {
          setActiveCategory("all");
        }
        return;
      }

      // Find the section currently in view
      let currentActive = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= navOffset) {
            currentActive = id;
          }
        }
      }

      if (currentActive && currentActive !== activeCategory) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory, setActiveCategory]);

  return (
    <div
      className="sticky top-[70px] z-30 backdrop-blur-md border-b border-warm-300 py-3.5 transition-all"
      style={{ background: "rgba(253,246,227,0.95)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          ref={navContainerRef}
          className="flex overflow-x-auto no-scrollbar gap-2.5 pb-1 items-center"
        >
          {MENU_DATA.categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const isCatering = cat.id === "catering";

            return (
              <React.Fragment key={cat.id}>
                <button
                  type="button"
                  data-category-id={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-2 text-[12px] font-heading font-bold tracking-[0.04em] uppercase transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-600 text-warm-50 shadow-sm rounded-md"
                      : "bg-white text-brand-800 border border-warm-300 rounded-md hover:bg-warm-100"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-brand-600"}>
                    <span
                      style={{
                        color: isActive
                          ? "rgba(253,246,227,0.85)"
                          : "#D4903A"
                      }}
                    >
                      {getCategoryIcon(cat.icon)}
                    </span>
                  </span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold ${
                      isActive
                        ? "bg-white/20 text-warm-100"
                        : "bg-warm-200 text-warm-600"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>

                {/* Quick Catering Modal Launcher - placed right after Catering & Events */}
                {isCatering && (
                  <button
                    type="button"
                    onClick={openCateringModal}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-[12px] font-heading font-bold tracking-[0.04em] uppercase text-amber-950 bg-gradient-to-r from-accent-amber/90 to-amber-400 hover:from-accent-amber hover:to-amber-500 rounded-md shadow-xs transition-all cursor-pointer border border-amber-500/50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Book Catering</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
