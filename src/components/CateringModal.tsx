"use client";

import React, { useState, useMemo } from "react";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA, MenuItem } from "@/data/menu-data";
import {
  X,
  Sparkles,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  PartyPopper,
  Coffee,
  HeartHandshake,
  Send,
  ShieldCheck,
  Truck,
  Percent,
  Sliders,
  Flame,
  Check
} from "lucide-react";

interface CustomDrinkSelection {
  item: MenuItem;
  quantity: number;
  sugar: string;
  milk: string;
}

interface CustomToppingSelection {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomBakerySelection {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CateringModal() {
  const { isCateringOpen, closeCateringModal, addToCart, openCartDrawer, showToast } = useOrder();

  const [activeTab, setActiveTab] = useState<"builder" | "packages" | "custom">("builder");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Package tab quantities ──
  const [packageQuantities, setPackageQuantities] = useState<Record<string, number>>({
    "catering-artisan-boba-bar": 1,
    "catering-grand-celebration-bar": 1,
    "catering-mochi-donut-platter": 1,
    "catering-party-tea-jug": 1,
  });

  // ── Custom Builder State ──
  const [formatType, setFormatType] = useState<"cups" | "jugs">("cups");

  // Popular customizable drinks for catering
  const cateringDrinkCandidates = useMemo(() => {
    return MENU_DATA.items.filter(
      (item) => item.category !== "catering" && item.category !== "snacks"
    );
  }, []);

  // Drink selections: item.id -> { item, quantity, sugar, milk }
  const [drinkSelections, setDrinkSelections] = useState<Record<string, CustomDrinkSelection>>({
    "brown-sugar-boba-milk": {
      item: MENU_DATA.items.find((i) => i.id === "brown-sugar-boba-milk") || MENU_DATA.items[0],
      quantity: 10,
      sugar: "50% Sweet",
      milk: "Fresh Whole Milk",
    },
    "uji-matcha-latte": {
      item: MENU_DATA.items.find((i) => i.id === "uji-matcha-latte") || MENU_DATA.items[1],
      quantity: 8,
      sugar: "50% Sweet",
      milk: "Organic Oat Milk",
    },
    "roasted-oolong-milk-tea": {
      item: MENU_DATA.items.find((i) => i.id === "roasted-oolong-milk-tea") || MENU_DATA.items[2],
      quantity: 7,
      sugar: "50% Sweet",
      milk: "Fresh Whole Milk",
    },
  });

  // Topping selections
  const [toppingsSelection, setToppingsSelection] = useState<Record<string, CustomToppingSelection>>({
    "slow-cooked-boba": {
      id: "slow-cooked-boba",
      name: "Slow-Cooked Kokuto Boba (Portions)",
      price: 0.65,
      quantity: 20,
    },
    "lychee-jelly": {
      id: "lychee-jelly",
      name: "Lychee Coconut Jelly (Portions)",
      price: 0.65,
      quantity: 15,
    },
    "mango-popping": {
      id: "mango-popping",
      name: "Mango Popping Boba (Portions)",
      price: 0.75,
      quantity: 0,
    },
    "cheese-foam": {
      id: "cheese-foam",
      name: "Salted Cheese Cream Foam (Tub)",
      price: 12.00,
      quantity: 0,
    },
  });

  // Bakery selections
  const [bakerySelection, setBakerySelection] = useState<Record<string, CustomBakerySelection>>({
    "donut-12": {
      id: "donut-12",
      name: "Pon de Ring Mochi Donuts (12 Pack)",
      desc: "Assorted Matcha, Black Sesame, Strawberry & Kokuto glazes",
      price: 34.0,
      image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=400&q=80",
      quantity: 1,
    },
    "donut-24": {
      id: "donut-24",
      name: "Pon de Ring Mochi Donuts (24 Pack)",
      desc: "Deluxe party tower of 24 pull-apart mochi donuts",
      price: 68.0,
      image: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=400&q=80",
      quantity: 0,
    },
    "daifuku-16": {
      id: "daifuku-16",
      name: "Artisan Daifuku Mochi Platter (16 Pack)",
      desc: "Soft handmade sweet red bean, mango & kinako mochi",
      price: 26.0,
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80",
      quantity: 0,
    },
  });

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

