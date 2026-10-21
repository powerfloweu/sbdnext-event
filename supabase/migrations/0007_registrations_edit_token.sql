-- Self-service edit link: each registration gets a random token (generated
-- by the app at insert time, not by the DB) so the confirmation/payment
-- e-mails can link to a page where the athlete updates their own entry
-- without an account. Nullable so existing rows aren't broken; new
-- registrations always set it.
alter table public.registrations
  add column if not exists edit_token text;

create unique index if not exists registrations_edit_token_idx
  on public.registrations (edit_token)
  where edit_token is not null;
