"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import {
  X,
  CheckCircle,
  Clock,
  MapPin,
  Sparkles,
  CupSoda,
  CheckCircle2,
  PackageCheck,
  RotateCcw
} from "lucide-react";

export default function ConfirmationModal() {
  const {
    isConfirmationModalOpen,
    closeConfirmationModal,
    currentOrder,
    orderTrackingStep,
    setOrderTrackingStep
  } = useOrder();

  if (!isConfirmationModalOpen || !currentOrder) return null;

  const steps = [
    { label: "Received", desc: "Sent to kitchen" },
    { label: "Preparing", desc: "Steeping & Shaking" },
    {
      label: currentOrder.orderType === "pickup" ? "Ready" : "On the Way",
      desc: currentOrder.orderType === "pickup" ? "At pickup counter" : "Driver dispatched"
    },
    { label: "Completed", desc: "Enjoy your boba!" }
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 glass-dark animate-backdrop"
        onClick={closeConfirmationModal}
      />

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-warm-300 animate-modal overflow-hidden relative z-10 flex flex-col max-h-[92vh]">
        {/* Modal Header banner */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 sm:p-8 text-white text-center relative overflow-hidden shrink-0">
          <button
            type="button"
            onClick={closeConfirmationModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 bg-white text-brand-600 rounded-full mx-auto flex items-center justify-center shadow-lg mb-3">
            <CheckCircle className="w-8 h-8 text-brand-600" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-warm-200 block mb-1">
            Order Confirmed
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Thank You, {currentOrder.customerName.split(" ")[0]}!
          </h2>
          <p className="text-xs sm:text-sm text-warm-100/90 mt-1">
            Order #{currentOrder.orderId} • Placed at {currentOrder.createdAt}
          </p>
        </div>

        {/* Live 4-Stage Connected Progress Tracker */}
        <div className="p-6 bg-warm-100 border-b border-warm-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Live Order Tracker
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
              <span>
                {orderTrackingStep === 0 && "Order Received"}
                {orderTrackingStep === 1 && "Brewing & Shaking"}
                {orderTrackingStep === 2 && (currentOrder.orderType === "pickup" ? "Ready for Pickup!" : "Out for Delivery")}
                {orderTrackingStep === 3 && "Order Completed"}
              </span>
            </div>
          </div>

          {/* Connected Steps Bar */}
          <div className="relative flex items-center justify-between">
            {/* Background connecting line */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-warm-300 z-0" />
            {/* Active connecting line */}
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-700 z-0"
              style={{ width: `${(orderTrackingStep / (steps.length - 1)) * 92}%` }}
            />

            {steps.map((step, idx) => {
              const isDone = idx < orderTrackingStep;
              const isCurrent = idx === orderTrackingStep;

              return (
                <div key={step.label} className="relative z-10 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setOrderTrackingStep(idx)}
                    title="Click to simulate step"
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                      isDone
                        ? "bg-brand-600 text-white shadow-sm"
                        : isCurrent
                        ? "bg-brand-600 text-white ring-4 ring-brand-200 shadow-md scale-110"
                        : "bg-white border-2 border-warm-300 text-gray-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <CupSoda className="w-4 h-4 animate-bounce" />
                    ) : (
                      idx + 1
                    )}
                  </button>
                  <span
                    className={`text-[11px] font-bold mt-2 ${
                      isCurrent || isDone ? "text-brand-800" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[9px] text-gray-500 hidden sm:block">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-4">
            (💡 Demo: Click on any step bubble above to simulate order progression)
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-grow bg-white">
          {/* Location & Ready estimate */}
          <div className="bg-warm-50 rounded-2xl p-4 border border-warm-300 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-gray-900">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                {currentOrder.orderType === "pickup" ? "Pickup Location" : "Delivering To"}
              </span>
              <span className="text-brand-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Est: {currentOrder.orderType === "pickup" ? currentOrder.store.pickupTime : currentOrder.deliveryAddress.estTime}
              </span>
            </div>
            <p className="text-gray-600 pl-5">
              {currentOrder.orderType === "pickup"
                ? `${currentOrder.store.name} — ${currentOrder.store.address}`
                : `${currentOrder.deliveryAddress.street}, ${currentOrder.deliveryAddress.city}`}
            </p>
            {currentOrder.orderType === "pickup" && (
              <p className="text-gray-500 pl-5 text-[11px]">
                Head to the mobile pickup counter inside and display Order #{currentOrder.orderId}.
              </p>
            )}
          </div>

          {/* Receipt Items */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-700 mb-2.5">
              Items Ordered ({currentOrder.items.length})
            </h4>
            <div className="divide-y divide-warm-200 border border-warm-300 rounded-2xl p-3 bg-white space-y-2">
              {currentOrder.items.map((item) => (
                <div key={item.uid} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
                  <div>
                    <span className="font-bold text-gray-900">
                      {item.quantity}x {item.name}
                    </span>
                    <p className="text-[11px] text-gray-500">
                      {item.size} • {item.sugar} • {item.ice}
                    </p>
                    {item.toppings.length > 0 && (
                      <p className="text-[10px] text-brand-700">
                        + {item.toppings.map((t) => t.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${item.totalPrice.toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="pt-2.5 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${currentOrder.subtotal.toFixed(2)}</span>
                </div>
                {currentOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-${currentOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                {currentOrder.orderType === "delivery" && (
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{currentOrder.deliveryFee === 0 ? "FREE" : `$${currentOrder.deliveryFee.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax (8.875%)</span>
                  <span>${currentOrder.tax.toFixed(2)}</span>
                </div>
                {currentOrder.tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>${currentOrder.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-warm-200 flex justify-between font-heading font-extrabold text-sm text-gray-900">
                  <span>Total Paid ({currentOrder.paymentMethod})</span>
                  <span className="text-brand-700 text-base">${currentOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-warm-100 border-t border-warm-300 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>SMS updates will be sent to {currentOrder.customerPhone}</span>
          </div>

          <button
            type="button"
            onClick={closeConfirmationModal}
            className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-800 text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 btn-press transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
