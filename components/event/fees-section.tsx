import Link from "next/link";
import { TicketCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";
import { formatHUF } from "@/lib/format";

export function FeesSection() {
  const amount = (value: number) => `${formatHUF(value)} ${EVENT.fees.currency}`;
  const shirtAddon = EVENT.fees.entryWithShirt - EVENT.fees.entryBase;

  return (
    <Section id="fees" icon={TicketCheck} eyebrow="Árak" title="Nevezési csomagok">
      <div className="grid gap-3">
        <Card className="border-primary/40">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-lg font-semibold text-foreground">Alap nevezés</span>
              <span className="font-display text-3xl font-extrabold text-primary tabular-nums">
                {amount(EVENT.fees.entryBase)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm font-semibold text-foreground">
                Nevezés + póló <span className="text-muted-foreground">(póló felár: +{amount(shirtAddon)})</span>
              </span>
              <span className="font-display text-xl font-bold tabular-nums">
                {amount(EVENT.fees.entryWithShirt)}
              </span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Mindenki kap ingyenesen letölthető fotókat magáról a versenyen</li>
              <li>A póló személyre szóló</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div className="flex flex-col gap-0.5">
              <Link href="/premium-media" className="font-semibold text-foreground underline">
                Prémium média csomag
              </Link>
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
            <span className="font-display text-xl font-bold tabular-nums">{amount(EVENT.fees.spectator)}</span>
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

        <p className="text-center text-sm text-muted-foreground">
          Az SBD Next I eredményei megtekinthetők a fenti menüben, az{" "}
          <Link href="/eredmenyek" className="font-semibold text-foreground underline">
            Eredmények
          </Link>{" "}
          pontban.
        </p>
      </div>
    </Section>
  );
}
