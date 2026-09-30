import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EVENT } from "@/config/event";

export default async function ThankYouPage({
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
        <h1 className="text-2xl font-bold">
          {isWaitlist ? "Felkerültél a várólistára" : "Köszönjük a nevezésed!"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isWaitlist
            ? "A nevezői létszám jelenleg betelt, de a jelentkezésed várólistára került. Ha felszabadul hely, e-mailben keresünk."
            : "Hamarosan e-mailben visszaigazoljuk a nevezésed és a fizetésed."}
        </p>
      </div>
      <Card className="w-full">
        <CardContent className="flex flex-col gap-2 p-5 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nevezés azonosító</span>
            <span className="font-mono text-xs text-foreground">{rid ?? "—"}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ha bármi elírást vettél észre, vagy elmaradt a visszaigazoló e-mail, írj nekünk a{" "}
            <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
              {EVENT.contact.email}
            </a>{" "}
            címen — add meg az azonosítót is.
          </p>
        </CardContent>
      </Card>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="secondary">
          <Link href="/">Vissza a főoldalra</Link>
        </Button>
        <Button asChild>
          <Link href={`/weight?rid=${rid ?? ""}`}>Testsúly frissítése</Link>
        </Button>
      </div>
    </div>
  );
}
