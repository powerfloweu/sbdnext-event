'use client';

import { useMemo, useState, useEffect } from "react";
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
  Link as LinkIcon
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// ====== KAPACITÁS ======
const CAP_LIMIT = 220;
const CAP_USED = Number(process.env.NEXT_PUBLIC_CAP_USED ?? "0");
const CAP_FULL_FLAG = (process.env.NEXT_PUBLIC_CAP_FULL ?? "").toLowerCase() === "true";
const CAP_REMAINING = Math.max(0, CAP_LIMIT - CAP_USED);
const CAP_FULL = CAP_FULL_FLAG || CAP_REMAINING <= 0;

// ====== ESEMÉNY ADATOK ======
const EVENT = {
  title: "SBD Next — A következő szint",
  subtitle: "2 nap, 2 platform • Szabadidős esemény újoncoknak és gyakorlás versenyzőknek",
  date: "2026. február 14–15.",
  time: "7:00–19:00 (naponta)",
  location: {
    name: "Thor Gym (XI. kerület)",
    address: "Budapest, Nándorfejérvári út 40, 1116",
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4748.762520334373!2d19.04355177770303!3d47.46025827117686!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dda23e15b409%3A0x59fe623bd00aa0be!2sThor%20Gym!5e1!3m2!1shu!2shu!4v1762941118132!5m2!1shu!2shu",
  },
  concept:
    "Szabadidős esemény újoncoknak kötöttségek nélkül, erőemelő versenyzőknek pedig gyakorlásképp.",
  layout: "2 nap, 2 platform • háromfogásos, full power (SBD) verseny",
  federationText:
    "IPF szabályrendszer szerint (hamarosan belinkeljük a hivatalos magyar IPF szabálykönyvet). Újoncoknak nem kell klubtagság és sportorvosi engedély.",
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
    ig: "@sbdhungary & @powerfloweu",
    web: "https://power-flow.eu",
  },
  divisions: ["Újonc", "Versenyző"],
  scoring: "Eredményhirdetés IPF pontszám alapján (nincsenek súlycsoportok).",
  eventType: "Háromfogásos, full power (SBD) verseny.",
  streams: {
    platformA: "#",
    platformB: "#",
  },
  seo: {
    description:
      "SBD Next — szabadidős, 2 napos powerlifting esemény a Thor Gymben újoncoknak és versenyzőknek. Nevezés, időrend, IPF szabályok, díjak, helyszín és GYIK. Media csomag + egyedi SBD póló a nevezési díjban.",
  },
};

