import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { dispatchEarlyAccessBatch } from "@/lib/notify-dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Not on a Vercel Cron schedule — unlike app/api/notify/dispatch, this is a
// one-off heads-up ("your early access opens in 10 minutes") tied to a
// single moment (registration.earlyAccessOpensAt) rather than a phase that
// holds for weeks, so it's triggered manually (or by a one-time scheduled
// job) a few minutes before that moment instead of polling for it daily.
// Idempotent and safe to call repeatedly: only ever e-mails a given signup
// once (early_notified_at gets set right after a successful send), and
// batches so one invocation can't run long enough to hit a serverless
// function timeout — call again if the response says `remaining: true`.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured yet — allow, matches this repo's "degrade gracefully" pattern
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, skipped: "storage_not_configured" });
  }

  try {
    const result = await dispatchEarlyAccessBatch(admin);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("early-access dispatch failed:", err);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }
}
