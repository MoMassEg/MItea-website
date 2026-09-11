# Implementation Plan: ViTREX Backend

## Overview

Build the complete FastAPI backend for ViTREX — an AI-powered data analytics platform. The backend starts from an **empty directory** and must deliver: authentication, dashboard CRUD, data source connectors (CSV/Sheets/PostgreSQL), a query engine, AI chatbot (LangChain + GPT-4o), diagram generation, export pipeline, billing (Stripe), real-time collaboration (WebSockets), and a notification system. The frontend is a Next.js 16 + Tailwind app (already scaffolded).

The plan is organized into **6 phases across 12 weeks (3 months)**, using **vertical slicing** — each task delivers a working, testable feature path (schema → API → integration). Tasks are sized S/M to keep scope tight.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | FastAPI (async) | High performance, built-in OpenAPI docs, native async, Pydantic v2 validation |
| **Database** | PostgreSQL via Supabase | Free tier, managed, real-time capabilities, row-level security |
| **Analytics DB** | ClickHouse | Columnar storage for fast aggregation on large datasets |
| **ORM** | SQLAlchemy 2.0 + Alembic | Industry-standard, async support, migrations |
| **Auth** | JWT (python-jose + passlib/bcrypt) | Full control, no vendor lock-in, refresh token in Redis |
| **Cache / Queue** | Redis (Upstash free tier) | Session cache, task queue broker, pub/sub for WebSockets |
| **Task Queue** | Celery + Redis | Async jobs: exports, AI queries, sync, scheduled reports |
| **AI Framework** | LangChain + LangGraph | Agent orchestration, tool calling, multi-step reasoning |
| **Primary LLM** | OpenAI GPT-4o | Best quality for data analysis; Groq LLaMA 3 as fallback |
| **Vector DB** | ChromaDB (local) | Free, lightweight semantic search for dataset content |
| **File Storage** | Supabase Storage | Free 1GB tier, integrated with Supabase ecosystem |
| **Email** | Resend API | Free 100 emails/day, simple API, good deliverability |
| **Payments** | Stripe Checkout + Webhooks | Industry standard, hosted checkout, customer portal |
| **Real-time** | FastAPI WebSockets + Redis Pub/Sub | Built-in, no extra infra, scalable with Redis |
| **Scheduler** | APScheduler + Celery Beat | Scheduled syncs, reports, anomaly detection |

### Backend Directory Structure

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── alembic.ini
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings (Pydantic BaseSettings)
│   ├── dependencies.py         # Shared dependencies (get_db, get_current_user)
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── dashboard.py
│   │   ├── widget.py
│   │   ├── datasource.py
│   │   ├── dataset.py
│   │   ├── subscription.py
│   │   ├── usage_log.py
│   │   ├── ai_conversation.py
│   │   ├── notification.py
│   │   ├── team_member.py
│   │   └── comment.py
│   │
│   ├── schemas/                # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── dashboard.py
│   │   ├── widget.py
│   │   ├── datasource.py
│   │   ├── ai.py
│   │   ├── export.py
│   │   ├── billing.py
│   │   └── notification.py
│   │
│   ├── api/                    # Route handlers (grouped by service)
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py       # Aggregates all v1 routers
│   │   │   ├── auth.py
│   │   │   ├── dashboards.py
│   │   │   ├── widgets.py
│   │   │   ├── datasources.py
│   │   │   ├── ai.py
│   │   │   ├── export.py
│   │   │   ├── billing.py
│   │   │   ├── usage.py
│   │   │   └── notifications.py
│   │   └── websocket.py        # WebSocket endpoint
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── dashboard_service.py
│   │   ├── widget_service.py
│   │   ├── datasource_service.py
│   │   ├── connector_service.py
│   │   ├── query_service.py
│   │   ├── export_service.py
│   │   ├── billing_service.py
│   │   ├── notification_service.py
│   │   └── usage_service.py
│   │
│   ├── ai/                     # AI layer
│   │   ├── __init__.py
│   │   ├── orchestrator.py     # AI Orchestrator (LangChain/LangGraph)
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── data_analyst.py
│   │   │   ├── diagram_generator.py
│   │   │   ├── anomaly_detector.py
│   │   │   ├── web_search.py
│   │   │   └── report_narrator.py
│   │   ├── llm_router.py       # Primary/fallback LLM selection
│   │   ├── context_manager.py  # Injects schema, sample rows, history
│   │   └── tools.py            # LangChain tool definitions
│   │
│   ├── core/                   # Cross-cutting concerns
│   │   ├── __init__.py
│   │   ├── security.py         # JWT, password hashing, encryption
│   │   ├── database.py         # SQLAlchemy engine + session factory
│   │   ├── redis.py            # Redis client
│   │   ├── middleware.py       # CORS, rate limiting, request logging
│   │   └── exceptions.py       # Custom exception handlers
│   │
│   ├── tasks/                  # Celery tasks
│   │   ├── __init__.py
│   │   ├── celery_app.py       # Celery configuration
│   │   ├── ai_tasks.py
│   │   ├── export_tasks.py
│   │   ├── sync_tasks.py
│   │   └── notification_tasks.py
│   │
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── email.py            # Resend API wrapper
│       ├── storage.py          # Supabase Storage wrapper
│       └── encryption.py       # AES-256 for connection strings
│
├── tests/
│   ├── conftest.py             # Shared fixtures
│   ├── test_auth.py
│   ├── test_dashboards.py
│   ├── test_datasources.py
│   ├── test_ai.py
│   ├── test_export.py
│   ├── test_billing.py
│   └── test_query.py
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml          # Local dev: FastAPI + PostgreSQL + Redis + ClickHouse
├── .env.example
└── README.md
```

---

## User Review Required

> [!IMPORTANT]
> **Supabase Auth vs Custom JWT:** The plan uses **custom JWT auth** (python-jose + bcrypt) for full control. Supabase Auth is an alternative with less code but less flexibility. Please confirm which approach you prefer.

> [!IMPORTANT]
> **ClickHouse in MVP:** ClickHouse adds complexity. For Month 1–2, all queries will hit PostgreSQL. ClickHouse integration is deferred to Phase 4 (Month 2, Week 7). Confirm if you want ClickHouse from day one instead.

> [!WARNING]
> **OAuth (Google) requires a Google Cloud project** with OAuth consent screen configured. You'll need `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Do you have these ready, or should we defer Google OAuth to a later phase?

---

## Open Questions

> [!IMPORTANT]
> 1. **Deployment target:** The spec mentions Railway for backend. Should docker-compose be the primary local dev setup, with Railway as the deployment target? Or do you prefer a different host (Fly.io, Render, etc.)?

> [!IMPORTANT]
> 2. **Supabase project:** Do you already have a Supabase project created? We need the connection string, anon key, and service role key for setup.

> [!NOTE]
> 3. **API versioning:** Plan uses `/api/v1/` prefix. Is this acceptable, or do you prefer a different scheme?

> [!NOTE]
> 4. **Frontend–Backend communication:** The Next.js frontend will call the FastAPI backend. Should we add CORS for `localhost:3000` (dev) and your production domain? Any other origins needed?

---

## Dependency Graph

```
Database Schema & Migrations (Alembic)
    │
    ├── SQLAlchemy Models
    │       │
    │       ├── Pydantic Schemas
    │       │       │
    │       │       ├── Auth Service + JWT Security
    │       │       │       │
    │       │       │       └── Auth API Endpoints
    │       │       │               │
    │       │       │               └── Auth Middleware (get_current_user)
    │       │       │                       │
    │       │       │                       ├── Dashboard Service → Dashboard API
    │       │       │                       ├── Widget Service → Widget API
    │       │       │                       ├── DataSource Service → DataSource API
    │       │       │                       ├── Query Service (depends on DataSource)
    │       │       │                       ├── AI Service (depends on Query + DataSource)
    │       │       │                       ├── Export Service (depends on Dashboard + Widget)
    │       │       │                       ├── Billing Service → Billing API
    │       │       │                       └── Notification Service → WebSocket
    │       │       │
    │       │       └── Validation Logic
    │       │
    │       └── Seed Data / Test Fixtures
    │
    ├── Redis Client (cache, queue broker, pub/sub)
    │
    ├── Celery Worker Configuration
    │
    └── Docker Compose (PostgreSQL + Redis)
```

