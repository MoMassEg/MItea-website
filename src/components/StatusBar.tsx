"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import { Store, Bike, AlertTriangle, Clock, MapPin, ChevronRight } from "lucide-react";

export default function StatusBar() {
  const {
    orderType,
    selectedStore,
    deliveryAddress,
    isStoreOpen,
    openLocationModal
  } = useOrder();

  return (
    <div className="bg-warm-100 border-b border-warm-300">
      {/* Store Closed Warning if applicable */}
      {!isStoreOpen && (
        <div className="bg-amber-100/90 border-b border-amber-200 px-4 py-2 text-amber-900 text-xs font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Store Currently Closed:</strong> Orders placed now will be scheduled for tomorrow morning when the kitchen opens at 10:00 AM.
          </span>
        </div>
      )}

      {/* Fulfillment Status Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-gray-700">
          <div className="w-7 h-7 rounded-md bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
            {orderType === "pickup" ? (
              <Store className="w-4 h-4" />
            ) : (
              <Bike className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="font-bold text-brand-900 capitalize">
              {orderType === "pickup" ? "Pickup" : "Delivery"}:
            </span>{" "}
            <span className="text-brand-700 font-medium">
              {orderType === "pickup"
                ? `${selectedStore.shortAddress} (${selectedStore.city})`
                : `${deliveryAddress.street}, ${deliveryAddress.city}`}
            </span>
            <span className="text-warm-400 mx-1.5">·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
              <Clock className="w-3.5 h-3.5" />
              {orderType === "pickup" ? selectedStore.pickupTime : deliveryAddress.estTime}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openLocationModal(orderType)}
          className="inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.05em] uppercase text-brand-600 hover:text-brand-800 bg-white px-3 py-1.5 rounded-md border border-warm-300 shadow-xs hover:bg-warm-100 transition-colors cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>Change Fulfillment</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
