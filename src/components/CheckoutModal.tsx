"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useOrder, PlacedOrder } from "@/context/OrderContext";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { usePayWithCash } from "@/lib/hooks/usePayments";
import { useGiftCardBalance, useRedeemGiftCard } from "@/lib/hooks/useGiftCards";
import { StripePaymentForm, StripePaymentFormRef } from "./StripePaymentForm";
import {
  X,
  CreditCard,
  Banknote,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Store,
  Bike,
  Loader2
} from "lucide-react";

export default function CheckoutModal() {
  const {
    isCheckoutModalOpen,
    closeCheckoutModal,
    cart,
    clearCart,
    orderType,
    selectedStore,
    deliveryAddress,
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    selectedTip,
    openConfirmationModal,
    showToast,
    appliedPromo,
    currentUser,
    addLoyaltyStamp,
  } = useOrder();

  // Typed API hooks — replacing raw fetch()
  const { createOrder } = useCreateOrder();
  const { payCash } = usePayWithCash();
  const { getBalance } = useGiftCardBalance();
  const { redeemGiftCard } = useRedeemGiftCard();

  const stripeFormRef = React.useRef<StripePaymentFormRef>(null);

  const [customerName, setCustomerName] = useState(currentUser?.name || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");

  // Pre-fill if logged in
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.email) setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  const [paymentMethod, setPaymentMethod] = useState<"card" | "express" | "cash">("card");

  // Gift Card State
  const [giftCardCode, setGiftCardCode] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; balance: number } | null>(null);
  const [isApplyingGiftCard, setIsApplyingGiftCard] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutModalOpen) return null;

  const giftCardDeduction = appliedGiftCard
    ? Math.min(appliedGiftCard.balance, total)
    : 0;
  const finalTotal = Math.max(0, total - giftCardDeduction);

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setIsApplyingGiftCard(true);
    try {
      // Task 2: use typed useGiftCardBalance hook instead of raw fetch
      const data = await getBalance(giftCardCode.trim());
      if (data.isRedeemed || data.balance <= 0) {
        showToast("This gift card has already been fully redeemed.", "warning");
        return;
      }
      setAppliedGiftCard({
        code: data.code,
        balance: Number(data.balance),
      });
      showToast(`Gift card applied! $${Number(data.balance).toFixed(2)} balance available. 🎁`, "success");
    } catch (err: any) {
      showToast(err?.message || "Could not verify gift card. Please try again.", "warning");
    } finally {
      setIsApplyingGiftCard(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast("Please enter your name and phone number for the order.", "warning");
      return;
    }

    if (orderType === "delivery" && (!deliveryAddress?.street || !deliveryAddress.street.trim())) {
      showToast("Please enter your delivery address.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If paying with card or Apple Pay and total > 0, validate card fields with Stripe first
      if ((paymentMethod === "card" || paymentMethod === "express") && finalTotal > 0) {
        const isCardValid = await stripeFormRef.current?.validate();
        if (!isCardValid) {
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Create order in backend
      const data = await createOrder({
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          size: item.size,
          sugar: item.sugar,
          ice: item.ice,
          toppings: item.toppings,
          quantity: item.quantity,
          notes: item.notes,
        })),
        orderType,
        storeId: selectedStore.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || (currentUser?.email ?? "guest@mitea.com"),
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        promoCode: appliedPromo?.code,
        tip: selectedTip,
        paymentMethod:
          paymentMethod === "card"
            ? "Credit Card (Stripe)"
            : paymentMethod === "express"
            ? "Apple Pay"
            : "Pay at Counter upon Pickup",
      });

      if (!data || !data.orderId) {
        throw new Error("Order creation failed on server.");
      }

      // 3. Redeem gift card balance if applied
      if (appliedGiftCard && giftCardDeduction > 0) {
        try {
          await redeemGiftCard(appliedGiftCard.code, giftCardDeduction);
        } catch (giftErr) {
          console.warn('[Checkout] Gift card redemption error:', giftErr);
        }
      }

      // 4. If card or Apple Pay and final total > 0, confirm payment via Stripe Elements
      if ((paymentMethod === "card" || paymentMethod === "express") && finalTotal > 0) {
        const payResult = await stripeFormRef.current?.confirm(data.orderId, data.orderNumber);
        if (!payResult || !payResult.success) {
          setIsSubmitting(false);
          showToast(payResult?.error || "Payment failed. Please check your payment details.", "warning");
          return;
        }
      } else if (paymentMethod === "cash") {
        try {
          await payCash(data.orderId);
        } catch (cashErr) {
          console.warn('[Checkout] Cash payment recording error:', cashErr);
        }
      }

      // 5. Complete order
      setIsSubmitting(false);
      clearCart();
      openConfirmationModal(data.placedOrder);
      if (currentUser) addLoyaltyStamp();
      showToast(`Order ${data.orderNumber} placed successfully! 🍵`, "success");
      return;
    } catch (err: any) {
      console.error('[Checkout] Error placing order:', err);
      setIsSubmitting(false);
      showToast(err?.message || "Could not process order. Please try again.", "warning");
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
        onClick={closeCheckoutModal}
      />

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-warm-300 animate-modal overflow-hidden relative z-10 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-warm-300 flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-[#1A1A1A]">
                Secure Checkout
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Review your items and complete your order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCheckoutModal}
            className="w-8 h-8 rounded-full bg-warm-200 hover:bg-warm-300 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <form
          onSubmit={handleSubmitOrder}
          className="flex-grow overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-warm-300 bg-white"
        >
          {/* Left Column: Contact & Payment Info (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-7 space-y-6">
            {/* Fulfillment recap */}
            <div className="bg-warm-100 rounded-2xl p-4 border border-warm-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-700">
                    Pickup Location (In-Store)
                  </h4>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">
                    {selectedStore.address}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-700 bg-white px-2.5 py-1 rounded-full border border-warm-300">
                Ready in {selectedStore.pickupTime}
              </span>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">
                1. Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-semibold mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1">
                  Email for Receipt
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">
                  2. Payment Method
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === "card"
                      ? "border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-xs"
                      : "border-warm-300 hover:bg-warm-100 text-gray-700"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("express")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === "express"
                      ? "border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-xs"
                      : "border-warm-300 hover:bg-warm-100 text-gray-700"
                  }`}
                >
                  {/* Apple logo SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87 0-.02 0-.05-.01-.07-.97.04-2.15.65-2.85 1.48-.56.65-.99 1.68-.96 2.73.01.02.01.05.02.07 1.09.08 2.18-.59 2.79-1.34z" />
                  </svg>
                  <span className="text-xs">Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === "cash"
                      ? "border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-xs"
                      : "border-warm-300 hover:bg-warm-100 text-gray-700"
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs">Pay at Counter</span>
                </button>
              </div>

              {/* Stripe Payment Form for Card and Apple Pay */}
              {(paymentMethod === "card" || paymentMethod === "express") && (
                <div className="bg-warm-50 p-4 rounded-2xl border border-warm-300">
                  <StripePaymentForm
                    ref={stripeFormRef}
                    amount={finalTotal}
                    paymentMethod={paymentMethod}
                    customerEmail={customerEmail || (currentUser?.email ?? undefined)}
                  />
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="bg-warm-100 p-4 rounded-2xl border border-warm-300 space-y-1 text-xs text-gray-700 animate-modal">
                  <p className="font-bold text-gray-900">
                    Pay at Counter upon Pickup
                  </p>
                  <p className="text-gray-600">
                    You can pay with cash, card, or contactless at the front register when picking up your drinks.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Place Button (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-7 bg-[#FAF7F2] flex flex-col justify-between space-y-6">
            <div>
              <h4 className="font-heading font-bold text-sm text-[#1A1A1A] uppercase tracking-wider mb-3">
                Order Summary ({cart.length} items)
              </h4>

              {/* Items scroll */}
              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 divide-y divide-warm-200">
                {cart.map((item) => (
                  <div key={item.uid} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="relative w-9 h-9 rounded-lg bg-warm-200 overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-gray-900 block truncate">
                          {item.quantity}x {item.name}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-gray-600 italic block truncate">
                            “{item.notes}”
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Gift Card Input */}
              <div className="mt-3 pt-3 border-t border-warm-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Gift card code (MTEA-...)"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-white border border-warm-300 rounded-xl px-3 py-1.5 text-xs uppercase font-mono text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyGiftCard}
                    disabled={isApplyingGiftCard || !giftCardCode.trim()}
                    className="bg-brand-50 text-brand-800 border border-brand-200 hover:bg-brand-100 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isApplyingGiftCard ? '...' : 'Apply'}
                  </button>
                </div>
                {appliedGiftCard && (
                  <p className="text-[11px] text-emerald-700 mt-1 flex items-center justify-between">
                    <span>✓ Card {appliedGiftCard.code} applied</span>
                    <button
                      type="button"
                      onClick={() => { setAppliedGiftCard(null); setGiftCardCode(''); }}
                      className="text-red-500 hover:underline text-[10px]"
                    >
                      Remove
                    </button>
                  </p>
                )}
              </div>

              {/* Cost calculations */}
              <div className="mt-4 pt-4 border-t border-warm-300 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Minnesota Tax (8.875%)</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
                {selectedTip > 0 && (
                  <div className="flex justify-between">
                    <span>Staff Tip</span>
                    <span className="font-medium text-gray-900">${selectedTip.toFixed(2)}</span>
                  </div>
                )}
                {appliedGiftCard && giftCardDeduction > 0 && (
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>Gift Card ({appliedGiftCard.code})</span>
                    <span>-${giftCardDeduction.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-warm-300 flex justify-between text-base font-heading font-extrabold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-brand-700 text-lg">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-600 hover:bg-brand-800 text-white font-heading font-bold text-sm py-4 px-6 rounded-full shadow-lg shadow-brand-600/20 btn-press transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Order • ${finalTotal.toFixed(2)}</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                By placing your order, you agree to Mitea&apos;s Terms of Service and fresh-brewed beverage pickup policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
