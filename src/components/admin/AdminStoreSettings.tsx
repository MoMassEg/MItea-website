"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Power,
  Sparkles,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function AdminStoreSettings() {
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    is_open: true,
    accepts_orders: true,
    pickup_time_estimate: "10–15 min",
    delivery_time_estimate: "30–45 min",
    phone: "(763) 555-0192",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadStore = async () => {
    try {
      setLoading(true);
      const res = await apiClient.adminGetStore();
      if (res.success && res.store) {
        setStore(res.store);
        setFormData({
          is_open: res.store.is_open ?? true,
          accepts_orders: res.store.accepts_orders ?? true,
          pickup_time_estimate: res.store.pickup_time_estimate || "10–15 min",
          delivery_time_estimate: res.store.delivery_time_estimate || "30–45 min",
          phone: res.store.phone || "(763) 555-0192",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await apiClient.adminUpdateStore(formData);
      if (res.success) {
        showToast("Store operations settings saved!");
      }
    } catch (err) {
      showToast("Failed to update store settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-heading font-extrabold text-gray-900">Store Operations & Rush Controls</h2>
        <p className="text-xs text-gray-500">
          Control live ordering availability, update pickup/delivery estimates, and adjust store info.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Master Toggles Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
          <h3 className="font-heading font-bold text-sm text-gray-900">Store Ordering Status</h3>

          {/* Accepting Orders Master Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                <Power
                  className={`w-4 h-4 ${formData.accepts_orders ? "text-emerald-600" : "text-rose-600"}`}
                />
                <span>Accepting Online Orders</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Turn off temporarily if the kitchen is overloaded or during rush hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, accepts_orders: !formData.accepts_orders })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.accepts_orders ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.accepts_orders ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Store Open/Closed Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
                <Store className={`w-4 h-4 ${formData.is_open ? "text-emerald-600" : "text-gray-400"}`} />
                <span>Physical Store Open</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Displays "Open Now" or "Closed" badge across the customer storefront.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_open: !formData.is_open })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.is_open ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.is_open ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Wait Times & Contact Info */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 text-xs">
          <h3 className="font-heading font-bold text-sm text-gray-900">Wait Times & Estimates</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Pickup Time Estimate
              </label>
              <input
                type="text"
                value={formData.pickup_time_estimate}
                onChange={(e) => setFormData({ ...formData, pickup_time_estimate: e.target.value })}
                placeholder="e.g. 10–15 min"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Shown on pickup checkout cards.</p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Delivery Time Estimate
              </label>
              <input
                type="text"
                value={formData.delivery_time_estimate}
                onChange={(e) => setFormData({ ...formData, delivery_time_estimate: e.target.value })}
                placeholder="e.g. 30–45 min"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Shown on delivery checkout cards.</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <label className="block font-semibold text-gray-700 mb-1">
              Store Support Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-900/30 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
