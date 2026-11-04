import Link from "next/link";
import { TicketCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";
import { formatHUF, formatEUR } from "@/lib/format";

const STRINGS = {
  hu: {
    eyebrow: "Árak",
    title: "Nevezési csomagok",
    entryFee: "Alap nevezés",
    entryWithShirt: "Nevezés + póló",
    perks: [
      "Mindenki kap ingyenesen letölthető fotókat magáról a versenyen",
      "A póló saját névvel/felirattal is kérhető, felár nélkül",
    ],
    premiumMedia: "Prémium média csomag",
    premiumMediaHint: "3 fotó + 3 videó, kiemelt válogatás",
    spectator: "Nézői jegy",
    spectatorHint: "A helyszínen, készpénz vagy kártya",
    premiumUpsell: "Már neveztél, de szeretnéd utólag megvásárolni a prémium média csomagot?",
    premiumUpsellCta: "Prémium média csomag vásárlása",
    resultsNote: (
      <>
        Az SBD Next I eredményei megtekinthetők a fenti menüben, az{" "}
        <Link href="/eredmenyek" className="font-semibold text-foreground underline">
          Eredmények
        </Link>{" "}
        pontban.
      </>
    ),
  },
  en: {
    eyebrow: "Prices",
    title: "Entry packages",
    entryFee: "Standard entry",
    entryWithShirt: "Entry + shirt",
    perks: [
      "Everyone gets free downloadable photos of themselves from the competition",
      "The shirt can carry a custom name/print at no extra charge",
    ],
    premiumMedia: "Premium media package",
    premiumMediaHint: "3 photos + 3 videos, hand-picked selection",
    spectator: "Spectator ticket",
    spectatorHint: "At the venue, cash or card",
    premiumUpsell: "Already registered, but want to add the premium media package afterwards?",
    premiumUpsellCta: "Buy the premium media package",
    resultsNote: (
      <>
        Last year&apos;s (SBD Next I) results can be viewed in the menu above, under{" "}
        <Link href="/en/results" className="font-semibold text-foreground underline">
          Results
        </Link>
        .
      </>
    ),
  },
} as const;

export function FeesSection({ locale = "hu" }: { locale?: "hu" | "en" }) {
  const t = STRINGS[locale];
  const fees = locale === "en" ? EVENT.feesEur : EVENT.fees;
  const amount = (value: number) => (locale === "en" ? `€${formatEUR(value)}` : `${formatHUF(value)} ${EVENT.fees.currency}`);
  const shirtAddon = fees.entryWithShirt - fees.entryBase;

  return (
    <Section id="fees" icon={TicketCheck} eyebrow={t.eyebrow} title={t.title}>
      <div className="grid gap-3">
        <Card className="border-primary/40">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-lg font-semibold text-foreground">{t.entryFee}</span>
              <span className="font-display text-3xl font-extrabold text-primary tabular-nums">
                {amount(fees.entryBase)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
              <span className="text-sm font-semibold text-foreground">
                {t.entryWithShirt} <span className="text-muted-foreground">(+{amount(shirtAddon)})</span>
              </span>
              <span className="font-display text-xl font-bold tabular-nums">
                {amount(fees.entryWithShirt)}
              </span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {t.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">{t.premiumMedia}</span>
              <span className="text-xs text-muted-foreground">{t.premiumMediaHint}</span>
            </div>
            <span className="font-display text-xl font-bold tabular-nums">+{amount(fees.premiumMedia)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">{t.spectator}</span>
              <span className="text-xs text-muted-foreground">{t.spectatorHint}</span>
            </div>
            <span className="font-display text-xl font-bold tabular-nums">
              {formatHUF(EVENT.fees.spectator)} {EVENT.fees.currency}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t.premiumUpsell}</p>
            <Button asChild variant="secondary">
              <Link href="/premium-media">{t.premiumUpsellCta}</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">{t.resultsNote}</p>
      </div>
    </Section>
  );
}
