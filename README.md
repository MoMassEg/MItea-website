# 🍵 MiTea — Artisanal Boba & Japanese Desserts Platform

A full-stack, production-ready online ordering and store management web application for **MiTea Artisanal Boba & Mochi Desserts** (Golden Valley & Twin Cities, MN).

Built with **Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**, **Supabase (PostgreSQL & RLS)**, **Stripe Payments**, and **Upstash Redis**.

---

## 🚀 Key Features

### 🛍️ Customer Ordering Experience
- **Interactive Drink Customizer**: Real-time option builder for cup size (Regular 16oz / Large 24oz), sweetness levels (0% to 100%), ice level (No Ice to Extra Ice), and premium toppings (Brown Sugar Boba, Lychee Jelly, Cheese Foam, etc.).
- **Store Locator & Fulfillment**: Supports both **In-Store Pickup** and **Delivery** with multi-location directory and store-specific operational hours.
- **Promo Code & Discount Engine**: Real-time coupon validation with percentage discounts, fixed-amount deductions, or free delivery.
- **Digital Gift Cards**: Instant gift card balance verification, partial/full redemption during checkout, and gift card generation.
- **Loyalty Stamp Program**: Digital stamp collection for authenticated customers with automatic stamp crediting on completed orders.
- **Catering Request System**: Multi-tier package builder (Boba Social, Tea Bar Experience, Grand Celebration) with guest-count calculator and date scheduler.
- **Live Kitchen Order Tracking**: Real-time status tracker (`Received` → `Preparing` → `Ready` → `Completed`) accessible via confirmation modal and dedicated `/order-confirmation` page.

### 💳 Payments & Checkout
- **Stripe Elements Integration**: Seamless on-page card input supporting Credit/Debit cards, Apple Pay, and Google Pay.
- **3D Secure & SCA Ready**: Full support for Strong Customer Authentication (SCA) redirects and bank challenge callbacks via `/order-confirmation`.
- **Pay at Counter (Cash)**: Alternative option for in-store pickup orders with pending payment status tracking.
- **Secure Webhook Handler**: Dedicated listener at `/api/payments/webhook` handling `checkout.session.completed`, `payment_intent.succeeded`, and `payment_intent.payment_failed` with cryptographic signature verification.

### 🛡️ Master Administrator Portal (`/admin`)
- **Dedicated Authentication**: Master administrator login session secured with cryptographic HMAC-SHA256 tokens and HttpOnly cookies.
- **Live Order Management**: Real-time kitchen display system (KDS) with one-click status transitions and customer receipt printing.
- **Menu Catalog Editor**: Toggle item availability, update prices, and edit drink descriptions.
- **Promotions Manager**: Create, view, and expire promo codes.
- **Analytics & Summary**: Daily revenue totals, order counts, and average order value (AOV) stats.

