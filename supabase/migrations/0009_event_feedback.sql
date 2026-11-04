-- Unified private store for post-event feedback, so the admin "Visszajelzések"
-- tab can show every response in one place regardless of where it came from:
-- the SBD Next 1 organiser's own post-event feedback form (imported once from
-- the "Feedback" tab of the "SBD Next nevezési lista" Google Sheet — the NPS +
-- per-area ratings + free-text questions), and going forward the newsletter
-- feedback question at app/hirlevel/koszonjuk (notify_signups.feedback_text,
-- still written there — this table does not replace it, the admin page reads
-- both and merges them for display).
--
-- `allow_quote` mirrors the sheet's "allowQuote" column: explicit consent
-- from the respondent to be quoted publicly (by name), same meaning as the
-- hand-picked quotes already in components/event/testimonials.tsx. A row
-- here being importable does not itself make it public — this table is
-- service-role only, same as prior_year_registrations.
create table if not exists public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  source text not null check (source in ('sbd_next_1_form', 'newsletter')),
  token text,
  submitted_at timestamptz,

  name text,
  email text,
  instagram text,
  participation_role text,

  nps int,
  music int,
  lights int,
  mood int,
  athlete_experience int,
  schedule_score int,
  flow int,
  venue int,
  staff int,
  warmup_area int,

  next_timing text,
  attend_next text,
  best text,
  improve text,
  comment text,
  allow_quote boolean,

  user_agent text,
  ip_hint text
);

create index if not exists event_feedback_submitted_at_idx
  on public.event_feedback (submitted_at desc);

-- Service-role only — never queried with the anon key, same as
-- prior_year_registrations (no public exposure of respondent names/emails).
alter table public.event_feedback enable row level security;
