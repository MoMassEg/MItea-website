"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuoteItem {
  id: number;
  headline: string;
  body: string;
  source: string;
  author: string;
}

const QUOTES: QuoteItem[] = [
  {
    id: 1,
    headline: "A Tea Connoisseur's Guide to the Twin Cities",
    body: "Mitea Craft Beverage Co. is the standard-bearer for artisan loose-leaf bubble tea in Minnesota. Characterized by their refusal to use powdered syrups and their single-origin Alishan oolong steeped every four hours, this craft tea house has captured the hearts of purists and dessert lovers alike.",
    source: "Sprudge Beverage",
    author: "Eric Tessier",
  },
  {
    id: 2,
    headline: "The Best Boba and Pon de Ring Donuts in Minneapolis",
    body: "From the slow-simmered Okinawa brown sugar boba to the hand-whisked ceremonial grade Uji matcha, Mitea treats bubble tea with the precision of a third-wave pour-over bar. The fluffy daifuku mochi and crisp popcorn chicken make it an essential Twin Cities stop.",
    source: "Eater Twin Cities",
    author: "Joy Summers",
  },
  {
    id: 3,
    headline: "Why Single-Origin Whole Leaf Teas Are Changing the Game",
    body: "Stepping into Mitea's Golden Valley flagship feels like entering a contemporary Kyoto tea salon. The fragrance of midnight-blooming jasmine green tea and fresh organic cream elevates bubble tea from a casual treat to an artisanal culinary ritual.",
    source: "Minnesota Monthly",
    author: "Marcus Lindgren",
  },
];

export default function PressQuotes() {
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i === 0 ? QUOTES.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === QUOTES.length - 1 ? 0 : i + 1));

  const q = QUOTES[idx];

  return (
    <section className="py-20 px-4 sm:px-6 border-y border-warm-300" style={{ background: "#FFF9F6" }}>
      <div className="max-w-2xl mx-auto relative flex items-center justify-between">

        {/* Prev */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-warm-100 border border-warm-300 flex items-center justify-center text-gray-800 transition-colors shadow-2xs cursor-pointer shrink-0 z-10"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Quote content */}
        <div className="px-5 sm:px-12 text-center flex-grow">
          {/* Opening quote mark in Cormorant */}
          <div className="mb-3 flex justify-center">
            <span
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "5rem",
                lineHeight: 1,
                color: "#F8847F",
                opacity: 0.6,
                userSelect: "none",
              }}
            >
              &#8220;
            </span>
          </div>

          {/* Headline */}
          <h3
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
              lineHeight: 1.22,
              letterSpacing: "-0.01em",
              color: "#18181B",
              marginBottom: "1.25rem",
            }}
          >
            {q.headline}
          </h3>

          {/* Body */}
          <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
            {q.body}
          </p>

          {/* Attribution */}
          <div className="mt-7 pt-5 border-t border-warm-300">
            <p className="font-heading font-bold text-[11px] tracking-[0.12em] uppercase text-gray-900">
              {q.source}
            </p>
            <p className="text-[11px] text-warm-600 font-medium mt-0.5">{q.author}</p>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-5">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className="cursor-pointer transition-all"
                style={{
                  width: i === idx ? "24px" : "7px",
                  height: "7px",
                  borderRadius: "4px",
                  background: i === idx ? "#F8847F" : "#F5DFD5",
                  border: "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={next}
          aria-label="Next"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-warm-100 border border-warm-300 flex items-center justify-center text-gray-800 transition-colors shadow-2xs cursor-pointer shrink-0 z-10"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
