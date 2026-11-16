import { NextRequest, NextResponse } from "next/server";

import { EVENT } from "@/config/event";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendEarlyAccessOpenNotification } from "@/lib/email";

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
const BATCH_SIZE = 40;

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

  // Only people who actually qualify for early access (signed up before the
  // window opened — see lib/early-access.ts) get this e-mail; anyone who
  // subscribes after that just waits for the general "registration is open"
  // notification like everyone else.
  const { data: rows, error } = await admin
    .from("notify_signups")
    .select("id, email, locale")
    .is("early_notified_at", null)
    .lt("created_at", EVENT.registration.earlyAccessOpensAt)
    .limit(BATCH_SIZE);

  if (error) {
    console.error("early-access dispatch query failed:", error);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    try {
      await sendEarlyAccessOpenNotification(row.email, row.locale === "en" ? "en" : "hu");
      const { error: updateError } = await admin
        .from("notify_signups")
        .update({ early_notified_at: new Date().toISOString() })
        .eq("id", row.id);
      if (updateError) throw updateError;
      sent += 1;
    } catch (err) {
      console.error("early-access dispatch send failed for", row.email, err);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, remaining: (rows?.length ?? 0) === BATCH_SIZE });
}
