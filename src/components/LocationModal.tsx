"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA } from "@/data/menu-data";
import {
  X,
  Store,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Check,
  Coffee,
  Wifi,
  Car
} from "lucide-react";

export default function LocationModal() {
  const {
    isLocationModalOpen,
    closeLocationModal,
    setSelectedStore,
    setOrderType,
    showToast
  } = useOrder();

  if (!isLocationModalOpen) return null;

  const store = MENU_DATA.stores[0];

  const handleConfirm = () => {
    setSelectedStore(store);
    setOrderType("pickup");
    showToast("Pickup confirmed at Mitea Golden Valley! 🍵", "success");
    closeLocationModal();
  };

  const amenities = [
    { icon: Coffee, label: "Fresh Micro-Brewed Tea" },
    { icon: Car, label: "Curbside & Express Pickup" },
    { icon: Wifi, label: "Complimentary High-Speed WiFi" },
    { icon: Store, label: "Indoor Seating & Patio" }
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 glass-dark animate-backdrop"
        onClick={closeLocationModal}
      />

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-warm-300 animate-modal overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-warm-300 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-[#1A1A1A]">
                Mitea — Store &amp; Pickup Details
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Our home &amp; dedicated tea bar in Golden Valley, Minnesota
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLocationModal}
            className="w-8 h-8 rounded-full bg-warm-200 hover:bg-warm-300 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow bg-white">
          {/* Main Location Card */}
          <div className="p-5 rounded-2xl border-2 border-brand-600 bg-brand-50/40 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 bg-brand-600 text-white font-heading font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  <Check className="w-3 h-3" /> Official Tea House &amp; Pickup Bar
                </span>
                <h4 className="font-heading font-extrabold text-lg text-gray-900">
                  Mitea — Golden Valley
                </h4>
                <p className="text-xs text-gray-700 mt-1 flex items-start gap-1.5 leading-relaxed font-medium">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>7724 Olson Mem Hwy, Golden Valley, MN 55427, United States</span>
                </p>
              </div>

              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-200/60 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Estimated Wait</span>
                  <span className="font-bold text-brand-900">10–15 min pickup</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Store Phone</span>
                  <span className="font-bold text-gray-900">(763) 555-0192</span>
                </div>
              </div>
            </div>

            {/* Google Maps link */}
            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=7724+Olson+Mem+Hwy,+Golden+Valley,+MN+55427,+United+States"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
                <span>Open in Google Maps / Get Directions →</span>
              </a>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-warm-50 rounded-2xl p-4 border border-warm-200 space-y-2 text-xs">
            <h5 className="font-heading font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              Store Hours
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 pt-1">
              <div className="flex justify-between py-1 border-b border-warm-200 sm:border-b-0">
                <span className="font-medium">Monday – Thursday:</span>
                <span className="font-semibold text-gray-900">10:00 AM – 10:00 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium">Friday – Sunday:</span>
                <span className="font-semibold text-gray-900">10:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Store Amenities */}
          <div>
            <h5 className="font-heading font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-2.5">
              Café Amenities
            </h5>
            <div className="grid grid-cols-2 gap-2.5">
              {amenities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-warm-50 border border-warm-200 text-xs text-gray-700"
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pickup Only Policy Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Store className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Pickup Only Notice:</strong> All orders placed online are prepared fresh for in-store or curbside pickup at our Golden Valley location. Simply provide your name or order number at the pickup counter.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-warm-300 bg-[#FAF7F2] flex items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            <span className="font-bold text-gray-900 block">Pickup Store:</span>
            <span>Mitea Golden Valley</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="bg-brand-600 hover:bg-brand-700 text-white font-heading font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md shadow-brand-600/20 btn-press transition-all cursor-pointer"
          >
            Confirm Pickup Here
          </button>
        </div>
      </div>
    </div>
  );
}
