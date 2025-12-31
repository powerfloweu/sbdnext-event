"use client";
import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Timer,
  Info,
  Mail,
  Dumbbell,
  TicketCheck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Trophy,
  HandHeart,
  ArrowRight,
} from "lucide-react";

import type { ComponentType } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { VolunteerForm } from "@/components/volunteer-form";

// ====== KAPACITÁS / NEVEZÉS ÁLLAPOT ======
const CAP_LIMIT = 220;
const CAP_USED = Number(process.env.NEXT_PUBLIC_CAP_USED ?? "0");
const CAP_FULL_FLAG =
  (process.env.NEXT_PUBLIC_CAP_FULL ?? "").toLowerCase() === "true";
const CAP_REMAINING = Math.max(0, CAP_LIMIT - CAP_USED);
const CAP_FULL = CAP_FULL_FLAG || CAP_REMAINING <= 0;
const FORCE_REG_OPEN =
  (process.env.NEXT_PUBLIC_FORCE_REG_OPEN ?? "").toLowerCase() === "true";
const SHOW_VOLUNTEERS = true;

// Staging környezet ellenőrzése az utólagos prémium média vásárláshoz
const IS_STAGING = process.env.NEXT_PUBLIC_ENV === "reg-staging";

// A nevezés indulásának fix időpontja (CET)
const REG_OPEN_AT = new Date("2025-11-20T20:00:00+01:00");
const REG_DEADLINE_AT = new Date("2026-01-07T23:59:00+01:00");

// ====== ESEMÉNY ADATOK ======
const HERO_IMAGES = [
  "/sheffield_25_34.jpg",
  "/sheffield_25_9.jpg",
  "/ena_2025_worlds.jpeg",
  "/pana_2025.jpeg",
  "/aron_2025_vb.jpeg",
] as const;

const EVENT = {
  title: "SBD Next – Nyílt erőemelő verseny",
  subtitle: "A következő szint",
  date: "2026. február 14–15.",
  time: "7:00–19:00 (mindkét nap)",
  location: {
    name: "Thor Gym (Újbuda)",
    address: "Budapest, Nándorfejérvári út 40, 1116",
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4748.762520334373!2d19.04355177770303!3d47.46025827117686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dda23e15b409%3A0x59fe623bd00aa0be!2sThor%20Gym!5e1!3m2!1shu!2shu!4v1762941118132!5m2!1shu!2hu",
  },
  concept:
    "Szabadidős esemény újoncoknak kötöttségek nélkül, erőemelő versenyzőknek pedig gyakorlásképp!",
  layout: "2 nap, 2 platform",
  federation:
    "IPF szabályrendszer. Nem kell klubtagság és sportorvosi engedély.",
  equipmentNote:
    "Versenyző kategóriában a MERSZ szabályai szerint kell versenyezni. Újonc kategóriában NEM kötelező a kantáros erőemelő mez, elegendő testhez simuló rövid- vagy hosszúnadrág és felső.",
  deadlines: {
    regOpen: "2025. november 20.",
    regClose: "2026. január 7. 23:59",
  },
  fees: {
    entry: 29990,
    spectator: 1000,
    premium: 24990,
    currency: "HUF",
  },
  contact: {
    email: "powerlifting@sbdnext.hu",
  },
  social: {
    igSbd: "https://instagram.com/sbd.hungary",
    igPowerflow: "https://instagram.com/powerfloweu",
  },
  divisions: ["Újonc", "Versenyző"],
  scoring: "Eredményhirdetés IPF pontszám alapján (nincsenek súlycsoportok).",
  eventType: "Háromfogásos, full power (SBD) verseny.",
  streams: {
    saturdayA: "https://www.youtube.com/@sbdhungary7034",
    saturdayB: "https://www.youtube.com/@sbdhungary7034",
    sundayA: "https://www.youtube.com/@sbdhungary7034",
    sundayB: "https://www.youtube.com/@sbdhungary7034",
  },
  cap: CAP_LIMIT,
};

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon?: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-10">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-red-500" />}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-2xl border border-red-900/50 bg-black/40 text-red-50">
      <CardContent className="flex items-center gap-3 p-4">
        {Icon && <Icon className="h-5 w-5 text-red-400" />}
        <div>
          <div className="text-xs uppercase tracking-widest text-red-400">
            {label}
          </div>
          <div className="text-sm font-semibold">{value}</div>
        </div>
 
      </CardContent>
    </Card>
  );
}

function PriceRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-start justify-between border-b border-red-900/40 py-2">
      <div className="font-medium text-neutral-100">{label}</div>
      <div className="text-right">
        <div className="font-semibold text-primary">{value}</div>
        {note && <div className="text-xs text-neutral-400">{note}</div>}
      </div>
    </div>
  );
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  birthYear: string;
  weight: string;
  club: string;
  sex: string;
  division: string;
  bestTotal: string;
  openerSquat: string;
  openerBench: string;
  openerDeadlift: string;
  shirtCut: string; // Női / Férfi
  shirtSize: string; // XS–4XL
  mcNotes: string; // bemondó szöveg
  otherNotes: string; // megjegyzés, kérés
  consent: boolean;
  premium: boolean;
  honeypot: string;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};
function validateRegistration(data: RegistrationData): string | null {
  if (!data.lastName.trim()) {
    return "Kérlek add meg a vezetékneved.";
  }
  if (!data.firstName.trim()) {
    return "Kérlek add meg a keresztneved.";
  }
  if (!data.email.trim()) {
    return "Kérlek add meg az e-mail címed.";
  }
  if (!/.+@.+\..+/.test(data.email)) {
    return "Kérlek valós e-mail címet adj meg.";
  }

    const birthYearRaw = data.birthYear.trim();
  if (!birthYearRaw) {
    return "Kérlek add meg a születési éved.";
  }
  if (!/^\d{4}$/.test(birthYearRaw)) {
    return "A születési év négy számjegy legyen (pl. 1995).";
  }
  const birthYearNum = Number(birthYearRaw);
  if (Number.isNaN(birthYearNum) || birthYearNum < 1925 || birthYearNum > 2011) {
    return "A születési évnek 1925 és 2011 közé kell esnie (14–100 éves korhatár).";
  }

  if (!data.sex) {
    return "Kérlek válaszd ki a nemed.";
  }
  if (!data.division) {
    return "Kérlek válaszd ki, hogy Újonc vagy Versenyző kategóriában indulsz.";
  }

  const weightRaw = data.weight.trim().replace(",", ".");
  if (!weightRaw) {
    return "Kérlek add meg a versenyen tervezett testsúlyod (kg).";
  }
  const weight = Number(weightRaw);
  if (Number.isNaN(weight) || weight < 30 || weight > 250) {
    return "A versenyen tervezett testsúlyod 30 és 250 kg közé essen.";
  }

  const squatRaw = data.openerSquat.trim().replace(",", ".");
  if (!squatRaw) {
    return "Kérlek add meg a guggolás nevezési súlyát (kg).";
  }
  const squat = Number(squatRaw);
  if (Number.isNaN(squat) || squat < 20 || squat > 400) {
    return "A guggolás nevezési súlyát 20 és 400 kg közé add meg.";
  }

  const benchRaw = data.openerBench.trim().replace(",", ".");
  if (!benchRaw) {
    return "Kérlek add meg a fekvenyomás nevezési súlyát (kg).";
  }
  const bench = Number(benchRaw);
  if (Number.isNaN(bench) || bench < 20 || bench > 400) {
    return "A fekvenyomás nevezési súlyát 20 és 400 kg közé add meg.";
  }

  const deadliftRaw = data.openerDeadlift.trim().replace(",", ".");
  if (!deadliftRaw) {
    return "Kérlek add meg a felhúzás nevezési súlyát (kg).";
  }
  const deadlift = Number(deadliftRaw);
  if (Number.isNaN(deadlift) || deadlift < 20 || deadlift > 400) {
    return "A felhúzás nevezési súlyát 20 és 400 kg közé add meg.";
  }

  if (!data.shirtCut) {
    return "Kérlek válaszd ki, hogy női vagy férfi pólót kérsz.";
  }
  if (!data.shirtSize) {
    return "Kérlek válaszd ki a pólóméreted (SBD póló).";
  }
  if (!data.consent) {
    return "A nevezéshez el kell fogadnod az adatkezelést és a versenyszabályzatot.";
  }
  return null;
}

