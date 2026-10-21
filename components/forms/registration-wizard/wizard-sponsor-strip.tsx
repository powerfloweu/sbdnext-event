import Image from "next/image";

import { EVENT } from "@/config/event";

// A quiet, constant brand presence through every step of the funnel — the
// same organiser/partner logos shown on the homepage's SponsorGrid, just
// smaller and without the hover-to-color treatment (this page isn't trying
// to be clicked away from).
export function WizardSponsorStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 opacity-70 grayscale">
      {EVENT.sponsors.map((s) => (
        <Image
          key={s.name}
          src={s.logo}
          alt={s.name}
          width={120}
          height={36}
          className="h-6 w-auto object-contain sm:h-7"
        />
      ))}
    </div>
  );
}
