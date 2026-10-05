"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Section } from "@/components/site/section";
import { formatKg } from "@/lib/format";
import type { LeaderboardCategory, LeaderboardRow } from "@/lib/sheets";

const TAB_LABELS: Record<LeaderboardCategory, string> = {
  ujoncNoi: "Újonc – Nők",
  ujoncFerfi: "Újonc – Férfiak",
  versenyzoNoi: "Versenyző – Nők",
  versenyzoFerfi: "Versenyző – Férfiak",
};

const TAB_ORDER: LeaderboardCategory[] = [
  "ujoncNoi",
  "ujoncFerfi",
  "versenyzoNoi",
  "versenyzoFerfi",
];

interface ListsSectionProps {
  data: Record<LeaderboardCategory, LeaderboardRow[]>;
  updatedLabel: string;
}

function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Még nincs aktív nevezés ebben a kategóriában.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Mobile: stacked cards */}
      <div className="flex flex-col divide-y divide-border md:hidden">
        {rows.map((row, idx) => (
          <div key={row.name + row.club + idx} className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{idx + 1}</span>
              <span className="font-display text-lg font-bold tabular-nums">
                {row.total ? formatKg(row.total) : "—"}
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.club || "—"}</span>
            {row.group && <span className="text-xs font-semibold text-primary">{row.group}</span>}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <table className="hidden w-full border-collapse text-sm md:table">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="w-14 px-4 py-3">#</th>
            <th className="px-4 py-3">Név</th>
            <th className="px-4 py-3">Egyesület</th>
            <th className="px-4 py-3">Csoport</th>
            <th className="px-4 py-3 text-right">Nevezési total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.name + row.club + idx} className="border-b border-border last:border-none">
              <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
              <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.club || "—"}</td>
              <td className="px-4 py-3 font-semibold text-primary">{row.group || "—"}</td>
              <td className="px-4 py-3 text-right font-display text-lg font-bold tabular-nums">
                {row.total || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function ListsSection({ data, updatedLabel }: ListsSectionProps) {
  const [active, setActive] = useState<LeaderboardCategory>("ujoncNoi");

  return (
    <Section
      id="lists"
      icon={Trophy}
      eyebrow="Nevezési listák"
      title="Ki nevezett eddig?"
      description={`${updatedLabel} · sorrend a nevezési total szerint. Az eredményhirdetés IPF pontszám alapján történik, súlycsoportok nélkül.`}
    >
      <Tabs value={active} onValueChange={(v) => setActive(v as LeaderboardCategory)}>
        <TabsList className="mb-4">
          {TAB_ORDER.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {TAB_LABELS[cat]}
              <span className="ml-1 rounded-full bg-black/15 px-1.5 text-xs">
                {data[cat]?.length ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_ORDER.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <LeaderboardTable rows={data[cat] ?? []} />
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
