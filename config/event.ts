// SBD Next 2 — single source of truth for every event-specific date, price,
// link and piece of copy that used to be scattered across app/page.tsx and
// lib/utils.ts. See docs/UI_UX_ROBUSTNESS_PLAN.md section 3.
//
// Values marked TODO(event-2) are placeholders until the organiser confirms
// them — see docs/UI_UX_ROBUSTNESS_PLAN.md section 9.

export const EVENT = {
  slug: "sbd-next-2",
  edition: 2,
  name: "SBD Next",
  tagline: { hu: "A következő szint", en: "The next level" },
  timezone: "Europe/Budapest",

  // TODO(event-2): confirm exact dates/times. Day 2 is conditional on entry
  // numbers, per the organiser (2026-09-26).
  days: [
    { date: "2027-02-13", start: "07:00", end: "21:00", confirmed: true },
    { date: "2027-02-14", start: "07:00", end: "21:00", confirmed: false },
  ],

  venue: {
    name: "Thor Gym (Újbuda)",
    address: "1116 Budapest, Nándorfejérvári út 40.",
    mapsUrl: "https://maps.google.com/?q=Thor+Gym+Budapest",
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4748.762520334373!2d19.04355177770303!3d47.46025827117686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dda23e15b409%3A0x59fe623bd00aa0be!2sThor%20Gym!5e1!3m2!1shu!2shu!4v1762941118132!5m2!1shu!2hu",
    parking:
      "Ingyenes parkolás a gyárépület területén belül (festékbolt előtt), illetve a Nándorfejérvári utcán.",
    parkingEn:
      "Free parking inside the factory grounds (in front of the paint shop), or on Nándorfejérvári utca.",
    amenities: "Öltöző és zuhany elérhető. Aldi, Tesco egy utcányira.",
    amenitiesEn: "Changing rooms and showers available. Aldi and Tesco supermarkets one block away.",
  },

  // TODO(event-2): confirm the exact registration window.
  registration: {
    opensAt: "2026-11-01T20:00:00+01:00",
    closesAt: "2026-12-31T23:59:00+01:00",
    capacity: 220,
    waitlist: true,
    minBirthYear: 1927,
    maxBirthYear: 2013,
  },

  // Volunteer recruitment window, per the organiser: January 2027.
  volunteers: {
    opensAt: "2027-01-01T00:00:00+01:00",
    closesAt: "2027-02-06T23:59:00+01:00",
  },

  // Per the organiser (2026-09-27): the shirt is now a separate add-on
  // instead of being bundled into a single entry fee.
  fees: {
    currency: "HUF",
    entryBase: 27990,
    entryWithShirt: 32990,
    spectator: 1000,
    premiumMedia: 24990,
  },

  // Entry + shirt + premium-media are now built as a Stripe Checkout Session
  // (dynamic line items) instead of static Payment Links, since pricing has
  // two independent add-on dimensions (shirt, premium media). Needs
  // STRIPE_SECRET_KEY configured — see app/api/register/route.ts. Without
  // it the wizard still works end-to-end in a "demo" mode (no real charge).
  //
  // premiumOnly is unchanged: a single fixed-price Payment Link for the
  // standalone premium-media purchase (non-competitors), kept as-is since
  // that price didn't change.
  stripe: {
    premiumOnly: "https://buy.stripe.com/3cIdRabMbfhkeUb6IT1ck03",
  },

  divisions: ["Újonc", "Versenyző"],
  sexes: ["Nő", "Férfi"],
  shirt: {
    cuts: ["Női", "Férfi"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
  },

  streams: [
    { label: "A platform", url: "https://www.youtube.com/@sbdhungary7034" },
    { label: "B platform", url: "https://www.youtube.com/@sbdhungary7034" },
  ],

  social: {
    igSbd: "https://instagram.com/sbd.hungary",
    igPowerflow: "https://instagram.com/powerfloweu",
  },

  contact: { email: "powerlifting@sbdnext.hu" },

  sponsors: [
    { name: "SBD Hungary", logo: "/sbd_logo_transparent.png", url: "https://www.sbdhungary.hu/" },
    { name: "PowerFlow", logo: "/powerflow_logo.png", url: "https://power-flow.eu/" },
    { name: "Avancus", logo: "/avancus_logo.png", url: "https://power-flow.eu/" },
  ],

  mediaTeam: [
    { name: "Hunyás Kata", role: "Fotós", img: "/kata.jpg", instagram: "visualsofkata" },
    { name: "Lantos Bence", role: "Fotós", img: "/bence.jpg", instagram: "bencelantos" },
    { name: "Lakatos Márk", role: "Videós", img: "/mark.jpg", instagram: "mark_g_l_" },
    { name: "Schwalm Ákos", role: "Videós", img: "/akos.jpg", instagram: "akos.schwalm" },
  ],

  docs: {
    invitation: "/docs/SBD_Next_versenykiiras.pdf",
    rules: "/docs/IPF_MERSZ_szabalyzat_2025.pdf",
    qualification: "/docs/MERSZ_Open_Minositesi_Szintek_2025.pdf",
  },

  // Google Sheets "publish to web" CSV feeds. Kept from the live site as the
  // working data source for the preview; Phase 2 of the plan replaces this
  // with Supabase.
  sheets: {
    lists: {
      ujoncNoi:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=1482153429&single=true&output=csv",
      ujoncFerfi:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=862629266&single=true&output=csv",
      versenyzoNoi:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=672992038&single=true&output=csv",
      versenyzoFerfi:
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=1696060010&single=true&output=csv",
    },
    schedule:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=540836351&single=true&output=csv",
  },

  siteUrl: "https://www.sbdnext.hu",
} as const;

export type EventConfig = typeof EVENT;
