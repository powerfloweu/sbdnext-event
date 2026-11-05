import { NextRequest, NextResponse } from "next/server";

import { EVENT } from "@/config/event";
import { getAllLeaderboards } from "@/lib/sheets";
import { buildRegistrationSchema, type RegistrationLocale } from "@/lib/validation/registration";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getPhase } from "@/lib/phase";
import { isEarlySubscriber } from "@/lib/early-access";
import { getStripe } from "@/lib/stripe";
import { sendRegistrationReceivedEmail } from "@/lib/email";
import { generateEditToken } from "@/lib/edit-token";
import { isAdminTestActive } from "@/lib/admin-test";
import { uploadFacePhoto } from "@/lib/face-photo";

// Lets a specific group (named by D, e.g. invited foreign athletes) register
// for real — counted toward capacity, charged for real — on a preview
// deployment before the public opening, without needing to go live. Set as
// a comma-separated list of secret codes in the Preview-scoped
// FOREIGN_INVITE_CODES env var on Vercel; unset means the gate never opens.
// See app/api/register/route.ts's use below and the project thread
// "Ellenőrizni az angol nevezési flót" (2026-11-04) for why this exists.
function isValidInviteCode(code: string | null): boolean {
  if (!code) return false;
  const codes = (process.env.FOREIGN_INVITE_CODES ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  return codes.includes(code);
}

// Kept from the live site: this is where registrations have always been
// forwarded (Google Sheets, via Make). Registrations are now also inserted
// into Supabase (the new system of record — see supabase/migrations), but
// the Make forward stays in place during the transition so nothing that
// currently depends on the Sheet breaks.
const REGISTRATION_WEBHOOK_URL = "https://hook.eu1.make.com/6vbe2dxien274ohy91ew22lp9bbfzrl3";

// Very small in-memory rate limit. Good enough for a single instance / a
// preview deployment; a real deployment should move this to Upstash or
// similar (a fresh instance resets this map).
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 8;

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

async function getRegisteredCount(): Promise<number> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { count, error } = await admin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .neq("status", "cancelled")
      .eq("is_preview_test", false);
    if (!error && typeof count === "number") return count;
    console.error("Supabase count failed, falling back to Sheets:", error);
  }
  // Fallback while Supabase isn't configured yet.
  const leaderboards = await getAllLeaderboards();
  return Object.values(leaderboards).reduce((sum, rows) => sum + rows.length, 0);
}

interface CheckoutSessionParams {
  registrationId: string;
  email: string;
  entryFee: number;
  wantsShirt: boolean;
  premiumMedia: boolean;
  premiumMediaFee: number;
  currency: "HUF" | "EUR";
  locale: RegistrationLocale;
  inviteCode: string | null;
}