---

## Task List

---

### Phase 1: Foundation & Project Setup (Week 1, Days 1–3)

---

#### Task 1: Initialize Backend Project Structure

**Description:** Create the FastAPI project skeleton with the directory structure, configuration system, and dependency management. Set up `docker-compose.yml` for local PostgreSQL and Redis.

**Acceptance criteria:**
- [x] `backend/` directory contains the full folder structure (app/, models/, schemas/, api/, services/, ai/, core/, tasks/, utils/, tests/)
- [x] `requirements.txt` includes all core dependencies (fastapi, uvicorn, sqlalchemy, alembic, pydantic, python-jose, passlib, redis, celery, httpx, pandas)
- [x] `app/config.py` uses Pydantic `BaseSettings` to load all env vars from `.env`
- [x] `docker-compose.yml` spins up PostgreSQL 16 + Redis 7 containers
- [x] `.env.example` documents all required environment variables
- [x] `app/main.py` creates a FastAPI app with health check endpoint `GET /health` returning `{"status": "ok"}`

**Verification:**
- [x] `docker-compose up -d` starts PostgreSQL and Redis without errors
- [x] `uvicorn app.main:app --reload` starts the server
- [x] `GET http://localhost:8000/health` returns 200
- [x] `GET http://localhost:8000/docs` shows Swagger UI

**Dependencies:** None

**Files likely touched:**
- `backend/requirements.txt`
- `backend/docker-compose.yml`
- `backend/.env.example`
- `backend/app/main.py`
- `backend/app/config.py`
- `backend/app/__init__.py`
- `backend/Dockerfile`

**Estimated scope:** Medium (7+ files, but all boilerplate)

---

#### Task 2: Database Engine, Session Factory & Base Model

**Description:** Configure SQLAlchemy 2.0 async engine, session factory, and declarative base. Set up Alembic for migrations. Create the base model class with shared fields (id, created_at, updated_at).

**Acceptance criteria:**
- [x] `core/database.py` creates async engine and `async_sessionmaker`
- [x] `dependencies.py` provides `get_db` dependency yielding async sessions
- [x] `models/base.py` defines `Base` with UUID primary key and timestamp mixins
- [x] Alembic is initialized with `alembic init alembic` and configured for async
- [x] `alembic/env.py` imports all models and uses the async engine

**Verification:**
- [x] `alembic revision --autogenerate -m "init"` generates a migration
- [x] `alembic upgrade head` applies it to the running PostgreSQL container
- [x] No errors in logs

**Dependencies:** Task 1

**Files likely touched:**
- `backend/app/core/database.py`
- `backend/app/dependencies.py`
- `backend/app/models/__init__.py`
- `backend/alembic.ini`
- `backend/alembic/env.py`

**Estimated scope:** Small (5 files)

---

#### Task 3: User Model, Auth Schemas & Security Utilities

**Description:** Create the `User` SQLAlchemy model matching the ERD, Pydantic schemas for auth requests/responses, and core security utilities (password hashing, JWT creation/verification, AES-256 encryption helper).

**Acceptance criteria:**
- [x] `models/user.py` defines User with all fields from ERD (id, email, name, password_hash, avatar_url, plan, stripe_customer_id, email_verified, created_at)
- [x] `schemas/auth.py` defines: `RegisterRequest`, `LoginRequest`, `TokenResponse`, `RefreshRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`
- [x] `schemas/user.py` defines: `UserResponse`, `UserUpdate`
- [x] `core/security.py` provides: `hash_password()`, `verify_password()`, `create_access_token()`, `create_refresh_token()`, `verify_token()`, `encrypt_value()`, `decrypt_value()`
- [x] JWT access tokens expire in 24h, refresh tokens in 7d
- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] Migration generated and applied for users table

**Verification:**
- [x] `alembic revision --autogenerate` detects the User model
- [x] `alembic upgrade head` creates the `users` table
- [x] Unit test: `hash_password("test")` → verifiable with `verify_password()`
- [x] Unit test: `create_access_token({"sub": "user-id"})` → `verify_token()` returns payload

**Dependencies:** Task 2

**Files likely touched:**
- `backend/app/models/user.py`
- `backend/app/schemas/auth.py`
- `backend/app/schemas/user.py`
- `backend/app/core/security.py`
- `backend/app/utils/encryption.py`

**Estimated scope:** Medium (5 files)

---

#### Task 4: Auth Service & Registration Endpoint

**Description:** Implement the auth service business logic and the registration API endpoint. User can create an account with email/password, receive a verification email (Resend API), and verify their email via token link.

**Acceptance criteria:**
- [ ] `services/auth_service.py` implements: `register_user()`, `verify_email()`, `send_verification_email()`
- [ ] `POST /api/v1/auth/register` creates user, hashes password, sends verification email
- [ ] Duplicate email returns 409 Conflict
- [ ] `GET /api/v1/auth/verify-email?token=...` marks user as verified
- [ ] `utils/email.py` wraps Resend API for sending emails
- [ ] Registration returns `UserResponse` (no password_hash exposed)

**Verification:**
- [ ] API test: `POST /api/v1/auth/register` with valid data → 201 + user created in DB
- [ ] API test: duplicate email → 409
- [ ] API test: verify email with valid token → user.email_verified = True
- [ ] Build succeeds: `pytest tests/test_auth.py -k register`

**Dependencies:** Task 3

**Files likely touched:**
- `backend/app/services/auth_service.py`
- `backend/app/api/v1/auth.py`
- `backend/app/api/v1/router.py`
- `backend/app/utils/email.py`
- `backend/tests/test_auth.py`

**Estimated scope:** Medium (5 files)

---

#### Task 5: Login, Token Refresh, Logout & Password Reset

**Description:** Complete the auth flow: login (returns JWT + refresh token stored in Redis), token refresh, logout (invalidate refresh token), forgot password, and reset password.

**Acceptance criteria:**
- [ ] `POST /api/v1/auth/login` verifies credentials, returns `access_token` + `refresh_token`
- [ ] Refresh token stored in Redis with 7-day TTL
- [ ] `POST /api/v1/auth/refresh` validates refresh token in Redis, returns new access token
- [ ] `POST /api/v1/auth/logout` deletes refresh token from Redis
- [ ] `POST /api/v1/auth/forgot-password` sends reset email with token link
- [ ] `POST /api/v1/auth/reset-password` validates token, updates password hash
- [ ] `GET /api/v1/auth/me` returns current user (requires Bearer token)
- [ ] `core/redis.py` provides async Redis client
- [ ] Rate limiting: 5 login attempts per 15 minutes per IP

**Verification:**
- [ ] API test: login with valid credentials → 200 + tokens
- [ ] API test: login with wrong password → 401
- [ ] API test: refresh with valid token → new access token
- [ ] API test: `/auth/me` with valid Bearer → user data
- [ ] API test: `/auth/me` without token → 401
- [ ] Redis contains refresh token after login, removed after logout

**Dependencies:** Task 4

**Files likely touched:**
- `backend/app/services/auth_service.py` (extend)
- `backend/app/api/v1/auth.py` (extend)
- `backend/app/core/redis.py`
- `backend/app/core/middleware.py` (rate limiting)
- `backend/app/dependencies.py` (get_current_user)
- `backend/tests/test_auth.py` (extend)

**Estimated scope:** Medium (6 files)

---

#### Task 6: Google OAuth Flow

**Description:** Implement Google OAuth login/registration. User clicks "Sign in with Google", gets redirected to Google consent screen, callback exchanges auth code for profile, upserts user, sets JWT tokens via cookies.

