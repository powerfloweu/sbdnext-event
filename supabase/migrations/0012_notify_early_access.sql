-- Tracks the separate "your early access opens soon" heads-up e-mail
-- (app/api/notify/dispatch-early-access), independent of notified_at which
-- is reserved for the general "registration is open" e-mail
-- (app/api/notify/dispatch). A subscriber gets both, at different times.

alter table public.notify_signups
  add column if not exists early_notified_at timestamptz;
