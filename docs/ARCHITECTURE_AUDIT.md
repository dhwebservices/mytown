# MyTown Architecture Audit

This is the first cleanup audit of the generated MyTown codebase before the Supabase/Cloudflare migration.

## Current state

The generated project is split into:

- `frontend/`: React + CRACO + Tailwind
- `backend/`: FastAPI + Motor/MongoDB

The route structure and role split are usable as a scaffold, but the data layer and deployment assumptions do not match the target production setup.

## Immediate cleanup already done

- Removed Emergent visual editing wrapper from `frontend/craco.config.js`
- Removed Emergent package dependency from `frontend/package.json`
- Removed Emergent badge, script injection, and metadata from `frontend/public/index.html`
- Removed startup seed execution from `backend/server.py`
- Removed `emergentintegrations` from `backend/requirements.txt`

## Current blockers to target architecture

### 1. Backend is Mongo-based, not Supabase-based

The backend currently depends on:

- `motor`
- `pymongo`
- collection-style access via `db.users`, `db.businesses`, `db.bookings`, etc.

This means the backend is not ready for the required stack:

- Supabase auth
- Supabase Postgres
- Supabase storage
- Cloudflare-friendly deployment model

### 2. Auth is custom JWT + password hash, not Supabase auth

Current auth flow in `backend/routes/auth.py`:

- stores users in Mongo
- hashes passwords in the backend
- issues custom JWT tokens
- stores password resets in Mongo

Target direction should be:

- Supabase Auth for signup/login/password reset/session handling
- role/profile data in Postgres tables
- route-level authorization mapped to profile roles

### 3. Startup seeding existed

The generated backend seeded:

- categories
- a default manager account

This has been disabled in startup, but the seed module still exists and should not be part of the live bootstrap path.

### 4. Cloudflare target is not yet defined in code

The repo currently looks like a traditional split frontend/backend project, not a Cloudflare-first deployment model.

We still need to choose and implement one of these:

- `Cloudflare Pages` frontend + `Supabase` backend only
- `Cloudflare Pages` frontend + `Cloudflare Workers` for server-side actions + `Supabase`

## Backend collections currently in use

The generated backend is centered around these data domains:

- users
- password_resets
- audit_logs
- categories
- businesses
- services
- availability
- bookings
- booking_status_history
- reviews
- invoices
- email_log
- contact_messages

These map cleanly enough to a relational rewrite, but the implementation needs to be replaced rather than lightly patched.

## Recommended target architecture

### Frontend

- Keep React frontend as the base
- Clean the generated UI and remove leftover generated scaffolding
- Replace any backend-specific assumptions with environment-based API access

### Data/Auth

- New Supabase project
- Supabase Auth for:
  - shared login
  - signup
  - forgot password
  - reset password
- Postgres tables for:
  - profiles
  - businesses
  - business_services
  - business_availability
  - bookings
  - booking_status_history
  - reviews
  - invoices
  - invoice_items
  - categories
  - audit_logs

### Cloudflare

- Cloudflare Pages for frontend
- Optional Workers/API routes only where server-side privileged actions are required

## Rewrite priority

1. Remove leftover generated scaffolding and branding
2. Define final Supabase schema
3. Replace auth flow with Supabase auth
4. Replace Mongo route handlers with Supabase-backed endpoints or direct secure access patterns
5. Rework admin/business/customer permissions and protected routes
6. Finalize Cloudflare deployment setup

## Recommendation

Do not keep extending the Mongo backend.

Use the current generated app as:

- layout scaffold
- page scaffold
- route scaffold
- UX starting point

But migrate persistence and auth to Supabase before deeper feature work.
