import { cookies } from "next/headers";

import { isAdminSession } from "@/lib/admin-auth";

// Lets an allowlisted admin (D, Miki) walk through the live /nevezes wizard
// before the real opening — started/stopped from the /admin "Teszt nevezés"
// tab (see app/admin/actions.ts). The cookie alone grants nothing: every
// read re-verifies the Supabase admin session, so it can't be forged by a
// non-admin. Consuming code must also flag the resulting registration as
// is_preview_test and skip real side effects (Sheet webhook, Stripe charge)
// — see app/api/register/route.ts.
export const ADMIN_TEST_COOKIE = "admin_test_mode";

export async function isAdminTestActive(): Promise<boolean> {
  const jar = await cookies();
  if (jar.get(ADMIN_TEST_COOKIE)?.value !== "1") return false;
  return isAdminSession();
}
