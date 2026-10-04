import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewsletterSignupFeedbackGate } from "@/components/forms/newsletter-signup-feedback-gate";
import { EVENT } from "@/config/event";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="SBD Next főoldal">
      <Image
        src="/sbd_next_logo_transparent.png"
        alt=""
        width={40}
        height={40}
        className="size-9 object-contain"
      />
      <span className="font-display text-xl font-extrabold uppercase tracking-wide">
        SBD Next <span className="text-primary">{EVENT.editionRoman}</span>
      </span>
    </Link>
  );
}

export default async function NewsletterThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const { email, error } = await searchParams;

  if (error || !email) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <Logo />
        <AlertCircle className="size-12 text-destructive" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Nem sikerült feliratkoztatni</h1>
          <p className="text-sm text-muted-foreground">
            A linkben nem találtunk érvényes e-mail címet. Iratkozz fel a főoldalon, vagy írj nekünk.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/">Vissza a főoldalra</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Logo />
      <NewsletterSignupFeedbackGate email={email} />
      <Button asChild variant="secondary">
        <Link href="/">Vissza a főoldalra</Link>
      </Button>
    </div>
  );
}