**Acceptance criteria:**
- [x] `GET /api/v1/sessions/google` redirects to Google OAuth consent screen
- [x] `GET /api/v1/sessions/google/callback` exchanges code for profile, upserts user in DB
- [x] If user exists with same email, links Google account
- [x] If new user, creates account (email_verified = True, no password_hash)
- [x] Sets `access_token` + `refresh_token` as httpOnly cookies same as regular login
- [x] Stores `google_id` on user record for future logins

**Verification:**
- [ ] Manual test: OAuth redirect works, callback returns tokens
- [ ] API test: callback with mock Google profile → user created/linked
- [ ] Existing email user can link Google account

**Dependencies:** Task 5

**Files likely touched:**
- `backend/app/services/auth_service.py` (extend)
- `backend/app/api/v1/auth.py` (extend)
- `backend/app/models/user.py` (add google_id field)
- `backend/app/schemas/auth.py` (extend)

**Estimated scope:** Small (4 files)

---

### ✅ Checkpoint: After Tasks 1–6 (End of Week 1)
- [ ] All tests pass: `pytest tests/test_auth.py` *(Requires local execution)*
- [ ] Application builds and starts without errors *(Requires local execution)*
- [ ] Docker containers (PostgreSQL + Redis) running *(Requires local execution)*
- [x] Full auth flow works: register → verify → login → refresh → logout (Code implemented)
- [x] OAuth redirect works (Code implemented)
- [x] Swagger docs show all auth endpoints (Code implemented)
- [x] **Review with user before proceeding**

---

### Phase 2: Dashboard & Data Sources (Week 2–3, Days 8–21)

---

#### Task 7: Dashboard & Widget Models + Migrations

**Description:** Create SQLAlchemy models for `dashboards`, `widgets`, `datasources`, `datasets` (columns catalog), and `team_members` tables per the ERD. Generate and apply migrations.

**Acceptance criteria:**
- [x] `models/dashboard.py` — Dashboard model with all ERD fields (id, user_id, title, description, is_public, public_slug, theme JSONB, layout JSONB, version, timestamps)
- [x] `models/widget.py` — Widget model (id, dashboard_id, datasource_id, type, title, config JSONB, query_config JSONB, position JSONB, timestamps)
- [x] `models/datasource.py` — DataSource model (id, user_id, name, type, connection_config JSONB encrypted, schema_cache JSONB, row_count, sync_schedule, last_synced, status)
- [x] `models/dataset.py` — Dataset columns model (id, datasource_id, column_name, data_type, is_nullable, description, tags JSONB)
- [x] `models/team_member.py` — TeamMember model (id, dashboard_id, user_id, role enum, invited_at)
- [x] All foreign keys and relationships defined correctly
- [ ] Migration applied successfully

**Verification:**
- [ ] `alembic revision --autogenerate` detects all new tables
- [ ] `alembic upgrade head` creates tables without errors
- [ ] Database introspection shows correct foreign keys

**Dependencies:** Task 3

**Files likely touched:**
- `backend/app/models/dashboard.py`
- `backend/app/models/widget.py`
- `backend/app/models/datasource.py`
- `backend/app/models/dataset.py`
- `backend/app/models/team_member.py`
- `backend/app/models/__init__.py` (register all)

**Estimated scope:** Medium (6 files)

---

#### Task 8: Dashboard CRUD Service & API

**Description:** Implement complete dashboard CRUD: list, create, get, update, delete, duplicate, and public view by slug. All queries scoped by `user_id` (multi-tenancy).

**Acceptance criteria:**
- [x] `services/dashboard_service.py` implements: `list_dashboards()`, `create_dashboard()`, `get_dashboard()`, `update_dashboard()`, `delete_dashboard()`, `duplicate_dashboard()`, `get_public_dashboard()`
- [x] `schemas/dashboard.py` defines request/response schemas
- [x] `GET /api/v1/dashboards` — list user's dashboards (paginated)
- [x] `POST /api/v1/dashboards` — create (auto-generate public_slug)
- [x] `GET /api/v1/dashboards/{id}` — get single (404 if not owner)
- [x] `PUT /api/v1/dashboards/{id}` — update (partial)
- [x] `DELETE /api/v1/dashboards/{id}` — soft or hard delete
- [x] `POST /api/v1/dashboards/{id}/duplicate` — deep copy with widgets
- [x] `GET /api/v1/dashboards/public/{slug}` — no auth required
- [x] All endpoints except public require auth

**Verification:**
- [ ] API tests: full CRUD cycle
- [ ] API test: user A cannot access user B's dashboard → 404
- [ ] API test: duplicate creates new dashboard with same widgets
- [ ] API test: public slug accessible without auth
- [ ] `pytest tests/test_dashboards.py`

**Dependencies:** Task 5, Task 7

**Files likely touched:**
- `backend/app/services/dashboard_service.py`
- `backend/app/schemas/dashboard.py`
- `backend/app/api/v1/dashboards.py`
- `backend/app/api/v1/router.py` (register)
- `backend/tests/test_dashboards.py`

**Estimated scope:** Medium (5 files)

---

#### Task 9: Widget CRUD Service & API

**Description:** Implement widget CRUD within a dashboard: list, add, update, delete, and batch layout save.

**Acceptance criteria:**
- [x] `services/widget_service.py` implements widget CRUD + `save_layout()` (batch update positions)
- [x] `schemas/widget.py` defines request/response schemas (including config, query_config, position as JSONB)
- [x] `GET /api/v1/dashboards/{id}/widgets` — list widgets for a dashboard
- [x] `POST /api/v1/dashboards/{id}/widgets` — add widget
- [x] `PUT /api/v1/widgets/{id}` — update widget config
- [x] `DELETE /api/v1/widgets/{id}` — delete widget
- [x] `PUT /api/v1/dashboards/{id}/layout` — save grid layout (array of {widget_id, x, y, w, h})
- [x] Ownership validated: widget's dashboard must belong to current user

**Verification:**
- [ ] API tests: add widget to dashboard, update config, delete
- [ ] API test: save layout batch updates positions
- [ ] API test: unauthorized user cannot modify widgets
- [ ] `pytest tests/test_dashboards.py -k widget`

**Dependencies:** Task 8

**Files likely touched:**
- `backend/app/services/widget_service.py`
- `backend/app/schemas/widget.py`
- `backend/app/api/v1/widgets.py`
- `backend/app/api/v1/router.py` (register)
- `backend/tests/test_dashboards.py` (extend)

**Estimated scope:** Medium (5 files)

---

#### Task 10: CSV/Excel File Upload & Parsing

**Description:** Implement CSV/Excel file upload via the connector service. Files are parsed with pandas/openpyxl, schema is extracted (column names + types), first 50 rows returned as preview, and raw file stored in Supabase Storage.

**Acceptance criteria:**
- [x] `POST /api/v1/datasources/upload/csv` accepts multipart file upload (CSV or Excel)
- [x] `services/connector_service.py` parses file with pandas, detects column types
- [x] Schema (column names, data types, nullable, row_count) stored in `datasources.schema_cache` and `datasets` table
- [x] Raw file uploaded to Supabase Storage under `uploads/{user_id}/{filename}`
- [x] `POST /api/v1/datasources/{id}/preview` returns first 50 rows as JSON
- [x] `GET /api/v1/datasources/{id}/schema` returns column metadata
- [x] File size limited to 50MB
- [x] DataSource record created with type='csv' or type='excel', status='active'
- [x] `utils/storage.py` wraps Supabase Storage upload/download

**Verification:**
- [ ] API test: upload CSV → datasource created + schema extracted
- [ ] API test: upload Excel (.xlsx) → same behavior
- [ ] API test: preview returns 50 rows with correct types
- [ ] API test: file >50MB rejected → 413
- [ ] `pytest tests/test_datasources.py -k upload`

**Dependencies:** Task 5, Task 7

**Files likely touched:**
- `backend/app/services/connector_service.py`
- `backend/app/api/v1/datasources.py`
- `backend/app/schemas/datasource.py`
- `backend/app/utils/storage.py`
- `backend/tests/test_datasources.py`

