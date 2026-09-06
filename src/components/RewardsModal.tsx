"use client";

import React from "react";
import { useOrder } from "@/context/OrderContext";
import {
  X,
  Award,
  Sparkles,
  CupSoda,
  Check,
  Gift,
  PlusCircle,
  Crown
} from "lucide-react";

export default function RewardsModal() {
  const { isRewardsOpen, closeRewardsModal, loyaltyStamps, addLoyaltyStamp } = useOrder();

  if (!isRewardsOpen) return null;

  const totalSlots = 10;
  const stampsRemaining = Math.max(0, totalSlots - loyaltyStamps);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 glass-dark animate-backdrop"
        onClick={closeRewardsModal}
      />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-warm-300 animate-modal overflow-hidden relative z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-6 text-white text-center relative overflow-hidden shrink-0">
          <button
            type="button"
            onClick={closeRewardsModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full mx-auto flex items-center justify-center text-amber-300 mb-2 border border-white/30">
            <Crown className="w-6 h-6" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-warm-200 block mb-1">
            MiTea Loyalty Club
          </span>
          <h3 className="font-heading font-extrabold text-2xl text-white">
            Digital Tea Stamp Card
          </h3>
          <p className="text-xs text-warm-100/90 mt-1">
            Buy 9 drinks, get your 10th handcrafted specialty drink free!
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow bg-white">
          {/* Physical style punch card */}
          <div className="bg-[#FAF7F2] border-2 border-dashed border-warm-400 rounded-3xl p-5 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-heading font-extrabold text-sm text-[#1A1A1A]">
                  Artisan Tea Passport
                </span>
                <p className="text-[11px] text-gray-500">Member #MT-84920</p>
              </div>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                {loyaltyStamps}/10 Stamps
              </span>
            </div>

            {/* 10 Stamp Circles Grid */}
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: totalSlots }).map((_, idx) => {
                const isStamped = idx < loyaltyStamps;
                const isFinalReward = idx === 9;

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative ${
                      isStamped
                        ? "border-brand-600 bg-brand-600 text-white shadow-xs"
                        : isFinalReward
                        ? "border-amber-400 bg-amber-50 text-amber-800"
                        : "border-warm-300 bg-white text-gray-300"
                    }`}
                  >
                    {isStamped ? (
                      <div className="flex flex-col items-center animate-modal">
                        <CupSoda className="w-4 h-4 text-warm-200" />
                        <span className="text-[8px] font-bold mt-0.5">#{idx + 1}</span>
                      </div>
                    ) : isFinalReward ? (
                      <div className="flex flex-col items-center text-center">
                        <Gift className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span className="text-[7px] font-extrabold uppercase mt-0.5 text-amber-700">
                          Free!
                        </span>
                      </div>
                    ) : (
                      <span className="font-heading font-bold text-xs">{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-warm-300 flex items-center justify-between text-xs text-gray-600">
              <span>
                {stampsRemaining === 0 ? (
                  <strong className="text-emerald-700">Reward unlocked! Ready to redeem.</strong>
                ) : (
                  <span>
                    <strong>{stampsRemaining} more drink{stampsRemaining > 1 ? "s" : ""}</strong> until your free drink
                  </span>
                )}
              </span>

              <button
                type="button"
                onClick={addLoyaltyStamp}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-900 bg-white px-2.5 py-1 rounded-lg border border-warm-300 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>Simulate Stamp</span>
              </button>
            </div>
          </div>

          {/* Member Benefits */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-700">
              Member Perks &amp; Privileges
            </h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>Earn 1 stamp with every handcrafted drink ordered online or in café.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>Free 24 oz upgrade and complimentary topping on your birthday month.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>Exclusive invitation to limited seasonal fruit harvests and tea drops.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-warm-100 border-t border-warm-300 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={closeRewardsModal}
            className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-heading font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
