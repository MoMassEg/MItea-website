"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Coffee,
  Users,
  TicketPercent,
  Store,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";

export type AdminTab = "overview" | "orders" | "products" | "catering" | "users" | "promos" | "store";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  pendingOrdersCount?: number;
  currentUser?: { name?: string; email?: string } | null;
  onLogout?: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingOrdersCount = 0,
  currentUser,
  onLogout,
}: AdminSidebarProps) {
  const navItems = [
    { id: "overview" as AdminTab, label: "Overview", icon: LayoutDashboard },
    {
      id: "orders" as AdminTab,
      label: "Live Orders",
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: "products" as AdminTab, label: "Products & Menu", icon: Coffee },
    { id: "catering" as AdminTab, label: "Catering & Events", icon: UtensilsCrossed },
    { id: "users" as AdminTab, label: "Users & Roles", icon: Users },
    { id: "promos" as AdminTab, label: "Promo Codes", icon: TicketPercent },
    { id: "store" as AdminTab, label: "Store Operations", icon: Store },
  ];

  return (
    <aside className="w-64 bg-[#111827] text-gray-300 flex flex-col shrink-0 border-r border-gray-800 select-none min-h-screen">
      {/* Brand & Back Link */}
      <div className="p-5 border-b border-gray-800/80">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Storefront</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-900/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base text-white tracking-tight">MiTea</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded border border-brand-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Operations Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-900/40 font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white text-brand-700" : "bg-brand-500 text-white animate-pulse"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-gray-800/80 bg-gray-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {currentUser?.email || "admin@mitea.com"}
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
