import { CalendarDays, MapPin, Timer, ExternalLink, BookOpenText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhaseBanner } from "@/components/site/phase-banner";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Progress } from "@/components/ui/progress";
import { HeroPhoto } from "@/components/event/hero-photo";
import { FogCard } from "@/components/site/fog-card";
import { EVENT } from "@/config/event";

const FACT_LABELS = {
  hu: { date: "Dátum", time: "Idő", venue: "Helyszín" },
  en: { date: "Date", time: "Time", venue: "Venue" },
} as const;

// Facts pulled from the actual rulebook (components/event/competition-rules-document.tsx)
// rather than repeating the hero's own description/date/venue, which are already
// shown above this card.
const RULES_CARD = {
  hu: {
    title: "Versenykiírás",
    summary: [
      "Két kategória: Tehetségkutató (újonc) és Versenyzői, mindkettő IPF GL pontok alapján",
      "Tehetségkutató kategóriában nem kötelező a versenyfelszerelés (mez) — cicanadrág vagy rövidnadrág is jó",
      "A helyezéseket mindkét kategóriában IPF GL pontok alapján állapítjuk meg",
    ],
    cta: "Tovább a részletekért",
  },
  en: {
    title: "Competition rules",
    summary: [
      "Two categories: Rookie and Lifter, both ranked by IPF GL points",
      "Rookie category doesn't require a competition singlet — fitted leggings or shorts are fine",
      "Standings in both categories are decided by IPF GL points",
    ],
    cta: "More details",
  },
} as const;

interface HeroProps {
  dateLabel: string;
  timeLabel: string;
  badgeLabel: string;
  badgeTone: "open" | "neutral" | "closed";
  description: string;
  // null when the header's own CTA (and, further down, the registration
  // teaser's signup form) already cover this action — avoids repeating the
  // exact same CTA a third time in the hero.
  primaryCta: { label: string; href: string } | null;
  secondaryCta: { label: string; href: string } | null;
  countdown: { target: string; label: string } | null;
  capacity: { used: number; limit: number } | null;
  capacityUnitLabel?: string;
  locale?: "hu" | "en";
}

export function Hero({
  dateLabel,
  timeLabel,
  badgeLabel,
  badgeTone,
  description,
  primaryCta,
  secondaryCta,
  countdown,
  capacity,
  capacityUnitLabel = "hely foglalt",
  locale = "hu",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 pb-10 sm:px-8 sm:pt-14 lg:grid-cols-12 lg:items-stretch lg:pb-16">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <PhaseBanner label={badgeLabel} tone={badgeTone} className="self-start" />
          <h1>
            SBD Next <span className="text-primary">{EVENT.editionRoman}</span>
          </h1>
          <p className="max-w-md text-lg text-foreground/90">{description}</p>
          <FogCard className="grid gap-4 p-5 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="eyebrow">{FACT_LABELS[locale].date}</span>
                <span className="font-semibold text-foreground">{dateLabel}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Timer className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="eyebrow">{FACT_LABELS[locale].time}</span>
                <span className="font-semibold text-foreground">{timeLabel}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="eyebrow">{FACT_LABELS[locale].venue}</span>
                <span className="font-semibold text-foreground">{EVENT.venue.name}</span>
              </div>
            </div>
          </FogCard>
          {(primaryCta || (secondaryCta && !secondaryCta.href.includes("versenykiiras"))) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {primaryCta && (
              <Button asChild size="lg">
                <a
                  href={primaryCta.href}
                  target={primaryCta.href.startsWith("/") || primaryCta.href.startsWith("#") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                >
                  {primaryCta.label}
                </a>
              </Button>
            )}
            {secondaryCta && !secondaryCta.href.includes("versenykiiras") && (
              <Button asChild variant="secondary" size="lg">
                <a
                  href={secondaryCta.href}
                  target={secondaryCta.href.startsWith("/") || secondaryCta.href.startsWith("#") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                >
                  {secondaryCta.label}
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>
          )}

          {secondaryCta && secondaryCta.href.includes("versenykiiras") && (
            <Card className="border-primary/70 bg-gradient-to-br from-primary/15 via-card to-card">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex items-center gap-2">
                  <BookOpenText className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="font-display text-xl font-extrabold text-primary">
                    {RULES_CARD[locale].title}
                  </span>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                  {RULES_CARD[locale].summary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <Button asChild variant="secondary" size="lg" className="mt-1 self-start">
                  <a
                    href={secondaryCta.href}
                    target={secondaryCta.href.startsWith("/") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                  >
                    {RULES_CARD[locale].cta}
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border sm:aspect-video lg:aspect-auto lg:h-full lg:min-h-[420px]">
            <HeroPhoto locale={locale} />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent" />
            {(countdown || capacity) && (
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
                {countdown && (
                  <div className="flex flex-col gap-1">
                    <span className="eyebrow">{countdown.label}</span>
                    <CountdownTimer
                      target={countdown.target}
                      className="font-display text-3xl font-bold tabular-nums text-foreground sm:text-4xl"
                    />
                  </div>
                )}
                {capacity && (
                  <div className="flex w-full flex-col gap-1.5 sm:w-48">
                    <span className="text-right text-xs text-muted-foreground">
                      <b className="text-foreground">{capacity.used}</b> / {capacity.limit} {capacityUnitLabel}
                    </span>
                    <Progress value={capacity.used} max={capacity.limit} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
