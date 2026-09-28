import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendNotifySignupConfirmedEmail } from "@/lib/email";
import { notifySignupSchema } from "@/lib/validation/notify";

// "Notify me when registration opens" signup, collected during the
// announced phase. Stored in Supabase; app/api/notify/dispatch emails
// everyone here once, the moment the event's phase becomes "registration".
//
// Degrades gracefully without Supabase configured: still validates and
// responds successfully, it just can't remember the signup or ever notify
// anyone — matches the pattern used by the volunteer/weight routes.
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
      return NextResponse.json({ ok: true });
    }
  }

  const parsed = notifySignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  const admin = getSupabaseAdmin();
  if (admin) {
    // Upsert on email: signing up twice is a no-op, not an error.
    const { error } = await admin
      .from("notify_signups")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
    if (error) {
      console.error("notify signup insert failed:", error);
      return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
    }
  }

  try {
    await sendNotifySignupConfirmedEmail(email);
  } catch (err) {
    console.error("notify signup confirmation email failed:", err);
  }

  return NextResponse.json({ ok: true, demo: !admin });
}
