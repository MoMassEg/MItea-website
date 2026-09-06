"use client";

import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA, ADDRESS_DATABASE, StoreLocation, DeliveryAddress } from "@/data/menu-data";
import {
  X,
  Store,
  Bike,
  Check,
  MapPin,
  Clock,
  Phone,
  Search,
  Navigation,
  AlertCircle
} from "lucide-react";

export default function LocationModal() {
  const {
    isLocationModalOpen,
    closeLocationModal,
    orderType,
    setOrderType,
    selectedStore,
    setSelectedStore,
    deliveryAddress,
    setDeliveryAddress,
    showToast
  } = useOrder();

  const [activeTab, setActiveTab] = useState<"pickup" | "delivery">(orderType);
  const [addressSearch, setAddressSearch] = useState(deliveryAddress.street);
  const [aptNumber, setAptNumber] = useState("");
  const [driverNotes, setDriverNotes] = useState("");
  const [filteredAddresses, setFilteredAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<DeliveryAddress>(deliveryAddress);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isLocationModalOpen) return null;

  const handleSearchChange = (val: string) => {
    setAddressSearch(val);
    setValidationError(null);
    if (val.trim().length > 1) {
      const lower = val.toLowerCase();
      const results = ADDRESS_DATABASE.filter(
        (a) =>
          a.full.toLowerCase().includes(lower) ||
          a.street.toLowerCase().includes(lower) ||
          a.city.toLowerCase().includes(lower)
      );
      setFilteredAddresses(results);
    } else {
      setFilteredAddresses([]);
    }
  };

  const handleSelectAutocomplete = (addr: DeliveryAddress) => {
    if (!addr.valid) {
      setValidationError(
        `Sorry, "${addr.city}" is outside our Twin Cities delivery radius (max 12 miles). Please choose Store Pickup or another address.`
      );
      return;
    }
    setSelectedAddr(addr);
    setAddressSearch(addr.full);
    setFilteredAddresses([]);
    setValidationError(null);
  };

  const handleConfirm = () => {
    if (activeTab === "pickup") {
      setOrderType("pickup");
      showToast(`Pickup store set to ${selectedStore.name}`, "success");
      closeLocationModal();
    } else {
      if (!selectedAddr.valid) {
        setValidationError("Please select a valid Twin Cities delivery address.");
        return;
      }
      setOrderType("delivery");
      setDeliveryAddress({
        ...selectedAddr,
        street: aptNumber ? `${selectedAddr.street} ${aptNumber}` : selectedAddr.street
      });
      showToast(`Delivery set to ${selectedAddr.street}`, "success");
      closeLocationModal();
    }
  };

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
          <div>
            <h3 className="font-heading font-bold text-xl text-[#1A1A1A]">
              Choose How to Order
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Pickup at one of our 4 Twin Cities cafés or delivery right to your door
            </p>
          </div>
          <button
            type="button"
            onClick={closeLocationModal}
            className="w-8 h-8 rounded-full bg-warm-200 hover:bg-warm-300 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-2 border-b border-warm-200 bg-white">
          <div className="grid grid-cols-2 p-1 bg-warm-100 rounded-2xl border border-warm-300">
            <button
              type="button"
              onClick={() => setActiveTab("pickup")}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "pickup"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Store Pickup</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("delivery")}
              className={`py-2.5 rounded-xl text-xs sm:text-sm font-heading font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "delivery"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Twin Cities Delivery</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-grow bg-white">
          {activeTab === "pickup" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Select a location for pickup</span>
                <span className="flex items-center gap-1 text-brand-600 font-semibold">
                  <Navigation className="w-3 h-3" /> 4 stores in Minnesota
                </span>
              </div>

              {MENU_DATA.stores.map((store: StoreLocation) => {
                const isSelected = selectedStore.id === store.id;
                return (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "border-brand-600 bg-brand-50 shadow-xs"
                        : "border-warm-300 hover:border-warm-400 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-sm sm:text-base text-gray-900">
                            {store.name}
                          </h4>
                          {store.isFlagship && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Flagship
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {store.address}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                          isSelected
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2 border-t border-warm-200/80">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-brand-700">
                          <Clock className="w-3 h-3" /> Ready in {store.pickupTime}
                        </span>
                        <span>•</span>
                        <span className="text-gray-600">{store.distance}</span>
                      </div>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" /> {store.phone}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Address search autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Delivery Street Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Twin Cities street address..."
                    value={addressSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3.5 py-2.5 pl-9 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-600"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {filteredAddresses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-warm-300 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-warm-200 animate-modal">
                    {filteredAddresses.map((addr) => (
                      <button
                        key={addr.full}
                        type="button"
                        onClick={() => handleSelectAutocomplete(addr)}
                        className="w-full text-left px-4 py-2.5 hover:bg-warm-100 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="text-gray-800 font-medium">{addr.full}</span>
                        </div>
                        {addr.valid ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                            {addr.estTime}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold">
                            Out of Zone
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Apt / Suite & Driver Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Apt / Suite / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apt 4B"
                    value={aptNumber}
                    onChange={(e) => setAptNumber(e.target.value)}
                    className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Estimated Delivery Time
                  </label>
                  <div className="bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-brand-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>{selectedAddr.estTime || "25–35 min"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  placeholder="e.g. Please leave bag at lobby front desk or ring bell #12"
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-brand-600 resize-none"
                />
              </div>

              {/* Suggested Presets */}
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Sample Delivery Addresses
                </span>
                <div className="flex flex-wrap gap-2">
                  {ADDRESS_DATABASE.slice(0, 4).map((item) => (
                    <button
                      key={item.full}
                      type="button"
                      onClick={() => handleSelectAutocomplete(item)}
                      className="text-[11px] bg-warm-100 hover:bg-warm-200 border border-warm-300 px-2.5 py-1 rounded-lg text-gray-700 transition-colors cursor-pointer"
                    >
                      {item.street}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-warm-100 border-t border-warm-300 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={closeLocationModal}
            className="px-5 py-2.5 rounded-full border border-warm-300 text-gray-600 hover:bg-warm-200 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-800 text-white text-xs sm:text-sm font-heading font-bold shadow-md shadow-brand-600/20 btn-press transition-all cursor-pointer"
          >
            Confirm {activeTab === "pickup" ? "Store" : "Address"}
          </button>
        </div>
      </div>
    </div>
  );
}
