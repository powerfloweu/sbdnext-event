import { NextRequest, NextResponse } from "next/server";

import { getPhase } from "@/lib/phase";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { dispatchRegistrationOpenBatch } from "@/lib/notify-dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called on a schedule by Vercel Cron (see vercel.json). Idempotent and
// cheap to call repeatedly: it only ever emails a given signup once
// (notified_at gets set right after a successful send), and it's a no-op
// entirely until the event's phase actually becomes "registration".
//
// Processes signups in small batches per run so a single invocation can't
// run long enough to hit a serverless function timeout; a backlog just
// gets picked up on the next scheduled run.

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured yet — allow, matches this repo's "degrade gracefully" pattern
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (getPhase() !== "registration") {
    return NextResponse.json({ ok: true, skipped: "phase_not_registration" });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, skipped: "storage_not_configured" });
  }

  try {
    const result = await dispatchRegistrationOpenBatch(admin);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("notify dispatch failed:", err);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }
}