  // ── Calculation helpers ──
  const totalDrinksCount = Object.values(drinkSelections).reduce(
    (sum, d) => sum + (d.quantity || 0),
    0
  );

  const drinksSubtotal = Object.values(drinkSelections).reduce(
    (sum, d) => sum + (d.quantity || 0) * (formatType === "jugs" ? 48.0 : d.item.price),
    0
  );

  const toppingsSubtotal = Object.values(toppingsSelection).reduce(
    (sum, t) => sum + (t.quantity || 0) * t.price,
    0
  );

  const bakerySubtotal = Object.values(bakerySelection).reduce(
    (sum, b) => sum + (b.quantity || 0) * b.price,
    0
  );

  const rawSubtotal = drinksSubtotal + toppingsSubtotal + bakerySubtotal;

  // Volume discount: 10% for 20+ drinks, 15% for 40+ drinks
  const discountPercent = totalDrinksCount >= 40 ? 15 : totalDrinksCount >= 20 ? 10 : 0;
  const discountAmount = Number(((rawSubtotal * discountPercent) / 100).toFixed(2));
  const customTotal = Math.max(0, rawSubtotal - discountAmount);

  // ── Handlers for Custom Builder ──
  const handleUpdateDrinkQty = (itemId: string, item: MenuItem, delta: number) => {
    setDrinkSelections((prev) => {
      const current = prev[itemId] || {
        item,
        quantity: 0,
        sugar: "50% Sweet",
        milk: "Fresh Whole Milk",
      };
      const newQty = Math.max(0, current.quantity + delta);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...current, quantity: newQty },
      };
    });
  };

