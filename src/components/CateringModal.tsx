"use client";

import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA } from "@/data/menu-data";
import {
  X,
  Sparkles,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  ShoppingBag,
  PartyPopper,
  Coffee,
  HeartHandshake,
  Send,
  ShieldCheck,
  Truck
} from "lucide-react";

export default function CateringModal() {
  const { isCateringOpen, closeCateringModal, addToCart, openCartDrawer, showToast } = useOrder();

  const [activeTab, setActiveTab] = useState<"packages" | "custom">("packages");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Form state
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

  const cateringItems = MENU_DATA.items.filter((i) => i.category === "catering");

  const handleAddPackage = (item: (typeof cateringItems)[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      image: item.image,
      size: "Catering Pack",
      sizePrice: 0,
      sugar: "Regular Sweet (50%)",
      ice: "Chilled with Ice Station",
      toppings: [{ id: "boba-pack", name: "Slow-Cooked Kokuto Boba Included", price: 0 }],
      basePrice: item.price,
      unitPrice: item.price,
      quantity: 1
    });
    showToast(`Added ${item.name} to cart! 🧋`, "success");
    closeCateringModal();
    openCartDrawer();
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !eventDate.trim()) {
      showToast("Please fill in your name, email, and event date.", "warning");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast("Catering inquiry submitted! We'll follow up within 2 hours.", "success");
    }, 1200);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    closeCateringModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(18, 6, 2, 0.78)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCateringModal();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-3xl shadow-2xl border border-warm-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="bg-[#1C0902] text-warm-50 px-6 py-5 flex items-start justify-between relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-accent-amber/10 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-amber to-amber-700 flex items-center justify-center shadow-lg shrink-0">
              <PartyPopper className="w-6 h-6 text-[#120602]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-xl text-warm-50 tracking-tight">
                  MiTea Artisan Catering
                </h3>
                <span className="bg-accent-amber/20 border border-accent-amber/40 text-accent-amber text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Twin Cities
                </span>
              </div>
              <p className="text-xs text-warm-300 mt-0.5 font-light">
                Freshly brewed boba bars &amp; mochi donut platters for 10 to 500+ guests
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCateringModal}
            className="relative z-10 text-warm-400 hover:text-warm-100 p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex border-b border-warm-200 bg-warm-100/70 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("packages");
              setIsSubmitted(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "packages"
                ? "border-brand-600 text-brand-900 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-warm-600 hover:text-brand-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
            <span>Instant Packages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "custom"
                ? "border-brand-600 text-brand-900 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-warm-600 hover:text-brand-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>Custom Quote Request</span>
          </button>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* TAB 1: INSTANT PARTY PACKAGES */}
          {activeTab === "packages" && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center gap-3">
                <Truck className="w-5 h-5 text-accent-amber shrink-0" />
                <div className="text-xs text-amber-950">
                  <span className="font-bold">Free Twin Cities Delivery</span> on orders over $150.
                  Includes cups, wide straws, napkins, and thermal dispensers.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cateringItems.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white border border-warm-200 rounded-2xl p-4 flex flex-col justify-between hover:border-accent-amber/50 hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Image + Badge */}
                      <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-warm-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-[#1C0902]/85 backdrop-blur-md text-accent-amber font-heading font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                          {pkg.badge}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-white/95 text-brand-900 font-editorial font-bold text-base px-2.5 py-0.5 rounded-lg shadow-sm">
                          ${pkg.price.toFixed(2)}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-sm text-brand-950 leading-snug">
                        {pkg.name}
                      </h4>
                      <p className="text-xs text-warm-600 mt-1.5 leading-relaxed line-clamp-3">
                        {pkg.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPackage(pkg)}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-warm-50 text-xs font-heading font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Order · ${pkg.price.toFixed(2)}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Need custom headcount banner */}
              <div className="border-t border-warm-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h5 className="font-heading font-bold text-xs text-brand-900 uppercase tracking-wide">
                    Hosting 75+ Guests or Need Live Barista Service?
                  </h5>
                  <p className="text-xs text-warm-600">
                    We bring interactive boba bars with professional on-site tea baristas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("custom")}
                  className="shrink-0 text-xs font-bold text-accent-amber hover:text-amber-800 underline cursor-pointer"
                >
                  Request Custom Quote →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM EVENT REQUEST FORM */}
          {activeTab === "custom" && !isSubmitted && (
            <form onSubmit={handleSubmitCustom} className="space-y-4">
              {/* Event Type & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2.5 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                  >
                    <option value="Corporate Gathering">🏢 Corporate / Office Meeting</option>
                    <option value="Wedding / Reception">💍 Wedding &amp; Rehearsal Dinner</option>
                    <option value="Birthday / Party">🎂 Birthday &amp; Private Celebration</option>
                    <option value="University / School">🎓 Campus / Student Event</option>
                    <option value="Festival / Other">🎪 Festival &amp; Pop-Up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Expected Headcount
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2.5 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
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
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Desired Serving Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              {/* Service Style */}
              <div>
                <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1.5">
                  Service Setup
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "delivery", label: "Drop-Off Delivery", desc: "Insulated boxes & cups" },
                    { id: "setup", label: "Buffet Setup", desc: "Table display & signage" },
                    { id: "barista", label: "Live Barista", desc: "Crafted on-demand" }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setServiceStyle(style.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        serviceStyle === style.id
                          ? "border-brand-600 bg-brand-50 text-brand-900 shadow-xs"
                          : "border-warm-300 bg-white text-warm-700 hover:border-warm-400"
                      }`}
                    >
                      <span className="font-bold text-xs block">{style.label}</span>
                      <span className="text-[10px] text-warm-500 block leading-tight mt-0.5">
                        {style.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Work / Personal Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(612) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Corp / Private"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                  Delivery Venue Address (Twin Cities Metro)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100 Washington Ave S, Minneapolis, MN"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-warm-300 rounded-xl px-3 py-2 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-warm-800 uppercase tracking-wider mb-1">
                  Flavor Preferences or Special Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need 50% oat milk, preference for Uji Matcha and Roasted Oolong, extra mochi donuts..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-warm-300 rounded-xl p-3 text-xs text-brand-900 focus:outline-none focus:border-brand-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-700 to-brand-900 hover:from-brand-800 hover:to-brand-950 text-white font-heading font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-accent-amber" />
                    <span>Submit Catering Request</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* SUBMITTED SUCCESS SCREEN */}
          {isSubmitted && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-extrabold text-2xl text-brand-950 tracking-tight">
                Catering Request Received!
              </h4>
              <p className="text-xs text-warm-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{fullName || "Guest"}</strong>. Our dedicated catering manager is reviewing your event details for <strong>{eventDate || "your upcoming date"}</strong> ({guestCount}).
              </p>

              <div className="bg-white border border-warm-300 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-warm-200 pb-1.5">
                  <span className="text-warm-500">Inquiry ID:</span>
                  <span className="font-mono font-bold text-brand-900">#MTC-9482</span>
                </div>
                <div className="flex justify-between border-b border-warm-200 pb-1.5">
                  <span className="text-warm-500">Event Type:</span>
                  <span className="font-medium text-brand-900">{eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-500">Target Response:</span>
                  <span className="font-bold text-accent-amber">Within 2 Business Hours</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-heading font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer Guarantee Strip ── */}
        <div className="bg-warm-100 px-6 py-3 border-t border-warm-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-warm-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed 100% Fresh Steeping on Event Morning</span>
          </div>
          <div className="font-medium text-brand-700">
            Questions? Call Catering Line: <strong>(763) 555-0192</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
