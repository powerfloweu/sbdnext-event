import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Event and registration constants for SBD Next event
export const EVENT = {
  date: "2026. február 14–15.",
  time: "7:00 – 19:00",
  location: {
    name: "Thor Gym XI.",
    address: "1117 Budapest, Nándorfejérvári út 40.",
    mapEmbedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.123456789!2d19.040235!3d47.475123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dc123456789:0x123456789abcdef!2sThor%20Gym!5e0!3m2!1shu!2shu!4v1700000000000!5m2!1shu!2shu"
  },
  deadlines: {
    regOpen: "2025. december 1. 20:00",
    regClose: "2026. január 31. 23:59"
  },
  cap: 120,
  equipmentNote: "IPF RAW szabályok, kantáros mez kötelező a versenyzőknek.",
  scoring: "IPF GL pontszám (súlycsoport nélkül)",
  concept: "Két napos, IPF szabályrendszerű SBD verseny újoncoknak és versenyzőknek.",
  layout: "Két platform, flight beosztás a nevezési totals alapján.",
  eventType: "Háromfogásos erőemelő verseny.",
  fees: {
    entry: 29990,
    spectator: 2000,
    premium: 24990,
    currency: "Ft"
  },
  divisions: ["Újonc – Női", "Újonc – Férfi", "Versenyző – Női", "Versenyző – Férfi"],
  streams: {
    saturdayA: "https://youtube.com/streamA",
    saturdayB: "https://youtube.com/streamB",
    sundayA: "https://youtube.com/streamC",
    sundayB: "https://youtube.com/streamD"
  },
  social: {
    igSbd: "https://instagram.com/sbd.hungary",
    igPowerflow: "https://instagram.com/powerfloweu"
  },
  contact: {
    email: "info@sbdhungary.hu"
  }
};

export const REG_DEADLINE_AT = new Date("2026-01-31T23:59:00+01:00");
export const REG_OPEN_AT = new Date("2025-12-01T20:00:00+01:00");
export const CAP_LIMIT = 120;
export const CAP_USED = 0; // Should be dynamically set from backend
export const CAP_REMAINING = CAP_LIMIT - CAP_USED;
export const CAP_FULL = CAP_USED >= CAP_LIMIT;
export const IS_STAGING = false;
export const SHOW_VOLUNTEERS = true;
export const HERO_IMAGES = [
  "/hero_bg.jpg",
  "/hero_bg2.jpg",
  "/hero_bg3.jpg"
];
export const FORCE_REG_OPEN = false;
export const effectiveRegOpen = FORCE_REG_OPEN || (new Date() >= REG_OPEN_AT);
