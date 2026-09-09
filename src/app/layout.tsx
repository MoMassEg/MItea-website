import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/context/OrderContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mitea — Artisanal Boba & Japanese Mochi Desserts | Golden Valley, MN",
  description:
    "Crafted with organic dairy, ceremonial grade Uji matcha, and hand-simmered brown sugar pearls. Order online for quick in-store pickup at our Golden Valley tea house (7724 Olson Mem Hwy, Golden Valley, MN).",
  keywords: [
    "Mitea",
    "Bubble Tea",
    "Boba",
    "Mochi Donuts",
    "Uji Matcha",
    "Twin Cities Boba",
    "Golden Valley Boba",
    "Taiwanese Fruit Tea",
    "Asian Street Snacks"
  ],
  authors: [{ name: "Mitea Craft Beverage Co." }],
  openGraph: {
    title: "Mitea — Premium Bubble Tea & Asian Desserts",
    description: "Brewed with Intention, Served with Warmth. Order online for in-store pickup at 7724 Olson Mem Hwy, Golden Valley, MN.",
    url: "https://mitea.menu",
    siteName: "Mitea",
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B3A2A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable} ${cormorantGaramond.variable} scroll-smooth`}
    >
      <body className="bg-[#FDF6E3] text-[#1C0A00] font-body min-h-screen flex flex-col antialiased">
        <OrderProvider>
          {children}
        </OrderProvider>
      </body>
    </html>
  );
}