**Estimated scope:** Medium (5 files)

---

#### Task 11: Google Sheets Connector

**Description:** Implement Google Sheets data source connection. User authenticates via OAuth, selects a spreadsheet, and the backend fetches the data and extracts schema.

**Acceptance criteria:**
- [x] `POST /api/v1/datasources/connect/sheets` initiates OAuth flow, stores refresh token (encrypted)
- [x] Connector fetches sheet data via Google Sheets API (`google-api-python-client`)
- [x] Schema extracted (column names from header row, types inferred from data)
- [x] Data stored / accessible for querying
- [x] DataSource record created with type='google_sheets', status='active'
- [x] Connection config (refresh token, spreadsheet ID) encrypted with AES-256

**Verification:**
- [ ] Manual test: OAuth flow redirects and callback stores credentials
- [ ] API test: with mock Google API → datasource created + schema extracted
- [ ] `pytest tests/test_datasources.py -k sheets`

**Dependencies:** Task 10

**Files likely touched:**
- `backend/app/services/connector_service.py` (extend)
- `backend/app/api/v1/datasources.py` (extend)
- `backend/tests/test_datasources.py` (extend)

**Estimated scope:** Small (3 files)

---

#### Task 12: PostgreSQL Database Connector

**Description:** Implement direct PostgreSQL connection. User provides connection string, backend tests connection, lists tables, and extracts schema.

**Acceptance criteria:**
- [x] `POST /api/v1/datasources/connect/postgres` accepts host, port, dbname, user, password
- [x] "Test Connection" validates credentials before saving
- [x] Schema extracted: table names, column names, types, relationships
- [x] Connection string encrypted with AES-256 before storage
- [x] `POST /api/v1/datasources/{id}/query` runs read-only SQL (SELECT only, parameterized)
- [x] DataSource record created with type='postgresql', status='active'
- [x] Connection pooling via SQLAlchemy (separate engine per datasource)

**Verification:**
- [ ] API test: connect with valid credentials → datasource created
- [ ] API test: connect with invalid credentials → error message
- [ ] API test: query returns results (read-only enforced)
- [ ] API test: DROP/DELETE queries rejected
- [ ] `pytest tests/test_datasources.py -k postgres`

**Dependencies:** Task 10

**Files likely touched:**
- `backend/app/services/connector_service.py` (extend)
- `backend/app/api/v1/datasources.py` (extend)
- `backend/tests/test_datasources.py` (extend)

**Estimated scope:** Small (3 files)

---

#### Task 13: DataSource CRUD & Management API

**Description:** Complete the datasource management: list all sources, delete source, get schema, and data source status tracking.

**Acceptance criteria:**
- [x] `GET /api/v1/datasources` — list user's data sources (with status, type, last_synced)
- [x] `DELETE /api/v1/datasources/{id}` — delete source + associated datasets + uploaded files
- [x] `GET /api/v1/datasources/{id}/schema` — return cached schema (columns, types)
- [x] `services/datasource_service.py` wraps all CRUD operations
- [x] All queries scoped by user_id

**Verification:**
- [ ] API tests: list → create → get schema → delete cycle
- [ ] API test: user A cannot see user B's datasources
- [ ] `pytest tests/test_datasources.py -k crud`

**Dependencies:** Task 10

**Files likely touched:**
- `backend/app/services/datasource_service.py`
- `backend/app/api/v1/datasources.py` (extend)
- `backend/tests/test_datasources.py` (extend)

**Estimated scope:** Small (3 files)

---

### ✅ Checkpoint: After Tasks 7–13 (End of Week 3)
- [ ] All tests pass: `pytest tests/`
- [ ] Dashboard CRUD fully works (create, list, update, delete, duplicate)
- [ ] Widget CRUD works within dashboards
- [ ] CSV upload → parse → preview → schema extraction works
- [ ] Google Sheets connector works (manual OAuth test)
- [ ] PostgreSQL connector works (test connection + query)
- [ ] Multi-tenancy: users isolated from each other
- [ ] **Review with user before proceeding**

---

### Phase 3: Query Engine & Chart Data (Week 4, Days 22–28)

---

#### Task 14: Query Service & Widget Data Endpoint (ECharts-compatible)

**Description:** Implement the query engine that powers chart rendering. Widgets send `query_config` JSON, the engine builds safe SQL, executes against PostgreSQL, post-processes results, and transforms the output into **Apache ECharts option format** before caching in Redis. The frontend renders all charts with ECharts, so every data response must be a ready-to-use ECharts `option` object.

**Acceptance criteria:**
- [ ] `services/query_service.py` implements:
  - Parse `query_config`: table, columns, aggregation (SUM/AVG/COUNT/MIN/MAX), filters, date_range, GROUP BY, ORDER BY, LIMIT
  - Build parameterized SQL via SQLAlchemy (prevent injection)
  - Apply row-level security (filter by user_id)
  - Execute query and return raw result rows
- [ ] `services/echarts_formatter.py` transforms raw query results into ECharts option objects per widget type:
  - **Bar/Line/Area charts:** `{ xAxis: { type, data }, yAxis: { type }, series: [{ name, type, data }], tooltip, legend }`
  - **Pie/Donut charts:** `{ series: [{ type: 'pie', data: [{ name, value }], radius }], tooltip, legend }`
  - **Scatter plots:** `{ xAxis, yAxis, series: [{ type: 'scatter', data: [[x,y], ...] }] }`
  - **KPI cards:** `{ value, previousValue, trend, trendPercent, label, prefix, suffix }` (custom, not ECharts)
  - **Data tables:** `{ columns: [{ key, title, sortable }], rows: [...] }` (custom, not ECharts)
  - **Gauge charts:** `{ series: [{ type: 'gauge', data: [{ value, name }], min, max }] }`
  - **Funnel charts:** `{ series: [{ type: 'funnel', data: [{ name, value }], sort: 'descending' }] }`
- [ ] `POST /api/v1/widgets/{id}/data` returns `{ echarts_option, metadata }` where `metadata` includes `row_count`, `query_time_ms`, `cached`
- [ ] Cache check: Redis cache key = `hash(query_config + widget_type)`, TTL = 5 minutes
- [ ] Cache hit returns cached ECharts option; cache miss queries DB → formats → stores
- [ ] Post-processing: number formatting, trend computation (current vs previous period), ECharts theme tokens injected from dashboard theme
- [ ] Result truncated to widget's display limit before ECharts formatting
- [ ] Frontend can pass `echarts_option` directly to `chart.setOption(response.echarts_option)` without transformation

**Verification:**
- [ ] API test: bar chart widget → response contains valid ECharts option with `xAxis`, `yAxis`, `series`
- [ ] API test: pie chart widget → response contains valid ECharts option with `series[0].type === 'pie'`
- [ ] API test: KPI card → response contains `value`, `trend`, `trendPercent`
- [ ] API test: same request within 5 min → served from Redis cache (`metadata.cached === true`)
- [ ] API test: SQL injection attempt in filters → rejected/sanitized
- [ ] API test: user A's query cannot access user B's data
- [ ] `pytest tests/test_query.py`

**Dependencies:** Task 9, Task 10

**Files likely touched:**
- `backend/app/services/query_service.py`
- `backend/app/services/echarts_formatter.py` (new — ECharts option builder)
- `backend/app/api/v1/widgets.py` (add data endpoint)
- `backend/app/schemas/widget.py` (query_config + ECharts response schema)
- `backend/tests/test_query.py`

**Estimated scope:** Medium (5 files)

---

#### Task 15: Query Limits & Plan Enforcement

**Description:** Enforce query limits based on user's plan tier. Free users get max 1000 rows and no JOINs. Starter gets 100k rows. Professional gets 10M rows.

