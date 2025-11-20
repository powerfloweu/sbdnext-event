"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Info, Globe2, ArrowLeft } from "lucide-react";

export default function EnglishInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-neutral-50">
      {/* Top bar */}
      <nav className="sticky top-0 z-40 border-b border-red-900/70 bg-black/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-red-400" />
            <span className="font-semibold">SBD Next – English guide</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                className="border-red-700/60 bg-black/60 text-xs text-red-200 hover:bg-red-600 hover:text-white"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Hungarian page
              </Button>
            </Link>
            <Link href="/#register">
              <Button className="rounded-2xl bg-red-600 px-4 py-1 text-xs font-semibold shadow-[0_0_20px_rgba(248,113,113,0.55)] hover:bg-red-500">
                Go to registration
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 space-y-8">
        {/* Intro */}
        <section className="space-y-3">
          <h1 className="text-2xl font-bold text-red-100">
            SBD Next – English information for athletes
          </h1>
          <p className="text-sm text-neutral-200">
            This page explains the main details of the event in English and
            helps you fill out the (Hungarian) registration form correctly.
          </p>
          <p className="text-xs text-neutral-400">
            The actual registration form is in Hungarian only. If you are unsure
            about anything, you can contact us at{" "}
            <a
              href="mailto:powerlifting@sbdnext.hu"
              className="text-red-300 underline hover:text-red-200"
            >
              powerlifting@sbdnext.hu
            </a>
            .
          </p>
        </section>

        {/* Event info */}
        <section>
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="space-y-3 p-6 text-sm text-neutral-100">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-red-400" />
                <h2 className="text-base font-semibold">Event details</h2>
              </div>

              <ul className="space-y-1 text-sm text-neutral-200">
                <li>
                  <b>Event:</b> SBD Next – Open Powerlifting Competition
                </li>
                <li>
                  <b>Date:</b> 14–15 February 2026
                </li>
                <li>
                  <b>Location:</b> Thor Gym Újbuda, Budapest (Nándorfejérvári út
                  40.)
                </li>
                <li>
                  <b>Format:</b> Full power (Squat, Bench Press, Deadlift),
                  IPF-style rules
                </li>
                <li>
                  <b>Scoring:</b> Based on IPF Points (no weight classes)
                </li>
                <li>
                  <b>Registration:</b> your spot is confirmed only after
                  successful payment.
                </li>
                <li>
                  <b>Waitlist:</b> if the meet is full, new athletes are placed
                  on a waitlist and contacted individually.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Field-by-field explanation */}
        <section>
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="space-y-4 p-6 text-sm text-neutral-100">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-red-400" />
                <h2 className="text-base font-semibold">
                  How to fill out the registration form
                </h2>
              </div>
              <p className="text-xs text-neutral-300">
                Below you can see the original Hungarian label → and its English
                meaning. All fields marked with <span className="text-red-400">
                  *
                </span>{" "}
                are required.
              </p>

              <div className="space-y-3 text-sm">
                <div>
                  <b>Vezetéknév *</b> – Last name / family name
                </div>
                <div>
                  <b>Keresztnév *</b> – First name / given name
                </div>
                <div>
                  <b>E-mail *</b> – Your contact e-mail address (used for all
                  communication)
                </div>
                <div>
                  <b>Egyesület / Klub</b> – Club / team (optional; you can leave
                  it empty or write &quot;independent&quot;)
                </div>
                <div>
                  <b>Születési év *</b> – Year of birth (4 digits, e.g. 1995)
                </div>
                <div>
                  <b>Nem *</b> – Sex (“Nő” = female, “Férfi” = male)
                </div>
                <div>
                  <b>Újonc / Versenyző *</b> – Division:  
                  <br />– <b>Újonc</b> = Novice lifter (no national
                  championships yet)  
                  <br />– <b>Versenyző</b> = Competitive lifter (national-level
                  experience / qualification)
                </div>

                <div>
                  <b>Guggolás / Fekvenyomás / Felhúzás – nevezési súly (kg) *</b>{" "}
                  – Your planned <b>opening attempts</b> in kilograms for squat,
                  bench press, and deadlift. Please keep them realistic, they
                  are used for flight planning.
                </div>

                <div>
                  <b>Póló fazon *</b> – T-shirt cut / fit:  
                  <br />– “Női” = women&apos;s fit  
                  <br />– “Férfi” = men&apos;s/unisex fit
                </div>

                <div>
                  <b>Pólóméret (SBD póló) *</b> – T-shirt size (SBD sizing,
                  XS–4XL). This is the meet shirt you will receive.
                </div>

                <div>
                  <b>Rólad / bemondó szöveg</b> – Short MC text about you
                  (optional): how long you have been lifting, goals, fun facts
                  etc. This may be read out during the competition.
                </div>

                <div>
                  <b>Megjegyzés, kérés a szervezőknek</b> – Extra notes for the
                  organizers (optional): e.g. language needs, medical info,
                  anything we should be aware of.
                </div>

                <div>
                  <b>Prémium média csomag</b> – Tick this checkbox if you want
                  to buy the <b>Premium media package</b> (3 photos + 3 videos,
                  priority selection). If you leave it empty, you still receive
                  the base media coverage included in the entry fee.
                </div>

                <div>
                  <b>Hozzájárulok az adataim kezeléséhez… *</b> – Consent
                  checkbox: you must accept data processing, rules of the meet,
                  and that your registration becomes final only after payment.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="space-y-3 text-center text-sm">
          <p className="text-neutral-200">
            When you are ready, go to the main page and complete the
            registration form. If you end up on the waitlist, you will be
            contacted by e-mail before you have to pay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/#register">
              <Button className="rounded-2xl bg-red-600 px-6 py-2 text-sm font-semibold shadow-[0_0_24px_rgba(248,113,113,0.7)] hover:bg-red-500">
                Go to registration form
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="border-neutral-700 bg-black/60 text-xs text-neutral-200 hover:bg-neutral-900"
              >
                Back to Hungarian landing page
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}