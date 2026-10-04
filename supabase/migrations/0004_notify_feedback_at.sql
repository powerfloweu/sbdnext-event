-- Timestamp for when a notify_signups row received its optional feedback
-- answer, so the admin view can sort/show recency for the reordered
-- question-before-confirmation flow on /hirlevel/koszonjuk.

alter table public.notify_signups
  add column if not exists feedback_at timestamptz;
