"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EVENT } from "@/config/event";

const STRINGS = {
  hu: {
    skipToContent: "Ugrás a tartalomra",
    homeAria: "SBD Next főoldal",
    mainNavAria: "Fő navigáció",
    mobileNavAria: "Mobil navigáció",
    volunteer: "Önkéntes",
    langToggleHref: "/en",
    langToggleLabel: "EN",
    langToggleLabelMobile: "English guide",
    menuTitle: "Menü",
    openMenu: "Menü megnyitása",
    closeMenu: "Menü bezárása",
  },
  en: {
    skipToContent: "Skip to content",
    homeAria: "SBD Next homepage",
    mainNavAria: "Main navigation",
    mobileNavAria: "Mobile navigation",
    volunteer: "Volunteer",
    langToggleHref: "/",
    langToggleLabel: "HU",
    langToggleLabelMobile: "Magyar oldal",
    menuTitle: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
} as const;

interface HeaderProps {
  ctaLabel: string;
  ctaHref: string;
  showVolunteerLink: boolean;
  navLinks: { href: string; label: string }[];
  locale?: "hu" | "en";
}

export function Header({ ctaLabel, ctaHref, showVolunteerLink, navLinks, locale = "hu" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const t = STRINGS[locale];

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const links = showVolunteerLink
    ? [...navLinks, { href: "#volunteer", label: t.volunteer }]
    : navLinks;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        {t.skipToContent}
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label={t.homeAria}>
            <Image
              src="/sbd_next_logo_transparent.png"
              alt=""
              width={40}
              height={40}
              className="size-8 object-contain sm:size-10"
            />
            <span className="font-display text-xl font-extrabold uppercase tracking-wide sm:text-2xl">
              SBD Next <span className="text-primary">{EVENT.editionRoman}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label={t.mainNavAria}>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={t.langToggleHref}
              className="hidden rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              {t.langToggleLabel}
            </Link>
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <a href={ctaHref}>
                {ctaLabel}
                <ChevronRight className="size-4" />
              </a>
            </Button>
            <button
              type="button"
              aria-label={open ? t.closeMenu : t.openMenu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex size-11 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="font-display text-xl font-extrabold uppercase">{t.menuTitle}</span>
            <button
              type="button"
              aria-label={t.closeMenu}
              onClick={() => setOpen(false)}
              className="flex size-11 items-center justify-center rounded-lg border border-border text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-4 py-6" aria-label={t.mobileNavAria}>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3.5 text-lg font-semibold text-foreground hover:bg-accent"
              >
                {l.label}
              </a>
            ))}
            <Link
              href={t.langToggleHref}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3.5 text-lg font-semibold text-muted-foreground hover:bg-accent"
            >
              {t.langToggleLabelMobile}
            </Link>
          </nav>
          <div className="mt-auto px-4 pb-8">
            <Button asChild size="lg" className="w-full">
              <a href={ctaHref} onClick={() => setOpen(false)}>
                {ctaLabel}
                <ChevronRight className="size-5" />
              </a>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