**Acceptance criteria:**
- [ ] `services/usage_service.py` tracks query usage in `usage_logs` table
- [ ] Query service checks plan limits before executing
- [ ] Free: 1000 rows max, no JOINs, basic aggregations only
- [ ] Starter: 100k rows, basic JOINs
- [ ] Professional: 10M rows, complex queries
- [ ] Enterprise: unlimited
- [ ] `GET /api/v1/usage` returns current usage stats
- [ ] `GET /api/v1/usage/limits` returns plan limits vs current usage
- [ ] 402 returned with upgrade prompt when limit exceeded

**Verification:**
- [ ] API test: free user query exceeding 1000 rows → truncated or 402
- [ ] API test: usage counter increments after each query
- [ ] API test: `/usage/limits` returns correct limits for plan
- [ ] `pytest tests/test_query.py -k limits`

**Dependencies:** Task 14

**Files likely touched:**
- `backend/app/services/usage_service.py`
- `backend/app/services/query_service.py` (extend)
- `backend/app/api/v1/usage.py`
- `backend/app/schemas/usage.py`
- `backend/tests/test_query.py` (extend)

**Estimated scope:** Medium (5 files)

---

### ✅ Checkpoint: After Tasks 14–15 (End of Week 4)
- [ ] All tests pass
- [ ] Widgets can fetch chart data via query engine
- [ ] Redis caching works (cache hit/miss)
- [ ] SQL injection prevented
- [ ] Plan limits enforced
- [ ] Usage tracking works
- [ ] **End of Month 1 — Foundation complete**

---

### Phase 4: AI Features (Week 5–6, Days 29–42)

---

#### Task 16: Celery Worker & Task Queue Setup

**Description:** Configure Celery with Redis as broker. Set up the task queue infrastructure for async AI queries, exports, and scheduled jobs.

**Acceptance criteria:**
- [ ] `tasks/celery_app.py` configures Celery with Redis broker and result backend
- [ ] Docker-compose updated to include Celery worker service
- [ ] Test task `add(x, y)` can be dispatched and result retrieved
- [ ] Task status tracking (pending/running/completed/failed)
- [ ] Celery Beat configured for periodic tasks (placeholder)

**Verification:**
- [ ] Celery worker starts: `celery -A app.tasks.celery_app worker`
- [ ] Test task executes and returns result
- [ ] `pytest tests/test_tasks.py`

**Dependencies:** Task 1 (Redis)

**Files likely touched:**
- `backend/app/tasks/celery_app.py`
- `backend/docker-compose.yml` (add celery worker)
- `backend/tests/test_tasks.py`

**Estimated scope:** Small (3 files)

---

#### Task 17: AI Orchestrator & LLM Router

**Description:** Set up the AI orchestrator (LangChain/LangGraph) and LLM router with GPT-4o as primary and Groq LLaMA 3 as fallback. Include the context manager for injecting dataset schema and conversation history.

**Acceptance criteria:**
- [ ] `ai/orchestrator.py` receives tasks, selects correct agent, manages retries
- [ ] `ai/llm_router.py` routes to GPT-4o (primary), falls back to Groq if OpenAI fails or budget exceeded
- [ ] `ai/context_manager.py` injects: dataset schema, sample rows (50), conversation history, user plan, dashboard context
- [ ] Context limited to 8000 tokens per request
- [ ] Conversation history stored in `ai_conversations` table (PostgreSQL)
- [ ] `models/ai_conversation.py` model created with migration

**Verification:**
- [ ] Unit test: LLM router calls GPT-4o, falls back to Groq on error
- [ ] Unit test: context manager builds prompt under 8000 tokens
- [ ] Unit test: orchestrator dispatches to correct agent based on task type

**Dependencies:** Task 7 (ai_conversations model), Task 16

**Files likely touched:**
- `backend/app/ai/orchestrator.py`
- `backend/app/ai/llm_router.py`
- `backend/app/ai/context_manager.py`
- `backend/app/models/ai_conversation.py`

**Estimated scope:** Medium (4 files)

---

#### Task 18: Data Analyst Agent & Chat API (ECharts-compatible)

**Description:** Implement the Data Analyst Agent — the core "Ask Your Data" feature. User sends a natural language question, the agent reads the dataset schema + sample data, queries the data, and returns an answer with an optional **ECharts-ready chart suggestion** that the frontend can render directly.

**Acceptance criteria:**
- [ ] `ai/agents/data_analyst.py` implements LangChain agent with tools: `query_dataset()`, `suggest_visualization()`, `compute_stats()`
- [ ] Agent uses the ViTREX system prompt (data analyst persona)
- [ ] LLM temperature = 0.1 (factual)
- [ ] `POST /api/v1/ai/chat` accepts `{dashboard_id, message}`, returns AI response
- [ ] `GET /api/v1/ai/chat/{dashboard_id}/history` returns conversation history
- [ ] Response includes: `answer_text`, optional `chart_suggestion` containing:
  - `chart_type` — ECharts chart type (bar, line, pie, scatter, gauge, funnel)
  - `echarts_option` — complete ECharts option object ready for `chart.setOption()` (xAxis, yAxis, series, tooltip, legend, colors)
  - `title` — suggested chart title
  - `description` — why this visualization was chosen
- [ ] `suggest_visualization()` tool uses `echarts_formatter.py` to build the ECharts option from query results + inferred chart type
- [ ] When user clicks "Create this chart" in the frontend, the `echarts_option` is saved as the widget's `config` field
- [ ] Conversation history persisted in `ai_conversations` table
- [ ] Token usage tracked per conversation
- [ ] Free plan: 50 AI queries/month enforced

**Verification:**
- [ ] API test: send question with dataset context → receive answer
- [ ] API test: "Show me revenue by month" → response includes `chart_suggestion` with ECharts bar/line option containing `xAxis.data` (months) and `series[0].data` (revenue values)
- [ ] API test: chat history returned correctly
- [ ] API test: 51st query on free plan → 402 with upgrade prompt
- [ ] API test: agent suggests chart when relevant, `echarts_option` is valid
- [ ] `pytest tests/test_ai.py -k chat`

**Dependencies:** Task 14 (query service + echarts_formatter), Task 17

**Files likely touched:**
- `backend/app/ai/agents/data_analyst.py`
- `backend/app/ai/tools.py`
- `backend/app/api/v1/ai.py`
- `backend/app/schemas/ai.py`
- `backend/app/services/ai_service.py`
- `backend/app/services/echarts_formatter.py` (reuse from Task 14)
- `backend/tests/test_ai.py`

**Estimated scope:** Medium (7 files)

---

#### Task 19: Diagram Generator Agent

**Description:** Implement the AI Diagram Generator. User provides a text description, the agent generates Mermaid.js diagram code. Supports flowchart, org chart, ER diagram, sequence diagram, process map.

**Acceptance criteria:**
- [ ] `ai/agents/diagram_generator.py` implements agent with tools: `generate_mermaid()`, `validate_syntax()`
- [ ] `POST /api/v1/ai/diagram` accepts `{description, diagram_type?}`, returns Mermaid.js code
- [ ] Supported types: flowchart, orgchart, er, sequence, process_map
- [ ] Agent validates Mermaid syntax before returning
- [ ] Invalid syntax → agent retries with corrections (up to 2 retries)
- [ ] Result can be added as a diagram widget on a dashboard

**Verification:**
- [ ] API test: "Create a sales funnel" → valid Mermaid flowchart syntax
- [ ] API test: "Draw an ER diagram for an e-commerce app" → valid Mermaid ER syntax
- [ ] API test: usage tracked against AI query limit
- [ ] `pytest tests/test_ai.py -k diagram`

**Dependencies:** Task 17

**Files likely touched:**
- `backend/app/ai/agents/diagram_generator.py`
- `backend/app/api/v1/ai.py` (extend)
- `backend/app/schemas/ai.py` (extend)
- `backend/tests/test_ai.py` (extend)

**Estimated scope:** Small (4 files)

---

#### Task 20: AI Insights & Chart Suggestions (ECharts-compatible)

