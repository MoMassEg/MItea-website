"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  TicketPercent,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
  X,
  Tag,
  DollarSign,
} from "lucide-react";

export default function AdminPromos() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newPromo, setNewPromo] = useState({
    code: "",
    discount_percent: 10,
    free_delivery: false,
    description: "",
    min_order_amount: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPromos = async () => {
    try {
      setLoading(true);
      const res = await apiClient.adminGetPromos();
      if (res.success && res.promos) {
        setPromos(res.promos);
      }
    } catch (err) {
      console.error("Failed to load promos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleToggleActive = async (promo: any) => {
    const nextActive = !promo.is_active;
    setPromos((prev) =>
      prev.map((p) => (p.id === promo.id ? { ...p, is_active: nextActive } : p))
    );

    try {
      await apiClient.adminTogglePromo(promo.id, nextActive);
      showToast(`Promo ${promo.code} is now ${nextActive ? "Active" : "Paused"}`);
    } catch (err) {
      setPromos((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, is_active: !nextActive } : p))
      );
      showToast("Failed to toggle promo code");
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await apiClient.adminDeletePromo(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      showToast("Promo code deleted");
    } catch (err) {
      showToast("Failed to delete promo code");
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient.adminCreatePromo({
        ...newPromo,
        code: newPromo.code.trim().toUpperCase(),
        discount_percent: Number(newPromo.discount_percent),
        min_order_amount: Number(newPromo.min_order_amount),
      });

      if (res.success && res.promo) {
        setPromos((prev) => [res.promo, ...prev]);
        setIsAddModalOpen(false);
        showToast(`Promo code ${res.promo.code} created!`);
        setNewPromo({
          code: "",
          discount_percent: 10,
          free_delivery: false,
          description: "",
          min_order_amount: 0,
        });
      }
    } catch (err: any) {
      showToast("Failed to create promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-gray-900">Promo Codes & Discounts</h2>
          <p className="text-xs text-gray-500">
            Create coupons for marketing campaigns, seasonal discounts, and free delivery vouchers.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-900/30 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo</span>
        </button>
      </div>

      {/* Promos Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading coupons...</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <TicketPercent className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No promo codes created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min. Order</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {promos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Code */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900 bg-brand-50 text-brand-800 px-2.5 py-1 rounded-lg border border-brand-200 tracking-wider">
                        {p.code}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900">
                        {p.discount_percent}% OFF
                      </span>
                      {p.free_delivery && (
                        <span className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          + Free Delivery
                        </span>
                      )}
                    </td>

                    {/* Min Order */}
                    <td className="py-3 px-4 text-gray-600">
                      {Number(p.min_order_amount) > 0 ? `$${Number(p.min_order_amount).toFixed(2)}` : "No Min"}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                      {p.description || "—"}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          p.is_active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${p.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                        <span>{p.is_active ? "Active" : "Paused"}</span>
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePromo(p.id)}
                        title="Delete Promo"
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── CREATE PROMO MODAL ──────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-extrabold text-gray-900">
                Create New Promo Code
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. BOBA20"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {/* Discount % & Min Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount % *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newPromo.discount_percent}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, discount_percent: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newPromo.min_order_amount}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, min_order_amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                  placeholder="e.g. 15% off first order for boba club members"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {/* Free Delivery Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 pt-1">
                <input
                  type="checkbox"
                  checked={newPromo.free_delivery}
                  onChange={(e) => setNewPromo({ ...newPromo, free_delivery: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Include Free Delivery with this coupon</span>
              </label>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-900/30 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Promo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
