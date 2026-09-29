import Image from "next/image";
import { CalendarDays, MapPin, Timer, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhaseBanner } from "@/components/site/phase-banner";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Progress } from "@/components/ui/progress";
import { FogGlow } from "@/components/site/fog-glow";
import { EVENT } from "@/config/event";

interface HeroProps {
  dateLabel: string;
  timeLabel: string;
  badgeLabel: string;
  badgeTone: "open" | "neutral" | "closed";
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string } | null;
  countdown: { target: string; label: string } | null;
  capacity: { used: number; limit: number } | null;
  capacityUnitLabel?: string;
  heroPhotoAlt?: string;
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
  heroPhotoAlt = "Versenyző a felhúzás előtt az SBD Next első kiadásán",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <FogGlow />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pt-8 pb-10 sm:px-8 sm:pt-14 lg:grid-cols-12 lg:items-center lg:pb-16">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <PhaseBanner label={badgeLabel} tone={badgeTone} className="self-start" />
          <h1>
            SBD Next <span className="text-primary">{EVENT.edition}</span>
          </h1>
          <p className="max-w-md text-lg text-foreground/90">{description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-foreground/90">
            <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
              {dateLabel}
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <Timer className="size-4 text-primary" aria-hidden="true" />
              {timeLabel}
            </span>
            <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {EVENT.venue.name}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg">
              <a
                href={primaryCta.href}
                target={primaryCta.href.startsWith("/") || primaryCta.href.startsWith("#") ? undefined : "_blank"}
                rel="noopener noreferrer"
              >
                {primaryCta.label}
              </a>
            </Button>
            {secondaryCta && (
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
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border sm:aspect-video lg:h-[420px] lg:aspect-auto">
            <Image
              src="/photos/hero-desktop.jpg"
              alt={heroPhotoAlt}
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover object-[50%_35%]"
            />
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
