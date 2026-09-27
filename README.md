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
  instead of silently succeeding.

This implements the front-end phases of the companion UI/UX and robustness plan (see the
`docs: UI/UX and robustness improvement plan for SBD Next 2` pull request for the full document).
Intentionally still out of scope here: a Supabase-backed system of record, Stripe Checkout
Sessions + webhook, transactional e-mail, and an admin panel — all of which need the organiser's
own credentials to set up.

## Environment variables

Everything works with no environment variables configured — forms and webhooks degrade
gracefully (they validate and respond successfully, they just don't forward anywhere). See
`.env.example` for the full list:

- `PHASE_OVERRIDE` — force a specific phase for previewing (`announced` | `registration` |
  `closed` | `live` | `post`).
- `VOLUNTEER_WEBHOOK_URL`, `VOLUNTEER_MAKE_WEBHOOK_URL` — volunteer form webhook(s).
- `WEIGHT_WEBHOOK_URL` — weight-update form webhook.

The main registration webhook and the Stripe payment links are intentionally kept as the same
values the live site already uses (see `app/api/register/route.ts` and `config/event.ts`) — ask
before changing either, since they're wired to the organiser's real Make scenario and Stripe
account.

## Deploy

Deploys via Vercel from this repository as usual. See the Next.js deployment docs for details.
