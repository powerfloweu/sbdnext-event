import type { SupabaseClient } from "@supabase/supabase-js";

import { EVENT } from "@/config/event";
import { sendEarlyAccessOpenNotification, sendRegistrationOpenNotification } from "@/lib/email";

// Shared by the cron-triggered routes (app/api/notify/dispatch,
// app/api/notify/dispatch-early-access) and the admin "send now" buttons
// (app/admin/actions.ts) — one batch per call so a caller that needs
// everything sent (the admin actions) can just loop until `remaining` is
// false, while a caller on a schedule can let the next run pick up the rest.
const BATCH_SIZE = 40;

export interface DispatchBatchResult {
  sent: number;
  failed: number;
  remaining: boolean;
}

// Only people who actually qualify for early access (signed up before the
// window opened — see lib/early-access.ts) get this one; anyone who
// subscribes later just waits for the general notification below.
export async function dispatchEarlyAccessBatch(admin: SupabaseClient): Promise<DispatchBatchResult> {
  const { data: rows, error } = await admin
    .from("notify_signups")
    .select("id, email, locale")
    .is("early_notified_at", null)
    .lt("created_at", EVENT.registration.earlyAccessOpensAt)
    .limit(BATCH_SIZE);
  if (error) throw error;

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
  return { sent, failed, remaining: (rows?.length ?? 0) === BATCH_SIZE };
}

export async function dispatchRegistrationOpenBatch(admin: SupabaseClient): Promise<DispatchBatchResult> {
  const { data: rows, error } = await admin
    .from("notify_signups")
    .select("id, email, locale")
    .is("notified_at", null)
    .limit(BATCH_SIZE);
  if (error) throw error;

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
  return { sent, failed, remaining: (rows?.length ?? 0) === BATCH_SIZE };
}
