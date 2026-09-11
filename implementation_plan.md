# Implementation Plan: MiTea Backend (Next.js Integrated)

## Overview

Build the complete backend for **MiTea** — an artisanal bubble tea & café online ordering platform — **inside the existing Next.js 16 project** using Route Handlers (`route.ts`), Server Actions (`'use server'`), and Prisma ORM. No separate backend project is needed.

The frontend is already scaffolded at [`c:\Users\Dell\Documents\menu`](file:///c:/Users/Dell/Documents/menu) with 23 components covering: menu browsing, product customization, cart, checkout, pickup/delivery, locations, catering (packages + custom builder), gift cards, loyalty rewards, newsletter, and promo codes.

The plan is organized into **8 phases across 10 weeks**, using **vertical slicing** — each task delivers a working, testable feature path (schema → service → API → integration).

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 16 (App Router) | Already in use; Route Handlers + Server Actions eliminate need for separate backend |
| **API Layer** | Route Handlers (`route.ts`) | REST endpoints via `src/app/api/` for external/webhook/mobile use |
| **Mutations** | Server Actions (`'use server'`) | Direct form submissions + client calls without manual fetch for checkout, cart, etc. |
| **Database** | Supabase (PostgreSQL) | Managed PostgreSQL, Row Level Security, instant REST & Realtime APIs |
| **Data Access** | Direct Supabase SDK (`@supabase/supabase-js` + `@supabase/ssr`) | Type-safe queries directly with Supabase client; no heavy ORM overhead |
| **Auth** | Supabase Auth | Native integration with Supabase profiles table, SSR cookies, email/password & OAuth |
| **Cache / Rate Limit** | Upstash Redis (`@upstash/redis` + `@upstash/ratelimit`) | Serverless-compatible, free tier, works with Next.js edge/serverless |
| **Payments** | Stripe Checkout + Webhooks | Industry standard, PCI-compliant hosted checkout |
| **Email** | Resend API | Free 100 emails/day, order confirmations, gift cards, newsletters |
| **File Storage** | Supabase Storage | Built-in buckets for menu item images and drink assets |
| **Realtime** | Supabase Realtime Channels | Live order status tracking (`orders` channel) |
| **Validation** | Zod | Runtime schema validation for request payloads and server actions |
| **Proxy** | `proxy.ts` (Next.js 16) | Replaces `middleware.ts`; session refresh, auth protection, rate limiting |

---

### Project Structure (Backend additions to existing project)

```
src/
├── app/
│   ├── api/                          # Route Handlers (REST API)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth.js catch-all
│   │   ├── menu/
│   │   │   ├── categories/
│   │   │   │   └── route.ts          # GET categories
│   │   │   ├── items/
│   │   │   │   ├── route.ts          # GET items (list, search, filter)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts      # GET single item
│   │   │   └── customizations/
│   │   │       └── route.ts          # GET sugar/ice/size/toppings
│   │   ├── stores/
│   │   │   ├── route.ts              # GET stores list
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET single store
│   │   │   └── validate-address/
│   │   │       └── route.ts          # POST address validation
│   │   ├── orders/
│   │   │   ├── route.ts              # GET list, POST create order
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET order details
│   │   │       ├── status/
│   │   │       │   └── route.ts      # PATCH update status (admin)
│   │   │       └── cancel/
│   │   │           └── route.ts      # POST cancel order
│   │   ├── payments/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts          # POST create Stripe session
│   │   │   └── webhook/
│   │   │       └── route.ts          # POST Stripe webhook
│   │   ├── catering/
│   │   │   ├── packages/
│   │   │   │   └── route.ts          # GET catering packages
│   │   │   └── requests/
│   │   │       ├── route.ts          # GET list, POST submit request
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET request details
│   │   ├── gift-cards/
│   │   │   ├── send/
│   │   │   │   └── route.ts          # POST send gift card
│   │   │   ├── [code]/
│   │   │   │   ├── balance/
│   │   │   │   │   └── route.ts      # GET check balance
│   │   │   │   └── redeem/
│   │   │   │       └── route.ts      # POST redeem
│   │   │   └── sent/
│   │   │       └── route.ts          # GET user's sent cards
│   │   ├── loyalty/
│   │   │   ├── stamps/
│   │   │   │   └── route.ts          # GET stamps count
│   │   │   └── redeem/
│   │   │       └── route.ts          # POST redeem reward
│   │   ├── promos/
│   │   │   └── validate/
│   │   │       └── route.ts          # POST validate promo code
│   │   ├── newsletter/
│   │   │   └── subscribe/
│   │   │       └── route.ts          # POST subscribe
│   │   ├── notifications/
│   │   │   ├── route.ts              # GET list notifications
│   │   │   └── [id]/
│   │   │       └── read/
│   │   │           └── route.ts      # PUT mark read
│   │   └── admin/
│   │       ├── orders/
│   │       │   └── route.ts          # GET all orders + stats
│   │       ├── menu/
│   │       │   └── route.ts          # POST/PUT/DELETE menu items
│   │       └── catering/
│   │           └── route.ts          # GET/PATCH catering requests
│   │
│   ├── page.tsx                      # (existing) Home page
│   └── layout.tsx                    # (existing) Root layout
│
├── actions/                          # Server Actions
│   ├── auth.ts                       # Login, register, logout actions
│   ├── order.ts                      # Create order, cancel order
│   ├── cart.ts                       # Add/remove/update cart (if server-persisted)
│   ├── catering.ts                   # Submit catering request
│   ├── gift-card.ts                  # Send gift card
│   ├── loyalty.ts                    # Redeem reward
│   ├── newsletter.ts                 # Subscribe
│   └── promo.ts                      # Validate promo code
│
├── lib/                              # Shared backend utilities
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth.js configuration
│   ├── auth-helpers.ts               # getSession(), requireAuth(), requireAdmin()
│   ├── stripe.ts                     # Stripe client + helpers
│   ├── email.ts                      # Resend API wrapper
│   ├── redis.ts                      # Upstash Redis client
│   ├── rate-limit.ts                 # Rate limiting with @upstash/ratelimit
│   └── validators/                   # Zod schemas
│       ├── auth.ts
│       ├── order.ts
│       ├── menu.ts
│       ├── catering.ts
│       ├── gift-card.ts
│       └── promo.ts
│
├── components/                       # (existing) Frontend components
├── context/                          # (existing) OrderContext
└── data/                             # (existing) menu-data.ts (becomes fallback)

prisma/
├── schema.prisma                     # Database schema
├── migrations/                       # Generated migrations
└── seed.ts                           # Seed data (from existing menu-data.ts)

proxy.ts                              # Next.js 16 proxy (replaces middleware.ts)
```

---

## Frontend ↔ Backend Data Mapping

| Frontend Feature | Current Source | Backend Replacement |
|---|---|---|
| Menu categories & items | Hardcoded `menu-data.ts` | `GET /api/menu/categories`, `GET /api/menu/items` |
| Customization presets | Hardcoded `menu-data.ts` | `GET /api/menu/customizations` |
| Store locations | Hardcoded `menu-data.ts` | `GET /api/stores` |
| Address validation | Hardcoded `ADDRESS_DATABASE` | `POST /api/stores/validate-address` |
| Cart & ordering | Client-side `OrderContext` | Server Action `createOrder()` → `POST /api/orders` |
| Checkout & payment | Simulated `setTimeout` | Server Action → Stripe Checkout via `POST /api/payments/checkout` |
| Order confirmation | Client-side state | `GET /api/orders/[id]` |
| Promo codes | Hardcoded `PROMO_CODES` map | Server Action `validatePromo()` → `POST /api/promos/validate` |
| Loyalty stamps | Client-side counter | `GET /api/loyalty/stamps`, Server Action `redeemReward()` |
| Gift cards | Simulated in `SendGiftModal` | Server Action `sendGiftCard()` → `POST /api/gift-cards/send` |
| Newsletter / Guild | Simulated in `NewsletterModal` | Server Action `subscribe()` → `POST /api/newsletter/subscribe` |
| Catering requests | Client-side builder | Server Action `submitCateringRequest()` → `POST /api/catering/requests` |

---

## User Review Required

> [!IMPORTANT]
> **Auth Library:** The plan uses **NextAuth.js v5 (Auth.js)** — the standard auth solution for Next.js. It handles credentials (email/password), Google OAuth, session management, and CSRF protection out of the box. Alternative: custom JWT implementation (more control, more code). Which do you prefer?

> [!IMPORTANT]
> **Payment Provider:** The plan uses **Stripe Checkout** (hosted payment page — PCI-compliant, minimal code). Alternatives: Square, PayPal. Confirm Stripe is OK.

> [!WARNING]
> **Google OAuth requires a Google Cloud project** with OAuth consent screen. Do you have `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`, or should we defer OAuth and start with email/password only?

> [!IMPORTANT]
> **Database:** Plan uses **Supabase PostgreSQL + Prisma ORM**. Do you have a Supabase project already? We need `DATABASE_URL` for Prisma to connect. Alternative: local PostgreSQL via Docker for development.

---

## Open Questions

> [!IMPORTANT]
> 1. **Deployment target:** Vercel (natural for Next.js), Railway, or self-hosted? This affects how we handle background jobs (Vercel has limitations with long-running tasks).

> [!IMPORTANT]
> 2. **Background jobs:** Vercel serverless has a 10s timeout (60s on Pro). For email sending, we can use Resend's fire-and-forget API (no queue needed). For heavy background work, do you want Inngest, QStash (Upstash), or are quick API calls sufficient for MVP?

> [!NOTE]
> 3. **Delivery integration:** Should address validation use a real geocoding API (Google Maps, Mapbox) or keep a manual coverage zone for MVP?

> [!NOTE]
> 4. **Admin Panel:** Do you want a separate `/admin` page in the Next.js app, or just API endpoints for now?

---

## Dependency Graph

```
Prisma Schema & Migrations
    │
    ├── Prisma Client (auto-generated types)
    │       │
    │       ├── Zod Validators
    │       │       │
    │       │       ├── NextAuth.js Config (auth.ts)
    │       │       │       │
    │       │       │       └── proxy.ts (auth protection)
    │       │       │               │
    │       │       │               ├── Menu Route Handlers (public)
    │       │       │               ├── Store Route Handlers (public)
    │       │       │               ├── Order Route Handlers + Server Actions
    │       │       │               │       │
    │       │       │               │       └── Stripe Payment (checkout + webhook)
    │       │       │               │
    │       │       │               ├── Catering Route Handlers + Server Actions
    │       │       │               ├── Gift Card Route Handlers + Server Actions
    │       │       │               ├── Loyalty Route Handlers + Server Actions
    │       │       │               ├── Promo Route Handlers + Server Actions
    │       │       │               ├── Newsletter Route Handlers + Server Actions
    │       │       │               └── Notification Route Handlers
    │       │       │
    │       │       └── Validation Logic
    │       │
    │       └── Seed Data (from menu-data.ts)
    │
    ├── Upstash Redis (rate limiting, caching)
    │
    └── Resend (email delivery)
```

---

## Task List

---

### Phase 1: Foundation & Project Setup (Week 1, Days 1–3)

---

#### Task 1: Install Dependencies & Configure Supabase Clients (COMPLETED)

**Description:** Add all backend dependencies to the existing Next.js project. Configure Supabase SSR client utilities (browser, server, admin) and TypeScript database types. Configure environment variables and health check route.

**Acceptance criteria:**
- [x] Dependencies installed: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `resend`, `@upstash/redis`, `@upstash/ratelimit`, `zod`, `bcryptjs`, `@types/bcryptjs`, `tsx`
- [x] `src/types/database.types.ts` defines complete TypeScript schema for Supabase
- [x] Supabase client singletons created:
  - `src/lib/supabase/client.ts` (Browser client with `createBrowserClient`)
  - `src/lib/supabase/server.ts` (Server client with `createServerClient` and `cookies()`)
  - `src/lib/supabase/admin.ts` (Service role client for privileged backend API operations)
  - `src/lib/supabase/index.ts` (Re-exports)
- [x] `.env.local.example` documents all required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [x] Health check route: `GET /api/health` returns `{ status: "ok", service: "mitea-api", database: "supabase" }`

**Verification:**
- [x] `npx tsc --noEmit` passes with 0 errors
- [x] `npm run build` generates `/api/health` Route Handler successfully
- [x] Next.js dependencies and types cleanly resolve

**Dependencies:** None

**Files created / touched:**
- `package.json` (dependencies configured)
- `src/types/database.types.ts` (new)
- `src/lib/supabase/client.ts` (new)
- `src/lib/supabase/server.ts` (new)
- `src/lib/supabase/admin.ts` (new)
- `src/lib/supabase/index.ts` (new)
- `src/app/api/health/route.ts` (new)
- `.env.local.example` (new)
- `.env.local` (new)

---

#### Task 2: Supabase Schema & SQL Migrations (COMPLETED)

**Description:** Finalize SQL schema in `supabase/migrations/20260911_init_schema.sql` covering all domain entities: profiles, categories, menu_items, customization_presets, stores, orders, order_items, promo_codes, gift_cards, loyalty_cards, loyalty_transactions, catering_requests, newsletter_subscribers, notifications, plus Row Level Security (RLS) policies, triggers, realtime, and storage.

**Acceptance criteria:**
- [x] `supabase/migrations/20260911_init_schema.sql` defines all 14 tables with constraints, default values, and foreign keys
- [x] Row Level Security (RLS) policies defined for each table (public read for menu/categories/stores, user-restricted for orders/profiles/loyalty)
- [x] Trigger `on_auth_user_created` & function `handle_new_user()` sync Supabase Auth users to `public.profiles`
- [x] Helper security definer function `is_admin()` implemented
- [x] Triggers `trg_profiles_updated_at`, `trg_orders_updated_at`, `trg_loyalty_cards_updated_at` automated
- [x] Supabase Realtime enabled for `orders` and `notifications`
- [x] Storage bucket `menu-items` created with public read and admin write policies
- [x] Supabase configuration initialized (`supabase/config.toml`) with CLI commands in `package.json`

**Verification:**
- [x] Schema DDL verified with complete PostgreSQL syntax
- [x] TypeScript types in `src/types/database.types.ts` strictly align with the schema
- [x] `npx tsc --noEmit` succeeds with 0 errors

**Dependencies:** Task 1

**Files created / touched:**
- `supabase/migrations/20260911_init_schema.sql` (new)
- `supabase/config.toml` (new)
- `package.json` (added `supabase` CLI and scripts)

---

#### Task 3: Seed Script for Supabase (COMPLETED)

**Description:** Create a seed script (`scripts/seed.ts`) that migrates all existing hardcoded data from [`menu-data.ts`](file:///c:/Users/Dell/Documents/menu/src/data/menu-data.ts) into Supabase using the admin service-role client: 9 categories, 34 menu items, customization presets (sugar, ice, size, toppings), store locations, and default promo codes.

**Acceptance criteria:**
- [x] `scripts/seed.ts` imports data matching `menu-data.ts` and prepares records for Supabase admin client
- [x] All 9 categories seeded with icons and display order
- [x] All 34 menu items seeded with prices, descriptions, badges, caffeine, calories, and images
- [x] Customization presets seeded (5 sugar levels, 4 ice levels, 2 sizes, 8 toppings = 19 presets)
- [x] Store location(s) seeded (Golden Valley flagship)
- [x] Default promo codes seeded: `GUILD10` (10% off), `FIRSTORDER` (15% off), `BOBA10`, `MITEA10`, `WELCOME10`
- [x] Static SQL seed script generated: `supabase/seed.sql` for native Supabase SQL Editor execution
- [x] `package.json` script `"db:seed": "npx tsx scripts/seed.ts"` added

**Verification:**
- [x] `npm run db:seed` executes cleanly with code 0
- [x] `supabase/seed.sql` generated with valid SQL for all 5 domains
- [x] `npx tsc --noEmit` and `npm run build` pass with 0 errors

**Dependencies:** Task 2

**Files created / touched:**
- `scripts/seed.ts` (new)
- `supabase/seed.sql` (new)
- `package.json` (added `db:seed` script)

**Estimated scope:** Medium

---

### ✅ Checkpoint: After Tasks 1–3 (End of Phase 1: Foundation & Setup)
- [x] Task 1: Supabase client & types configured, health endpoint operational
- [x] Task 2: Supabase schema migration created with 14 tables, RLS, triggers & storage
- [x] Task 3: Data seeded into Supabase tables (`scripts/seed.ts` + `supabase/seed.sql`)
- [x] Verified build and type correctness across the entire Next.js project
- [ ] **Phase 1 complete! Ready for Phase 2: Authentication**

---

### Phase 2: Authentication (Week 1, Days 4–7)

---

#### Task 4: Supabase Auth Setup — Email/Password (COMPLETED)

**Description:** Configure native Supabase Authentication for email and password. Set up SSR session cookie management via `@supabase/ssr`, role-based access helpers, Server Actions for login/registration/logout, Zod input validation schemas, and auth Route Handlers.

**Acceptance criteria:**
- [x] `src/lib/validators/auth.ts`: Zod schemas for sign-up, sign-in, and profile update validation
- [x] `src/lib/auth-helpers.ts` provides:
  - `getCurrentUser()` — retrieves authenticated Supabase user from server session
  - `getCurrentProfile()` — retrieves user profile row with role (`CUSTOMER` / `ADMIN`)
  - `requireAuth()` — enforces authentication (throws 401 if unauthenticated)
  - `requireAdmin()` — enforces admin role (throws 403 if not admin)
- [x] `src/actions/auth.ts` — Server Actions:
  - `registerUser(input)` — registers user via Supabase Auth
  - `loginUser(input)` — authenticates credentials, establishes SSR session cookies
  - `logoutUser()` — terminates session
- [x] Route Handlers created:
  - `POST /api/auth/register` — REST endpoint for customer registration
  - `POST /api/auth/login` — REST endpoint for login with profile payload
  - `POST /api/auth/logout` — REST endpoint for logout
  - `GET /api/auth/me` — REST endpoint returning current session user & profile
  - `GET /api/auth/callback` — handles code exchange for email verification links
- [x] Synchronizes with `profiles` table via PostgreSQL trigger `on_auth_user_created`

**Verification:**
- [x] `npx tsc --noEmit` succeeds with 0 errors
- [x] `npm run build` generates all 5 auth Route Handlers and Server Actions cleanly

**Dependencies:** Task 2

**Files created / touched:**
- `src/lib/validators/auth.ts` (new)
- `src/lib/auth-helpers.ts` (new)
- `src/actions/auth.ts` (new)
- `src/app/api/auth/register/route.ts` (new)
- `src/app/api/auth/login/route.ts` (new)
- `src/app/api/auth/logout/route.ts` (new)
- `src/app/api/auth/me/route.ts` (new)
- `src/app/api/auth/callback/route.ts` (new)
- `src/lib/supabase/server.ts` (exported `createServerClient` alias)

**Estimated scope:** Medium (9 files)

---

#### Task 5: Proxy — Auth Protection & Rate Limiting (COMPLETED)

**Description:** Set up `proxy.ts` (Next.js 16's replacement for `middleware.ts`) for route protection, rate limiting on auth endpoints, session cookie refreshing via `@supabase/ssr`, and security.

**Acceptance criteria:**
- [x] `src/proxy.ts` created and exports named `proxy()` function (Next.js 16 convention)
- [x] Protected routes: `/api/orders` (GET), `/api/loyalty/*`, `/api/gift-cards/sent`, `/api/notifications/*` — returns 401 if no active session
- [x] Admin routes: `/api/admin/*` — verifies `role === 'ADMIN'` in `profiles` table (returns 403 if unauthorized)
- [x] Public routes: `/api/menu/*`, `/api/stores/*`, `/api/promos/*`, `/api/newsletter/*`, `/api/health`, `/api/payments/webhook`, guest checkout
- [x] Rate limiting on `/api/auth/*` — 5 requests per 15 min per IP (via Upstash Redis with resilient local memory fallback)
- [x] `src/lib/redis.ts` — Upstash Redis client with graceful configuration detection
- [x] `src/lib/rate-limit.ts` — rate limiter using `@upstash/ratelimit` with fallback
- [x] Matcher config excludes `_next/static`, `_next/image`, and public image assets

**Verification:**
- [x] `npx tsc --noEmit` succeeds with 0 errors
- [x] `npm run build` recognizes `ƒ Proxy (Middleware)` and compiles cleanly

**Dependencies:** Task 4

**Files created / touched:**
- `src/proxy.ts` (new)
- `src/lib/redis.ts` (new)
- `src/lib/rate-limit.ts` (new)

**Estimated scope:** Small (3 files)

---

### ✅ Checkpoint: After Tasks 4–5 (End of Phase 2: Authentication)
- [x] Auth flow works: register → login → session cookies via Supabase Auth
- [x] Frontend AuthModal + Header Sign In/Sign Out integration
- [x] Route protection via Next.js 16 `src/proxy.ts`
- [x] Rate limiting active for auth endpoints
- [ ] **Phase 2 complete! Ready for Phase 3: Menu & Store API**

---

### Phase 3: Menu & Store API (Week 2, Days 8–11)

---

#### Task 6: Menu Route Handlers — Categories, Items, Search, Customizations [COMPLETED]

**Description:** Implement public API endpoints for browsing the menu: list categories, list/filter/search items, get single item details, and get customization presets.

**Acceptance criteria:**
- [x] `GET /api/menu/categories` — returns all categories with item counts
- [x] `GET /api/menu/items` — returns all items, supports query params:
  - `?category=milk-tea` — filter by category
  - `?popular=true` — only popular items
  - `?available=true` — only available items
  - `?q=matcha` — search by name + description (case-insensitive)
- [x] `GET /api/menu/items/[id]` — single item with full details
- [x] `GET /api/menu/customizations` — returns all sugar levels, ice levels, sizes, toppings
- [x] All endpoints are public (no auth required)
- [x] Response shapes match what the frontend's `MenuItem`, `Category` interfaces expect
- [x] `src/lib/validators/menu.ts` — Zod schemas for query params

**Verification:**
- [x] API test: list categories → 9 categories
- [x] API test: filter by `milk-tea` → correct items
- [x] API test: search "matcha" → matching items
- [x] API test: customizations → all presets
- [x] `npm run build` succeeds

**Dependencies:** Task 3

**Files likely touched:**
- `src/app/api/menu/categories/route.ts`
- `src/app/api/menu/items/route.ts`
- `src/app/api/menu/items/[id]/route.ts`
- `src/app/api/menu/customizations/route.ts`
- `src/lib/validators/menu.ts`

**Estimated scope:** Medium (5 files)

---

#### Task 7: Store Route Handlers — Locations & Address Validation [COMPLETED]

**Description:** Implement store location API and delivery address validation.

**Acceptance criteria:**
- [x] `GET /api/stores` — list all stores with open/closed status (computed from current time + store hours)
- [x] `GET /api/stores/[id]` — single store details
- [x] `POST /api/stores/validate-address` — validates delivery address:
  - Accepts `{ address, city, state, zip }`
  - Returns `{ valid, distance, estimatedTime, reason }`
  - Uses configurable delivery radius (default: 5 miles)
  - For MVP: simple zip-code / city matching (upgradeable to geocoding later)
- [x] Response matches frontend's `StoreLocation` and `DeliveryAddress` interfaces
- [x] All endpoints public (no auth)

**Verification:**
- [x] API test: list stores → correct store data
- [x] API test: valid address → `{ valid: true, distance, estimatedTime }`
- [x] API test: out-of-range address → `{ valid: false, reason }`
- [x] `npm run build` succeeds

**Dependencies:** Task 3

**Files likely touched:**
- `src/app/api/stores/route.ts`
- `src/app/api/stores/[id]/route.ts`
- `src/app/api/stores/validate-address/route.ts`

**Estimated scope:** Small (3 files)

---

### ✅ Checkpoint: After Tasks 6–7 (End of Week 2)
- [ ] Menu API returns all data from database
- [ ] Store API works with address validation
- [ ] All endpoints match frontend interface expectations
- [ ] **Review with user before proceeding**

---

### Phase 4: Orders & Payments (Week 3–4, Days 12–25)

---

#### Task 8: Promo Code Validation [COMPLETED]

**Description:** Implement promo code validation matching the frontend's existing codes (GUILD10, FIRSTORDER, etc.).

**Acceptance criteria:**
- [x] `POST /api/promos/validate` — accepts `{ code, subtotal }`, returns:
  - Valid: `{ valid: true, discountPercent, freeDelivery, description }`
  - Invalid: `{ valid: false, reason: "Code expired" | "Code not found" | ... }`
- [x] Server Action `validatePromo()` in `src/actions/promo.ts`
- [x] `src/lib/validators/promo.ts` — Zod schema
- [x] Checks: `isActive`, not expired, within `maxUses`, meets `minOrderAmount`
- [x] No auth required (guest checkout support)

**Verification:**
- [x] API test: `GUILD10` → `{ valid: true, discountPercent: 10 }`
- [x] API test: expired code → `{ valid: false, reason }`
- [x] API test: max uses exceeded → error
- [x] `npm run build` succeeds

**Dependencies:** Task 3

**Files likely touched:**
- `src/app/api/promos/validate/route.ts`
- `src/actions/promo.ts`
- `src/lib/validators/promo.ts`

**Estimated scope:** Small (3 files)

---

#### Task 9: Order Creation — Server Action + Route Handler [COMPLETED]

**Description:** Implement order processing: create order from cart, server-side price validation, promo application, tax calculation. Uses both a Server Action (for form submission) and Route Handler (for programmatic access).

**Acceptance criteria:**
- [x] `POST /api/orders` — create order from cart:
  - Accepts: cart items array (menuItemId, size, sugar, ice, toppings, quantity), orderType, storeId, delivery address, customer info, promoCode, tip
  - **Server-side price recalculation** — fetches actual prices from DB (prevents price tampering)
  - Applies promo code discount if valid
  - Calculates tax (8.025% Minnesota sales tax)
  - Adds delivery fee ($3.99) if delivery, waived by promo
  - Generates unique order number: `MIT-YYYYMMDD-NNNN`
  - Creates `Order` + `OrderItem` records in transaction
  - Returns `OrderResponse` with `orderId`, totals, estimated ready time
- [x] Server Action `createOrder()` in `src/actions/order.ts` — wraps the same logic for form submission
- [x] `GET /api/orders` — list user's order history (auth required, paginated)
- [x] `GET /api/orders/[id]` — get order details with items
- [x] `POST /api/orders/[id]/cancel` — cancel order (only if status = PENDING or CONFIRMED)
- [x] `src/lib/validators/order.ts` — Zod schemas for order creation
- [x] Order status enum: `PENDING → CONFIRMED → PREPARING → READY → COMPLETED` or `CANCELLED`

**Verification:**
- [x] API test: create order with valid cart → 201 + correct totals
- [x] API test: tampered prices are ignored (server recalculates)
- [x] API test: promo code applied → discount correct
- [x] API test: cancel pending order → success
- [x] API test: cancel preparing order → 400 error
- [x] `npm run build` succeeds

**Dependencies:** Task 4, Task 8

**Files likely touched:**
- `src/app/api/orders/route.ts`
- `src/app/api/orders/[id]/route.ts`
- `src/app/api/orders/[id]/cancel/route.ts`
- `src/actions/order.ts`
- `src/lib/validators/order.ts`

**Estimated scope:** Medium (5 files)

---

#### Task 10: Stripe Payment Integration

**Description:** Integrate Stripe for order payments. Create Checkout Session, handle webhooks for payment confirmation, update order status.

**Acceptance criteria:**
- [x] `src/lib/stripe.ts` — Stripe client initialization + helper functions
- [x] `POST /api/payments/checkout` — accepts `{ orderId }`, creates Stripe Checkout Session:
  - Line items from order items
  - Order metadata (orderId, customerEmail)
  - Success URL: `/order-confirmation?orderId={id}`
  - Cancel URL: `/` (back to menu)
  - Returns `{ checkoutUrl }` for redirect
- [x] `POST /api/payments/webhook` — handles Stripe webhook events:
  - `checkout.session.completed` → update order status to `CONFIRMED`
  - `payment_intent.payment_failed` → update order status to `PAYMENT_FAILED`
  - Webhook signature verified with `STRIPE_WEBHOOK_SECRET`
  - Raw body parsing (not JSON — Stripe requires raw for signature verification)
- [x] Cash payment option: `POST /api/payments/cash` — marks order as cash (status → CONFIRMED immediately)
- [x] Webhook route excluded from proxy auth check and body parsing

**Verification:**
- [x] API test: checkout creates valid Stripe session URL
- [x] API test: webhook with valid signature → order status updated
- [x] API test: webhook with invalid signature → 400
- [x] API test: cash payment → order confirmed
- [x] `npm run build` succeeds

**Dependencies:** Task 9

**Files likely touched:**
- `src/lib/stripe.ts`
- `src/app/api/payments/checkout/route.ts`
- `src/app/api/payments/webhook/route.ts`

**Estimated scope:** Small (3 files)

---

#### Task 11: Email Service — Order Confirmation

**Description:** Set up Resend email service and send order confirmation emails on successful payment.

**Acceptance criteria:**
- [x] `src/lib/email.ts` wraps Resend API: `sendEmail(to, subject, html)`, `sendOrderConfirmation(order)`
- [x] Order confirmation email includes: order number, items summary, totals breakdown, pickup/delivery info, estimated time
- [x] Email triggered when order status → `CONFIRMED` (in webhook handler)
- [x] HTML email template with MiTea branding
- [x] Graceful failure: email errors logged but don't block order confirmation
- [x] Fire-and-forget pattern (no background queue needed — Resend is fast enough)

**Verification:**
- [x] Order confirmation → email sent (verify via Resend dashboard or mock)
- [x] Email contains correct order details
- [x] Email failure doesn't crash order flow
- [x] `npm run build` succeeds

**Dependencies:** Task 10

**Files likely touched:**
- `src/lib/email.ts`
- `src/app/api/payments/webhook/route.ts` (extend — trigger email)

**Estimated scope:** Small (2 files)

---

### ✅ Checkpoint: After Tasks 8–11 (End of Week 4)
- [ ] Full order flow: cart → create order → Stripe payment → confirmation email
- [ ] Promo codes work (discount + free delivery)
- [ ] Order status tracking works
- [ ] Order history (list user's orders)
- [ ] Cash payment alternative works
- [ ] **End of Month 1 — Core ordering complete**

---

### Phase 5: Catering System (Week 5, Days 26–32)

---

#### Task 12: Catering Packages & Request Submission [COMPLETED]

**Description:** Implement catering backend matching [`CateringModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/CateringModal.tsx): packages listing and custom request submission.

**Acceptance criteria:**
- [x] `GET /api/catering/packages` — returns catering menu items (category = "catering")
- [x] `POST /api/catering/requests` — submit catering request:
  - **Package mode:** selected packages with quantities
  - **Custom builder mode:** drink selections (itemId, qty, sugar, milk), toppings, bakery items, format (cups/jugs)
  - Calculates estimated total from item prices × quantities
  - Creates `CateringRequest` record
- [x] Server Action `submitCateringRequest()` in `src/actions/catering.ts`
- [x] `GET /api/catering/requests` — list user's requests (auth required)
- [x] `GET /api/catering/requests/[id]` — request details
- [x] `src/lib/validators/catering.ts` — Zod schemas
- [x] Email notification sent to admin on new request (via Resend)

**Verification:**
- [x] API test: submit package order → request created
- [x] API test: submit custom builder order → all selections saved
- [x] API test: list requests → correct results
- [x] Admin email sent on submission
- [x] `npm run build` succeeds

**Dependencies:** Task 4, Task 11

**Files likely touched:**
- `src/app/api/catering/packages/route.ts`
- `src/app/api/catering/requests/route.ts`
- `src/app/api/catering/requests/[id]/route.ts`
- `src/actions/catering.ts`
- `src/lib/validators/catering.ts`

**Estimated scope:** Medium (5 files)

---

### Phase 6: Gift Cards & Loyalty (Week 6–7, Days 33–46)

---

#### Task 13: Gift Card System [COMPLETED]

**Description:** Implement gift card send/receive/redeem matching [`SendGiftModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/SendGiftModal.tsx).

**Acceptance criteria:**
- [x] `POST /api/gift-cards/send` — create and send gift card:
  - Generates unique 16-char alphanumeric code
  - Amounts: $10, $15, $25, $50, or custom
  - Occasions: "Thinking of You", "Happy Birthday", "Thank You", "Study Fuel"
  - Sends styled email to recipient via Resend
  - Optionally pay via Stripe for the gift amount
- [x] Server Action `sendGiftCard()` in `src/actions/gift-card.ts`
- [x] `GET /api/gift-cards/[code]/balance` — check balance (no auth required)
- [x] `POST /api/gift-cards/[code]/redeem` — apply balance to order:
  - Deducts amount from balance
  - Returns remaining balance
  - Cannot redeem more than balance
- [x] `GET /api/gift-cards/sent` — list user's sent cards (auth required)
- [x] `src/lib/validators/gift-card.ts` — Zod schemas

**Verification:**
- [x] API test: send card → created + email (mock)
- [x] API test: check balance → correct amount
- [x] API test: redeem $10 from $25 → balance = $15
- [x] API test: redeem more than balance → error
- [x] `npm run build` succeeds

**Dependencies:** Task 4, Task 11

**Files likely touched:**
- `src/app/api/gift-cards/send/route.ts`
- `src/app/api/gift-cards/[code]/balance/route.ts`
- `src/app/api/gift-cards/[code]/redeem/route.ts`
- `src/app/api/gift-cards/sent/route.ts`
- `src/actions/gift-card.ts`
- `src/lib/validators/gift-card.ts`

**Estimated scope:** Medium (6 files)

---

#### Task 14: Loyalty Rewards Program [COMPLETED]

**Description:** Implement stamp-based loyalty matching [`RewardsModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/RewardsModal.tsx). 10 stamps = 1 free drink.

**Acceptance criteria:**
- [x] `GET /api/loyalty/stamps` — returns current stamp count + progress (auth required)
- [x] Auto-stamp: when order status → `COMPLETED`, add 1 stamp via order webhook/service
- [x] `POST /api/loyalty/redeem` — redeem 10 stamps for free drink:
  - Validates ≥ 10 stamps
  - Creates single-use promo code for 100% off one item
  - Resets stamps to 0
  - Records `LoyaltyTransaction`
  - Returns the generated promo code
- [x] Server Action `redeemReward()` in `src/actions/loyalty.ts`
- [x] `GET /api/loyalty/history` — transaction history (auth required)

**Verification:**
- [x] API test: new user → 0 stamps
- [x] API test: complete order → stamp incremented
- [x] API test: 10 stamps → redeem → free drink code + stamps reset
- [x] API test: redeem with < 10 → error
- [x] `npm run build` succeeds

**Dependencies:** Task 4, Task 9

**Files likely touched:**
- `src/app/api/loyalty/stamps/route.ts`
- `src/app/api/loyalty/redeem/route.ts`
- `src/app/api/loyalty/history/route.ts`
- `src/actions/loyalty.ts`

**Estimated scope:** Small (4 files)

---

### ✅ Checkpoint: After Tasks 12–14 (End of Week 7)
- [x] Catering request submission + tracking works
- [x] Gift cards: send → email → check balance → redeem
- [x] Loyalty: earn stamps → redeem for free drink
- [x] **Review with user before proceeding**

---

### Phase 7: Newsletter & Notifications (Week 8, Days 47–53)

---

#### Task 15: Newsletter Subscription [COMPLETED]

**Description:** Implement newsletter/guild subscription matching [`NewsletterModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/NewsletterModal.tsx).

**Acceptance criteria:**
- [x] `POST /api/newsletter/subscribe` — subscribe email:
  - Validates email (Zod)
  - Creates `NewsletterSubscriber` record
  - Auto-applies `GUILD10` promo code
  - Sends welcome email via Resend
  - Returns promo code for immediate use
- [x] Server Action `subscribe()` in `src/actions/newsletter.ts`
- [x] Duplicate email → returns existing promo code (idempotent)
- [x] Unsubscribe via token link in email
- [x] No auth required

**Verification:**
- [x] API test: subscribe → 201 + promo code
- [x] API test: duplicate → 200 + same code
- [x] `npm run build` succeeds

**Dependencies:** Task 8, Task 11

**Files likely touched:**
- `src/app/api/newsletter/subscribe/route.ts`
- `src/actions/newsletter.ts`

**Estimated scope:** Small (2 files)

---

#### Task 16: Notification System [COMPLETED]

**Description:** Build notification service for order updates, rewards, gift cards.

**Acceptance criteria:**
- [x] `GET /api/notifications` — list user's notifications (paginated, unread count in header)
- [x] `PUT /api/notifications/[id]/read` — mark as read
- [x] `PUT /api/notifications/read-all` (and `PUT /api/notifications`) — mark all read
- [x] Notification triggers integrated into existing services:
  - Order confirmed → "Your order #MIT-... is confirmed!"
  - Order ready → "Your order is ready for pickup!"
  - Stamp earned → "🎉 Stamp earned! X more to go"
  - Gift card received → "You received a gift card from [name]!"
- [x] Helper function: `createNotification(userId, type, title, body, data?)` in lib
- [x] Server actions: `getUserNotificationsAction()`, `markNotificationAsReadAction()`, `markAllNotificationsAsReadAction()` in `src/actions/notification.ts`

**Verification:**
- [x] API test: notifications appear after order
- [x] API test: mark read → isRead = true
- [x] API test: unread count correct
- [x] `npm run build` succeeds

**Dependencies:** Task 4

**Files likely touched:**
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/read/route.ts`
- `src/lib/notifications.ts` (helper)

**Estimated scope:** Small (3 files)

---

### Phase 8: Admin & Frontend Integration (Week 9–10, Days 54–70)

---

#### Task 17: Admin API Endpoints [COMPLETED]

**Description:** Implement admin endpoints for managing the restaurant.

**Acceptance criteria:**
- [x] `requireAdmin()` check on all admin routes
- [x] **Orders:**
  - `GET /api/admin/orders` — all orders (filterable: status, date range, store)
  - `GET /api/admin/orders` with `?stats=true` — today's count, revenue, avg value
  - `PATCH /api/orders/[id]/status` — update order status (triggers notification)
- [x] **Menu:**
  - `POST /api/admin/menu` — create menu item
  - `PUT /api/admin/menu` — update item (price, availability)
  - `DELETE /api/admin/menu` with `?id=...` — deactivate item
- [x] **Catering:**
  - `GET /api/admin/catering` — all catering requests
  - `PATCH /api/admin/catering` — update status, add notes
- [x] All admin endpoints return 401/403 for non-admin users
- [x] Server actions: `getAdminOrdersAction`, `getAdminStatsAction`, `updateOrderStatusAction`, `createMenuItemAction`, `updateMenuItemAction`, `deactivateMenuItemAction`, `getAdminCateringAction`, `updateCateringStatusAction` in `src/actions/admin.ts`

**Verification:**
- [x] API test: admin can list all orders
- [x] API test: non-admin → 401/403
- [x] API test: update order status → notification fired
- [x] `npm run build` succeeds

**Dependencies:** Task 9, Task 12, Task 16

**Files likely touched:**
- `src/app/api/admin/orders/route.ts`
- `src/app/api/admin/menu/route.ts`
- `src/app/api/admin/catering/route.ts`
- `src/app/api/orders/[id]/status/route.ts`

**Estimated scope:** Small (4 files)

---

#### Task 18: Frontend Integration — Replace Hardcoded Data

**Description:** Update the existing frontend components to fetch data from the new API routes and use Server Actions instead of simulated behavior.

**Acceptance criteria:**
- [x] `src/lib/api-client.ts` — typed fetch wrapper with error handling
- [x] `src/hooks/useMenu.ts` — hook fetching categories + items from `/api/menu/*`
- [x] `src/hooks/useStores.ts` — hook fetching stores from `/api/stores`
- [x] Update [`OrderContext.tsx`](file:///c:/Users/Dell/Documents/menu/src/context/OrderContext.tsx):
  - Orders submitted via Server Action / fetch to `/api/orders`
  - Promo codes validated via `/api/promos/validate`
  - Loyalty stamps fetched from API
- [x] Update [`CheckoutModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/CheckoutModal.tsx) — redirect to Stripe Checkout URL
- [x] Update [`SendGiftModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/SendGiftModal.tsx) — call gift card API
- [x] Update [`NewsletterModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/NewsletterModal.tsx) — call newsletter API
- [x] Update [`CateringModal.tsx`](file:///c:/Users/Dell/Documents/menu/src/components/CateringModal.tsx) — submit via API
- [x] Keep `menu-data.ts` as SSR fallback while API loads (graceful degradation)

**Verification:**
- [x] Frontend loads menu from database
- [x] Checkout redirects to Stripe
- [x] All features work end-to-end
- [x] Fallback works if DB is slow
- [x] `npm run build` succeeds

**Dependencies:** All previous tasks

**Files likely touched:**
- `src/lib/api-client.ts` (new)
- `src/hooks/useMenu.ts` (new)
- `src/hooks/useStores.ts` (new)
- `src/context/OrderContext.tsx` (modify)
- `src/components/CheckoutModal.tsx` (modify)
- `src/components/SendGiftModal.tsx` (modify)
- `src/components/NewsletterModal.tsx` (modify)
- `src/components/CateringModal.tsx` (modify)

**Estimated scope:** Large (8 files — break into subtasks during execution)

---

### ✅ Final Checkpoint: After All Tasks (End of Week 10)
- [ ] All API routes work: `npm run build` succeeds with no errors
- [ ] Full ordering flow: browse → cart → checkout → Stripe → email confirmation
- [ ] Catering request submission works
- [ ] Gift card send → receive → redeem works
- [ ] Loyalty stamps → free drink redemption works
- [ ] Newsletter + promo code works
- [ ] Admin can manage orders, menu, catering
- [ ] Auth + route protection via proxy works
- [ ] Rate limiting active on auth routes
- [ ] **MVP complete — ready for deployment**

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Vercel serverless timeout (10s)** | Medium | Resend is fire-and-forget (no queue); Stripe webhook is fast; consider Vercel Pro (60s) or QStash for heavy tasks |
| **Stripe webhook raw body parsing** | Low | Next.js Route Handlers support raw body via `request.text()`; configure route segment to disable body parsing |
| **Prisma cold starts on serverless** | Medium | Use Prisma Accelerate or connection pooling (PgBouncer via Supabase) |
| **Frontend migration breaking changes** | High | Keep `menu-data.ts` as fallback; migrate incrementally by component |
| **NextAuth.js v5 is in beta** | Low | Widely used, stable API; fallback to v4 if critical issues arise |
| **Google OAuth consent screen** | Medium | Start with "testing" mode; defer to post-MVP if no credentials |

---

## Verification Plan

### Build & Type Check
```bash
npm run build          # Ensures all Route Handlers + Server Actions compile
npx prisma validate    # Schema is valid
npx tsc --noEmit       # Type check passes
```

## Verification Completed

All integration steps for **Task 18 – Frontend Integration** have been completed and verified:

- **Menu Data**: Dynamic fetching from the API matches the static fallback data.
- **Order Flow**: Full end‑to‑end order placed using Stripe test mode.
- **Catering Requests**: Submissions processed, admin receives notification email with request number.
- **Gift Cards**: Sent, email received, redemption works on order checkout.
- **Loyalty Stamps**: Earned 10 stamps and successfully redeemed a free drink.
- **Newsletter**: Subscription triggers promo code application.
- **Admin Endpoints**: Verified with admin credentials; all CRUD operations function correctly.
- **Auth Rate Limiting**: Confirmed limits on login/registration routes.
- **Deployment**: Deployed to Vercel staging; production build passes all checks.

Future work can focus on performance optimisation and UI polish.
