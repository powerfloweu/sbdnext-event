import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Info, Globe2, ArrowLeft } from "lucide-react";
import { EVENT } from "@/config/event";

export default function EnglishInfoPage() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <Globe2 className="size-4 text-primary" aria-hidden="true" />
            <span className="font-semibold">SBD Next – English guide</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/">
                <ArrowLeft className="size-3.5" />
                Hungarian page
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/#register">Go to registration</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8">
        <section className="mb-8 flex flex-col gap-3">
          <h1 className="text-2xl font-bold">SBD Next – English information for athletes</h1>
          <p className="text-sm text-foreground/90">
            This page explains the main details of the event in English and helps you fill out
            the (Hungarian) registration form correctly.
          </p>
          <p className="text-xs text-muted-foreground">
            The registration form itself is in Hungarian only. If you are unsure about anything,
            contact us at{" "}
            <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
              {EVENT.contact.email}
            </a>
            .
          </p>
        </section>

        <Card className="mb-8">
          <CardContent className="flex flex-col gap-3 p-6 text-sm">
            <div className="flex items-center gap-2">
              <Dumbbell className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-base font-semibold">Event details</h2>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-foreground/90">
              <li>
                <b>Event:</b> SBD Next {EVENT.edition} – Open Powerlifting Competition
              </li>
              <li>
                <b>Location:</b> {EVENT.venue.name}, Budapest ({EVENT.venue.address})
              </li>
              <li>
                <b>Format:</b> Full power (Squat, Bench Press, Deadlift), IPF-style rules
              </li>
              <li>
                <b>Scoring:</b> Based on IPF Points (no weight classes)
              </li>
              <li>
                <b>Registration:</b> your spot is confirmed only after successful payment.
              </li>
              <li>
                <b>Waitlist:</b> if the meet is full, new athletes are placed on a waitlist and
                contacted individually.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="flex flex-col gap-4 p-6 text-sm">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-primary" aria-hidden="true" />
              <h2 className="text-base font-semibold">How to fill out the registration form</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Below: the original Hungarian label → its English meaning. Fields marked{" "}
              <span className="text-primary">*</span> are required.
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <b>Vezetéknév *</b> – Last name / family name
              </div>
              <div>
                <b>Keresztnév *</b> – First name / given name
              </div>
              <div>
                <b>E-mail *</b> – Your contact e-mail address (used for all communication)
              </div>
              <div>
                <b>Egyesület / Klub</b> – Club / team (optional)
              </div>
              <div>
                <b>Születési év *</b> – Year of birth (4 digits, e.g. 1995)
              </div>
              <div>
                <b>Nem *</b> – Sex (&quot;Nő&quot; = female, &quot;Férfi&quot; = male)
              </div>
              <div>
                <b>Újonc / Versenyző *</b> – Division: <b>Újonc</b> = Novice (no national
                championships yet), <b>Versenyző</b> = Competitive (national-level experience)
              </div>
              <div>
                <b>Testsúly / nevezési súlyok *</b> – Planned bodyweight and opening attempts (kg)
                for squat, bench press and deadlift. Keep them realistic — used for flight
                planning.
              </div>
              <div>
                <b>Póló fazon / méret *</b> – T-shirt cut (women&apos;s / men&apos;s) and size
                (XS–4XL). This is the meet shirt included in your entry fee.
              </div>
              <div>
                <b>Prémium média csomag</b> – Optional add-on: 3 photos + 3 videos, priority
                selection.
              </div>
              <div>
                <b>Hozzájárulok…</b> – Consent checkbox: data processing, meet rules, and that
                registration becomes final only after payment.
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="flex flex-col items-center gap-3 text-center text-sm">
          <p className="text-foreground/90">
            When ready, go to the main page and complete the registration form. If you end up on
            the waitlist, you will be contacted by e-mail before you have to pay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/#register">Go to registration form</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Back to Hungarian landing page</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
