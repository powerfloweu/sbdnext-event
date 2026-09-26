# SBD Next 2 – UI/UX & Robustness Improvement Plan

> **Audience:** the developer or AI model that will implement this (e.g. Claude Sonnet).
> **Status:** plan only. No code has been changed yet.
> **How to use:** work phase by phase, one PR per phase. Each task lists the files to touch and an
> acceptance check. Read the *Guardrails* section before starting.

---

## 0. Executive summary

The site works and shipped a real event, which is the hard part. But it was built fast, in a
single 2,094-line client component, with configuration copy-pasted into several places, a broken
design-token layer, unoptimised 9 MB hero images, a public Make webhook called straight from the
browser, and no tests or CI. For SBD Next 2 the goal is a site that looks like SBD's own brand
level, converts better on mobile (where most athletes will register), and cannot silently lose a
registration.

**The five highest-value changes, in order:**

1. **Single event config + phase machine.** One file (`config/event.ts`) drives every date, price,
   cap, link and text. The UI renders by *phase* (`announced → registration → closed → live →
   post`) instead of by scattered `new Date()` checks. This is what makes the site reusable for
   event 2, 3, 4.
2. **Fix the design system.** The shadcn/Tailwind v4 colour tokens are literally broken (see
   finding C1), which is why the code is full of hand-written `bg-black/70 border-red-500` strings.
   Fix tokens, define 6–8 real components, delete the copy-pasted class soup.
3. **Rebuild the registration flow as a proper wizard** with per-step validation (zod +
   react-hook-form), per-field errors, draft persistence, a review step, a server-side submit that
   *confirms* the data was stored before redirecting to Stripe, and a real success page.
4. **Supabase as the system of record, no Make.** Registrations, payments, volunteers and weights
   live in Postgres. A Next.js route validates and inserts; a Stripe webhook marks the row paid;
   a confirmation e-mail goes out from `powerlifting@sbdnext.hu`. Lists, capacity and schedule are
   read from the database. No secrets or endpoints in the client bundle.
5. **Landing page information architecture.** Hero → one primary CTA → key facts → registration →
   lists → schedule → rules → fees → venue → FAQ → sponsors → footer with legal pages. Mobile nav,
   sticky mobile CTA, optimised images.

Everything else (a11y, SEO, perf, tooling, i18n) is listed below and is worth doing, but those five
are the backbone.

**What it will look like:** a clickable mockup of the proposed design (mobile home, desktop home,
registration wizard step 3 and the summary step) is published at
<https://claude.ai/artifact/RCtGqTscPxMbsK5vpCy4XP>. Section 4.5 describes it in words so the
implementing model can reproduce it without opening the link.

---

## 1. Verified audit findings

Everything below was checked against the code on branch `main` at commit `3a999a8`
(`npm run build` passes, `tsc --noEmit` passes, `eslint` reports 2 errors + 19 warnings).

### C. Critical (data loss, money, or "the site is wrong")

