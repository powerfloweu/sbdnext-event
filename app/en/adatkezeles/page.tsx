import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EVENT } from "@/config/event";

// English translation of app/adatkezeles/page.tsx. Keep in sync if the
// Hungarian text changes. Still a draft — see the [TO FILL IN] placeholders.
export default function PrivacyPageEn() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/en"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-6 p-8 text-sm text-foreground/90">
          <div>
            <h1 className="text-2xl font-bold">Privacy notice</h1>
            <p className="mt-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-foreground">
              This notice is still a draft. The organiser will fill in the [TO FILL IN] parts
              with final details and review the rest before this becomes the official privacy
              notice. (Translation of{" "}
              <Link href="/adatkezeles" className="underline">
                /adatkezeles
              </Link>
              .)
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold">1. Data controller</h2>
            <p className="mt-2">
              The controller of sbdnext.hu and the SBD Next competition is [TO FILL IN: company
              / sole trader name], registered address: [TO FILL IN: address], company
              registration number: [TO FILL IN], tax number: [TO FILL IN].
            </p>
            <p className="mt-2">
              Contact:{" "}
              <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
                {EVENT.contact.email}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">2. What we collect, and why</h2>

            <h3 className="mt-3 font-semibold">Registration</h3>
            <p className="mt-1">
              The data you submit when registering (name, e-mail address, year of birth, sex,
              division, club, bodyweight, planned opening attempts, shirt details, notes) is
              used solely to run the competition — weigh-ins, the flight schedule, collecting
              the entry fee, and getting in touch with you.
            </p>
            <p className="mt-1">
              If you upload a face photo with your registration, we use it to prepare for the
              competition (e.g. check-in, identifying athletes). Uploading a face photo is
              optional, and only organisers and admins who need it for their work can access
              it.
            </p>
            <p className="mt-1">
              If you competed at a previous SBD Next, the registration form can pre-fill your
              details from last year (matched by e-mail, or by name and year of birth). This is
              a convenience feature, not an account or login.
            </p>

            <h3 className="mt-3 font-semibold">Payment</h3>
            <p className="mt-1">
              The entry fee and optional add-ons (e.g. premium media) are paid through Stripe.
              We never see or store your card details — Stripe handles them directly, under its
              own privacy policy.
            </p>

            <h3 className="mt-3 font-semibold">E-mails</h3>
            <p className="mt-1">
              Registration confirmations, payment and edit links, and face-photo reminder
              e-mails are sent through Resend.
            </p>

            <h3 className="mt-3 font-semibold">Newsletter</h3>
            <p className="mt-1">
              If you sign up for the newsletter (e.g. as a past competitor, or for early-access
              registration alerts), we store your e-mail address, and the newsletter is sent
              through GMass from powerlifting@sbdnext.hu. You can unsubscribe at any time using
              the link in the e-mails.
            </p>

            <h3 className="mt-3 font-semibold">Feedback</h3>
            <p className="mt-1">
              Any optional feedback you leave on the newsletter confirmation page ("how could we
              make the competition even better") is stored together with your newsletter
              sign-up, so we can improve future events.
            </p>

            <h3 className="mt-3 font-semibold">Site usage</h3>
            <p className="mt-1">
              We measure site traffic with Vercel Analytics, which doesn&apos;t use cookies and
              doesn&apos;t tie visits to an individual identifier — it only gives us anonymised,
              aggregate statistics (e.g. how many people opened the registration page).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">3. Who else processes your data</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Supabase</strong> — stores registration data and face photos (database
                and private file storage).
              </li>
              <li>
                <strong>Stripe</strong> — processes payment of the entry fee and add-on
                packages.
              </li>
              <li>
                <strong>Resend</strong> — sends registration, payment and edit-related e-mails.
              </li>
              <li>
                <strong>Vercel</strong> — hosts the website and provides the anonymised traffic
                statistics described above (Vercel Analytics).
              </li>
              <li>
                <strong>Google (Google Sheets) and Make.com</strong> — part of the registration
                data is also forwarded to the organisers&apos; internal working spreadsheet
                (Google Sheets), via the Make.com automation service, so the organisers can work
                with the registration list without manual admin work.
              </li>
              <li>
                <strong>GMass</strong> — sends the newsletter.
              </li>
            </ul>
            <p className="mt-2">
              These providers process your data under their own privacy policies, within the
              scope of what we ask them to do, and never use it for their own purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">4. Legal basis</h2>
            <p className="mt-2">
              Registration and payment data is processed on the basis of performing the
              contract between you and us as organiser (making sure you can take part in the
              competition). Newsletter sign-up and optional feedback are processed on the basis
              of your consent, which you can withdraw at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">5. How long we keep your data</h2>
            <p className="mt-2">
              We keep registration data after the competition for [TO FILL IN: e.g. as required
              by accounting/record-keeping rules, and to make next year&apos;s registration
              easier]. Face photos are deleted after the competition is over. Newsletter
              sign-up data is kept until you unsubscribe or withdraw consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">6. Your rights</h2>
            <p className="mt-2">
              You can ask us what data we hold about you, request that it be corrected or
              deleted, ask us to restrict processing, or object to the processing. For any of
              this, or any other question about how we handle your data, write to us at{" "}
              <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
                {EVENT.contact.email}
              </a>
              .
            </p>
            <p className="mt-2">
              If you believe we are processing your data unlawfully, you can lodge a complaint
              with the Hungarian National Authority for Data Protection and Freedom of
              Information (NAIH, 1055 Budapest, Falk Miksa utca 9-11., Hungary, www.naih.hu).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">7. Data security</h2>
            <p className="mt-2">
              Registration data and face photos are stored in private, non-public systems. We
              never make this data publicly accessible — only aggregated or anonymised figures
              needed to run the competition (e.g. the number of entrants per division) appear
              on the website or in our communication.
            </p>
          </section>

          <Button asChild variant="secondary" className="self-start">
            <Link href="/en">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
