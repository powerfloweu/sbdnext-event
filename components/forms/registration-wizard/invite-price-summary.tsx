import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { EVENT } from "@/config/event";
import { formatEUR } from "@/lib/format";

// Invited foreign athletes (see app/en/nevezes/page.tsx's ?code=... gate)
// land directly on step 1 of the wizard without ever seeing the homepage —
// so, unlike the HU flow, they've never seen the prices or the rules
// before starting the form. D flagged this (project thread
// "Ellenőrizni az angol nevezési flót", 2026-11-04 19:33) after go-live.
// Shown once, above step 1 only, same spot as EventBanner.
export function InvitePriceSummary() {
  const fees = EVENT.feesEur;
  const amount = (value: number) => `€${formatEUR(value)}`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-sm">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold text-primary tabular-nums">{amount(fees.entryBase)}</span>
          <span className="text-xs text-muted-foreground">Entry</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold text-primary tabular-nums">{amount(fees.entryWithShirt)}</span>
          <span className="text-xs text-muted-foreground">Entry + shirt</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold text-primary tabular-nums">+{amount(fees.premiumMedia)}</span>
          <span className="text-xs text-muted-foreground">Premium media add-on</span>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold text-primary tabular-nums">{amount(fees.spectator)}</span>
          <span className="text-xs text-muted-foreground">Spectator ticket</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Basic entry doesn&apos;t include a shirt; in the Entry + shirt package the shirt is name-printed with your
        name.
      </p>
      <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-xs">
        <a
          href="/en/versenykiiras"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2"
        >
          Competition rules <ExternalLink className="size-3" aria-hidden="true" />
        </a>
        <Link href="/en" className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2">
          Back to the homepage
        </Link>
      </div>
    </div>
  );
}
