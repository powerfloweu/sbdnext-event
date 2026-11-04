-- Adds locale/currency so the English registration flow (EUR, for foreign
-- athletes) can be told apart from the Hungarian one (HUF), and so the
-- payment-confirmation email (sent later, from the Stripe webhook) knows
-- which language and currency to show. See lib/email.ts and
-- app/api/register/route.ts.
alter table registrations
  add column locale text not null default 'hu' check (locale in ('hu', 'en')),
  add column currency text not null default 'HUF' check (currency in ('HUF', 'EUR'));
