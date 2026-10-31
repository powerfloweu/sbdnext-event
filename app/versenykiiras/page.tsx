import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CompetitionRulesDocument } from "@/components/event/competition-rules-document";
import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { isAdminEmail } from "@/config/admin";
import { getPhase, volunteersOpen } from "@/lib/phase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SBD Next II – Versenykiírás",
  description: "Az SBD Next II nyílt erőemelő verseny hivatalos versenykiírása.",
};

// Public once the organiser publishes the event's registration content
// (phase leaves "announced") — until then, only the allowlisted admins can
// open this page, so nothing about dates/prices leaks early. Mirrors the
// pre-opening rule already applied to /nevezes and the homepage CTA.
export default async function VersenykiirasPage() {
  const phase = getPhase();

  if (phase === "announced") {
    const auth = await getSupabaseServerAuth();
    const {
      data: { user },
    } = await auth.auth.getUser();

    if (!isAdminEmail(user?.email)) {
      return (
        <div className="relative min-h-screen">
          <Header
            ctaLabel="Értesítést kérek"
            ctaHref="/#register"
            showVolunteerLink={volunteersOpen()}
            navLinks={[{ href: "/#info", label: "SBD Next II" }]}
          />
          <main id="main">
            <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
              <h1 className="text-2xl font-bold">A versenykiírás még nem elérhető.</h1>
              <p className="text-sm text-muted-foreground">Hamarosan közzétesszük.</p>
            </div>
          </main>
          <Footer showInvitation={false} />
        </div>
      );
    }
  }

  return (
    <div className="relative min-h-screen">
      <Header
        ctaLabel="Nevezek"
        ctaHref="/nevezes"
        showVolunteerLink={volunteersOpen() || phase === "closed"}
        navLinks={[{ href: "/#info", label: "SBD Next II" }]}
      />
      <main id="main">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
          {phase === "announced" && (
            <div className="mb-8 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground">
              <ShieldAlert className="size-4 shrink-0 text-primary" aria-hidden="true" />
              Admin előnézet — a nyilvánosság ezt a nevezés megnyitásáig még nem látja.
            </div>
          )}
          <CompetitionRulesDocument />
        </div>
      </main>
      <Footer showInvitation={false} />
    </div>
  );
}