  const handleUpdateDrinkPreference = (
    itemId: string,
    field: "sugar" | "milk",
    val: string
  ) => {
    setDrinkSelections((prev) => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: val,
        },
      };
    });
  };

  const handleUpdateToppingQty = (id: string, delta: number) => {
    setToppingsSelection((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const newQty = Math.max(0, current.quantity + delta);
      return {
        ...prev,
        [id]: { ...current, quantity: newQty },
      };
    });
  };

  const handleUpdateBakeryQty = (id: string, delta: number) => {
    setBakerySelection((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const newQty = Math.max(0, current.quantity + delta);
      return {
        ...prev,
        [id]: { ...current, quantity: newQty },
      };
    });
  };

  // Add Entire Custom Order to Cart
  const handleAddCustomOrderToCart = () => {
    if (totalDrinksCount === 0 && bakerySubtotal === 0) {
      showToast("Please select at least one drink or bakery item.", "warning");
      return;
    }

    // Add each selected drink item to the cart
    Object.values(drinkSelections).forEach((entry) => {
      if (entry.quantity > 0) {
        addToCart({
          id: `catering-custom-${entry.item.id}`,
          name: `${entry.item.name} (${formatType === "jugs" ? "1-Gal Jug" : "Catering Cup"})`,
          image: entry.item.image,
          size: formatType === "jugs" ? "1 Gallon (Serves 10)" : "16 oz Catering Pack",
          sizePrice: 0,
          sugar: entry.sugar,
          ice: "Chilled with Ice Kit",
          toppings: [
            { id: "catering-service", name: `${entry.milk} · Straws & Napkins Included`, price: 0 }
          ],
          basePrice: formatType === "jugs" ? 48.0 : entry.item.price,
          unitPrice: formatType === "jugs" ? 48.0 : entry.item.price,
          quantity: entry.quantity,
        });
      }
    });

    // Add toppings if any selected
    Object.values(toppingsSelection).forEach((top) => {
      if (top.quantity > 0) {
        addToCart({
          id: `catering-topping-${top.id}`,
          name: `Catering Topping: ${top.name}`,
          image: MENU_DATA.items[0].image,
          size: "Bulk Pack",
          sizePrice: 0,
          sugar: "Standard",
          ice: "None",
          toppings: [],
          basePrice: top.price,
          unitPrice: top.price,
          quantity: top.quantity,
        });
      }
    });

    // Add bakery if any selected
    Object.values(bakerySelection).forEach((bakery) => {
      if (bakery.quantity > 0) {
        addToCart({
          id: `catering-bakery-${bakery.id}`,
          name: bakery.name,
          image: bakery.image,
          size: "Bakery Platter",
          sizePrice: 0,
          sugar: "Glazed",
          ice: "None",
          toppings: [],
          basePrice: bakery.price,
          unitPrice: bakery.price,
          quantity: bakery.quantity,
        });
      }
    });

    showToast(
      `Added custom catering bundle (${totalDrinksCount} drinks) to your cart! 🧋🎉`,
      "success"
    );
    closeCateringModal();
    openCartDrawer();
  };

  // Add Pre-set Package with quantity
  const handleAddPackageWithQty = (item: (typeof cateringItems)[0]) => {
    const qty = packageQuantities[item.id] || 1;
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
      quantity: qty,
    });
    showToast(`Added ${qty}x ${item.name} to cart! 🧋`, "success");
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
      style={{ background: "rgba(18, 6, 2, 0.82)", backdropFilter: "blur(10px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCateringModal();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-3xl shadow-2xl border border-warm-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="bg-[#1C0902] text-warm-50 px-6 py-5 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-amber/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-amber to-amber-700 flex items-center justify-center shadow-lg shrink-0">
              <PartyPopper className="w-6 h-6 text-[#120602]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-warm-50 tracking-tight">
                  MiTea Artisan Catering
                </h3>
                <span className="bg-accent-amber/20 border border-accent-amber/40 text-accent-amber text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Custom Orders
                </span>
              </div>
              <p className="text-xs text-warm-300 mt-0.5 font-light">
                Choose your exact drinks, toppings &amp; quantities — freshly steeped for 10 to 500+ guests
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

        {/* ── 3 Tabs Switcher ── */}
        <div className="flex border-b border-warm-200 bg-warm-100/70 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab("builder");
              setIsSubmitted(false);
            }}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "builder"
                ? "border-brand-600 text-brand-900 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-warm-600 hover:text-brand-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-accent-amber" />
            <span>Build Your Order (Custom)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("packages");
              setIsSubmitted(false);
            }}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "packages"
                ? "border-brand-600 text-brand-900 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-warm-600 hover:text-brand-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Pre-Set Party Packages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-heading font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "custom"
                ? "border-brand-600 text-brand-900 bg-white rounded-t-xl shadow-xs"
                : "border-transparent text-warm-600 hover:text-brand-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>Event Quote Request</span>
          </button>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-grow">
          {/* TAB 1: CUSTOM CATERING BUILDER */}
          {activeTab === "builder" && (
            <div className="space-y-6">
              {/* Serving format & discounts banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-amber/20 text-accent-amber flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-amber-950">
                    <span className="font-bold block">Bulk Catering Discount:</span>
                    <span>10% OFF at 20+ drinks · 15% OFF at 40+ drinks. Includes cups, straws &amp; ice kit!</span>
                  </div>
                </div>

                {/* Serving Format Switcher */}
                <div className="flex items-center bg-white border border-amber-300/80 rounded-xl p-0.5 shrink-0 self-stretch sm:self-auto justify-center">
                  <button
                    type="button"
                    onClick={() => setFormatType("cups")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formatType === "cups"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-warm-700 hover:text-brand-900"
                    }`}
                  >
                    Individual Cups
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormatType("jugs")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formatType === "jugs"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-warm-700 hover:text-brand-900"
                    }`}
                  >
                    1-Gal Jugs (10–12 serv)
                  </button>
                </div>
              </div>

              {/* ── STEP 1: Choose Your Drinks & Quantities ── */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-warm-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-950">
                      Select Drinks &amp; How Many
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-accent-amber font-mono">
                    {totalDrinksCount} {formatType === "jugs" ? "jugs" : "cups"} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {cateringDrinkCandidates.map((drink) => {
                    const sel = drinkSelections[drink.id];
                    const qty = sel?.quantity || 0;
                    const price = formatType === "jugs" ? 48.0 : drink.price;

                    return (
                      <div
                        key={drink.id}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          qty > 0
                            ? "bg-white border-accent-amber shadow-sm ring-1 ring-accent-amber/40"
                            : "bg-white/70 border-warm-200 hover:border-warm-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={drink.image}
                            alt={drink.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 bg-warm-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="font-heading font-bold text-xs sm:text-sm text-brand-950 truncate">
                                {drink.name}
                              </h5>
                            </div>
                            <div className="text-xs font-editorial font-bold text-brand-700 mt-0.5">
                              ${price.toFixed(2)}{" "}
                              <span className="font-sans font-normal text-[10px] text-warm-500">
                                {formatType === "jugs" ? "/ gallon" : "/ cup"}
                              </span>
                            </div>

                            {/* Preference Dropdowns when selected */}
                            {qty > 0 && formatType === "cups" && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <select
                                  value={sel?.sugar || "50% Sweet"}
                                  onChange={(e) =>
                                    handleUpdateDrinkPreference(drink.id, "sugar", e.target.value)
                                  }
                                  className="bg-warm-100 text-[10px] font-medium text-brand-900 border border-warm-300 rounded px-1.5 py-0.5 focus:outline-none"
                                >
                                  <option value="50% Sweet">50% Sugar</option>
                                  <option value="100% Sweet">100% Sugar</option>
                                  <option value="0% Unsweet">0% Sugar</option>
                                </select>

                                <select
                                  value={sel?.milk || "Fresh Whole Milk"}
                                  onChange={(e) =>
                                    handleUpdateDrinkPreference(drink.id, "milk", e.target.value)
                                  }
                                  className="bg-warm-100 text-[10px] font-medium text-brand-900 border border-warm-300 rounded px-1.5 py-0.5 focus:outline-none"
                                >
                                  <option value="Fresh Whole Milk">Whole Milk</option>
                                  <option value="Organic Oat Milk">Oat Milk</option>
                                  <option value="Dairy-Free">Dairy-Free</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-warm-100">
                          <span className="text-[11px] text-warm-500 font-medium">Quantity:</span>
                          <div className="flex items-center gap-1.5">
                            {qty > 0 && (
                              <button
                                type="button"
                                onClick={() => handleUpdateDrinkQty(drink.id, drink, -1)}
                                className="w-7 h-7 rounded-lg bg-warm-200 hover:bg-warm-300 text-brand-900 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <span
                              className={`w-8 text-center font-bold text-xs font-mono ${
                                qty > 0 ? "text-brand-900 text-sm" : "text-gray-400"
                              }`}
                            >
                              {qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleUpdateDrinkQty(drink.id, drink, 1)}
                              className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick +5 button */}
                            <button
                              type="button"
                              onClick={() => handleUpdateDrinkQty(drink.id, drink, 5)}
                              className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] transition-colors cursor-pointer ml-1"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── STEP 2: Choose Toppings & Mix-ins ── */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-warm-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-950">
                      Add Toppings &amp; Pearls
                    </h4>
                  </div>
                  <span className="text-[11px] text-warm-500">Includes serving ladles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(toppingsSelection).map((top) => (
                    <div
                      key={top.id}
                      className="bg-white border border-warm-200 rounded-2xl p-3 flex items-center justify-between hover:border-warm-300 transition-all"
                    >
                      <div>
                        <h5 className="font-heading font-bold text-xs text-brand-900">{top.name}</h5>
                        <span className="text-xs font-editorial font-bold text-brand-600">
                          +${top.price.toFixed(2)}{" "}
                          <span className="font-sans font-normal text-[10px] text-warm-500">ea</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {top.quantity > 0 && (
                          <button
                            type="button"
                            onClick={() => handleUpdateToppingQty(top.id, -5)}
                            className="w-7 h-7 rounded-lg bg-warm-200 hover:bg-warm-300 text-brand-900 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span
                          className={`w-7 text-center font-bold text-xs font-mono ${
                            top.quantity > 0 ? "text-brand-900" : "text-gray-400"
                          }`}
                        >
                          {top.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateToppingQty(top.id, 5)}
                          className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── STEP 3: Mochi Donut Platters & Bakery ── */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-warm-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="font-heading font-extrabold text-sm sm:text-base text-brand-950">
                      Add Mochi Donuts &amp; Bakery Platters
                    </h4>
                  </div>
                  <span className="text-[11px] text-warm-500">Baked fresh event morning</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.values(bakerySelection).map((bakery) => (
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
                        <h5 className="font-heading font-bold text-xs text-brand-900 leading-tight">
                          {bakery.name}
                        </h5>
                        <p className="text-[10px] text-warm-600 mt-0.5 line-clamp-2">{bakery.desc}</p>
                        <div className="text-xs font-editorial font-bold text-brand-700 mt-1">
                          ${bakery.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-warm-100">
                        <span className="text-[10px] text-warm-500 font-medium">Qty:</span>
                        <div className="flex items-center gap-1">
                          {bakery.quantity > 0 && (
                            <button
                              type="button"
                              onClick={() => handleUpdateBakeryQty(bakery.id, -1)}
                              className="w-6 h-6 rounded-md bg-warm-200 hover:bg-warm-300 text-brand-900 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          <span className="w-6 text-center font-bold text-xs font-mono">
                            {bakery.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateBakeryQty(bakery.id, 1)}
                            className="w-6 h-6 rounded-md bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── LIVE STICKY ORDER TOTAL & ADD TO CART BAR ── */}
              <div className="bg-[#1C0902] text-warm-50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-warm-800">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-warm-200">
                      {totalDrinksCount} {formatType === "jugs" ? "Jugs" : "Drinks"}
                    </span>
                    <span className="text-warm-600">·</span>
                    <span className="text-warm-300">
                      {Object.values(toppingsSelection).reduce((s, t) => s + t.quantity, 0)} Toppings
                    </span>
                    <span className="text-warm-600">·</span>
                    <span className="text-warm-300">
                      {Object.values(bakerySelection).reduce((s, b) => s + b.quantity, 0)} Platters
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-editorial text-2xl sm:text-3xl font-bold text-accent-amber">
                      ${customTotal.toFixed(2)}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-xs text-emerald-400 font-medium line-through">
                        ${rawSubtotal.toFixed(2)} ({discountPercent}% Bulk Off)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomOrderToCart}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-accent-amber to-amber-500 hover:from-accent-gold hover:to-amber-400 text-[#120602] font-heading font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Custom Order to Cart</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-SET PARTY PACKAGES */}
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
                {cateringItems.map((pkg) => {
                  const qty = packageQuantities[pkg.id] || 1;

                  return (
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
                            ${(pkg.price * qty).toFixed(2)}
                          </span>
                        </div>

                        <h4 className="font-heading font-bold text-sm text-brand-950 leading-snug">
                          {pkg.name}
                        </h4>
                        <p className="text-xs text-warm-600 mt-1.5 leading-relaxed line-clamp-3">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Quantity Selector + Add Button */}
                      <div className="mt-4 pt-3 border-t border-warm-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-warm-500 font-medium">Qty:</span>
                          <button
                            type="button"
                            onClick={() =>
                              setPackageQuantities((prev) => ({
                                ...prev,
                                [pkg.id]: Math.max(1, (prev[pkg.id] || 1) - 1),
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-warm-200 hover:bg-warm-300 text-brand-900 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs font-mono">{qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setPackageQuantities((prev) => ({
                                ...prev,
                                [pkg.id]: (prev[pkg.id] || 1) + 1,
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddPackageWithQty(pkg)}
                          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-warm-50 text-xs font-heading font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add ({qty})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Need custom headcount banner */}
              <div className="border-t border-warm-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <h5 className="font-heading font-bold text-xs text-brand-900 uppercase tracking-wide">
                    Want to customize every single tea flavor and topping?
                  </h5>
                  <p className="text-xs text-warm-600">
                    Use our live Custom Order Builder to select exact items and quantities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("builder")}
                  className="shrink-0 text-xs font-bold text-accent-amber hover:text-amber-800 underline cursor-pointer"
                >
                  Open Custom Builder →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM EVENT REQUEST FORM */}
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
                    { id: "barista", label: "Live Barista", desc: "Crafted on-demand" },
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
