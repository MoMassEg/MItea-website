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
import NewsletterModal from "@/components/NewsletterModal";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";
import PressQuotes from "@/components/PressQuotes";
import LocationsDirectory from "@/components/LocationsDirectory";
import SendGiftModal from "@/components/SendGiftModal";
import RewardsModal from "@/components/RewardsModal";
import CateringModal from "@/components/CateringModal";
import FloatingGuildButton from "@/components/FloatingGuildButton";
import {
  Search,
  XCircle,
  Sparkles,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

export default function HomePage() {
  const {
    searchQuery,
    setSearchQuery,
    openCateringModal
  } = useOrder();

  const cateringSection = useMemo(() => {
    const cateringCat = MENU_DATA.categories.find((cat) => cat.id === "catering");
    const cateringItems = MENU_DATA.items.filter((item) => item.category === "catering");
    if (!cateringCat || cateringItems.length === 0) return null;
    return {
      id: "catering",
      name: cateringCat.name,
      description: getCategoryDescription("catering"),
      items: cateringItems
    };
  }, []);

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

    const normalSections = MENU_DATA.categories
      .filter((cat) => cat.id !== "all" && cat.id !== "catering")
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: getCategoryDescription(cat.id),
        items: items.filter((item) => item.category === cat.id)
      }))
      .filter((sec) => sec.items.length > 0);

    const popularItems = items.filter((item) => item.popular && item.category !== "catering");

    return [
      {
        id: "all",
        name: "Most Popular & House Specialties",
        description: "Our customer-favorite handcrafted milk teas, fruit blends, and mochi",
        items: popularItems
      },
      ...normalSections
    ];
  }, [searchQuery]);

  function getCategoryDescription(catId: string): string {
    switch (catId) {
      case "catering":
        return "Bring the MiTea bar to your next event. We set up a full drink bar with towers of mochi donuts and take care of all the cups. It's a great fit for office parties, birthdays, and graduations. We handle every detail so you can enjoy the event.";
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

        {/* Plan Your Event Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-0">
          <button
            type="button"
            onClick={() =>
              document.getElementById("catering")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="group w-full flex items-center justify-between gap-4 bg-gradient-to-r from-[#FFF4F3] to-amber-50 border border-[#F8847F]/30 hover:border-[#F8847F]/70 rounded-2xl px-5 py-3.5 transition-all hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F8847F]/15 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4 text-[#F8847F]" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-heading font-extrabold uppercase tracking-wider text-gray-900">
                  Plan Your Event
                </span>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  Catering packages · Custom orders · Live bar setup
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#F8847F] shrink-0">
              <span className="text-[11px] font-bold hidden sm:inline">See packages</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Menu Grid Content */}
        <div id="menu-sections" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {searchQuery && (
            <div className="mb-6 bg-white border border-warm-300 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Search className="w-4 h-4 text-[#F8847F]" />
                <span>
                  Filtering menu for <strong>&ldquo;{searchQuery}&rdquo;</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-[#F8847F] hover:text-gray-900 flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Clear Filter</span>
              </button>
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
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Try searching for &ldquo;boba&rdquo;, &ldquo;matcha&rdquo;, &ldquo;taro&rdquo;, or &ldquo;mochi&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 bg-[#F8847F] hover:bg-[#F56B65] text-white text-xs sm:text-sm font-heading font-bold px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow-sm"
              >
                View Full Menu
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredSections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-36">
                  {/* Standard Section Title */}
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-warm-300 pb-3">
                    <div>
                      <h2 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
                        {section.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {section.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-warm-600">
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
              ))}
            </div>
          )}
        </div>

        {/* Catering & Events — placed right before the editorial hero */}
        {cateringSection && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <section
              id="catering"
              className="scroll-mt-36 bg-white border-2 border-brand-200/90 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden text-gray-900"
            >
              {/* Soft ambient coral glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#F8847F]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Specialized Catering Header */}
              <div className="relative z-10 mb-10 border-b border-warm-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>

                  <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-gray-900 tracking-tight">
                    Catering
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 font-normal mt-3 max-w-2xl leading-relaxed">
                    Bring the MiTea bar to your next event. We set up a full drink bar with towers of mochi donuts and take care of all the cups. It&apos;s a great fit for office parties, birthdays, and graduations. We handle every detail so you can enjoy the event.
                  </p>


                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={openCateringModal}
                    className="flex items-center justify-center gap-2 bg-[#F8847F] hover:bg-[#F56B65] text-white font-heading font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Plan Your Event</span>
                  </button>
                </div>
              </div>

              {/* ── PACKAGES SECTION (User Requested 3 Options) ── */}
              <div className="relative z-10 mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[11px] font-heading font-bold tracking-[0.14em] uppercase text-[#F8847F]">
                    Packages
                  </span>
                  <span className="h-px flex-grow bg-warm-200" />
                  <span className="text-xs text-gray-500 font-medium">Choose Your Experience</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* First Option: The Drop-Off */}
                  <div className="bg-[#FFF8F6] border-2 border-warm-200 hover:border-[#F8847F] rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xs hover:shadow-md group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#E35843] bg-[#E35843]/10 border border-[#E35843]/20 px-2.5 py-1 rounded-full">
                          First Option
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Pick a size
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
                        The Drop-Off
                      </h3>

                      <div className="inline-flex items-center gap-1.5 text-xs text-[#E35843] font-bold bg-[#E35843]/10 px-3 py-1 rounded-full mt-2 mb-3">
                        <Users className="w-3.5 h-3.5" />
                        <span>10 - 25 people</span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed mt-2">
                        A tray of pre-made drinks in your pick of four flavours, plus two dozen mochi donuts. Delivered cold and ready.
                      </p>

                      <ul className="mt-4 pt-3 border-t border-warm-200 space-y-2 text-xs text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E35843] shrink-0" />
                          <span>4 Signature drink flavours of your choice</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E35843] shrink-0" />
                          <span>2 Dozen fresh pull-apart mochi donuts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E35843] shrink-0" />
                          <span>Delivered cold and ready to serve</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={openCateringModal}
                      className="mt-6 w-full py-3.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-[#F8847F] hover:bg-[#F56B65] text-white transition-all cursor-pointer shadow-sm"
                    >
                      Select The Drop-Off
                    </button>
                  </div>

                  {/* Second Option: The MiTea Bar */}
                  <div className="bg-[#FFFBF5] border-2 border-amber-400 rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-sm hover:shadow-md relative group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-heading font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
                      Most Popular
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3 mt-1">
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
                          Second Option
                        </span>
                        <span className="text-[11px] text-amber-700 font-medium">
                          On-Site Bar
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
                        The MiTea Bar
                      </h3>

                      <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-100 px-3 py-1 rounded-full mt-2 mb-3">
                        <Users className="w-3.5 h-3.5" />
                        <span>25 - 75 people</span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed mt-2">
                        We set up on site and make drinks to order with sugar, ice and toppings chosen by each guest, same as in the shop.
                      </p>

                      <ul className="mt-4 pt-3 border-t border-amber-200 space-y-2 text-xs text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Full live on-site mobile boba bar setup</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Made to order with custom sweetness &amp; ice</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Fresh toppings chosen by each guest</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={openCateringModal}
                      className="mt-6 w-full py-3.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-black shadow-sm transition-all cursor-pointer font-extrabold"
                    >
                      Select The MiTea Bar
                    </button>
                  </div>

                  {/* 3rd Option: The Whole Thing */}
                  <div className="bg-[#FFF8F6] border-2 border-warm-200 hover:border-[#F8847F] rounded-2xl p-6 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xs hover:shadow-md group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#F8847F] bg-[#F8847F]/10 border border-[#F8847F]/20 px-2.5 py-1 rounded-full">
                          3rd Option
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          Full Event Service
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
                        The Whole Thing
                      </h3>

                      <div className="inline-flex items-center gap-1.5 text-xs text-[#F8847F] font-bold bg-[#F8847F]/10 px-3 py-1 rounded-full mt-2 mb-3">
                        <Users className="w-3.5 h-3.5" />
                        <span>75+ people</span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed mt-2">
                        Full bar service, a donut tower, and staff for the length of your event. Tell us the room and we&apos;ll plan it.
                      </p>

                      <ul className="mt-4 pt-3 border-t border-warm-200 space-y-2 text-xs text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F8847F] shrink-0" />
                          <span>Full bar service with custom curated menu</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F8847F] shrink-0" />
                          <span>Showstopping Pon de Ring mochi donut tower</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F8847F] shrink-0" />
                          <span>Dedicated staff for the length of your event</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={openCateringModal}
                      className="mt-6 w-full py-3.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-[#F8847F] hover:bg-[#F56B65] text-white transition-all cursor-pointer shadow-sm"
                    >
                      Select The Whole Thing
                    </button>
                  </div>
                </div>
              </div>

              {/* À La Carte Catering Items Grid */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[11px] font-heading font-bold tracking-[0.14em] uppercase text-gray-500">
                    À La Carte Platters &amp; Gallon Jugs
                  </span>
                  <span className="h-px flex-grow bg-warm-200" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {cateringSection.items.map((item: MenuItem) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Brand Editorial & Craft Feature (Centered After Menu) */}
        <Hero />

        {/* Press Quotes Editorial Section */}
        <PressQuotes />

        {/* Locations Directory */}
        <LocationsDirectory />

        {/* Brand Story Section */}
        <StorySection />
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* Interactive Floating Side Button for 15% OFF VIP Guild (dynamic scroll animation) */}
      <FloatingGuildButton />

      {/* Modals & Overlays */}
      <ProductModal />
      <CartDrawer />
      <LocationModal />
      <CheckoutModal />
      <ConfirmationModal />
      <SendGiftModal />
      <RewardsModal />
      <CateringModal />
      <NewsletterModal />
      <MobileCartBar />
      <ToastContainer />
    </div>
  );
}
