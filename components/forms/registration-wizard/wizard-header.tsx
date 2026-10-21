"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EVENT } from "@/config/event";
import { formatDateRange } from "@/lib/format";

const TOTAL_STEPS = 5;

export function WizardHeader({
  step,
  onBack,
}: {
  step: number;
  onBack?: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Vissza"
            className="-ml-2 flex size-11 items-center justify-center text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <Link href="/" aria-label="Vissza a főoldalra" className="-ml-2 flex size-11 items-center justify-center text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <Link href="/" className="flex items-center gap-2" aria-label="SBD Next főoldal">
          <Image
            src="/sbd_next_logo_transparent.png"
            alt=""
            width={28}
            height={28}
            className="size-6 object-contain sm:size-7"
          />
          <span className="font-display text-lg font-extrabold uppercase tracking-wide sm:text-xl">
            Nevezés
          </span>
        </Link>
        <span className="text-sm tabular-nums text-muted-foreground">
          {step} / {TOTAL_STEPS}
        </span>
      </div>
      <div className="mx-auto flex max-w-xl items-center justify-center gap-1.5 px-4 pb-2 text-center">
        <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
          SBD Next <span className="text-primary">{EVENT.editionRoman}</span> · {formatDateRange(EVENT.days)} ·{" "}
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
