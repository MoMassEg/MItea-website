"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/data/menu-data";
import { useOrder } from "@/context/OrderContext";
import { Plus, Flame, Sparkles } from "lucide-react";

interface ProductCardProps {
  item: MenuItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const { openProductModal, addToCart, isStoreOpen, isLoadingDemo, openCateringModal } = useOrder();
  const [imgError, setImgError] = useState(false);

  // Fallback placeholder image if external image fails to load
  const fallbackImage =
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80";

  const handleAction = () => {
    if (!item.available || !isStoreOpen) return;
    if (item.category === "catering") {
      // Direct add catering item or open custom builder
      addToCart({
        id: item.id,
        name: item.name,
        image: item.image,
        size: "Catering Pack",
        sizePrice: 0,
        sugar: "",
        ice: "",
        toppings: [{ id: "boba-pack", name: "Slow-Cooked Boba & Supplies Included", price: 0 }],
        basePrice: item.price,
        unitPrice: item.price,
        quantity: 1
      });
      return;
    }
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
        sugar: "",
        ice: "",
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
        <div className="aspect-square w-full rounded-xl bg-warm-200" />
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

  // ── SPECIAL VIP CATERING CARD LAYOUT ──
  if (item.category === "catering") {
    return (
      <div className="bg-white border-2 border-brand-200/90 hover:border-[#F8847F] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl flex flex-col justify-between transition-all duration-300 group relative">
        {/* Soft Ambient Coral Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F8847F]/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Catering Image */}
          <div className="relative aspect-square w-full bg-brand-50 img-zoom-container overflow-hidden">
            <Image
              src={imgError ? fallbackImage : item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <span className="bg-[#DF9749] text-white font-heading font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                ★ {item.badge || "Catering Pack"}
              </span>
            </div>

            {/* Serving Size Pill */}
            <div className="absolute bottom-3 right-3 z-10">
              <span className="bg-white/95 backdrop-blur-md text-gray-800 border border-gray-200 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                {item.calories}
              </span>
            </div>
          </div>

          {/* Catering Content */}
          <div className="p-5 sm:p-6">
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900 leading-snug tracking-tight">
              {item.name}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 font-normal mt-2.5 leading-relaxed">
              {item.description}
            </p>

            {/* What's Included Perks */}
            <div className="mt-4 pt-3 border-t border-gray-200 space-y-1.5 text-xs text-gray-600">
              {item.id === "catering-mochi-donut-platter" ? (
                <>
                  <div className="flex items-center gap-2 text-[#DF9749]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DF9749]" />
                    <span className="font-medium text-gray-900">24 freshly baked pull-apart mochi donuts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Matcha, Black Sesame, Strawberry &amp; Brown Sugar</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span>Luxury presentation display packaging</span>
                  </div>
                </>
              ) : item.id === "catering-party-tea-jug" ? (
                <>
                  <div className="flex items-center gap-2 text-[#DF9749]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DF9749]" />
                    <span className="font-medium text-gray-900">1-Gallon insulated dispenser (10–12 servings)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Dedicated 1-quart jar of warm Kokuto boba</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span>12 cups, boba straws, ice bucket &amp; spigot included</span>
                  </div>
                </>
              ) : item.id === "catering-grand-celebration-bar" ? (
                <>
                  <div className="flex items-center gap-2 text-[#DF9749]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DF9749]" />
                    <span className="font-medium text-gray-900">4 Gallons signature teas (Serves 50–60 guests)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>4 Boba &amp; jelly topping tubs + organic dairy &amp; oat milk</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span>Full setup: ice chest, scoops, spigots, labels &amp; 60 cups</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[#DF9749]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DF9749]" />
                    <span className="font-medium text-gray-900">2 Gallons freshly brewed loose leaf teas (Serves 25–30)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>2 Large topping tubs (Kokuto Boba + Lychee Jelly)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span>Cups, jumbo straws, sweet cream &amp; ice kit included</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 sm:p-6 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-gray-100 mt-2">
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
              Package Price
            </span>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#E14E47]">
              ${item.price.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCateringModal}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Customize
            </button>

            <button
              type="button"
              onClick={handleAction}
              disabled={isUnavailable}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#F8847F] hover:bg-[#F56B65] text-white font-heading font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Order</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`product-card bg-white rounded-2xl border border-warm-300 overflow-hidden shadow-sm flex flex-col justify-between transition-card relative ${
        isUnavailable ? "opacity-75" : ""
      }`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-warm-200 img-zoom-container overflow-hidden">
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
        {item.calories && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
              {item.calories}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 leading-snug">
              <button
                type="button"
                onClick={handleAction}
                disabled={isUnavailable}
                className="text-left hover:text-brand-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:hover:text-gray-900"
              >
                {item.name}
              </button>
            </h3>
          </div>

          <p className="text-xs text-gray-600 font-normal mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {item.caffeine && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F8847F]" />
              <span>{item.caffeine}</span>
            </div>
          )}
        </div>

        {/* Bottom Bar: Price & Add Action */}
        <div className="mt-4 pt-3 border-t border-warm-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-warm-500 font-medium block">Price</span>
            <span className="font-heading font-extrabold text-lg text-gray-900">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {item.customizable ? (
            <button
              type="button"
              onClick={handleAction}
              disabled={isUnavailable}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-heading font-bold text-xs sm:text-sm transition-all btn-press cursor-pointer ${
                isUnavailable
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#F8847F] hover:bg-[#F56B65] text-white shadow-md shadow-[#F8847F]/20"
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              disabled={isUnavailable}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all btn-press cursor-pointer ${
                isUnavailable
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#F8847F] hover:bg-[#F56B65] text-white shadow-md shadow-[#F8847F]/20"
              }`}
              aria-label={`Add ${item.name}`}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
