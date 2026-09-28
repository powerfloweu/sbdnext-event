import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { StickyMobileCta } from "@/components/site/sticky-cta";
import { SponsorGrid } from "@/components/site/sponsor-grid";
import { Hero } from "@/components/event/hero";
import { KeyFacts } from "@/components/event/key-facts";
import { RegistrationTeaser } from "@/components/event/registration-teaser";
import { InfoSection } from "@/components/event/info-section";
import { ListsSection } from "@/components/event/lists-section";
import { ScheduleSection } from "@/components/event/schedule-section";
import { RulesSection } from "@/components/event/rules-section";
import { FeesSection } from "@/components/event/fees-section";
import { FeesTeaser } from "@/components/event/fees-teaser";
import { VenueSection } from "@/components/event/venue-section";
import { PhotoStrip } from "@/components/event/photo-strip";
import { FaqSection } from "@/components/event/faq-section";
import { VolunteerCta } from "@/components/event/volunteer-cta";

import { EVENT } from "@/config/event";
import { getPhase, volunteersOpen } from "@/lib/phase";
import { getHomeContent } from "@/lib/home-content";
import { getAllLeaderboards, getSchedule } from "@/lib/sheets";

export const revalidate = 60;

export default async function HomePage() {
  const phase = getPhase();
  const content = getHomeContent(phase);

  const [leaderboards, schedule] = await Promise.all([getAllLeaderboards(), getSchedule()]);

  const totalRegistered = Object.values(leaderboards).reduce((sum, rows) => sum + rows.length, 0);

  const navLinks = [
    content.showInfoSection && { href: "#info", label: "Infók" },
    content.showLists && { href: "#lists", label: "Nevezési lista" },
    content.showSchedule && { href: "#schedule", label: "Időrend" },
    phase !== "announced" && { href: "#fees", label: "Díjak" },
    content.showFaq && { href: "#faq", label: "GYIK" },
  ].filter((l): l is { href: string; label: string } => Boolean(l));

  return (
    <div className="relative min-h-screen">
      <Header
        ctaLabel={content.primaryCta.label}
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
          primaryCta={content.primaryCta}
          secondaryCta={content.secondaryCta}
          countdown={content.countdown}
          capacity={content.showCapacity ? { used: totalRegistered, limit: EVENT.registration.capacity } : null}
        />

        {content.showKeyFacts && <KeyFacts />}

        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          {content.showRegistrationTeaser && (
            <RegistrationTeaser
              ctaLabel={content.registrationCtaLabel}
              ctaHref={content.registrationCtaHref}
              note={content.registrationNote}
              notifyForm={phase === "announced"}
            />
          )}

          {content.showLists && <ListsSection data={leaderboards} updatedLabel="Percenként frissül" />}

          {content.showInfoSection && <InfoSection />}

          {content.showSchedule && <ScheduleSection rows={schedule} />}

          {content.showRules && <RulesSection />}

          {phase === "announced" ? <FeesTeaser /> : <FeesSection />}

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

      <Footer showInvitation={phase !== "announced"} />

      {phase === "registration" && (
        <>
          <div className="h-20 lg:hidden" aria-hidden="true" />
          <StickyMobileCta
            label="Nevezés nyitva"
            sublabel={`${Math.max(EVENT.registration.capacity - totalRegistered, 0)} szabad hely`}
            href="/nevezes"
          />
        </>
      )}
    </div>
  );
}
