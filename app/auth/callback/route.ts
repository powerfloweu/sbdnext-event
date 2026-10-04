import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";

// Where Supabase sends people after they click the magic-link email —
// exchanges the one-time code for a real session cookie, then continues to
// wherever they were headed (default /admin).
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await getSupabaseServerAuth();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, req.url));
}
