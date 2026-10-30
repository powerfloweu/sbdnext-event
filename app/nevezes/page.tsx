import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RegistrationWizard } from "@/components/forms/registration-wizard/registration-wizard";
import { EarlyAccessGate } from "@/components/forms/early-access-gate";
import { AdminTestBanner } from "@/components/admin/admin-test-banner";
import { EVENT } from "@/config/event";
import { getPhase } from "@/lib/phase";
import { isAdminTestActive } from "@/lib/admin-test";

export const revalidate = 60;

// Deliberately just a status line + a way back — no dates, no countdown.
// D (2026-10-22): showing an expected opening date/time here was something
// nobody asked for; drop it rather than word it more carefully. The
// EarlyAccessGate's own countdown (shown only once early access is
// actually live, 17:00–18:00) is a different thing — people already on
// that gate are seconds away from the public opening, not reading an
// announcement made weeks ahead — so it's untouched here.
function ClosedNotice() {
  const phase = getPhase();
  const heading = phase === "closed" || phase === "live" || phase === "post" ? "A nevezés lezárult." : "A nevezés még nem indult el.";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Image
        src="/sbd_next_logo_transparent.png"
        alt="SBD Next"
        width={56}
        height={56}
        className="size-12 object-contain"
      />
      <AlertCircle className="size-10 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-bold">{heading}</h1>
      <Button asChild variant="secondary">
        <Link href="/">Vissza a főoldalra</Link>
      </Button>
    </div>
  );
}

export default async function RegisterPage() {
  const phase = getPhase();

  if (phase === "early-access") {
    return (
      <EarlyAccessGate opensAt={EVENT.registration.opensAt}>
        <RegistrationWizard />
      </EarlyAccessGate>
    );
  }

  if (phase !== "registration") {
    // Lets D/Miki run the real wizard before the public opening — started
    // from /admin's "Teszt nevezés" tab. Only reachable with the admin-test
    // cookie AND a live admin session (re-checked here, not trusted from
    // the cookie alone).
    if (await isAdminTestActive()) {
      return (
        <>
          <AdminTestBanner />
          <RegistrationWizard />
        </>
      );
    }
    return <ClosedNotice />;
  }

  return <RegistrationWizard />;
}
