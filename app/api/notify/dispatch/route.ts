import { NextRequest, NextResponse } from "next/server";

import { getPhase } from "@/lib/phase";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendRegistrationOpenNotification } from "@/lib/email";

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
const BATCH_SIZE = 25;

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

  const { data: rows, error } = await admin
    .from("notify_signups")
    .select("id, email, locale")
    .is("notified_at", null)
    .limit(BATCH_SIZE);

  if (error) {
    console.error("notify dispatch query failed:", error);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    try {
      await sendRegistrationOpenNotification(row.email, row.locale === "en" ? "en" : "hu");
      const { error: updateError } = await admin
        .from("notify_signups")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", row.id);
      if (updateError) throw updateError;
      sent += 1;
    } catch (err) {
      console.error("notify dispatch send failed for", row.email, err);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, remaining: (rows?.length ?? 0) === BATCH_SIZE });
}
