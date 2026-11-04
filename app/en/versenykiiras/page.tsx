import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CompetitionRulesDocumentEn } from "@/components/event/competition-rules-document-en";
import { getPhase, volunteersOpen } from "@/lib/phase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SBD Next II – Competition Rules",
  description: "Official competition rules for the SBD Next II open powerlifting competition.",
};

export default function VersenykiirasEnPage() {
  const phase = getPhase();

  return (
    <div className="relative min-h-screen">
      <Header
        ctaLabel={phase === "announced" ? "Notify me" : "Register"}
        ctaHref={phase === "announced" ? "/en#register" : "/en/nevezes"}
        showVolunteerLink={volunteersOpen() || phase === "closed"}
        navLinks={[{ href: "/en", label: "SBD Next II" }]}
        locale="en"
      />
      <main id="main">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
          <Link
            href="/en"
            className="pdf-skip mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <div className="pdf-skip mb-6 flex justify-center">
            <a
              href="/docs/SBD_Next_II_versenykiiras_EN.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
            >
              <Download className="size-4 text-primary" aria-hidden="true" />
              Download the competition rules (PDF)
            </a>
          </div>
          <CompetitionRulesDocumentEn />
        </div>
      </main>
      <Footer showInvitation={false} locale="en" />
    </div>
  );
}
