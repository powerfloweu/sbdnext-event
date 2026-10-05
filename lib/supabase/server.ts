import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only. Uses the service role key, which bypasses RLS — never import
// this from a client component. Returns null when the project isn't
// configured yet so callers can degrade gracefully (see README "Environment
// variables").
let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    cached = null;
    return cached;
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cached;
}
