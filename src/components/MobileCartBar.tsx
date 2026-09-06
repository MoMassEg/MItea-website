"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function MobileCartBar() {
  const { totalItems, total, openCartDrawer } = useOrder();

  if (totalItems === 0) return null;

  return (
    <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
      <button
        type="button"
        onClick={openCartDrawer}
        className="w-full bg-brand-600 hover:bg-brand-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between font-heading font-bold transition-all btn-press border border-brand-500/30 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold">${total.toFixed(2)}</span>
          <span className="text-xs font-semibold bg-white/25 px-2.5 py-1 rounded-full flex items-center gap-1">
            View Cart <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>
    </div>
  );
}
