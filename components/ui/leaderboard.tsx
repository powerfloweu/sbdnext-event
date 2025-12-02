"use client";

import { useEffect, useState } from "react";

type View = "novice_all" | "open_all";

type Row = {
  name: string;
  club: string;
  total: number;
};

// Google Sheets CSV URLs
const NOVICE_FEMALE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=1482153429&single=true&output=csv";

const NOVICE_MALE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=862629266&single=true&output=csv";

const OPEN_FEMALE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=672992038&single=true&output=csv";

const OPEN_MALE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=1696060010&single=true&output=csv";

// Parse a simple 3-column CSV: Név, Egyesület, Nevezési total
function parseCsv(text: string): Row[] {
  const lines = text.trim().split("\n");
  const rows: Row[] = [];

  // line 0 = header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    const name = (parts[0] || "").trim();
    const club = (parts[1] || "").trim();
    const totalStr = (parts[2] || "").trim().replace(",", ".");
    const total = Number(totalStr) || 0;

    if (!name) continue;

    rows.push({ name, club, total });
  }

  return rows;
}

async function fetchRows(url: string): Promise<Row[]> {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  return parseCsv(text);
}

export function Leaderboard({ view }: { view: View }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let combined: Row[] = [];

        if (view === "novice_all") {
          const [female, male] = await Promise.all([
            fetchRows(NOVICE_FEMALE_URL),
            fetchRows(NOVICE_MALE_URL),
          ]);
          combined = [...female, ...male];
        } else {
          const [female, male] = await Promise.all([
            fetchRows(OPEN_FEMALE_URL),
            fetchRows(OPEN_MALE_URL),
          ]);
          combined = [...female, ...male];
        }

        // Sort by total in descending order
        combined.sort((a, b) => b.total - a.total);

        setRows(combined);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [view]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">
        {view === "novice_all"
          ? "Újonc nevezési lista (online)"
          : "Versenyző nevezési lista (online)"}
      </h2>

      {loading && (
        <p className="mb-2 text-sm text-zinc-400">Lista frissítése…</p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-zinc-200">
          <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
            <tr>
              <th className="py-2 pr-4 text-left">#</th>
              <th className="py-2 pr-4 text-left">Név</th>
              <th className="py-2 pr-4 text-left">Egyesület</th>
              <th className="py-2 pl-4 text-right">Nevezési total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={`${r.name}-${idx}`} className="border-b border-zinc-900/70">
                <td className="py-1 pr-4 text-zinc-500">{idx + 1}</td>
                <td className="py-1 pr-4">{r.name}</td>
                <td className="py-1 pr-4 text-zinc-400">{r.club}</td>
                <td className="py-1 pl-4 text-right font-semibold">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 && (
        <p className="mt-3 text-sm text-zinc-400">
          Jelenleg nincs megjeleníthető nevezés ebben a listában.
        </p>
      )}
    </div>
  );
}