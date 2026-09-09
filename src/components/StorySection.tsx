"use client";

import React from "react";
import { Leaf, Milk, Cookie, ArrowRight } from "lucide-react";

const PILLARS = [
  {
    icon: Leaf,
    color: "#6B3010",
    bg: "#F5E6CC",
    stat: "4-hr",
    statLabel: "Steeping Cycle",
    title: "Whole Loose Leaf Tea",
    body: "No powdered concentrates. We steep fresh batches every 4 hours using whole leaf Assam black, Alishan high-mountain oolong, and midnight jasmine green tea from heritage Taiwanese and Japanese gardens.",
  },
  {
    icon: Milk,
    color: "#7A3B0F",
    bg: "#F0E2CC",
    stat: "100%",
    statLabel: "Organic Dairy",
    title: "Organic Dairy & Oat Milk",
    body: "We partner with Midwest organic dairies for whole milk, alongside rich coconut cream and barista oat milk. Custom sweetness from 0% to 100% pure cane sugar — your drink, your way.",
  },
  {
    icon: Cookie,
    color: "#5C2A0A",
    bg: "#EBD8C0",
    stat: "Daily",
    statLabel: "Handcrafted",
    title: "Fresh Mochi & Boba Pearls",
    body: "Tapioca pearls slow-simmered in Okinawa brown sugar syrup throughout the day. Signature Pon de Ring mochi donuts hand-fried every morning. No compromises on freshness — ever.",
  },
];

export default function StorySection() {
  return (
    <section id="our-story" className="relative overflow-hidden" style={{ background: "#F5E6CC" }}>
      {/* Subtle diagonal line watermark */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #6B3010 0px, #6B3010 1px,
            transparent 1px, transparent 44px
          )`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">

        {/* Section header — two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <span className="block text-[10px] font-bold tracking-[0.14em] uppercase text-brand-500 mb-4">
              The Mitea Difference
            </span>
            <h2
              className="font-editorial-italic tracking-tight leading-tight"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                color: "#1C0A00",
              }}
            >
              Brewed with intention.<br />
              <span style={{ color: "#6B3010" }}>Never rushed.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm text-brand-700 leading-relaxed">
              We believe bubble tea should celebrate the tea itself — not mask it with artificial syrups.
              Every decision starts with the leaf.
            </p>
            <a
              href="#locations"
              className="inline-flex items-center gap-2 mt-5 text-[12px] font-bold tracking-[0.07em] uppercase text-brand-600 hover:text-brand-800 transition-colors group"
            >
              Visit a café near you
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group relative bg-white rounded-2xl border border-warm-300 p-7 shadow-sm overflow-hidden transition-card"
              >
                {/* Watermark stat */}
                <div
                  className="absolute -top-2 -right-1 leading-none select-none pointer-events-none opacity-[0.06]"
                  style={{
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    fontWeight: 800,
                    fontSize: "64px",
                    color: p.color,
                  }}
                >
                  {p.stat}
                </div>

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: p.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: p.color }} />
                </div>

                {/* Stat */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span
                    className="font-heading font-extrabold text-2xl tracking-tight"
                    style={{ color: p.color }}
                  >
                    {p.stat}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-warm-500">
                    {p.statLabel}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-brand-900 mb-3">{p.title}</h3>
                <p className="text-xs text-brand-700 leading-relaxed">{p.body}</p>

                {/* Bottom accent line on hover */}
                <div
                  className="absolute bottom-0 inset-x-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom stat bar */}
        <div className="mt-16 pt-10 border-t border-warm-400/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { v: "2019", l: "Year Founded" },
            { v: "1",    l: "Golden Valley Location" },
            { v: "60+",  l: "Menu Items" },
            { v: "5K+",  l: "Monthly Orders" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div
                className="font-heading font-extrabold tracking-tight"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontWeight: 700,
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  color: "#1C0A00",
                }}
              >
                {s.v}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-warm-500 mt-1">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
