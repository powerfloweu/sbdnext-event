"use client";

import { useEffect, useState } from "react";

type ScheduleRow = {
  day: string;
  platform: string;
  gender: string;
  weighIn: string;
  start: string;
  end: string;
  groups: string;
};

const SCHEDULE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=540836351&single=true&output=csv";

function normalizeGroupName(input: string): string {
  return input
    .replace(/(\d+)-(es|ös)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsv(text: string): ScheduleRow[] {
  const lines = text.trim().split("\n");
  const rows: ScheduleRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");

    rows.push({
      day: parts[0]?.trim(),
      platform: parts[1]?.trim(),
      gender: parts[2]?.trim(),
      weighIn: parts[3]?.trim(),
      start: parts[4]?.trim(),
      end: parts[5]?.trim(),
      groups: normalizeGroupName(
        parts.slice(6).join(",").replace(/^"|"$/g, "").trim()
      ),
    });
  }

  return rows.filter(r => r.day && r.platform);
}

export function Schedule() {
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(SCHEDULE_URL, { cache: "no-store" })
      .then(r => r.text())
      .then(text => setRows(parseCsv(text)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full">
      {/* Disclaimer */}
      <p className="mb-6 max-w-2xl text-xs text-neutral-400">
        A beosztás a nevezések alapján készült. A szervezők fenntartják a jogot
        kisebb időbeli módosításokra a verseny gördülékenysége érdekében.
      </p>

      {loading && (
        <p className="text-sm text-zinc-400">Időrend betöltése…</p>
      )}

      <div className="space-y-6">
        {rows.map((r, idx) => {
          const prev = rows[idx - 1];
          const isNewBlock = !prev || prev.day !== r.day;

          return (
            <div key={idx}>
              {/* Subtle separator between time blocks */}
              {!isNewBlock && (
                <div className="my-6 h-px bg-gradient-to-r from-transparent via-red-800/40 to-transparent" />
              )}

              <div className="grid grid-cols-1 gap-6 rounded-xl border border-zinc-800 bg-black/70 p-5 md:grid-cols-12">
                {/* LEFT — Session */}
                <div className="md:col-span-3">
                  <div className="text-sm font-bold text-red-300">
                    {r.day}
                  </div>

                  <div className="mt-2 space-y-1 text-xs uppercase tracking-wide">
                    <div className="inline-block rounded-md border border-red-700/50 bg-red-950/30 px-2 py-0.5 text-red-400">
                      Platform {r.platform}
                    </div>
                    <div className="text-zinc-400">{r.gender}</div>
                  </div>
                </div>

                {/* MIDDLE — Times */}
                <div className="md:col-span-4 flex flex-col justify-center gap-2 text-sm">
                  <div className="text-zinc-300">
                    <span className="text-zinc-500">Mérlegelés:</span>{" "}
                    <span className="font-semibold text-zinc-100">
                      {r.weighIn}
                    </span>
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-zinc-500">Verseny:</span>{" "}
                    <span className="font-semibold text-zinc-100">
                      {r.start} – {r.end}
                    </span>
                  </div>
                </div>

                {/* RIGHT — Groups */}
                <div className="md:col-span-5">
                  <div className="mb-1 text-xs uppercase tracking-wide text-red-400">
                    Csoportok
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm leading-relaxed">
                    {(r.groups || "")
                      .split(";")
                      .map((rawGroup, i, arr) => {
                        const g = normalizeGroupName(rawGroup).trim();


                        // Make all 'Versenyző' group names red (platform A color)
                        const color = g.startsWith("Versenyző")
                          ? "text-red-400"
                          : g.startsWith("Újonc")
                          ? "text-red-300"
                          : "text-zinc-300";

                        return (
                          <span key={i} className={color}>
                            {g}
                            {i < arr.length - 1 && ","}
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <p className="mt-4 text-sm text-zinc-400">
          Jelenleg nincs megjeleníthető időrend.
        </p>
      )}
    </div>
  );
}