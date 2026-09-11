"use client";

import React, { useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";
import { apiClient } from "@/lib/api-client";
import {
  X,
  Award,
  Sparkles,
  CupSoda,
  Check,
  Gift,
  Crown,
  Copy,
  ArrowRight,
  History,
  Clock,
  Loader2
} from "lucide-react";

export default function RewardsModal() {
  const {
    isRewardsOpen,
    closeRewardsModal,
    loyaltyStamps,
    setLoyaltyStamps,
    applyPromo,
    showToast,
    currentUser,
  } = useOrder();

  const [activeTab, setActiveTab] = useState<"card" | "history">("card");
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isRedeeming, setIsRedeeming] = useState(false);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Task 11: load loyalty history when history tab is active
  useEffect(() => {
    if (activeTab === "history" && currentUser) {
      let mounted = true;
      setHistoryLoading(true);
      apiClient
        .get<{ success: boolean; history: any[] }>("/api/loyalty/history")
        .then((res) => {
          if (mounted && res?.history) setHistory(res.history);
        })
        .catch(() => {})
        .finally(() => {
          if (mounted) setHistoryLoading(false);
        });
      return () => {
        mounted = false;
      };
    }
  }, [activeTab, currentUser]);

  if (!isRewardsOpen) return null;

  const totalSlots = 10;
  const stampsRemaining = Math.max(0, totalSlots - loyaltyStamps);

  const handleCopy = () => {
    if (!unlockedCode) return;
    navigator.clipboard.writeText(unlockedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast("Reward code copied to clipboard!", "success");
  };

  const handleApplyReward = async () => {
    if (!unlockedCode) return;
    await applyPromo(unlockedCode);
    closeRewardsModal();
  };

  const handleRedeemReward = async () => {
    if (loyaltyStamps < 10) {
      showToast("Collect 10 stamps first to unlock your free drink!", "warning");
      return;
    }

    setIsRedeeming(true);
    try {
      let code = "";
      if (currentUser) {
        const data = await apiClient.post<{ promoCode?: string }>("/api/loyalty/redeem");
        if (!data?.promoCode) {
          throw new Error("Failed to redeem reward");
        }
        code = data.promoCode;
      } else {
        // Guest/Local mode demo
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        code = `FREE-MTEA-${rand}`;
      }

      setUnlockedCode(code);
      setLoyaltyStamps(0);
      showToast("🎉 100% OFF Free Drink Voucher generated!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to redeem reward", "warning");
    } finally {
      setIsRedeeming(false);
    }
  };

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
            Mitea Loyalty Club
          </span>
          <h3 className="font-heading font-extrabold text-2xl text-white">
            Digital Tea Stamp Card
          </h3>
          <p className="text-xs text-warm-100/90 mt-1">
            Buy 9 drinks, get your 10th handcrafted specialty drink free!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-warm-200 bg-warm-50/50 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === "card"
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Punch Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 px-4 text-xs font-heading font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity History</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow bg-white">
          {activeTab === "card" && (
            <>
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

                <div className="mt-4 pt-3 border-t border-warm-300 text-center text-xs text-gray-600">
                  {stampsRemaining === 0 ? (
                    <strong className="text-emerald-700">Reward unlocked! Ready to redeem.</strong>
                  ) : (
                    <span>
                      <strong>{stampsRemaining} more drink{stampsRemaining > 1 ? "s" : ""}</strong> until your free drink
                    </span>
                  )}
                </div>
              </div>

              {/* Unlocked Reward Voucher */}
              {unlockedCode && (
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-heading font-extrabold text-sm uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Free Drink Voucher Unlocked!</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-emerald-300 font-mono font-bold text-gray-900 text-sm max-w-xs mx-auto">
                    <span>{unlockedCode}</span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1 hover:bg-emerald-50 rounded text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      title="Copy code"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleApplyReward}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Apply to Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Ready to Redeem Banner */}
              {loyaltyStamps >= 10 && !unlockedCode && (
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <h5 className="font-heading font-extrabold text-sm">🎉 You have 10 Stamps!</h5>
                    <p className="text-xs text-amber-100">Claim your 100% OFF Free Drink coupon now.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRedeemReward}
                    disabled={isRedeeming}
                    className="bg-white hover:bg-warm-50 text-amber-900 text-xs font-heading font-extrabold uppercase px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    {isRedeeming ? "Redeeming..." : "Claim Free Drink 🎁"}
                  </button>
                </div>
              )}

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
            </>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-700">
                  Stamp &amp; Reward Activity
                </h4>
                <span className="text-[11px] text-gray-500">
                  {history.length} event{history.length === 1 ? "" : "s"}
                </span>
              </div>

              {historyLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                  <span className="text-xs">Loading activity...</span>
                </div>
              ) : !currentUser ? (
                <div className="bg-[#FAF7F2] border border-warm-300 rounded-2xl p-6 text-center space-y-2">
                  <Award className="w-8 h-8 text-brand-600 mx-auto" />
                  <h5 className="font-heading font-bold text-sm text-gray-900">Sign in to track history</h5>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Create an account or sign in to sync your tea passport stamps and view your reward history across devices.
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="bg-[#FAF7F2] border border-warm-300 rounded-2xl p-6 text-center space-y-2">
                  <CupSoda className="w-8 h-8 text-warm-400 mx-auto" />
                  <h5 className="font-heading font-bold text-sm text-gray-900">No stamp activity yet</h5>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Order handcrafted drinks or redeem tea rewards to see your milestone logs here!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {history.map((item) => {
                    const isEarned = item.type === "STAMP_EARNED";
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-warm-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-warm-300 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isEarned
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}
                          >
                            {isEarned ? (
                              <CupSoda className="w-4 h-4" />
                            ) : (
                              <Gift className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {item.description || (isEarned ? "Tea Stamp Earned" : "Reward Redeemed")}
                            </p>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(item.created_at).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold font-mono shrink-0 px-2 py-0.5 rounded-full ${
                            isEarned
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {isEarned ? "+1 Stamp" : "Free Drink"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
