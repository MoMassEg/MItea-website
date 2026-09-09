"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useOrder } from "@/context/OrderContext";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  HeartHandshake
} from "lucide-react";

export default function CartDrawer() {
  const {
    isCartDrawerOpen,
    closeCartDrawer,
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    orderType,
    appliedPromo,
    applyPromo,
    removePromo,
    selectedTip,
    setSelectedTip,
    openCheckoutModal,
    showToast
  } = useOrder();

  const [promoInput, setPromoInput] = useState("");

  if (!isCartDrawerOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    applyPromo(promoInput);
    setPromoInput("");
  };

  const tipOptions = [
    { label: "$1.00", value: 1.0 },
    { label: "$2.00", value: 2.0 },
    { label: "$3.00", value: 3.0 },
    { label: "No Tip", value: 0 }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 glass-dark transition-opacity animate-backdrop"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col border-l border-warm-300 animate-drawer">
          {/* Header */}
          <div className="p-5 bg-white border-b border-warm-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1A1A1A]">Your Order</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {cart.length} unique item{cart.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-grow p-4 sm:p-5 space-y-3.5 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-warm-200 mx-auto flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-bold text-gray-800 text-base">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Looks like you haven&apos;t added any delicious bubble teas or mochi treats yet!
                </p>
                <button
                  type="button"
                  onClick={closeCartDrawer}
                  className="mt-2 inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors cursor-pointer"
                >
                  Start Ordering
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.uid}
                  className="bg-white rounded-2xl border border-warm-300 p-3.5 shadow-xs flex flex-col gap-2.5 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl bg-warm-200 overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-heading font-bold text-sm text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.uid)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer shrink-0"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500 space-y-0.5 mt-0.5">
                        <p>
                          <span className="font-semibold text-gray-700">{item.size}</span> • {item.sugar} sugar • {item.ice}
                        </p>
                        {item.toppings && item.toppings.length > 0 && (
                          <p className="text-brand-700 truncate">
                            + {item.toppings.map((t) => t.name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-warm-200 text-xs">
                    <div className="flex items-center bg-warm-100 rounded-full border border-warm-300 px-2 py-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.uid, -1)}
                        className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-black cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-heading font-bold text-xs px-2.5 text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.uid, 1)}
                        className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-black cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-heading font-bold text-sm text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Promo Code Box */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl border border-warm-300 p-3.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-heading font-bold text-gray-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    Promo Code
                  </span>
                  <span className="text-[10px] text-gray-400">Try &apos;MITEA10&apos; or &apos;BOBA10&apos;</span>
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-brand-800 font-bold">
                      <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
                        {appliedPromo.code}
                      </span>
                      <span className="text-xs font-normal text-brand-900">
                        {appliedPromo.description}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. MITEA10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-grow bg-warm-100 border border-warm-300 rounded-xl px-3 py-1.5 text-xs text-brand-900 uppercase font-mono focus:outline-none focus:border-brand-600"
                    />
                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Tip Selection */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl border border-warm-300 p-3.5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-gray-800 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-brand-600" />
                    Support Tea Craftsmen (Tip)
                  </span>
                  <span className="text-[10px] text-gray-400">Optional</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {tipOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedTip(opt.value)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTip === opt.value
                          ? "bg-brand-600 text-white shadow-xs"
                          : "bg-warm-100 text-gray-700 hover:bg-warm-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer & Price Breakdown */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-warm-300 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-800 font-medium">
                  <span>Fulfillment</span>
                  <span className="font-bold">In-Store Pickup (Free)</span>
                </div>
                <div className="flex justify-between">
                  <span>MN Sales Tax (8.875%)</span>
                  <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                {selectedTip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span className="font-semibold text-gray-900">${selectedTip.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-warm-200 flex justify-between text-base font-heading font-extrabold text-gray-900">
                  <span>Total</span>
                  <span className="text-brand-700">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={openCheckoutModal}
                className="w-full bg-brand-600 hover:bg-brand-800 text-white font-heading font-bold text-sm py-3.5 px-6 rounded-full shadow-lg shadow-brand-600/20 btn-press transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-1.5">
                  <span>${total.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
