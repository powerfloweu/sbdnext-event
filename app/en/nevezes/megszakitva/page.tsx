import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EVENT } from "@/config/event";

export const metadata: Metadata = {
  title: "SBD Next II – Payment interrupted",
  description: "Your SBD Next II registration was saved, but the payment didn't go through.",
};

export default async function EnglishCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string; code?: string }>;
}) {
  const { rid, code } = await searchParams;
  const retryHref = code ? `/en/nevezes?code=${encodeURIComponent(code)}` : "/en/nevezes";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <XCircle className="size-12 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Payment was interrupted</h1>
        <p className="text-sm text-muted-foreground">
          Your registration details were saved — only the payment didn&apos;t go through. You can come
          back and finish it any time.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="secondary">
          <Link href="/en">Back to the homepage</Link>
        </Button>
        <Button asChild>
          <Link href={retryHref}>Try payment again</Link>
        </Button>
      </div>
      {rid && (
        <p className="text-xs text-muted-foreground">
          If it still doesn&apos;t work, write to us at{" "}
          <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
            {EVENT.contact.email}
          </a>{" "}
          with this ID: <span className="font-mono">{rid}</span>
        </p>
      )}
    </div>
  );
}
