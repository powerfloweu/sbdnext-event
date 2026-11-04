import { ShieldCheck, Trophy, MapPin, Gavel, Users, Gift, Flag } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { WeightClassTable } from "@/components/event/weight-class-table";
import { EVENT } from "@/config/event";

// English translation of components/event/competition-rules-document.tsx.
// Entry/shirt/premium prices are pulled live from EVENT.feesEur instead of
// being hardcoded, same reasoning as the Hungarian version — and likewise
// states no fixed registration deadline, since that schedule isn't final.

function DocSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6 text-sm text-foreground sm:p-8">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-bold uppercase tracking-wide text-foreground sm:text-lg">{title}</h2>
        </div>
        <div className="flex flex-col gap-3 text-muted-foreground [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompetitionRulesDocumentEn() {
  const amount = (value: number) => `€${value}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <span className="eyebrow">Official competition rules</span>
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
          SBD Next <span className="text-primary">II</span>
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Open powerlifting competition
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 rounded-xl border border-border bg-card px-6 py-4">
          {/* eslint-disable @next/next/no-img-element */}
          <img src="/sbd_logo_transparent.png" alt="SBD Hungary" className="h-10 w-auto object-contain sm:h-12" />
          <img src="/powerflow_logo.png" alt="PowerFlow" className="h-10 w-auto object-contain sm:h-12" />
          <img
            src="/thor_gym_logo.png"
            alt="Thor Gym Újbuda"
            className="h-9 w-auto rounded-md bg-white/90 object-contain px-2 py-1 sm:h-10"
          />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
      </div>

      <DocSection icon={Flag} title="Purpose">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            To offer a competition under IPF and Hungarian Powerlifting Federation (MERSZ) rules, with{" "}
            <strong>no</strong> competition license or club membership required.
          </li>
          <li>
            To give competitors and spectators the highest possible standard of grassroots competition
            experience, atmosphere and media coverage.
          </li>
        </ol>
      </DocSection>

      <DocSection icon={Users} title="Organisers">
        <p>
          <strong>Main organiser:</strong> SBD Hungary (
          <a href="https://sbdhungary.hu" target="_blank" rel="noopener noreferrer">
            sbdhungary.hu
          </a>
          ),{" "}
          <a href="https://app.power-flow.eu" target="_blank" rel="noopener noreferrer">
            Power Flow EU
          </a>
        </p>
        <p>
          <strong>Co-organisers:</strong> Thor Gym Újbuda (
          <a href="https://ujbuda.thorgym.hu/" target="_blank" rel="noopener noreferrer">
            ujbuda.thorgym.hu
          </a>
          ),{" "}
          <a href="https://bunnymedia.hu" target="_blank" rel="noopener noreferrer">
            Bunnymedia.hu
          </a>
        </p>
        <p>Approved and supported by the Hungarian Powerlifting Federation (MERSZ).</p>
      </DocSection>

      <DocSection icon={MapPin} title="Venue and date">
        <p>
          <strong>13–14 February 2027</strong>
        </p>
        <p>{EVENT.venue.address}, {EVENT.venue.name}</p>
        <p>{EVENT.venue.parkingEn}</p>
      </DocSection>

      <DocSection icon={Gavel} title="Competition format">
        <p>
          A three-lift (squat/bench/deadlift) powerlifting competition under MERSZ rules. Weigh-in two
          hours before the start of each category&apos;s flight. Equipment doesn&apos;t need to be
          pre-checked, but gear not permitted under the rules may first be warned and later disqualified.
        </p>
        <p>
          <strong>Note:</strong> from 1 January 2027 the IPF approved equipment list changes — stiff knee
          sleeves affected by that rule change will not be allowed at SBD Next II either. If in doubt, ask
          the weigh-in officials.
        </p>
        <p>
          Only raw (classic) powerlifting equipment approved under the IPF and MERSZ rules effective 1
          January 2027 may be used. Knee wraps and supportive apparel are not permitted. In the Rookie
          category, form-fitting leggings or shorts may be worn instead of the singlet.
        </p>
        <p>Flight order and exact session times will be published once registration closes.</p>
      </DocSection>

      <DocSection icon={Trophy} title="Categories">
        <p className="font-semibold text-foreground">Rookie</p>
        <p>
          Men&apos;s and women&apos;s Rookie: no weight-class or age-group restriction, age 14+, ranked by
          IPF GL points. Open to lifters who:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>did not compete at the MERSZ first-division national championship or an IPF international competition in 2025 and/or 2026, OR</li>
          <li>did not compete at an equivalent national-level competition of another IPF member federation in 2025–2026.</li>
        </ul>
        <p>
          Having competed at a Hungarian second-division (or lower) competition does not exclude a lifter
          from the Rookie category.
        </p>

        <p className="mt-2 font-semibold text-foreground">Lifter</p>
        <p>
          Men&apos;s and women&apos;s Lifter: no weight-class or age-group restriction, age 14+, ranked by
          IPF GL points. Open to lifters who:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>competed at the MERSZ 2025 or 2026 Adult National Championship, OR</li>
          <li>have hit the Open first-division (Class I) powerlifting total at an official MERSZ competition since 1 January 2025,</li>
          <li>or, for foreign lifters, whose result with any IPF member federation reaches the Hungarian first-division standard.</li>
        </ul>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-foreground">
          MERSZ first-division (Open) standards
        </p>
        <WeightClassTable
          groups={[
            {
              label: "Women",
              rows: [
                ["47", "250"],
                ["52", "275"],
                ["57", "300"],
                ["63", "320"],
                ["69", "340"],
                ["76", "360"],
                ["84", "375"],
                ["84+", "380"],
              ],
            },
            {
              label: "Men",
              rows: [
                ["59", "480"],
                ["66", "515"],
                ["74", "545"],
                ["83", "620"],
                ["93", "650"],
                ["105", "680"],
                ["120", "690"],
                ["120+", "700"],
              ],
            },
          ]}
          weightLabel="Bodyweight (kg)"
          totalLabel="Total (kg)"
        />
      </DocSection>

      <DocSection icon={ShieldCheck} title="Judges and records">
        <p>Official MERSZ referees will judge the competition. There will be no jury.</p>
        <p>SBD Next is a recreational meet, so national records cannot be set.</p>
      </DocSection>

      <DocSection icon={Gift} title="Entry fees and prizes">
        <p>
          <strong>Entry fee:</strong> {amount(EVENT.feesEur.entryBase)}
        </p>
        <p>
          <strong>Entry + shirt:</strong> {amount(EVENT.feesEur.entryWithShirt)}
        </p>
        <p>
          <strong>Premium media package</strong> (optional add-on): +{amount(EVENT.feesEur.premiumMedia)}
        </p>
        <p>
          We&apos;ll publish the exact registration process and deadline on the website once registration
          opens.
        </p>
        <p>
          Note: entry is limited and on a first-come, first-served basis. The system closes registration
          automatically once the maximum number of entry slots is filled.
        </p>
        <p className="mt-2 font-semibold text-foreground">Prizes</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Medals for 1st–3rd place in each category. A certificate for every participant.</li>
          <li>A featured gift package for every category&apos;s podium finishers.</li>
          <li>
            Free downloadable photos of every competitor (a premium subscription gets the full photo and
            video package).
          </li>
          <li>
            A custom, name-printed SBD competition shirt: orderable for an extra fee as part of
            the Entry + shirt package, not included in the standard entry fee.
          </li>
        </ul>
      </DocSection>
    </div>
  );
}
