'use client';

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, MapPin, Timer, Info, Mail, Phone,
  Dumbbell, TicketCheck, ShieldCheck, ChevronRight,
  ExternalLink, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// —— ESEMÉNY ADATOK ——
const EVENT = {
  title: "SBD Next — Új Belépők Versenye (2 nap, 2 platform)",
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
  cap: 220,
  equipment:
    "Kezdőknek nem szükséges semmilyen felszerelés; versenyzőknek igen, mindent lehet használni az IPF szabályrendszerén belül.",
  categories: {
    divisions: ["Férfi Újonc", "Nő Újonc", "Férfi Versenyző", "Nő Versenyző"],
    events: ["Háromfogásos — Full Power (SBD)"],
  },
  scoring: "Eredményhirdetés IPF pontszám alapján (nincsenek súlycsoportok).",
  deadlines: {
    regOpen: "Nov. 15.",
    regClose: "Dec. 1.",
    refund: "Visszatérítés: Dec. 31-ig 100%, Jan. 14-ig 50%, később nincs.",
  },
  fees: {
    entry: 33990,
    spectator: 1000,
    currency: "HUF",
  },
  contact: {
    email: "hello@power-flow.eu",
    phone: "+36 30 000 0000",
  },
  social: {
    ig: "@powerfloweu",
    web: "https://power-flow.eu",
  },
  seo: {
    description:
      "SBD Next — belépőbarát, 2 napos powerlifting esemény a Thor Gymben. Nevezés, információk, időrend, szabályok, díjak és GYIK.",
  },
};

// —— SEGÉD KOMPONENSEK ——
function Section({ id, icon: Icon, title, children }: any) {
  return (
    <section id={id} className="scroll-mt-24 py-10">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-5 w-5" />}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
function Stat({ label, value, Icon }: any) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5" />}
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-lg font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
function PriceRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start justify-between border-b py-2">
      <div className="font-medium">{label}</div>
      <div className="text-right">
        <div className="font-semibold">{value}</div>
        {note && <div className="text-xs text-muted-foreground">{note}</div>}
      </div>
    </div>
  );
}

