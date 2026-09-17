"use client";

import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { apiClient } from '@/lib/api-client';
import {
  X,
  Users,
  CheckCircle2,
  Plus,
  Minus,
  PartyPopper,
  Send,
  ShieldCheck,
} from "lucide-react";

interface CustomBakerySelection {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  quantity: number;
}

interface CateringPackage {
  id: string;
  badge: string;
  badgeClass: string;
  people: string;
  name: string;
  price: number;
  description: string;
  guest: string;
  style: "delivery" | "setup" | "barista";
  buttonClass: string;
}

const CATERING_PACKAGES: CateringPackage[] = [
  {
    id: "drop-off",
    badge: "First Option · Pick a size",
    badgeClass: "text-[#E35843] bg-[#E35843]/10",
    people: "10 - 25 people",
    name: "The Drop-Off",
    price: 180,
    description:
      "A tray of pre-made drinks in your pick of four flavours, plus two dozen mochi donuts. Delivered cold and ready.",
    guest: "15–30 guests",
    style: "delivery",
    buttonClass: "bg-[#F8847F] hover:bg-[#F56B65] text-white",
  },
  {
    id: "mitea-bar",
    badge: "Second Option · Most Popular",
    badgeClass: "text-black bg-gradient-to-r from-[#DF9749] to-amber-400",
    people: "25 - 75 people",
    name: "The MiTea Bar",
    price: 350,
    description:
      "We set up on site and make drinks to order with sugar, ice and toppings chosen by each guest, same as in the shop.",
    guest: "35–50 guests",
    style: "barista",
    buttonClass: "bg-gradient-to-r from-[#DF9749] to-amber-400 hover:brightness-105 text-black",
  },
  {
    id: "whole-thing",
    badge: "3rd Option · Full Service",
    badgeClass: "text-[#F8847F] bg-[#F8847F]/10",
    people: "75+ people",
    name: "The Whole Thing",
    price: 520,
    description:
      "Full bar service, a donut tower, and staff for the length of your event. Tell us the room and we'll plan it.",
    guest: "55–100 guests",
    style: "setup",
    buttonClass: "bg-[#F8847F] hover:bg-[#F56B65] text-white",
  },
];

const BAKERY_ITEMS: CustomBakerySelection[] = [
  {
    id: "donut-12",
    name: "Pon de Ring Mochi Donuts (12 Pack)",
    desc: "Assorted Matcha, Black Sesame, Strawberry & Kokuto glazes",
    price: 34.0,
    image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=400&q=80",
    quantity: 0,
  },
  {
    id: "donut-24",
    name: "Pon de Ring Mochi Donuts (24 Pack)",
    desc: "Deluxe party tower of 24 pull-apart mochi donuts",
    price: 68.0,
    image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=400&q=80",
    quantity: 0,
  },
  {
    id: "daifuku-16",
    name: "Artisan Daifuku Mochi Platter (16 Pack)",
    desc: "Soft handmade sweet red bean, mango & kinako mochi",
    price: 26.0,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
    quantity: 0,
  },
];