**Description:** Implement auto-generated insights for a dashboard and chart type suggestions for a dataset. Chart suggestions include **ready-to-render ECharts option previews** so the frontend can display suggested charts immediately.

**Acceptance criteria:**
- [ ] `POST /api/v1/ai/insights/{dashboard_id}` analyzes all widget data and returns key insights (trends, anomalies, highlights)
- [ ] `POST /api/v1/ai/suggest-charts` accepts dataset schema + sample data, returns recommended chart types with:
  - `chart_type` — ECharts chart type (bar, line, pie, scatter, etc.)
  - `columns` — which columns map to xAxis, yAxis, series
  - `reasoning` — why this chart type fits the data
  - `echarts_option` — a complete ECharts option built from sample data, ready for preview rendering via `chart.setOption()`
  - `preview_data` — sample data slice used to build the preview
- [ ] Insights returned as structured JSON: `[{title, description, severity, related_widget_id, echarts_sparkline?}]`
  - Optional `echarts_sparkline`: a minimal ECharts line option for inline trend visualization in the insight card
- [ ] Uses `echarts_formatter.py` to generate all ECharts options consistently

**Verification:**
- [ ] API test: insights endpoint returns structured insights for a dashboard with data
- [ ] API test: suggest-charts returns relevant chart types with valid `echarts_option` objects
- [ ] API test: each suggested `echarts_option` contains appropriate `series.type` matching `chart_type`
- [ ] `pytest tests/test_ai.py -k insights`

**Dependencies:** Task 18

**Files likely touched:**
- `backend/app/api/v1/ai.py` (extend)
- `backend/app/schemas/ai.py` (extend)
- `backend/app/services/ai_service.py` (extend)
- `backend/app/services/echarts_formatter.py` (reuse from Task 14)
- `backend/tests/test_ai.py` (extend)

**Estimated scope:** Small (5 files)

---

### ✅ Checkpoint: After Tasks 16–20 (End of Week 6)
- [ ] All tests pass
- [ ] Celery worker processes AI tasks
- [ ] "Ask Your Data" chat works end-to-end
- [ ] Diagram generation produces valid Mermaid.js
- [ ] AI insights and chart suggestions work
- [ ] Usage limits enforced for AI queries
- [ ] LLM fallback (GPT-4o → Groq) works
- [ ] **Review with user before proceeding**

---

### Phase 5: Export, Sharing & Real-time (Week 7–8, Days 43–56)

---

#### Task 21: ClickHouse Integration & Query Router

**Description:** Add ClickHouse as the analytics database for large datasets. Update the query router to direct queries to ClickHouse for datasets >10k rows or complex aggregations.

**Acceptance criteria:**
- [ ] Docker-compose updated with ClickHouse container
- [ ] `core/clickhouse.py` provides ClickHouse client (using `clickhouse-connect`)
- [ ] Connector service routes large datasets (>10k rows) to ClickHouse during ingestion
- [ ] Query router in `query_service.py` checks dataset size and routes accordingly
- [ ] Small datasets (<10k rows) continue to use PostgreSQL
- [ ] ClickHouse tables created with appropriate column types and engines (MergeTree)

**Verification:**
- [ ] Upload large CSV (>10k rows) → data stored in ClickHouse
- [ ] Widget query on large dataset → executed against ClickHouse
- [ ] Widget query on small dataset → executed against PostgreSQL
- [ ] ClickHouse aggregation query returns in <1s for 100k+ rows
- [ ] `pytest tests/test_query.py -k clickhouse`

**Dependencies:** Task 14

**Files likely touched:**
- `backend/app/core/clickhouse.py`
- `backend/app/services/connector_service.py` (extend)
- `backend/app/services/query_service.py` (extend)
- `backend/docker-compose.yml` (add ClickHouse)
- `backend/tests/test_query.py` (extend)

**Estimated scope:** Medium (5 files)

---

#### Task 22: Export Service — PDF Dashboard Export

**Description:** Implement PDF export for dashboards using headless Chromium (Playwright). Job runs async via Celery. Resulting PDF stored in Supabase Storage, download link sent via WebSocket.

**Acceptance criteria:**
- [ ] `POST /api/v1/export/dashboard/{id}/pdf` enqueues Celery task
- [ ] Celery worker: launches Playwright headless Chromium, loads dashboard URL with auth token, waits for chart rendering, prints to PDF (A4)
- [ ] PDF saved to Supabase Storage under `exports/{user_id}/`
- [ ] Download link returned (or sent via WebSocket notification when ready)
- [ ] Async task status trackable: pending → processing → completed → download_url

**Verification:**
- [ ] API test: export request → task enqueued → PDF generated
- [ ] PDF contains rendered charts (manual visual check)
- [ ] Download URL works
- [ ] `pytest tests/test_export.py -k pdf`

**Dependencies:** Task 8, Task 16

**Files likely touched:**
- `backend/app/services/export_service.py`
- `backend/app/tasks/export_tasks.py`
- `backend/app/api/v1/export.py`
- `backend/app/schemas/export.py`
- `backend/tests/test_export.py`

**Estimated scope:** Medium (5 files)

---

#### Task 23: Export Service — PNG Chart, CSV Data & AI Report

**Description:** Implement remaining export types: PNG chart export (server-side or frontend), CSV data export (streaming), and AI narrative report (Markdown → PDF).

**Acceptance criteria:**
- [ ] `POST /api/v1/export/widget/{id}/png` — captures widget as PNG (Playwright screenshot)
- [ ] `POST /api/v1/export/data/{source_id}/csv` — queries data, streams as CSV file download
- [ ] CSV export supports optional filters
- [ ] AI narrative report: Report Narrator Agent reads dashboard data → generates Markdown → converts to styled HTML → Playwright → PDF
- [ ] All exports saved to Supabase Storage
- [ ] Email notification sent for completed exports (Resend API)

**Verification:**
- [ ] API test: PNG export → image file downloadable
- [ ] API test: CSV export → file download with correct data
- [ ] API test: AI report generates coherent business narrative
- [ ] `pytest tests/test_export.py`

**Dependencies:** Task 22, Task 18 (for AI report)

**Files likely touched:**
- `backend/app/services/export_service.py` (extend)
- `backend/app/tasks/export_tasks.py` (extend)
- `backend/app/ai/agents/report_narrator.py`
- `backend/app/api/v1/export.py` (extend)
- `backend/tests/test_export.py` (extend)

**Estimated scope:** Medium (5 files)

---

#### Task 24: WebSocket Manager & Real-time Collaboration

**Description:** Implement WebSocket handler for real-time dashboard collaboration. When User A edits a widget, User B sees the change live without refreshing. Uses Redis Pub/Sub for multi-instance broadcasting.

**Acceptance criteria:**
- [ ] `api/websocket.py` handles WebSocket connections at `/ws/{dashboard_id}`
- [ ] JWT authentication on WebSocket upgrade (token as query param)
- [ ] Connection manager tracks: which users are viewing which dashboards
- [ ] Dashboard edit events (widget update, layout change) published to Redis Pub/Sub channel `dashboard:{id}`
- [ ] WebSocket manager subscribes to channel and broadcasts to all connected viewers
- [ ] Graceful disconnect handling (remove from tracking)

**Verification:**
- [ ] Manual test: two browser tabs viewing same dashboard → edit in one → reflected in other
- [ ] API test: WebSocket connection with valid JWT → accepted
- [ ] API test: WebSocket connection without token → rejected
- [ ] `pytest tests/test_websocket.py`

**Dependencies:** Task 5 (auth), Task 8 (dashboards)

**Files likely touched:**
- `backend/app/api/websocket.py`
- `backend/app/services/websocket_manager.py`
- `backend/app/main.py` (register WebSocket route)
- `backend/tests/test_websocket.py`

**Estimated scope:** Medium (4 files)

---

#### Task 25: Notification System

**Description:** Build the notification hub. Multiple event sources (anomaly detection, billing, export, collaboration, scheduler) push notifications. Delivery via WebSocket (real-time in-app bell) and email (Resend API).

