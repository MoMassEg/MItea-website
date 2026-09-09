"use client";

import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import {
  X,
  Gift,
  Send,
  Sparkles,
  Heart,
  CheckCircle,
  Smartphone,
  Mail,
  Copy,
  Check
} from "lucide-react";

export default function SendGiftModal() {
  const { isSendGiftOpen, closeSendGiftModal, showToast } = useOrder();

  const [recipientName, setRecipientName] = useState("Alex");
  const [recipientContact, setRecipientContact] = useState("alex@example.com");
  const [senderName, setSenderName] = useState("Sarah");
  const [occasion, setOccasion] = useState("Thinking of You 🧋");
  const [amount, setAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState(
    "Hope this artisanal boba brightens your day! Treat yourself to a Brown Sugar Boba or Ceremonial Matcha."
  );
  const [deliveryType, setDeliveryType] = useState<"email" | "sms">("email");
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isSendGiftOpen) return null;

  const occasions = [
    "Thinking of You 🧋",
    "Happy Birthday! 🎂",
    "Big Thank You! 🙏",
    "Study & Work Fuel ⚡️"
  ];

  const amounts = [10, 15, 25, 50];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientContact.trim()) {
      showToast("Please enter recipient name and contact.", "warning");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      showToast(
        `E-Gift Card for $${amount} sent to ${recipientName} via ${deliveryType.toUpperCase()}! 🎁`,
        "success"
      );
    }, 1200);
  };

  const handleReset = () => {
    setIsSent(false);
    closeSendGiftModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 glass-dark animate-backdrop"
        onClick={closeSendGiftModal}
      />

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-warm-300 animate-modal overflow-hidden relative z-10 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-warm-300 flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1A1A1A]">
                Send a Boba to a Friend
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Send an instant digital gift card with a personalized message
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSendGiftModal}
            className="w-8 h-8 rounded-full bg-warm-200 hover:bg-warm-300 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {isSent ? (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Gift Dispatched!
              </span>
              <h4 className="font-heading font-extrabold text-2xl text-gray-900">
                ${amount}.00 Sent to {recipientName}
              </h4>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                A digital tea voucher with your personal message and unique redemption barcode has been dispatched to{" "}
                <strong>{recipientContact}</strong>.
              </p>
            </div>

            {/* Voucher preview badge */}
            <div className="bg-warm-100 p-4 rounded-2xl border border-warm-300 max-w-sm mx-auto flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-gray-800">
                CODE: MT-GIFT-9824
              </span>
              <span className="text-[10px] bg-brand-600 text-white font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="bg-brand-600 hover:bg-brand-700 text-white font-heading font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-grow bg-white">
            {/* Live Gift Card Preview */}
            <div className="relative bg-gradient-to-br from-[#2D5A3D] via-[#244931] to-[#152C1E] rounded-2xl p-5 text-white shadow-xl overflow-hidden border border-brand-700">
              {/* Decorative Wax Seal Stamp */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-warm-400/90 border-2 border-warm-300/80 text-[#2D5A3D] flex flex-col items-center justify-center font-serif font-black text-[9px] shadow-lg rotate-12">
                <span>Mitea</span>
                <span className="text-[7px] uppercase font-sans">Craft</span>
              </div>

              <div className="relative z-10 space-y-3 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                    {occasion}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl sm:text-4xl font-black text-warm-100">
                    ${amount}.00
                  </span>
                  <span className="text-xs text-warm-200">Digital Boba Voucher</span>
                </div>

                <div className="text-xs text-white/90 italic bg-black/20 p-2.5 rounded-xl border border-white/10">
                  &ldquo;{message}&rdquo;
                </div>

                <div className="flex justify-between items-end text-[11px] text-warm-200 pt-1">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-warm-400 font-bold">
                      To
                    </span>
                    <span className="font-bold text-white text-sm">{recipientName || "Friend"}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-wider text-warm-400 font-bold">
                      From
                    </span>
                    <span className="font-bold text-white text-sm">{senderName || "You"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Select Occasion */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">
                1. Select Occasion
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {occasions.map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setOccasion(occ)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      occasion === occ
                        ? "border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-xs"
                        : "border-warm-300 hover:bg-warm-100 text-gray-700"
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Amount */}
            <div>
              <label className="block font-heading font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">
                2. Gift Amount
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-2.5 rounded-xl border text-sm font-heading font-extrabold text-center transition-all cursor-pointer ${
                      amount === amt && !customAmount
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                        : "border-warm-300 hover:bg-warm-100 text-gray-800"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient & Sender Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Recipient&apos;s Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>

            {/* Delivery Method */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Send Via
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType("email")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    deliveryType === "email"
                      ? "border-brand-600 bg-brand-50 text-brand-900"
                      : "border-warm-300 text-gray-600"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("sms")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    deliveryType === "sms"
                      ? "border-brand-600 bg-brand-50 text-brand-900"
                      : "border-warm-300 text-gray-600"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> SMS Text
                </button>
              </div>

              <input
                type={deliveryType === "email" ? "email" : "tel"}
                required
                placeholder={deliveryType === "email" ? "recipient@example.com" : "(612) 555-0199"}
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
                className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-600 mt-1"
              />
            </div>

            {/* Personal Message */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Personal Note
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-warm-100 border border-warm-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-600 resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-brand-600 hover:bg-brand-800 text-white font-heading font-bold text-sm py-3.5 px-6 rounded-full shadow-lg shadow-brand-600/20 btn-press transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSending ? "Sending Digital Card..." : `Send $${amount}.00 Boba Gift Now`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
