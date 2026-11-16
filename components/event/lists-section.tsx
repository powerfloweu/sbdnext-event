"use client";

import { useMemo, useState } from "react";
import { Trophy, ArrowUpDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Section } from "@/components/site/section";
import { formatKg } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EntrantCategory, EntrantRow } from "@/lib/registrations";

const TAB_LABELS: Record<EntrantCategory, string> = {
  ujoncNoi: "Tehetségkutató – Nők",
  ujoncFerfi: "Tehetségkutató – Férfiak",
  versenyzoNoi: "Versenyzői – Nők",
  versenyzoFerfi: "Versenyzői – Férfiak",
};

const TAB_ORDER: EntrantCategory[] = [
  "ujoncNoi",
  "ujoncFerfi",
  "versenyzoNoi",
  "versenyzoFerfi",
];

type SortKey = "total" | "points";
type SortDir = "asc" | "desc";

interface ListsSectionProps {
  data: Record<EntrantCategory, EntrantRow[]>;
  updatedLabel: string;
}

function formatPoints(value: number): string {
  return new Intl.NumberFormat("hu-HU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function SortButton({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-pressed={active}
    >
      {label}
      <ArrowUpDown className={cn("size-3", active && dir === "asc" && "rotate-180")} aria-hidden="true" />
    </button>
  );
}

function LeaderboardTable({
  rows,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: EntrantRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => (sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
    return copy;
  }, [rows, sortKey, sortDir]);

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
      {/* Mobile: stacked cards, with a sort toggle above since there's no table header to click */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2 text-xs md:hidden">
        <span className="text-muted-foreground">Rendezés:</span>
        <SortButton label="Total" active={sortKey === "total"} dir={sortDir} onClick={() => onSort("total")} />
        <SortButton label="IPF pont" active={sortKey === "points"} dir={sortDir} onClick={() => onSort("points")} />
      </div>
      <div className="flex flex-col divide-y divide-border md:hidden">
        {sorted.map((row, idx) => (
          <div key={row.name + row.club + idx} className="flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">#{idx + 1}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold tabular-nums">
                  {row.total ? formatKg(row.total) : "—"}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {row.points ? `${formatPoints(row.points)} p` : "—"}
                </span>
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.club || "—"}</span>
          </div>
        ))}
      </div>

      {/* Desktop: table, with clickable sortable headers */}
      <table className="hidden w-full border-collapse text-sm md:table">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="w-14 px-4 py-3">#</th>
            <th className="px-4 py-3">Név</th>
            <th className="px-4 py-3">Egyesület</th>
            <th className="px-4 py-3 text-right">
              <SortButton
                label="Nevezési total"
                active={sortKey === "total"}
                dir={sortDir}
                onClick={() => onSort("total")}
                className="float-right"
              />
            </th>
            <th className="px-4 py-3 text-right">
              <SortButton
                label="IPF pont"
                active={sortKey === "points"}
                dir={sortDir}
                onClick={() => onSort("points")}
                className="float-right"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr key={row.name + row.club + idx} className="border-b border-border last:border-none">
              <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
              <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.club || "—"}</td>
              <td className="px-4 py-3 text-right font-display text-lg font-bold tabular-nums">
                {row.total ? formatKg(row.total) : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {row.points ? formatPoints(row.points) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function ListsSection({ data, updatedLabel }: ListsSectionProps) {
  const [active, setActive] = useState<EntrantCategory>("ujoncNoi");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <Section
      id="lists"
      icon={Trophy}
      eyebrow="Nevezési listák"
      title="Ki nevezett eddig?"
      description={`${updatedLabel} · rendezhető nevezési total vagy IPF pont szerint. Az eredményhirdetés IPF pontszám alapján történik, súlycsoportok nélkül.`}
    >
      <Tabs value={active} onValueChange={(v) => setActive(v as EntrantCategory)}>
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
            <LeaderboardTable rows={data[cat] ?? []} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  );
}
