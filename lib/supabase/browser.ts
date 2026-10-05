"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client for auth only (magic link sign-in) — uses the
// publishable/anon key, safe to expose. Never used for data access; the
// admin dashboard reads through the service-role client on the server.
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
