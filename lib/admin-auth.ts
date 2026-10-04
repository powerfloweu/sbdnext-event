import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { isAdminEmail } from "@/config/admin";

// Re-checks the allowlisted-admin session inside a Server Action or Route
// Handler. middleware.ts already guards every request under /admin/*, but
// Server Actions and the /api/admin/* export routes are reachable directly,
// so this is the defense-in-depth check for those call sites.
export async function requireAdmin(): Promise<void> {
  const auth = await getSupabaseServerAuth();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    throw new Error("Nincs jogosultság.");
  }
}
