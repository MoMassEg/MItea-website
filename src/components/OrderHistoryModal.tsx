"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrder } from "@/context/OrderContext";
import { apiClient } from "@/lib/api-client";
import {
  X,
  Clock,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  AlertCircle,
  Loader2,
  Receipt,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Ban,
  CheckCircle2
} from "lucide-react";

interface OrderHistoryItem {
  id: string;
  order_number?: string;
  orderNumber?: string;
  status: string;
  total: number | string;
  subtotal?: number | string;
  tax?: number | string;
  delivery_fee?: number | string;
  discount?: number | string;
  tip?: number | string;
  order_type?: string;
  orderType?: string;
  created_at: string;
  createdAt?: string;
  delivery_address?: string | null;
  items?: Array<{
    id?: string;
    name?: string;
    item_name?: string;
    quantity: number;
    unit_price?: number | string;
    unitPrice?: number | string;
    size?: string;
    sugar?: string;
    ice?: string;
    toppings?: any;
    image_url?: string;
  }>;
}

export default function OrderHistoryModal() {
  const {
    isOrderHistoryOpen,
    closeOrderHistoryModal,
    currentUser,
    openAuthModal,
    showToast,
  } = useOrder();

  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOrderHistoryOpen) return;

    if (!currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    apiClient
      .getOrders({ limit: 50 })
      .then((res) => {
        if (!isMounted) return;
        if (res?.orders) {
          setOrders(res.orders);
        } else {
          setOrders([]);
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err?.message || "Unable to retrieve order history at this time.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOrderHistoryOpen, currentUser]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === "ALL") return orders;
    return orders.filter((o) => {
      const status = (o.status || "").toUpperCase();
      if (filterStatus === "ACTIVE") {
        return ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(status);
      }
      if (filterStatus === "COMPLETED") {
        return ["DELIVERED", "COMPLETED"].includes(status);
      }
      if (filterStatus === "CANCELLED") {
        return ["CANCELLED", "REFUNDED"].includes(status);
      }
      return status === filterStatus;
    });
  }, [orders, filterStatus]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      setCancellingId(orderId);
      await apiClient.cancelOrder(orderId, "Customer requested cancellation");
      showToast("Order cancelled successfully.", "info");
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
      );
    } catch (err: any) {
      showToast(err?.message || "Failed to cancel order. Please contact store support.", "warning");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "COMPLETED":
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {s === "DELIVERED" ? "Delivered" : "Completed"}
          </span>
        );
      case "CANCELLED":
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <Ban className="w-3.5 h-3.5 text-red-600" />
            Cancelled
          </span>
        );
      case "PREPARING":
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            In Kitchen
          </span>
        );
      case "READY_FOR_PICKUP":
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 border border-brand-200">
            <PackageCheck className="w-3.5 h-3.5 text-brand-600" />
            Ready
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warm-100 text-warm-800 border border-warm-200">
            <Clock className="w-3.5 h-3.5 text-warm-600" />
            {s || "Pending"}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOrderHistoryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-warm-200 flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-warm-900 p-6 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl" />

          <button
            type="button"
            onClick={closeOrderHistoryModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Order History"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Receipt className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Order History & Receipts
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                Track your active brews and view previous orders
              </p>
            </div>
          </div>

          {/* Status Filter Tabs (if user is logged in) */}
          {currentUser && (
            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pt-1">
              {[
                { id: "ALL", label: "All Orders" },
                { id: "ACTIVE", label: "Active" },
                { id: "COMPLETED", label: "Completed" },
                { id: "CANCELLED", label: "Cancelled" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    filterStatus === f.id
                      ? "bg-white text-brand-800 shadow-md font-bold"
                      : "bg-white/15 text-white/90 hover:bg-white/25"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-warm-50/50 space-y-4">
          {/* Guest State: Not logged in */}
          {!currentUser ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
                <Receipt className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-warm-900 font-heading">
                  Sign in to view your Order History
                </h3>
                <p className="text-sm text-warm-600 mt-1">
                  Log into your MiTea VIP account to see past drink orders, download receipts, and re-order your favorite handcrafted teas with one click.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeOrderHistoryModal();
                  openAuthModal();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Sign In or Create Account
              </button>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="text-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-warm-600">Retrieving your handcrafted orders...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Error loading orders</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-warm-100 text-warm-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-warm-900 font-heading">
                  {filterStatus === "ALL" ? "No orders found" : `No ${filterStatus.toLowerCase()} orders`}
                </h3>
                <p className="text-sm text-warm-500 mt-1 max-w-sm mx-auto">
                  {filterStatus === "ALL"
                    ? "You haven't placed any orders yet. Fresh organic teas and house-made mochi are waiting!"
                    : `You have no orders matching the "${filterStatus.toLowerCase()}" filter.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeOrderHistoryModal();
                  const el = document.getElementById("menu-sections");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-warm-900 hover:bg-black text-white font-semibold text-xs transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            /* Order List */
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const orderNum = order.order_number || order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`;
                const isExpanded = expandedOrderId === order.id;
                const orderDate = order.created_at || order.createdAt || new Date().toISOString();
                const totalAmount = Number(order.total || 0).toFixed(2);
                const orderType = order.order_type || order.orderType || "pickup";
                const isPendingOrConfirmed = ["PENDING", "CONFIRMED"].includes((order.status || "").toUpperCase());
                const itemsList = order.items || [];
                const itemCount = itemsList.reduce((acc, it) => acc + (it.quantity || 1), 0);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Order summary header */}
                    <div
                      className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-sm text-warm-900">
                            {orderNum}
                          </span>
                          {getStatusBadge(order.status)}
                          <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-warm-100 text-warm-700">
                            {orderType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-warm-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-warm-400" />
                            {formatDate(orderDate)}
                          </span>
                          <span>•</span>
                          <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-warm-100">
                        <div className="text-right">
                          <span className="text-xs text-warm-400 block sm:hidden">Total</span>
                          <span className="font-heading font-extrabold text-base text-warm-900">
                            ${totalAmount}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-warm-500 hover:bg-warm-100 transition-colors"
                          aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Order Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-warm-100 bg-warm-50/40 text-xs text-warm-700 space-y-3">
                        {/* Items list */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-[11px] uppercase tracking-wider text-warm-500">
                            Ordered Items
                          </h4>
                          {itemsList.length > 0 ? (
                            itemsList.map((item, idx) => {
                              const itemName = item.name || item.item_name || "Handcrafted Drink";
                              const itemPrice = Number(item.unit_price || item.unitPrice || 0).toFixed(2);
                              const itemToppings = Array.isArray(item.toppings)
                                ? item.toppings.map((t: any) => (typeof t === "string" ? t : t.name)).join(", ")
                                : null;

                              return (
                                <div
                                  key={idx}
                                  className="flex items-start justify-between py-1.5 border-b border-warm-100 last:border-0"
                                >
                                  <div>
                                    <div className="font-semibold text-warm-900">
                                      {item.quantity}x {itemName}
                                    </div>
                                    <div className="text-[11px] text-warm-500 space-x-2">
                                      {item.size && <span>{item.size}</span>}
                                      {item.sugar && <span>• {item.sugar} Sugar</span>}
                                      {item.ice && <span>• {item.ice}</span>}
                                    </div>
                                    {itemToppings && (
                                      <div className="text-[10px] text-brand-700 font-medium">
                                        + {itemToppings}
                                      </div>
                                    )}
                                  </div>
                                  <div className="font-mono font-medium text-warm-800">
                                    ${(Number(itemPrice) * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-warm-400 italic">No item details available</p>
                          )}
                        </div>

                        {/* Price summary */}
                        <div className="bg-white p-3 rounded-xl border border-warm-200 space-y-1 text-xs">
                          {order.subtotal && (
                            <div className="flex justify-between text-warm-600">
                              <span>Subtotal</span>
                              <span>${Number(order.subtotal).toFixed(2)}</span>
                            </div>
                          )}
                          {order.discount && Number(order.discount) > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Discount</span>
                              <span>-${Number(order.discount).toFixed(2)}</span>
                            </div>
                          )}
                          {order.delivery_fee && Number(order.delivery_fee) > 0 && (
                            <div className="flex justify-between text-warm-600">
                              <span>Delivery Fee</span>
                              <span>${Number(order.delivery_fee).toFixed(2)}</span>
                            </div>
                          )}
                          {order.tip && Number(order.tip) > 0 && (
                            <div className="flex justify-between text-warm-600">
                              <span>Tip</span>
                              <span>${Number(order.tip).toFixed(2)}</span>
                            </div>
                          )}
                          {order.tax && (
                            <div className="flex justify-between text-warm-600">
                              <span>Tax</span>
                              <span>${Number(order.tax).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-warm-900 border-t border-warm-100 pt-1 mt-1 text-sm">
                            <span>Total</span>
                            <span className="text-brand-700 font-heading">${totalAmount}</span>
                          </div>
                        </div>

                        {/* Order Actions */}
                        {isPendingOrConfirmed && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelOrder(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                            >
                              {cancellingId === order.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3 h-3" />
                                  Cancel Order
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-warm-100 border-t border-warm-200 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-warm-500">
            Need help with an order? Call us at <span className="font-semibold text-warm-700">(415) 890-2832</span>
          </p>
          <button
            type="button"
            onClick={closeOrderHistoryModal}
            className="px-4 py-2 rounded-xl bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