| # | Finding | Where |
|---|---------|-------|
| C1 | **Design tokens are broken.** `globals.css` defines colours as bare HSL triplets (`--background: 0 0% 3%`) in the Tailwind v3 style, but the Tailwind v4 `@theme inline` block maps them directly (`--color-background: var(--background)`). The built CSS therefore contains `background-color: 0 0% 3%`, which is invalid and ignored. Every `bg-background`, `bg-card`, `text-primary`, `text-muted-foreground`, `border-input`, `ring-ring` utility silently does nothing. Visible symptoms: prices in the fee table are white instead of red (`text-primary`), the Contact card at `app/page.tsx:1991` renders with no dark background. This is why the codebase hand-codes colours everywhere. | `app/globals.css` (lines 8–34 vs 37–68) |
| C2 | **Registration can silently fail and still redirect to Stripe.** The form POSTs directly from the browser to the Make webhook and swallows the error (`.catch(() => {})`), then redirects to the payment link. If Make is down, rate-limited, or the user is offline for a second, the athlete pays but no registration row exists. | `app/page.tsx:308, 430–446` |
| C3 | **Make webhook URL is hard-coded and public in the client bundle** (and duplicated in the API route, which the form does not even use). Anyone can spam the sheet. There is no rate limit, origin check, or schema validation on the server. | `app/page.tsx:308`, `app/api/registration-webhook/route.ts:3` |
| C4 | **Payment cannot be reconciled with a registration.** Only `prefilled_email` is passed to the Stripe Payment Link; the generated `registrationId` never reaches Stripe. Matching paid sessions to sheet rows is by email only. Stripe Payment Links accept a `client_reference_id` query param, which should carry the registration id. | `app/page.tsx:445` |
| C5 | **Two conflicting sources of truth for event data.** `lib/utils.ts` exports an `EVENT` object (2 days, 14–15 Feb, cap 120, entry fee note, `info@sbdhungary.hu`, hero images `hero_bg2/3.jpg` that don't exist) while `app/page.tsx:52–108` defines a different `EVENT` (1 day, cap 220, `powerlifting@sbdnext.hu`). `layout.tsx` metadata and `/en` also hard-code "14–15 February". The public title/OG description is wrong. | `lib/utils.ts`, `app/page.tsx`, `app/layout.tsx:16–20`, `app/en/page.tsx:73` |
| C6 | **Volunteer form counts HTTP 4xx/5xx as success.** `Promise.allSettled` + `some(r => r.status === "fulfilled")` is true for any completed request, including a 500. | `components/volunteer-form.tsx:121` |
| C7 | **No privacy policy / rules page exists**, but the consent checkbox says the user accepts "adatkezelés" and "versenyszabályzat". For paid registration under GDPR a linked, readable privacy notice is required. | `app/page.tsx` consent block |

### R. Robustness

| # | Finding | Where |
|---|---------|-------|
| R1 | Whole landing page is one `"use client"` component of 2,094 lines. Nothing is a server component; the entire page (including all copy) ships as JS. | `app/page.tsx` |
| R2 | The root `EventLanding` component owns a 1-second `setInterval` state (`deadlineLeft`), so the **entire page tree re-renders every second**. Two more independent 1 s intervals exist (`RegistrationForm`, `CountdownTimer`). | `app/page.tsx:1264–1283` |
| R3 | `new Date()` evaluated during render (`afterDeadline`, `year`) and `CountdownTimer`'s initial state is computed at build time → hydration mismatches and stale "A verseny elkezdődött!" at the top of the page for months after the event. | `app/page.tsx:336`, `components/ui/countdown-timer.tsx:23` |
| R4 | Leaderboard CSVs are fetched **sequentially** in a `for … await` loop, from the client, on every visit, with no loading/error/empty differentiation and no refresh. The Google "publish to web" endpoint is hit once per tab per visitor. | `app/page.tsx:1148–1170` |
| R5 | CSV parsing is `line.split(",")`. Any quoted field containing a comma (club names like "Fitness Club, Budapest") or a newline breaks the row. Schedule parser also strips quotes by regex. | `app/page.tsx:1020`, `components/ui/schedule.tsx:27`, `components/ui/leaderboard.tsx:35` |
| R6 | Leaderboard logic exists twice: the unused `components/ui/leaderboard.tsx` and the inline `LeaderboardSection`. Schedule/leaderboard share a normaliser that is copy-pasted. | both files |
| R7 | Capacity (`CAP_USED`, `CAP_FULL`) comes from `NEXT_PUBLIC_*` env vars baked in at build time. Reflecting a full meet requires a redeploy. | `app/page.tsx:52–58` |
| R8 | Birth-year bounds are hard-coded to the 2026 event (`1925–2011`). | `app/page.tsx:240` |
| R9 | Registration step 1 has **no validation** before moving to step 2; all errors surface on step 2 as one string, often about fields on the previous step. | `app/page.tsx:369–375` |
| R10 | No draft persistence: a refresh or accidental back-navigation wipes 15 fields. | form state |
| R11 | Success state after Stripe redirect is unreachable (`window.location.href` leaves the page). No `/koszonjuk` route, no cancel route. | `app/page.tsx:446` |
| R12 | `app/page.minimal.tsx` is a dead file inside `app/` (harmless with Next's file conventions, but confusing). Template leftovers: `next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`, `sbd_next_logo_v1/v2.png` are unreferenced. README is create-next-app boilerplate. | repo root / `public/` |
| R13 | `npm audit`: 4 vulnerabilities (3 high, 1 critical) via `sharp` pulled in by `next@16.0.7`; fixed in `next@16.3.x`. Build is forced to `--webpack` in `package.json` scripts. | `package.json` |
| R14 | No tests, no CI, no Prettier, no `.env.example`, no `.nvmrc`. ESLint currently has 2 errors (`prefer-const` at `page.tsx:1031`, `no-html-link-for-pages` at `premium-media/page.tsx:89`). | repo |

### U. UI / UX

| # | Finding |
|---|---------|
| U1 | **Information architecture on the home page is a stack, not a story.** Current order: premium-media upsell banner → hero → countdown → *schedule* → versenykiírás pill → list buttons → two pills → "Röviden" card → prize box with shoe image → three 128 px sponsor logos → leaderboard → info → **schedule again** → rules → fees → venue → **registration** (6+ screens down) → volunteers → FAQ → contact. The primary conversion action is at the bottom. |
| U2 | **No mobile navigation.** Below `sm` the section links and the EN switch are simply hidden; only the logo and "Nevezés" remain. |
| U3 | The premium-media upsell is the first element on the page, above the hero, in every phase. It belongs after the event (or inside the fees section) and should be phase-gated. |
| U4 | Hero: five full-resolution photos (9.3 MB, 7.3 MB, 3.1 MB…) are stacked as `background-image` layers and cross-faded every 8 s, behind an 85 % black overlay, so the photo is barely visible anyway. On mobile this downloads ~20 MB. |
| U5 | Visual noise: red glow `drop-shadow`/`box-shadow` on logos, buttons, cards, pills; five different border radii (`xl`, `2xl`, `3xl`, `full`, `md`); 4 different "primary button" class strings copy-pasted (`page.tsx`, `volunteer-form.tsx`, `weight/page.tsx`, `premium-media/page.tsx`); emoji as tab icons (✨🏆⏳🍔👕). |
| U6 | Required inputs always show a red border (`border-red-500`) even before the user touches them, which reads as "everything is wrong". Labels are red too. There is no distinction between required, focused, valid and invalid. |
| U7 | Registration form: single error string at top of form; no per-field message; `<label>`s are not linked to inputs (`htmlFor`/`id`), so tapping a label does nothing and screen readers announce unlabeled fields. |
| U8 | "Verseny kezdetéig" countdown shows "A verseny elkezdődött!" in a monospace font as the page's most prominent element, months after the event. |
| U9 | Volunteers page has two "Vissza a főoldalra" controls; the day checkbox is required yet there is only one day (a required single checkbox is a confirmation, not a choice). Copy still says "melyik napokon". |
| U10 | `/en` is a "how to fill in the Hungarian form" guide rather than an English landing page; it is hand-duplicated and already out of date. |
| U11 | Fee table: notes are long sentences right-aligned under a price; secondary CTA box in the middle of the table. Prize text appears three times on the page. |
| U12 | Footer lacks legal links (privacy, rules PDF, ÁSZF/impressum), organiser info, and a language switch. |
| U13 | Contact section: Instagram links styled as a stacked underlined list under an "ExternalLink" icon; no Facebook/Email icons; contact card unstyled (token bug). |
| U14 | Buttons nested inside anchors (`<a href="#register"><button>`) and `<Link><Button>` produce invalid HTML and double focus stops. |

### A. Accessibility

- Labels not associated with controls (all forms).
- Error messages not announced (`role="alert"` / `aria-live` missing); errors appear away from the field.
- Tab list is `<button>`s with no `role="tablist"`/`aria-selected`; hidden tab panels not managed.
- Body text at `text-[11px]` / `text-xs` `text-neutral-400` on black fails WCAG AA contrast (≈3.9:1 at ~11 px).
- Emoji icons without `aria-hidden`; icons with meaning lack labels.
- Focus rings rely on `ring-ring` token, which is broken (C1), so keyboard focus is invisible in several places.
- No `prefers-reduced-motion` handling for the hero cross-fade and framer-motion.
- Map iframe title "Térkép" only; no text alternative link (there is one in the card, fine) but the iframe loads eagerly on mobile.

### S. SEO / metadata

- `metadataBase` is `https://sbdnext-event.vercel.app` while the real domain is `sbdnext.hu` (used in `public/signature.html`). Canonical/OG URLs point to the Vercel domain.
- Title/description say "február 14–15" (2 days); the event was 1 day.
- OG image is the 3.1 MB `hero_bg.jpg`, not a 1200×630 card.
- No `robots.txt`, `sitemap.xml`, `manifest`, `apple-touch-icon`, no JSON-LD (`SportsEvent`, `FAQPage`, `Organization`).
- All headings are `h2` inside a single `h1` "A következő szint"; the event name is only in an image `alt`.

### P. Performance

- `<img>` everywhere (10 lint warnings); no `next/image`, no responsive sizes, PNG logos of 300–440 KB.
- `framer-motion` (~35 KB gz) imported for one fade-in.
- Radix Select forced-white overrides with `!important` and CSS that rewrites any `text-orange/amber/yellow` class to red (`globals.css` bottom), i.e. global "band-aid" CSS.
- Whole page client-rendered; three 1 s timers; Google Maps iframe eager.

---

## 2. Target architecture

```
app/
  layout.tsx                 # fonts, metadata from config, <SiteHeader/>, <SiteFooter/>, analytics
  page.tsx                   # SERVER component: composes sections, passes data
  (marketing)/
    en/page.tsx              # English landing, same sections, EN dictionary
  nevezes/
    page.tsx                 # registration wizard (client island inside server shell)
    koszonjuk/page.tsx       # Stripe success_url target (?rid=… shows summary)
    megszakitva/page.tsx     # Stripe cancel_url target, offers to resume draft
  onkentes/page.tsx          # volunteers (rename from /volunteers; keep redirect)
  testsuly/page.tsx          # weight (keep /weight redirect)
  premium-media/page.tsx
  adatkezeles/page.tsx       # privacy notice (content provided by organiser)
  eredmenyek/page.tsx        # results (post phase), CSV-driven
  admin/                     # organiser UI, Google sign-in (sbdnext.hu) – see §2.2
  api/
    register/route.ts        # POST: zod-validate → insert into Supabase → Stripe Checkout Session → {registrationId, checkoutUrl}
    volunteer/route.ts       # POST: insert → confirmation e-mail
    weight/route.ts          # POST: insert weight_updates by registration id
    interest/route.ts        # POST: "értesíts" e-mail capture in the announced phase
    stripe/webhook/route.ts  # POST: Stripe events → status updates + e-mails
    ics/route.ts             # GET: calendar file for the event days
  robots.ts, sitemap.ts, manifest.ts, opengraph-image.tsx
config/
  event.ts                   # THE single source of truth (see §3)
  content/hu.ts, en.ts       # all copy (FAQ, rules bullets, venue text, prizes…)
lib/
  phase.ts                   # getPhase(now, event) → "announced" | "registration" | "closed" | "live" | "post"
  supabase/server.ts         # service-role client (server only) + typed query helpers
  db.types.ts                # generated by `supabase gen types`
  csv.ts                     # papaparse wrapper for admin CSV uploads (schedule, results)
  validation/registration.ts # zod schema shared client+server
  validation/volunteer.ts, weight.ts
  format.ts                  # HUF, dates (hu-HU / en-GB), kg
  stripe.ts                  # createCheckoutSession(registration), verifyWebhook(req)
  email.ts                   # Resend client + send helpers; templates in emails/*.tsx
components/
  ui/                        # shadcn primitives: button, card, input, label, select, checkbox,
                             # textarea, tabs, accordion, badge, alert, skeleton, sheet, separator, tooltip, sonner
  site/                      # header, mobile-nav, footer, section, stat, sponsor-grid, language-switch
  event/                     # hero, phase-banner, countdown (isolated), key-facts, schedule, lists,
                             # fees-table, venue, faq, prizes, media-team, live-stream, results-table
  forms/                     # registration-wizard/, volunteer-form, weight-form, field.tsx, form-error.tsx
supabase/
  migrations/0001_init.sql   # schema from §2.1
emails/                      # react-email templates (hu, en footer)
tests/
  unit/  (vitest)            # phase.ts, csv.ts, validation schemas, checkout session builder
  e2e/   (playwright)        # registration happy path with mocked /api/register, mobile nav, phase rendering
```

**Rendering model:** `app/page.tsx` is a server component. It reads `config/event.ts`, computes the
phase, fetches lists/schedule/capacity from Supabase with `next: { revalidate: 60 }`, and renders
sections. Only interactive pieces are client islands: countdown, tabs, wizard, mobile nav,
map-on-click. This alone removes most hydration issues and the 2,000-line client bundle.

### 2.1 Backend: Supabase replaces Make and Google Sheets

The organiser has a Supabase project and a Google Workspace account (`@sbdnext.hu`). With those,
Make is not needed at all. Google Sheets stays only as an optional export for the organisers.

```
Wizard (client) ──POST /api/register (JSON)──▶ route.ts (server)
                                               ├─ zod.parse → 400 {fieldErrors}
                                               ├─ honeypot + Turnstile verify + per-IP rate limit
                                               ├─ supabase.from("registrations").insert({... status:"pending_payment"})
                                               │    └─ insert fails → 502 (client shows retry, NO redirect)
                                               ├─ capacity check (count paid+pending) → status "waitlist" if full
                                               ├─ stripe.checkout.sessions.create({
                                               │      client_reference_id: registration.id,
                                               │      customer_email, line_items (entry [+ premium media]),
                                               │      success_url: /nevezes/koszonjuk?rid=…, cancel_url: /nevezes/megszakitva?rid=…,
                                               │      expires_at: now+30min })
                                               └─ 200 {registrationId, checkoutUrl}
Wizard ── location.assign(checkoutUrl) ──▶ Stripe Checkout
Stripe ── webhook checkout.session.completed ──▶ /api/stripe/webhook
                                               ├─ verify signature (STRIPE_WEBHOOK_SECRET)
                                               ├─ update registrations set status="paid", paid_at, stripe_session_id
                                               └─ send confirmation e-mail (see 2.3)
Stripe ── checkout.session.expired ──▶ status="abandoned" (row kept for follow-up e-mail)
```

**Schema (Supabase, `supabase/migrations/0001_init.sql`):**

```sql
create type reg_status as enum ('pending_payment','paid','waitlist','abandoned','cancelled','refunded');
create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,                -- "sbd-next-2"
  created_at timestamptz default now(),
  status reg_status not null default 'pending_payment',
  first_name text not null, last_name text not null, email citext not null,
  birth_year int not null, sex text not null, division text not null, club text,
  bodyweight_kg numeric(5,1) not null, opener_squat numeric(5,1), opener_bench numeric(5,1), opener_deadlift numeric(5,1),
  entry_total numeric(6,1) generated always as (opener_squat+opener_bench+opener_deadlift) stored,
  shirt_cut text not null, shirt_size text not null,
  premium_media boolean default false, mc_text text, notes text,
  consent_at timestamptz not null, locale text default 'hu',
  stripe_session_id text unique, stripe_payment_intent text, paid_at timestamptz, amount_huf int,
  flight text, platform text,              -- filled by organisers later (schedule)
  utm jsonb, ip_hash text
);
create unique index registrations_event_email_paid on registrations(event_slug, email) where status in ('paid','pending_payment');
create table volunteers (id uuid primary key default gen_random_uuid(), event_slug text, created_at timestamptz default now(),
  name text, email citext, days text[], position text, shirt_cut text, shirt_size text, confirmed boolean default false);
create table weight_updates (id uuid primary key default gen_random_uuid(), registration_id uuid references registrations(id),
  created_at timestamptz default now(), bodyweight_kg numeric(5,1));
create table schedule (id serial primary key, event_slug text, day date, platform text, gender text,
  weigh_in_start time, weigh_in_end time, start_time time, end_time time, groups text[], sort int);
create table results (id uuid primary key default gen_random_uuid(), registration_id uuid references registrations(id),
  squat numeric(5,1), bench numeric(5,1), deadlift numeric(5,1), total numeric(6,1), gl_points numeric(7,2), place int);
-- RLS: enable on every table; NO anon policies. The website uses the service-role key server-side only.
create view public_entries as select event_slug, division, sex, last_name||' '||first_name as name, club, entry_total, flight
  from registrations where status in ('paid','waitlist');   -- what the leaderboard shows; no e-mail, no birth year
```

Rules: enable Row Level Security on every table with **no** anonymous policies; the site reads and
writes only through server code with `SUPABASE_SERVICE_ROLE_KEY`. Public pages read the
`public_entries` view (no personal data). Generate types with `supabase gen types` into `lib/db.types.ts`.

### 2.2 Admin

A minimal `/admin` route protected by Supabase Auth with **Google sign-in restricted to the
`sbdnext.hu` Workspace domain** (Supabase → Auth → Google provider, `hd=sbdnext.hu`). Pages:
registrations table (filter by status, search, CSV export), volunteers, capacity override, schedule
editor (replaces the Google Sheet), results upload (CSV → `results`), phase override. This is
Phase 5 work; until it ships, the Supabase dashboard's table editor is the admin UI.

### 2.3 E-mail via the Google Workspace account

Transactional mail (registration received, payment confirmed, waitlist, volunteer confirmation,
weight reminder) must be reliable and land in inboxes, so:

- Send with **Resend** (free tier covers this volume) from `powerlifting@sbdnext.hu`, with the
  `sbdnext.hu` domain verified (SPF/DKIM records in the domain's DNS). `Reply-To` is the same
  address, so replies land in the Gmail inbox the organisers already read.
- Alternative with zero extra vendors: Nodemailer over Gmail SMTP with a Workspace app password.
  Works, but deliverability and the 2,000/day Workspace limit make Resend the safer default.
- Templates in `emails/*.tsx` (react-email), Hungarian with an English footer line. Every mail
  includes the registration id, the weight-update link and the contact address.
- The Gmail account is also the Google sign-in identity for `/admin` (2.2) and the owner of the
  Drive photo folders (see §4.6).

---

## 3. The event config and phase model

**Event 2 timeline, as given by the organiser (2026-09-26):**

| When | What |
|---|---|
| October 2026 | Marketing starts, site goes live in `announced` phase |
| 1 November – 31 December 2026 | Registration open |
| January 2027 | Volunteer recruitment; groups and schedule published |
| 13 February 2027 (Saturday) | Competition day 1 |
| 14 February 2027 (Sunday) | Day 2 **only if there are enough athletes** – decided after registration closes |

Exact open/close times (e.g. 1 Nov 20:00, 31 Dec 23:59) are placeholders until confirmed.

`config/event.ts` (shape, with the event 2 values above):

```ts
export const EVENT = {
  slug: "sbd-next-2",
  edition: 2,
  name: "SBD Next",
  tagline: { hu: "A következő szint", en: "The next level" },
  timezone: "Europe/Budapest",
  days: [
    { date: "2027-02-13", start: "07:00", end: "21:00", confirmed: true },
    { date: "2027-02-14", start: "07:00", end: "21:00", confirmed: false },  // shown as "várhatóan" until confirmed
  ],
  venue: { name: "Thor Gym (Újbuda)", address: "1116 Budapest, Nándorfejérvári út 40.",
           mapsUrl: "https://maps.google.com/?q=Thor+Gym+Budapest", mapEmbedSrc: "...",
           parking: {...}, amenities: {...} },
  registration: {
    opensAt: "2026-11-01T20:00:00+01:00",   // TODO(event-2): confirm time
    closesAt: "2026-12-31T23:59:00+01:00",  // TODO(event-2): confirm
    capacity: 220,
    waitlist: true,
    minAge: 14, maxAge: 100,               // birth-year bounds derived from event year
  },
  volunteers: { opensAt: "2027-01-01T00:00:00+01:00", closesAt: "2027-02-06T23:59:00+01:00" },
  fees: { currency: "HUF", entry: 29990, spectator: 1000, premiumMedia: 24990 },
  stripe: { priceEntry: "price_…", pricePremiumMedia: "price_…" },   // Stripe Price ids for Checkout Sessions
  divisions: [...], shirt: { cuts: ["Női","Férfi"], sizes: {...} },
  streams: [{ label: "A platform", url: "…" }, …],
  social: { instagram: [...], facebook: "...", youtube: "..." },
  contact: { email: "powerlifting@sbdnext.hu" },
  sponsors: [{ name: "SBD Hungary", logo: "/sponsors/sbd.svg", url: "…" }, …],
  mediaTeam: [...],
  docs: { invitation: "/docs/…pdf", rules: "/docs/…pdf", qualification: "/docs/…pdf" },
  siteUrl: "https://www.sbdnext.hu",
} as const;
```

`lib/phase.ts`:

```ts
export type Phase = "announced" | "registration" | "closed" | "live" | "post";
export function getPhase(now: Date, e = EVENT): Phase
// announced: now < registration.opensAt                      (October 2026)
// registration: opensAt <= now < closesAt                    (Nov–Dec 2026)
// closed: closesAt <= now < firstDay 06:00                   (January 2027: volunteers, groups, schedule)
// live: any confirmed event day, 06:00–23:00 local           (13 Feb, and 14 Feb if confirmed)
// post: after last confirmed day
// Override: process.env.PHASE_OVERRIDE (server) / ?phase= on preview deployments only
export function volunteersOpen(now: Date, e = EVENT): boolean   // independent window, Jan 2027
```

**Every phase-dependent element must read from this**, never from `new Date()` inline:

| Element | announced (Oct) | registration (Nov–Dec) | closed (Jan) | live (13–14 Feb) | post |
|---|---|---|---|---|---|
| Hero primary CTA | "Értesíts, ha indul a nevezés" (email capture → `interest` table) | "Nevezek" → `/nevezes` | "Nevezési lista / Időrend" | "Élő közvetítés" | "Eredmények" |
| Hero secondary | Versenykiírás PDF | Versenykiírás PDF | "Önkéntesnek jelentkezem" | Időrend / Listák | Fotók / Prémium média |
| Countdown | to opensAt | to closesAt (+ spots left) | to first day | hidden / "Most zajlik" badge | hidden |
| Registration section | teaser + countdown | wizard | "lezárult" + waitlist note | hidden | hidden |
| Lists / Schedule | hidden or "hamarosan" | lists live | lists + schedule (day 2 shown once confirmed) | schedule with "now" marker + streams | results |
| Premium media banner | hidden | inline in fees | inline in fees | hidden | prominent |
| Volunteers CTA | hidden | small footer link | **prominent section + hero secondary** | hidden | hidden |
| Day 2 wording | "Február 13. (és 14., ha a létszám indokolja)" | same | "13–14. február" once `confirmed: true` | — | — |

---

## 4. Design system

### 4.1 Tokens (fix C1 first)

`app/globals.css` – rewrite the top of the file, delete the three appended override blocks at the bottom:

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.13 0 0);          /* near-black, not pure #000 */
  --foreground: oklch(0.97 0 0);
  --card: oklch(0.17 0.005 20);
  --card-foreground: var(--foreground);
  --popover: oklch(0.15 0 0);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.58 0.24 27);         /* SBD red ≈ #ED1C24 */
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.22 0 0);
  --secondary-foreground: var(--foreground);
  --muted: oklch(0.22 0 0);
  --muted-foreground: oklch(0.72 0 0);    /* ≥ 4.5:1 on background */
  --accent: oklch(0.25 0.02 20);
  --accent-foreground: var(--foreground);
  --destructive: oklch(0.62 0.22 25);
  --success: oklch(0.7 0.17 150);
  --warning: oklch(0.8 0.16 80);
  --border: oklch(0.28 0 0);
  --input: oklch(0.3 0 0);
  --ring: var(--primary);
  --radius: 0.75rem;
}
@theme inline {
  --color-background: var(--background);   /* …one line per token, exactly as shadcn v4 does */
  --radius-sm: calc(var(--radius) - 4px); --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius); --radius-xl: calc(var(--radius) + 4px);
  --font-sans: var(--font-geist-sans); --font-display: var(--font-display); --font-mono: var(--font-geist-mono);
}
```

Rule: **no raw colour utilities (`text-red-400`, `bg-black/70`, `border-neutral-800`) in feature
code.** Use tokens (`text-primary`, `bg-card`, `border-border`, `text-muted-foreground`). Add an
ESLint rule or a grep check in CI (`rg "text-red-|bg-black/|border-neutral-" app components` must
return 0 hits outside `components/ui`).

### 4.2 Typography

- Body: Geist Sans (already loaded). Minimum body size 14 px; helper text 13 px; never below 12 px.
- Display: add one condensed athletic face via `next/font/google` for `h1`/section titles and the
  countdown digits, e.g. **Barlow Condensed 700/800** or **Oswald**. Use `font-display uppercase
  tracking-wide` for section titles. This is what will make it feel "SBD" instead of generic.
- Scale: `h1` 40/48/64 px (mobile/tablet/desktop), `h2` 28/32, `h3` 20, body 16, small 14, micro 13.
- Numbers (prices, kg, countdown): `tabular-nums`.

### 4.3 Components to add (shadcn CLI, `npx shadcn@latest add …`)

`label`, `tabs`, `accordion`, `badge`, `alert`, `skeleton`, `sheet`, `separator`, `tooltip`,
`sonner`, `progress`, `radio-group`, `form` (react-hook-form wrapper). Keep `button`, `card`,
`input`, `textarea`, `checkbox`, `select` but re-generate them so they match the token layer and
remove the local Radix Select colour hacks.

**Button variants** (only these, no inline gradients): `primary` (solid SBD red, white text),
`secondary` (card bg, border), `ghost`, `link`, `destructive`. Sizes `sm|md|lg|xl`. One optional
`glow` prop for the single hero CTA. Buttons that navigate use `<Button asChild><Link/></Button>`.

**Site components:** `Section` (id, eyebrow, title, description, children – consistent
`py-16 sm:py-24` rhythm), `Stat`, `SponsorGrid` (uniform 40 px logo height, grayscale → colour on
hover), `PhaseBanner`, `StickyMobileCta`, `SiteHeader` (with `Sheet` mobile drawer), `SiteFooter`.

### 4.4 Visual direction

- Background: solid `--background` with **one** hero image (optimised, `next/image`, `priority`,
  `sizes`), a bottom gradient into the page background, and a subtle red radial accent. No rotating
  global background, no per-card glow.
- Cards: `bg-card border-border rounded-xl`; elevated variant adds `shadow-lg`. That's it.
- Red is for: primary CTA, active states, eyebrows, key numbers. Not for labels, not for borders of
  untouched inputs, not for body text.
- Motion: CSS transitions only; `tw-animate-css` for enter animations; remove `framer-motion`.
  Respect `prefers-reduced-motion`.
- Icons: lucide only, `aria-hidden` when decorative. No emoji in UI chrome.

### 4.5 What it looks like (the mockup, in words)

Reference: <https://claude.ai/artifact/RCtGqTscPxMbsK5vpCy4XP> (four artboards: mobile home,
wizard step 3, wizard summary, desktop home). Reproduce this, not the current site.

**Palette (exact values used in the mockup):** page `#0B0B0C`, card `#151517`, raised `#1C1C1F`,
border `#2A2A2F`, input border `#3A3A40`, text `#F4F4F5`, muted text `#A1A1AA`, SBD red fill
`#E4222A` (white text on it), red text on dark `#FF4B52`, success `#22C55E`. Nothing else. No
gradients on buttons, no glows, no orange.

