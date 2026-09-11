"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { AdminTab } from "./AdminSidebar";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Coffee,
  TicketPercent,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";

interface AdminOverviewProps {
  onNavigate: (tab: AdminTab) => void;
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const res = await apiClient.adminGetStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const todayRevenue = stats?.todayRevenue ?? 0;
  const todayOrders = stats?.todayOrders ?? 0;
  const avgOrderValue = stats?.averageOrderValue ?? 0;
  const totalOrders = stats?.totalOrders ?? 0;
  const breakdown = stats?.statusBreakdown || {
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-800 to-brand-950 p-6 rounded-3xl text-white shadow-sm border border-gray-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/20 px-2.5 py-0.5 rounded-full border border-brand-500/30">
              Live Operations
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              System Active
            </span>
          </div>
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">MiTea Management Hub</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitor real-time sales, fulfill active boba orders, and update your menu catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStats}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-800/80 hover:bg-gray-700 text-xs font-bold rounded-xl border border-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-brand-400" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate("orders")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-900/40 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>View Live Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Revenue</p>
            <h3 className="text-2xl font-heading font-black text-gray-900 mt-1">
              ${todayRevenue.toFixed(2)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{todayOrders} orders processed</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending & In Prep</p>
            <h3 className="text-2xl font-heading font-black text-brand-600 mt-1">
              {(breakdown.PENDING || 0) + (breakdown.CONFIRMED || 0) + (breakdown.PREPARING || 0)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              {breakdown.PENDING || 0} waiting confirmation
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Order Value</p>
            <h3 className="text-2xl font-heading font-black text-gray-900 mt-1">
              ${avgOrderValue.toFixed(2)}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Per transaction today</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Lifetime Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lifetime Orders</p>
            <h3 className="text-2xl font-heading font-black text-gray-900 mt-1">
              {totalOrders}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">All time registered</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Order Pipeline Status Pill Strip */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Kitchen Pipeline</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-center">
            <p className="text-[11px] font-semibold text-amber-700">Pending</p>
            <p className="text-xl font-heading font-bold text-amber-900 mt-0.5">{breakdown.PENDING || 0}</p>
          </div>
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 text-center">
            <p className="text-[11px] font-semibold text-blue-700">Confirmed</p>
            <p className="text-xl font-heading font-bold text-blue-900 mt-0.5">{breakdown.CONFIRMED || 0}</p>
          </div>
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3 text-center">
            <p className="text-[11px] font-semibold text-purple-700">In Prep</p>
            <p className="text-xl font-heading font-bold text-purple-900 mt-0.5">{breakdown.PREPARING || 0}</p>
          </div>
          <div className="bg-teal-50/80 border border-teal-200/80 rounded-xl p-3 text-center">
            <p className="text-[11px] font-semibold text-teal-700">Ready</p>
            <p className="text-xl font-heading font-bold text-teal-900 mt-0.5">{breakdown.READY || 0}</p>
          </div>
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-center">
            <p className="text-[11px] font-semibold text-emerald-700">Completed</p>
            <p className="text-xl font-heading font-bold text-emerald-900 mt-0.5">{breakdown.COMPLETED || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate("products")}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-brand-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Coffee className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-gray-900 group-hover:text-brand-700 transition-colors">
            Products & Menu
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Add new drinks, adjust prices, and toggle out-of-stock items.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-brand-600 mt-3">
            <span>Manage Menu</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate("catering")}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-brand-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-gray-900 group-hover:text-amber-700 transition-colors">
            Catering & Events
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Review event requests, quotes, guest counts, and booking statuses.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-3">
            <span>Review Inquiries</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate("users")}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-brand-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-gray-900 group-hover:text-purple-700 transition-colors">
            Users & Roles
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            View customer profiles, assign Admin roles, and oversee accounts.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-600 mt-3">
            <span>Users Directory</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate("promos")}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-brand-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <TicketPercent className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">
            Promo Codes
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Create coupon codes, set percentage discounts, and toggle active promotions.
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-3">
            <span>Manage Vouchers</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  );
}
