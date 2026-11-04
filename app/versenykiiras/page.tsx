import type { Metadata } from "next";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CompetitionRulesDocument } from "@/components/event/competition-rules-document";
import { getPhase, volunteersOpen } from "@/lib/phase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SBD Next II – Versenykiírás",
  description: "Az SBD Next II nyílt erőemelő verseny hivatalos versenykiírása.",
};

export default function VersenykiirasPage() {
  const phase = getPhase();

  return (
    <div className="relative min-h-screen">
      <Header
        ctaLabel={phase === "announced" ? "Értesítést kérek" : "Nevezek"}
        ctaHref={phase === "announced" ? "/#register" : "/nevezes"}
        showVolunteerLink={volunteersOpen() || phase === "closed"}
        navLinks={[{ href: "/#fees", label: "SBD Next II" }]}
      />
      <main id="main">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
          <CompetitionRulesDocument />
        </div>
      </main>
      <Footer showInvitation={false} />
    </div>
  );
}
