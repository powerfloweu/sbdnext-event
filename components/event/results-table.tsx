"use client";

import { useState } from "react";
import { Medal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Section } from "@/components/site/section";
import { formatKg } from "@/lib/format";
import { SBD_NEXT_1_RESULTS, type ResultDivisionKey, type ResultRow } from "@/lib/results/sbd-next-1";

const TAB_ORDER: ResultDivisionKey[] = ["womensLifter", "womensRookie", "mensLifter", "mensRookie"];

const STRINGS = {
  hu: {
    tabLabels: {
      womensLifter: "Női versenyző",
      womensRookie: "Női újonc",
      mensLifter: "Férfi versenyző",
      mensRookie: "Férfi újonc",
    } as Record<ResultDivisionKey, string>,
    eyebrow: "SBD Next 1 · 2026. február",
    title: "Az első SBD Next eredményei",
    description:
      "A versenyzők teljes eredménysora kategóriánként, az IPF szabályok szerinti pontszám és helyezés alapján. Az áthúzott szám sikertelen próbálkozást jelent.",
    empty: "Ebben a kategóriában nincs rögzített eredmény.",
    place: "Hely",
    name: "Név",
    team: "Egyesület",
    bodyWeight: "Testsúly",
    squat: "Guggolás",
    bench: "Fekvenyomás",
    deadlift: "Felhúzás",
    total: "Total",
  },
  en: {
    tabLabels: {
      womensLifter: "Women's Lifter",
      womensRookie: "Women's Rookie",
      mensLifter: "Men's Lifter",
      mensRookie: "Men's Rookie",
    } as Record<ResultDivisionKey, string>,
    eyebrow: "SBD Next 1 · February 2026",
    title: "SBD Next 1 results",
    description:
      "Full results by category, placed by IPF-rules score. A struck-through number is a failed attempt.",
    empty: "No results recorded in this category.",
    place: "Place",
    name: "Name",
    team: "Team",
    bodyWeight: "Body wgt",
    squat: "Squat",
    bench: "Bench",
    deadlift: "Deadlift",
    total: "Total",
  },
} as const;

type Locale = keyof typeof STRINGS;

function AttemptCell({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  const failed = value < 0;
  return (
    <span className={failed ? "text-destructive line-through" : "text-foreground"}>{value}</span>
  );
}

function PlaceBadge({ place }: { place: number | null }) {
  if (place === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (place <= 3) {
    return (
      <span className="inline-flex items-center gap-1 font-display text-lg font-bold tabular-nums text-primary">
        <Medal className="size-4" aria-hidden="true" />
        {place}.
      </span>
    );
  }
  return <span className="font-display text-lg font-bold tabular-nums text-muted-foreground">{place}.</span>;
}

function ResultsDivisionTable({ rows, t }: { rows: ResultRow[]; t: (typeof STRINGS)[Locale] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">{t.empty}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Mobile: stacked cards */}
      <div className="flex flex-col divide-y divide-border lg:hidden">
        {rows.map((row, idx) => (
          <div key={row.name + idx} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <PlaceBadge place={row.place} />
              <span className="font-display text-xl font-bold tabular-nums">
                {row.total !== null ? formatKg(row.total) : "—"}
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">{row.name}</span>
              {row.team && <span className="ml-2 text-xs text-muted-foreground">{row.team}</span>}
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">{t.bodyWeight}</span>
                <span className="font-medium">{row.bodyWeight ? formatKg(row.bodyWeight) : "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">{t.squat}</span>
                <span className="font-medium">{row.bestSquat !== null ? formatKg(row.bestSquat) : "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">{t.bench}</span>
                <span className="font-medium">{row.bestBench !== null ? formatKg(row.bestBench) : "—"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground">{t.deadlift}</span>
                <span className="font-medium">{row.bestDeadlift !== null ? formatKg(row.bestDeadlift) : "—"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="w-14 px-4 py-3">{t.place}</th>
              <th className="px-4 py-3">{t.name}</th>
              <th className="px-4 py-3">{t.team}</th>
              <th className="px-4 py-3 text-right">{t.bodyWeight}</th>
              <th className="px-4 py-3 text-center" colSpan={3}>
                {t.squat}
              </th>
              <th className="px-4 py-3 text-center" colSpan={3}>
                {t.bench}
              </th>
              <th className="px-4 py-3 text-center" colSpan={3}>
                {t.deadlift}
              </th>
              <th className="px-4 py-3 text-right">{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.name + idx} className="border-b border-border last:border-none">
                <td className="px-4 py-3">
                  <PlaceBadge place={row.place} />
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.team || "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.bodyWeight ? formatKg(row.bodyWeight) : "—"}
                </td>
                {row.squat.map((v, i) => (
                  <td key={`sq${i}`} className="px-2 py-3 text-center tabular-nums">
                    <AttemptCell value={v} />
                  </td>
                ))}
                {row.bench.map((v, i) => (
                  <td key={`bn${i}`} className="px-2 py-3 text-center tabular-nums">
                    <AttemptCell value={v} />
                  </td>
                ))}
                {row.deadlift.map((v, i) => (
                  <td key={`dl${i}`} className="px-2 py-3 text-center tabular-nums">
                    <AttemptCell value={v} />
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-display text-lg font-bold tabular-nums">
                  {row.total !== null ? formatKg(row.total) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ResultsSection({ locale = "hu" }: { locale?: Locale }) {
  const [active, setActive] = useState<ResultDivisionKey>("womensLifter");
  const t = STRINGS[locale];

  return (
    <Section id="eredmenyek" icon={Medal} eyebrow={t.eyebrow} title={t.title} description={t.description}>
      <Tabs value={active} onValueChange={(v) => setActive(v as ResultDivisionKey)}>
        <TabsList className="mb-4 flex-wrap">
          {TAB_ORDER.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {t.tabLabels[cat]}
              <span className="ml-1 rounded-full bg-black/15 px-1.5 text-xs">
                {SBD_NEXT_1_RESULTS[cat]?.length ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_ORDER.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <ResultsDivisionTable rows={SBD_NEXT_1_RESULTS[cat] ?? []} t={t} />
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
