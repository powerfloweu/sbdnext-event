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
4. **Move all data access server-side.** Google Sheets CSV and Make webhooks are fetched/called from
   a Next.js route with caching and validation. No secrets or endpoints in the client bundle.
5. **Landing page information architecture.** Hero → one primary CTA → key facts → registration →
   lists → schedule → rules → fees → venue → FAQ → sponsors → footer with legal pages. Mobile nav,
   sticky mobile CTA, optimised images.

Everything else (a11y, SEO, perf, tooling, i18n) is listed below and is worth doing, but those five
are the backbone.

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
  api/
    register/route.ts        # POST: zod-validate → forward to Make (server secret) → return {ok, registrationId, stripeUrl}
    volunteer/route.ts       # POST: same pattern
    weight/route.ts          # POST: same pattern
    lists/route.ts           # GET: leaderboard tabs, revalidate 60 s
    schedule/route.ts        # GET: schedule rows, revalidate 60 s
    capacity/route.ts        # GET: {limit, used, remaining} from sheet, revalidate 60 s
  robots.ts, sitemap.ts, manifest.ts, opengraph-image.tsx
config/
  event.ts                   # THE single source of truth (see §3)
  content/hu.ts, en.ts       # all copy (FAQ, rules bullets, venue text, prizes…)
lib/
  phase.ts                   # getPhase(now, event) → "announced" | "registration" | "closed" | "live" | "post"
  csv.ts                     # papaparse wrapper + header-mapped row parsing
  sheets.ts                  # fetchSheetCsv(gid) with fetch cache/revalidate
  validation/registration.ts # zod schema shared client+server
  validation/volunteer.ts, weight.ts
  format.ts                  # HUF, dates (hu-HU / en-GB), kg
  stripe.ts                  # buildPaymentLinkUrl({link, email, registrationId})
components/
  ui/                        # shadcn primitives: button, card, input, label, select, checkbox,
                             # textarea, tabs, accordion, badge, alert, skeleton, sheet, separator, tooltip, sonner
  site/                      # header, mobile-nav, footer, section, stat, sponsor-grid, language-switch
  event/                     # hero, phase-banner, countdown (isolated), key-facts, schedule, lists,
                             # fees-table, venue, faq, prizes, media-team, live-stream, results-table
  forms/                     # registration-wizard/, volunteer-form, weight-form, field.tsx, form-error.tsx
tests/
  unit/  (vitest)            # phase.ts, csv.ts, validation schemas, stripe url builder
  e2e/   (playwright)        # registration happy path with mocked /api/register, mobile nav, phase rendering
```

**Rendering model:** `app/page.tsx` is a server component. It reads `config/event.ts`, computes the
phase, fetches lists/schedule/capacity via the `lib/sheets.ts` functions with `next: { revalidate: 60 }`,
and renders sections. Only interactive pieces are client islands: countdown, tabs, wizard, mobile
nav, map-on-click. This alone removes most hydration issues and the 2,000-line client bundle.

**Data flow (registration):**

```
Wizard (client) ──POST /api/register (JSON)──▶ route.ts
                                               ├─ zod.parse → 400 on error (field-level messages)
                                               ├─ honeypot / rate-limit (per IP, in-memory or Upstash)
                                               ├─ fetch(process.env.MAKE_REGISTRATION_WEBHOOK)  ← server-only secret
                                               │    └─ if !ok → 502 {error:"storage"}  (client shows retry, NO redirect)
                                               └─ 200 {registrationId, stripeUrl}
Wizard ◀──────────────────────────────────────┘
  └─ window.location.assign(stripeUrl)   // stripeUrl includes client_reference_id=registrationId & prefilled_email