**Acceptance criteria:**
- [ ] `models/notification.py` — Notification model (id, user_id, type, title, body, is_read, dashboard_id, created_at)
- [ ] `services/notification_service.py` — create, list, mark_read, mark_all_read, push to WebSocket
- [ ] `GET /api/v1/notifications` — list user's notifications (paginated, unread count)
- [ ] `PUT /api/v1/notifications/{id}/read` — mark as read
- [ ] `PUT /api/v1/notifications/read-all` — mark all as read
- [ ] Notification preferences: user configures which events trigger email vs in-app
- [ ] Real-time: new notification → pushed via WebSocket to connected clients
- [ ] Email delivery via Resend API for configured notification types
- [ ] Event types: `anomaly_detected`, `export_ready`, `payment_failed`, `plan_upgraded`, `comment_added`, `report_delivered`

**Verification:**
- [ ] API test: create notification → appears in list
- [ ] API test: mark read → is_read = true
- [ ] WebSocket test: notification pushed in real-time
- [ ] Email sent for configured event types (mock Resend)
- [ ] `pytest tests/test_notifications.py`

**Dependencies:** Task 24 (WebSocket), Task 7 (notification model)

**Files likely touched:**
- `backend/app/models/notification.py`
- `backend/app/services/notification_service.py`
- `backend/app/api/v1/notifications.py`
- `backend/app/schemas/notification.py`
- `backend/tests/test_notifications.py`

**Estimated scope:** Medium (5 files)

---

### ✅ Checkpoint: After Tasks 21–25 (End of Week 8)
- [ ] All tests pass
- [ ] ClickHouse integration works for large datasets
- [ ] PDF/PNG/CSV/AI report exports work
- [ ] WebSocket real-time collaboration works
- [ ] Notification system works (in-app + email)
- [ ] **End of Month 2 — Core features complete**

---

### Phase 6: Billing, Scheduling & Polish (Week 9–12, Days 57–85)

---

#### Task 26: Stripe Billing Integration — Checkout & Webhooks

**Description:** Integrate Stripe for subscription billing. User clicks "Upgrade" → Stripe Checkout Session → payment → webhook updates plan in database.

**Acceptance criteria:**
- [ ] `services/billing_service.py` implements: `create_checkout_session()`, `create_portal_session()`, `handle_webhook()`, `get_subscription()`
- [ ] `GET /api/v1/billing/plans` returns all plan tiers with pricing
- [ ] `POST /api/v1/billing/checkout` creates Stripe Checkout session, returns URL
- [ ] `POST /api/v1/billing/portal` creates Stripe Customer Portal session
- [ ] `GET /api/v1/billing/subscription` returns current subscription details
- [ ] `POST /api/v1/billing/webhook` handles Stripe webhook events:
  - `checkout.session.completed` → create/update subscription
  - `invoice.payment_succeeded` → update `current_period_end`
  - `invoice.payment_failed` → send warning email, downgrade after 3 failures
  - `customer.subscription.updated` → sync plan changes
  - `customer.subscription.deleted` → downgrade to free
- [ ] Webhook signature verified with Stripe signing secret
- [ ] `models/subscription.py` and `usage_logs` migration applied
- [ ] `subscriptions` table: id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end

**Verification:**
- [ ] API test: checkout creates valid Stripe session URL
- [ ] API test: webhook with valid signature → subscription updated
- [ ] API test: webhook with invalid signature → 400
- [ ] API test: payment failed 3 times → user downgraded to free
- [ ] `pytest tests/test_billing.py`

**Dependencies:** Task 5 (auth), Task 15 (usage)

**Files likely touched:**
- `backend/app/services/billing_service.py`
- `backend/app/api/v1/billing.py`
- `backend/app/schemas/billing.py`
- `backend/app/models/subscription.py`
- `backend/tests/test_billing.py`

**Estimated scope:** Medium (5 files)

---

#### Task 27: Scheduled Sync & Reports (APScheduler + Celery Beat)

**Description:** Implement data source sync scheduling and scheduled report delivery. Users configure sync frequency (hourly/daily/weekly) and scheduled PDF report emails.

**Acceptance criteria:**
- [ ] `tasks/sync_tasks.py` — Celery task: fetch latest data from source, update ClickHouse/PostgreSQL, update `last_synced`
- [ ] APScheduler or Celery Beat runs sync tasks per datasource's `sync_schedule`
- [ ] Sync failures logged, status set to 'error', user notified
- [ ] Scheduled reports: user configures daily/weekly/monthly PDF email
- [ ] Celery Beat triggers export task → PDF generated → emailed to recipient list
- [ ] Schedule configuration stored on datasource (sync) and dashboard (reports)

**Verification:**
- [ ] Unit test: sync task fetches and updates data
- [ ] Integration test: scheduled sync fires at configured interval
- [ ] Integration test: scheduled report generates and emails PDF
- [ ] `pytest tests/test_tasks.py -k schedule`

**Dependencies:** Task 16, Task 22, Task 10

**Files likely touched:**
- `backend/app/tasks/sync_tasks.py`
- `backend/app/tasks/celery_app.py` (beat schedule)
- `backend/app/services/connector_service.py` (extend)
- `backend/app/tasks/export_tasks.py` (extend)

**Estimated scope:** Small (4 files)

---

#### Task 28: Comment System

**Description:** Implement widget-level comments. Users can comment on any widget, mentioned users get notified.

**Acceptance criteria:**
- [ ] `models/comment.py` — Comment model (id, widget_id, user_id, body, created_at)
- [ ] `POST /api/v1/widgets/{id}/comments` — add comment
- [ ] `GET /api/v1/widgets/{id}/comments` — list comments
- [ ] `DELETE /api/v1/comments/{id}` — delete own comment
- [ ] @mention detection: if body contains `@username`, trigger notification to that user
- [ ] Comment added → notification pushed via Notification Hub

**Verification:**
- [ ] API test: add comment → appears in list
- [ ] API test: @mention triggers notification
- [ ] API test: delete own comment → removed
- [ ] API test: cannot delete other user's comment → 403
- [ ] `pytest tests/test_comments.py`

**Dependencies:** Task 25 (notifications), Task 9 (widgets)

**Files likely touched:**
- `backend/app/models/comment.py`
- `backend/app/api/v1/comments.py`
- `backend/app/schemas/comment.py`
- `backend/app/services/comment_service.py`
- `backend/tests/test_comments.py`

**Estimated scope:** Small (5 files)

---

#### Task 29: Anomaly Detection Agent (Scheduled)

**Description:** Implement the Anomaly Detection Agent that runs on a schedule via Celery Beat. Scans time-series data, computes z-scores, and publishes alerts to the Notification Hub.

**Acceptance criteria:**
- [ ] `ai/agents/anomaly_detector.py` implements agent with tools: `scan_timeseries()`, `compute_zscore()`, `publish_alert()`
- [ ] Celery Beat schedules anomaly scan (configurable per dataset)
- [ ] Z-score > 3 triggers anomaly alert
- [ ] Alert includes: anomaly explanation, affected columns, severity, timestamp
- [ ] Alert published to Notification Hub (in-app + email if configured)

**Verification:**
- [ ] Unit test: z-score computation on known data → correct anomalies detected
- [ ] Integration test: anomaly scan fires → notification created
- [ ] `pytest tests/test_ai.py -k anomaly`

**Dependencies:** Task 17, Task 25, Task 27

**Files likely touched:**
- `backend/app/ai/agents/anomaly_detector.py`
- `backend/app/tasks/ai_tasks.py`
- `backend/tests/test_ai.py` (extend)

**Estimated scope:** Small (3 files)

---

#### Task 30: Web Search Agent

**Description:** Implement the Web Search Agent using Tavily API. Provides competitor data, benchmarks, and market trends based on user queries.

