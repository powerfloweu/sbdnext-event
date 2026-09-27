-- SBD Next 2 — registrations as the system of record (replaces Make/Sheets
-- as the source of truth; Make forwarding is kept alongside during the
-- transition — see app/api/register/route.ts).
--
-- Apply with: mcp__Supabase__apply_migration, or `supabase db push` /
-- paste into the SQL editor once the project exists.

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'waitlist', 'paid', 'cancelled')),

  last_name text not null,
  first_name text not null,
  email text not null,
  birth_year int not null,
  sex text not null,
  division text not null,
  club text,

  bodyweight numeric,
  opener_squat numeric,
  opener_bench numeric,
  opener_deadlift numeric,
  mc_text text,
  notes text,

  wants_shirt boolean not null default false,
  shirt_cut text,
  shirt_size text,
  premium_media boolean not null default false,

  entry_fee integer not null,
  total_fee integer not null,

  face_photo_path text,
  utm text,

  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  confirmation_email_sent_at timestamptz,
  payment_email_sent_at timestamptz,

  raw jsonb
);

create index if not exists registrations_status_idx on public.registrations (status);
create index if not exists registrations_email_idx on public.registrations (email);
create index if not exists registrations_stripe_session_idx
  on public.registrations (stripe_checkout_session_id);

-- Service-role only: the app never uses the anon key against this table, so
-- no public policies are defined and RLS blocks everything else by default.
alter table public.registrations enable row level security;

-- Private bucket for the athlete face photos (Excire Photo tagging source).
-- Never public — only the service role (server-side) reads/writes it.
insert into storage.buckets (id, name, public)
values ('athlete-face-photos', 'athlete-face-photos', false)
on conflict (id) do nothing;
