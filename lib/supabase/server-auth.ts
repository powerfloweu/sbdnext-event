import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client that reads/writes the auth session cookie —
// for checking who's logged in (app/admin, middleware, the auth callback).
// Separate from lib/supabase/server.ts's service-role client, which is for
// data access and never touches cookies/sessions.
export async function getSupabaseServerAuth() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — middleware refreshes
          // the session instead, so this is safe to ignore.
        }
      },
    },
  });
}
