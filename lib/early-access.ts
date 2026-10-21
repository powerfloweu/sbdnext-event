import type { SupabaseClient } from "@supabase/supabase-js";

import { EVENT } from "@/config/event";

// Counts someone as an early-access subscriber only if they signed up
// before the early-access window itself opened (registration.earlyAccessOpensAt).
// Without this cutoff, subscribing at 17:00 would be indistinguishable from
// having subscribed weeks earlier, and the whole "1h head start for
// existing subscribers" idea would mean nothing — anyone could just sign up
// on the spot and walk straight in.
//
// Used both by the client-facing check (app/api/notify/check) and, as the
// actual authority, by app/api/register — the gate on /nevezes is a UX
// nicety so people don't fill out the form only to be rejected; this is
// what actually decides whether an early submission is accepted.
export async function isEarlySubscriber(admin: SupabaseClient, email: string): Promise<boolean> {
  const { data, error } = await admin
    .from("notify_signups")
    .select("email")
    .ilike("email", email)
    .lt("created_at", EVENT.registration.earlyAccessOpensAt)
    .maybeSingle();
  if (error) {
    console.error("early-access subscriber lookup failed:", error);
    return false;
  }
  return !!data;
}
