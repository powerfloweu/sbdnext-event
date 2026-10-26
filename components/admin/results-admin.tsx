"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatKg } from "@/lib/format";
import { SBD_NEXT_1_RESULTS, type ResultDivisionKey } from "@/lib/results/sbd-next-1";

const DIVISION_LABELS: Record<ResultDivisionKey, string> = {
  womensLifter: "Női versenyző",
  womensRookie: "Női újonc",
  mensLifter: "Férfi versenyző",
  mensRookie: "Férfi újonc",
};

const DIVISION_ORDER: ResultDivisionKey[] = ["womensLifter", "womensRookie", "mensLifter", "mensRookie"];

interface FlatRow {
  division: ResultDivisionKey;
  place: number | null;
  name: string;
  team: string | null;
  bodyWeight: number | null;
  total: number | null;
  glPoints: number | null;
}

const ALL_ROWS: FlatRow[] = DIVISION_ORDER.flatMap((division) =>
  SBD_NEXT_1_RESULTS[division].map((row) => ({
    division,
    place: row.place,
    name: row.name,
    team: row.team,
    bodyWeight: row.bodyWeight,
    total: row.total,
    glPoints: row.glPoints,
  }))
);

export function ResultsAdmin() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ROWS;
    return ALL_ROWS.filter(
      (row) => row.name.toLowerCase().includes(q) || (row.team ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">SBD Next I Eredmények ({filtered.length})</h2>
      </div>

      <div className="relative mb-3 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Keresés: név, egyesület…"
          className="pl-9"
        />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Kategória</th>
              <th className="p-3">Hely</th>
              <th className="p-3">Név</th>
              <th className="p-3">Egyesület</th>
              <th className="p-3">Testsúly</th>
              <th className="p-3">Total</th>
              <th className="p-3">GL pont</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-muted-foreground">
                  Nincs a keresésnek megfelelő versenyző.
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr key={row.name + row.division + idx}>
                  <td className="p-3 text-muted-foreground">{DIVISION_LABELS[row.division]}</td>
                  <td className="p-3 font-medium">{row.place ?? "—"}</td>
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3 text-muted-foreground">{row.team || "—"}</td>
                  <td className="p-3 whitespace-nowrap">{row.bodyWeight ? formatKg(row.bodyWeight) : "—"}</td>
                  <td className="p-3 whitespace-nowrap">{row.total !== null ? formatKg(row.total) : "—"}</td>
                  <td className="p-3 whitespace-nowrap font-semibold text-primary">
                    {row.glPoints !== null ? row.glPoints : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