export default function CateringModal() {
  const { isCateringOpen, closeCateringModal, showToast } = useOrder();

  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string>("#MTC-9482");

  // Bakery platter quantities (id -> quantity)
  const [bakeryQty, setBakeryQty] = useState<Record<string, number>>({});

  // Quote form state
  const [eventType, setEventType] = useState("Corporate Gathering");
  const [guestCount, setGuestCount] = useState("35–50 guests");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("12:00 PM");
  const [serviceStyle, setServiceStyle] = useState<"delivery" | "setup" | "barista">("setup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  if (!isCateringOpen) return null;

  const selectedPackage = CATERING_PACKAGES.find((p) => p.id === selectedExperience) || null;

  // ── Calculations ──
  const bakeryCount = Object.values(bakeryQty).reduce((sum, q) => sum + (q || 0), 0);
  const bakerySubtotal = BAKERY_ITEMS.reduce((sum, b) => sum + (bakeryQty[b.id] || 0) * b.price, 0);
  const estimatedTotal = bakerySubtotal + (selectedPackage ? selectedPackage.price : 0);
  const itemCount = bakeryCount + (selectedExperience ? 1 : 0);

  // Step 1: select one of the 3 experience packages (click again to deselect)
  const handleSelectExperience = (pkg: CateringPackage) => {
    const isSelected = selectedExperience === pkg.id;
    setSelectedExperience(isSelected ? null : pkg.id);
    setGuestCount(pkg.guest);
    setServiceStyle(pkg.style);
    setNotes(isSelected ? "" : `Selected Experience Package: ${pkg.name}`);
    showToast(
      isSelected
        ? "Experience deselected."
        : `Selected ${pkg.name}! Add bakery platters below, then fill in your event details.`,
      "info"
    );
    if (!isSelected) {
      setTimeout(() => {
        document.getElementById("catering-step-bakery")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleUpdateBakeryQty = (id: string, delta: number) => {
    setBakeryQty((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !eventDate.trim()) {
      showToast("Please fill in your name, email, and event date.", "warning");
      return;
    }
    if (!selectedExperience && bakeryCount === 0) {
      showToast("Please pick an experience package above, or add at least 1 bakery platter.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        orderDetails: {
          mode: "custom" as const,
          drinks: [],
          toppings: [],
          packages: selectedPackage
            ? [
                {
                  packageId: selectedPackage.id,
                  name: `${selectedPackage.name} (${selectedPackage.people})`,
                  quantity: 1,
                  unitPrice: selectedPackage.price,
                },
              ]
            : [],
          bakery: BAKERY_ITEMS.filter((b) => (bakeryQty[b.id] || 0) > 0).map((b) => ({
            id: b.id,
            name: b.name,
            quantity: bakeryQty[b.id],
            unitPrice: b.price,
          })),
        },
        eventType,
        guestCount,
        eventDate,
        eventTime: eventTime || undefined,
        serviceStyle,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const data = await apiClient.post<{ request?: { request_number?: string } }>("/api/catering/requests", payload);
      if (!data) {
        throw new Error('Failed to submit catering request');
      }

      if (data.request?.request_number) {
        setSubmittedRequestNumber(data.request.request_number);
      }
      setIsSubmitted(true);
      showToast("Catering inquiry submitted! We'll follow up within 2 hours.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to submit request. Please try again.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    closeCateringModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCateringModal();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FFFAF8] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="bg-gradient-to-r from-[#F8847F] via-[#F56B65] to-[#E14E47] text-white px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md shrink-0">
              <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white truncate">
                Catering &amp; Events
              </h3>
              <p className="text-[11px] text-white/85 font-medium">
                Pick a package, add platters, get your quote
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCateringModal}
            className="relative z-10 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-grow">
          {!isSubmitted && (
            <div className="space-y-5 sm:space-y-6">
              {/* ── STEP 1: Choose Your Experience (3 Packages) ── */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-warm-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F8847F] text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-gray-900">
                      Choose Your Experience
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-500">Pick a size &amp; experience</span>
                </div>

                <div className="space-y-3">
                  {CATERING_PACKAGES.map((pkg) => {
                    const isSelected = selectedExperience === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        className={`bg-white border-2 rounded-2xl p-4 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? "border-[#F8847F] ring-2 ring-[#F8847F]/30 bg-[#FFF8F6]"
                            : "border-warm-200 hover:border-[#E35843]"
                        }`}
                      >
                        <div className="space-y-1 max-w-lg">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[9px] font-heading font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${pkg.badgeClass}`}
                            >
                              {pkg.badge}
                            </span>
                            <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {pkg.people}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-heading font-extrabold text-base text-gray-900">
                              {pkg.name}
                            </h4>
                            <span className="font-editorial text-xl font-bold text-[#E14E47]">
                              ${pkg.price}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{pkg.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectExperience(pkg)}
                          className={`shrink-0 text-xs font-heading font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer text-center ${
                            isSelected
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : pkg.buttonClass
                          }`}
                        >
                          {isSelected ? "✓ Selected" : `Plan ${pkg.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── STEP 2: Mochi Donuts & Bakery Platters ── */}
              <div id="catering-step-bakery" className="scroll-mt-4">
                <div className="flex items-center justify-between mb-3 border-b border-warm-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F8847F] text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-gray-900">
                      Add Mochi Donuts &amp; Bakery Platters
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-500">Baked fresh event morning</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BAKERY_ITEMS.map((bakery) => {
                    const qty = bakeryQty[bakery.id] || 0;
                    return (
                      <div
                        key={bakery.id}
                        className="bg-white border border-warm-200 rounded-2xl p-3 flex flex-col justify-between hover:border-warm-300 transition-all"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bakery.image}
                          alt={bakery.name}
                          className="w-full h-20 rounded-xl object-cover mb-2 bg-warm-200"
                        />
                        <div>
                          <h5 className="font-heading font-bold text-xs text-gray-900 leading-tight">
                            {bakery.name}
                          </h5>
                          <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-2">{bakery.desc}</p>
                          <div className="text-xs font-editorial font-bold text-[#E14E47] mt-1">
                            ${bakery.price.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-warm-100">
                          <span className="text-[10px] text-gray-500 font-medium">Qty:</span>
                          <div className="flex items-center gap-1">
                            {qty > 0 && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBakeryQty(bakery.id, -1)}
                                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )}
                            <span className="w-6 text-center font-bold text-xs font-mono">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateBakeryQty(bakery.id, 1)}
                              className="w-6 h-6 rounded-md bg-[#F8847F] hover:bg-[#F56B65] text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── STEP 3: EVENT DETAILS & OFFICIAL QUOTE REQUEST ── */}
              <div id="catering-quote-form" className="scroll-mt-4 pt-4 border-t-2 border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DF9749] text-black font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-gray-900">
                      Event Details &amp; Official Quote Request
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#DF9749] font-bold">Free Quote in 2h</span>
                </div>
                <p className="text-xs text-gray-600 mb-4 pl-8">
                  Provide your event details below to receive a formal itemized quote &amp; date hold.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Event Type & Headcount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Event Type
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      >
                        <option value="Corporate Gathering">🏢 Corporate / Office Meeting</option>
                        <option value="Wedding / Reception">💍 Wedding &amp; Rehearsal Dinner</option>
                        <option value="Birthday / Party">🎂 Birthday &amp; Private Celebration</option>
                        <option value="University / School">🎓 Campus / Student Event</option>
                        <option value="Festival / Other">🎪 Festival &amp; Pop-Up</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Expected Headcount
                      </label>
                      <select
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      >
                        <option value="15–30 guests">15–30 Guests</option>
                        <option value="35–50 guests">35–50 Guests</option>
                        <option value="55–100 guests">55–100 Guests</option>
                        <option value="100–250 guests">100–250 Guests</option>
                        <option value="250+ guests">250+ Large Gala / Expo</option>
                      </select>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Desired Serving Time
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      />
                    </div>
                  </div>

                  {/* Service Style */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                      Service Setup
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "delivery", label: "Drop-Off Delivery", desc: "Insulated boxes & cups" },
                        { id: "setup", label: "Buffet Setup", desc: "Table display & signage" },
                        { id: "barista", label: "Live Barista", desc: "Crafted on-demand" },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setServiceStyle(style.id as "delivery" | "setup" | "barista")}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            serviceStyle === style.id
                              ? "border-[#F8847F] bg-[#FFF8F6] text-gray-900 shadow-xs ring-1 ring-[#F8847F]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span className="font-bold text-xs block">{style.label}</span>
                          <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">
                            {style.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Work / Personal Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="jane@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="(612) 555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="Acme Corp / Private"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                      Event Venue / Delivery Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 100 Washington Ave S, Minneapolis, MN"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                      Flavor Preferences or Special Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Need 50% oat milk, preference for Uji Matcha and Roasted Oolong, extra mochi donuts..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#F8847F]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#F8847F] via-[#F56B65] to-[#E14E47] hover:brightness-105 text-white font-heading font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Processing Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          Submit Catering Quote Request{" "}
                          {itemCount > 0 ? `(${itemCount} Items · $${estimatedTotal.toFixed(2)})` : "(Custom Order)"}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SUBMITTED SUCCESS SCREEN */}
          {isSubmitted && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
                Catering Request Received!
              </h4>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{fullName || "Guest"}</strong>. Our dedicated catering manager is reviewing your event details for <strong>{eventDate || "your upcoming date"}</strong> ({guestCount}).
              </p>

              <div className="bg-white border border-warm-300 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-warm-200 pb-1.5">
                  <span className="text-gray-500">Inquiry ID:</span>
                  <span className="font-mono font-bold text-gray-900">{submittedRequestNumber}</span>
                </div>
                <div className="flex justify-between border-b border-warm-200 pb-1.5">
                  <span className="text-gray-500">Event Type:</span>
                  <span className="font-medium text-gray-900">{eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Response:</span>
                  <span className="font-bold text-[#DF9749]">Within 2 Business Hours</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-[#F8847F] hover:bg-[#F56B65] text-white font-heading font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer Guarantee Strip ── */}
        <div className="bg-[#FFF8F6] px-6 py-3 border-t border-[#F5DFD5] flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed 100% Fresh Steeping on Event Morning</span>
          </div>
          <div className="font-medium text-[#E14E47]">
            Questions? Call Catering Line: <strong>(763) 555-0192</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
