"use client";

import React from "react";
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
  Utensils
} from "lucide-react";

export default function CategoryNav() {
  const { activeCategory, setActiveCategory } = useOrder();

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
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  return (
    <div className="sticky top-[70px] z-30 backdrop-blur-md border-b border-warm-300 py-3.5 transition-all" style={{ background: 'rgba(253,246,227,0.95)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex overflow-x-auto no-scrollbar gap-2.5 pb-1 items-center">
          {MENU_DATA.categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById("menu-sections");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 text-[12px] font-heading font-bold tracking-[0.04em] uppercase transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-600 text-warm-50 shadow-sm rounded-md"
                    : "bg-white text-brand-800 border border-warm-300 rounded-md hover:bg-warm-100"
                }`}
              >
                <span className={isActive ? "text-white" : "text-brand-600"}>
                  <span style={{ color: isActive ? 'rgba(253,246,227,0.85)' : '#D4903A' }}>{getCategoryIcon(cat.icon)}</span>
                </span>
                <span>{cat.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold ${
                    isActive ? "bg-white/20 text-warm-100" : "bg-warm-200 text-warm-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
