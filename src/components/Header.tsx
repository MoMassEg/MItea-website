"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOrder } from "@/context/OrderContext";
import NotificationsPanel from "@/components/NotificationsPanel";
import {
  Search,
  ShoppingBag,
  X,
  Menu as MenuIcon,
  Gift,
  Award,
  PartyPopper,
  User,
  LogOut,
  Receipt,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

export default function Header() {
  const {
    totalItems,
    openCartDrawer,
    openSendGiftModal,
    openRewardsModal,
    openCateringModal,
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
    searchQuery,
    setSearchQuery,
    showToast,
    currentUser,
    openAuthModal,
    logout,
    openOrderHistoryModal,
  } = useOrder();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 glass-nav border-b border-warm-300 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-3">

          {/* ── LEFT: Hamburger (mobile) + Logo ── */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openMobileNav}
              className="md:hidden w-9 h-9 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-700 hover:bg-warm-100 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <MenuIcon className="w-4.5 h-4.5" />
            </button>

            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 bg-white/90 hover:bg-white border border-warm-300 hover:border-brand-400 pl-1.5 pr-3 py-1.5 rounded-2xl shadow-xs transition-all">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0">
                <Image
                  src="/images/logo.jpeg"
                  alt="MiTea Logo"
                  fill
                  sizes="36px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-extrabold text-[17px] tracking-tight text-gray-900 leading-none">
                  MiTea
                </span>
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-brand-500 mt-0.5">
                  Tea &amp; Mochi
                </span>
              </div>
            </a>
          </div>

          {/* ── CENTER: Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1 text-[13px] font-semibold flex-1 justify-center">
            <a
              href="#menu-sections"
              className="px-3 py-1.5 rounded-lg text-brand-600 bg-brand-50 font-bold transition-colors"
            >
              Menu
            </a>
            <a
              href="#locations"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-brand-600 hover:bg-warm-100 transition-colors"
            >
              Locations
            </a>
            <a
              href="#our-story"
              className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-brand-600 hover:bg-warm-100 transition-colors"
            >
              Our Story
            </a>

            {/* Divider */}
            <span className="w-px h-4 bg-warm-300 mx-1" />

            <button
              type="button"
              onClick={openCateringModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:text-brand-600 hover:bg-warm-100 transition-colors cursor-pointer"
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Catering</span>
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none">
                Events
              </span>
            </button>

            <button
              type="button"
              onClick={openSendGiftModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:text-brand-600 hover:bg-warm-100 transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Gift</span>
            </button>

            <button
              type="button"
              onClick={openRewardsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:text-brand-600 hover:bg-warm-100 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>VIP</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={openOrderHistoryModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:text-brand-600 hover:bg-warm-100 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>Orders</span>
              </button>
            )}
          </nav>

          {/* ── RIGHT: Icon actions + CTA ── */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Search */}
            <button
              type="button"
              onClick={() => setIsSearchOpen((p) => !p)}
              className="w-9 h-9 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-600 hover:text-brand-600 hover:bg-warm-100 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <NotificationsPanel />

            {/* Cart */}
            <button
              type="button"
              onClick={openCartDrawer}
              className="w-9 h-9 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-600 hover:text-brand-600 hover:bg-warm-100 transition-colors relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white font-bold text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-xs">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Separator */}
            <span className="hidden sm:block w-px h-5 bg-warm-300 mx-0.5" />

            {/* User account */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-1.5 bg-white border border-warm-300 rounded-full pl-1.5 pr-2.5 py-1 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  {(currentUser.name?.split(" ")[0]?.[0] || currentUser.email[0]).toUpperCase()}
                </div>
                <span className="text-[12px] font-bold text-gray-800">
                  {currentUser.name?.split(" ")[0] || currentUser.email.split("@")[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="text-gray-400 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="hidden sm:inline-flex items-center gap-1.5 bg-white border border-warm-300 rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-warm-100 hover:text-brand-600 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-brand-500" />
                Sign In
              </button>
            )}


          </div>
        </div>

        {/* ── Search Bar (drop-down) ── */}
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
              <div className="flex items-center justify-between pb-5 border-b border-warm-300 mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-warm-300 shrink-0 bg-white">
                    <Image
                      src="/images/logo.jpeg"
                      alt="MiTea Logo"
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-heading font-extrabold text-xl tracking-tight text-gray-900">MiTea</span>
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-brand-500 mt-0.5">Tea &amp; Mochi</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="w-8 h-8 rounded-full bg-white border border-warm-300 flex items-center justify-center text-gray-600 hover:bg-warm-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Info / Auth */}
              {currentUser ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-warm-100 border border-warm-200 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                      {(currentUser.name?.split(" ")[0]?.[0] || currentUser.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{currentUser.name?.split(" ")[0] || currentUser.email.split("@")[0]}</div>
                      <div className="text-[10px] text-brand-600 font-semibold">{currentUser.role === "ADMIN" ? "Administrator" : "VIP Member"}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { closeMobileNav(); logout(); }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openAuthModal(); }}
                  className="flex items-center justify-center gap-2 w-full font-heading font-bold text-xs tracking-[0.08em] uppercase text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 py-3 rounded-2xl transition-colors cursor-pointer mb-5"
                >
                  <User className="w-4 h-4 text-brand-600" />
                  Sign In / Create Account
                </button>
              )}

              {/* Nav Links */}
              <nav className="space-y-1">
                {[
                  { label: "Home & Menu", href: "#menu-sections" },
                  { label: "Locations", href: "#locations" },
                  { label: "Our Story", href: "#our-story" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMobileNav}
                    className="flex items-center justify-between font-semibold text-sm text-gray-800 hover:text-brand-600 hover:bg-warm-100 px-3 py-2.5 rounded-xl transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openCateringModal(); }}
                  className="flex items-center justify-between w-full font-semibold text-sm text-gray-800 hover:text-brand-600 hover:bg-warm-100 px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <PartyPopper className="w-4 h-4 text-amber-500" />
                    Catering &amp; Events
                  </span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Events</span>
                </button>

                <button
                  type="button"
                  onClick={() => { closeMobileNav(); openRewardsModal(); }}
                  className="flex items-center justify-between w-full font-semibold text-sm text-gray-800 hover:text-brand-600 hover:bg-warm-100 px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    VIP Club &amp; Rewards
                  </span>
                  <span className="bg-warm-200 text-warm-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Stamps</span>
                </button>

                {currentUser && (
                  <button
                    type="button"
                    onClick={() => { closeMobileNav(); openOrderHistoryModal(); }}
                    className="flex items-center justify-between w-full font-semibold text-sm text-gray-800 hover:text-brand-600 hover:bg-warm-100 px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-brand-500" />
                      Order History
                    </span>
                  </button>
                )}
              </nav>
            </div>

            {/* Bottom CTA + Footer */}
            <div className="space-y-4">
              <div className="flex gap-4 text-[11px] font-semibold text-warm-500">
                <a href="#locations" onClick={closeMobileNav} className="hover:text-brand-600">Location</a>
                <button type="button" onClick={() => showToast("Customer Support: (763) 555-0192", "info")} className="hover:text-brand-600 cursor-pointer">Contact</button>
                <button type="button" onClick={() => showToast("100% Organic dairy & single-origin teas.", "info")} className="hover:text-brand-600 cursor-pointer">Guarantee</button>
              </div>
              <p className="text-[10px] text-warm-400">© {new Date().getFullYear()} Mitea Craft Beverage Co.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
