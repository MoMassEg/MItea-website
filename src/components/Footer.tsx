import React from "react";
import { Leaf, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "#1C0A00" }} className="text-warm-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-warm-100" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-warm-100">
                Mitea
              </span>
            </div>
            <p className="text-xs text-warm-500 leading-relaxed">
              Crafted with care, served with love. Organic loose leaf bubble teas and artisan Japanese mochi in Golden Valley, Minnesota.
            </p>
            <div className="flex items-center gap-3 text-warm-500 text-xs font-semibold uppercase tracking-wider">
              <span className="hover:text-warm-200 cursor-pointer transition-colors">Instagram</span>
              <span className="text-warm-700">·</span>
              <span className="hover:text-warm-200 cursor-pointer transition-colors">TikTok</span>
              <span className="text-warm-700">·</span>
              <span className="hover:text-warm-200 cursor-pointer transition-colors">Facebook</span>
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[11px] text-warm-400 uppercase tracking-[0.12em] mb-4">
              Menu &amp; Drinks
            </h4>
            {["Classic Milk Tea", "Real Fruit Teas", "Energy Series", "Pon de Ring Mochi", "Taiwanese Street Snacks"].map((item) => (
              <p key={item}>
                <a href="#menu-sections" className="text-xs text-warm-500 hover:text-warm-200 transition-colors">
                  {item}
                </a>
              </p>
            ))}
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[11px] text-warm-400 uppercase tracking-[0.12em] mb-4">
              Store Location
            </h4>
            <div className="text-xs text-warm-500 space-y-1.5">
              <strong className="text-accent-amber block font-bold">Mitea — Golden Valley</strong>
              <p className="flex items-start gap-1.5 text-warm-300">
                <MapPin className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
                <span>7724 Olson Mem Hwy, Golden Valley, MN 55427, United States</span>
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                ✓ In-Store &amp; Curbside Pickup Available
              </p>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[11px] text-warm-400 uppercase tracking-[0.12em] mb-4">
              Hours &amp; Orders
            </h4>
            <p className="text-xs text-warm-500">Mon – Thu: 10:00 AM – 10:00 PM</p>
            <p className="text-xs text-warm-500">Fri – Sun: 10:00 AM – 11:00 PM</p>
            <p className="text-xs text-warm-300 font-semibold mt-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-accent-amber" />
              <span>(763) 555-0192</span>
            </p>
            <p className="text-xs text-warm-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-warm-600" />
              <span>order@mitea.menu</span>
            </p>
            <a href="#the-guild" className="inline-flex items-center gap-1.5 text-xs text-accent-amber hover:text-accent-gold font-bold mt-2 transition-colors">
              ★ Join The VIP Guild (15% Off)
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-warm-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-warm-600">
          <p>© {new Date().getFullYear()} Mitea Craft Beverage Co. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-warm-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-warm-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-warm-400 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
