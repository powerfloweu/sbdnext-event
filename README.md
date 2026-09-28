# SBD Next

Event site for the SBD Next powerlifting meet, built with Next.js (App Router), Tailwind v4 and
a small shadcn-style component set.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture (SBD Next 2 redesign)

- `config/event.ts` — the single source of truth for every event-specific date, price, link and
  cap. Update this file (and only this file) between events.
- `lib/phase.ts` — derives the current phase (`announced` → `registration` → `closed` → `live` →
  `post`) from `config/event.ts` and the current date. Every phase-dependent piece of UI reads
  from this instead of calling `new Date()` directly.
- `lib/sheets.ts` / `lib/csv.ts` — server-side fetch and parsing of the Google Sheets "publish to
  web" CSV feeds (leaderboards, schedule), with a quoted-field-safe parser.
- `components/site/*` — header (with mobile nav drawer), footer, section/stat/sponsor-grid
  building blocks used across pages.
- `components/event/*` — the landing page's sections (hero, key facts, lists, schedule, fees,
  venue, FAQ, rules).
- `components/forms/registration-wizard/*` — the 5-step registration flow at `/nevezes`, built
  with `react-hook-form` + `zod`, with draft persistence to `localStorage`.
- `app/api/register`, `app/api/volunteer`, `app/api/weight` — server-side routes that validate
  input and forward to the organiser's Make webhook(s). Moving this server-side (rather than
  calling the webhook from the browser, as the previous version did) means the webhook URL is
  no longer shipped in the client bundle, and a failed webhook call now actually blocks the flow
  instead of silently succeeding (unless Supabase is configured — see below — in which case the
  Supabase row is the source of truth and a Make hiccup no longer blocks registration).
- `lib/supabase/server.ts` — Supabase is the system of record for registrations
  (`supabase/migrations/0001_registrations.sql`) and stores athlete face photos (private
  `athlete-face-photos` bucket) for the organiser's Excire Photo face-tagging workflow. Returns
  `null` until `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set, and every caller degrades
  gracefully when it does (see `app/api/register/route.ts`).
- `lib/stripe.ts` / `app/api/stripe/webhook` — registration payment is a Stripe Checkout Session
  with dynamic line items (entry tier + optional premium media) created server-side, replacing
  the old static Payment Links (pricing now has independent shirt/premium add-on dimensions that
  don't fit a fixed-price link). The webhook marks a registration "paid" once Stripe confirms the
  session and triggers the payment-confirmation e-mail. Without `STRIPE_SECRET_KEY` the wizard
  still completes end-to-end in "demo" mode (no real charge).
- `lib/email.ts` — registration-received and payment-confirmed e-mails via Resend. No-ops
  without `RESEND_API_KEY`.
- `app/api/notify` + `app/api/notify/dispatch` — a real "notify me when registration opens"
  signup (`components/notify-signup-form.tsx`, shown on the homepage while the phase is
  `announced`). Signups go into Supabase (`supabase/migrations/0002_notify_signups.sql`);
  `dispatch` is called on a schedule by Vercel Cron (`vercel.json`) and is a no-op until the
  phase actually becomes `registration`, at which point it emails everyone who signed up (once
  each — idempotent, safe to call as often as it likes) with a direct link to `/nevezes`.
  Currently runs once a day (08:00 UTC) — Vercel's Hobby plan only allows daily cron jobs, so
  there's up to a ~24h delay between registration actually opening and this dispatch catching
  it. Upgrading to a Pro plan lets `vercel.json`'s schedule go as tight as every minute if that
  delay matters enough to be worth it.

Before registration opens (the `announced` phase), the homepage is deliberately stripped down to
just Hero + a rotating real-photo carousel (`PhotoStrip`, all 6 SBD Next 1 photos, auto-advancing)
+ `FeesTeaser` (photo/video/shirt as concepts, no prices) + the notify-me signup. Everything that
implies an active registration process — `KeyFacts`, `InfoSection` (registration dates/capacity),
`ListsSection` ("who's registered so far"), `ScheduleSection` (heat sheet), `RulesSection`
(competition invitation PDF), `FaqSection`, and the footer's "Versenykiírás" link — is hidden via
the `showKeyFacts`/`showInfoSection`/`showLists`/`showSchedule`/`showRules`/`showFaq` flags in
`lib/home-content.ts` and `Footer`'s `showInvitation` prop, since none of it is real yet. The
header nav (`navLinks` in `app/page.tsx`) is built from the same flags so it never links to a
hidden section. This matches how the organiser's own newsletter and socials are teasing SBD Next 2
(recap + vibe, no concrete date or price yet).

This implements the front-end phases of the companion UI/UX and robustness plan (see the
`docs: UI/UX and robustness improvement plan for SBD Next 2` pull request for the full document).

**Known gap, needs follow-up:** the Supabase project itself hasn't been created yet —
`mcp__Supabase__create_project` timed out on every attempt during this session (organisation
`powerfloweu`, tried both `eu-central-1` and `eu-west-1`). All Supabase-dependent code
(`lib/supabase/server.ts`, the registration insert, face-photo upload, the Stripe webhook's
Supabase lookup) is written and ready — it just no-ops until a project exists. Once one does
(created via the Supabase dashboard or a retried `create_project` call), apply
`supabase/migrations/0001_registrations.sql` and set `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` to switch it on. Still out of scope: an admin panel (Supabase's own
Table Editor already gives live visibility into registrations in the meantime).

## Environment variables

Everything works with no environment variables configured — forms and webhooks degrade
gracefully (they validate and respond successfully, they just don't forward anywhere, and
registration falls back to Make/Sheets + Stripe "demo" mode). See `.env.example` for the full
list:

- `PHASE_OVERRIDE` — force a specific phase for previewing (`announced` | `registration` |
  `closed` | `live` | `post`).
- `VOLUNTEER_WEBHOOK_URL`, `VOLUNTEER_MAKE_WEBHOOK_URL` — volunteer form webhook(s).
- `WEIGHT_WEBHOOK_URL` — weight-update form webhook.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — registrations system of record + face-photo
  storage.
- `STRIPE_SECRET_KEY` — creates the registration Checkout Session.
- `STRIPE_WEBHOOK_SECRET` — verifies `app/api/stripe/webhook`; set once a webhook is registered
  in the Stripe dashboard pointing at `<deployed-url>/api/stripe/webhook` for
  `checkout.session.completed`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — transactional e-mail; needs a verified sending domain
  (e.g. `sbdnext.hu`) in the Resend dashboard first.
- `CRON_SECRET` — authenticates Vercel Cron's calls to `app/api/notify/dispatch`. Unset means
  the endpoint is unauthenticated; set it before going live.

The main registration webhook is intentionally kept as the same value the live site already
uses (see `app/api/register/route.ts`) — ask before changing it, since it's wired to the
organiser's real Make scenario. The old static Stripe Payment Links were replaced by Checkout
Sessions (see above) because the new shirt/premium pricing tiers don't fit a fixed-price link.

## Deploy

Deploys via Vercel from this repository as usual. See the Next.js deployment docs for details.
