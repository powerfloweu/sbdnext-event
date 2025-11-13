"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Timer,
  Info,
  Mail,
  Phone,
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
    "IPF szabályrendszer (hamarosan belinkeljük a hivatalos magyar IPF szabálykönyvet). Újoncoknak nem kell klubtagság és sportorvosi engedély.",
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
    platformA: "#", // később cserélhető
    platformB: "#",
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
      <div className="flex items-center gap-2 mb-4">
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
      <CardContent className="p-4 flex items-center gap-3">
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
    <div className="flex items-start justify-between border-b border-neutral-800 py-2">
      <div className="font-medium text-sm">{label}</div>
      <div className="text-right">
        <div className="font-semibold text-sm text-red-300">{value}</div>
        {note && (
          <div className="text-xs text-neutral-400 max-w-xs ml-auto">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

// ====== REGISZTRÁCIÓ ======
function RegistrationForm() {
  // Stripe Payment Linkek (később aktiválod, ha REG_OPEN = true)
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
      <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-6 text-sm">
        <div className="flex items-center gap-2 text-amber-300 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Betelt a nevezés ({CAP_LIMIT} fő).
        </div>
        <p className="mt-2 text-amber-100/90">
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
      <div className="rounded-2xl border border-yellow-500/50 bg-yellow-950/40 p-6 text-sm space-y-3">
        <div className="flex items-center gap-2 text-yellow-200 font-semibold">
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
        <p className="text-sm text-green-100/80 mt-1">
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
        <div className="flex items-center gap-2 text-red-400 text-sm">
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

      <div className="grid sm:grid-cols-2 gap-3">
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
      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur bg-black/70 border-b border-red-900/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Image
                src="/sbd_logo.jpg"
                alt="SBD Hungary"
                width={40}
                height={40}
                className="rounded-sm border border-red-900/70 bg-black object-contain"
              />
              <Image
                src="/powerflow_logo.png"
                alt="PowerFlow"
                width={40}
                height={40}
                className="rounded-sm bg-black object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs uppercase tracking-[0.25em] text-red-300">
                SBD Next
              </span>
              <span className="text-sm font-medium text-neutral-100">
                Új belépők powerlifting versenye
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs">
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
          <a
            href="#register"
            className="inline-flex items-center gap-1 text-xs font-medium text-red-200"
          >
            Nevezés <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </nav>

      {/* HERO — fekete/piros SBD brand */}
<header
  className="
    relative
    bg-[url('/hero_bg.jpg')]
    bg-cover bg-center bg-no-repeat
    text-white
  "
>
  {/* Black-to-transparent overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />

  <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-20">
    {/* HERO TITLE */}
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
    >
      SBD Next
    </motion.h1>

    {/* PULSING RED BADGE — “A következő szint” */}
    <div className="mt-4 inline-flex items-center gap-2 rounded-full
      border border-red-900/70 bg-red-900/30
      shadow-[0_0_25px_rgba(255,0,0,0.6)]
      px-3 py-1 text-xs sm:text-sm text-red-200">
      <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
      <span>A következő szint</span>
    </div>

    {/* SUBTEXT (no orange) */}
    <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
      Első versenyeseknek is. IPF-szabályos full power esemény – két nap, két platform, profi lebonyolítással.
    </p>

    {/* CTA BUTTONS */}
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <a href="#register">
        <Button className="rounded-2xl px-6 bg-primary hover:bg-primary/90">
          Nevezek most
        </Button>
      </a>

      <a
        href="#fees"
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
      >
        Nevezési díjak <ChevronRight className="h-4 w-4" />
      </a>
    </div>

    {/* INSTAGRAM LINKS */}
    <div className="mt-4 text-sm text-neutral-300 flex flex-wrap items-center gap-2">
      <span>Kövess minket Instagramon:</span>
      <a
        href="https://instagram.com/sbdhungary"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80"
      >
        @sbdhungary
      </a>
      <span>&</span>
      <a
        href="https://instagram.com/powerfloweu"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80"
      >
        @powerfloweu
      </a>
    </div>
  </div>
</header>

      {/* TARTALOM */}
      <main className="max-w-5xl mx-auto px-4 pb-20">
        <Section id="info" icon={Info} title="Versenyinformációk">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="p-6 grid gap-3 text-sm text-neutral-100">
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
              <div className="grid sm:grid-cols-2 gap-2">
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
              <div className="grid sm:grid-cols-3 gap-4 mt-2">
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
                <Card className="rounded-xl border border-neutral-800 bg-black/60">
                  <CardContent className="p-4">
                    <div className="text-xs text-neutral-400">Lemondás</div>
                    <div className="font-semibold">
                      {EVENT.deadlines.refundFull} •{" "}
                      {EVENT.deadlines.refundHalf} •{" "}
                      {EVENT.deadlines.refundNone}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="rounded-xl bg-red-950/50 border border-red-900/70 p-4 text-xs text-red-100">
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
            <CardContent className="p-6 grid gap-3 text-sm text-neutral-100">
              <div className="font-medium">
                Február 14. (péntek) — 2 platform
              </div>
              <div>07:00–08:30 — Mérlegelés (hullámokban)</div>
              <div>09:00–12:00 — Guggolás (Platform A &amp; B)</div>
              <div>12:30–15:00 — Fekvenyomás (Platform A &amp; B)</div>
              <div>15:30–18:30 — Felhúzás (Platform A &amp; B)</div>
              <div>19:00 — Napi eredményhirdetés</div>

              <div className="font-medium mt-4">
                Február 15. (szombat) — 2 platform
              </div>
              <div>07:00–08:30 — Mérlegelés (hullámokban)</div>
              <div>09:00–12:00 — Guggolás (Platform A &amp; B)</div>
              <div>12:30–15:00 — Fekvenyomás (Platform A &amp; B)</div>
              <div>15:30–18:30 — Felhúzás (Platform A &amp; B)</div>
              <div>19:00 — Napi eredményhirdetés</div>

              <div className="mt-4 grid sm:grid-cols-2 gap-2">
                <a
                  href={EVENT.streams.platformA}
                  className="inline-flex items-center gap-2 text-xs text-red-300 underline underline-offset-4"
                >
                  <LinkIcon className="h-4 w-4" /> Stream — Platform A
                </a>
                <a
                  href={EVENT.streams.platformB}
                  className="inline-flex items-center gap-2 text-xs text-red-300 underline underline-offset-4"
                >
                  <LinkIcon className="h-4 w-4" /> Stream — Platform B
                </a>
              </div>

              <div className="text-xs text-neutral-400 mt-2">
                A részletes flight-beosztást a nevezés lezárása után tesszük
                közzé.
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="rules" icon={ShieldCheck} title="Szabályok & felszerelés">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="p-6 grid gap-4 text-sm text-neutral-100">
              <div>• IPF szabályrendszer szerint zajlik a verseny.</div>
              <div>• Újoncoknak nem kell klubtagság és sportorvosi engedély.</div>
              <div>
                • Felszerelés-ellenőrzés a mérlegeléskor. Tiltott szerek és
                eszközök nem engedélyezettek. Versenyzők mindent használhatnak
                az IPF szabályain belül.
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                <a
                  href="/docs/IPF_versenyszabalyzat_2025.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs hover:border-red-700 hover:bg-red-950/30 transition"
                >
                  <span>
                    IPF versenyszabályzat (PDF)
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
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black/60 px-4 py-3 text-xs hover:border-red-700 hover:bg-red-950/30 transition"
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
                note="Tartalmazza a media csomagot (1 fotó + 1 videó) és az egyedi SBD pólót."
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
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="rounded-2xl border border-neutral-800 bg-black/70">
              <CardContent className="p-6 grid gap-2 text-sm text-neutral-100">
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
                <div className="w-full h-[340px] md:h-[400px] rounded-2xl overflow-hidden border border-neutral-800 bg-black/70">
                  {mounted && mapSrc ? (
                    <iframe
                      key="map-mounted"
                      title="Térkép"
                      src={mapSrc}
                      className="w-full h-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      suppressHydrationWarning
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900" />
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
            <CardContent className="p-6 grid gap-3 text-sm text-neutral-100">
              <div>
                <div className="font-medium">
                  Kell sportorvosi vagy szövetségi engedély?
                </div>
                <div className="text-neutral-300">
                  Újoncoknak nem; versenyzőknek az IPF szabályrend szerint.
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
                  Igen, a két platform külön linken nézhető (lásd az Időrend
                  szekció alján).
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="contact" icon={Mail} title="Kapcsolat">
          <Card className="rounded-2xl border border-neutral-800 bg-black/70">
            <CardContent className="p-6 grid sm:grid-cols-2 gap-4 text-sm text-neutral-100">
              <div className="space-y-2">
                <div className="font-medium">Szervezés</div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Mail className="h-4 w-4 text-red-400" />
                  <a
                    href={`mailto:${EVENT.contact.email}`}
                    className="underline underline-offset-4 hover:text-red-200"
                  >
                    {EVENT.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Phone className="h-4 w-4 text-red-400" />
                  <a
                    href="tel:+36304660011"
                    className="hover:text-red-200 underline underline-offset-4"
                  >
                    {EVENT.contact.phone}
                  </a>
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Közösségi média</div>
                <div className="flex flex-col gap-1 text-neutral-300">
                  <a
                    href={EVENT.social.igSbd}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-red-200 underline underline-offset-4"
                  >
                    <ExternalLink className="h-4 w-4 text-red-400" />
                    @sbdhungary
                  </a>
                  <a
                    href={EVENT.social.igPowerflow}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-red-200 underline underline-offset-4"
                  >
                    <ExternalLink className="h-4 w-4 text-red-400" />
                    @powerfloweu
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>
      </main>

      <footer className="border-t border-neutral-900 bg-black/90">
        <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-neutral-500">
          © {year} SBD Hungary × PowerFlow — Adatkezelési tájékoztató •
          Házirend • Versenyszabályzat
        </div>
      </footer>
    </div>
  );
}