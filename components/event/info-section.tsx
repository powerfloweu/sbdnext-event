import { Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(iso)
  );
}

export function InfoSection() {
  return (
    <Section id="info" icon={Info} eyebrow="Versenyinformációk" title="Amit érdemes tudni">
      <Card>
        <CardContent className="grid gap-4 p-6 text-sm text-foreground sm:grid-cols-2">
          <div>
            <span className="font-medium">Nevezői limit:</span> {EVENT.registration.capacity} fő. A
            helyek a sikeres <b>fizetés</b> sorrendjében telnek be.
          </div>
          <div>
            <span className="font-medium">Felszerelés:</span> Versenyző kategóriában a MERSZ
            szabályai szerint, Újonc kategóriában elegendő a testhez simuló ruházat.
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Jelentkezés kezdete</div>
            <div className="font-semibold">{formatDate(EVENT.registration.opensAt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Nevezés határideje</div>
            <div className="font-semibold">{formatDate(EVENT.registration.closesAt)}</div>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
