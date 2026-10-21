import Image from "next/image";

import { EVENT } from "@/config/event";
import { formatDateRange } from "@/lib/format";

// The registration wizard is a focused, logo-free funnel by design (one
// task per screen) — this is the one place it borrows the homepage's "this
// is a real competition" visual language (event photo, logo, dates, venue)
// before the lifter commits to filling out the form. Shown once, above
// step 1 only, so it doesn't compete with the step content on every screen.
export function EventBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-[16/9] sm:aspect-[21/9]">
        <Image
          src="/photos/hero-desktop.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 640px) 576px, 100vw"
          style={{ objectPosition: "50% 20%" }}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center">
          <Image
            src="/sbd_next_logo_transparent.png"
            alt="SBD Next"
            width={44}
            height={44}
            className="size-10 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:size-11"
          />
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            SBD Next <span className="text-primary">{EVENT.editionRoman}</span>
          </h2>
          <p className="text-xs font-semibold text-foreground/90 sm:text-sm">
            {formatDateRange(EVENT.days)} · {EVENT.venue.name}
          </p>
        </div>
      </div>
    </div>
  );
}