async function createCheckoutSession(params: CheckoutSessionParams): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const currency = params.currency.toLowerCase();
  const entryName =
    params.locale === "en"
      ? params.wantsShirt
        ? "SBD Next 2 — entry + shirt"
        : "SBD Next 2 — entry"
      : params.wantsShirt
        ? "SBD Next 2 — nevezés + póló"
        : "SBD Next 2 — nevezés";

  const lineItems = [
    {
      quantity: 1,
      price_data: {
        currency,
        unit_amount: params.entryFee * 100, // both HUF and EUR are charged as a two-decimal amount on this account
        product_data: { name: entryName },
      },
    },
  ];
  if (params.premiumMedia) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: params.premiumMediaFee * 100,
        product_data: {
          name: params.locale === "en" ? "SBD Next 2 — Premium media package" : "SBD Next 2 — Prémium média csomag",
        },
      },
    });
  }

  const koszonjukPath = params.locale === "en" ? "/en/nevezes/koszonjuk" : "/nevezes/koszonjuk";
  const megszakitvaPath = params.locale === "en" ? "/en/nevezes/megszakitva" : "/nevezes/megszakitva";
  // The invite code only lives in the URL, not in any cookie/session, so it
  // has to be carried through the cancel redirect too — otherwise "try
  // payment again" on the EN cancelled page would bounce an invited athlete
  // back into the "registration hasn't started yet" notice.
  const codeQuery = params.inviteCode ? `&code=${encodeURIComponent(params.inviteCode)}` : "";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: params.email,
    client_reference_id: params.registrationId,
    metadata: { registrationId: params.registrationId },
    success_url: `${EVENT.siteUrl}${koszonjukPath}?rid=${params.registrationId}`,
    cancel_url: `${EVENT.siteUrl}${megszakitvaPath}?rid=${params.registrationId}${codeQuery}`,
  });

  return session.url;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof body === "object" && body !== null && "honeypot" in body) {
    const hp = (body as Record<string, unknown>).honeypot;
    if (typeof hp === "string" && hp.length > 0) {
      // Bots fill hidden fields. Pretend success so the bot moves on.
      return NextResponse.json({ ok: true, registrationId: crypto.randomUUID() });
    }
  }

  const raw = body as Record<string, unknown>;
  const locale: RegistrationLocale = raw.locale === "en" ? "en" : "hu";
  const inviteCode = typeof raw.inviteCode === "string" ? raw.inviteCode : null;
  const isInvited = isValidInviteCode(inviteCode);
  const currency: "HUF" | "EUR" = locale === "en" ? "EUR" : "HUF";
  const fees = locale === "en" ? EVENT.feesEur : EVENT.fees;

  const parsed = buildRegistrationSchema(locale).schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ ok: false, error: "validation", fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const utm = typeof raw.utm === "string" ? raw.utm : "";
  const facePhotoDataUrl = typeof raw.facePhoto === "string" ? raw.facePhoto : null;

  // Server-side authority for the registration window — the client-side
  // phase gate on /nevezes (including the EarlyAccessGate) is only a UX
  // nicety. Outside early-access/registration this always rejects. During
  // early-access, only an e-mail that was subscribed before the window
  // opened gets through (see lib/early-access) — checked here against the
  // submitted e-mail itself, not against whatever the client's gate cookie
  // claims, so passing the gate with one address and registering with
  // another doesn't work.
  const phase = getPhase();
  const supabaseAdmin = getSupabaseAdmin();
  // Lets an allowlisted admin (D/Miki) submit the real wizard any time
  // before the public opening, from /admin's "Teszt nevezés" tab —
  // re-verified here (cookie + live admin session), never trusted from the
  // client. Checked for "early-access" too (not just "announced"/"closed"/
  // "live"/"post"): otherwise an admin-test submission made during the 1h
  // early-access window hits the subscriber check below like a real
  // request would. Every side effect below treats this the same as a
  // Vercel Preview submission: flagged is_preview_test, no Sheet webhook,
  // no real Stripe charge.
  const adminTest = phase !== "registration" ? await isAdminTestActive() : false;
  if (phase !== "registration" && phase !== "early-access" && !adminTest && !isInvited) {
    return NextResponse.json({ ok: false, error: "registration_closed" }, { status: 403 });
  }
  if (phase === "early-access" && !adminTest && !isInvited) {
    const subscribed = supabaseAdmin ? await isEarlySubscriber(supabaseAdmin, data.email.trim()) : false;
    if (!subscribed) {
      return NextResponse.json({ ok: false, error: "early_access_required" }, { status: 403 });
    }
  }

  const totalRegistered = await getRegisteredCount();
  const waitlisted = totalRegistered >= EVENT.registration.capacity;

  const registrationId = crypto.randomUUID();
  const editToken = generateEditToken();
  const fullName = `${data.lastName.trim()} ${data.firstName.trim()}`.trim();
  const entryFee = data.wantsShirt ? fees.entryWithShirt : fees.entryBase;
  const totalFee = entryFee + (data.premiumMedia ? fees.premiumMedia : 0);

  const facePhotoPath =
    facePhotoDataUrl && supabaseAdmin ? await uploadFacePhoto(supabaseAdmin, registrationId, facePhotoDataUrl) : null;

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("registrations").insert({
      id: registrationId,
      status: waitlisted ? "waitlist" : "pending_payment",
      last_name: data.lastName.trim(),
      first_name: data.firstName.trim(),
      email: data.email.trim(),
      birth_year: Number(data.birthYear),
      sex: data.sex,
      division: data.division,
      club: data.club || null,
      bodyweight: Number(data.bodyweight.replace(",", ".")),
      opener_squat: Number(data.openerSquat.replace(",", ".")),
      opener_bench: Number(data.openerBench.replace(",", ".")),
      opener_deadlift: Number(data.openerDeadlift.replace(",", ".")),
      mc_text: data.mcText || null,
      notes: data.notes || null,
      wants_shirt: data.wantsShirt,
      shirt_cut: data.shirtCut ?? null,
      shirt_size: data.shirtSize ?? null,
      premium_media: data.premiumMedia,
      entry_fee: entryFee,
      total_fee: totalFee,
      face_photo_path: facePhotoPath,
      edit_token: editToken,
      utm,
      raw: data,
      locale,
      currency,
      // Preview deployments (e.g. this test branch) share the same Supabase
      // project as production — flag these rows so they never count toward
      // the real capacity cap and can be told apart from genuine entries.
      // An admin-test submission on production gets the same flag. A valid
      // invite code (see isValidInviteCode above) is the one exception: it
      // marks a real, capacity-counted registration even on a preview
      // deployment, for a group D explicitly invited ahead of the public
      // opening.
      is_preview_test: (process.env.VERCEL_ENV === "preview" || adminTest) && !isInvited,
    });
    if (error) {
      console.error("Supabase registration insert failed:", error);
      return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
    }
  }

  const payload = {
    timestamp: new Date().toISOString(),
    registrationId,
    name: fullName,
    ...data,
    honeypot: undefined,
    entryFee,
    totalFee,
    page: "/nevezes",
    utm,
    status: waitlisted ? "waitlist" : "pending_payment",
    statusText: waitlisted ? "várólistán" : "fizetésre vár",
    cap: {
      limit: EVENT.registration.capacity,
      used: totalRegistered,
      remaining: Math.max(EVENT.registration.capacity - totalRegistered, 0),
      full: waitlisted,
    },
  };

  // Preview deployments (e.g. a branch used to test the registration/payment
  // flow before going live), same as an admin-test submission on production,
  // must never write test entries into the real Google Sheet that Make
  // forwards to.
  if (process.env.VERCEL_ENV !== "preview" && !adminTest) {
    try {
      const resp = await fetch(REGISTRATION_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        throw new Error(`webhook status ${resp.status}`);
      }
    } catch (err) {
      console.error("registration webhook failed:", err);
      // Only a hard failure if Supabase isn't already our system of record —
      // once Supabase is configured the row above is the source of truth, so
      // a Make/Sheets hiccup shouldn't block a real registration. See finding
      // C2 in docs/UI_UX_ROBUSTNESS_PLAN.md for why this used to be fatal.
      if (!supabaseAdmin) {
        return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
      }
    }
  }

  try {
    await sendRegistrationReceivedEmail({
      email: data.email,
      firstName: data.firstName,
      waitlisted,
      totalFee,
      currency,
      locale,
      editUrl: `${EVENT.siteUrl}/nevezes/szerkesztes/${registrationId}?token=${editToken}`,
      summary: {
        lastName: data.lastName.trim(),
        firstName: data.firstName.trim(),
        division: data.division,
        sex: data.sex,
        birthYear: Number(data.birthYear),
        club: data.club || null,
        bodyweight: Number(data.bodyweight.replace(",", ".")),
        openerSquat: Number(data.openerSquat.replace(",", ".")),
        openerBench: Number(data.openerBench.replace(",", ".")),
        openerDeadlift: Number(data.openerDeadlift.replace(",", ".")),
        wantsShirt: data.wantsShirt,
        shirtCut: data.shirtCut ?? null,
        shirtSize: data.shirtSize ?? null,
        premiumMedia: data.premiumMedia,
      },
    });
  } catch (err) {
    console.error("registration confirmation email failed:", err);
  }

  if (waitlisted) {
    return NextResponse.json({ ok: true, registrationId, waitlisted: true });
  }

  // Admin-test never goes to a real Stripe Checkout — the connected Stripe
  // account has no test mode (see team memory), so a real charge is the
  // only alternative. The wizard falls back to the "köszönjük" page, same
  // as "demo" mode; the guide on the admin tab has Miki simulate the paid
  // step from there instead.
  const stripeUrl = adminTest
    ? null
    : await createCheckoutSession({
        registrationId,
        email: data.email,
        entryFee,
        wantsShirt: data.wantsShirt,
        premiumMedia: data.premiumMedia,
        premiumMediaFee: fees.premiumMedia,
        currency,
        locale,
        inviteCode,
      });

  // Demo mode: no STRIPE_SECRET_KEY configured yet. The wizard falls back
  // to the "köszönjük" page instead of a real payment redirect.
  return NextResponse.json({ ok: true, registrationId, stripeUrl, demo: !stripeUrl });
}