**Type:** `Barlow Condensed` 700/800 uppercase for every heading, the countdown, prices and kg
values (the "meet-day scoreboard" feel); `Geist` for everything else. Mobile `h1` 72 px, section
`h2` 36 px, desktop `h1` 136 px, `h2` 56–64 px. A red 13–14 px uppercase tracked *eyebrow*
("NEVEZÉS", "IDŐREND") sits above every `h2`. Numbers use `tabular-nums`.

**Header:** 64 px (72 desktop). Logo mark + wordmark "SBD NEXT 2" (the "2" in red). Desktop: six
text links, "EN" chip, red "Nevezés" button. Mobile: red "Nevezés" button + 44 px hamburger that
opens a sheet.

**Hero, mobile:** 560 px tall photo from SBD Next 1 (see 4.6), dark gradient from 15 % at the top
to opaque page colour at the bottom. Over it, bottom-aligned: a pill "● Nevezés nyitva · 2027. jan.
7-ig" with a green dot, the `h1`, one sentence, two fact chips (date, venue) with red icons, a
full-width red primary button "Nevezek – 29 990 Ft →" and a secondary "Versenykiírás (PDF)".
**Hero, desktop:** 12-column grid, text left (6 cols), photo card right (6 cols, 640 px, rounded
24 px) whose bottom edge carries the deadline countdown in Barlow 44 px and a 200 px capacity bar.

