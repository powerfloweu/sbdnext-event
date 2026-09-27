import { NextRequest, NextResponse } from "next/server";

import { EVENT } from "@/config/event";
import { getAllLeaderboards } from "@/lib/sheets";
import { registrationSchema } from "@/lib/validation/registration";

// Kept from the live site: this is where registrations have always been
// forwarded (Google Sheets, via Make). Moving the call here — server-side —
// fixes two things the old client-side call had: the webhook URL is no
// longer shipped in the client bundle, and a failed webhook call now
// actually stops the flow instead of being swallowed and redirecting to
// Stripe anyway. See docs/UI_UX_ROBUSTNESS_PLAN.md findings C2/C3.
//
// Phase 2 of the plan replaces this with a real Supabase insert once the
// organiser has a project set up; until then this keeps the exact same
// external behaviour the production site already has.
const REGISTRATION_WEBHOOK_URL = "https://hook.eu1.make.com/6vbe2dxien274ohy91ew22lp9bbfzrl3";

// Very small in-memory rate limit. Good enough for a single instance / a
// preview deployment; Phase 2 upgrades this to Upstash or similar once the
// site runs on real infrastructure (a fresh instance resets this map).
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
  const utm = typeof (body as Record<string, unknown>).utm === "string" ? (body as Record<string, unknown>).utm : "";

  const leaderboards = await getAllLeaderboards();
  const totalRegistered = Object.values(leaderboards).reduce((sum, rows) => sum + rows.length, 0);
  const waitlisted = totalRegistered >= EVENT.registration.capacity;

  const registrationId = crypto.randomUUID();
  const fullName = `${data.lastName.trim()} ${data.firstName.trim()}`.trim();

  const payload = {
    timestamp: new Date().toISOString(),
    registrationId,
    name: fullName,
    ...data,
    honeypot: undefined,
    paymentOption: data.premiumMedia ? "premium" : "base",
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
    // Do NOT return a stripeUrl here — an athlete must never be sent to pay
    // without a stored registration. See finding C2.
    return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
  }

  if (waitlisted) {
    return NextResponse.json({ ok: true, registrationId, waitlisted: true });
  }

  const base = data.premiumMedia ? EVENT.stripe.premium : EVENT.stripe.base;
  const stripeUrl = new URL(base);
  stripeUrl.searchParams.set("prefilled_email", data.email);
  stripeUrl.searchParams.set("client_reference_id", registrationId);

  return NextResponse.json({ ok: true, registrationId, stripeUrl: stripeUrl.toString() });
}
