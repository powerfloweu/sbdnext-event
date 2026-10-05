import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

// "Tavaly már versenyeztél?" prefill lookup. Exact email match only, no
// verification step (per the organiser's explicit call — this is prefill
// convenience, not an authenticated account system), and returns nothing on
// a miss. Rate-limited like /api/register since this otherwise lets anyone
// probe arbitrary emails against last year's private roster.
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ found: false }, { status: 429 });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ found: false });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ found: false });

  const { data, error } = await admin
    .from("prior_year_registrations")
    .select(
      "last_name, first_name, birth_year, club, sex, division, bodyweight, opener_squat, opener_bench, opener_deadlift, shirt_cut, shirt_size, premium_media"
    )
    .ilike("email", email)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("prior-registration lookup failed:", error);
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    data: {
      lastName: data.last_name,
      firstName: data.first_name,
      birthYear: data.birth_year ? String(data.birth_year) : "",
      club: data.club ?? "",
      sex: data.sex,
      division: data.division,
      bodyweight: data.bodyweight != null ? String(data.bodyweight) : "",
      openerSquat: data.opener_squat != null ? String(data.opener_squat) : "",
      openerBench: data.opener_bench != null ? String(data.opener_bench) : "",
      openerDeadlift: data.opener_deadlift != null ? String(data.opener_deadlift) : "",
      shirtCut: data.shirt_cut ?? undefined,
      shirtSize: data.shirt_size ?? undefined,
      premiumMedia: !!data.premium_media,
    },
  });
}
