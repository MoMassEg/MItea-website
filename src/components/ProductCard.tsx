"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/data/menu-data";
import { useOrder } from "@/context/OrderContext";
import { Plus, SlidersHorizontal, Flame, Sparkles } from "lucide-react";

interface ProductCardProps {
  item: MenuItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const { openProductModal, addToCart, isStoreOpen, isLoadingDemo } = useOrder();
  const [imgError, setImgError] = useState(false);

  // Fallback placeholder image if external image fails to load
  const fallbackImage =
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80";

  const handleAction = () => {
    if (!item.available || !isStoreOpen) return;
    if (item.customizable) {
      openProductModal(item);
    } else {
      // Direct add to cart for non-customizable snacks & desserts
      addToCart({
        id: item.id,
        name: item.name,
        image: item.image,
        size: "Standard",
        sizePrice: 0,
        sugar: "Standard",
        ice: "Standard",
        toppings: [],
        basePrice: item.price,
        unitPrice: item.price,
        quantity: 1
      });
    }
  };

  const getBadgeStyle = (badge: string) => {
    const lower = badge.toLowerCase();
    if (lower.includes("popular") || lower.includes("fire")) {
      return "badge-popular";
    }
    if (lower.includes("seller") || lower.includes("special")) {
      return "badge-bestseller";
    }
    if (lower.includes("signature") || lower.includes("origin")) {
      return "badge-signature";
    }
    if (lower.includes("vegan")) {
      return "badge-vegan";
    }
    if (lower.includes("caffeine") || lower.includes("0mg")) {
      return "badge-caffeine-free";
    }
    return "bg-warm-100 text-warm-600 border border-warm-300";
  };

  if (isLoadingDemo) {
    return (
      <div className="bg-white rounded-2xl border border-warm-300 p-4 shadow-sm space-y-4">
        <div className="skeleton h-44 w-full rounded-xl" />
        <div className="space-y-2">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-2/3 rounded" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-9 w-24 rounded-full" />
        </div>
      </div>
    );
  }

  const isUnavailable = !item.available || !isStoreOpen;

  return (
    <div
      className={`product-card bg-white rounded-2xl border border-warm-300 overflow-hidden shadow-sm flex flex-col justify-between transition-card relative ${
        isUnavailable ? "opacity-75" : ""
      }`}
    >
      {/* Top Image Container */}
      <div className="relative h-48 w-full bg-warm-200 img-zoom-container overflow-hidden">
        <Image
          src={imgError ? fallbackImage : item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          onError={() => setImgError(true)}
          priority={item.popular}
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {item.badge && (
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${getBadgeStyle(
                item.badge
              )}`}
            >
              {item.badge.toLowerCase().includes("popular") && <Flame className="w-3 h-3 text-orange-600" />}
              {item.badge.toLowerCase().includes("signature") && <Sparkles className="w-3 h-3 text-emerald-600" />}
              {item.badge}
            </span>
          )}
        </div>

        {/* Calories and Caffeine Info Pill */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            {item.calories}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#1A1A1A] leading-snug">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-gray-600 font-normal mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {item.caffeine && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span>{item.caffeine}</span>
            </div>
          )}
        </div>

        {/* Bottom Bar: Price & Add Action */}
        <div className="mt-4 pt-3 border-t border-warm-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium block">Price</span>
            <span className="font-heading font-extrabold text-lg text-brand-600">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {item.customizable ? (
            <button
              type="button"
              onClick={handleAction}
              disabled={isUnavailable}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-heading font-bold text-xs sm:text-sm transition-all btn-press cursor-pointer ${
                isUnavailable
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-800 text-white shadow-sm shadow-brand-600/20"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              disabled={isUnavailable}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all btn-press cursor-pointer ${
                isUnavailable
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-800 text-white shadow-sm shadow-brand-600/20"
              }`}
              aria-label={`Add ${item.name}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
