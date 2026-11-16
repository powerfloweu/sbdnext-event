import type { SupabaseClient } from "@supabase/supabase-js";

import type { LeaderboardCategory, LeaderboardRow } from "@/lib/sheets";

// Real SBD Next 2 entrants, shaped the same way the old SBD Next 1 Google
// Sheets CSV feed (lib/sheets.ts) used to be — see app/page.tsx. No e-mail,
// no birth year: this is public data. "group" (flight) isn't assigned this
// far before the event (see lib/phase.ts "closed" phase), so it's left
// unset here rather than guessed at.
interface EntryRow {
  last_name: string;
  first_name: string;
  club: string | null;
  division: string;
  sex: string;
  opener_squat: number | null;
  opener_bench: number | null;
  opener_deadlift: number | null;
}

function categoryFor(division: string, sex: string): LeaderboardCategory | null {
  if (division === "Újonc" && sex === "Nő") return "ujoncNoi";
  if (division === "Újonc" && sex === "Férfi") return "ujoncFerfi";
  if (division === "Versenyző" && sex === "Nő") return "versenyzoNoi";
  if (division === "Versenyző" && sex === "Férfi") return "versenyzoFerfi";
  return null;
}

export async function getPublicEntryLists(
  admin: SupabaseClient
): Promise<Record<LeaderboardCategory, LeaderboardRow[]>> {
  const empty: Record<LeaderboardCategory, LeaderboardRow[]> = {
    ujoncNoi: [],
    ujoncFerfi: [],
    versenyzoNoi: [],
    versenyzoFerfi: [],
  };

  const { data, error } = await admin
    .from("registrations")
    .select("last_name, first_name, club, division, sex, opener_squat, opener_bench, opener_deadlift")
    .eq("is_preview_test", false)
    .neq("status", "cancelled")
    .returns<EntryRow[]>();

  if (error || !data) {
    console.error("getPublicEntryLists query failed:", error);
    return empty;
  }

  for (const row of data) {
    const category = categoryFor(row.division, row.sex);
    if (!category) continue;
    const total = (row.opener_squat ?? 0) + (row.opener_bench ?? 0) + (row.opener_deadlift ?? 0);
    empty[category].push({
      name: `${row.last_name} ${row.first_name}`.trim(),
      club: row.club ?? "",
      total,
      group: "",
    });
  }

  for (const category of Object.keys(empty) as LeaderboardCategory[]) {
    empty[category].sort((a, b) => b.total - a.total);
  }

  return empty;
}

export function totalEntryCount(lists: Record<LeaderboardCategory, LeaderboardRow[]>): number {
  return Object.values(lists).reduce((sum, rows) => sum + rows.length, 0);
}
