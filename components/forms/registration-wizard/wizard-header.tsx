"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EVENT } from "@/config/event";
import { formatDateRange } from "@/lib/format";
import type { RegistrationLocale } from "@/lib/validation/registration";

const TOTAL_STEPS = 5;

const STRINGS = {
  hu: { title: "Nevezés", back: "Vissza", backHome: "Vissza a főoldalra", homeAria: "SBD Next főoldal" },
  en: { title: "Registration", back: "Back", backHome: "Back to homepage", homeAria: "SBD Next homepage" },
} as const;

export function WizardHeader({
  step,
  onBack,
  locale = "hu",
}: {
  step: number;
  onBack?: () => void;
  locale?: RegistrationLocale;
}) {
  const t = STRINGS[locale];
  const homeHref = locale === "en" ? "/en" : "/";
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={t.back}
            className="-ml-2 flex size-11 items-center justify-center text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <Link href={homeHref} aria-label={t.backHome} className="-ml-2 flex size-11 items-center justify-center text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <Link href={homeHref} className="flex items-center gap-2" aria-label={t.homeAria}>
          <Image
            src="/sbd_next_logo_transparent.png"
            alt=""
            width={28}
            height={28}
            className="size-6 object-contain sm:size-7"
          />
          <span className="font-display text-lg font-extrabold uppercase tracking-wide sm:text-xl">
            {t.title}
          </span>
        </Link>
        <span className="text-sm tabular-nums text-muted-foreground">
          {step} / {TOTAL_STEPS}
        </span>
      </div>
      <div className="mx-auto flex max-w-xl items-center justify-center gap-1.5 px-4 pb-2 text-center">
        <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
          SBD Next <span className="text-primary">{EVENT.editionRoman}</span> · {formatDateRange(EVENT.days, locale)} ·{" "}
          {EVENT.venue.name}
        </span>
      </div>
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1.5 px-4 pb-3">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full ${i < step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
    </header>
  );
}

export { TOTAL_STEPS };
