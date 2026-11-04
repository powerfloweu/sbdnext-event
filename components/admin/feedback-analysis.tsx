// Összesítő a /admin "Visszajelzések" tab tetején, a nyers válaszlista fölött.
// D ezt kérte konkrétan ("a visszajelzések összesítését, ezt az artifactet")
// a project threadben készített elemzés (https://claude.ai/artifact/2hbjVjLJYK9W8BuAXsi9Vo)
// alapján — ide csak a számszerű részek (NPS, kategória-átlagok, jönne-e újra)
// számolódnak élőben a betöltött event_feedback sorokból; a témák/idézetek azóta
// nem változtak, kézzel kódolt, statikus szöveg marad, ugyanaz mint az artifactben.
// Soha nem publikus — ez a komponens csak az admin oldalon fut, service-role
// adatból (lásd app/admin/page.tsx, supabase/migrations/0009_event_feedback.sql).

import { Card, CardContent } from "@/components/ui/card";

interface SbdNext1FeedbackRow {
  nps: number | null;
  music: number | null;
  lights: number | null;
  mood: number | null;
  athlete_experience: number | null;
  schedule_score: number | null;
  flow: number | null;
  venue: number | null;
  staff: number | null;
  warmup_area: number | null;
  attend_next: string | null;
  allow_quote: boolean | null;
}

