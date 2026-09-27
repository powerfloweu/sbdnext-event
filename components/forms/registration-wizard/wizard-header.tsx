"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        <span className="font-display text-xl font-extrabold uppercase tracking-wide">Nevezés</span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {step} / {TOTAL_STEPS}
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
