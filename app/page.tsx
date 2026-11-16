import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { StickyMobileCta } from "@/components/site/sticky-cta";
import { SponsorGrid } from "@/components/site/sponsor-grid";
import { FogGlow } from "@/components/site/fog-glow";
import { Hero } from "@/components/event/hero";
import { KeyFacts } from "@/components/event/key-facts";
import { RegistrationTeaser } from "@/components/event/registration-teaser";
import { InfoSection } from "@/components/event/info-section";
import { ListsSection } from "@/components/event/lists-section";
import { ScheduleSection } from "@/components/event/schedule-section";
import { RulesSection } from "@/components/event/rules-section";
import { FeesSection } from "@/components/event/fees-section";
import { VenueSection } from "@/components/event/venue-section";
import { PhotoStrip } from "@/components/event/photo-strip";
import { MoodVideoRow } from "@/components/event/mood-video";
import { FaqSection } from "@/components/event/faq-section";
import { VolunteerCta } from "@/components/event/volunteer-cta";

import { getPhase, volunteersOpen } from "@/lib/phase";
import { getHomeContent } from "@/lib/home-content";
import { getSchedule } from "@/lib/sheets";

export const revalidate = 60;

// Both content.showCapacity and content.showLists are off for now (see
// lib/home-content.ts) — the real capacity number and entry list aren't
// wired up yet, so there's nothing here that needs real registration data.
const EMPTY_LEADERBOARDS = { ujoncNoi: [], ujoncFerfi: [], versenyzoNoi: [], versenyzoFerfi: [] };

export default async function HomePage() {
  const phase = getPhase();
  const content = getHomeContent(phase);

  const [leaderboards, schedule] = await Promise.all([Promise.resolve(EMPTY_LEADERBOARDS), getSchedule()]);

  const navLinks = [
    content.showInfoSection && { href: "#info", label: "Infók" },
    content.showLists && { href: "#lists", label: "Nevezési lista" },
    content.showSchedule && { href: "#schedule", label: "Időrend" },
    { href: "#fees", label: "Nevezés", emphasized: true },
    content.showFaq && { href: "#faq", label: "GYIK" },
    { href: "/eredmenyek", label: "SBD Next I Eredmények", wordmarkRoman: "I" },
  ].filter((l): l is { href: string; label: string } => Boolean(l));

  return (
    <div className="relative min-h-screen">
      {phase === "announced" && <FogGlow />}

      <Header
        ctaLabel={content.headerCtaLabel ?? content.primaryCta.label}
        ctaHref={content.primaryCta.href}
        showVolunteerLink={volunteersOpen() || phase === "closed"}
        navLinks={navLinks}
      />

      <main id="main">
        <Hero
          dateLabel={content.dateLabel}
          timeLabel={content.timeLabel}
          badgeLabel={content.badgeLabel}
          badgeTone={content.badgeTone}
          description={content.description}
          primaryCta={phase === "announced" ? null : content.primaryCta}
          secondaryCta={content.secondaryCta}
          countdown={content.countdown}
          capacity={null}
        />

        {content.showKeyFacts && <KeyFacts />}

        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          {content.showRegistrationTeaser && (
            <RegistrationTeaser
              ctaLabel={content.registrationCtaLabel}
              ctaHref={content.registrationCtaHref}
              note={content.registrationNote}
              earlyAccessNote={content.earlyAccessNote}
              notifyForm={phase === "announced"}
            />
          )}

          {content.showLists && <ListsSection data={leaderboards} updatedLabel="Percenként frissül" />}

          {content.showInfoSection && <InfoSection />}

          {content.showSchedule && <ScheduleSection rows={schedule} />}

          {content.showRules && <RulesSection />}

          <FeesSection />

          <MoodVideoRow />

          <VenueSection />
        </div>

        <PhotoStrip />

        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          {content.showFaq && <FaqSection />}

          {content.showVolunteerCta && <VolunteerCta />}

          <div className="py-12">
            <SponsorGrid />
          </div>
        </div>
      </main>

      <Footer showInvitation />

      {phase === "registration" && (
        <>
          <div className="h-20 lg:hidden" aria-hidden="true" />
          <StickyMobileCta label="Nevezés nyitva" sublabel="Ne várj sokat!" href="/nevezes" />
        </>
      )}
    </div>
  );
}