**Below the hero:** a capacity card (label, "143 / 220", 8 px progress bar, countdown), then a
2×2 (4×1 desktop) grid of fact cards with eyebrow + two-line bold value: Formátum · Kategóriák ·
Pontozás · A díj tartalmazza.

**Sections, in order:** Nevezés ("Három lépés a platformig": three numbered cards with a big red
Barlow numeral, then a red CTA) → Nevezési listák (pill tabs with count badges, red active pill;
mobile rows show rank, name, club and the total in Barlow 22 px; desktop is a real table with a
search box and a group chip column) → Időrend (one card per platform: red "A platform" chip or
neutral "B platform" chip, group line, weigh-in and start/end in 18 px bold; "Naptárba mentem"
secondary button; desktop is a 4-column table) → Díjak (entry-fee card with a **red border**,
price in Barlow 30 px red, three bullets of what is included; premium media and spectator as
plain cards with the price on the right) → photo strip (two SBD Next 1 photos, 200 px, rounded
14 px) → GYIK (accordion in one card, first item open, red chevron on the open item) → Szervezők
és partnerek (three logos at a uniform 36–48 px height) → footer (wordmark, organiser line,
e-mail, Instagram handles with icons, doc/legal links, language, copyright).

**Sticky mobile CTA:** a 72 px bar at the bottom of the viewport, 94 % opaque page colour with a
top border: left "Nevezés nyitva / 77 szabad hely · jan. 7-ig", right a 48 px red "Nevezek" button.
Only in the `registration` phase, hidden while the wizard is open.