// ====== SEGÉD KOMPONENSEK ======
function Section({ id, icon: Icon, title, children }: any) {
  return (
    <section id={id} className="scroll-mt-24 py-12">
      <div className="flex items-center gap-2 mb-6">
        {Icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-900/60 text-red-200 border border-red-700/60">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, Icon }: any) {
  return (
    <Card className="rounded-2xl border border-red-900/40 bg-black/60 text-red-50 shadow-[0_0_25px_rgba(0,0,0,0.7)]">
      <CardContent className="p-4 flex items-center gap-3">
        {Icon && (
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-900/60 text-red-100 border border-red-700/80">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-red-300/80">
            {label}
          </div>
          <div className="text-base font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start justify-between border-b border-neutral-800 py-3">
      <div className="font-medium">{label}</div>
      <div className="text-right">
        <div className="font-semibold text-red-300">{value}</div>
        {note && <div className="text-xs text-neutral-400 mt-1">{note}</div>}
      </div>
    </div>
  );
}

// ====== REGISZTRÁCIÓ + STRIPE ======
function RegistrationForm() {
  // Stripe Payment Linkek
  const PAYMENT_LINK_BASE = "https://buy.stripe.com/8x26oG6az4yg8AQ89DdfG0m";      // Nevezés (33 990 Ft)
  const PAYMENT_LINK_PREMIUM = "https://buy.stripe.com/bJe7sK0Qf7Ks9EU1LfdfG0n";   // Prémium (+24 990 Ft)

  // Make.com webhook
  const WEBHOOK_URL = "https://hook.eu1.make.com/6vbe2dxien274ohy91ew22lp9bbfzrl3";

  const [data, setData] = useState<any>({
    name: "",
    email: "",
    birthdate: "",
    club: "",
    sex: "",
    division: "",
    equipment: "RAW",
    preferredDay: "",
    bestTotal: "",
    consent: false,
    notes: "",
    premium: false,  // prémium választás
    honeypot: "",    // bot csapda
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => {
    if (CAP_FULL) return false;
    if (data.honeypot && data.honeypot.trim().length > 0) return false;

    // Kötelező mezők – NINCS "Szám (esemény)" mező
    if (
      !data.name ||
      !data.email ||
      !data.sex ||
      !data.division ||
      !data.equipment ||
      !data.preferredDay ||
      !data.consent
    ) {
      return false;
    }

    return /.+@.+\..+/.test(data.email);
  }, [data]);

  async function onSubmit(e: any) {
    e.preventDefault();
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

      // UTM
      const utm = typeof window !== "undefined" ? (window.location.search || "") : "";

      const payload = {
        registrationId,
        ...data,
        paymentOption: data.premium ? "premium" : "base",
        stripeLink: target,
        submittedAt: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        page: "/", // jelenlegi oldal
        utm,
        cap: {
          limit: CAP_LIMIT,
          used: CAP_USED,
          remaining: CAP_REMAINING,
          full: CAP_FULL,
        },
      };

      // Webhook küldés (beacon + fetch fallback)
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const beaconOk = typeof navigator !== "undefined" && "sendBeacon" in navigator
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

      // Stripe redirect (email előtöltés)
      const url = new URL(target);
      if (data.email) url.searchParams.set("prefilled_email", data.email);
      window.location.href = url.toString();

      setDone(true);
    } catch (err: any) {
      setError("A jelentkezés nem sikerült. Próbáld újra, vagy írj nekünk e-mailt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (CAP_FULL) {
    return (
      <div className="rounded-2xl border border-border bg-black/40 p-6">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertCircle className="h-5 w-5" />
          <b>Betelt a nevezés ({CAP_LIMIT} fő).</b>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Kövesd az Instagramot ({EVENT.social.ig}) és a hírlevelet a lemondott helyekért / várólistáért.
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-black/40 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-400" />
        <h3 className="mt-4 text-lg font-semibold">Átirányítás a fizetéshez…</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ha nem történik meg automatikusan,{" "}
          <a
            className="underline text-primary"
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
            onChange={(e) => setData({ ...data, birthdate: e.target.value })}
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
          <Select onValueChange={(v) => setData({ ...data, sex: v })}>
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
          <Select onValueChange={(v) => setData({ ...data, division: v })}>
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

        {/* Súlycsoport NINCS */}

        <div>
          <label className="text-sm">Felszerelés</label>
          <Select
            defaultValue="RAW"
            onValueChange={(v) => setData({ ...data, equipment: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Válassz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RAW">RAW</SelectItem>
              <SelectItem value="Classic RAW">Classic RAW</SelectItem>
              <SelectItem value="Egyéb IPF-konform">Egyéb IPF-konform</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm">Preferált nap</label>
          <Select onValueChange={(v) => setData({ ...data, preferredDay: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Válassz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Feb 14 (péntek)">Feb 14 (péntek)</SelectItem>
              <SelectItem value="Feb 15 (szombat)">Feb 15 (szombat)</SelectItem>
              <SelectItem value="Bármelyik">Bármelyik</SelectItem>
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
              setData({ ...data, bestTotal: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="text-sm">Megjegyzés (pl. kísérő, speciális igény)</label>
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
          Hozzájárulok az adataim kezeléséhez és elfogadom a verseny szabályzatát.
          Tudomásul veszem, hogy a nevezés a <b>fizetéssel</b> válik véglegessé.
        </label>
      </div>

      {/* Prémium opció */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="premium"
          checked={data.premium}
          onCheckedChange={(v: any) =>
            setData({ ...data, premium: Boolean(v) })
          }
        />
        <label htmlFor="premium" className="text-sm">
          Prémium média csomag (+24 990 Ft): 3 fotó + 3 videó, kiemelt válogatás.
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!valid || submitting}>
          {submitting ? "Tovább a fizetéshez…" : "Nevezés és fizetés"}
        </Button>
        <div className="text-xs text-muted-foreground">
          A nevezési díj: 33 990 Ft — tartalmazza a
          {" "}
          <b>media csomagot (1 fotó + 1 videó)</b> és az
          {" "}
          <b>egyedi SBD versenypólót</b>. Prémium opció: +24 990 Ft (3 fotó + 3 videó).
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
      <nav className="sticky top-0 z-40 border-b border-red-900/40 bg-black/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/sbd_logo.jpg"
                alt="SBD"
                className="h-6 w-auto rounded-sm border border-red-800/60 bg-black/80"
              />
              <img
                src="/powerflow_logo.png"
                alt="PowerFlow"
                className="h-6 w-auto"
              />
            </div>
            <span className="hidden sm:inline-block text-sm font-medium text-neutral-200">
              SBD Next — A következő szint
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <a href="#info" className="hover:text-red-300 transition-colors">
              Infók
            </a>
            <a
              href="#schedule"
              className="hover:text-red-300 transition-colors"
            >
              Időrend
            </a>
            <a href="#rules" className="hover:text-red-300 transition-colors">
              Szabályok
            </a>
            <a href="#fees" className="hover:text-red-300 transition-colors">
              Díjak
            </a>
            <a href="#faq" className="hover:text-red-300 transition-colors">
              GYIK
            </a>
          </div>
          <a
            href="#register"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full border border-red-600/70 bg-red-900/40 text-red-100 hover:bg-red-700/70 hover:text-white transition-colors"
          >
            Nevezés <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative overflow-hidden border-b border-red-900/40">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-[url('/hero_bg.jpg')] bg-cover bg-center opacity-70"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-red-950/70" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid md:grid-cols-[3fr,2fr] gap-8 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              >
                {EVENT.title}
              </motion.h1>
              <p className="mt-4 text-sm sm:text-base text-neutral-200 max-w-xl">
                {EVENT.subtitle}
              </p>

              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <Stat label="Dátum" value={EVENT.date} Icon={CalendarDays} />
                <Stat label="Idő" value={EVENT.time} Icon={Timer} />
                <Stat
                  label="Helyszín"
                  value={EVENT.location.name}
                  Icon={MapPin}
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#register">
                  <Button className="rounded-full bg-red-600 hover:bg-red-500 text-white px-7 py-2.5 text-sm sm:text-base shadow-[0_0_32px_rgba(127,29,29,0.95)]">
                    Nevezek most
                  </Button>
                </a>
                <a
                  href="#fees"
                  className="inline-flex items-center gap-1 text-sm text-neutral-200 hover:text-red-200"
                >
                  Nevezési díjak <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-900/70 bg-black/70 px-3 py-1 text-xs text-red-200 shadow-[0_0_18px_rgba(127,29,29,0.7)]">
                <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                <span>Első versenyeseknek is, IPF-szabályos full power esemény.</span>
              </div>
            </div>

            <Card className="rounded-2xl border border-red-900/60 bg-black/75 shadow-[0_0_45px_rgba(0,0,0,0.9)]">
              <CardContent className="p-5 space-y-4 text-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-red-300">
                  Verseny röviden
                </div>
                <div className="text-sm text-neutral-100">
                  {EVENT.concept}
                </div>
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
                  <div>
                    <span className="font-semibold text-neutral-100">
                      Lemondás:
                    </span>{" "}
                    {EVENT.deadlines.refundFull} • {EVENT.deadlines.refundHalf} •{" "}
                    {EVENT.deadlines.refundNone}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* TARTALOM */}
      <main className="max-w-5xl mx-auto px-4 pb-20">
        {/* INFO */}
        <Section id="info" icon={Info} title="Versenyinformációk">
          <Card className="rounded-2xl border border-red-900/40 bg-black/70 shadow-[0_0_40px_rgba(0,0,0,0.85)]">
            <CardContent className="p-6 grid gap-4 text-sm text-neutral-100">
              <div>
                <span className="font-medium text-neutral-50">Koncepció:</span>{" "}
                {EVENT.concept}
              </div>
              <div>
                <span className="font-medium text-neutral-50">Elrendezés:</span>{" "}
                {EVENT.layout}
              </div>
              <div>
                <span className="font-medium text-neutral-50">
                  Nevezői limit:
                </span>{" "}
                {CAP_LIMIT} fő (kapacitás függvényében). Jelentkezés zárása után
                flight-beosztás.
              </div>
              <div>
                <span className="font-medium text-neutral-50">Felszerelés:</span>{" "}
                {EVENT.equipmentNote}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                    Divíziók
                  </div>
                  <div className="font-medium">
                    Újonc • Versenyző / Női • Férfi
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                    Pontozás
                  </div>
                  <div className="font-medium">{EVENT.scoring}</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-3">
                <Card className="rounded-xl border border-neutral-800 bg-neutral-950">
                  <CardContent className="p-4">
                    <div className="text-xs text-neutral-400">
                      Jelentkezés kezdete
                    </div>
                    <div className="font-semibold text-neutral-50">
                      {EVENT.deadlines.regOpen}
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-neutral-800 bg-neutral-950">
                  <CardContent className="p-4">
                    <div className="text-xs text-neutral-400">
                      Nevezés határideje
                    </div>
                    <div className="font-semibold text-neutral-50">
                      {EVENT.deadlines.regClose}
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border border-neutral-800 bg-neutral-950">
                  <CardContent className="p-4">
                    <div className="text-xs text-neutral-400">Lemondás</div>
                    <div className="font-semibold text-neutral-50">
                      {EVENT.deadlines.refundFull} •{" "}
                      {EVENT.deadlines.refundHalf} •{" "}
                      {EVENT.deadlines.refundNone}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-xl border border-red-900/60 bg-gradient-to-r from-red-950/85 via-black to-red-950/80 p-4 text-sm text-neutral-100 mt-2">
                A nevezési díj <b>tartalmazza</b>: Media package (1 fotó + 1
                videó) és az <b>egyedi SBD versenypóló</b>. Opcionálisan{" "}
                <b>Prémium media package</b> vásárolható (3 fotó + 3 videó).
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* IDŐREND */}
        <Section id="schedule" icon={CalendarDays} title="Időrend (terv)">
          <Card className="rounded-2xl border border-neutral-800 bg-black/75 shadow-[0_0_40px_rgba(0,0,0,0.85)]">
            <CardContent className="p-6 grid gap-4 text-sm text-neutral-100">
              <div className="font-semibold text-neutral-50">
                Február 14. (péntek) — 2 platform
              </div>
              <div>07:00–08:30 — Mérlegelés (hullámokban)</div>
              <div>09:00–12:00 — Guggolás (Platform A & B)</div>
              <div>12:30–15:00 — Fekvenyomás (Platform A & B)</div>
              <div>15:30–18:30 — Felhúzás (Platform A & B)</div>
              <div>19:00 — Napi eredményhirdetés</div>

              <div className="font-semibold text-neutral-50 mt-4">
                Február 15. (szombat) — 2 platform
              </div>
              <div>07:00–08:30 — Mérlegelés (hullámokban)</div>
              <div>09:00–12:00 — Guggolás (Platform A & B)</div>
              <div>12:30–15:00 — Fekvenyomás (Platform A & B)</div>
              <div>15:30–18:30 — Felhúzás (Platform A & B)</div>
              <div>19:00 — Napi eredményhirdetés</div>

              <div className="mt-4 grid sm:grid-cols-2 gap-2">
                <a
                  href={EVENT.streams.platformA}
                  className="inline-flex items-center gap-2 text-sm text-red-300 hover:text-red-100 underline underline-offset-4"
                >
                  <LinkIcon className="h-4 w-4" /> Stream — Platform A
                </a>
                <a
                  href={EVENT.streams.platformB}
                  className="inline-flex items-center gap-2 text-sm text-red-300 hover:text-red-100 underline underline-offset-4"
                >
                  <LinkIcon className="h-4 w-4" /> Stream — Platform B
                </a>
              </div>

              <div className="text-xs text-neutral-400 mt-2">
                A részletes flight- és nap/beosztást a nevezés lezárása után
                tesszük közzé.
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* SZABÁLYOK + PDF-EK */}
        <Section
          id="rules"
          icon={ShieldCheck}
          title="Szabályok, felszerelés & dokumentumok"
        >
          <Card className="rounded-2xl border border-neutral-800 bg-black/75 shadow-[0_0_38px_rgba(0,0,0,0.85)]">
            <CardContent className="p-6 grid gap-4 text-sm text-neutral-100">
              <div>• IPF szabályrendszer szerint (mélység, megállítás, lockout).</div>
              <div>
                • Újoncoknak <b>nem kell</b> klubtagság és sportorvosi engedély.
              </div>
              <div>
                • Felszerelés-ellenőrzés a mérlegeléskor. Tiltott szerek és
                eszközök nem engedélyezettek. Versenyzők mindent használhatnak
                az IPF szabályain belül.
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/80 to-transparent my-2" />

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <a
                  href="/docs/IPF_versenyszabalyzat_2025.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 hover:border-red-700 hover:bg-red-950/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-red-300" />
                    <span>IPF versenyszabályzat (PDF)</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-neutral-400" />
                </a>

                <a
                  href="/docs/SBD_Next%20_versenykiiras.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 hover:border-red-700 hover:bg-red-950/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-red-300" />
                    <span>SBD Next versenykiírás (PDF)</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-neutral-400" />
                </a>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* DÍJAK */}
        <Section id="fees" icon={TicketCheck} title="Nevezési és nézői díjak">
          <Card className="rounded-2xl border border-red-900/50 bg-black/80 shadow-[0_0_45px_rgba(0,0,0,0.9)]">
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
                note="3 fotó + 3 videó, extra válogatás."
              />
            </CardContent>
          </Card>
        </Section>

        {/* HELYSZÍN + TÉRKÉP */}
        <Section id="venue" icon={MapPin} title="Helyszín">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="rounded-2xl border border-neutral-800 bg-black/80 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
              <CardContent className="p-6 grid gap-2 text-sm text-neutral-100">
                <div className="font-semibold text-neutral-50">
                  {EVENT.location.name}
                </div>
                <div className="text-neutral-300">
                  {EVENT.location.address}
                </div>
                <div className="text-sm text-neutral-300 mt-1">
                  Parkolás: utcán, fizetős övezet (szombat délelőtt). Öltöző és
                  zuhany elérhető.
                </div>
                <div className="text-sm text-neutral-300">
                  Közeli szolgáltatások: Aldi, Tesco egy utcányira, food truck szervezés alatt.
                </div>
              </CardContent>
            </Card>

            {(() => {
              const raw = (EVENT.location.mapEmbedSrc || "").trim();
              const mapSrc = raw.includes("<iframe")
                ? raw.match(/src="([^"]+)"/)?.[1] ?? ""
                : raw;

              return (
                <div className="w-full h-[360px] md:h-[420px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
                  {mounted ? (
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

        {/* NEVEZÉS */}
        <Section id="register" icon={Dumbbell} title="Nevezés">
          <Card className="rounded-2xl border border-red-900/60 bg-black/85 shadow-[0_0_48px_rgba(0,0,0,1)]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-2 text-sm text-amber-300">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p>
                  A jelentkezés még <b>nem indult el</b>. A nevezés{" "}
                  <b>2025. november 20-tól</b> lesz elérhető.
                </p>
              </div>
              <RegistrationForm />
              <div className="mt-3 text-xs text-neutral-300">
                A nevezési űrlap önmagában nem garantál rajtszámot, a helyed a
                nevezési díj <b>sikeres kifizetése</b> után válik véglegessé.
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* GYIK */}
        <Section id="faq" icon={Info} title="GYIK">
          <Card className="rounded-2xl border border-neutral-800 bg-black/80 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
            <CardContent className="p-6 grid gap-4 text-sm text-neutral-100">
              <div>
                <div className="font-medium">
                  Kell sportorvosi vagy szövetségi engedély?
                </div>
                Újoncoknak nem; versenyzőknek az IPF szabályrend szerint.
              </div>
              <div>
                <div className="font-medium">Hogyan fizethetek?</div>
                Online, Stripe-on keresztül — a nevezés végén átirányítunk a
                fizetési oldalra.
              </div>
              <div>
                <div className="font-medium">Mi van a nevezési díjban?</div>
                Media csomag (1 fotó + 1 videó), egyedi SBD versenypóló.
                Prémium csomag külön vásárolható (3 fotó + 3 videó).
              </div>
              <div>
                <div className="font-medium">Van nevezői limit?</div>
                Igen, {CAP_LIMIT} fő. A helyek a sikeres <b>fizetés</b>{" "}
                sorrendjében telnek be.
              </div>
              <div>
                <div className="font-medium">Lesz stream?</div>
                Igen, a két platform külön linken nézhető (lásd az Időrend
                szekció alján).
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* KAPCSOLAT */}
        <Section id="contact" icon={Mail} title="Kapcsolat">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="rounded-2xl border border-neutral-800 bg-black/80 shadow-[0_0_36px_rgba(0,0,0,0.9)]">
              <CardContent className="p-6 grid gap-2 text-sm text-neutral-100">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-red-300" />
                  <a
                    href={`mailto:${EVENT.contact.email}`}
                    className="underline underline-offset-4 hover:text-red-200"
                  >
                    {EVENT.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-300" />
                  <a
                    href={`tel:${EVENT.contact.phone}`}
                    className="underline underline-offset-4 hover:text-red-200"
                  >
                    {EVENT.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-red-300" />
                  <a
                    className="underline underline-offset-4 hover:text-red-200"
                    href={EVENT.social.web}
                    target="_blank"
                    rel="noreferrer"
                  >
                    power-flow.eu
                  </a>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-neutral-800 bg-black/80 shadow-[0_0_36px_rgba(0,0,0,0.9)]">
              <CardContent className="p-6 text-sm text-neutral-100 space-y-2">
                <div>
                  Kövess minket Instagramon:{" "}
                  <span className="font-semibold">@sbdhungary & @powerfloweu</span>
                </div>
                <div className="text-xs text-neutral-400">
                  Folyamatos információ-frissítés 2–4 hetente az esemény közeledtével.
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </main>

      <footer className="border-t border-neutral-900 bg-black">
        <div
          className="max-w-5xl mx-auto px-4 py-6 text-xs text-neutral-500 flex flex-wrap items-center justify-between gap-2"
          suppressHydrationWarning
        >
          <span>
            © {year} PowerFlow • SBD Next — A következő szint
          </span>
          <span>Adatkezelési tájékoztató • Házirend • Versenyszabályzat</span>
        </div>
      </footer>
    </div>
  );
}