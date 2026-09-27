import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/site/section";
import type { ScheduleRow } from "@/lib/sheets";

export function ScheduleSection({ rows }: { rows: ScheduleRow[] }) {
  return (
    <Section
      id="schedule"
      icon={CalendarDays}
      eyebrow="Időrend"
      title="Csoportbeosztás"
      description="A beosztás a nevezések alapján készül. A szervezők fenntartják a jogot kisebb időbeli módosításokra."
    >
      {rows.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            A pontos flight- és platformbeosztást a nevezés lezárása után tesszük közzé.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((r, idx) => (
            <Card key={idx}>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_1fr] sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">{r.day}</span>
                  <Badge variant={r.platform.toUpperCase().startsWith("A") ? "primary" : "neutral"}>
                    {r.platform.toUpperCase().startsWith("A") ? "A platform" : `${r.platform} platform`}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{r.gender}</span>
                </div>
                <div className="flex flex-col text-sm text-foreground">
                  <span>
                    <span className="text-muted-foreground">Mérlegelés: </span>
                    <span className="font-semibold">{r.weighIn}</span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Verseny: </span>
                    <span className="font-semibold">
                      {r.start} – {r.end}
                    </span>
                  </span>
                </div>
                <div className="text-sm text-foreground">{r.groups || "—"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
