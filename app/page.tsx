"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type ChangeEvent,
} from "react";
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

// ====== KAPACITÁS / NEVEZÉS ÁLLAPOT ======
const CAP_LIMIT = 220;
const CAP_USED = Number(process.env.NEXT_PUBLIC_CAP_USED ?? "0");
const CAP_FULL_FLAG =
  (process.env.NEXT_PUBLIC_CAP_FULL ?? "").toLowerCase() === "true";
const CAP_REMAINING = Math.max(0, CAP_LIMIT - CAP_USED);
const CAP_FULL = CAP_FULL_FLAG || CAP_REMAINING <= 0;

// NEVEZÉS NYITVA?
const REG_OPEN = true; // ha nyit a nevezés: true

// A nevezés indulásának fix időpontja (CET)
const REG_OPEN_AT = new Date("2025-11-20T20:00:00+01:00");

// ====== ESEMÉNY ADATOK ======
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
    "MERSZ szabályai szerint (kantáros ruha, hosszú zokni, cipő, póló kötelező, ezen felül minden, ami az IPF RAW szabályain belül megengedett).",
  deadlines: {
    regOpen: "2025. november 20.",
    regClose: "2025. december 1.",
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
          <div className="text-xs uppercase tracking-widest text-red-200/80">
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
  if (!data.birthYear.trim()) {
    return "Kérlek add meg a születési éved.";
  }
  if (!/^\d{4}$/.test(data.birthYear.trim())) {
    return "A születési év négy számjegy legyen (pl. 1995).";
  }
  if (!data.sex) {
    return "Kérlek válaszd ki a nemed.";
  }
  if (!data.division) {
    return "Kérlek válaszd ki a kategóriát.";
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
  // Stripe Payment Linkek
  const PAYMENT_LINK_BASE =
    "https://buy.stripe.com/fZuaEW42r2q89EUahLdfG0o"; // csak nevezés

  const PAYMENT_LINK_PREMIUM =
    "https://buy.stripe.com/cNi00iaqP7Ks5oE3TndfG0p"; // nevezés + prémium média

  const WEBHOOK_URL = "/api/registration-webhook";

  const [waitlisted, setWaitlisted] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    birthYear: "",
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

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!REG_OPEN) {
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

      const isWaitlist = CAP_FULL;

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

  // ====== WAITLIST DONE ======
  if (done) {
    if (waitlisted) {
      return (
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-950/40 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-yellow-300" />
          <h3 className="mt-4 text-lg font-semibold text-yellow-100">
            Felkerültél a várólistára.
          </h3>
          <p className="mt-1 text-sm text-yellow-100/80">
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

  // ====== FORM ======
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
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

      {/* NÉV */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-red-400">
            Vezetéknév <span className="text-red-500">*</span>
          </label>
          <Input
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
            value={data.firstName}
            onChange={(e) => setData({ ...data, firstName: e.target.value })}
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
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder="nev@email.hu"
          required
        />
      </div>

      {/* KLUB */}
      <div>
        <label className="text-sm">Egyesület / Klub (nem kötelez)</label>
        <Input
          value={data.club}
          onChange={(e) => setData({ ...data, club: e.target.value })}
          placeholder="—"
        />
      </div>

      {/* SZÜLETÉSI ÉV */}
      <div>
        <label className="text-sm font-semibold text-red-400">
          Születési év <span className="text-red-500">*</span>
        </label>
        <Input
          inputMode="numeric"
          maxLength={4}
          placeholder="pl. 1995"
          value={data.birthYear}
          onChange={(e) =>
            setData({ ...data, birthYear: (e.target as HTMLInputElement).value })
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
          <SelectTrigger>
            <SelectValue placeholder="Válassz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nő">Nő</SelectItem>
            <SelectItem value="Férfi">Férfi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DIVISION */}
      <div>
        <label className="text-sm font-semibold text-red-400">
          Újonc / Versenyző <span className="text-red-500">*</span>
        </label>
        <Select
          onValueChange={(v) => setData({ ...data, division: v })}
          value={data.division}
        >
          <SelectTrigger>
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
        <p className="mt-1 text-[11px] text-neutral-400">
          Újonc: első vagy második IPF/MERSZ versenyed. Versenyző: több versenyen
          indultál, rutinos vagy.
        </p>
      </div>

      {/* NEVEZÉSI SÚLYOK */}
      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-red-400">
            Guggolás – nevezési súly (kg) <span className="text-red-500">*</span>
          </label>
          <Input
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
            Felhúzás – nevezési súly (kg) <span className="text-red-500">*</span>
          </label>
          <Input
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
      </div>

      <p className="mt-1 text-xs text-neutral-400">
        Maradjunk a realitások talaján, a versenybeosztás miatt nagyon fontos adat!
      </p>

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
            <SelectTrigger>
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
            <SelectTrigger>
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

      {/* MC NOTES */}
      <div>
        <label className="text-sm">
          Rólad / bemondó szöveg (nem kötelező)
        </label>
        <Textarea
          value={data.mcNotes}
          onChange={(e) => setData({ ...data, mcNotes: e.target.value })}
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
          onChange={(e) => setData({ ...data, otherNotes: e.target.value })}
          placeholder="Pl. külön kérés vagy egészségügyi infó."
        />
      </div>

      {/* CONSENT */}
      <div className="mt-2 flex items-start gap-3">
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

      {/* PREMIUM — moved under consent */}
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

      {/* SUBMIT */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || !REG_OPEN}>
          {submitting ? "Tovább a fizetéshez…" : "Nevezés és fizetés"}
        </Button>

        <div className="text-xs text-muted-foreground">
          A nevezési díj: 29 990 Ft — tartalmazza a <b>media csomagot</b> és az{" "}
          <b>egyedi SBD versenypólót</b>.
          <br />
          <span className="text-[11px] text-red-300">
            Fontos: a nevezési díj nem visszatéríthető.
          </span>
        </div>
      </div>

      {CAP_FULL && (
        <p className="mt-2 text-xs text-yellow-300">
          A nevezői létszám jelenleg betelt, az űrlap kitöltésével{" "}
          <b>várólistára</b> tudsz jelentkezni. Fizetni csak akkor kell, ha
          e-mailben visszaigazoljuk.
        </p>
      )}
    </form>
  );
}

// ====== OLDAL ======
export default function EventLanding() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const priceEntry = new Intl.NumberFormat("hu-HU").format(EVENT.fees.entry);
  const priceSpectator = new Intl.NumberFormat("hu-HU").format(
    EVENT.fees.spectator
  );
  const pricePremium = new Intl.NumberFormat("hu-HU").format(
    EVENT.fees.premium
  );
  const year = new Date().getUTCFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-neutral-50">
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
            </div>

            <a href="#register">
              <button className="flex items-center rounded-full border border-red-500/70 bg-red-600/90 px-4 py-1 text-xs font-semibold text-white shadow-[0_0_20px_rgba(248,113,113,0.55)] hover:bg-red-500 sm:text-sm">
                Nevezés <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative text-white">
        {/* Háttér */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[url('/hero_bg.jpg')] bg-cover bg-center opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
        </div>

        {/* Tartalom */}
        <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 lg:flex-row lg:items-start">
          {/* Bal oldal */}
          <div className="flex-1">
            {/* SBD NEXT LOGÓ */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <img
                src="/sbd_next_logo.png"
                alt="SBD Next"
                className="w-[260px] drop-shadow-[0_0_45px_rgba(248,113,113,0.85)] sm:w-[320px] md:w-[360px]"
              />
            </motion.div>

            {/* Cím + chevron fadeout */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex items-center gap-3"
            >
              <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.9)] sm:text-4xl">
                A következő szint
              </h1>
              <div className="hidden items-center gap-1 text-red-400/70 sm:flex">
                <ChevronRight className="h-4 w-4" />
                <div className="h-[2px] w-24 bg-gradient-to-r from-red-500/80 via-red-500/30 to-transparent" />
              </div>
            </motion.div>

            {/* Alapinfók */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Dátum" value={EVENT.date} Icon={CalendarDays} />
              <Stat label="Idő" value={EVENT.time} Icon={Timer} />
              <Stat
                label="Helyszín"
                value={`${EVENT.location.name} — ${EVENT.location.address}`}
                Icon={MapPin}
              />
            </div>

            {/* Versenykiírás – nagy gomb */}
            <div className="mt-5">
              <a
                href="/docs/SBD_Next_versenykiiras.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full rounded-2xl border border-red-500/80 bg-black/80 px-6 py-3 text-sm font-semibold text-red-200 shadow-[0_0_24px_rgba(248,113,113,0.6)] hover:bg-red-600 hover:text-white sm:w-auto">
                  Versenykiírás (PDF)
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#register">
                <Button className="rounded-2xl bg-red-600 px-6 font-semibold shadow-[0_0_28px_rgba(248,113,113,0.7)] hover:bg-red-500">
                  Nevezek most
                </Button>
              </a>
              <a
                href="#fees"
                className="inline-flex items-center gap-1 text-sm text-red-300 hover:text-red-200"
              >
                Nevezési díjak <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            {/* Pulse chip */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-900/70 bg-black/70 px-3 py-1 text-xs text-red-200 shadow-[0_0_18px_rgba(127,29,29,0.7)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
              <span>
                Első versenyeseknek is, IPF-szabályos full power esemény.
              </span>
            </div>
          </div>

          {/* Jobb oldali kártya */}
          <Card className="mt-4 flex-1 rounded-2xl border border-red-900/60 bg-black/80 shadow-[0_0_45px_rgba(0,0,0,0.9)] lg:mt-0">
            <CardContent className="space-y-4 p-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-red-300">
                    Verseny röviden
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
        </div>
      </header>

      {/* TARTALOM */}
      <main className="mx-auto max-w-5xl px-4 pb-20">
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
  <Card className="rounded-2xl border border-neutral-800 bg-black/70">
    <CardContent className="p-6">

      <PriceRow
        label="Nevezési díj"
        value={`${priceEntry} ${EVENT.fees.currency}`}
        note="Tartalmazza a media csomagot (menő fotók rólad) és az egyedi SBD pólót. A profi fotókról és videókról 5 fős csapat gondoskodik."
      />

      <PriceRow
        label="Nézői jegy"
        value={`${priceSpectator} ${EVENT.fees.currency}`}
        note="A helyszínen készpénzben vagy kártyával."
      />

      <PriceRow
        label="Prémium média csomag (opcionális)"
        value={`${pricePremium} ${EVENT.fees.currency}`}
        note="3 fotó + 3 videó. A profi fotókról és videókról 5 fős csapat gondoskodik!"
      />

    </CardContent>
  </Card>
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
                  Parkolás: a gyárépület területén belül (festékbolt előtt), illetve a Nándorfejérvári utcán ingyenesen. Öltöző és
                  zuhany elérhető.
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
          <RegistrationForm />

          <p className="mt-4 text-xs text-neutral-400">
            A nevezők maximális létszámának elérése után minden új jelentkező
            automatikusan várólistára kerül. A felszabaduló helyeket a
            várólistán szereplők jelentkezési sorrendben kapják meg, a
            szervezők egyéni e-mailes értesítése alapján. A várólistáról való
            bekerülés a visszaigazolás és a nevezési díj befizetése után válik
            érvényessé.
          </p>
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
                className="text-red-400 hover:text-red-300"
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