import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

// "Tavaly már versenyeztél?" prefill lookup. No verification step (per the
// organiser's explicit call — this is prefill convenience, not an
// authenticated account system), and returns nothing on a miss.
// Rate-limited like /api/register since this otherwise lets anyone probe
// arbitrary emails/names against last year's private roster.
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

// Accent/case-insensitive comparison — Postgres ILIKE doesn't fold accents,
// and Hungarian names (é, ő, ü…) need that to match reliably.
function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

type PriorYearRow = {
  last_name: string;
  first_name: string;
  birth_year: number | null;
  club: string | null;
  sex: string;
  division: string;
  bodyweight: number | null;
  opener_squat: number | null;
  opener_bench: number | null;
  opener_deadlift: number | null;
  shirt_cut: string | null;
  shirt_size: string | null;
  premium_media: boolean | null;
};

const SELECT_FIELDS =
  "last_name, first_name, birth_year, club, sex, division, bodyweight, opener_squat, opener_bench, opener_deadlift, shirt_cut, shirt_size, premium_media";

function toPrefillData(data: PriorYearRow) {
  return {
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
  };
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ found: false }, { status: 429 });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const lastName = req.nextUrl.searchParams.get("lastName")?.trim();
  const firstName = req.nextUrl.searchParams.get("firstName")?.trim();
  const birthYear = req.nextUrl.searchParams.get("birthYear")?.trim();

  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ found: false });

  if (email && email.includes("@")) {
    const { data, error } = await admin
      .from("prior_year_registrations")
      .select(SELECT_FIELDS)
      .ilike("email", email)
      .maybeSingle();
    if (error) console.error("prior-registration email lookup failed:", error);
    if (data) return NextResponse.json({ found: true, data: toPrefillData(data) });
  }

  // Fallback: returning athletes who typed a different e-mail this year.
  // Only prefills on an exact (accent/case-insensitive) first+last name
  // match AND a matching birth year — two unverified fields instead of one,
  // to keep this from matching on name alone.
  if (lastName && firstName && birthYear && /^\d{4}$/.test(birthYear)) {
    const { data, error } = await admin
      .from("prior_year_registrations")
      .select(SELECT_FIELDS)
      .eq("birth_year", Number(birthYear))
      .returns<PriorYearRow[]>();
    if (error) console.error("prior-registration name lookup failed:", error);
    const target = normalizeName(`${lastName} ${firstName}`);
    const match = (data ?? []).find((row) => normalizeName(`${row.last_name} ${row.first_name}`) === target);
    if (match) return NextResponse.json({ found: true, data: toPrefillData(match) });
  }

  return NextResponse.json({ found: false });
}
