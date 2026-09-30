import { EVENT } from "@/config/event";
import { parseCsv, parseCsvRecords } from "@/lib/csv";

export type LeaderboardCategory = keyof typeof EVENT.sheets.lists;

export type LeaderboardRow = {
  name: string;
  club: string;
  total: number;
  group: string;
};

export type ScheduleRow = {
  day: string;
  platform: string;
  gender: string;
  weighIn: string;
  start: string;
  end: string;
  groups: string;
};

async function fetchCsv(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  return res.text();
}

export function normalizeGroupName(input: string): string {
  return input
    .replace(/(\d+)-(es|ös)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getLeaderboard(category: LeaderboardCategory): Promise<LeaderboardRow[]> {
  try {
    const text = await fetchCsv(EVENT.sheets.lists[category]);
    const records = parseCsvRecords(text);
    return records
      .map((r) => {
        const name = r["Név"] ?? "";
        if (!name) return null;
        const totalRaw = (r["Nevezési total"] ?? "").replace(/\s/g, "").replace(",", ".");
        const total = Number(totalRaw);
        return {
          name,
          club: r["Egyesület"] ?? "",
          total: Number.isFinite(total) ? total : 0,
          group: normalizeGroupName(r["Csoport"] ?? ""),
        };
      })
      .filter((r): r is LeaderboardRow => r !== null)
      .sort((a, b) => b.total - a.total);
  } catch {
    return [];
  }
}

export async function getAllLeaderboards(): Promise<
  Record<LeaderboardCategory, LeaderboardRow[]>
> {
  const categories = Object.keys(EVENT.sheets.lists) as LeaderboardCategory[];
  const results = await Promise.all(categories.map((c) => getLeaderboard(c)));
  return Object.fromEntries(categories.map((c, i) => [c, results[i]])) as Record<
    LeaderboardCategory,
    LeaderboardRow[]
  >;
}

export async function getSchedule(): Promise<ScheduleRow[]> {
  try {
    const text = await fetchCsv(EVENT.sheets.schedule);
    const rows = parseCsv(text);
    const [, ...body] = rows; // skip header row (positional, no stable header names)
    return body
      .map((cells) => ({
        day: (cells[0] ?? "").trim(),
        platform: (cells[1] ?? "").trim(),
        gender: (cells[2] ?? "").trim(),
        weighIn: (cells[3] ?? "").trim(),
        start: (cells[4] ?? "").trim(),
        end: (cells[5] ?? "").trim(),
        groups: normalizeGroupName(cells.slice(6).join(", ")),
      }))
      .filter((r) => r.day && r.platform);
  } catch {
    return [];
  }
}
