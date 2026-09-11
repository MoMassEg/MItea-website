"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, X, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useOrder } from "@/context/OrderContext";

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useOrder();

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllRead,
  } = useNotifications();

  // Fetch when panel opens (only if logged in)
  useEffect(() => {
    if (isOpen && currentUser) {
      fetchNotifications({ limit: 20 });
    }
  }, [isOpen, currentUser, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  if (!currentUser) return null;

  const iconMap: Record<string, string> = {
    STAMP_EARNED: "🧋",
    REWARD_REDEEMED: "🎁",
    ORDER_PLACED: "📦",
    ORDER_READY: "✅",
    PROMO_APPLIED: "🎉",
    default: "🔔",
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        id="notifications-bell"
        onClick={() => setIsOpen((p) => !p)}
        className="w-10 h-10 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-800 hover:bg-warm-100 transition-colors relative cursor-pointer shadow-2xs"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-warm-200 z-50 overflow-hidden animate-modal">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-[#FAF7F2]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600" />
              <span className="font-heading font-extrabold text-sm text-gray-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg hover:bg-warm-200 text-gray-500 hover:text-brand-600 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-warm-200 text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-warm-100">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1 text-gray-300">
                  Order a drink to earn your first stamp! 🧋
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-warm-50 transition-colors ${
                    !n.isRead ? "bg-brand-50/40" : ""
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">
                    {iconMap[n.type] ?? iconMap.default}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold text-gray-900 ${!n.isRead ? "text-brand-900" : ""}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      title="Mark as read"
                      className="p-1 rounded hover:bg-warm-200 text-gray-400 hover:text-brand-600 transition-colors cursor-pointer shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-warm-200 bg-[#FAF7F2] text-center">
              <button
                type="button"
                onClick={() => fetchNotifications({ limit: 50 })}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
