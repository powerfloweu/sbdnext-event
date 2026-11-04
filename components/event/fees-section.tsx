import Link from "next/link";
import { TicketCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { EVENT } from "@/config/event";
import { formatHUF, formatEUR } from "@/lib/format";

const STRINGS = {
  hu: {
    eyebrow: "Díjak",
    title: "Mit kapsz a nevezésért",
    entryFee: "Nevezési díj",
    entryWithShirt: "Nevezés + póló",
    perks: [
      "Média csomag: profi fotók rólad a platformon",
      "IPF szabályok szerinti bírói stáb",
      "Egyedi SBD versenypóló igény szerint, felár ellenében",
    ],
    premiumMedia: "Prémium média csomag",
    premiumMediaHint: "3 fotó + 3 videó, kiemelt válogatás",
    spectator: "Nézői jegy",
    spectatorHint: "A helyszínen, készpénz vagy kártya",
    premiumUpsell: "Már neveztél, de szeretnéd utólag megvásárolni a prémium média csomagot?",
    premiumUpsellCta: "Prémium média csomag vásárlása",
  },
  en: {
    eyebrow: "Fees",
    title: "What you get with your entry",
    entryFee: "Entry fee",
    entryWithShirt: "Entry + shirt",
    perks: [
      "Media package: professional photos of you on the platform",
      "IPF-rules judging panel",
      "Custom SBD competition shirt, as an optional add-on",
    ],
    premiumMedia: "Premium media package",
    premiumMediaHint: "3 photos + 3 videos, hand-picked selection",
    spectator: "Spectator ticket",
    spectatorHint: "At the venue, cash or card",
    premiumUpsell: "Already registered, but want to add the premium media package afterwards?",
    premiumUpsellCta: "Buy the premium media package",
  },
} as const;

export function FeesSection({ locale = "hu" }: { locale?: "hu" | "en" }) {
  const t = STRINGS[locale];
  const fees = locale === "en" ? EVENT.feesEur : EVENT.fees;
  const amount = (value: number) => (locale === "en" ? `€${formatEUR(value)}` : `${formatHUF(value)} ${EVENT.fees.currency}`);

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
              <span className="text-sm font-semibold text-foreground">{t.entryWithShirt}</span>
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
      </div>
    </Section>
  );
}
