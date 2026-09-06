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
  Car
} from "lucide-react";

export default function LocationsDirectory() {
  const { setSelectedStore, setOrderType, showToast } = useOrder();

  const handleSelectStore = (store: StoreLocation) => {
    setSelectedStore(store);
    setOrderType("pickup");
    showToast(`Pickup location set to ${store.name}`, "success");
    const menuEl = document.getElementById("menu-sections");
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getStoreAmenities = (storeId: string) => {
    switch (storeId) {
      case "golden-valley":
        return ["Flagship Tea Bar", "Outdoor Patio", "Curbside Pickup", "Free WiFi"];
      case "downtown-mpls":
        return ["Express Mobile Bar", "Skyway Connected", "Fast Pickup", "Organic Oat Milk"];
      case "st-paul-snelling":
        return ["Cozy Study Space", "Loose Leaf Dispensary", "Free WiFi", "Patio Seating"];
      case "uptown-mpls":
        return ["Late Night Hours", "Mochi Donut Bakery", "Street Parking", "Curbside Pickup"];
      default:
        return ["Curbside Pickup", "Free WiFi"];
    }
  };

  return (
    <section id="locations" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold tracking-widest uppercase text-warm-600">
          Twin Cities Tea Houses
        </span>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#1A1A1A] mt-1.5">
          Visit Our Cafés &amp; Pickup Bars
        </h2>
        <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">
          Four distinct community hubs across the Minneapolis &amp; St. Paul metro, designed for mindful tea rituals and gathering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MENU_DATA.stores.map((store) => {
          const amenities = getStoreAmenities(store.id);

          return (
            <div
              key={store.id}
              className="bg-white rounded-3xl border border-warm-300 p-6 shadow-xs flex flex-col justify-between transition-card relative overflow-hidden"
            >
              {store.isFlagship && (
                <div className="absolute top-0 right-0 bg-brand-600 text-white font-heading font-bold text-[10px] px-4 py-1 rounded-bl-2xl uppercase tracking-wider shadow-sm">
                  Flagship Store
                </div>
              )}

              <div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      {store.name}
                    </h3>
                    <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {store.address}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-warm-200 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>Closes at {store.closingTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-gray-900">{store.distance}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-700 font-semibold">
                    <Car className="w-3.5 h-3.5 text-brand-600" />
                    <span>Ready in {store.pickupTime}</span>
                  </div>
                </div>

                {/* Amenities pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="text-[10px] font-semibold bg-warm-100 text-gray-700 px-2.5 py-1 rounded-full border border-warm-300"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-warm-200 flex flex-wrap items-center justify-between gap-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-gray-600 hover:text-brand-600 transition-colors flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleSelectStore(store)}
                  className="bg-brand-600 hover:bg-brand-800 text-white font-heading font-bold text-xs px-5 py-2.5 rounded-full shadow-sm shadow-brand-600/20 btn-press transition-all cursor-pointer"
                >
                  Order Pickup Here →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
