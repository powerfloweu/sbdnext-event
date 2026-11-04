import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RegistrationWizard } from "@/components/forms/registration-wizard/registration-wizard";

export const revalidate = 0;

const title = "SBD Next II – Registration";
const description = "Register for SBD Next II, 13–14 February 2027 at Thor Gym, Budapest.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: "/photos/hero-desktop.jpg", width: 1600, height: 900, alt: "SBD Next" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/photos/hero-desktop.jpg"],
  },
};

// English registration, gated by a secret invite code (?code=...) given out
// by D to a specific invited group (e.g. foreign athletes) ahead of the
// public opening — see app/api/register/route.ts's isValidInviteCode and
// the project thread "Ellenőrizni az angol nevezési flót" (2026-11-04). The
// code is re-checked server-side on submit; this page only decides whether
// to show the form at all. No code in the URL → treated the same as
// registration not being open yet, same spirit as app/nevezes/page.tsx's
// ClosedNotice (no dates, no hint of what's coming).
function NotOpenNotice() {
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
      <h1 className="text-2xl font-bold">Registration hasn&apos;t started yet.</h1>
      <Button asChild variant="secondary">
        <Link href="/en">Back to the homepage</Link>
      </Button>
    </div>
  );
}

export default async function EnglishRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return <NotOpenNotice />;
  }

  return <RegistrationWizard locale="en" inviteCode={code} />;
}