**Wizard (mobile):** header with back arrow, "NEVEZÉS" title and "3 / 5"; five 4 px segment bars
(done = red, todo = border colour); step title in Barlow 34 px + one helper sentence; inputs are
48 px, `#151517` fill, 1 px `#3A3A40` border, 16 px text, unit suffix ("kg") in muted grey inside
the field; an invalid field gets a red border + 3 px red 18 % ring and a 13 px red message with an
icon directly under it (`role="alert"`); a live "Nevezési total" card recomputes from the three
openers. Footer: "Vissza" ghost (1/3 width) + "Tovább →" red (2/3), and a green-tick line
"Piszkozat mentve, később folytathatod". **Summary step:** key/value rows with a red "Módosítom"
link per row, a price card (entry + premium, divider, "Fizetendő" in Barlow 28 px red), one
consent checkbox whose label links to the privacy notice and the rules, and a "Fizetés – 54 980 Ft"
button with a lock icon and the line "Biztonságos fizetés a Stripe-on keresztül."

### 4.6 Photography: use SBD Next 1, not Sheffield

The current site's hero shows Sheffield/Worlds-level lifters, which tells hobbyists "this is not
for me". The organiser's Drive folder **"SBDNext 2026.02.14 Válogatás"** (subfolders *A platform*,
*B platform*, *Media plus*) holds the professional photos from the first meet: red stage lighting,
"SBD NEXT" banners in frame, real first-time competitors. Use those everywhere.

