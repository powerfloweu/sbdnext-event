-- Extends notify_signups for the one-click newsletter subscribe link
-- (app/api/notify/subscribe) and its optional feedback question, asked only
-- of people who competed at SBD Next 1 ("Mondd el, hogy lehet a mostani
-- verseny még jobb, mint az előző?") — see app/hirlevel/koszonjuk.

alter table public.notify_signups
  add column if not exists source text not null default 'site' check (source in ('site', 'newsletter')),
  add column if not exists feedback_text text;
