-- Registrations submitted from a Vercel Preview deployment (e.g. the
-- registration/payment test branch) hit this same Supabase project — there's
-- no separate preview database — so without a flag they'd mix into the real
-- roster and inflate the capacity count used to decide who gets waitlisted.
alter table public.registrations
  add column if not exists is_preview_test boolean not null default false;