Selected for the mockup (Drive file names): `UJONCNOI1-3.jpg` (desktop hero), `KATA2055.jpg`
(mobile hero), `UJONCNOI2-21.jpg`, `VERSENYZONOI-18.jpg`, `VERSENYZONOI-17.jpg` (black and white,
chalk), `UJONCNOI1-9.jpg`. Good alternates: `KATA2160`, `KATA1864`, `UJONCNOI2-25`,
`VERSENYZONOI-30`.

Implementation: add `scripts/photos.mjs` that takes a list of source files (exported from Drive to
a local folder, not committed) and writes `public/photos/<name>-{800,1600}.{webp,jpg}` with `sharp`,
plus a `config/photos.ts` manifest with alt texts. Originals are 12–20 MB and must never land in
the repo or the deploy. Aim for hero ≤ 250 kB, strip images ≤ 100 kB. Ask the athletes' consent
status from the organiser before publishing recognisable faces on the marketing site (the meet's
registration consent should cover it; confirm and link it from the privacy notice).

Note for the organiser: that Drive folder is currently shared "anyone with the link" (its files are
fetchable without signing in). Fine for distributing photos to athletes, but be aware of it.

---

## 5. Page specifications

### 5.1 Home (`/`)

Order, top to bottom (each is a `<Section>` unless noted):

1. **Header** – logo lockup (SBD Next), nav: Infók · Időrend · Nevezési lista · Díjak · GYIK ·
   Önkéntes · EN, primary button by phase. Mobile: logo + primary button + hamburger → `Sheet`.
2. **Hero** – full-bleed image, `h1` = event name (real text, logo image as decoration), tagline,
   three facts (date, time, venue) as compact chips, primary + secondary CTA per phase, small
   `PhaseBanner` line ("Nevezés nyitva 2027. jan 7-ig · 143/220 hely" or "Nevezés indul: 3 nap 04:12").
3. **Key facts strip** – 4 stats: format (SBD, IPF szabályok), divisions (Újonc / Versenyző,
   Női / Férfi), scoring (IPF GL, nincs súlycsoport), included (media csomag + SBD póló).
4. **Registration** (phase-gated) – short intro, "what happens after you register" 3-step
   explainer (kitöltöd → fizetsz → visszaigazolás e-mailben), then `RegistrationWizard` inline **or**
   a large CTA to `/nevezes`. Recommendation: CTA to `/nevezes` (dedicated page = better focus and
   analytics, shareable link, no scroll-jank).
5. **Nevezési listák** – `Tabs` with counts (`Újonc – Nők (12)`), server-fetched rows, search box,
   "Frissítve: 2 perce", skeleton on load, error state with retry. Desktop table / mobile cards as now.
6. **Időrend** – grouped by day → platform, weigh-in / start / end, group chips; on `live` phase a
   "most" marker and the stream links; add-to-calendar (`.ics` served from `/api/ics`).
7. **Szabályok & felszerelés** – two columns (Versenyző / Újonc) instead of a bullet list; PDF cards.
8. **Díjak** – clean price table with "mit tartalmaz" bullets under each row; premium media as a
   third row with its own CTA; prizes box once.
9. **Helyszín** – address, directions button (maps deep link), parking/amenities list, map loaded
   on click (static preview image + "Térkép betöltése") to avoid the eager iframe.
10. **GYIK** – `Accordion`, 8–10 questions, JSON-LD `FAQPage`.
11. **Önkéntes** – compact card with CTA (phase-gated).
12. **Szponzorok** – `SponsorGrid`.
13. **Footer** – organiser block (SBD Hungary × PowerFlow), contact, social icons, docs, legal
    (`Adatkezelési tájékoztató`, `Versenykiírás`, `Impresszum`), language switch, copyright.

Sticky bottom bar on mobile (only in `registration` phase): "Nevezés · 29 990 Ft" button.

### 5.2 Registration wizard (`/nevezes`)

Steps (progress indicator with labels, not just a bar):

1. **Alapadatok** – vezetéknév, keresztnév, e-mail (with confirm-email or at least typo hint), születési év, nem.
2. **Kategória** – division as `RadioGroup` cards with the definition inside each card; club (optional).
3. **Nevezési adatok** – testsúly, 3 openers with kg suffix and instant "total" preview; MC text; notes.
4. **Póló & extrák** – cut/size (size list depends on cut), premium media toggle with price delta.
5. **Összegzés** – read-only summary with "Módosítom" links per step, consent checkbox with links to
   privacy + rules, price total, submit "Fizetés (29 990 Ft)".

Behaviour:
- `react-hook-form` + `zodResolver`, schema in `lib/validation/registration.ts`, shared with the API.
- Per-field messages under the field, `aria-invalid`, `aria-describedby`; step "Tovább" runs
  `trigger()` on that step's fields only.
- Inputs use `inputMode="decimal"` for kg, `autoComplete` attributes (`given-name`, `family-name`, `email`).
- Draft saved to `localStorage` (debounced), restored with a "Folytatod a korábbi nevezést?" toast.
- Submit → `POST /api/register`; on 4xx map field errors; on 5xx show retry with contact e-mail;
  on 200 store `registrationId` and `location.assign(stripeUrl)`.
- Waitlist path: if capacity full, step 5 button reads "Várólistára jelentkezem" and there is no Stripe redirect.
- Success page `/nevezes/koszonjuk?rid=` shows what happens next and the weight-update link.
- Double-submit guard, honeypot, and a Cloudflare Turnstile widget (free) on the final step.

### 5.3 Volunteers (`/onkentes`)

Same form infrastructure, writes to the `volunteers` table, confirmation e-mail. Fix C6. Days as
checkboxes for each event day (day 2 labelled "várhatóan" until confirmed) plus a required "Vállalom
a teljes napot (7:00–19:00)" confirmation. Positions as radio cards with a one-line description
each. One back link. Perks box with icons, not emoji. The page is open only in the volunteer window
(January 2027, `EVENT.volunteers`), otherwise it shows "Az önkéntes jelentkezés januárban indul" and
an e-mail-me field.

### 5.4 Weight update (`/testsuly`)

Keep, wire to `/api/weight` → `weight_updates`. The link in the confirmation e-mail carries
`?rid=<registration id>` so the row is matched by id, never by name. Add honeypot.

### 5.5 Premium media (`/premium-media`)

Keep content and team. Fix lint error (use `Link`). Add example photo grid (3–6 images) and
"mit kapsz" list. Phase-aware CTA copy.

### 5.6 English (`/en`)

Make it a real landing page with the same sections, fed by `config/content/en.ts`. The wizard
gets `?lang=en` labels via the same dictionary. Long-term option: `next-intl` with `[locale]`
routing; not required for event 2.

### 5.7 New: `/adatkezeles`, `/eredmenyek`, `/nevezes/koszonjuk`, `/nevezes/megszakitva`

Privacy text must come from the organiser (placeholder with TODO is fine, but the route and the
footer link must exist). Results page reads the `results` table and renders sortable tables
(IPF GL points column, podium highlighting).

