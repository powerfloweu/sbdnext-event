import type { Metadata } from "next";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { FogGlow } from "@/components/site/fog-glow";
import { ResultsSection } from "@/components/event/results-table";
import { getPhase, volunteersOpen } from "@/lib/phase";

export const metadata: Metadata = {
  title: "SBD Next I – Results",
  description: "Full results of the SBD Next I powerlifting competition (February 2026), by category.",
};

export default function ResultsPageEn() {
  const phase = getPhase();

  return (
    <div className="relative min-h-screen">
      {phase === "announced" && <FogGlow />}

      <Header
        ctaLabel="Notify me"
        ctaHref="/en#register"
        showVolunteerLink={volunteersOpen() || phase === "closed"}
        navLinks={[{ href: "/en#info", label: "SBD Next II" }]}
        locale="en"
      />

      <main id="main">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="pt-16 sm:pt-24">
            <div className="flex items-center gap-2">
              <span className="eyebrow">SBD Next I · Archive</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Results</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              We held the first SBD Next on February 14, 2026, at Thor Gym. Thanks to every lifter
              and volunteer for a fantastic day! The full results, grouped by category, are below.
            </p>
          </div>

          <ResultsSection locale="en" />
        </div>
      </main>

      <Footer showInvitation={false} locale="en" />
    </div>
  );
}