// —— REGISZTRÁCIÓ + STRIPE ——
function RegistrationForm() {
  // Stripe fizetési linkek
  const PAYMENT_LINK_BASE = "https://buy.stripe.com/8x26oG6az4yg8AQ89DdfG0m";     // Nevezés
  const PAYMENT_LINK_PREMIUM = "https://buy.stripe.com/bJe7sK0Qf7Ks9EU1LfdfG0n"; // Prémium média csomag
  const WEBHOOK_URL = "https://hook.eu1.make.com/6vbe2dxien274ohy91ew22lp9bbfzrl3";

  const [data, setData] = useState<any>({
    name: "",
    email: "",
    birthdate: "",
    club: "",
    sex: "",
    division: "",
    event: EVENT.categories.events[0],
    equipment: "RAW",
    preferredDay: "",
    bestTotal: "",
    consent: false,
    notes: "",
    premium: false,
    hp: "", // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => {
    if (!data.name || !data.email || !data.sex || !data.division || !data.preferredDay || !data.consent) return false;
    return /.+@.+\..+/.test(data.email);
  }, [data]);

  async function onSubmit(e: any) {
    e.preventDefault();
    if (data.hp) return; // bot
    setSubmitting(true);
    setError(null);

    try {
      const registrationId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `reg_${Date.now()}`;

      const target = data.premium ? PAYMENT_LINK_PREMIUM : PAYMENT_LINK_BASE;

      // UTM begyűjtés
      const utm = Object.fromEntries(
        (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams())
          .entries()
      );

      const payload = {
        registrationId,
        ...data,
        paymentOption: data.premium ? "premium" : "base",
        stripeLink: target,
        submittedAt: new Date().toISOString(),
        page: "/",
        utm,
      };

      // Make webhook – beacon, majd fetch fallback
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        const ok = typeof navigator !== "undefined" && "sendBeacon" in navigator
          ? navigator.sendBeacon(WEBHOOK_URL, blob)
          : false;
        if (!ok) {
          await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
        }
      } catch { /* swallow */ }

      // Stripe redirect
      const url = new URL(target);
      if (data.email) url.searchParams.set("prefilled_email", data.email);
      window.location.href = url.toString();

      setDone(true);
    } catch {
      setError("A jelentkezés nem sikerült. Próbáld újra, vagy írj nekünk e-mailt.");
    } finally {
      setSubmitting(false);
    }
  }

  return done ? (
    <div className="rounded-2xl border p-6 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10" />
      <h3 className="mt-4 text-lg font-semibold">Átirányítás a fizetéshez…</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Ha nem történik meg automatikusan,{" "}
        <a className="underline" href={data.premium ? PAYMENT_LINK_PREMIUM : PAYMENT_LINK_BASE}>kattints ide</a>.
      </p>
    </div>
  ) : (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="h-4 w-4" /> {error}</div>}
      {/* honeypot */}
      <input
        autoComplete="off"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
        value={data.hp}
        onChange={(e) => setData({ ...data, hp: e.target.value })}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Teljes név</label>
          <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm">E-mail</label>
          <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm">Születési dátum</label>
          <Input type="date" value={data.birthdate} onChange={(e) => setData({ ...data, birthdate: e.target.value })} />
        </div>
        <div>
          <label className="text-sm">Egyesület / Klub (opcionális)</label>
          <Input value={data.club} onChange={(e) => setData({ ...data, club: e.target.value })} />
        </div>
        <div>
          <label className="text-sm">Nem</label>
          <Select onValueChange={(v) => setData({ ...data, sex: v })}>
            <SelectTrigger><SelectValue placeholder="Válassz" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Nő">Nő</SelectItem>
              <SelectItem value="Férfi">Férfi</SelectItem>
              <SelectItem value="Egyéb">Egyéb</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Kategória (Divízió)</label>
          <Select onValueChange={(v) => setData({ ...data, division: v })}>
            <SelectTrigger><SelectValue placeholder="Válassz" /></SelectTrigger>
            <SelectContent>
              {EVENT.categories.divisions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Preferált nap</label>
          <Select onValueChange={(v) => setData({ ...data, preferredDay: v })}>
            <SelectTrigger><SelectValue placeholder="Válassz" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Feb 14 (péntek)">Feb 14 (péntek)</SelectItem>
              <SelectItem value="Feb 15 (szombat)">Feb 15 (szombat)</SelectItem>
              <SelectItem value="Bármelyik">Bármelyik</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm">Megjegyzés</label>
          <Textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder="—" />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox id="consent" checked={data.consent} onCheckedChange={(v: any) => setData({ ...data, consent: Boolean(v) })} />
        <label htmlFor="consent" className="text-sm">
          Hozzájárulok az adataim kezeléséhez és elfogadom a verseny szabályzatát. Tudomásul veszem, hogy a nevezés a <b>fizetéssel</b> válik véglegessé.
        </label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox id="premium" checked={data.premium} onCheckedChange={(v: any) => setData({ ...data, premium: Boolean(v) })}/>
        <label htmlFor="premium" className="text-sm">Prémium média csomag (+24 990 Ft): 3 fotó + 3 videó.</label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!valid || submitting}>
          {submitting ? "Tovább a fizetéshez…" : "Nevezés és fizetés"}
        </Button>
        <div className="text-xs text-muted-foreground">
          A nevezési díj: 33 990 Ft — tartalmazza a <b>media csomagot (1 fotó + 1 videó)</b>.
        </div>
      </div>
    </form>
  );
}

