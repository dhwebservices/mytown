# MyTown Supabase Target Architecture

This document defines the production target for migrating MyTown away from the generated Mongo/FastAPI stack.

## Target stack

- Frontend: React app in `frontend/`
- Hosting: Cloudflare Pages
- Auth: Supabase Auth
- Database: Supabase Postgres
- File storage: Supabase Storage
- Server-side privileged actions:
  - either Cloudflare Worker routes
  - or server-only Supabase service-role endpoints

## Core principle

Do not preserve the generated Mongo backend as the long-term system of record.

Use the current backend/routes as reference for behavior, but move the real auth and persistence model to Supabase.

## Auth model

All users share one login portal.

Authentication should use:

- Supabase email/password auth
- optional username lookup layer in app logic

Recommended sign-in behavior:

1. user enters email or username + password
2. if username is provided, app resolves it to email from `public.profiles`
3. app signs in through Supabase Auth using email/password
4. app reads `public.profiles.role`
5. app redirects to customer, business, or manager area

## Role model

Roles live in `public.profiles.role`:

- `manager`
- `business`
- `customer`

Account suspension is controlled in `public.profiles.status`.

## Data model

SQL source of truth:

- `supabase/schema.sql`

Main tables:

- `profiles`
- `categories`
- `businesses`
- `business_services`
- `business_availability`
- `bookings`
- `booking_status_history`
- `reviews`
- `invoices`
- `invoice_items`
- `featured_placements`
- `audit_logs`
- `contact_messages`
- `email_log`
- `password_reset_audit`

## Important rules enforced in schema

### Reviews

Reviews are not just a frontend rule.

The schema includes:

- `reviews.booking_id unique`
- `enforce_review_eligibility()` trigger
- `can_review_booking()` function

This ensures:

- one review per booking
- only the booking owner can review
- booking must be completed

### Ratings

Business average rating and rating count are maintained through:

- `refresh_business_rating()`
- review insert/update/delete triggers

### Updated timestamps

Most mutable tables use a common `set_updated_at()` trigger.

## Migration strategy

### Phase 1

- keep the current frontend
- replace auth context and API client assumptions
- add Supabase client and environment setup

### Phase 2

- replace auth/register/login/reset flows with Supabase
- create `profiles` rows on signup
- remove dependency on custom JWTs from the generated backend

### Phase 3

- migrate business/category/service/availability flows
- replace Mongo collection CRUD with Supabase queries or server-side actions

### Phase 4

- migrate bookings + booking history
- migrate reviews with DB-level enforcement
- migrate invoices/admin tools

### Phase 5

- remove obsolete backend files once all critical flows are moved

## Cloudflare deployment direction

### Frontend

- deploy `frontend/` to Cloudflare Pages

### Backend actions

Prefer a small Cloudflare server-side layer only where needed:

- admin-only privileged actions
- invoice issuing
- contact message processing
- audit logging fan-out
- email sending hooks

Avoid rebuilding a large custom server if Supabase plus lightweight Workers covers the flows.

## Recommended next implementation step

Implement these in order:

1. add Supabase client/config to frontend
2. build `profiles` sync on auth signup/login
3. replace `auth.py` behavior with Supabase auth flows
4. begin migrating categories/businesses/bookings/reviews off Mongo

## Bootstrap note

Categories are platform configuration, not demo content.

Use:

- `supabase/schema.sql`
- `supabase/bootstrap_categories.sql`

to initialize the project without seeding fake businesses, fake bookings, or fake reviews.
