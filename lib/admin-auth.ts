import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { isAdminEmail } from "@/config/admin";

// Non-throwing version of requireAdmin, for call sites (e.g. the public
// /nevezes page) that need to branch on admin-ness rather than reject.
export async function isAdminSession(): Promise<boolean> {
  const auth = await getSupabaseServerAuth();
  const {
    data: { user },
  } = await auth.auth.getUser();
  return isAdminEmail(user?.email);
}

// Re-checks the allowlisted-admin session inside a Server Action or Route
// Handler. middleware.ts already guards every request under /admin/*, but
// Server Actions and the /api/admin/* export routes are reachable directly,
// so this is the defense-in-depth check for those call sites.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    throw new Error("Nincs jogosultság.");
  }
}
