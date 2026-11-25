import { NextRequest, NextResponse } from "next/server";

import { EVENT } from "@/config/event";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe-checkout";

// "Pay now" link for a registration that's already stored as
// pending_payment (e.g. a payment-reminder e-mail) — issues a fresh Stripe
// Checkout session for the row and redirects straight to it, so the athlete
// never has to redo the wizard. Same token-gated lookup as
// app/api/registration/[id]/route.ts (the self-service edit endpoint).
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

const SELECT_FIELDS =
  "id, edit_token, status, email, entry_fee, wants_shirt, premium_media, currency, locale";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token") ?? "";

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const admin = getSupabaseAdmin();
  if (!admin || !token) {
    return NextResponse.redirect(`${EVENT.siteUrl}/nevezes`);
  }

  const { data: registration, error } = await admin.from("registrations").select(SELECT_FIELDS).eq("id", id).maybeSingle();
  if (error || !registration || !registration.edit_token || registration.edit_token !== token) {
    return NextResponse.redirect(`${EVENT.siteUrl}/nevezes`);
  }

  const locale: "hu" | "en" = registration.locale === "en" ? "en" : "hu";
  const koszonjukPath = locale === "en" ? "/en/nevezes/koszonjuk" : "/nevezes/koszonjuk";

  // Already paid (e.g. the athlete already finished a later attempt, or
  // clicked an old reminder link twice) — just show the confirmation page
  // instead of charging a second time.
  if (registration.status === "paid") {
    return NextResponse.redirect(`${EVENT.siteUrl}${koszonjukPath}?rid=${id}`);
  }
  // Waitlisted or cancelled rows never get a checkout session (waitlist has
  // no capacity reserved yet; cancelled is cancelled) — send them to the
  // edit page instead of silently failing.
  if (registration.status !== "pending_payment") {
    return NextResponse.redirect(`${EVENT.siteUrl}/nevezes/szerkesztes/${id}?token=${token}`);
  }

  const currency: "HUF" | "EUR" = registration.currency === "EUR" ? "EUR" : "HUF";
  const fees = locale === "en" ? EVENT.feesEur : EVENT.fees;

  const stripeUrl = await createCheckoutSession({
    registrationId: id,
    email: registration.email,
    entryFee: registration.entry_fee,
    wantsShirt: registration.wants_shirt,
    premiumMedia: registration.premium_media,
    premiumMediaFee: fees.premiumMedia,
    currency,
    locale,
    inviteCode: null,
  });

  if (!stripeUrl) {
    // STRIPE_SECRET_KEY isn't configured (e.g. this preview deployment) —
    // fall back to the edit page rather than a dead redirect.
    return NextResponse.redirect(`${EVENT.siteUrl}/nevezes/szerkesztes/${id}?token=${token}`);
  }

  return NextResponse.redirect(stripeUrl);
}
