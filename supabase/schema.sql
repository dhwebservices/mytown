create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create type public.app_role as enum ('manager', 'business', 'customer');
create type public.account_status as enum ('active', 'suspended');
create type public.business_status as enum ('draft', 'pending', 'published', 'paused', 'rejected');
create type public.booking_status as enum ('pending', 'confirmed', 'rejected', 'reschedule_requested', 'cancelled', 'completed', 'no_show');
create type public.invoice_status as enum ('draft', 'issued', 'paid', 'overdue', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  role public.app_role not null,
  full_name text,
  phone text,
  status public.account_status not null default 'active',
  email_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.password_reset_audit (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  reset_method text not null check (reset_method in ('supabase_email', 'manager_manual', 'manager_temp_password')),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  phone text,
  email text,
  address_line_1 text,
  address_line_2 text,
  town text,
  postcode text,
  coverage_area text not null default 'Pontypridd',
  logo_url text,
  gallery jsonb not null default '[]'::jsonb,
  opening_hours jsonb not null default '[]'::jsonb,
  emergency_callout boolean not null default false,
  price_from numeric(10,2),
  status public.business_status not null default 'draft',
  verified boolean not null default false,
  featured boolean not null default false,
  rating_avg numeric(4,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 60,
  price_guidance text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.business_availability (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes integer not null default 60,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint business_availability_valid_time check (end_time > start_time)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid references public.business_services(id) on delete set null,
  service_name text,
  start_at timestamptz not null,
  duration_minutes integer not null default 60,
  status public.booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by_profile_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_profile_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  hidden boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  number text not null unique,
  amount numeric(10,2) not null,
  currency text not null default 'GBP',
  description text,
  status public.invoice_status not null default 'issued',
  due_date date,
  issued_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity integer not null default 1,
  unit_amount numeric(10,2) not null,
  total numeric(10,2) not null
);

create table public.featured_placements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  placement_type text not null check (placement_type in ('homepage_featured', 'category_featured', 'top_of_list')),
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  recipient_name text,
  subject text not null,
  provider text,
  provider_message_id text,
  status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.can_review_booking(p_booking_id uuid, p_profile_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.bookings b
    where b.id = p_booking_id
      and b.customer_profile_id = p_profile_id
      and b.status = 'completed'
  );
$$;

create or replace function public.refresh_business_rating(p_business_id uuid)
returns void
language plpgsql
as $$
begin
  update public.businesses b
  set
    rating_avg = coalesce(r.avg_rating, 0),
    rating_count = coalesce(r.review_count, 0),
    updated_at = timezone('utc', now())
  from (
    select
      business_id,
      round(avg(rating)::numeric, 2) as avg_rating,
      count(*)::integer as review_count
    from public.reviews
    where business_id = p_business_id
      and hidden = false
    group by business_id
  ) r
  where b.id = p_business_id;

  update public.businesses
  set
    rating_avg = 0,
    rating_count = 0,
    updated_at = timezone('utc', now())
  where id = p_business_id
    and not exists (
      select 1 from public.reviews
      where business_id = p_business_id
        and hidden = false
    );
end;
$$;

create or replace function public.handle_review_rating_refresh()
returns trigger
language plpgsql
as $$
declare
  affected_business uuid;
begin
  affected_business := coalesce(new.business_id, old.business_id);
  perform public.refresh_business_rating(affected_business);
  return coalesce(new, old);
end;
$$;

create or replace function public.enforce_review_eligibility()
returns trigger
language plpgsql
as $$
begin
  if not public.can_review_booking(new.booking_id, new.customer_profile_id) then
    raise exception 'Reviews are only allowed for completed bookings owned by this customer.';
  end if;
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger business_services_set_updated_at
before update on public.business_services
for each row execute function public.set_updated_at();

create trigger business_availability_set_updated_at
before update on public.business_availability
for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create trigger featured_placements_set_updated_at
before update on public.featured_placements
for each row execute function public.set_updated_at();

create trigger reviews_enforce_eligibility
before insert on public.reviews
for each row execute function public.enforce_review_eligibility();

create trigger reviews_refresh_rating_after_insert
after insert on public.reviews
for each row execute function public.handle_review_rating_refresh();

create trigger reviews_refresh_rating_after_update
after update on public.reviews
for each row execute function public.handle_review_rating_refresh();

create trigger reviews_refresh_rating_after_delete
after delete on public.reviews
for each row execute function public.handle_review_rating_refresh();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.business_services enable row level security;
alter table public.business_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.featured_placements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.contact_messages enable row level security;
alter table public.email_log enable row level security;
alter table public.password_reset_audit enable row level security;

-- Baseline public policies. Tight business/admin write access should be added in the
-- app migration phase using auth.uid() role-aware policies and service-role server flows.
create policy "public_can_view_active_categories"
on public.categories for select
using (active = true);

create policy "public_can_view_published_businesses"
on public.businesses for select
using (status = 'published');

create policy "public_can_view_active_services"
on public.business_services for select
using (
  active = true
  and exists (
    select 1 from public.businesses b
    where b.id = business_services.business_id
      and b.status = 'published'
  )
);

create policy "public_can_view_published_business_reviews"
on public.reviews for select
using (
  hidden = false
  and exists (
    select 1 from public.businesses b
    where b.id = reviews.business_id
      and b.status = 'published'
  )
);
