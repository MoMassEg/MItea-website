"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clock,
  MapPin,
  Sparkles,
  CupSoda,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Loader2,
  XCircle,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  order_type: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  tax: number;
  tip: number;
  delivery_fee?: number;
  discount?: number;
  total: number;
  payment_method?: string;
  estimated_ready_time?: string;
  created_at?: string;
  items?: Array<{
    id?: string;
    item_name?: string;
    name?: string;
    size?: string;
    sugar?: string;
    ice?: string;
    toppings?: string[];
    notes?: string;
    quantity: number;
    unit_price?: number;
    total_price?: number;
  }>;
  stores?: {
    name: string;
    address: string;
  };
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("id");
  const redirectStatus = searchParams.get("redirect_status");
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFailed = redirectStatus === "failed";

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId!)}`);
        if (!res.ok) {
          throw new Error("Order details could not be found.");
        }
        const data = await res.json();
        if (isMounted) {
          setOrder(data.order);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load order information.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    // Poll for status updates if order is in progress
    const interval = setInterval(fetchOrder, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId]);

  const steps = [
    { label: "Received", desc: "Sent to kitchen", status: "PENDING" },
    { label: "Preparing", desc: "Steeping & Shaking", status: "PREPARING" },
    { label: "Ready", desc: "At pickup counter", status: "READY" },
    { label: "Completed", desc: "Enjoy your boba!", status: "COMPLETED" },
  ];

  const getActiveStep = (status?: string) => {
    const s = status?.toUpperCase();
    if (s === "COMPLETED") return 3;
    if (s === "READY") return 2;
    if (s === "PREPARING") return 1;
    return 0;
  };

  const activeStep = getActiveStep(order?.status);

  return (
    <div className="min-h-screen bg-warm-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Top brand icon */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand-700 hover:text-brand-800 transition-colors font-bold text-xl"
          >
            <CupSoda className="w-7 h-7 text-brand-600" />
            <span>MiTea Artisanal Boba</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-warm-300 overflow-hidden">
          {/* Header Banner */}
          <div
            className={`p-6 sm:p-8 text-white text-center relative overflow-hidden ${
              isFailed
                ? "bg-gradient-to-r from-red-600 to-rose-800"
                : "bg-gradient-to-r from-brand-600 to-brand-800"
            }`}
          >
            <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
              {isFailed ? (
                <XCircle className="w-9 h-9 text-red-600" />
              ) : (
                <CheckCircle className="w-9 h-9 text-brand-600" />
              )}
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-warm-200 block mb-1">
              {isFailed ? "Payment Verification" : "Order Confirmed"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              {isFailed ? "Payment Incomplete" : "Thank You for Your Order!"}
            </h1>

            {order?.order_number && (
              <div className="mt-3 inline-block px-4 py-1.5 bg-black/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-mono font-medium tracking-wide">
                Order #{order.order_number}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-warm-600">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
                <p className="text-sm font-medium">Loading your order details...</p>
              </div>
            ) : error && !order ? (
              <div className="text-center py-8">
                <p className="text-warm-700 mb-4">{error}</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Home
                </Link>
              </div>
            ) : (
              <>
                {/* Live Progress Tracker */}
                {!isFailed && order?.status !== "CANCELLED" && (
                  <div className="bg-warm-50 p-5 rounded-2xl border border-warm-200">
                    <h2 className="text-xs font-bold uppercase text-warm-500 tracking-wider mb-4 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Live Kitchen Tracker
                    </h2>
                    <div className="grid grid-cols-4 gap-2 relative">
                      {steps.map((step, idx) => {
                        const isDone = idx <= activeStep;
                        const isCurrent = idx === activeStep;
                        return (
                          <div key={step.label} className="text-center relative">
                            <div
                              className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                                  : "bg-warm-200 text-warm-500"
                              } ${isCurrent ? "ring-4 ring-brand-300 scale-110" : ""}`}
                            >
                              {idx === 0 && <Clock className="w-4 h-4" />}
                              {idx === 1 && <CupSoda className="w-4 h-4" />}
                              {idx === 2 && <PackageCheck className="w-4 h-4" />}
                              {idx === 3 && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <span
                              className={`text-xs font-semibold block mt-2 ${
                                isCurrent ? "text-brand-800 font-bold" : isDone ? "text-warm-900" : "text-warm-400"
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="text-[10px] text-warm-500 hidden sm:block">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pickup / Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-warm-200 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-warm-500 block">
                        {order?.order_type === "delivery" ? "Delivery Destination" : "Pickup Location"}
                      </span>
                      <p className="text-sm font-semibold text-warm-900">
                        {order?.stores?.name || "Golden Valley Flagship"}
                      </p>
                      <p className="text-xs text-warm-600">
                        {order?.stores?.address || "7800 Olson Memorial Hwy, Golden Valley, MN"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-warm-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-warm-500 block">
                        Estimated Ready Time
                      </span>
                      <p className="text-sm font-semibold text-warm-900">
                        {order?.estimated_ready_time
                          ? new Date(order.estimated_ready_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "15-20 minutes"}
                      </p>
                      <p className="text-xs text-warm-600">
                        Payment: {order?.payment_status === "PAID" ? "Paid Online" : "Confirmed"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order?.items && order.items.length > 0 && (
                  <div className="border-t border-warm-200 pt-5">
                    <h3 className="text-sm font-bold text-warm-800 mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-brand-600" /> Items in this Order
                    </h3>
                    <div className="divide-y divide-warm-100 max-h-56 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between items-start text-sm">
                          <div>
                            <p className="font-semibold text-warm-900">
                              {item.quantity}x {item.item_name || item.name || "Boba Item"}
                            </p>
                            <p className="text-xs text-warm-500">
                              {[
                                item.size && item.size !== "Standard" && `Size: ${item.size}`,
                                item.toppings && item.toppings.length > 0 && `Toppings: ${item.toppings.join(", ")}`,
                                (item.notes) && `Notes: ${item.notes}`,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-warm-800 ml-4">
                            ${Number(item.total_price || (item.unit_price ? item.unit_price * item.quantity : 0)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                {order && (
                  <div className="border-t border-warm-200 pt-4 space-y-1.5 text-xs text-warm-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-warm-800">${Number(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {Number(order.delivery_fee || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-medium text-warm-800">${Number(order.delivery_fee).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(order.discount || 0) > 0 && (
                      <div className="flex justify-between text-brand-700 font-medium">
                        <span>Promo Discount</span>
                        <span>-${Number(order.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Sales Tax (8.025%)</span>
                      <span className="font-medium text-warm-800">${Number(order.tax || 0).toFixed(2)}</span>
                    </div>
                    {Number(order.tip || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Tip</span>
                        <span className="font-medium text-warm-800">${Number(order.tip).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-warm-900 pt-2 border-t border-warm-200">
                      <span>Total</span>
                      <span className="text-brand-700">${Number(order.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/"
                    className="flex-1 py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-center transition-colors shadow-sm inline-flex items-center justify-center gap-2 text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Menu & Order More
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
