"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import { ToggleLeft, ToggleRight, Sparkles, Store } from "lucide-react";

export default function DemoBanner() {
  const { isStoreOpen, toggleStoreStatus, toggleLoadingDemo, openLocationModal } = useOrder();

  return (
    <div style={{ background: "#1C0A00" }} className="text-warm-200 text-xs py-2 px-4 border-b border-brand-900">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-brand-600 text-warm-100 font-bold text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
            Mitea
          </span>
          <span className="text-warm-500 font-medium hidden sm:inline">
            7724 Olson Mem Hwy, Golden Valley, MN 55427, United States · In-Store Pickup
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-[11px]">
          {/* Store toggle */}
          <button
            type="button"
            onClick={toggleStoreStatus}
            className="flex items-center gap-1.5 text-warm-400 hover:text-warm-200 px-2.5 py-1 rounded-sm border border-warm-900 transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {isStoreOpen ? (
              <ToggleRight className="w-4 h-4 text-accent-amber" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-warm-500" />
            )}
            <span>Store: {isStoreOpen ? "Open" : "Closed"}</span>
          </button>

          {/* Skeleton demo */}
          <button
            type="button"
            onClick={toggleLoadingDemo}
            className="flex items-center gap-1.5 text-warm-400 hover:text-warm-200 px-2.5 py-1 rounded-sm border border-warm-900 transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
            <span>Skeletons</span>
          </button>

          {/* Store info */}
          <button
            type="button"
            onClick={() => openLocationModal("pickup")}
            className="flex items-center gap-1.5 text-warm-400 hover:text-warm-200 px-2.5 py-1 rounded-sm border border-warm-900 transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Store className="w-3.5 h-3.5 text-accent-amber" />
            <span>Store &amp; Pickup Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
