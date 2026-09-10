"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useOrder } from "@/context/OrderContext";
import {
  Search,
  ShoppingBag,
  X,
  Menu as MenuIcon,
  Gift,
  Award,
  MapPin,
  PartyPopper,
} from "lucide-react";

export default function Header() {
  const {
    totalItems,
    openCartDrawer,
    openLocationModal,
    openSendGiftModal,
    openRewardsModal,
    openCateringModal,
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
    searchQuery,
    setSearchQuery,
    showToast,
  } = useOrder();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 glass-nav border-b border-warm-300 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[80px] sm:h-[84px] flex items-center justify-between gap-4">

          {/* Left: hamburger + brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openMobileNav}
              className="md:hidden w-10 h-10 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-800 hover:bg-warm-100 transition-colors cursor-pointer shadow-2xs"
              aria-label="Open mobile menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <a href="#" className="flex items-center gap-2 group shrink-0">
              {/* Logo mark - Much bigger and prominent */}
              <div className="flex items-center gap-3 bg-white/95 hover:bg-white border border-warm-300 hover:border-brand-400 px-3 py-1.5 rounded-2xl shadow-xs transition-all">
                <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src="/images/logo.jpeg"
                    alt="MiTea Logo"
                    fill
                    sizes="56px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col leading-none pr-1">
                  <span className="font-heading font-extrabold text-lg sm:text-2xl tracking-tight text-gray-900">
                    MiTea
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.16em] uppercase text-brand-500 mt-1">
                    Tea &amp; Mochi
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Center nav (desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-semibold">
            <a
              href="#menu-sections"
              className="text-brand-600 border-b-2 border-brand-500 pb-0.5 leading-none"
            >
              Menu
            </a>
            <a href="#locations" className="text-gray-800 hover:text-brand-600 transition-colors">
              Locations
            </a>
            <a href="#our-story" className="text-gray-800 hover:text-brand-600 transition-colors">
              Our Story
            </a>
            <button
              type="button"
              onClick={openCateringModal}
              className="flex items-center gap-1.5 text-gray-800 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <PartyPopper className="w-3.5 h-3.5 text-accent-amber" />
              <span>Catering</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Events
              </span>
            </button>
            <button
              type="button"
              onClick={openSendGiftModal}
              className="flex items-center gap-1.5 text-gray-800 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-accent-amber" />
              <span>Send a Drink</span>
            </button>
            <button
              type="button"
              onClick={openRewardsModal}
              className="flex items-center gap-1.5 text-gray-800 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-accent-amber" />
              <span>VIP Club</span>
            </button>
          </nav>

          {/* Right: search, cart, order */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSearchOpen((p) => !p)}
              className="w-10 h-10 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-800 hover:bg-warm-100 transition-colors cursor-pointer shadow-2xs"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={openCartDrawer}
              className="w-10 h-10 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-800 hover:bg-warm-100 transition-colors relative cursor-pointer shadow-2xs"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => openLocationModal()}
              className="hidden sm:inline-flex items-center gap-2 bg-[#F8847F] hover:bg-[#F56B65] text-white font-heading font-bold text-[12px] tracking-[0.06em] uppercase px-6 py-3 rounded-full shadow-md shadow-[#F8847F]/25 btn-press transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-white" />
              Order Online
            </button>
          </div>
        </div>

        {/* Expandable search bar */}
        {isSearchOpen && (
          <div className="border-t border-warm-200 bg-white/98 px-4 sm:px-6 py-3 animate-modal">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-brand-500 shrink-0" />
              <input
                type="text"
                placeholder="Search drinks, matcha, boba, taro, mochi donuts…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 text-sm focus:outline-none text-brand-900 placeholder-warm-400 font-medium"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 px-2 py-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-7 h-7 rounded-md bg-warm-200 hover:bg-warm-300 flex items-center justify-center text-brand-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Mobile Slide-in Drawer ── */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 glass-dark animate-backdrop" onClick={closeMobileNav} />

          <div className="fixed inset-y-0 left-0 max-w-[300px] w-full bg-[#FFF6F2] shadow-2xl flex flex-col justify-between border-r border-warm-300 animate-drawer-left p-6">
            {/* Brand */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-warm-300">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-warm-300 shrink-0 bg-white shadow-xs">
                    <Image
                      src="/images/logo.jpeg"
                      alt="MiTea Logo"
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-heading font-extrabold text-2xl tracking-tight text-gray-900">
                      MiTea
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-brand-500 mt-1">
                      Tea &amp; Mochi
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="w-9 h-9 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-700 hover:bg-warm-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="py-8 space-y-5">
                {[
                  { label: "Home & Menu", href: "#menu-sections" },
                  { label: "Locations", href: "#locations" },
                  { label: "Our Story", href: "#our-story" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMobileNav}
                    className="block font-heading font-bold text-sm tracking-[0.08em] uppercase text-gray-900 hover:text-brand-600 transition-colors border-b border-warm-200 pb-4"
                  >
                    {link.label}
                  </a>
                ))}

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openCateringModal(); }}
                  className="flex items-center justify-between w-full font-heading font-bold text-sm tracking-[0.08em] uppercase text-gray-900 hover:text-brand-600 transition-colors border-b border-warm-200 pb-4 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <PartyPopper className="w-4 h-4 text-accent-amber" />
                    <span>Catering &amp; Events</span>
                  </span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Party Bars</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openSendGiftModal(); }}
                  className="flex items-center justify-between w-full font-heading font-bold text-sm tracking-[0.08em] uppercase text-gray-900 hover:text-brand-600 transition-colors border-b border-warm-200 pb-4 cursor-pointer"
                >
                  <span>Send a Drink</span>
                  <span className="bg-warm-200 text-warm-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Gift</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openRewardsModal(); }}
                  className="flex items-center justify-between w-full font-heading font-bold text-sm tracking-[0.08em] uppercase text-gray-900 hover:text-brand-600 transition-colors border-b border-warm-200 pb-4 cursor-pointer"
                >
                  <span>VIP Club</span>
                  <span className="bg-warm-200 text-warm-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Stamps</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openLocationModal(); }}
                  className="w-full bg-[#F8847F] hover:bg-[#F56B65] text-white font-heading font-bold text-[13px] tracking-[0.07em] uppercase py-3.5 rounded-full shadow-md shadow-[#F8847F]/25 transition-all cursor-pointer mt-2"
                >
                  Order Pickup
                </button>
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-5 border-t border-warm-300 space-y-3">
              <div className="flex gap-4 text-[11px] font-semibold uppercase tracking-wider text-warm-500">
                <a href="#locations" onClick={closeMobileNav} className="hover:text-brand-600">Location</a>
                <button type="button" onClick={() => showToast("Customer Support: (763) 555-0192", "info")} className="hover:text-brand-600 cursor-pointer">Contact</button>
                <button type="button" onClick={() => showToast("100% Organic dairy & single-origin teas guarantee.", "info")} className="hover:text-brand-600 cursor-pointer">Guarantee</button>
              </div>
              <p className="text-[10px] text-warm-400">
                © {new Date().getFullYear()} Mitea Craft Beverage Co.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
