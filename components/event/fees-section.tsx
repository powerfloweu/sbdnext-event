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
      "A póló egyedi, névre szóló.",
    ],
    premiumMedia: "Prémium média csomag",
    premiumMediaHint: "Minimum 3 fotó és 3 videó, minden gyakorlat legjobb kísérletéről",
    spectator: "Nézői jegy",
    spectatorHint: "A helyszínen, készpénz vagy kártya",
    premiumUpsell: "Kíváncsi vagy a prémium média csomagra?",
    premiumUpsellCta: "Több infó a prémium média csomagról",
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
      "The shirt is unique and name-printed.",
    ],
    premiumMedia: "Premium media package",
    premiumMediaHint: "At least 3 photos and 3 videos, of your best attempt on each lift",
    spectator: "Spectator ticket",
    spectatorHint: "At the venue, cash or card",
    premiumUpsell: "Curious about the premium media package?",
    premiumUpsellCta: "More info about the premium media package",
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
  const premiumMediaHref = locale === "en" ? "/en/premium-media" : "/premium-media";

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
              <Link href={premiumMediaHref} className="font-semibold text-foreground underline">
                {t.premiumMedia}
              </Link>
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
            <span className="font-display text-xl font-bold tabular-nums">{amount(fees.spectator)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t.premiumUpsell}</p>
            <Button asChild variant="secondary">
              <Link href={premiumMediaHref}>{t.premiumUpsellCta}</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">{t.resultsNote}</p>
      </div>
    </Section>
  );
}
