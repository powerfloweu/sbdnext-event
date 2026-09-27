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
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  countdown: { target: string; label: string } | null;
  showCapacity: boolean;
  showRegistrationTeaser: boolean;
  registrationNote?: string;
  registrationCtaLabel: string;
  registrationCtaHref: string;
  showVolunteerCta: boolean;
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
      return {
        dateLabel,
        timeLabel,
        badgeLabel: `Nevezés indul: ${formatDate(EVENT.registration.opensAt)}`,
        badgeTone: "neutral",
        primaryCta: { label: "Értesítést kérek", href: "#register" },
        secondaryCta: { label: "Versenykiírás (PDF)", href: EVENT.docs.invitation },
        countdown: { target: EVENT.registration.opensAt, label: "Nevezés indulásáig" },
        showCapacity: false,
        showRegistrationTeaser: true,
        registrationNote: `A nevezés ${formatDate(EVENT.registration.opensAt)}-án nyílik meg. Iratkozz fel, hogy elsőként értesülj!`,
        registrationCtaLabel: "Értesítést kérek",
        registrationCtaHref: "#register",
        showVolunteerCta: false,
      };
    case "registration":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: `Nevezés nyitva · ${formatDate(EVENT.registration.closesAt)}-ig`,
        badgeTone: "open",
        primaryCta: { label: "Nevezek", href: "/nevezes" },
        secondaryCta: { label: "Versenykiírás (PDF)", href: EVENT.docs.invitation },
        countdown: { target: EVENT.registration.closesAt, label: "Nevezési határidő" },
        showCapacity: true,
        showRegistrationTeaser: true,
        registrationCtaLabel: "Nevezés indítása",
        registrationCtaHref: "/nevezes",
        showVolunteerCta: false,
      };
    case "closed":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: "Nevezés lezárult",
        badgeTone: "neutral",
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
      };
    case "live":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: "Most zajlik a verseny",
        badgeTone: "open",
        primaryCta: { label: "Élő közvetítés", href: "#schedule" },
        secondaryCta: { label: "Időrend", href: "#schedule" },
        countdown: null,
        showCapacity: false,
        showRegistrationTeaser: false,
        registrationCtaLabel: "",
        registrationCtaHref: "#schedule",
        showVolunteerCta: false,
      };
    case "post":
      return {
        dateLabel,
        timeLabel,
        badgeLabel: "A verseny lezárult",
        badgeTone: "neutral",
        primaryCta: { label: "Nevezési lista", href: "#lists" },
        secondaryCta: { label: "Prémium média csomag", href: "/premium-media" },
        countdown: null,
        showCapacity: false,
        showRegistrationTeaser: false,
        registrationCtaLabel: "",
        registrationCtaHref: "#lists",
        showVolunteerCta: false,
      };
  }
}
