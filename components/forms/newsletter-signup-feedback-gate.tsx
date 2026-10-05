"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { NewsletterFeedbackForm } from "@/components/forms/newsletter-feedback-form";

interface NewsletterSignupFeedbackGateProps {
  email: string;
}

export function NewsletterSignupFeedbackGate({ email }: NewsletterSignupFeedbackGateProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!confirmed) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col gap-3 p-5 text-left">
          <h1 className="text-xl font-bold text-foreground">Mielőtt továbbmennél…</h1>
          <NewsletterFeedbackForm email={email} onDone={() => setConfirmed(true)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Feliratkoztál!</h1>
        <p className="text-sm text-muted-foreground">
          A(z) <b className="text-foreground">{email}</b> címre írunk, amint megnyílik a nevezés.
        </p>
      </div>
    </>
  );
}
