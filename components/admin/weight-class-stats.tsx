// Tavalyi (SBD Next 1) testsúly-eloszlás IPF-súlycsoportokban, a "prior_year_registrations"
// tábla alapján — D és Miki ebből döntik el a SBD Next 2 versenyrendszerét (GL-pontos,
// súlycsoport nélküli forma vs. IPF-súlycsoportok). Számítás élőben történik a betöltött
// sorokból, nincs felskálázás (D kérte 2026-10-21-én, hogy a tényleges létszámokkal
// dolgozzunk).

import { Card, CardContent } from "@/components/ui/card";
import { formatKg } from "@/lib/format";

interface PriorYearRow {
  sex: string;
  division: string;
  bodyweight: number | null;
}

const MEN_CLASSES = [59, 66, 74, 83, 93, 105, 120];
const WOMEN_CLASSES = [47, 52, 57, 63, 69, 76, 84];

function classify(bodyweight: number, classes: number[]): string {
  for (const limit of classes) {
    if (bodyweight <= limit) return formatKg(limit);
  }
  return `${formatKg(classes[classes.length - 1])}+`;
}

function classLabels(classes: number[]): string[] {
  return [...classes.map((c) => formatKg(c)), `${formatKg(classes[classes.length - 1])}+`];
}

interface ClassCount {
  label: string;
  total: number;
  competitor: number;
  novice: number;
}

function buildDistribution(rows: PriorYearRow[], sex: string, classes: number[]): ClassCount[] {
  const labels = classLabels(classes);
  const counts = new Map<string, ClassCount>(labels.map((label) => [label, { label, total: 0, competitor: 0, novice: 0 }]));

  for (const row of rows) {
    if (row.sex !== sex || row.bodyweight === null) continue;
    const label = classify(row.bodyweight, classes);
    const entry = counts.get(label);
    if (!entry) continue;
    entry.total += 1;
    if (row.division === "Versenyző") entry.competitor += 1;
    else if (row.division === "Újonc") entry.novice += 1;
  }

  return labels.map((label) => counts.get(label)!);
}

function Bars({ title, data }: { title: string; data: ClassCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
      <div className="flex flex-col gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="grid grid-cols-[52px_1fr_28px] items-center gap-2 text-xs">
            <span className="text-right text-muted-foreground tabular-nums">{d.label}</span>
            <div className="h-3.5 min-w-0 overflow-hidden rounded bg-muted">
              <div
                className="h-full rounded bg-primary"
                style={{ width: `${(d.total / max) * 100}%` }}
              />
            </div>
            <span className="tabular-nums">{d.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SplitTable({ title, data }: { title: string; data: ClassCount[] }) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
      <table className="w-full min-w-[260px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-2">Súlycsoport</th>
            <th className="p-2 text-right">Versenyző</th>
            <th className="p-2 text-right">Újonc</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((d) => (
            <tr key={d.label}>
              <td className="p-2">{d.label}</td>
              <td className="p-2 text-right tabular-nums">{d.competitor}</td>
              <td className="p-2 text-right tabular-nums">{d.novice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WeightClassStats({ rows }: { rows: PriorYearRow[] }) {
  const withBodyweight = rows.filter((r) => r.bodyweight !== null);
  const men = rows.filter((r) => r.sex === "Férfi");
  const women = rows.filter((r) => r.sex === "Nő");

  const menDist = buildDistribution(rows, "Férfi", MEN_CLASSES);
  const womenDist = buildDistribution(rows, "Nő", WOMEN_CLASSES);

  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold">Tavalyi súlycsoport-statisztika</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {rows.length} tavalyi (SBD Next I) induló, nincs felskálázás. {withBodyweight.length} / {rows.length} sornál
        van testsúly-adat ({Math.round((withBodyweight.length / Math.max(1, rows.length)) * 100)}%). IPF-súlycsoportok
        szerint, versenyző/újonc bontásban — ez a döntés alapja a SBD Next 2 versenyrendszeréhez.
      </p>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <Bars title={`Férfi (${men.length} fő)`} data={menDist} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Bars title={`Nő (${women.length} fő)`} data={womenDist} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <SplitTable title="Férfi — versenyző / újonc" data={menDist} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <SplitTable title="Nő — versenyző / újonc" data={womenDist} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 text-sm">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Javasolt csoportosítás (tényleges tavalyi adatokon, nem felskálázva)
          </h3>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              <span className="text-foreground">Nő, 3 csoport:</span> ≤57 / 57–69 / 69+ kg → 10/10/12 fő
              (legkiegyensúlyozottabb)
            </li>
            <li>
              <span className="text-foreground">Férfi, 4 csoport:</span> ≤83 / 83–93 / 93–105 / 105+ kg → 32/27/21/12
              fő (a 3 csoportos bontásban az 83–105 kg sáv önmagában 48 fő lenne)
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
