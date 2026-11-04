import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EVENT } from "@/config/event";

// English translation of app/adatkezeles/page.tsx. Same caveat applies: the
// organiser hasn't supplied a final privacy notice yet, so this is a
// translation of the interim placeholder, not an official document. Keep
// both pages in sync if the Hungarian text changes before the real notice
// lands (see docs/UI_UX_ROBUSTNESS_PLAN.md section 9, open question 3).
export default function PrivacyPageEn() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href="/en"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-4 p-8 text-sm text-foreground/90">
          <h1 className="text-2xl font-bold">Privacy notice</h1>
          <p className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-foreground">
            This page is a placeholder for now. The organiser will provide the final privacy
            notice text later — until then, don&apos;t treat this as an official notice. (This is
            a translation of the Hungarian interim placeholder at{" "}
            <Link href="/adatkezeles" className="underline">
              /adatkezeles
            </Link>
            .)
          </p>
          <p>
            Data submitted during registration and volunteer sign-up (name, e-mail address, year
            of birth, bodyweight, planned opening attempts, shirt details) is used solely to
            organise the competition, build the flight schedule, and get in touch with you.
          </p>
          <p>
            If you have any questions, write to us at{" "}
            <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
              {EVENT.contact.email}
            </a>
          </p>
          <Button asChild variant="secondary" className="self-start">
            <Link href="/en">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
