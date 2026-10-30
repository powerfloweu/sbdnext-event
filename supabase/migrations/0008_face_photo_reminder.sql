-- The face photo became optional at registration time (D, 2026-10-30) — a
-- cron-triggered reminder nudges anyone still missing one 2 weeks before
-- the event (see app/api/registration/face-photo-reminder/route.ts). This
-- tracks who's already been reminded so it's a one-time e-mail, not a daily
-- nag from every cron run.
alter table public.registrations
  add column if not exists face_photo_reminder_sent_at timestamptz;