---

## 5.8 Marketing moments the site must serve (from SBD Hungary's Instagram, event 1)

A search of `@sbd.hungary` posts (September 2026) shows nothing public about SBD Next 2 yet, which
matches the "marketing starts in October" plan. The event 1 campaign arc is the template, and each
post needs a link target on the site that is ready *before* the post goes out:

| Event 1 post (date) | What it linked to | Site must have, event 2 |
|---|---|---|
| Announcement reel: "A PWB Kupa nyomdokaiba lépve… Magyarország legnagyobb nyílt erőemelő versenye" (19 Nov 2025) | landing page | `announced` phase live with date, venue, "Értesíts" e-mail capture, versenykiírás PDF |
| "Mindjárt itt az SBD Next! Minden kérdésedre a linken" (17 Nov) | FAQ | `/#gyik` accordion, shareable anchor |
| Q&A carousel "Mit kapsz a nevezésért? Miért éri meg?" (23 Nov) | fees | `/#dijak` with "mit tartalmaz" bullets |
| "A honlapon elérhető az ideiglenes nevezési lista" (25 Nov) | leaderboard | `/#nevezesi-lista` with counts per category |
| "Csatlakozz az SBD NEXT csapatához! Jelentkezz önkéntesnek – staff póló, étkezés" (Jan 2026) | volunteers | `/onkentes` open in January window |
| "Hétvégén jön az SBD NEXT! Stream linkek a weboldalon" (8 Feb) | streams | `live` phase hero with embedded streams |
| "Lezajlott az első SBD Next, hamarosan képek és videók" (15 Feb) | — | `post` phase: results, gallery, premium media CTA |

Also visible in those posts and worth carrying onto the site: the event is positioned as the
successor of the PWB Kupa, "a MERSZ teljeskörű támogatásával" (show the MERSZ logo in the partner
row), the brand is written **SBD NEXT** in caps in social copy, and athletes' own recap posts tag
`@sbd.hungary`, so a "Te is versenyeztél? Jelöld be @sbd.hungary" line in the post-phase makes sense.
Every section anchor above should be short and stable so it can be pasted into a story link.

## 6. Implementation phases

Each phase = one PR, `npm run lint && npm run typecheck && npm run test && npm run build` green
before opening it. Sizes are rough effort for an AI agent with review: S < 1 h, M ≈ half day, L ≈ day.

### Phase 0 – Hygiene (S)
- [ ] Upgrade `next` to latest 16.3.x, `eslint-config-next` to match, run `npm audit`; try removing
      `--webpack` from scripts, keep it only if Turbopack build fails (document why).
- [ ] Add Prettier (`.prettierrc`, `prettier-plugin-tailwindcss`), `format` script, format everything once.
- [ ] Scripts: `typecheck` (`tsc --noEmit`), `lint` with `--max-warnings 0`, `test`, `e2e`.
- [ ] Add `.nvmrc` (22), `.env.example` listing every env var with a comment.
- [ ] Delete dead files: `app/page.minimal.tsx`, unused `components/ui/leaderboard.tsx` (after phase 2),
      template SVGs, unused logo variants. Move `public/signature.html` to `docs/`.
- [ ] Rewrite `README.md`: what the site is, how phases work, env vars, deploy, how to run event N.
- [ ] Fix the 2 ESLint errors and unused imports.
- Acceptance: CI-equivalent commands pass locally with 0 warnings.

### Phase 1 – Foundation: config, phase, tokens, layout (M)
- [ ] Create `config/event.ts`, `config/content/hu.ts`, `lib/phase.ts` (+ unit tests for every boundary).
- [ ] Delete `EVENT`/date constants from `lib/utils.ts` and `app/page.tsx`; import from config.
- [ ] Rewrite `app/globals.css` per §4.1; re-generate shadcn primitives; add `label`, `tabs`,
      `accordion`, `badge`, `alert`, `skeleton`, `sheet`, `separator`, `sonner`, `radio-group`, `form`.
- [ ] Add display font; typography scale in globals (`@layer base` h1–h3 defaults).
- [ ] `components/site/{header,mobile-nav,footer,section,stat,sponsor-grid}.tsx`; wire into `layout.tsx`.
- [ ] Metadata generated from config (title, description, OG, canonical to `siteUrl`), `opengraph-image.tsx`
      (1200×630, generated with `next/og`), `robots.ts`, `sitemap.ts`, `manifest.ts`, icons.
- Acceptance: `bg-card`/`text-primary` visibly work; mobile drawer opens; Lighthouse "Best practices" ≥ 95.

### Phase 2 – Data layer: Supabase, Stripe, e-mail (L)
- [ ] `supabase/` folder with the migration from §2.1, `supabase/config.toml`, and `npm run db:types`
      (`supabase gen types typescript`) → `lib/db.types.ts`. Enable RLS on all tables, no anon policies.
- [ ] `lib/supabase/server.ts` (service-role client, server-only) and typed query helpers:
      `getPublicEntries(division, sex)`, `getCapacity()`, `getSchedule()`, `getResults()`.
- [ ] `app/api/register/route.ts`, `volunteer`, `weight`, `interest` (announced-phase e-mail capture):
      zod validation (schemas shared with the client), honeypot, Turnstile, per-IP rate limit, insert,
      structured errors. Delete the old `registration-webhook` route and every `NEXT_PUBLIC_*` webhook var.
- [ ] `lib/stripe.ts`: create Checkout Session with `client_reference_id`, line items from Price ids,
      success/cancel URLs, 30-minute expiry. `app/api/stripe/webhook/route.ts` with signature
      verification handling `checkout.session.completed`, `checkout.session.expired`,
      `charge.refunded` → status updates.
- [ ] `lib/email.ts` with Resend + react-email templates: registration received, payment confirmed
      (with weight-update link), waitlist, volunteer confirmation. Sent from the webhook and the
      volunteer route, never from the client.
- [ ] `lib/csv.ts` (`papaparse`) kept only for the admin results/schedule CSV upload.
- Acceptance: unit tests for schemas and the phase logic; integration test that a Supabase insert
  failure returns 502 and no Checkout URL; Stripe CLI `stripe listen` replay marks a row paid and
  sends the e-mail; `rg "hook.eu1.make.com|docs.google.com/spreadsheets" app components lib` is empty.

### Phase 3 – Registration wizard (L)
- [ ] Build `components/forms/registration-wizard/*` per §5.2 and §4.5 with `react-hook-form`, `zod`, `Field` helper.
- [ ] `/nevezes`, `/nevezes/koszonjuk` (reads the row by `rid`, shows status: paid / still pending), `/nevezes/megszakitva`
      (offers "Fizetés újra" which creates a fresh Checkout Session for the same row).
- [ ] Draft persistence, Turnstile (env `TURNSTILE_SITE_KEY`/`SECRET`, verified in the route), waitlist path.
- [ ] Playwright e2e: happy path with `/api/register` mocked, validation errors per step, draft restore.
- Acceptance: every field has a linked label and inline error; keyboard-only completion possible;
  submit with the database mocked to fail shows retry and does not navigate.

