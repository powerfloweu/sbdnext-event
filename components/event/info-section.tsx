import { Info } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";

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
            <span className="font-medium">Felszerelés:</span> Versenyzői kategóriában a MERSZ
            szabályai szerint, Tehetségkutató kategóriában elegendő a testhez simuló ruházat.
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
