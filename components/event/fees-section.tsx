import Link from "next/link";
import { TicketCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";
import { formatHUF } from "@/lib/format";

export function FeesSection() {
  return (
    <Section id="fees" icon={TicketCheck} eyebrow="Díjak" title="Mit kapsz a nevezésért">
      <div className="grid gap-3">
        <Card className="border-primary/40">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-lg font-semibold text-foreground">Nevezési díj</span>
              <span className="font-display text-3xl font-extrabold text-primary tabular-nums">
                {formatHUF(EVENT.fees.entryBase)} {EVENT.fees.currency}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm font-semibold text-foreground">Nevezés + póló</span>
              <span className="font-display text-xl font-bold tabular-nums">
                {formatHUF(EVENT.fees.entryWithShirt)} {EVENT.fees.currency}
              </span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Média csomag: profi fotók rólad a platformon</li>
              <li>IPF szabályok szerinti bírói stáb</li>
              <li>Egyedi SBD versenypóló igény szerint, felár ellenében</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">Prémium média csomag</span>
              <span className="text-xs text-muted-foreground">
                3 fotó + 3 videó, kiemelt válogatás
              </span>
            </div>
            <span className="font-display text-xl font-bold tabular-nums">
              +{formatHUF(EVENT.fees.premiumMedia)} {EVENT.fees.currency}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">Nézői jegy</span>
              <span className="text-xs text-muted-foreground">A helyszínen, készpénz vagy kártya</span>
            </div>
            <span className="font-display text-xl font-bold tabular-nums">
              {formatHUF(EVENT.fees.spectator)} {EVENT.fees.currency}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Már neveztél, de szeretnéd utólag megvásárolni a prémium média csomagot?
            </p>
            <Button asChild variant="secondary">
              <Link href="/premium-media">Prémium média csomag vásárlása</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
