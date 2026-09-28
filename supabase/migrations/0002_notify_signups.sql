-- "Notify me when registration opens" signups, collected during the
-- announced phase (see app/api/notify). A Vercel Cron job
-- (app/api/notify/dispatch) emails everyone here once, the moment the
-- event's phase flips to "registration".

create table if not exists public.notify_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  notified_at timestamptz
);

create index if not exists notify_signups_notified_at_idx on public.notify_signups (notified_at);

alter table public.notify_signups enable row level security;
