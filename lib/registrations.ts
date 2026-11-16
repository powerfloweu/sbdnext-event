// Public entrant counter + lists for the homepage, sourced directly from the
// `registrations` table (the system of record since the Supabase migration)
// instead of the SBD Next 1-era Google Sheets CSVs in lib/sheets.ts.

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAllLeaderboards } from "@/lib/sheets";

export type EntrantCategory = "ujoncNoi" | "ujoncFerfi" | "versenyzoNoi" | "versenyzoFerfi";

export type EntrantRow = {
  name: string;
  club: string;
  total: number;
};

const EMPTY_LISTS: Record<EntrantCategory, EntrantRow[]> = {
  ujoncNoi: [],
  ujoncFerfi: [],
  versenyzoNoi: [],
  versenyzoFerfi: [],
};

function categoryOf(sex: string, division: string): EntrantCategory | null {
  if (division === "Újonc") return sex === "Nő" ? "ujoncNoi" : sex === "Férfi" ? "ujoncFerfi" : null;
  if (division === "Versenyző") return sex === "Nő" ? "versenyzoNoi" : sex === "Férfi" ? "versenyzoFerfi" : null;
  return null;
}

// Capacity counter: every non-cancelled, non-preview/test registration
// (pending payment + waitlist + paid), matching the limit check in
// app/api/register/route.ts.
export async function getRegisteredCount(): Promise<number> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { count, error } = await admin
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .neq("status", "cancelled")
      .eq("is_preview_test", false);
    if (!error && typeof count === "number") return count;
    console.error("Supabase count failed, falling back to Sheets:", error);
  }
  // Fallback while Supabase isn't configured yet.
  const leaderboards = await getAllLeaderboards();
  return Object.values(leaderboards).reduce((sum, rows) => sum + rows.length, 0);
}

// Public "who's registered so far" lists: only confirmed (paid) entries,
// never cancelled, waitlisted, preview or admin-test rows. Grouped by
// division + sex and ranked by declared total, same as the SBD Next 1
// homepage leaderboard — no weight classes, since placing is by IPF GL
// points.
export async function getPublicEntrantsLists(): Promise<Record<EntrantCategory, EntrantRow[]>> {
  const admin = getSupabaseAdmin();
  if (!admin) return EMPTY_LISTS;

  const { data, error } = await admin
    .from("registrations")
    .select("first_name, last_name, club, sex, division, opener_squat, opener_bench, opener_deadlift")
    .eq("status", "paid")
    .eq("is_preview_test", false);

  if (error || !data) {
    console.error("Supabase entrants query failed:", error);
    return EMPTY_LISTS;
  }

  const result: Record<EntrantCategory, EntrantRow[]> = {
    ujoncNoi: [],
    ujoncFerfi: [],
    versenyzoNoi: [],
    versenyzoFerfi: [],
  };

  for (const row of data) {
    const key = categoryOf(row.sex, row.division);
    if (!key) continue;

    const total = (row.opener_squat ?? 0) + (row.opener_bench ?? 0) + (row.opener_deadlift ?? 0);
    const name = `${row.last_name ?? ""} ${row.first_name ?? ""}`.trim();
    if (!name) continue;

    result[key].push({ name, club: (row.club ?? "").trim(), total });
  }

  for (const key of Object.keys(result) as EntrantCategory[]) {
    result[key].sort((a, b) => b.total - a.total);
  }

  return result;
}
