import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

export const revalidate = 300;

// Club name suggestions for the registration form's autocomplete — pooled
// from this year's registrations so far and last year's (prior_year_registrations).
// The field stays free text either way (see lib/validation/registration),
// this only helps people spot their club instead of retyping it slightly
// differently each time.
export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ clubs: [] });

  const [current, prior] = await Promise.all([
    admin.from("registrations").select("club").not("club", "is", null),
    admin.from("prior_year_registrations").select("club").not("club", "is", null),
  ]);

  const clubs = new Set<string>();
  for (const row of [...(current.data ?? []), ...(prior.data ?? [])]) {
    const club = (row as { club: string | null }).club?.trim();
    if (club) clubs.add(club);
  }

  return NextResponse.json({ clubs: Array.from(clubs).sort((a, b) => a.localeCompare(b, "hu")) });
}