function avg(rows: SbdNext1FeedbackRow[], key: keyof SbdNext1FeedbackRow): number | null {
  const values = rows.map((r) => r[key]).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function fmt1(value: number | null): string {
  return value === null ? "—" : value.toFixed(1).replace(".", ",");
}

const CATEGORIES: { key: keyof SbdNext1FeedbackRow; label: string }[] = [
  { key: "staff", label: "Segítők / bírók" },
  { key: "mood", label: "Hangulat" },
  { key: "athlete_experience", label: "Versenyzői élmény" },
  { key: "venue", label: "Helyszín" },
  { key: "flow", label: "Lebonyolítás" },
  { key: "schedule_score", label: "Ütemezés" },
  { key: "warmup_area", label: "Melegítő terület" },
  { key: "lights", label: "Fények" },
  { key: "music", label: "Zene" },
];

const THEMES_BAD = [
  {
    title: "Melegítő terület — zsúfolt, messze, kevés eszköz",
    count: "8 válasz",
    body: "A leggyakoribb panasz. Platformtól messze / külön szinten (ketten ugyanez a válaszadó két körben is leírta), kevés tárcsa versenyző szintű férfiaknak, lépcsőzés, hideg a bejáratnál, nincs jól kitáblázva.",
  },
  {
    title: "Közvetítés visszhangzik / hangminőség",
    count: "6 válasz",
    body: "Főleg a délelőtti blokkban visszhangos a stream hangja, a mikrofon nem mindenhol hallható jól. Délutánra többször sikerült megoldani — érdemes ezt véglegesíteni a nap elejére is.",
  },
  {
    title: "Fények szemből vakítanak a platformon",
    count: "4 válasz",
    body: "Guggolásnál és fekvenyomásnál a szemközti lámpák zavaróak, egy válaszban retinaégetésig. A hírlevél-visszajelzés a domináns piros fényt is túl sötét hangulatúnak nevezte — ez és a fények elhelyezése összefügg.",
  },
  {
    title: "Oklevél csak helyezést mutat",
    count: "3 válasz",
    body: "Nincs rajta a total, az S-B-D bontás vagy a GL pont — ez a legtöbbet kért oklevél-módosítás, mindhárom válaszadó ugyanazt a hiányt nevezte meg.",
  },
  {
    title: "Ígért fotók nem érkeztek meg",
    count: "4 válasz",
    body: "A nevezési díj leírásában szerepeltek fotók, de többen egyáltalán nem vagy csak 1 képet kaptak — ezt zavaróbbnak érzik, mint magát az árat.",
  },
  {
    title: "Nevezési díj / lépcsős árazás igénye",
    count: "3 válasz",
    body: "Drágának érzik a mezőny egy része, és ketten konkrétan egy lépcsős árazási modellt (pl. póló nélkül olcsóbban) javasolnak a tehetségkutató réteg becsábítására.",
  },
  {
    title: "Napközbeni infóhiány (villaállítás, eredményhirdetés)",
    count: "4 válasz",
    body: "Nem volt mindig ismert, mikor van villaállítás vagy eredményhirdetés; egy esetben a belépőjegy időpontja miatt maradt ki valaki a szurkolásból.",
  },
  {
    title: "Bírói konzisztencia — egyedi, súlyos eset",
    count: "1 válasz",
    body: "A legalacsonyabb NPS-t (2/10) adó válaszban mindhárom guggolást érvénytelenítették, és a válaszadó szerint a bírók utólag maguk sem tudták megindokolni miért. Önmagában kiugró eset, de érdemes külön kivizsgálni.",
    flag: true,
  },
];

const THEMES_GOOD = [
  {
    title: "Hangulat / „nagy ligás” vibe",
    body: "A legtöbbet említett pozitívum, szinte minden válaszban megjelenik — zene, fények összhatása, profi eszközök, a tömeg hangulata.",
  },
  {
    title: "Szervezés és tájékoztatás profizmusa",
    body: "A honlap és az előzetes infók több válasz szerint is kiemelkedően jól kezelt, kiszámítható napirenddel.",
  },
  {
    title: "LiftingCast élő eredménykövetés",
    body: "Név szerint kiemelt újítás — a melegítőben és a platform mögött is kivetített élő állás sokaknak tetszett.",
  },
  {
    title: "Segítők, lapozók, bírók hozzáállása",
    body: "Konzisztensen dicsért terület — a fenti egyedi bírói esettől függetlenül.",
  },
  {
    title: "Közösségi élmény, befogadó közeg",
    body: "Több első versenyes válaszadó kiemelte, hogy ismeretlenül is otthonosan érezte magát — ez a visszatérési szándék mögött is meghúzódhat.",
  },
];

const QUOTES = [
  { text: "„Átjárta a profi hangulat az egész rendezvényt. Igazi nagy ligás élmény volt.”", meta: "versenyző, NPS 10" },
  {
    text: "„…fantasztikus volt a közösségi élmény, a befogadó közeg, a hangulat és az egész vibe — ez tetszett a legjobban.”",
    meta: "versenyző, első verseny, NPS 10",
  },
  {
    text: "„Az elején így kicsit kaotikusnak éltem meg a verseny szervezését” — ugyanattól a válaszadótól, aki a fenti dicséretet is írta.",
    meta: "versenyző, NPS 10",
  },
  { text: "„…minden gyakorlatnál legalább 1 szögből valami kiégette a retinámat.”", meta: "versenyző, a fényekről, NPS 9" },
  { text: "„Összességében talán az egyik legminőségibb erőemelő verseny volt, amin valaha voltam.”", meta: "önkéntes / edző, NPS 10" },
  {
    text: "„…rengeteg a csóró, de tehetséges fiatal, aki szívesen indulna versenyen… egy lépcsős árazási modellnek szerintem mindenképpen lenne létjogosultsága.”",
    meta: "önkéntes / edző, az árazásról",
  },
];

const FORWARD_ASKS = [
  {
    title: "Súlycsoport szerinti besorolás igénye",
    body: "Egy hírlevél-válasz kifejezetten súlycsoport és életkor szerinti felosztást kér a jelenlegi GL-pontos, kategória nélküli formátum helyett — pontosan az a kérdés, amit D és Miki a versenykiírás előtt még nyitva hagytak.",
  },
  {
    title: "Elit döntő / két lépcsős verseny",
    body: "Az egyik leghosszabb, szervezésben is részt vevő válaszadó kétnapos versenyt és egy GL-pont alapú, meghívásos, díjazott döntőt vázol a legjobbaknak — ez nagyrészt egybeesik az SBD Next 2 kétnapos formátumával.",
  },
  {
    title: "Opcionális egyedi versenypóló",
    body: "Többen kérik, hogy az egyedi mintás póló ne legyen kötelező tétel a nevezési díjban, hanem választható extra legyen.",
  },
];

export function FeedbackAnalysis({
  sbdNext1Rows,
  newsletterCount,
}: {
  sbdNext1Rows: SbdNext1FeedbackRow[];
  newsletterCount: number;
}) {
  const n = sbdNext1Rows.length;
  const avgNps = avg(sbdNext1Rows, "nps");
  const quoteOk = sbdNext1Rows.filter((r) => r.allow_quote).length;
  const attendYes = sbdNext1Rows.filter((r) => r.attend_next === "Igen").length;
  const attendAnswered = sbdNext1Rows.filter((r) => r.attend_next === "Igen" || r.attend_next === "Nem").length;
  const attendPct = attendAnswered > 0 ? Math.round((attendYes / attendAnswered) * 100) : null;

  const categoryAverages = CATEGORIES.map((c) => ({ ...c, value: avg(sbdNext1Rows, c.key) })).sort(
    (a, b) => (b.value ?? 0) - (a.value ?? 0)
  );
  const maxCategory = Math.max(1, ...categoryAverages.map((c) => c.value ?? 0));
  const lowestValue = Math.min(...categoryAverages.filter((c) => c.value !== null).map((c) => c.value as number));

  return (
    <div className="mb-8 flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold">Mit mondanak a versenyzők — összefoglaló</h3>
        <p className="text-sm text-muted-foreground">
          {n} db SBD Next 1 visszajelzés-űrlap válasz + {newsletterCount} db hírlevél-válasz tartalomelemzése. A
          számok élőben számolódnak az aktuális adatokból, a témák és idézetek kézi kódolással készültek és ennek a
          snapshotnak felelnek meg.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-xl font-bold text-primary">{fmt1(avgNps)}/10</span>
            <span className="text-xs text-muted-foreground">Átlagos NPS (SBD Next 1 forma)</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-xl font-bold">{attendPct === null ? "—" : `${attendPct}%`}</span>
            <span className="text-xs text-muted-foreground">
              Jönne a következőre is ({attendYes}/{attendAnswered})
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-xl font-bold">
              {quoteOk}/{n}
            </span>
            <span className="text-xs text-muted-foreground">Nyilvánosan idézhető (allowQuote)</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-xl font-bold">{fmt1(lowestValue)}/10</span>
            <span className="text-xs text-muted-foreground">Legalacsonyabb kategória(k)</span>
          </CardContent>
        </Card>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Kategóriák átlagpontszáma (0–10)
        </h4>
        <div className="flex flex-col gap-1.5">
          {categoryAverages.map((c) => (
            <div key={c.key} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-2 text-xs">
              <span className="text-muted-foreground">{c.label}</span>
              <div className="h-3 min-w-0 overflow-hidden rounded bg-muted">
                <div className="h-full rounded bg-primary" style={{ width: `${((c.value ?? 0) / maxCategory) * 100}%` }} />
              </div>
              <span className="text-right tabular-nums">{fmt1(c.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-destructive uppercase">
            ✕ Visszatérő panaszok
          </h4>
          <div className="flex flex-col gap-2">
            {THEMES_BAD.map((t) => (
              <Card key={t.title}>
                <CardContent className="p-3">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold">{t.title}</span>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">{t.count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.body}</p>
                  {t.flag && (
                    <span className="mt-1.5 inline-block rounded bg-warning px-1.5 py-0.5 text-xs font-semibold text-background">
                      kiugró eset
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-success uppercase">✓ Amit kiemeltek</h4>
          <div className="flex flex-col gap-2">
            {THEMES_GOOD.map((t) => (
              <Card key={t.title}>
                <CardContent className="p-3">
                  <span className="mb-1 block text-sm font-semibold">{t.title}</span>
                  <p className="text-xs text-muted-foreground">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Idézetek (csak idézésre engedélyezett válaszokból, név nélkül)
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {QUOTES.map((q) => (
            <blockquote key={q.text} className="rounded-md border-l-2 border-primary bg-accent p-3 text-sm">
              <p className="mb-1">{q.text}</p>
              <cite className="text-xs text-muted-foreground not-italic">{q.meta}</cite>
            </blockquote>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Előre tekintő kérések
        </h4>
        <div className="flex flex-col gap-2">
          {FORWARD_ASKS.map((a, i) => (
            <Card key={a.title}>
              <CardContent className="grid grid-cols-[1.5rem_1fr] items-start gap-2 p-3">
                <span className="text-lg font-bold text-primary">{i + 1}</span>
                <div>
                  <span className="mb-0.5 block text-sm font-semibold">{a.title}</span>
                  <p className="text-xs text-muted-foreground">{a.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
