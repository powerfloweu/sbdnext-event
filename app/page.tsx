"use client";

import { useEffect, useMemo, useState } from "react";
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

// NEVEZÉS NYITVA? – MOST MÉG NEM
const REG_OPEN = false; // ha nyit a nevezés: true

// ====== ESEMÉNY ADATOK ======
const EVENT = {
  title: "SBD Next – Új belépők powerlifting versenye",
  subtitle: "A következő szint",
  date: "2026. február 14–15.",
  time: "7:00–19:00 (mindkét nap)",
  location: {
    name: "Thor Gym (XI. kerület)",
    address: "Budapest, Nándorfejérvári út 40, 1116",
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4748.762520334373!2d19.04355177770303!3d47.46025827117686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dda23e15b409%3A0x59fe623bd00aa0be!2sThor%20Gym!5e1!3m2!1shu!2shu!4v1762941118132!5m2!1shu!2shu",
  },
  concept:
    "Szabadidős esemény újoncoknak kötöttségek nélkül, erőemelő versenyzőknek pedig gyakorlásképp!",
  layout: "2 nap, 2 platform",
  federation:
    "IPF szabályrendszer (hamarosan belinkeljük a hivatalos IPF/MERSZ szabálykönyvet). Nem kell klubtagság és sportorvosi engedély.",
  equipmentNote:
    "Kezdőknek nem szükséges semmilyen felszerelés. Versenyzők mindent használhatnak az IPF szabályrendszerén belül.",
  deadlines: {
    regOpen: "Nov. 20",
    regClose: "Dec. 1",
    refundFull: "Dec. 31-ig 100% visszatérítés",
    refundHalf: "Jan. 14-ig 50% visszatérítés",
    refundNone: "Később nincs visszatérítés",
  },
  fees: {
    entry: 33990,
    spectator: 1000,
    premium: 24990,
    currency: "HUF",
  },
  contact: {
    email: "david@power-flow.eu",
    phone: "+36 30 466 0011",
  },
  social: {
    igSbd: "https://instagram.com/sbdhungary",
    igPowerflow: "https://instagram.com/powerfloweu",
  },
  divisions: ["Újonc", "Versenyző"],
  scoring: "Eredményhirdetés IPF pontszám alapján (nincsenek súlycsoportok).",
  eventType: "Háromfogásos, full power (SBD) verseny.",
  streams: {
    saturdayA: "#",
    saturdayB: "#",
    sundayA: "#",
    sundayB: "#",
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
  icon?: any;
  title: string;
  children: React.ReactNode;
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
  Icon: any;
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

// ====== REGISZTRÁCIÓ ======
function RegistrationForm() {
  const PAYMENT_LINK_BASE =
    "https://buy.stripe.com/8x26oG6az4yg8AQ89DdfG0m"; // Nevezés (33 990 Ft)
  const PAYMENT_LINK_PREMIUM =
    "https://buy.stripe.com/bJe7sK0Qf7Ks9EU1LfdfG0n"; // Prémium (+24 990 Ft)

  const WEBHOOK_URL =
    "https://hook.eu1.make.com/6vbe2dxien274ohy91ew22lp9bbfzrl3";

  const [data, setData] = useState<any>({
    name: "",
    email: "",
    birthdate: "",
    club: "",
    sex: "",
    division: "",
    bestTotal: "",
    notes: "",
    consent: false,
    premium: false,
    honeypot: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => {
    if (CAP_FULL) return false;
    if (!REG_OPEN) return false;
    if (data.honeypot && data.honeypot.trim().length > 0) return false;
    if (
      !data.name ||
      !data.email ||
      !data.sex ||
      !data.division ||
      !data.consent
    ) {
      return false;
    }
    return /.+@.+\..+/.test(data.email);
  }, [data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!REG_OPEN) return;
    if (CAP_FULL) return;
    if (data.honeypot && data.honeypot.trim().length > 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const registrationId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `reg_${Date.now()}`;

      const target = data.premium ? PAYMENT_LINK_PREMIUM : PAYMENT_LINK_BASE;
      const utm =
        typeof window !== "undefined" ? window.location.search || "" : "";

      const payload = {
        registrationId,
        ...data,
        paymentOption: data.premium ? "premium" : "base",
        stripeLink: target,
        submittedAt: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
        page: "/",
        utm,
        cap: {
          limit: CAP_LIMIT,
          used: CAP_USED,
          remaining: CAP_REMAINING,
          full: CAP_FULL,
        },
      };

      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      const beaconOk =
        typeof navigator !== "undefined" && "sendBeacon" in navigator
          ? navigator.sendBeacon(WEBHOOK_URL, blob)
          : false;

      if (!beaconOk) {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }

      const url = new URL(target);
      if (data.email) url.searchParams.set("prefilled_email", data.email);
      window.location.href = url.toString();

      setDone(true);
    } catch {
      setError(
        "A jelentkezés nem sikerült. Próbáld újra, vagy írj nekünk e-mailt."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (CAP_FULL) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-6 text-sm">
        <div className="flex items-center gap-2 font-semibold text-red-200">
          <AlertCircle className="h-5 w-5" />
          Betelt a nevezés ({CAP_LIMIT} fő).
        </div>
        <p className="mt-2 text-red-100/90">
          Jelentkezés betelése után lemondás esetén várólista alapján egyénileg
          értesítünk.
        </p>
        <p className="mt-2 text-red-100/90">
          Kövesd az Instagramot (
          <a
            href={EVENT.social.igPowerflow}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            @powerfloweu
          </a>{" "}
          és{" "}
          <a
            href={EVENT.social.igSbd}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            @sbdhungary
          </a>
          ) a lemondott helyekért / várólistáért.
        </p>
      </div>
    );
  }

  if (!REG_OPEN) {
    return (
      <div className="space-y-3 rounded-2xl border border-yellow-500/50 bg-yellow-950/40 p-6 text-sm">
        <div className="flex items-center gap-2 font-semibold text-yellow-200">
          <AlertCircle className="h-5 w-5" />
          A nevezés még nem indult el.
        </div>
        <p className="text-yellow-100/90">
          Jelentkezés: <b>{EVENT.deadlines.regOpen}</b> –{" "}
          <b>{EVENT.deadlines.regClose}</b>. A nevezési felület ezen az oldalon
          fog megnyílni.
        </p>
        <p className="text-yellow-100/80">
          Kövess minket Instagramon{" "}
          <a
            href={EVENT.social.igSbd}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            @sbdhungary
          </a>{" "}
          és{" "}
          <a
            href={EVENT.social.igPowerflow}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            @powerfloweu
          </a>{" "}
          oldalakon – folyamatos információ-frissítés 2–4 hetente az esemény
          közeledtével.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-950/40 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-400" />
        <h3 className="mt-4 text-lg font-semibold text-green-100">
          Átirányítás a fizetéshez…
        </h3>
        <p className="mt-1 text-sm text-green-100/80">
          Ha nem történik meg automatikusan,{" "}
          <a
            className="underline"
            href={data.premium ? PAYMENT_LINK_PREMIUM : PAYMENT_LINK_BASE}
          >
            kattints ide
          </a>{" "}
          a fizetéshez.
        </p>
      </div>
    );
  }

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

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm">Teljes név</label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Vezetéknév Keresztnév"
            required
          />
        </div>
        <div>
          <label className="text-sm">E-mail</label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="nev@email.hu"
            required
          />
        </div>
        <div>
          <label className="text-sm">Születési dátum</label>
          <Input
            type="date"
            value={data.birthdate}
            onChange={(e) =>
              setData({ ...data, birthdate: (e.target as any).value })
            }
          />
        </div>
        <div>
          <label className="text-sm">Egyesület / Klub (opcionális)</label>
          <Input
            value={data.club}
            onChange={(e) => setData({ ...data, club: e.target.value })}
            placeholder="—"
          />
        </div>
        <div>
          <label className="text-sm">Nem</label>
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
              <SelectItem value="Egyéb">Egyéb</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Divízió</label>
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
        </div>
        <div>
          <label className="text-sm">Legjobb összetett (opcionális)</label>
          <Input
            inputMode="numeric"
            placeholder="pl. 495 kg"
            value={data.bestTotal}
            onChange={(e) =>
              setData({ ...data, bestTotal: (e.target as any).value })
            }
          />
        </div>
      </div>

      <div>
        <label className="text-sm">
          Megjegyzés (pl. kísérő, speciális igény)
        </label>
        <Textarea
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          placeholder="—"
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={data.consent}
          onCheckedChange={(v: any) =>
            setData({ ...data, consent: Boolean(v) })
          }
        />
        <label htmlFor="consent" className="text-sm">
          Hozzájárulok az adataim kezeléséhez és elfogadom a verseny
          szabályzatát. Tudomásul veszem, hogy a nevezés a{" "}
          <b>fizetéssel</b> válik véglegessé.
        </label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="premium"
          checked={data.premium}
          onCheckedChange={(v: any) =>
            setData({ ...data, premium: Boolean(v) })
          }
        />
        <label htmlFor="premium" className="text-sm">
          Prémium média csomag (+24 990 Ft): 3 fotó + 3 videó, kiemelt
          válogatás.
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!valid || submitting}>
          {submitting ? "Tovább a fizetéshez…" : "Nevezés és fizetés"}
        </Button>
        <div className="text-xs text-muted-foreground">
          A nevezési díj: 33 990 Ft — tartalmazza a{" "}
          <b>media csomagot (1 fotó + 1 videó)</b> és az{" "}
          <b>egyedi SBD versenypólót</b>. Prémium opció: +24 990 Ft (3 fotó + 3
          videó).
        </div>
      </div>
    </form>
  );
}

// ====== OLDAL ======
export default function EventLanding() {
  const [mounted, setMounted] = useState(false);
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

            {/* Leírás */}
            <div className="mt-4 text-sm text-neutral-100">
              {EVENT.concept}
            </div>
            <div className="mt-1 text-sm text-neutral-300">
              {EVENT.layout} • {EVENT.eventType}
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
                  <div className="text-xs text-neutral-400">
                    A következő szint – SBD Next új belépők powerlifting
                    versenye.
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
                <span className="font-medium">Koncepció:</span>{" "}
                {EVENT.concept}
              </div>
              <div>
                <span className="font-medium">Elrendezés:</span>{" "}
                {EVENT.layout} – 2 nap, 2 platform.
              </div>
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
                <b>
                  tartalmazza a media csomagot (1 fotó + 1 videó) és az egyedi
                  SBD versenypólót
                </b>
                . Opcionálisan{" "}
                <b>Prémium media package</b> vásárolható (3 fotó + 3 videó).
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="schedule" icon={CalendarDays} title="Időrend (terv)">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="grid gap-3 p-6 text-sm text-neutral-100">
              <div>
                Mindkét versenynap 7:00 és 19:00 között zajlik a két platformon.
              </div>
              <div className="text-xs text-neutral-400">
                A pontos flight- és platformbeosztást a nevezés lezárása után
                tesszük közzé.
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <a
                  href={EVENT.streams.saturdayA}
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Szombat, A platform
                </a>
                <a
                  href={EVENT.streams.saturdayB}
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Szombat, B platform
                </a>
                <a
                  href={EVENT.streams.sundayA}
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Vasárnap, A platform
                </a>
                <a
                  href={EVENT.streams.sundayB}
                  className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <LinkIcon className="h-4 w-4" />
                  Stream — Vasárnap, B platform
                </a>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="rules" icon={ShieldCheck} title="Szabályok & felszerelés">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="grid gap-4 p-6 text-sm text-neutral-100">
              <div>• IPF szabályrendszer szerint zajlik a verseny.</div>
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
                  href="/docs/MERSZ_minositesi_szintek_open.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs transition hover:border-red-700 hover:bg-red-950/30 sm:col-span-2"
                >
                  <span>
                    MERSZ minősítési szintek (PDF)
                    <br />
                    <span className="text-neutral-400">
                      Open szintek kiemelve (női + férfi egy PDF-ben)
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
                note="Tartalmazza a media csomagot (1 fotó + 1 videó) és az egyedi SBD versenypólót."
              />
              <PriceRow
                label="Nézői jegy"
                value={`${priceSpectator} ${EVENT.fees.currency}`}
                note="A helyszínen készpénzben vagy kártyával."
              />
              <PriceRow
                label="Prémium média csomag (opcionális)"
                value={`${pricePremium} ${EVENT.fees.currency}`}
                note="3 fotó + 3 videó."
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
                  Parkolás: utcán, fizetős övezet (szombat délelőtt). Öltöző és
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
                  Media csomag (1 fotó + 1 videó), egyedi SBD versenypóló.
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
                    href="mailto:david@power-flow.eu"
                    className="text-red-400 underline hover:text-red-300"
                  >
                    david@power-flow.eu
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
            <div className="text-neutral-200">SBD Next – a következő szint.</div>
            <div>
              Kapcsolat:{" "}
              <a
                href="mailto:david@power-flow.eu"
                className="text-red-400 hover:text-red-300"
              >
                david@power-flow.eu
              </a>{" "}
              •{" "}
              <a
                href="tel:+36304660011"
                className="text-red-400 hover:text-red-300"
              >
                +36 30 466 0011
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