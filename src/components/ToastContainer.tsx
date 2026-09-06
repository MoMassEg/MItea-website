"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const { toasts } = useOrder();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-gray-700 text-sm font-medium animate-modal transition-all"
        >
          {toast.type === "warning" ? (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : toast.type === "info" ? (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