### 🔒 Security, Rate Limiting & SEO
- **Distributed Rate Limiting**: Upstash Redis sliding-window rate limiting on authentication routes to mitigate brute-force attempts.
- **Next.js 16 Proxy Middleware**: Enforces route protection and session token validation in `src/proxy.ts`.
- **Row-Level Security (RLS)**: PostgreSQL policies safeguarding user profiles, order items, and admin-only datasets.
- **HTTP Security Headers**: HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.
- **Automated SEO**: Dynamic `robots.txt` (`/robots.txt`) and XML sitemap (`/sitemap.xml`) generation.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with Vanilla CSS enhancements |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL 15+, Auth SSR, Storage, RLS) |
| **Payments** | [Stripe](https://stripe.com/) (`stripe` SDK & `@stripe/react-stripe-js`) |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) (`@upstash/ratelimit`, `@upstash/redis`) |
| **Transactional Email** | Nodemailer (Gmail SMTP) & [Resend](https://resend.com/) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/), Three.js |
| **Validation** | [Zod](https://zod.dev/) |

---

## 📁 Project Structure

```text
├── public/                     # Static assets (logos, icons, imagery)
├── scripts/
│   └── seed.ts                 # Database seeding script
├── src/
│   ├── app/
│   │   ├── admin/              # Master Administrator Dashboard & Login
│   │   ├── api/                # 38+ REST API Route Handlers
│   │   │   ├── admin/          # Admin CRUD routes (menu, orders, stores, promos)
│   │   │   ├── auth/           # Login, Register, Logout, Me
│   │   │   ├── catering/       # Catering packages & booking requests
│   │   │   ├── gift-cards/     # Balance checking & redemption
│   │   │   ├── loyalty/        # Stamp cards & reward redemptions
│   │   │   ├── menu/           # Categories, items, customizations
│   │   │   ├── orders/         # Creation, status, history, cancellation
│   │   │   ├── payments/       # Stripe Intent, Checkout, Webhooks, Cash
│   │   │   └── stores/         # Store locations & address validation
│   │   ├── order-confirmation/ # Confirmation page & 3D Secure redirect receiver
│   │   ├── layout.tsx          # Root HTML layout, metadata & fonts
│   │   ├── page.tsx            # Main ordering storefront & menu catalog
│   │   ├── robots.ts           # Dynamic robots.txt
│   │   └── sitemap.ts          # Dynamic sitemap.xml
│   ├── components/             # Reusable UI modals & components
│   │   ├── admin/              # Admin-specific UI panels
│   │   ├── CheckoutModal.tsx   # Checkout flow & payment selection
│   │   ├── ConfirmationModal.tsx# Post-order modal receipt
│   │   ├── ProductModal.tsx    # Drink customization dialog
│   │   ├── StripePaymentForm.tsx# Stripe Elements card form
│   │   └── ...                 # Header, Nav, Catering, Rewards, etc.
│   ├── context/
│   │   └── OrderContext.tsx    # Global cart, store, order, and toast state
│   ├── lib/
│   │   ├── admin-auth.ts       # HMAC-SHA256 admin session verification
│   │   ├── api-client.ts       # Type-safe client-side API SDK
│   │   ├── email.ts            # Transactional order confirmation dispatch
│   │   ├── order-service.ts    # Order creation, pricing calculation & lifecycle
│   │   ├── rate-limit.ts       # Upstash Redis rate limit configuration
│   │   ├── stripe.ts           # Stripe backend helpers & webhooks
│   │   └── supabase/           # Supabase client, server & admin singletons
│   ├── proxy.ts                # Next.js 16 proxy / middleware
│   └── types/                  # TypeScript interfaces & database schemas
└── supabase/
    └── migrations/             # Complete PostgreSQL schema & RLS migrations
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js 20.x or higher**
- **npm** (or `pnpm` / `yarn`)
- A [Supabase](https://supabase.com/) project
- A [Stripe](https://stripe.com/) account (Test mode is sufficient for dev)

### 2. Clone & Install
```bash
git clone https://github.com/MoMassEg/MItea-website.git
cd MItea-website
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Key environment variables:
```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Master Admin Credentials
ADMIN_EMAIL=admin@mitea.com
ADMIN_PASSWORD=your-secure-password
ADMIN_SESSION_SECRET=your-random-32-char-secret

# Upstash Redis (Optional for local dev, recommended for production)
UPSTASH_REDIS_REST_URL=https://your-upstash.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 4. Database Setup & Seeding
Execute the initial schema migration in your Supabase SQL Editor:
```bash
# Apply schema located in:
supabase/migrations/20260911_init_schema.sql
```

Then seed initial store locations, categories, menu items, and promo codes:
```bash
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.  
Access the Administrator Dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🚢 Production Deployment

### Build & Verify
Ensure the application compiles cleanly:
```bash
npm run build
```

### Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Add all environment variables from `.env.local` to the Vercel Project Settings:
   - Update `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://mitea.com`).
   - Set **Stripe Live Keys** (`sk_live_...`, `pk_live_...`).
   - Create a webhook endpoint in Stripe pointing to:  
     `https://<your-domain>/api/payments/webhook`  
     with events: `payment_intent.succeeded`, `payment_intent.payment_failed`, and `checkout.session.completed`.
   - Set a strong, randomized `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
4. Deploy! 🚀

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with Turbopack |
| `npm run build` | Compiles optimized production bundle with full type checking |
| `npm run start` | Starts Next.js production server |
| `npm run lint` | Runs ESLint analysis |
| `npm run db:seed` | Seeds database with initial categories, items, and stores |

---

## 📄 License

Proprietary © [MiTea](https://mitea.com). All rights reserved.
