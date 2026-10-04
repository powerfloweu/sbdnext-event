import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { RegistrationWizard } from "@/components/forms/registration-wizard/registration-wizard";
import { EVENT } from "@/config/event";
import { getPhase } from "@/lib/phase";

export const revalidate = 60;

function ClosedNotice() {
  const phase = getPhase();
  const heading = phase === "closed" || phase === "live" || phase === "post" ? "A nevezés lezárult." : "A nevezés még nem indult el.";
  const target = phase === "announced" ? EVENT.registration.opensAt : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <AlertCircle className="size-10 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <p className="text-sm text-muted-foreground">
          A nevezési időszak:{" "}
          <b className="text-foreground">
            {new Intl.DateTimeFormat("hu-HU", { month: "long", day: "numeric" }).format(
              new Date(EVENT.registration.opensAt)
            )}
          </b>{" "}
          –{" "}
          <b className="text-foreground">
            {new Intl.DateTimeFormat("hu-HU", { month: "long", day: "numeric" }).format(
              new Date(EVENT.registration.closesAt)
            )}
          </b>
        </p>
      </div>
      {target && (
        <Card>
          <CardContent className="flex flex-col gap-1 p-5">
            <span className="eyebrow">Várható indulásig</span>
            <CountdownTimer target={target} className="font-display text-3xl font-bold tabular-nums" />
          </CardContent>
        </Card>
      )}
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
