import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterFeedbackForm } from "@/components/forms/newsletter-feedback-form";

export default async function NewsletterThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const { email, error } = await searchParams;

  if (error || !email) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
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
      <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Feliratkoztál!</h1>
        <p className="text-sm text-muted-foreground">
          A(z) <b className="text-foreground">{email}</b> címre írunk, amint megnyílik a nevezés.
        </p>
      </div>
      <Card className="w-full">
        <CardContent className="p-5 text-left">
          <NewsletterFeedbackForm email={email} />
        </CardContent>
      </Card>
      <Button asChild variant="secondary">
        <Link href="/">Vissza a főoldalra</Link>
      </Button>
    </div>
  );
}
