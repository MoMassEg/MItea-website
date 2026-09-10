import React from "react";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 mt-auto border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-200 shrink-0 p-1 shadow-sm">
                <Image
                  src="/images/logo.jpeg"
                  alt="MiTea Logo"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-heading font-extrabold text-2xl tracking-tight text-gray-900">
                  MiTea
                </span>
                <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#F8847F] mt-1">
                  Tea &amp; Mochi Craft
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Crafted with care, served with love. Organic loose leaf bubble teas and artisan Japanese mochi in Golden Valley, Minnesota.
            </p>
            <div className="flex items-center gap-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <span className="hover:text-[#F8847F] cursor-pointer transition-colors">Instagram</span>
              <span className="text-gray-300">·</span>
              <span className="hover:text-[#F8847F] cursor-pointer transition-colors">TikTok</span>
              <span className="text-gray-300">·</span>
              <span className="hover:text-[#F8847F] cursor-pointer transition-colors">Facebook</span>
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[11px] text-gray-900 uppercase tracking-[0.12em] mb-4">
              Menu &amp; Drinks
            </h4>
            {["Classic Milk Tea", "Real Fruit Teas", "Energy Series", "Pon de Ring Mochi", "Taiwanese Street Snacks"].map((item) => (
              <p key={item}>
                <a href="#menu-sections" className="text-xs text-gray-600 hover:text-[#F8847F] transition-colors">
                  {item}
                </a>
              </p>
            ))}
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[11px] text-gray-900 uppercase tracking-[0.12em] mb-4">
              Store Location
            </h4>
            <div className="text-xs text-gray-600 space-y-1.5">
              <strong className="text-gray-900 block font-bold">Mitea — Golden Valley</strong>
              <p className="flex items-start gap-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-[#DF9749] shrink-0 mt-0.5" />
                <span>7724 Olson Mem Hwy, Golden Valley, MN 55427, United States</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                ✓ In-Store &amp; Curbside Pickup Available
              </p>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-[11px] text-gray-900 uppercase tracking-[0.12em] mb-4">
              Hours &amp; Orders
            </h4>
            <p className="text-xs text-gray-600">Mon – Thu: 10:00 AM – 10:00 PM</p>
            <p className="text-xs text-gray-600">Fri – Sun: 10:00 AM – 11:00 PM</p>
            <p className="text-xs text-gray-800 font-semibold mt-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#DF9749]" />
              <span>(763) 555-0192</span>
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>order@mitea.menu</span>
            </p>
            <a href="#the-guild" className="inline-flex items-center gap-1.5 text-xs text-[#DF9749] hover:text-[#C87A2E] font-bold mt-2 transition-colors">
              ★ Join The VIP Guild (15% Off)
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Mitea Craft Beverage Co. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#F8847F] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#F8847F] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#F8847F] transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
