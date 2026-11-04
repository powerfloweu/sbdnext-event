import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EVENT } from "@/config/event";

export default async function EnglishThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string; waitlist?: string }>;
}) {
  const { rid, waitlist } = await searchParams;
  const isWaitlist = waitlist === "1";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{isWaitlist ? "You're on the waitlist" : "Thanks for registering!"}</h1>
        <p className="text-sm text-muted-foreground">
          {isWaitlist
            ? "Entry capacity is currently full, so your registration has been placed on the waitlist. We'll e-mail you if a spot opens up."
            : "We'll e-mail you a confirmation of your registration and payment shortly."}
        </p>
      </div>
      <Card className="w-full">
        <CardContent className="flex flex-col gap-2 p-5 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Registration ID</span>
            <span className="font-mono text-xs text-foreground">{rid ?? "—"}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            If you noticed a typo, or didn&apos;t get the confirmation e-mail, write to us at{" "}
            <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
              {EVENT.contact.email}
            </a>{" "}
            — please include your registration ID.
          </p>
        </CardContent>
      </Card>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="secondary">
          <Link href="/en">Back to the homepage</Link>
        </Button>
        <Button asChild>
          <Link href={`/weight?rid=${rid ?? ""}`}>Update bodyweight</Link>
        </Button>
      </div>
    </div>
  );
}
