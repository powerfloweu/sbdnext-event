import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

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
          <Link
            href="/"
            className="pdf-skip mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Vissza a főoldalra
          </Link>
          <div className="pdf-skip mb-6 flex justify-center">
            <a
              href="/docs/SBD_Next_II_versenykiiras_HU.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
            >
              <Download className="size-4 text-primary" aria-hidden="true" />
              Versenykiírás letöltése PDF-ben
            </a>
          </div>
          <CompetitionRulesDocument />
        </div>
      </main>
      <Footer showInvitation={false} />
    </div>
  );
}
