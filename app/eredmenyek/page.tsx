import type { Metadata } from "next";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { FogGlow } from "@/components/site/fog-glow";
import { ResultsSection } from "@/components/event/results-table";
import { getPhase, volunteersOpen } from "@/lib/phase";

export const metadata: Metadata = {
  title: "SBD Next 1 eredményei",
  description:
    "A 2026. februári SBD Next 1 erőemelő verseny teljes eredménysora kategóriánként, IPF szabályok szerint.",
};

export default function ResultsPage() {
  const phase = getPhase();

  return (
    <div className="relative min-h-screen">
      {phase === "announced" && <FogGlow />}

      <Header
        ctaLabel="Értesítést kérek"
        ctaHref="/#register"
        showVolunteerLink={volunteersOpen() || phase === "closed"}
        navLinks={[{ href: "/#info", label: "SBD Next II" }]}
      />

      <main id="main">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="pt-16 sm:pt-24">
            <div className="flex items-center gap-2">
              <span className="eyebrow">Archívum</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">SBD Next 1 eredményei</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              2026. február 14-én rendeztük meg az első SBD Next versenyt a Thor Gymben. Köszönjük
              minden versenyzőnek és segítőnek a fantasztikus napot! Alább a teljes
              eredménysor, kategóriák szerint csoportosítva.
            </p>
          </div>

          <ResultsSection />
        </div>
      </main>

      <Footer showInvitation={false} />
    </div>
  );
}
