import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RegistrationWizard } from "@/components/forms/registration-wizard/registration-wizard";
import { getPhase } from "@/lib/phase";

export const revalidate = 60;

// Deliberately just a status line + a way back — no dates, no countdown.
// D (2026-10-22): showing an expected opening date/time here was something
// nobody asked for; drop it rather than word it more carefully.
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

export default function RegisterPage() {
  const phase = getPhase();

  if (phase !== "registration") {
    return <ClosedNotice />;
  }

  return <RegistrationWizard />;
}