Stripe ── success_url ──▶ /nevezes/koszonjuk?rid=…   (configured on the Payment Link in Stripe dashboard)
```

If you want to go one step further (recommended but optional, see §9 Q4): replace the Payment Link
with a Stripe Checkout Session created in the route (`stripe.checkout.sessions.create`) and add a
`/api/stripe/webhook` that marks the registration paid via a second Make webhook. Then capacity and
"paid" state come from real data instead of a manually maintained sheet column.

---

## 3. The event config and phase model

`config/event.ts` (shape, fill with real event-2 values):

```ts
export const EVENT = {
  slug: "sbd-next-2",
  edition: 2,
  name: "SBD Next",
  tagline: { hu: "A következő szint", en: "The next level" },
  timezone: "Europe/Budapest",
  days: [{ date: "2027-02-13", start: "07:00", end: "21:00" }],   // 1..n days
  venue: { name: "Thor Gym (Újbuda)", address: "1116 Budapest, Nándorfejérvári út 40.",
           mapsUrl: "https://maps.google.com/?q=Thor+Gym+Budapest", mapEmbedSrc: "...",
           parking: {...}, amenities: {...} },
  registration: {
    opensAt: "2026-11-20T20:00:00+01:00",
    closesAt: "2027-01-07T23:59:00+01:00",
    capacity: 220,
    waitlist: true,
    minAge: 14, maxAge: 100,               // birth-year bounds derived from event year
  },
  fees: { currency: "HUF", entry: 29990, spectator: 1000, premiumMedia: 24990 },
  stripe: { base: "https://buy.stripe.com/…", premium: "https://buy.stripe.com/…", premiumOnly: "https://buy.stripe.com/…" },
  divisions: [...], shirt: { cuts: ["Női","Férfi"], sizes: {...} },
  sheets: { publishedId: "2PACX-…", gids: { noviceF: 1482153429, noviceM: 862629266, openF: 672992038, openM: 1696060010, schedule: 540836351, capacity: 0 } },
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
// announced: now < opensAt
// registration: opensAt <= now < closesAt
// closed: closesAt <= now < firstDay 06:00
// live: any event day, 06:00–23:00 local
// post: after last day
// Override: process.env.PHASE_OVERRIDE (server) / ?phase= on preview deployments only
```

**Every phase-dependent element must read from this**, never from `new Date()` inline:

| Element | announced | registration | closed | live | post |
|---|---|---|---|---|---|
| Hero primary CTA | "Értesíts, ha indul a nevezés" (email capture → Make) | "Nevezek" → `/nevezes` | "Nevezési lista" | "Élő közvetítés" | "Eredmények" |
| Hero secondary | Versenykiírás PDF | Versenykiírás PDF | Időrend | Időrend / Listák | Fotók / Prémium média |
| Countdown | to opensAt | to closesAt (+ spots left) | to first day | hidden / "Most zajlik" badge | hidden |
| Registration section | teaser + countdown | wizard | "lezárult" + waitlist note | hidden | hidden |
| Lists / Schedule | hidden or "hamarosan" | lists live | lists + schedule | schedule with "now" marker + streams | results |
| Premium media banner | hidden | inline in fees | inline in fees | hidden | prominent |
| Volunteers CTA | visible | visible | visible | hidden | hidden |

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

Same form infrastructure. Fix C6. Single-day → show the date as information and a required
"Vállalom a teljes napot (7:00–19:00)" confirmation checkbox. Positions as radio cards with a
one-line description each. One back link. Perks box with icons, not emoji.

### 5.4 Weight update (`/testsuly`)

Keep, wire to `/api/weight`. Add registrationId to the pre-fill link (`?rid=`) so the sheet row
can be matched without name matching. Add honeypot.

### 5.5 Premium media (`/premium-media`)

Keep content and team. Fix lint error (use `Link`). Add example photo grid (3–6 images) and
"mit kapsz" list. Phase-aware CTA copy.

### 5.6 English (`/en`)

Make it a real landing page with the same sections, fed by `config/content/en.ts`. The wizard
gets `?lang=en` labels via the same dictionary. Long-term option: `next-intl` with `[locale]`
routing; not required for event 2.

### 5.7 New: `/adatkezeles`, `/eredmenyek`, `/nevezes/koszonjuk`, `/nevezes/megszakitva`

Privacy text must come from the organiser (placeholder with TODO is fine, but the route and the
footer link must exist). Results page reads a results sheet gid and renders sortable tables
(IPF GL points column, podium highlighting).

---

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

### Phase 2 – Data layer (M)
- [ ] `lib/csv.ts` using `papaparse` (header-mapped, quoted-field safe) + tests with tricky CSV fixtures.
- [ ] `lib/sheets.ts`: `fetchSheetCsv(gid)` with `next: { revalidate: 60 }` and typed row mappers for
      lists, schedule, capacity, results.
- [ ] `app/api/{lists,schedule,capacity}/route.ts` for client refresh; server components call `lib/sheets` directly.
- [ ] `app/api/register/route.ts`, `volunteer`, `weight`: zod validation, honeypot, per-IP rate limit
      (in-memory Map is fine on Vercel for now; note Upstash as upgrade), forward to
      `process.env.MAKE_*_WEBHOOK` (server-only), return structured errors. Remove `NEXT_PUBLIC_*`
      webhook vars and the old `registration-webhook` route.
- [ ] `lib/stripe.ts` builds Payment Link URLs with `client_reference_id` + `prefilled_email`.
- Acceptance: unit tests for parsers/schemas; `rg "hook.eu1.make.com" app components` returns nothing;
  a failing Make call returns 502 and never a Stripe URL.

### Phase 3 – Registration wizard (L)
- [ ] Build `components/forms/registration-wizard/*` per §5.2 with `react-hook-form`, `zod`, `Field` helper.
- [ ] `/nevezes`, `/nevezes/koszonjuk`, `/nevezes/megszakitva` pages; update Stripe Payment Link
      success/cancel URLs in the Stripe dashboard (manual step – list it in the PR description).
- [ ] Draft persistence, Turnstile (env `TURNSTILE_SITE_KEY`/`SECRET`, verified in the route), waitlist path.
- [ ] Playwright e2e: happy path with `/api/register` mocked, validation errors per step, draft restore.
- Acceptance: every field has a linked label and inline error; keyboard-only completion possible;
  submit with Make mocked to 500 shows retry and does not navigate.

### Phase 4 – Landing page rebuild (L)
- [ ] Split `app/page.tsx` into server component + `components/event/*` per §5.1; delete the old file's content.
- [ ] Hero with `next/image` (resize sources to ≤ 2000 px wide, WebP; keep originals out of the repo or in `/public/raw` gitignored).
- [ ] Isolated `Countdown` client component (single interval, `suppressHydrationWarning`, renders `—` until mounted).
- [ ] Lists with `Tabs`, counts, search, "updated x ago", skeleton, error/retry.
- [ ] Schedule grouped by day/platform, live marker, `.ics` endpoint.
- [ ] Fees table, rules two-column, venue with click-to-load map, FAQ accordion + JSON-LD, sponsors, sticky mobile CTA.
- [ ] Remove `framer-motion` dependency.
- Acceptance: home page JS bundle < 150 kB gz; LCP < 2.5 s on simulated 4G mobile; no hydration warnings in console; all phases render correctly with `PHASE_OVERRIDE`.

### Phase 5 – Secondary pages (M)
- [ ] `/onkentes`, `/testsuly`, `/premium-media`, `/en` per §5.3–5.6; redirects from old paths in `next.config.mjs`.
- [ ] `/adatkezeles` with organiser-supplied text (placeholder OK), linked from consent + footer.
- [ ] `/eredmenyek` (can ship hidden behind phase until results exist).

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
- Stripe Checkout Sessions + webhook → paid status and live capacity (replaces manual sheet column).
- Supabase (connector is available) as the system of record: `registrations`, `payments`,
  `volunteers` tables; Make keeps feeding the Google Sheet for the organisers. Gives an admin view,
  exports, and dedupe by e-mail.
- `next-intl` with `[locale]` routing for full HU/EN parity.
- Live results on event day (sheet-driven, 15 s revalidate) and a "kiosk" `/live` route for the venue screen.
- Photo gallery page after the event (Cloudinary or Vercel Blob).

---

## 7. Guardrails for the implementing agent

1. **Do not change the meaning of any Hungarian copy.** Restructure, shorten, fix typos, but the
   organiser owns the wording. Keep a `docs/COPY_CHANGES.md` listing any sentence you rewrote.
2. **Do not touch Stripe links, Make webhook URLs, or sheet gids except to move them into
   `config/event.ts` / env vars.** Never invent new ones. Mark every value that must be updated for
   event 2 with `// TODO(event-2)`.
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

## 9. Open questions for the organiser (answer before Phase 1)

1. **Event 2 facts:** date(s), one or two days, venue (same Thor Gym?), capacity, fees, registration
   window. Placeholders are fine but the *shape* (number of days) affects the schedule and volunteer form.
2. **Domain:** is `www.sbdnext.hu` the canonical domain on Vercel? All metadata will point there.
3. **Backend:** keep Make → Google Sheets as the system of record (fastest, plan assumes this), or
   move to Supabase (more robust, more work – Phase 8)?
4. **Stripe:** keep Payment Links (plan assumes this, needs `client_reference_id` + success/cancel
   URLs configured in the dashboard) or switch to Checkout Sessions + webhook (recommended for
   automatic "paid" status and capacity)?
5. **Legal texts:** who provides the privacy notice (adatkezelési tájékoztató) and rules text? Is
   there an ÁSZF/impressum requirement for the organiser entity?
6. **English:** full English landing page (plan assumes yes, via a content dictionary) or keep the
   current "form guide" approach?
7. **Volunteers & weight pages:** keep both for event 2?
8. **Brand assets:** can we get SVG logos for SBD Hungary, PowerFlow, Avancus, and the SBD Next
   lockup, plus 3–5 high-quality event photos already sized for web? (Current PNGs/JPEGs are
   300 KB–9 MB.)
9. **Anti-spam:** OK to add Cloudflare Turnstile (free, needs a Cloudflare account)?
10. **Analytics:** Vercel Analytics is enough, or do you want GA4/Meta Pixel for ad attribution?
