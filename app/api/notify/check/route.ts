import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

// Checked by the early-access gate (components/forms/early-access-gate.tsx)
// during the registration.earlyAccessOpensAt–opensAt window: lets someone
// confirm their own e-mail is in notify_signups to unlock the wizard an
// hour early. Only ever answers for the e-mail the caller already typed in
// — it can't be used to enumerate subscribers — so the same light rate
// limit as /api/prior-registration is enough to stop brute-forcing one
// address.
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ subscribed: false }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ subscribed: false }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ subscribed: false });

  const { data, error } = await admin
    .from("notify_signups")
    .select("email")
    .ilike("email", email)
    .maybeSingle();
  if (error) console.error("notify check lookup failed:", error);

  return NextResponse.json({ subscribed: !!data });
}
