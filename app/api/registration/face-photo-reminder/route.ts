import { NextRequest, NextResponse } from "next/server";

import { EVENT } from "@/config/event";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendFacePhotoReminderEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called daily by Vercel Cron (see vercel.json), same pattern as
// /api/notify/dispatch. The face photo is optional at registration time
// (D, 2026-10-30) — this nudges anyone still missing one once the event is
// 2 weeks out, and only ever e-mails a given registration once
// (face_photo_reminder_sent_at). A no-op outside that 2-week window, and
// before the event's first day — no point reminding after it's started.
const REMINDER_WINDOW_DAYS = 14;
const BATCH_SIZE = 25;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured yet — matches this repo's "degrade gracefully" pattern
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function reminderWindowOpen(now: Date): boolean {
  const first = EVENT.days[0];
  const eventStart = new Date(`${first.date}T${first.start}:00+01:00`);
  const reminderFrom = new Date(eventStart.getTime() - REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return now >= reminderFrom && now < eventStart;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!reminderWindowOpen(new Date())) {
    return NextResponse.json({ ok: true, skipped: "outside_reminder_window" });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, skipped: "storage_not_configured" });
  }

  const { data: rows, error } = await admin
    .from("registrations")
    .select("id, email, first_name, edit_token")
    .is("face_photo_path", null)
    .is("face_photo_reminder_sent_at", null)
    .eq("is_preview_test", false)
    .neq("status", "cancelled")
    .not("edit_token", "is", null)
    .limit(BATCH_SIZE);

  if (error) {
    console.error("face-photo-reminder query failed:", error);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    try {
      await sendFacePhotoReminderEmail({
        email: row.email,
        firstName: row.first_name,
        editUrl: `${EVENT.siteUrl}/nevezes/szerkesztes/${row.id}?token=${row.edit_token}`,
      });
      const { error: updateError } = await admin
        .from("registrations")
        .update({ face_photo_reminder_sent_at: new Date().toISOString() })
        .eq("id", row.id);
      if (updateError) throw updateError;
      sent += 1;
    } catch (err) {
      console.error("face-photo-reminder send failed for", row.email, err);
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, remaining: (rows?.length ?? 0) === BATCH_SIZE });
}
