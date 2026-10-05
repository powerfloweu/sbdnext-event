import { NextRequest, NextResponse } from "next/server";

import { EVENT } from "@/config/event";
import { getAllLeaderboards } from "@/lib/sheets";
import { registrationSchema } from "@/lib/validation/registration";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { sendRegistrationReceivedEmail } from "@/lib/email";

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
      .neq("status", "cancelled");
    if (!error && typeof count === "number") return count;
    console.error("Supabase count failed, falling back to Sheets:", error);
  }
  // Fallback while Supabase isn't configured yet.
  const leaderboards = await getAllLeaderboards();
  return Object.values(leaderboards).reduce((sum, rows) => sum + rows.length, 0);
}

// Face photos are compressed client-side to a small JPEG before this ever
// runs (see lib/client-image.ts), so this is a safety cap, not the primary
// size control.
const MAX_FACE_PHOTO_BYTES = 8 * 1024 * 1024;

async function uploadFacePhoto(registrationId: string, dataUrl: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_FACE_PHOTO_BYTES) return null;

  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `${registrationId}.${ext}`;

  const { error } = await admin.storage.from("athlete-face-photos").upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });
  if (error) {
    console.error("face photo upload failed:", error);
    return null;
  }
  return path;
}

interface CheckoutSessionParams {
  registrationId: string;
  email: string;
  entryFee: number;
  wantsShirt: boolean;
  premiumMedia: boolean;
}

async function createCheckoutSession(params: CheckoutSessionParams): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const lineItems = [
    {
      quantity: 1,
      price_data: {
        currency: "huf",
        unit_amount: params.entryFee * 100, // HUF is a two-decimal currency for charges
        product_data: {
          name: params.wantsShirt ? "SBD Next 2 — nevezés + póló" : "SBD Next 2 — nevezés",
        },
      },
    },
  ];
  if (params.premiumMedia) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "huf",
        unit_amount: EVENT.fees.premiumMedia * 100,
        product_data: { name: "SBD Next 2 — Prémium média csomag" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: params.email,
    client_reference_id: params.registrationId,
    metadata: { registrationId: params.registrationId },
    success_url: `${EVENT.siteUrl}/nevezes/koszonjuk?rid=${params.registrationId}`,
    cancel_url: `${EVENT.siteUrl}/nevezes/megszakitva`,
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

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ ok: false, error: "validation", fieldErrors }, { status: 400 });
  }

  const data = parsed.data;
  const raw = body as Record<string, unknown>;
  const utm = typeof raw.utm === "string" ? raw.utm : "";
  const facePhotoDataUrl = typeof raw.facePhoto === "string" ? raw.facePhoto : null;

  const totalRegistered = await getRegisteredCount();
  const waitlisted = totalRegistered >= EVENT.registration.capacity;

  const registrationId = crypto.randomUUID();
  const fullName = `${data.lastName.trim()} ${data.firstName.trim()}`.trim();
  const entryFee = data.wantsShirt ? EVENT.fees.entryWithShirt : EVENT.fees.entryBase;
  const totalFee = entryFee + (data.premiumMedia ? EVENT.fees.premiumMedia : 0);

  const facePhotoPath = facePhotoDataUrl
    ? await uploadFacePhoto(registrationId, facePhotoDataUrl)
    : null;

  const supabaseAdmin = getSupabaseAdmin();
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
      utm,
      raw: data,
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
  // flow before going live) must never write test entries into the real
  // Google Sheet that Make forwards to.
  if (process.env.VERCEL_ENV !== "preview") {
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
    });
  } catch (err) {
    console.error("registration confirmation email failed:", err);
  }

  if (waitlisted) {
    return NextResponse.json({ ok: true, registrationId, waitlisted: true });
  }

  const stripeUrl = await createCheckoutSession({
    registrationId,
    email: data.email,
    entryFee,
    wantsShirt: data.wantsShirt,
    premiumMedia: data.premiumMedia,
  });

  // Demo mode: no STRIPE_SECRET_KEY configured yet. The wizard falls back
  // to the "köszönjük" page instead of a real payment redirect.
  return NextResponse.json({ ok: true, registrationId, stripeUrl, demo: !stripeUrl });
}
