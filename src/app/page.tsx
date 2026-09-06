"use client";

import React, { useMemo } from "react";
import { useOrder } from "@/context/OrderContext";
import { MENU_DATA, MenuItem } from "@/data/menu-data";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import CartDrawer from "@/components/CartDrawer";
import LocationModal from "@/components/LocationModal";
import CheckoutModal from "@/components/CheckoutModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import MobileCartBar from "@/components/MobileCartBar";
import StorySection from "@/components/StorySection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";
import PressQuotes from "@/components/PressQuotes";
import LocationsDirectory from "@/components/LocationsDirectory";
import SendGiftModal from "@/components/SendGiftModal";
import RewardsModal from "@/components/RewardsModal";
import CateringModal from "@/components/CateringModal";
import {
  Search,
  XCircle,
  Sparkles,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery, openCateringModal } = useOrder();

  const filteredSections = useMemo(() => {
    let items = MENU_DATA.items;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q)
      );

      return [
        {
          id: "search-results",
          name: `Search Results for "${searchQuery}"`,
          description: `Found ${items.length} delicious item${items.length !== 1 ? "s" : ""}`,
          items: items
        }
      ];
    }

    if (activeCategory === "all") {
      const sections = MENU_DATA.categories
        .filter((cat) => cat.id !== "all")
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: getCategoryDescription(cat.id),
          items: items.filter((item) => item.category === cat.id)
        }))
        .filter((sec) => sec.items.length > 0);

      const popularItems = items.filter((item) => item.popular);
      return [
        {
          id: "most-popular",
          name: "Most Popular & House Specialties",
          description: "Our customer-favorite handcrafted milk teas, fruit blends, and mochi",
          items: popularItems
        },
        ...sections
      ];
    } else {
      const targetCategory = MENU_DATA.categories.find((c) => c.id === activeCategory);
      return [
        {
          id: activeCategory,
          name: targetCategory?.name || "Menu",
          description: getCategoryDescription(activeCategory),
          items: items.filter((item) => item.category === activeCategory)
        }
      ];
    }
  }, [activeCategory, searchQuery]);

  function getCategoryDescription(catId: string): string {
    switch (catId) {
      case "catering":
        return "Pop-up boba bars, party gallon jugs, and fresh mochi donut platters for meetings, weddings & gatherings (10–500+ guests)";
      case "milk-tea":
        return "Whole loose leaf teas infused with fresh organic dairy, coconut milk, and oat milk";
      case "fruit-tea":
        return "Shaken with real crushed fruits, premium jasmine green, and spring oolong teas";
      case "fresh-tea":
        return "Unsweetened single-origin mountain teas brewed to golden perfection";
      case "energy":
        return "Naturally invigorating blends enriched with green coffee, matcha, and electrolytes";
      case "no-caffeine":
        return "Creamy decaf and herbal fruit sensations suitable for any hour";
      case "desserts":
        return "Chewy Pon de Ring mochi donuts and artisanal Japanese rice cakes handcrafted daily";
      case "snacks":
        return "Authentic street food favorites tossed with fresh basil and Taiwanese 5-spice";
      default:
        return "Handcrafted beverages and delicacies";
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 2. Sticky Header */}
      <Header />

      {/* 4. Main Body */}
      <main className="flex-grow">
        {/* Sticky Horizontal Category Nav (Menu is First) */}
        <CategoryNav />

        {/* Menu Grid Content */}
        <div id="menu-sections" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {searchQuery && (
            <div className="mb-6 bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-brand-900">
                <Search className="w-4 h-4 text-brand-600" />
                <span>
                  Filtering menu for <strong>&ldquo;{searchQuery}&rdquo;</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Clear Filter</span>
              </button>
            </div>
          )}

          {/* Dedicated VIP Catering Showcase Banner on Main Page */}
          {!searchQuery && (
            <div className="mb-10 rounded-3xl bg-gradient-to-br from-[#1E0B04] via-[#2D1208] to-[#120602] border-2 border-accent-amber/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-warm-50">
              {/* Ambient Gold Glow */}
              <div className="absolute -right-12 -top-12 w-80 h-80 bg-accent-amber/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-72 h-72 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-amber/20 border border-accent-amber/40 text-accent-amber text-[11px] font-heading font-extrabold uppercase tracking-widest mb-3">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>👑 VIP Events &amp; Office Catering</span>
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-warm-50 tracking-tight leading-tight">
                    Pop-Up Boba Bars &amp; Fresh Donut Platters
                  </h2>
                  <p className="text-xs sm:text-sm text-warm-300 font-light mt-2 leading-relaxed">
                    Elevate your next corporate meeting, wedding, or celebration. Choose ready-to-serve party jugs or customize your exact drink choices, toppings, and fresh mochi donuts. Dispensers, cups, jumbo straws &amp; ice kits included!
                  </p>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-2.5 mt-4 text-[11px] font-medium text-warm-200">
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                      <Users className="w-3.5 h-3.5 text-accent-amber" />
                      Serves 10 to 500+ Guests
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Insulated Urns &amp; Ice Included
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
                      Up to 20% Volume Savings
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col shrink-0 gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={openCateringModal}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-amber to-amber-500 hover:from-accent-gold hover:to-amber-400 text-[#120602] font-heading font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Build Custom Catering Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("catering");
                      const el = document.getElementById("catering");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-warm-700 hover:border-accent-amber/50 text-warm-100 font-heading font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all cursor-pointer"
                  >
                    <span>Explore Catering Packages</span>
                    <ArrowRight className="w-4 h-4 text-accent-amber" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredSections.length === 0 || filteredSections[0].items.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-warm-300 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-warm-200 mx-auto flex items-center justify-center text-gray-400 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-gray-900">
                No items match your search
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;boba&rdquo;, &ldquo;matcha&rdquo;, &ldquo;taro&rdquo;, or &ldquo;mochi&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-heading font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer"
              >
                View Full Menu
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredSections.map((section) => {
                const isCatering = section.id === "catering";

                if (isCatering) {
                  return (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-36 bg-gradient-to-br from-[#1E0B04] via-[#2A1006] to-[#120602] border-2 border-accent-amber/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                    >
                      {/* Ambient luxury glow decoration */}
                      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-amber/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Specialized Catering Header */}
                      <div className="relative z-10 mb-8 border-b border-warm-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-amber/20 border border-accent-amber/40 text-accent-amber text-[11px] font-heading font-extrabold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>👑 VIP Large-Format Event Service</span>
                          </div>
                          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-warm-50 tracking-tight">
                            {section.name}
                          </h2>
                          <p className="text-xs sm:text-sm text-warm-300 font-light mt-2 max-w-2xl leading-relaxed">
                            {section.description}. Every package includes insulated dispensers, compostable cups, jumbo straws, and fresh slow-cooked boba.
                          </p>

                          {/* Included Perks Checklist */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs text-warm-300">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                              <span>Insulated Urns</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                              <span>Cups &amp; Giant Straws</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                              <span>Ice Kit &amp; Spigots</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                              <span>Twin Cities Delivery</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={openCateringModal}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-amber to-amber-500 hover:from-accent-gold hover:to-amber-400 text-[#120602] font-heading font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Launch Custom Builder</span>
                          </button>
                        </div>
                      </div>

                      {/* Specialized Catering 2-Column Wide Grid */}
                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {section.items.map((item: MenuItem) => (
                          <ProductCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  );
                }

                return (
                  <section key={section.id} id={section.id} className="scroll-mt-36">
                    {/* Standard Section Title */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-warm-300/80 pb-3">
                      <div>
                        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A1A] tracking-tight">
                          {section.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">
                        {section.items.length} item{section.items.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.items.map((item: MenuItem) => (
                        <ProductCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Brand Editorial & Craft Feature (Centered After Menu) */}
        <Hero />

        {/* Press Quotes Editorial Section */}
        <PressQuotes />

        {/* Locations Directory */}
        <LocationsDirectory />

        {/* Brand Story Section */}
        <StorySection />

        {/* VIP Tea Guild Newsletter Subscription */}
        <NewsletterSection />
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ProductModal />
      <CartDrawer />
      <LocationModal />
      <CheckoutModal />
      <ConfirmationModal />
      <SendGiftModal />
      <RewardsModal />
      <CateringModal />
      <MobileCartBar />
      <ToastContainer />
    </div>
  );
}
