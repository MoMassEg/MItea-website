"use client";

import React, { useEffect, useRef } from "react";
import { useOrder } from "@/context/OrderContext";
import { useMenu } from "@/hooks/useMenu";
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
  const { categories } = useMenu();
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
    const sectionIds = categories.map((c) => c.id);

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
  }, [activeCategory, setActiveCategory, categories]);

  return (
    <div
      className="sticky top-[72px] z-30 backdrop-blur-md border-b border-warm-300 py-3 transition-all"
      style={{ background: "rgba(255, 246, 242, 0.95)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          ref={navContainerRef}
          className="flex overflow-x-auto no-scrollbar gap-2.5 pb-1 items-center"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const isCatering = cat.id === "catering";

            return (
              <React.Fragment key={cat.id}>
                <button
                  type="button"
                  data-category-id={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 text-[12px] font-heading font-bold tracking-[0.04em] uppercase transition-all cursor-pointer rounded-full ${
                    isActive
                      ? "bg-[#F8847F] text-white shadow-md shadow-[#F8847F]/25 hover:bg-[#F56B65]"
                      : "bg-white text-gray-800 border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-brand-500"}>
                    {getCategoryIcon(cat.icon)}
                  </span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-warm-200 text-gray-700"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>

                {/* Quick Event Planning Button - text only */}
                {isCatering && (
                  <button
                    type="button"
                    onClick={openCateringModal}
                    className="shrink-0 px-4 py-2 text-[12px] font-heading font-bold tracking-[0.04em] uppercase text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 rounded-full shadow-2xs transition-all cursor-pointer border border-amber-400/50"
                  >
                    Plan Event
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