### Phase 4 – Landing page rebuild (L)
- [ ] Split `app/page.tsx` into server component + `components/event/*` per §5.1; delete the old file's content.
- [ ] Hero with `next/image` (resize sources to ≤ 2000 px wide, WebP; keep originals out of the repo or in `/public/raw` gitignored).
- [ ] Isolated `Countdown` client component (single interval, `suppressHydrationWarning`, renders `—` until mounted).
- [ ] Lists with `Tabs`, counts, search, "updated x ago", skeleton, error/retry.
- [ ] Schedule grouped by day/platform, live marker, `.ics` endpoint.
- [ ] Fees table, rules two-column, venue with click-to-load map, FAQ accordion + JSON-LD, sponsors, sticky mobile CTA.
- [ ] Remove `framer-motion` dependency.
- Acceptance: home page JS bundle < 150 kB gz; LCP < 2.5 s on simulated 4G mobile; no hydration warnings in console; all phases render correctly with `PHASE_OVERRIDE`.

### Phase 5 – Secondary pages and admin (L)
- [ ] `/onkentes`, `/testsuly`, `/premium-media`, `/en` per §5.3–5.6; redirects from old paths in `next.config.mjs`.
- [ ] `/adatkezeles` with organiser-supplied text (placeholder OK), linked from consent + footer.
- [ ] `/eredmenyek` (can ship hidden behind phase until results exist).
- [ ] `/admin` per §2.2: Supabase Auth with Google provider limited to the `sbdnext.hu` domain;
      registrations table with status filter, search and CSV export; volunteers; schedule editor;
      results CSV upload; phase and capacity override stored in a `settings` table.

### Phase 6 – Accessibility, SEO, perf polish (M)
- [ ] axe (`@axe-core/playwright`) run on every page in e2e with 0 serious/critical violations.
- [ ] Contrast audit of every text style; `prefers-reduced-motion`; skip-to-content link; focus order in drawer/wizard.
- [ ] JSON-LD `SportsEvent` + `Organization`; verify OG with a preview tool.
- [ ] Vercel Analytics + Speed Insights; custom events: `reg_start`, `reg_step_n`, `reg_submit`, `reg_stripe_redirect`, `volunteer_submit`.

### Phase 7 – Tooling and CI (S)
- [ ] GitHub Actions: `lint`, `typecheck`, `test`, `build`, `e2e` (Playwright with Chromium) on PR.
- [ ] Lighthouse CI on the preview URL with budgets (perf ≥ 90 mobile).
- [ ] Dependabot or Renovate for monthly updates.

### Phase 8 – Optional upgrades (decide with organiser)
- Google Sheet export: a Supabase database webhook or a nightly cron that mirrors `registrations`
  into a Sheet for organisers who prefer it. Read-only mirror, never a source of truth.
- Abandoned-checkout follow-up e-mail 24 h after `checkout.session.expired`.
- `next-intl` with `[locale]` routing for full HU/EN parity.
- Live results on event day (admin enters attempts, 15 s revalidate) and a "kiosk" `/live` route for the venue screen.
- Photo gallery page after the event, fed from the Drive "Válogatás" folder via a manifest (Vercel Blob or Cloudinary).

---

## 7. Guardrails for the implementing agent

1. **Do not change the meaning of any Hungarian copy.** Restructure, shorten, fix typos, but the
   organiser owns the wording. Keep a `docs/COPY_CHANGES.md` listing any sentence you rewrote.
2. **Do not invent Stripe Price ids, Supabase project refs, or DNS records.** They come from the
   organiser via env vars / `config/event.ts`. Mark every value that must be updated for event 2
   with `// TODO(event-2)`. The old Make webhook URLs and Google Sheet ids are removed, not migrated.
3. **Secrets:** anything that is a webhook, key, or token goes in server-only env vars (no
   `NEXT_PUBLIC_` prefix) and in `.env.example` with a description.
4. **One PR per phase**, small commits, conventional-commit messages. Run
   `npm run lint && npm run typecheck && npm run test && npm run build` before every push.
5. **Never delete `public/docs/*.pdf`** – they are linked from e-mails and social posts.
6. **Keep old URLs working** (`/volunteers`, `/weight`, `/en`, `/premium-media`, `#register`,
   `#leaderboard`) via redirects or anchors; they were shared publicly.
7. **No raw colour utilities in feature code** (see §4.1). No `!important`. No global element overrides.
8. **Mobile first.** Every component is designed at 390 px first, then widened. Test the wizard on
   a real narrow viewport with the on-screen keyboard in mind (sticky footers must not cover inputs).
9. Prefer deleting over abstracting: if a helper is used once, inline it.
10. When unsure whether something is a product decision (e.g. one day vs two, fee amount), leave the
    current behaviour, add a `TODO(question)` comment, and list it in the PR description.

---

## 8. Definition of done for "SBD Next 2 ready"

- [ ] All values for event 2 live in `config/event.ts`; nothing date/price-related elsewhere.
- [ ] Every phase renders correctly with `PHASE_OVERRIDE` and screenshots of all five are attached to the PR.
- [ ] Registration: cannot reach Stripe without a confirmed stored row; success and cancel pages exist;
      `client_reference_id` is present in the Stripe session.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] axe: 0 serious/critical on all routes.
- [ ] CI green: lint (0 warnings), typecheck, unit, e2e, build.
- [ ] README explains how to run event N+1 in under 10 steps.

---

## 9. Decisions already made and open questions

**Decided (2026-09-26):**
- Timeline: marketing from October 2026, registration November–December 2026, volunteers in
  January 2027, competition 13 February 2027 with a conditional 14 February (see §3).
- Backend: Supabase is the system of record. Make and the Google Sheets CSV feeds are removed.
- Stripe: Checkout Sessions + webhook (follows from having a database).
- E-mail: sent as `powerlifting@sbdnext.hu` (Google Workspace account) via Resend with the domain
  verified; admin login is Google sign-in restricted to that Workspace.
- Photos: SBD Next 1 photos from the Drive "Válogatás" folder replace the Sheffield images.

**Still open (answer before Phase 1):**

1. **Exact registration open/close times**, capacity (220 again?), fees (unchanged?), and whether
   Thor Gym is the venue again.
2. **Domain:** is `www.sbdnext.hu` the canonical domain on Vercel? All metadata will point there.
3. **Legal texts:** who provides the privacy notice (adatkezelési tájékoztató) and rules text? Is
   there an ÁSZF/impressum requirement for the organiser entity? Does the SBD Next 1 registration
   consent cover using athletes' photos in marketing?
4. **English:** full English landing page (plan assumes yes, via a content dictionary) or keep the
   current "form guide" approach?
5. **Weight-update page:** keep for event 2, or replace with "update your weight" in the
   confirmation e-mail link only?
6. **Brand assets:** SVG logos for SBD Hungary, PowerFlow, Avancus and the SBD Next lockup.
7. **Anti-spam:** OK to add Cloudflare Turnstile (free, needs a Cloudflare account)?
8. **Analytics:** Vercel Analytics is enough, or do you want GA4/Meta Pixel for ad attribution?
9. **Stripe account:** same account as event 1? Create the two Prices (entry, premium media) and
   the webhook endpoint there; the implementing agent needs the Price ids and the webhook secret
   as env vars.
10. **Supabase project:** is the existing project for this site, or should a new one be created?
    Region should be EU (Frankfurt) for GDPR.