// —— OLDAL ——
export default function EventLanding() {
  const priceEntry = new Intl.NumberFormat("hu-HU").format(EVENT.fees.entry);
  const priceSpectator = new Intl.NumberFormat("hu-HU").format(EVENT.fees.spectator);
  const year = new Date().getFullYear();

  // térkép src előkészítés (ha valaha <iframe> beágyazást tennénk a configba)
  const raw = (EVENT.location.mapEmbedSrc || "").trim();
  const mapSrc = raw.includes("<iframe") ? (raw.match(/src="([^"]+)"/)?.[1] ?? "") : raw;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-5 w-5" />
            <span className="font-semibold">{EVENT.title}</span>
          </div>
          <a href="#register" className="inline-flex items-center gap-1 text-sm font-medium">
            Nevezés <ChevronRight className="h-4 w-4"/>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="text-3xl sm:text-4xl font-bold tracking-tight">
            {EVENT.title}
          </motion.h1>
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Stat label="Dátum" value={EVENT.date} Icon={CalendarDays} />
            <Stat label="Idő" value={EVENT.time} Icon={Timer} />
            <Stat label="Helyszín" value={`${EVENT.location.name} — ${EVENT.location.address}`} Icon={MapPin} />
          </div>
          <div className="mt-6">
            <a href="#register"><Button className="rounded-2xl px-6">Nevezek most</Button></a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-20">
        <Section id="info" icon={Info} title="Versenyinformációk">
          <Card className="rounded-2xl">
            <CardContent className="p-6 grid gap-3">
              <div><span className="font-medium">Koncepció:</span> {EVENT.concept}</div>
              <div><span className="font-medium">Elrendezés:</span> {EVENT.layout}</div>
              <div><span className="font-medium">Nevezői limit:</span> {EVENT.cap} fő (a sikeres fizetések sorrendjében).</div>
              <div><span className="font-medium">Felszerelés:</span> {EVENT.equipment}</div>
              <div><span className="font-medium">Szám:</span> {EVENT.categories.events[0]}</div>
              <div><span className="font-medium">Pontozás:</span> {EVENT.scoring}</div>
              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                <Card className="rounded-xl"><CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Jelentkezés kezdete</div>
                  <div className="font-semibold">{EVENT.deadlines.regOpen}</div>
                </CardContent></Card>
                <Card className="rounded-xl"><CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Nevezés határideje</div>
                  <div className="font-semibold">{EVENT.deadlines.regClose}</div>
                </CardContent></Card>
                <Card className="rounded-xl"><CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Visszatérítés</div>
                  <div className="font-semibold">{EVENT.deadlines.refund}</div>
                </CardContent></Card>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section id="fees" icon={TicketCheck} title="Nevezési és nézői díjak">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <PriceRow label="Nevezési díj" value={`${priceEntry} ${EVENT.fees.currency}`} note="Tartalmazza a media csomagot (1 fotó + 1 videó) és az egyedi SBD pólót." />
              <PriceRow label="Nézői jegy" value={`${priceSpectator} ${EVENT.fees.currency}`} note="A helyszínen készpénzben vagy kártyával" />
              <PriceRow label="Prémium média csomag (opcionális)" value={`24 990 ${EVENT.fees.currency}`} note="3 fotó + 3 videó" />
            </CardContent>
          </Card>
        </Section>

        <Section id="venue" icon={MapPin} title="Helyszín">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="rounded-2xl">
              <CardContent className="p-6 grid gap-2">
                <div className="font-medium">{EVENT.location.name}</div>
                <div className="text-sm text-muted-foreground">{EVENT.location.address}</div>
              </CardContent>
            </Card>
            <div className="w-full h-[360px] md:h-[420px] rounded-2xl overflow-hidden border">
              <iframe
                title="Térkép"
                src={mapSrc}
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </Section>

        <Section id="register" icon={Dumbbell} title="Nevezés">
          <RegistrationForm />
          <div className="mt-3 text-xs text-muted-foreground">
            A helyek a sikeres <b>fizetés</b> sorrendjében telnek be.
          </div>
        </Section>

        <Section id="contact" icon={Mail} title="Kapcsolat">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="rounded-2xl"><CardContent className="p-6 grid gap-2">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> <a href={`mailto:${EVENT.contact.email}`} className="underline">{EVENT.contact.email}</a></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> <a href={`tel:${EVENT.contact.phone}`} className="underline">{EVENT.contact.phone}</a></div>
              <div className="flex items-center gap-2"><ExternalLink className="h-4 w-4"/> <a className="underline" href={EVENT.social.web} target="_blank" rel="noreferrer">power-flow.eu</a></div>
            </CardContent></Card>
            <Card className="rounded-2xl"><CardContent className="p-6">
              Kövess Instagramon: <span className="font-medium">{EVENT.social.ig}</span>
              <div className="text-xs text-muted-foreground mt-2">Infók és frissítések itt is.</div>
            </CardContent></Card>
          </div>
        </Section>
      </main>

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-muted-foreground" suppressHydrationWarning>
          © {year} PowerFlow — Adatkezelési tájékoztató • Házirend • Versenyszabályzat
        </div>
      </footer>
    </div>
  );
}