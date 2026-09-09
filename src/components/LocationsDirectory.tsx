"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA, StoreLocation } from "@/data/menu-data";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Check,
  Store,
  Wifi,
  Coffee,
  Car,
  Sparkles
} from "lucide-react";

export default function LocationsDirectory() {
  const { setSelectedStore, setOrderType, showToast } = useOrder();
  const store = MENU_DATA.stores[0];

  const handleSelectStore = (selectedStore: StoreLocation) => {
    setSelectedStore(selectedStore);
    setOrderType("pickup");
    showToast(`Pickup location confirmed: ${selectedStore.name}`, "success");
    const menuEl = document.getElementById("menu-sections");
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const amenities = [
    "Flagship Tea Bar",
    "Outdoor Patio",
    "Curbside & Express Pickup",
    "Free High-Speed WiFi",
    "Organic Dairy & Oat Bar",
    "Fresh Mochi Bakery"
  ];

  return (
    <section id="locations" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold tracking-widest uppercase text-warm-600">
          Our Golden Valley Home
        </span>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#1A1A1A] mt-1.5">
          Visit Mitea — Tea House &amp; Pickup Bar
        </h2>
        <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">
          Crafted for mindful tea rituals, fresh loose-leaf micro steeping, and express in-store pickup in Golden Valley, Minnesota.
        </p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-warm-300 p-6 sm:p-10 shadow-sm relative overflow-hidden transition-all hover:border-brand-600/40">
        <div className="absolute top-0 right-0 bg-brand-600 text-white font-heading font-bold text-[10px] px-5 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent-amber" />
          <span>Official Store</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Store Details */}
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-gray-900">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-700 flex items-start gap-2 mt-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-warm-200 grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Closes at {store.closingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{store.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-700 font-semibold">
                <Car className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Ready for pickup in {store.pickupTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-700">Pickup Only — No Delivery</span>
              </div>
            </div>

            {/* Amenities pills */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Location Highlights
              </span>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs font-semibold bg-warm-100 text-gray-700 px-3 py-1 rounded-full border border-warm-300"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Hours Card */}
          <div className="md:col-span-5 bg-warm-50 rounded-2xl p-5 sm:p-6 border border-warm-200 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                Operating Hours
              </h4>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Mon – Thu:</span>
                  <span className="font-semibold text-gray-900">10:00 AM – 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri – Sun:</span>
                  <span className="font-semibold text-gray-900">10:00 AM – 11:00 PM</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-warm-200">
              <button
                type="button"
                onClick={() => handleSelectStore(store)}
                className="w-full bg-brand-600 hover:bg-brand-800 text-white font-heading font-bold text-xs sm:text-sm py-3 px-5 rounded-full shadow-md shadow-brand-600/20 btn-press transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Order In-Store Pickup Here</span>
                <span>→</span>
              </button>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-warm-100 text-gray-700 border border-warm-300 font-heading font-bold text-xs py-2.5 px-4 rounded-full transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Navigation className="w-3.5 h-3.5 text-brand-600" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
