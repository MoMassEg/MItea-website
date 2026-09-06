"use client";

import React, { useState } from "react";
import { useOrder } from "@/context/OrderContext";
import {
  Leaf,
  Search,
  ShoppingBag,
  X,
  Menu as MenuIcon,
  Gift,
  Award,
  MapPin,
} from "lucide-react";

export default function Header() {
  const {
    totalItems,
    openCartDrawer,
    openLocationModal,
    openSendGiftModal,
    openRewardsModal,
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
      <header className="sticky top-0 z-40 glass-nav border-b border-warm-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-4">

          {/* Left: hamburger + brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openMobileNav}
              className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-brand-700 hover:bg-warm-200 transition-colors cursor-pointer"
              aria-label="Open mobile menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <a href="#" className="flex items-center gap-2.5 group shrink-0">
              {/* Logo mark */}
              <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
                <Leaf className="w-4 h-4 text-warm-100" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-extrabold text-xl tracking-tight text-brand-800 group-hover:text-brand-900 transition-colors">
                  MiTea
                </span>
                <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-warm-500 mt-0.5">
                  Tea Craft &amp; Mochi
                </span>
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
            <a href="#locations" className="text-brand-800 hover:text-brand-600 transition-colors">
              Locations
            </a>
            <a href="#our-story" className="text-brand-800 hover:text-brand-600 transition-colors">
              Our Story
            </a>
            <button
              type="button"
              onClick={openSendGiftModal}
              className="flex items-center gap-1.5 text-brand-800 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-accent-amber" />
              Send a Drink
            </button>
            <button
              type="button"
              onClick={openRewardsModal}
              className="flex items-center gap-1.5 text-brand-800 hover:text-brand-600 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-accent-amber" />
              Rewards
              <span className="bg-warm-200 text-warm-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                Stamps
              </span>
            </button>
            <a
              href="#the-guild"
              className="inline-flex items-center gap-1 text-accent-amber hover:text-accent-gold transition-colors font-bold text-xs uppercase tracking-wider"
            >
              VIP Guild
            </a>
          </nav>

          {/* Right: search, cart, order */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen((p) => !p)}
              className="w-9 h-9 rounded-md flex items-center justify-center text-brand-700 hover:bg-warm-200 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={openCartDrawer}
              className="w-9 h-9 rounded-md flex items-center justify-center text-brand-700 hover:bg-warm-200 transition-colors relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-warm-50 font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => openLocationModal()}
              className="hidden sm:inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-warm-50 font-heading font-bold text-[12px] tracking-[0.06em] uppercase px-4 py-2.5 rounded-md shadow-sm btn-press transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
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

          <div className="fixed inset-y-0 left-0 max-w-[300px] w-full bg-[#FDF6E3] shadow-2xl flex flex-col justify-between border-r border-warm-300 animate-drawer-left p-6">
            {/* Brand */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-warm-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-warm-100" />
                  </div>
                  <span className="font-heading font-extrabold text-xl tracking-tight text-brand-800">
                    MiTea
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="w-8 h-8 rounded-md bg-warm-200 flex items-center justify-center text-brand-700 cursor-pointer"
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
                  { label: "The VIP Guild (15% Off)", href: "#the-guild" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMobileNav}
                    className="block font-heading font-bold text-sm tracking-[0.08em] uppercase text-brand-800 hover:text-brand-600 transition-colors border-b border-warm-200 pb-4"
                  >
                    {link.label}
                  </a>
                ))}

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openSendGiftModal(); }}
                  className="flex items-center justify-between w-full font-heading font-bold text-sm tracking-[0.08em] uppercase text-brand-800 hover:text-brand-600 transition-colors border-b border-warm-200 pb-4 cursor-pointer"
                >
                  <span>Send a Drink</span>
                  <span className="bg-warm-200 text-warm-600 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">Gift</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openRewardsModal(); }}
                  className="flex items-center justify-between w-full font-heading font-bold text-sm tracking-[0.08em] uppercase text-brand-800 hover:text-brand-600 transition-colors border-b border-warm-200 pb-4 cursor-pointer"
                >
                  <span>Rewards Passport</span>
                  <span className="bg-warm-200 text-warm-600 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">Stamps</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openLocationModal(); }}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-warm-50 font-heading font-bold text-[12px] tracking-[0.07em] uppercase py-3 rounded-md transition-colors cursor-pointer mt-2"
                >
                  Order Online
                </button>
              </nav>
            </div>

            {/* Footer */}
            <div className="pt-5 border-t border-warm-300 space-y-3">
              <div className="flex gap-4 text-[11px] font-semibold uppercase tracking-wider text-warm-500">
                <a href="#locations" onClick={closeMobileNav} className="hover:text-brand-600">Locations</a>
                <button type="button" onClick={() => showToast("Customer Support: (763) 555-0192", "info")} className="hover:text-brand-600 cursor-pointer">Contact</button>
                <button type="button" onClick={() => showToast("100% Organic dairy & single-origin teas guarantee.", "info")} className="hover:text-brand-600 cursor-pointer">Guarantee</button>
              </div>
              <p className="text-[10px] text-warm-400">
                © {new Date().getFullYear()} MiTea Craft Beverage Co.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
