"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import {
  ShoppingBag,
  Search,
  Clock,
  MapPin,
  Phone,
  User,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  Sparkles,
  DollarSign,
  PackageCheck,
  X,
} from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  PREPARING: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  READY: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  READY_FOR_PICKUP: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  OUT_FOR_DELIVERY: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  CANCELLED: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
  READY_FOR_PICKUP: "COMPLETED",
  OUT_FOR_DELIVERY: "COMPLETED",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await apiClient.adminGetOrders({ limit: 100 });
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Poll every 15 seconds for live orders
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const s = o.status?.toUpperCase();
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "ACTIVE" && ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(s)) ||
        s === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Update Status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder({ ...activeOrder, status: newStatus });
      }

      await apiClient.adminUpdateOrderStatus(orderId, newStatus);
      showToast(`Order status set to ${newStatus}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status");
      loadOrders();
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-gray-900">Live Orders & Kitchen Display</h2>
          <p className="text-xs text-gray-500">
            Real-time feed. Orders auto-refresh every 15s. Advance orders with 1 click.
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-600" : ""}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer, phone..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Orders" },
            { id: "ACTIVE", label: "🔥 In Progress" },
            { id: "PENDING", label: "Pending" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "PREPARING", label: "In Prep" },
            { id: "READY", label: "Ready" },
            { id: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading live orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">There are currently no orders in this status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredOrders.map((order) => {
                  const statusKey = order.status?.toUpperCase() || "PENDING";
                  const color = STATUS_COLORS[statusKey] || STATUS_COLORS.PENDING;
                  const nextStatus = NEXT_STATUS[statusKey];
                  const timeString = order.created_at
                    ? new Date(order.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Order Number */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                          {order.order_number || `#${order.id.slice(0, 8)}`}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-heading font-bold text-gray-900">
                          {order.customer_name || "Guest Customer"}
                        </div>
                        {order.customer_phone && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{order.customer_phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Type: Pickup / Delivery */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            order.order_type === "DELIVERY"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {order.order_type || "PICKUP"}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-heading font-extrabold text-sm text-gray-900">
                        ${Number(order.total || 0).toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${color.bg} ${color.text} ${color.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{statusKey.replace("_", " ")}</span>
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{timeString}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {nextStatus && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, nextStatus)}
                              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-[11px] transition-all shadow-xs cursor-pointer"
                            >
                              Move to {nextStatus.replace("_", " ")}
                            </button>
                          )}
                          <button
                            onClick={() => setActiveOrder(order)}
                            title="View Details"
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── ORDER DETAILS MODAL ──────────────────────────────────────────────── */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Order Details
                </span>
                <h3 className="font-heading font-extrabold text-base text-gray-900">
                  {activeOrder.order_number || `#${activeOrder.id.slice(0, 8)}`}
                </h3>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status changer select */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Change Status:</span>
              <select
                value={activeOrder.status?.toUpperCase() || "PENDING"}
                onChange={(e) => handleUpdateStatus(activeOrder.id, e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Customer Details */}
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-900">{activeOrder.customer_name || "Guest"}</span>
              </div>
              {activeOrder.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{activeOrder.customer_phone}</span>
                </div>
              )}
              {activeOrder.delivery_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {typeof activeOrder.delivery_address === "string"
                      ? activeOrder.delivery_address
                      : `${activeOrder.delivery_address.street || ""}, ${activeOrder.delivery_address.city || ""}`}
                  </span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">
                Items Ordered ({activeOrder.order_items?.length || activeOrder.items?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(activeOrder.order_items || activeOrder.items || []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-2.5 bg-gray-50 rounded-xl text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900">
                        {item.quantity}x {item.name || item.item_name}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {item.size && <span>Size: {item.size} • </span>}
                        {item.sugar !== undefined && <span>Sugar: {item.sugar}% • </span>}
                        {item.ice !== undefined && <span>Ice: {item.ice}</span>}
                        {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                          <div className="text-brand-700 font-medium">
                            +{item.toppings.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 text-xs">
                      ${Number(item.total_price || item.totalPrice || item.price || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(activeOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(activeOrder.discount_amount || activeOrder.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-${Number(activeOrder.discount_amount || activeOrder.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(activeOrder.delivery_fee || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${Number(activeOrder.delivery_fee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-heading font-black text-sm text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>${Number(activeOrder.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