// ====== REGISZTRÁCIÓ ======
function RegistrationForm() {
  // Stripe Payment Linkek (új)
  const PAYMENT_LINK_BASE =
    "https://buy.stripe.com/cNi8wQ4jJfhkh2jc3d1ck04"; // csak nevezés

  const PAYMENT_LINK_PREMIUM =
    "https://buy.stripe.com/3cI14obMbfhkcM30kv1ck05"; // nevezés + prémium média

    const WEBHOOK_URL =
    "https://hook.eu1.make.com/6vbe2dxien274ohy91ew22lp9bbfzrl3";

  const [waitlisted, setWaitlisted] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    birthYear: "",
    weight: "",
    club: "",
    sex: "",
    division: "",
    bestTotal: "",
    openerSquat: "",
    openerBench: "",
    openerDeadlift: "",
    shirtCut: "",
    shirtSize: "",
    mcNotes: "",
    otherNotes: "",
    consent: false,
    premium: false,
    honeypot: "",
  });

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [regOpen, setRegOpen] = useState(false);
  const effectiveRegOpen = FORCE_REG_OPEN || regOpen;

  useEffect(() => {
    function updateTimeLeft() {
      const diff = REG_OPEN_AT.getTime() - Date.now();
      if (diff <= 0) {
        setRegOpen(true);
        setTimeLeft(null);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ days, hours, minutes, seconds });
      setRegOpen(false);
    }

    updateTimeLeft();
    const id = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(id);
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Step 1: csak továbbléptetünk a részletes adatokhoz
    if (step === 1) {
      setError(null);
      setStep(2);
      return;
    }

    // Step 2: teljes validáció + webhook + Stripe (meglévő logika)
    if (!effectiveRegOpen) {
      setError("A nevezés ezen a felületen jelenleg nincs nyitva.");
      return;
    }
    if (data.honeypot.trim().length > 0) return;

    const validationError = validateRegistration(data);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const registrationId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `reg_${Date.now()}`;

      const isWaitlist = effectiveRegOpen && CAP_FULL;

      const target = isWaitlist
        ? null
        : data.premium
        ? PAYMENT_LINK_PREMIUM
        : PAYMENT_LINK_BASE;

      const utm =
        typeof window !== "undefined" ? window.location.search || "" : "";

      const fullName = `${data.lastName.trim()} ${data.firstName.trim()}`.trim();

      const payload = {
        timestamp: new Date().toISOString(),
        registrationId,
        name: fullName,
        ...data,
        paymentOption: data.premium ? "premium" : "base",
        stripeLink: target ?? "",
        page: "/",
        utm,
        status: isWaitlist ? "waitlist" : "pending_payment",
        statusText: isWaitlist ? "várólistán" : "fizetésre vár",
        cap: {
          limit: CAP_LIMIT,
          used: CAP_USED,
          remaining: CAP_REMAINING,
          full: CAP_FULL,
        },
      };

      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      if (isWaitlist) {
        setWaitlisted(true);
        setDone(true);
        return;
      }

      if (target) {
        const url = new URL(target);
        if (data.email) url.searchParams.set("prefilled_email", data.email);
        window.location.href = url.toString();
      }

      setDone(true);
    } catch {
      setError(
        "A jelentkezés nem sikerült. Próbáld újra, vagy írj nekünk e-mailt."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // 🔒 Ha még NEM nyitott ki a nevezés: info + visszaszámláló
  if (!effectiveRegOpen && !done) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-sm">
        <div className="flex items-center gap-2 font-semibold text-red-200">
          <AlertCircle className="h-5 w-5" />
          A nevezés még nem indult el.
        </div>

        <p className="text-red-100/90">
          A nevezési időszak:{" "}
          <b>{EVENT.deadlines.regOpen}</b> – <b>{EVENT.deadlines.regClose}</b>
        </p>

        {timeLeft && (
          <div className="rounded-xl border border-red-500/40 bg-black/40 p-3">
            <div className="text-xs uppercase tracking-[0.18em] text-red-200/80">
              Várható indulásig
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-sm text-red-50">
              <span>{timeLeft.days} nap</span>
              <span>
                {timeLeft.hours.toString().padStart(2, "0")} óra
              </span>
              <span>
                {timeLeft.minutes.toString().padStart(2, "0")} perc
              </span>
              <span>
                {timeLeft.seconds.toString().padStart(2, "0")} mp
              </span>
            </div>
          </div>
        )}

        <p className="text-red-100/60">
          Kövesd az Instát a friss infókért:{" "}
          <a
            href={EVENT.social.igPowerflow}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-200 underline hover:text-red-100"
          >
            @powerfloweu
          </a>{" "}
          és{" "}
          <a
            href={EVENT.social.igSbd}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-200 underline hover:text-red-100"
          >
            @sbd.hungary
          </a>
          .
        </p>
      </div>
    );
  }

  // ====== WAITLIST DONE ======
  if (done) {
    if (waitlisted) {
      return (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-red-300" />
          <h3 className="mt-4 text-lg font-semibold text-red-100">
            Felkerültél a várólistára.
          </h3>
          <p className="mt-1 text-sm text-red-100/80">
            A nevezői létszám betelt, de a jelentkezésed{" "}
            <b>várólistára került</b>. Ha felszabadul hely, e-mailben keresünk.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-950/40 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-400" />
        <h3 className="mt-4 text-lg font-semibold text-green-100">
          Átirányítás a fizetéshez…
        </h3>
      </div>
    );
  }

  // ====== FORM (nevezés nyitva) ======
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* HONEYPOT */}
      <div className="hidden" aria-hidden="true">
        <label>Ne töltsd ki ezt a mezőt</label>
        <Input
          tabIndex={-1}
          autoComplete="off"
          value={data.honeypot}
          onChange={(e) => setData({ ...data, honeypot: e.target.value })}
          placeholder="Hagyja üresen"
        />
      </div>

      {/* STEP 1 – Alapadatok */}
      {step === 1 && (
        <>
          <div className="mb-1 text-neutral-300">
            <span className="text-lg sm:text-xl font-extrabold text-red-400 tracking-wide">
              1. Alapadatok
            </span>
          </div>

          <div className="mb-4 flex items-center gap-3 text-neutral-300">
            <span className="text-xs text-neutral-500 whitespace-nowrap">
              1 / 2 lépés
            </span>
            <div className="h-1.5 w-full rounded-full bg-neutral-900/80">
              <div className="h-full w-1/2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(248,113,113,0.8)] transition-all duration-300" />
            </div>
          </div>

          {/* NÉV */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-red-400">
                Vezetéknév <span className="text-red-500">*</span>
              </label>
              <Input
                className="border-red-500"
                value={data.lastName}
                onChange={(e) => setData({ ...data, lastName: e.target.value })}
                placeholder="Vezetéknév"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-red-400">
                Keresztnév <span className="text-red-500">*</span>
              </label>
              <Input
                className="border-red-500"
                value={data.firstName}
                onChange={(e) =>
                  setData({ ...data, firstName: e.target.value })
                }
                placeholder="Keresztnév"
                required
              />
            </div>
          </div>

          {/* E-MAIL */}
          <div>
            <label className="text-sm font-semibold text-red-400">
              E-mail <span className="text-red-500">*</span>
            </label>
            <Input
              className="border-red-500"
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="nev@email.hu"
              required
            />
          </div>

          {/* SZÜLETÉSI ÉV */}
          <div>
            <label className="text-sm font-semibold text-red-400">
              Születési év <span className="text-red-500">*</span>
            </label>
            <Input
              className="border-red-500"
              inputMode="numeric"
              maxLength={4}
              placeholder="pl. 1995"
              value={data.birthYear}
              onChange={(e) =>
                setData({
                  ...data,
                  birthYear: (e.target as HTMLInputElement).value,
                })
              }
              required
            />
          </div>

          {/* NEM */}
          <div>
            <label className="text-sm font-semibold text-red-400">
              Nem <span className="text-red-500">*</span>
            </label>
            <Select
              onValueChange={(v) => setData({ ...data, sex: v })}
              value={data.sex}
            >
              <SelectTrigger className="border-red-500">
                <SelectValue placeholder="Válassz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nő">Nő</SelectItem>
                <SelectItem value="Férfi">Férfi</SelectItem>
              </SelectContent>
            </Select>
          </div>

                    {/* Újonc / Versenyző */}
          <div className="mt-2">
            <label className="text-sm font-semibold text-red-400">
              Újonc / Versenyző <span className="text-red-500">*</span>
            </label>

            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="sm:w-2/5">
                <Select
                  onValueChange={(v) => setData({ ...data, division: v })}
                  value={data.division}
                >
                  <SelectTrigger className="border-red-500 w-full">
                    <SelectValue placeholder="Válassz" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT.divisions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <p className="text-[11px] text-neutral-400 leading-snug sm:w-3/5">
                Újonc: nem versenyeztél még Magyar Országos Bajnokságon (open, I. osztály).<br />
                Versenyző: az elmúlt 2 évben versenyeztél Magyar Országos Bajnokságon és/vagy
                elérted a minősítési szintet.
              </p>
            </div>
          </div>

                  {/* SHIRT */}
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-red-400">
                Póló fazon <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(v) => setData({ ...data, shirtCut: v })}
                value={data.shirtCut}
              >
                <SelectTrigger className="border-red-500">
                  <SelectValue placeholder="Válassz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Női">Női</SelectItem>
                  <SelectItem value="Férfi">Férfi</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-neutral-400">
                Női póló: XS–3XL • Férfi póló: XS–4XL.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-red-400">
                Pólóméret (SBD póló) <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(v) => setData({ ...data, shirtSize: v })}
                value={data.shirtSize}
              >
                <SelectTrigger className="border-red-500">
                  <SelectValue placeholder="Válassz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="2XL">2XL</SelectItem>
                  <SelectItem value="3XL">3XL</SelectItem>
                  <SelectItem value="4XL">4XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
</div>
        </>
      )}
      {/* STEP 2 – Részletes nevezési adatok */}
      {step === 2 && (
        <>
          <div className="mb-1 text-neutral-300">
            <span className="text-lg sm:text-xl font-extrabold text-red-400 tracking-wide">
              2. Sportolói adatok
            </span>
          </div>

          <div className="mb-4 flex items-center gap-3 text-neutral-300">
            <span className="text-xs text-neutral-500 whitespace-nowrap">
              2 / 2 lépés
            </span>
            <div className="h-1.5 w-full rounded-full bg-neutral-900/80">
              <div className="h-full w-full rounded-full bg-red-500 shadow-[0_0_12px_rgba(248,113,113,0.8)] transition-all duration-300" />
            </div>
          </div>

                    {/* TESTSÚLY + KLUB EGY SORBAN */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* TESTSÚLY */}
            <div>
              <label className="text-sm font-semibold text-red-400">
                Testsúly (kg) <span className="text-red-500">*</span>
              </label>
              <Input
                className="border-red-500"
                inputMode="numeric"
                placeholder="pl. 83"
                value={data.weight}
                onChange={(e) =>
                  setData({
                    ...data,
                    weight: (e.target as HTMLInputElement).value,
                  })
                }
                required
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                A versenyen tervezett testsúlyod, nagyjából ±3 kg pontossággal. A
                beosztás miatt nagyon fontos adat!
              </p>
            </div>

            {/* KLUB */}
            <div>
              <label className="text-sm">Egyesület / Klub (nem kötelező)</label>
              <Input
                value={data.club}
                onChange={(e) => setData({ ...data, club: e.target.value })}
                placeholder="—"
              />
            </div>
          </div>

          {/* NEVEZÉSI SÚLYOK */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-red-400">
                Guggolás – nevezési súly (kg){" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                className={!data.openerSquat.trim() ? "border-red-500" : ""}
                inputMode="numeric"
                placeholder="pl. 180"
                value={data.openerSquat}
                onChange={(e) =>
                  setData({
                    ...data,
                    openerSquat: (e.target as HTMLInputElement).value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-red-400">
                Fekvenyomás – nevezési súly (kg)
                <span className="text-red-500">*</span>
              </label>
              <Input
                className={!data.openerBench.trim() ? "border-red-500" : ""}
                inputMode="numeric"
                placeholder="pl. 120"
                value={data.openerBench}
                onChange={(e) =>
                  setData({
                    ...data,
                    openerBench: (e.target as HTMLInputElement).value,
                  })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-red-400">
                Felhúzás – nevezési súly (kg){" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                className={!data.openerDeadlift.trim() ? "border-red-500" : ""}
                inputMode="numeric"
                placeholder="pl. 220"
                value={data.openerDeadlift}
                onChange={(e) =>
                  setData({
                    ...data,
                    openerDeadlift: (e.target as HTMLInputElement).value,
                  })
                }
                required
              />
            </div>

            <p className="sm:col-span-3 mt-1 text-xs text-neutral-400">
              Maradjunk a realitások talaján, a versenybeosztás miatt nagyon
              fontos adat!
            </p>

            {/* MC + MEGJEGYZÉS EGY SORBAN */}
            <div className="sm:col-span-3 mt-1 grid gap-3 sm:grid-cols-2">
              {/* MC NOTES */}
              <div>
                <label className="text-sm">
                  Rólad / bemondó szöveg (nem kötelező)
                </label>
                <Textarea
                  value={data.mcNotes}
                  onChange={(e) =>
                    setData({ ...data, mcNotes: e.target.value })
                  }
                  placeholder="Pl. mióta edzel, miért jelentkeztél, milyen céljaid vannak."
                />
              </div>

              {/* OTHER NOTES */}
              <div>
                <label className="text-sm">
                  Megjegyzés, kérés a szervezőknek (nem kötelező)
                </label>
                <Textarea
                  value={data.otherNotes}
                  onChange={(e) =>
                    setData({ ...data, otherNotes: e.target.value })
                  }
                  placeholder="Pl. külön kérés vagy egészségügyi infó."
                />
              </div>
            </div>
          </div>
        </>
      )}

       {/* SUBMIT + CHECKBOXOK RENDEZVE */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Bal oszlop: adatkezelés + prémium (csak a 2. lépésen) */}
        {step === 2 && (
          <div className="space-y-3 max-w-md sm:w-1/2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={data.consent}
                onCheckedChange={(v: boolean | "indeterminate") =>
                  setData({ ...data, consent: Boolean(v) })
                }
              />
              <label htmlFor="consent" className="text-sm text-red-400">
                Hozzájárulok az adataim kezeléséhez és elfogadom a verseny
                szabályzatát. Tudomásul veszem, hogy a nevezés a{" "}
                <b>fizetéssel</b> válik véglegessé.
                <span className="text-red-500"> *</span>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="premium"
                checked={data.premium}
                onCheckedChange={(v: boolean | "indeterminate") =>
                  setData({ ...data, premium: Boolean(v) })
                }
              />
              <label htmlFor="premium" className="text-sm">
                Prémium média csomag (+24 990 Ft): 3 fotó + 3 videó, kiemelt
                válogatás.
              </label>
            </div>

            <Button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto h-11 sm:h-12 rounded-3xl border border-neutral-700 bg-black/60 px-6 text-sm sm:text-base font-semibold text-neutral-100 hover:border-red-500 hover:text-red-300 transition-all duration-200"
            >
              Vissza az alapadatokhoz
            </Button>
          </div>
        )}

        {/* Jobb oszlop: gomb(ok) + díj szöveg */}
        <div className="flex flex-col items-start gap-3 w-full sm:w-auto">
          <Button
            type="submit"
            disabled={submitting || !effectiveRegOpen}
            className="self-start w-fit h-12 sm:h-14 rounded-full bg-gradient-to-r from-red-700 via-red-500 to-red-400 px-8 sm:px-12 text-sm sm:text-base font-extrabold shadow-[0_0_60px_rgba(248,113,113,1)] border border-red-200/80 hover:from-red-600 hover:via-red-500 hover:to-red-300 transition-all duration-200"
          >
            <ChevronRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {step === 1
              ? "Folytatom a nevezést"
              : submitting
              ? "Tovább a fizetéshez…"
              : "Nevezés és fizetés"}
          </Button>

          <div className="text-xs text-muted-foreground max-w-md text-left">
            A nevezési díj: 29 990 Ft — tartalmazza a <b>media csomagot</b> és az{" "}
            <b>egyedi SBD versenypólót</b>.
          </div>
        </div>
      </div>

      {CAP_FULL && (
        <p className="mt-2 text-xs text-red-300">
          A nevezői létszám jelenleg betelt, az űrlap kitöltésével{" "}
          <b>várólistára</b> tudsz jelentkezni. Fizetni csak akkor kell, ha
          e-mailben visszaigazoljuk.
        </p>
      )}
    </form>
  );
}




// ====== LEADERBOARD (online nevezési lista – TABOS, CSV) ======

type LeaderboardRow = {
  name: string;
  club: string;
  total: number;
};

const LEADERBOARD_SOURCES = {
  ujoncNoi:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=1482153429&single=true&output=csv",
  ujoncFerfi:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=862629266&single=true&output=csv",
  versenyzoNoi:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=672992038&single=true&output=csv",
  versenyzoFerfi:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTa5DanERU2QFdihY7vLRKZCDY6U7MVBxN_r_YOEHXFuzB6_y1CYpddraoZvBie3pCRuQN7pX4uc00I/pub?gid=1696060010&single=true&output=csv",
} as const;

function parseCsv(text: string): LeaderboardRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const [, ...rows] = lines;

  return rows
    .map((line) => {
      const cells = line.split(",");
      const [nameRaw = "", clubRaw = "", totalRaw = ""] = cells;
      const name = nameRaw.trim();
      const club = clubRaw.trim();
      const total = Number(
        totalRaw.trim().replace(/\s/g, "").replace(",", ".")
      );
      if (!name) return null;
      return {
        name,
        club,
        total: Number.isFinite(total) ? total : 0,
      };
    })
    .filter((r): r is LeaderboardRow => r !== null);
}

function LeaderboardTable({
  title,
  rows,
}: {
  title: string;
  rows: LeaderboardRow[];
}) {
  return (
    <Card className="rounded-2xl border border-neutral-800 bg-black/75">
      <CardContent className="p-4 sm:p-5 text-sm text-neutral-100">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-red-400" />
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
              {title}
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="py-4 text-xs text-neutral-400">
            Még nincs aktív nevezés ebben a kategóriában.
          </div>
        ) : (
          <>
            {/* Mobil: kártyákban, nincs swipe gond */}
            <div className="space-y-2 md:hidden">
              {rows.map((row, idx) => (
                <div
                  key={row.name + row.club + idx}
                  className="rounded-xl border border-neutral-800 bg-black/70 p-3 text-xs text-neutral-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">#{idx + 1}</span>
                    <span className="font-semibold tabular-nums">
                      {row.total ? `${row.total} kg` : "—"}
                    </span>
                  </div>
                  <div className="mt-1 font-semibold leading-tight">{row.name}</div>
                  <div className="text-[11px] text-neutral-300">{row.club || "—"}</div>
                </div>
              ))}
            </div>

            {/* Desktop/tablet: táblázat marad */}
            <div className="hidden max-h-[420px] overflow-y-auto rounded-xl border border-neutral-800 bg-black/80 md:block">
              <table className="w-full min-w-full text-xs sm:text-sm">
                <thead className="bg-red-950/60 text-[11px] uppercase tracking-[0.16em] text-neutral-300">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Név</th>
                    <th className="px-3 py-2 text-left">Egyesület</th>
                    <th className="px-3 py-2 text-right">Nevezési total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={row.name + row.club + idx}
                      className={idx % 2 === 0 ? "bg-black" : "bg-neutral-950"}
                    >
                      <td className="px-3 py-1.5 text-left text-[11px] text-neutral-400">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-1.5 font-medium text-neutral-100">
                        {row.name}
                      </td>
                      <td className="px-3 py-1.5 text-neutral-300">
                        {row.club || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-neutral-100">
                        {row.total || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Leaderboard() {
  const [data, setData] = useState<
    Partial<Record<keyof typeof LEADERBOARD_SOURCES, LeaderboardRow[]>>
  >({});

  const [activeTab, setActiveTab] = useState<
    "ujoncNoi" | "ujoncFerfi" | "versenyzoNoi" | "versenyzoFerfi"
  >("ujoncNoi");

  const order = ["ujoncNoi", "ujoncFerfi", "versenyzoNoi", "versenyzoFerfi"] as const;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      for (const key of Object.keys(
        LEADERBOARD_SOURCES
      ) as (keyof typeof LEADERBOARD_SOURCES)[]) {
        try {
          const res = await fetch(LEADERBOARD_SOURCES[key]);
          const text = await res.text();
          const rows = parseCsv(text);
          if (!cancelled) {
            setData((prev) => ({ ...prev, [key]: rows }));
          }
        } catch {
          // üres állapotot mutatunk
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);


  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 sm:mx-0 border-b border-neutral-800">
        <button
          onClick={() => setActiveTab("ujoncNoi")}
          className={`relative mx-1 flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm sm:text-base font-semibold tracking-wide transition-colors ${
            activeTab === "ujoncNoi"
              ? "border-red-500 text-red-100"
              : "border-transparent text-neutral-400 hover:text-red-200"
          }`}
        >
          <span aria-hidden className="text-base">
            ✨
          </span>
          <span>Újonc – Nők</span>
        </button>
        <button
          onClick={() => setActiveTab("ujoncFerfi")}
          className={`relative mx-1 flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm sm:text-base font-semibold tracking-wide transition-colors ${
            activeTab === "ujoncFerfi"
              ? "border-red-500 text-red-100"
              : "border-transparent text-neutral-400 hover:text-red-200"
          }`}
        >
          <span aria-hidden className="text-base">
            ✨
          </span>
          <span>Újonc – Férfiak</span>
        </button>
        <button
          onClick={() => setActiveTab("versenyzoNoi")}
          className={`relative mx-1 flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm sm:text-base font-semibold tracking-wide transition-colors ${
            activeTab === "versenyzoNoi"
              ? "border-red-500 text-red-100"
              : "border-transparent text-neutral-400 hover:text-red-200"
          }`}
        >
          <span aria-hidden className="text-base">
            🏆
          </span>
          <span>Versenyző – Nők</span>
        </button>
        <button
          onClick={() => setActiveTab("versenyzoFerfi")}
          className={`relative mx-1 flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm sm:text-base font-semibold tracking-wide transition-colors ${
            activeTab === "versenyzoFerfi"
              ? "border-red-500 text-red-100"
              : "border-transparent text-neutral-400 hover:text-red-200"
          }`}
        >
          <span aria-hidden className="text-base">
            🏆
          </span>
          <span>Versenyző – Férfiak</span>
        </button>
      </div>
      <div className="pt-2">
        {activeTab === "ujoncNoi" && (
          <LeaderboardTable title="Újonc – Nők" rows={data.ujoncNoi ?? []} />
        )}
        {activeTab === "ujoncFerfi" && (
          <LeaderboardTable
            title="Újonc – Férfiak"
            rows={data.ujoncFerfi ?? []}
          />
        )}
        {activeTab === "versenyzoNoi" && (
          <LeaderboardTable
            title="Versenyző – Nők"
            rows={data.versenyzoNoi ?? []}
          />
        )}
        {activeTab === "versenyzoFerfi" && (
          <LeaderboardTable
            title="Versenyző – Férfiak"
            rows={data.versenyzoFerfi ?? []}
          />
        )}
      </div>
    </div>
  );
}

// ====== OLDAL ======
export default function EventLanding() {
  const [mounted, setMounted] = useState(false);
  const [deadlineLeft, setDeadlineLeft] = useState<TimeLeft | null>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function updateDeadline() {
      const diff = REG_DEADLINE_AT.getTime() - Date.now();
      if (diff <= 0) {
        setDeadlineLeft(null);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setDeadlineLeft({ days, hours, minutes, seconds });
    }

    updateDeadline();
    const id = setInterval(updateDeadline, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!HERO_IMAGES.length) return;

    const id = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 8000);

    return () => clearInterval(id);
  }, []);

  const priceEntry = new Intl.NumberFormat("hu-HU").format(EVENT.fees.entry);
  const priceSpectator = new Intl.NumberFormat("hu-HU").format(
    EVENT.fees.spectator
  );
  const pricePremium = new Intl.NumberFormat("hu-HU").format(
    EVENT.fees.premium
  );
  const year = new Date().getUTCFullYear();


  return (
    <div className="relative min-h-screen text-neutral-50">
      {/* Globális háttér – rotáló hero képek (teljes oldalra) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {HERO_IMAGES.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${src}')`,
              opacity: index === activeHeroIndex ? 1 : 0,
            }}
            aria-hidden="true"
          />
        ))}
        {/* Fekete overlay, hogy a szöveg olvasható maradjon */}
        <div className="absolute inset-0 bg-black/85 pointer-events-none" />
      </div>

      {/* NAV – SBD Hungary + PowerFlow */}
      <nav className="sticky top-0 z-40 border-b border-red-900/70 bg-black/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* Bal oldal: logók */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.sbdhungary.hu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/sbd_logo.jpg"
                alt="SBD Hungary"
                className="h-9 w-auto sm:h-10 drop-shadow-[0_0_22px_rgba(248,113,113,0.7)]"
              />
            </a>

            <a
              href="https://power-flow.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/powerflow_logo.png"
                alt="PowerFlow"
                className="h-7 w-auto sm:h-8 opacity-95"
              />
            </a>
          </div>

          {/* Jobb oldal: menü + CTA */}
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden items-center gap-4 text-xs text-neutral-200 sm:flex sm:text-sm">
              <a href="#info" className="hover:text-red-300">
                Infók
              </a>
              <a href="#schedule" className="hover:text-red-300">
                Időrend
              </a>
              <a href="#rules" className="hover:text-red-300">
                Szabályok
              </a>
              <a href="#fees" className="hover:text-red-300">
                Díjak
              </a>
              <a href="#faq" className="hover:text-red-300">
                GYIK
              </a>
              {SHOW_VOLUNTEERS && (
                <Link href="/volunteers" className="hover:text-red-300">
                  Önkéntesek
                </Link>
              )}
            </div>

            <a
              href="/en"
              className="hidden rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-red-500 hover:text-red-300 sm:inline-flex"
            >
              EN
            </a>

            <a href="#register">
              <button className="flex items-center rounded-full border border-red-500/70 bg-red-600/90 px-4 py-1 text-xs font-semibold text-white shadow-[0_0_20px_rgba(248,113,113,0.55)] hover:bg-red-500 sm:text-sm">
                Nevezés <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            </a>

          </div>
        </div>
      </nav>

      {/* STAGING-ONLY CTA – Prémium média utólagos vásárlás */}
      {IS_STAGING && (
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-red-900/50 bg-black/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-neutral-200">
              <span className="font-semibold text-red-300">Prémium média csomag</span> — utólagos vásárlás sportolóknak.
            </div>
            <Link href="/premium-media" className="inline-flex">
              <Button className="inline-flex items-center rounded-full bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-bold">
                Prémium média csomag vásárlása
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* HERO */}
      <header className="relative text-white">
        {/* Tartalom */}
        <div className="relative mx-auto max-w-5xl px-4 py-12 space-y-8">
                    {/* Felső blokk: logó + cím + alapinfók */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <div className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-black/10 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_50%,rgba(248,113,113,0.55),transparent_74%)] opacity-70" />
                <div className="relative flex flex-col gap-6 px-4 py-5 md:flex-row md:items-center md:px-6 md:py-6">
                  <div className="relative inline-block">
                    <img
                      src="/sbd_next_logo_transparent.png"
                      alt="SBD Next"
                      className="relative z-10 w-[260px] object-contain drop-shadow-[0_0_24px_rgba(248,113,113,0.9)] drop-shadow-[0_0_60px_rgba(248,113,113,0.45)] sm:w-[320px] md:w-[360px]"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.9)] sm:text-4xl">
                      A következő szint
                    </h1>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Stat label="Dátum" value={EVENT.date} Icon={CalendarDays} />
                      <Stat label="Idő" value={EVENT.time} Icon={Timer} />
                      <Stat
                        label="Helyszín"
                        value={`${EVENT.location.name} — ${EVENT.location.address}`}
                        Icon={MapPin}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

            {/* Versenykiírás + nevezés + listák – külön doboz */}
            <div className="mt-4 flex justify-center">
              <Card className="w-full max-w-5xl rounded-2xl border border-neutral-800 bg-black/80">
                <CardContent className="space-y-5 p-5 text-sm text-neutral-100 text-center">
                {/* Fő CTA: Nevezés */}
                <div className="grid max-w-md mx-auto w-full">
                  <a href="#register" className="block">
                    <Button className="w-full rounded-3xl bg-gradient-to-r from-red-700 via-red-500 to-red-400 px-12 py-4 text-lg font-extrabold shadow-[0_0_60px_rgba(248,113,113,1)] border border-red-200/80 hover:from-red-600 hover:via-red-500 hover:to-red-300 transition-all duration-200">
                      Nevezek most
                    </Button>
                  </a>
                </div>

                <a
                  href="/docs/SBD_Next_versenykiiras.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-100/80 bg-black/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white hover:border-red-400 hover:text-red-200 transition">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span>Versenykiírás</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>


                {/* Versenykiírás – rövid magyarázat */}
                <div className="space-y-1 text-[12px] text-neutral-300">
                  <span>
                    A részletes versenykiírást és szabályokat a fenti szekciókban találod. 
                    (külön ablakban megnyíló PDF)
                  </span>
                </div>

                {/* Online nevezési listák – gombok a tabos leaderboardhoz */}
                <div className="grid gap-3 sm:max-w-md mx-auto">
                  <a href="#leaderboard">
                    <Button className="w-full rounded-2xl border border-red-500/80 bg-black/80 px-6 py-3 text-sm font-semibold text-red-400 shadow-[0_0_18px_rgba(248,113,113,0.4)] hover:bg-red-600 hover:text-white">
                      Nevezési lista (ideiglenes, aktualizált)
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>

                  <p className="pl-1 text-xs text-neutral-300">
                    A nevezési listák automatikusan frissülnek mindent leadott nevezés után. A megadott kategória a nevezési időszak lezárása után felülvizsgálatra fog kerülni.
                  </p>
                </div>

                {/* Alsó linkek: English guide + díjak */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
                  <a
                    href="/en"
                    className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    English guide <ChevronRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#fees"
                    className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                  >
                    Nevezési díjak <ChevronRight className="h-4 w-4" />
                  </a>
                </div>

              </CardContent>
            </Card>
          </div>

            {/* Pulse chip + countdown to registration deadline */}
            <div className="mt-4 flex flex-row items-center justify-center gap-4 w-full max-w-5xl mx-auto">
              {/* Right pill – First-timers */}
              <div className="flex-1 rounded-full border border-red-900/70 bg-black/70 px-4 py-2 text-white shadow-[0_0_18px_rgba(127,29,29,0.7)] flex items-center gap-3 justify-center">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                <span className="leading-snug text-center text-[0.85em]">
                  Első versenyeseknek is, IPF-szabályrendszerű<br />
                  háromfogásos erőemelő esemény.
                </span>
              </div>

              {/* Left pill – Deadline countdown */}
              {deadlineLeft && (
                <div className="flex-1 rounded-full border border-red-900/70 bg-black/70 px-4 py-2 text-neutral-300 shadow-[0_0_18px_rgba(127,29,29,0.7)] flex items-center gap-3 justify-center">
                  <span className="flex items-center gap-2 text-red-400 text-[0.85em]">
                    <span aria-hidden>⏳</span>
                    <span className="text-red-400">
                      Nevezési határidőig:{" "}
                      <span className="font-mono">
                        {deadlineLeft.days} nap{" "}
                        {deadlineLeft.hours.toString().padStart(2, "0")}:
                        {deadlineLeft.minutes.toString().padStart(2, "0")}:
                        {deadlineLeft.seconds.toString().padStart(2, "0")}
                      </span>
                    </span>
                  </span>
                </div>
              )}
            </div>

          {/* Verseny röviden – teljes szélesség alatt */}
          <Card className="rounded-2xl border border-red-900/60 bg-black/80 shadow-[0_0_45px_rgba(0,0,0,0.9)]">
            <CardContent className="space-y-4 p-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-red-400">
                    Röviden
                  </div>
                </div>

                <img
                  src="/sbd_next_logo.png"
                  alt="SBD Next"
                  className="h-10 w-auto opacity-90"
                />
              </div>

              <div className="text-sm text-neutral-100">{EVENT.concept}</div>

              <div className="text-xs text-neutral-300">
                {EVENT.layout}
                <br />
                {EVENT.eventType}
              </div>

              <div className="text-xs text-neutral-400">
                Eredményhirdetés IPF pontszám alapján, súlycsoportok nélkül.
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-red-700/70 to-transparent" />

              <div className="grid gap-2 text-xs text-neutral-300">
                <div>
                  <span className="font-semibold text-neutral-100">
                    Jelentkezés:
                  </span>{" "}
                  {EVENT.deadlines.regOpen} – {EVENT.deadlines.regClose}
                </div>
              </div>
            </CardContent>
          </Card>
          <div
            id="deadline-changes"
            className="mt-4 grid gap-3 text-xs sm:text-sm scroll-mt-40"
          >
            <div className="rounded-xl border border-red-600/70 bg-red-950/40 p-4 text-red-100">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
                Díjazás
              </div>
              <div className="flex items-center gap-4 mb-0">
                <div className="flex flex-col items-start">
                  <p className="text-sm flex-1">
                    A dobogósok – helyezéstől függően – SBD vásárlási utalványt, táplálék-kiegészítőket, PowerFlow kurzust és konzultációt, valamint Avancus cipőt kapnak.
                  </p>
                </div>
                <img
                  src="/avancus.png"
                  alt="Avancus cipő"
                  className="h-40 sm:h-48 object-contain select-none self-end"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <img
                src="/sbd_logo_transparent.png"
                alt="SBD Hungary"
                className="h-32 w-auto opacity-95"
              />
              <img
                src="/powerflow_logo.png"
                alt="PowerFlow"
                className="h-32 w-auto opacity-95"
              />
              <img
                src="/avancus_logo.png"
                alt="Avancus"
                className="h-32 w-auto opacity-95"
              />
            </div>
          </div>
        </div>
      </header>

      {/* TARTALOM */}
      <main className="mx-auto max-w-5xl px-4 pb-20">
        <Section id="leaderboard" icon={Dumbbell} title="Nevezési listák (online)">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
  <CardContent className="p-6 text-sm text-neutral-100 space-y-2">
    <p>
      Az online nevezési lista közvetlenül a leadott nevezések adatai alapján frissül, így percenként az aktuális állapotot mutatja. A végleges flight- és kategóriabeosztás a nevezés lezárása után, a versenykiírás alapján kerül kialakításra.
    </p>
    <p className="text-xs text-neutral-400">
      A táblázatban szereplő sorrend csupán a nevezési totálok csökkenő rendezésére épül, az eredményhirdetés IPF pontszám alapján fog történni.
    </p>
  </CardContent>
</Card>

          <Leaderboard />
        </Section>
        <Section id="info" icon={Info} title="Versenyinformációk">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="grid gap-3 p-6 text-sm text-neutral-100">
              <div>
                <span className="font-medium">Nevezői limit:</span>{" "}
                {EVENT.cap} fő (kapacitás függvényében). A helyek a sikeres{" "}
                <b>fizetés</b> sorrendjében telnek be.
              </div>
              <div>
                <span className="font-medium">Felszerelés:</span>{" "}
                {EVENT.equipmentNote}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-neutral-400">Divíziók</div>
                  <div className="font-medium">
                    Újonc / Versenyző • Női / Férfi
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Pontozás</div>
                  <div className="font-medium">{EVENT.scoring}</div>
                </div>
              </div>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <Card className="rounded-xl border border-neutral-800 bg-black/60">
                  <CardContent className="p-4">
                    <div className="text-xs text-neutral-400">
                      Jelentkezés kezdete
                    </div>
                    <div className="font-semibold">
                      {EVENT.deadlines.regOpen}
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-neutral-800 bg-black/60">
                  <CardContent className="p-4">
                    <div className="text-xs text-neutral-400">
                      Nevezés határideje
                    </div>
                    <div className="font-semibold">
                      {EVENT.deadlines.regClose}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-2 rounded-xl border border-red-900/70 bg-red-950/50 p-4 text-xs text-red-100">
                A nevezési díj{" "}
                <b>tartalmazza a media csomagot és az egyedi SBD versenypólót.</b>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="schedule" icon={CalendarDays} title="Időrend">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="grid gap-3 p-6 text-sm text-neutral-100">
              <div>
                Mindkét versenynap 7:00 és 19:00 között zajlik a két platformon.
              </div>
              <div className="text-xs text-neutral-400">
                A pontos flight- és platformbeosztást a nevezés lezárása után
                tesszük közzé és itt is megtalálhatod majd!
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a
                  href={EVENT.streams.saturdayA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Szombat, A platform
                </a>
                <a
                  href={EVENT.streams.saturdayB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Szombat, B platform
                </a>
                <a
                  href={EVENT.streams.sundayA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Vasárnap, A platform
                </a>
                <a
                  href={EVENT.streams.sundayB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Vasárnap, B platform
                </a>
              </div>
              <div className="mt-3 text-xs text-neutral-400">
                Az élő közvetítés linkjei a verseny közeledtével frissülni fognak.
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="rules" icon={ShieldCheck} title="Szabályok & felszerelés">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="grid gap-4 p-6 text-sm text-neutral-100">
              <div>• MERSZ szabályok szerint zajlik a verseny.</div>
              <div>• Nem kell klubtagság és sportorvosi engedély.</div>
              <div>
                • Tiltott szerek és eszközök nem engedélyezettek. Versenyzők
                mindent használhatnak az IPF szabályain belül.
              </div>
              <div>
                • Versenyzők: kantáros erőemelő mez, hosszú zokni, cipő és póló kötelező. Ezen felül minden használható, ami az IPF RAW szabályain belül megengedett.
              </div>
              <div>
                • Újoncok: testhez simuló rövid- vagy hosszúnadrág és felső elegendő. Rövid nadrág esetén a felhúzáshoz szükséges a hosszú szárú zokni.
              </div>
              <div>
                • Felszerelés-ellenőrzés mindenki számára kötelező.
              </div>

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <a
                  href="/docs/IPF_MERSZ_szabalyzat_2025.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs transition hover:border-red-700 hover:bg-red-950/30"
                >
                  <span>
                    IPF/MERSZ szabályzat (PDF)
                    <br />
                    <span className="text-neutral-400">
                      Hivatalos szabálykönyv (2025)
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-red-400" />
                </a>

                <a
                  href="/docs/SBD_Next_versenykiiras.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs transition hover:border-red-700 hover:bg-red-950/30"
                >
                  <span>
                    SBD Next versenykiírás (PDF)
                    <br />
                    <span className="text-neutral-400">
                      Hivatalos kiírás, részletes infók
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-red-400" />
                </a>

                <a
                  href="/docs/MERSZ_Open_Minositesi_Szintek_2025.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs transition hover:border-red-700 hover:bg-red-950/30"
                >
                  <span>
                    MERSZ minősítési szintek (2025 – Open)
                    <br />
                    <span className="text-neutral-400">
                      Férfi és női open szintek egy fájlban
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-red-400" />
                </a>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="fees" icon={TicketCheck} title="Nevezési és nézői díjak">
          <div className="text-base sm:text-lg">
            <Card className="rounded-2xl border border-neutral-800 bg-black/70">
              <CardContent className="p-6">
                <PriceRow
                  label="Nevezési díj"
                  value={`${priceEntry} ${EVENT.fees.currency}`}
                  note="Tartalmazza a media csomagot (menő fotók rólad) és az egyedi SBD pólót. A profi fotókról és videókról 4 fős csapat gondoskodik."
                />

                <PriceRow
                  label="Nézői jegy"
                  value={`${priceSpectator} ${EVENT.fees.currency}`}
                  note="A helyszínen készpénzben vagy kártyával."
                />

                <PriceRow
                  label="Prémium média csomag (nem kötelező)"
                  value={`${pricePremium} ${EVENT.fees.currency}`}
                  note="3 fotó + 3 videó. A profi fotókról és videókról 4 fős csapat gondoskodik!"
                />
                
                {IS_STAGING && (
                  <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/20 p-4 text-center max-w-md mx-auto">
                    <p className="mb-3 text-sm text-neutral-300">
                      Már neveztél, de szeretnéd utólag megvásárolni a prémium média csomagot?
                    </p>
                    <Link href="/premium-media">
                      <Button className="w-full rounded-full bg-red-600 hover:bg-red-700 font-semibold">
                        Prémium média csomag vásárlása
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-neutral-300">
                  A dobogósok – helyezéstől függően – SBD vásárlási utalványt, táplálék-kiegészítőket, PowerFlow kurzust és konzultációt, valamint Avancus cipőt kapnak.
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section id="venue" icon={MapPin} title="Helyszín">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border border-neutral-800 bg-black/70">
              <CardContent className="grid gap-2 p-6 text-sm text-neutral-100">
                <div className="font-medium">{EVENT.location.name}</div>
                <div className="text-neutral-300">
                  {EVENT.location.address}
                </div>
                <div>
                  Parkolás: a gyárépület területén belül (festékbolt előtt),
                  illetve a Nándorfejérvári utcán ingyenesen. Öltöző és zuhany
                  elérhető.
                </div>
                <div>
                  Közeli szolgáltatások: Aldi, Tesco egy utcányira, food truck
                  szervezés alatt.
                </div>
              </CardContent>
            </Card>

            {(() => {
              const raw = (EVENT.location.mapEmbedSrc || "").trim();
              const mapSrc = raw.includes("<iframe")
                ? raw.match(/src="([^"]+)"/)?.[1] ?? ""
                : raw;

              return (
                <div className="h-[340px] w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black/70 md:h-[400px]">
                  {mounted && mapSrc ? (
                    <iframe
                      key="map-mounted"
                      title="Térkép"
                      src={mapSrc}
                      className="h-full w-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      suppressHydrationWarning
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-900" />
                  )}
                </div>
              );
            })()}
          </div>
        </Section>

        <Section id="register" icon={Dumbbell} title="Nevezés">

          {/* Kapacitás chip deaktiválva */}

          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="p-6">
              <RegistrationForm />
            </CardContent>
          </Card>

          <p className="mt-4 text-xs text-neutral-400">
            A nevezők maximális létszámának elérése után minden új jelentkező
            automatikusan várólistára kerül. A felszabaduló helyeket a
            várólistán szereplők jelentkezési sorrendben kapják meg, a
            szervezők egyéni e-mailes értesítése alapján. A várólistáról való
            bekerülés a visszaigazolás és a nevezési díj befizetése után válik
            érvényessé.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="rounded-2xl border border-red-400/60 bg-black/70 px-6 py-5 max-w-lg w-full text-center shadow-[0_0_30px_rgba(248,113,113,0.15)]">
              <div className="mb-3 text-base font-semibold text-red-300">Ha Önkéntesként segítenél a versenyen, kattints ide a regisztrációhoz!</div>
              <a href="/volunteers">
                <Button className="rounded-full bg-red-400 px-8 py-2 text-white font-bold hover:bg-red-500 transition-all duration-200">
                  Önkéntes jelentkezés
                </Button>
              </a>
            </div>
          </div>
        </Section>

        <Section id="faq" icon={Info} title="GYIK">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="grid gap-3 p-6 text-sm text-neutral-100">
              <div>
                <div className="font-medium">
                  Kell sportorvosi vagy szövetségi engedély?
                </div>
                <div className="text-neutral-300">
                  Nem kell klubtagság és sportorvosi engedély.
                </div>
              </div>
              <div>
                <div className="font-medium">Hogyan fizethetek?</div>
                <div className="text-neutral-300">
                  Online, Stripe-on keresztül — a nevezés végén átirányítunk a
                  fizetési oldalra.
                </div>
              </div>
              <div>
                <div className="font-medium">Mi van a nevezési díjban?</div>
                <div className="text-neutral-300">
                  Media csomag (menő fotók rólad), egyedi SBD versenypóló.
                  Prémium csomag külön vásárolható (3 fotó + 3 videó).
                </div>
              </div>
              <div>
                <div className="font-medium">Van nevezői limit?</div>
                <div className="text-neutral-300">
                  Igen, {EVENT.cap} fő. A helyek a sikeres fizetés sorrendjében
                  telnek be.
                </div>
              </div>
              <div>
                <div className="font-medium">Lesz stream?</div>
                <div className="text-neutral-300">
                  Igen, a két nap négy streamlinken követhető (lásd az Időrend
                  szekció alján).
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="contact" icon={Mail} title="Kapcsolat">
          <Card className="rounded-2xl">
            <CardContent className="grid gap-3 p-6 text-sm">
  <div className="flex items-start gap-3">
    <Mail className="h-5 w-5 text-red-500" />
    <div>
      <div className="font-medium">E-mail</div>
      <a
        href={`mailto:${EVENT.contact.email}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-400 underline hover:text-red-300"
      >
        {EVENT.contact.email}
      </a>
    </div>
  </div>

  <div className="flex items-start gap-3">
    <ExternalLink className="h-5 w-5 text-red-500" />
    <div>
      <div className="font-medium">Instagram</div>
      <div className="flex flex-col text-red-400 underline">
        <a
          href={EVENT.social.igSbd}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-300"
        >
          @sbd.hungary
        </a>
        <a
          href={EVENT.social.igPowerflow}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-300"
        >
          @powerfloweu
        </a>
      </div>
    </div>
  </div>

  <div className="text-xs text-neutral-400">
    Kérdésed van a nevezéssel, szabályokkal vagy a részletekkel
    kapcsolatban? Írj nekünk, válaszolunk!
  </div>
</CardContent>
          </Card>
        </Section>


      </main>

      <footer className="border-t border-red-900/70 bg-black">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          {/* Logók */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.sbdhungary.hu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/sbd_logo.jpg"
                alt="SBD Hungary"
                className="h-8 w-auto sm:h-9"
              />
            </a>

            <a
              href="https://power-flow.eu/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/powerflow_logo.png"
                alt="PowerFlow"
                className="h-7 w-auto opacity-95 sm:h-8"
              />
            </a>
          </div>

          <div className="space-y-1 text-right sm:ml-auto sm:text-left">
            <div className="text-neutral-200">
              SBD Next – A következő szint.
            </div>
            <div>
              Kapcsolat:{" "}
              <a
                href={`mailto:${EVENT.contact.email}`}
                className="text-red-400 hover:text-red-400"
              >
                {EVENT.contact.email}
              </a>
            </div>
            <div className="text-[11px] text-neutral-500">
              © {year} SBD Hungary &amp; PowerFlow
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
