import { EVENT } from "@/config/event";
import { volunteersOpen, type Phase } from "@/lib/phase";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(iso)
  );
}

export interface HomeContent {
  dateLabel: string;
  timeLabel: string;
  badgeLabel: string;
  badgeTone: "open" | "neutral" | "closed";
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string } | null;
  countdown: { target: string; label: string } | null;
  showCapacity: boolean;
  showRegistrationTeaser: boolean;
  registrationNote?: string;
  registrationCtaLabel: string;
  registrationCtaHref: string;
  showVolunteerCta: boolean;
  // All false only during "announced": nothing below is real yet — no one
  // has registered, there's no schedule/heat sheet, no rulebook, no FAQ
  // about a registration process that doesn't exist. The teaser phase is
  // deliberately just Hero + photos + FeesTeaser + the notify signup.
  showKeyFacts: boolean;
  showInfoSection: boolean;
  showLists: boolean;
  showSchedule: boolean;
  showRules: boolean;
  showFaq: boolean;
}

export function getHomeContent(phase: Phase): HomeContent {
  const firstDay = EVENT.days[0];
  const secondDay = EVENT.days[1];
  const dateLabel =
    secondDay && !secondDay.confirmed
      ? `${formatDate(firstDay.date)} (2. nap a nevezői létszámtól függ)`
      : EVENT.days.map((d) => formatDate(d.date)).join(" – ");
  const timeLabel = `${firstDay.start}–${firstDay.end}`;

  const volunteersLive = volunteersOpen();

  switch (phase) {
    case "announced":
      // Deliberately vague: real SBD Next 1 photos build the mood, but the
      // exact date and price aren't announced yet (matches the organiser's
      // own teaser emails/social posts — no logistics, just hype). Every
      // section below that implies an active registration process (capacity,
      // "who's registered so far", heat sheet, rulebook, registration FAQ)
      // is hidden — none of it exists yet, showing it as "hamarosan"
      // everywhere just reads as broken. This phase is Hero + photos +
      // FeesTeaser + the notify signup, nothing else.
      return {
        dateLabel: "Részletek hamarosan",
        timeLabel: "Részletek hamarosan",
        badgeLabel: "Nevezés és részletek hamarosan",
        badgeTone: "neutral",
        description: "A következő szint. Nyílt erőemelő verseny újoncoknak és versenyzőknek, IPF szabályok szerint.",
        primaryCta: { label: "Értesítést kérek", href: "#register" },
        secondaryCta: null,
        countdown: null,
        showCapacity: false,
        showRegistrationTeaser: true,
        registrationNote:
          "A pontos időpontot és a nevezési részleteket hamarosan bejelentjük. Iratkozz fel, hogy e-mailben elsőként értesülj, amint megnyílik a nevezés!",
        registrationCtaLabel: "Kövesd az @sbd.hungary Instagramot",
        registrationCtaHref: EVENT.social.igSbd,
        showVolunteerCta: false,
        showKeyFacts: false,
        showInfoSection: false,
        showLists: false,
        showSchedule: false,
        showRules: false,
        showFaq: false,
      };
    case "registration":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: `Nevezés nyitva · ${formatDate(EVENT.registration.closesAt)}-ig`,
        badgeTone: "open",
        description: "A következő szint. Nyílt erőemelő verseny újoncoknak és versenyzőknek, IPF szabályok szerint.",
        primaryCta: { label: "Nevezek", href: "/nevezes" },
        secondaryCta: { label: "Versenykiírás (PDF)", href: EVENT.docs.invitation },
        countdown: { target: EVENT.registration.closesAt, label: "Nevezési határidő" },
        showCapacity: true,
        showRegistrationTeaser: true,
        registrationCtaLabel: "Nevezés indítása",
        registrationCtaHref: "/nevezes",
        showVolunteerCta: false,
        showKeyFacts: true,
        showInfoSection: true,
        showLists: true,
        showSchedule: true,
        showRules: true,
        showFaq: true,
      };
    case "closed":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: "Nevezés lezárult",
        badgeTone: "neutral",
        description: "A következő szint. Nyílt erőemelő verseny újoncoknak és versenyzőknek, IPF szabályok szerint.",
        primaryCta: { label: "Nevezési lista", href: "#lists" },
        secondaryCta: volunteersLive
          ? { label: "Önkéntesnek jelentkezem", href: "/volunteers" }
          : { label: "Versenykiírás (PDF)", href: EVENT.docs.invitation },
        countdown: { target: `${firstDay.date}T${firstDay.start}:00+01:00`, label: "Verseny kezdetéig" },
        showCapacity: true,
        showRegistrationTeaser: true,
        registrationNote: "A nevezés lezárult. A végleges lista és a csoportbeosztás hamarosan elérhető.",
        registrationCtaLabel: "Nevezési lista megnézése",
        registrationCtaHref: "#lists",
        showVolunteerCta: volunteersLive,
        showKeyFacts: true,
        showInfoSection: true,
        showLists: true,
        showSchedule: true,
        showRules: true,
        showFaq: true,
      };
    case "live":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: "Most zajlik a verseny",
        badgeTone: "open",
        description: "A következő szint. Nyílt erőemelő verseny újoncoknak és versenyzőknek, IPF szabályok szerint.",
        primaryCta: { label: "Élő közvetítés", href: "#schedule" },
        secondaryCta: { label: "Időrend", href: "#schedule" },
        countdown: null,
        showCapacity: false,
        showRegistrationTeaser: false,
        registrationCtaLabel: "",
        registrationCtaHref: "#schedule",
        showVolunteerCta: false,
        showKeyFacts: true,
        showInfoSection: true,
        showLists: true,
        showSchedule: true,
        showRules: true,
        showFaq: true,
      };
    case "post":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: "A verseny lezárult",
        badgeTone: "neutral",
        description: "A következő szint. Nyílt erőemelő verseny újoncoknak és versenyzőknek, IPF szabályok szerint.",
        primaryCta: { label: "Nevezési lista", href: "#lists" },
        secondaryCta: { label: "Prémium média csomag", href: "/premium-media" },
        countdown: null,
        showCapacity: false,
        showRegistrationTeaser: false,
        registrationCtaLabel: "",
        registrationCtaHref: "#lists",
        showVolunteerCta: false,
        showKeyFacts: true,
        showInfoSection: true,
        showLists: true,
        showSchedule: true,
        showRules: true,
        showFaq: true,
      };
  }
}
