-- Prior-year (SBD Next 1) registrations, imported once from the organiser's
-- private "Nevezések" Google Sheet, kept only so the SBD Next 2 wizard can
-- prefill a returning athlete's form from their own data by exact email
-- match (see app/api/prior-registration). Deliberately a narrow subset of
-- that sheet's columns — no Stripe links, payment status, or CAP tracking
-- carried over, since none of that is needed for a prefill.
create table if not exists public.prior_year_registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  email text not null,
  last_name text not null,
  first_name text not null,
  birth_year int,
  club text,
  sex text,
  division text,
  bodyweight numeric,
  opener_squat numeric,
  opener_bench numeric,
  opener_deadlift numeric,
  shirt_cut text,
  shirt_size text,
  premium_media boolean not null default false
);

create unique index if not exists prior_year_registrations_email_idx
  on public.prior_year_registrations (lower(email));

-- Service-role only, same as `registrations` — the app never queries this
-- with the anon key, and the lookup endpoint only ever returns the single
-- row matching the email the visitor typed, never a list.
alter table public.prior_year_registrations enable row level security;
