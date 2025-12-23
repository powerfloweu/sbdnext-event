import React, { useState, useEffect, ReactNode } from "react";
import { ArrowRight, AlertCircle, ChevronRight, Trophy, CalendarDays, Timer, MapPin, ExternalLink, Dumbbell, Info, ShieldCheck, LinkIcon, Mail } from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Link from "next/link";
import { EVENT, REG_DEADLINE_AT, CAP_FULL, IS_STAGING, SHOW_VOLUNTEERS, HERO_IMAGES, effectiveRegOpen } from "../lib/utils";
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

                <div className="flex justify-center">
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
                </div>


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
      {/* === CREATORS / STÁB === */}
      <section className="max-w-3xl mx-auto mt-12 mb-8 px-4">
        <h2 className="mb-4 text-xl font-semibold text-red-300">A stáb, akik készítik</h2>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="font-bold text-neutral-100">Fotósok:</h3>
            <div className="flex items-center gap-3 mt-2">
              <img
                src="/visualsofkata.jpg"
                alt="Hunyás Kata profilképe"
                className="h-12 w-12 rounded-full object-cover bg-neutral-800"
              />
              <div>
                Hunyás Kata<br />
                <a href="https://instagram.com/visualsofkata" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@visualsofkata</a>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <img
                src="/bencelantos.jpg"
                alt="Lantos Bence profilképe"
                className="h-12 w-12 rounded-full object-cover bg-neutral-800"
              />
              <div>
                Lantos Bence<br />
                <a href="https://instagram.com/bencelantos" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@bencelantos</a>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-neutral-100">Videósok:</h3>
            <div className="flex items-center gap-3 mt-2">
              <img
                src="/mark_g_l_.jpg"
                alt="Lakatos Márk profilképe"
                className="h-12 w-12 rounded-full object-cover bg-neutral-800"
              />
              <div>
                Lakatos Márk<br />
                <a href="https://instagram.com/mark_g_l_" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@mark_g_l_</a>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <img
                src="/akos.schwalm.jpg"
                alt="Schwalm Ákos profilképe"
                className="h-12 w-12 rounded-full object-cover bg-neutral-800"
              />
              <div>
                Schwalm Ákos<br />
                <a href="https://instagram.com/akos.schwalm" target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline">@akos.schwalm</a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
