interface WeightClassGroup {
  label: string;
  rows: [string, string][];
}

interface WeightClassTableProps {
  groups: WeightClassGroup[];
  weightLabel: string;
  totalLabel: string;
}

// Shared by the HU and EN competition-rules documents: a clean, per-gender
// qualification-standards table instead of one cramped four-column table.
export function WeightClassTable({ groups, weightLabel, totalLabel }: WeightClassTableProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.label} className="overflow-hidden rounded-lg border border-border">
          <div className="bg-primary/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-primary">
            {group.label}
          </div>
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-foreground">
                <th className="px-3 py-2 font-semibold">{weightLabel}</th>
                <th className="px-3 py-2 text-right font-semibold">{totalLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {group.rows.map(([weight, total]) => (
                <tr key={weight} className="odd:bg-transparent even:bg-muted/20">
                  <td className="px-3 py-1.5 tabular-nums">{weight}</td>
                  <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-foreground">{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
