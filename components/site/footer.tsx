import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { EVENT } from "@/config/event";

const STRINGS = {
  hu: {
    tagline: "SBD Hungary × PowerFlow · Budapest",
    contact: "Kapcsolat",
    documents: "Dokumentumok",
    invitation: "Versenykiírás (PDF)",
    rules: "IPF / MERSZ szabályzat",
    privacy: "Adatkezelési tájékoztató",
    language: "Nyelv",
    currentLang: "Magyar",
    otherLangHref: "/en",
    otherLang: "English",
  },
  en: {
    tagline: "SBD Hungary × PowerFlow · Budapest",
    contact: "Contact",
    documents: "Documents",
    invitation: "Competition invitation (PDF, Hungarian)",
    rules: "IPF / MERSZ rulebook (Hungarian)",
    privacy: "Privacy notice (Hungarian)",
    language: "Language",
    currentLang: "English",
    otherLangHref: "/",
    otherLang: "Magyar",
  },
} as const;

interface FooterProps {
  // False only during "announced": there's no SBD Next 2 versenykiírás yet
  // (last edition's PDF would be misleading), so the link is hidden until
  // registration actually opens. The general IPF/MERSZ rulebook stays —
  // it isn't event-specific.
  showInvitation?: boolean;
  locale?: "hu" | "en";
}

export function Footer({ showInvitation = true, locale = "hu" }: FooterProps) {
  const year = new Date().getFullYear();
  const t = STRINGS[locale];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Image
            src="/sbd_next_logo_footer.png"
            alt="SBD Next"
            width={900}
            height={435}
            className="h-14 w-auto object-contain object-left"
          />
          <span className="text-sm text-muted-foreground">{t.tagline}</span>
          <span className="mt-3 text-xs text-muted-foreground">
            © {year} SBD Hungary &amp; PowerFlow
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-foreground">{t.contact}</span>
          <a
            href={`mailto:${EVENT.contact.email}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {EVENT.contact.email}
          </a>
          <a
            href={EVENT.social.igSbd}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Instagram className="size-4" aria-hidden="true" /> @sbd.hungary
          </a>
          <a
            href={EVENT.social.igPowerflow}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Instagram className="size-4" aria-hidden="true" /> @powerfloweu
          </a>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-foreground">{t.documents}</span>
          {showInvitation && (
            <a
              href={EVENT.docs.invitation}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              {t.invitation}
            </a>
          )}
          {/* Not linked for now — no confirmed URL/final document yet. */}
          <span className="text-muted-foreground">{t.rules}</span>
          <span className="text-muted-foreground">{t.privacy}</span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-foreground">{t.language}</span>
          <div className="flex gap-3 text-sm">
            <span className="text-foreground">{t.currentLang}</span>
            <Link href={t.otherLangHref} className="text-muted-foreground hover:text-foreground">
              {t.otherLang}
            </Link>
          </div>
          <div className="mt-2 flex items-center gap-4 opacity-80">
            <Image
              src="/sbd_logo_transparent.png"
              alt="SBD Hungary"
              width={80}
              height={28}
              className="h-6 w-auto object-contain"
            />
            <Image
              src="/powerflow_logo.png"
              alt="PowerFlow"
              width={80}
              height={28}
              className="h-6 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
