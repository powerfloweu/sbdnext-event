import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EVENT } from "@/config/event";

export default async function CancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string }>;
}) {
  const { rid } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <XCircle className="size-12 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">A fizetés megszakadt</h1>
        <p className="text-sm text-muted-foreground">
          A nevezési adataid megvannak, csak a fizetés maradt ki. Bármikor visszatérhetsz és
          befejezheted.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="secondary">
          <Link href="/">Vissza a főoldalra</Link>
        </Button>
        <Button asChild>
          <Link href="/nevezes">Fizetés újra</Link>
        </Button>
      </div>
      {rid && (
        <p className="text-xs text-muted-foreground">
          Ha nem sikerül, írj nekünk a{" "}
          <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
            {EVENT.contact.email}
          </a>{" "}
          címen, add meg ezt az azonosítót: <span className="font-mono">{rid}</span>
        </p>
      )}
    </div>
  );
}