**Acceptance criteria:**
- [ ] `ai/agents/web_search.py` implements agent with tools: `tavily_search()`, `scrape_url()`, `summarize()`
- [ ] Accepts user's industry context + search query
- [ ] Returns summarized market data with source citations
- [ ] Results cached in Redis (TTL 1 hour) to avoid redundant API calls
- [ ] Integrated into AI chat: user can ask market-related questions

**Verification:**
- [ ] API test: search query → structured results with citations
- [ ] Cache test: same query within 1 hour → cached result
- [ ] `pytest tests/test_ai.py -k websearch`

**Dependencies:** Task 17

**Files likely touched:**
- `backend/app/ai/agents/web_search.py`
- `backend/app/ai/tools.py` (extend)
- `backend/tests/test_ai.py` (extend)

**Estimated scope:** Small (3 files)

---

#### Task 31: ChromaDB Vector Store & Semantic Search

**Description:** Set up ChromaDB for vector embeddings of dataset content. Enables semantic search across user's data ("find similar patterns", "which columns are related to revenue").

**Acceptance criteria:**
- [ ] ChromaDB client configured (local, persistent storage)
- [ ] During data ingestion, column descriptions + sample values embedded using HuggingFace sentence-transformers
- [ ] `ai/context_manager.py` extended to query ChromaDB for relevant context before AI queries
- [ ] Semantic search endpoint: `POST /api/v1/ai/search` — finds relevant data columns/tables by meaning

**Verification:**
- [ ] Unit test: embed column data → retrieve by semantic query
- [ ] API test: search "revenue" → finds revenue-related columns
- [ ] `pytest tests/test_ai.py -k vector`

**Dependencies:** Task 17, Task 10

**Files likely touched:**
- `backend/app/core/chromadb.py`
- `backend/app/ai/context_manager.py` (extend)
- `backend/app/services/connector_service.py` (extend — embed on ingest)
- `backend/tests/test_ai.py` (extend)

**Estimated scope:** Small (4 files)

---

#### Task 32: CORS, Rate Limiting & Security Middleware

**Description:** Finalize all security middleware: CORS configuration, global rate limiting, request logging, error handlers, and Content Security Policy.

**Acceptance criteria:**
- [ ] CORS configured: allow `localhost:3000` (dev) + production domain
- [ ] Global rate limiting: 100 requests/min per IP (configurable)
- [ ] Auth rate limiting: 5 attempts/15 min on login/register
- [ ] Request logging middleware (method, path, status, duration)
- [ ] Custom exception handlers for 400, 401, 403, 404, 422, 500
- [ ] Content Security Policy headers
- [ ] All sensitive data (passwords, tokens, connection strings) excluded from logs

**Verification:**
- [ ] API test: CORS preflight returns correct headers
- [ ] API test: exceed rate limit → 429 Too Many Requests
- [ ] API test: unknown route → clean 404 JSON response
- [ ] `pytest tests/test_middleware.py`

**Dependencies:** Task 5

**Files likely touched:**
- `backend/app/core/middleware.py` (finalize)
- `backend/app/core/exceptions.py`
- `backend/app/main.py` (register middleware)
- `backend/tests/test_middleware.py`

**Estimated scope:** Small (4 files)

---

#### Task 33: Dashboard Templates & Seed Data

**Description:** Create 5 starter dashboard templates that users can select during onboarding. Templates include pre-configured widgets with sample data.

**Acceptance criteria:**
- [ ] 5 templates defined as JSON seed data:
  1. E-commerce Sales Dashboard
  2. Marketing Analytics Dashboard
  3. SaaS Metrics Dashboard (MRR, Churn, CAC)
  4. Finance Overview Dashboard
  5. Blank Dashboard
- [ ] `POST /api/v1/dashboards/from-template/{template_id}` creates dashboard from template
- [ ] Template includes: widget types, positions, sample query_configs, theme
- [ ] Template preview data available (static sample data for display)

**Verification:**
- [ ] API test: create from template → dashboard with correct widgets
- [ ] All 5 templates load without errors
- [ ] `pytest tests/test_dashboards.py -k template`

**Dependencies:** Task 8, Task 9

**Files likely touched:**
- `backend/app/services/dashboard_service.py` (extend)
- `backend/app/api/v1/dashboards.py` (extend)
- `backend/app/data/templates/` (JSON template files)
- `backend/tests/test_dashboards.py` (extend)

**Estimated scope:** Small (4 files)

---

#### Task 34: API Key Management & Admin Endpoints

**Description:** Implement API key generation for programmatic access (Business/Enterprise plans) and admin endpoints for user management.

**Acceptance criteria:**
- [ ] Users (Business+) can generate API keys from settings
- [ ] API keys stored hashed in database, prefix displayed to user
- [ ] API key auth middleware: check `X-API-Key` header
- [ ] `POST /api/v1/settings/api-keys` — generate key (returns key once)
- [ ] `GET /api/v1/settings/api-keys` — list keys (prefix only)
- [ ] `DELETE /api/v1/settings/api-keys/{id}` — revoke key
- [ ] Admin endpoints (admin role only): list users, view usage, manage plans

**Verification:**
- [ ] API test: generate key → use key to authenticate → works
- [ ] API test: revoke key → 401 on next use
- [ ] API test: free user cannot generate API keys → 403
- [ ] `pytest tests/test_settings.py`

**Dependencies:** Task 5, Task 26

**Files likely touched:**
- `backend/app/models/api_key.py`
- `backend/app/api/v1/settings.py`
- `backend/app/core/security.py` (extend)
- `backend/app/dependencies.py` (extend — API key auth)
- `backend/tests/test_settings.py`

**Estimated scope:** Medium (5 files)

---

### ✅ Checkpoint: After Tasks 26–34 (End of Week 12)
- [ ] All tests pass: `pytest tests/ --cov`
- [ ] Coverage ≥ 70% on critical paths (auth, billing, AI, query)
- [ ] Stripe billing fully works (checkout → webhook → plan change)
- [ ] Scheduled syncs and reports work
- [ ] All 5 AI agents functional
- [ ] Comment system works with notifications
- [ ] Security middleware fully configured
- [ ] Dashboard templates loadable
- [ ] **End of Month 3 — MVP complete**

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **OpenAI API costs exceed budget** | High | Groq LLaMA 3 fallback configured; usage limits enforced per plan; token counting on every request |
| **ClickHouse setup complexity** | Medium | Defer to Phase 5; PostgreSQL handles all queries initially; ClickHouse only needed for >10k row datasets |
| **Google OAuth consent screen approval** | Medium | Start with "testing" mode (100 users); apply for verification early in Month 2 |
| **Playwright PDF export flaky** | Medium | Retry logic (up to 3 attempts); fallback to server-side chart rendering with matplotlib |
| **Redis downtime affects auth** | High | JWT access tokens work without Redis (stateless); only refresh tokens need Redis; fallback to DB-stored refresh tokens |
| **Stripe webhook event ordering** | Medium | Idempotent webhook handlers; store event IDs to prevent duplicate processing |
| **Large file uploads overwhelming server** | Medium | 50MB limit; stream processing with chunked uploads; Celery background processing for parsing |
| **WebSocket connections at scale** | Low (MVP) | Redis Pub/Sub for multi-instance; connection limit per user (5 concurrent) |

---

## Verification Plan

### Automated Tests
```bash
# Run all tests
pytest tests/ -v --cov=app --cov-report=html

# Run by module
pytest tests/test_auth.py -v
pytest tests/test_dashboards.py -v
pytest tests/test_datasources.py -v
pytest tests/test_query.py -v
pytest tests/test_ai.py -v
pytest tests/test_export.py -v
pytest tests/test_billing.py -v

# Coverage target
pytest tests/ --cov=app --cov-fail-under=70
```

### Manual Verification
- Deploy to Railway staging environment
- Test full auth flow (register → verify → login → refresh → logout)
- Upload CSV and verify chart data rendering
- Test AI chat with real dataset
- Test Stripe checkout flow with test mode cards
- Verify WebSocket real-time updates across two browser tabs
- Test PDF/PNG/CSV export downloads
- Verify rate limiting and plan enforcement
