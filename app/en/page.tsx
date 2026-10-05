import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Info, ArrowLeft } from "lucide-react";

import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SponsorGrid } from "@/components/site/sponsor-grid";
import { FogGlow } from "@/components/site/fog-glow";
import { Hero } from "@/components/event/hero";
import { RegistrationTeaser } from "@/components/event/registration-teaser";
import { FeesTeaser } from "@/components/event/fees-teaser";
import { VenueSection } from "@/components/event/venue-section";
import { PhotoStrip } from "@/components/event/photo-strip";
import { MoodVideoRow } from "@/components/event/mood-video";

import { EVENT } from "@/config/event";
import { getPhase } from "@/lib/phase";

export const revalidate = 60;

// This page mirrors app/page.tsx, translated. It's only fully translated for
// the "announced" teaser phase, since that's the only phase actually live
// right now — the rest of the Hungarian site (heat sheets, rulebook, FAQ)
// isn't localized yet. Once registration opens, this falls back to a
// (still real, chrome-wrapped) English guide to the Hungarian entry form,
// same as before, rather than showing a half-translated mix.
export default function EnglishPage() {
  const phase = getPhase();

  if (phase === "announced") {
    return (
      <div className="relative min-h-screen">
        <FogGlow />

        <Header
          ctaLabel="Notify me"
          ctaHref="#register"
          showVolunteerLink={false}
          navLinks={[]}
          locale="en"
        />

        <main id="main">
          <Hero
            dateLabel="February 2027 (to be finalized)"
            timeLabel="Details coming soon"
            badgeLabel="Registration and details coming soon"
            badgeTone="neutral"
            description="The next level. An open powerlifting competition for novice and competitive lifters, under IPF rules."
            primaryCta={{ label: "Notify me", href: "#register" }}
            secondaryCta={null}
            countdown={null}
            capacity={null}
            locale="en"
          />

          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <RegistrationTeaser
              ctaLabel="Follow @sbd.hungary on Instagram"
              ctaHref={EVENT.social.igSbd}
              note="We'll announce the exact date and registration details soon. Sign up to be the first to know by e-mail the moment registration opens!"
              notifyForm
              locale="en"
            />

            <FeesTeaser locale="en" />

            <MoodVideoRow locale="en" />

            <VenueSection locale="en" />
          </div>

          <PhotoStrip locale="en" />

          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <div className="py-12">
              <SponsorGrid locale="en" />
            </div>
          </div>
        </main>

        <Footer showInvitation={false} locale="en" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Header
        ctaLabel="Go to registration"
        ctaHref="/#register"
        showVolunteerLink={false}
        navLinks={[]}
        locale="en"
      />

      <main id="main" className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        <section className="mb-8 flex flex-col gap-3">
          <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Hungarian page
          </Link>
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
                <b>Event:</b> SBD Next {EVENT.editionRoman} – Open Powerlifting Competition
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

      <Footer locale="en" />
    </div>
  );
}
