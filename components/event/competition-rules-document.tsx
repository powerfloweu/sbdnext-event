import { ShieldCheck, Trophy, MapPin, Gavel, Users, Gift, Flag } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// Branded rendering of Miki's "SBD Next II versenykiírás" draft (uploaded
// 2026-10-31). Content is transcribed from the draft as-is — content
// corrections/inconsistencies (entry fee, nevezési határidő) are tracked
// separately with the organiser, not silently changed here.

function DocSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6 text-sm text-foreground sm:p-8">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-bold uppercase tracking-wide text-foreground sm:text-lg">{title}</h2>
        </div>
        <div className="flex flex-col gap-3 text-muted-foreground [&_strong]:text-foreground [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompetitionRulesDocument() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <span className="eyebrow">Hivatalos versenykiírás</span>
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide sm:text-4xl">
          SBD Next <span className="text-primary">II</span>
        </h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Nyílt erőemelő verseny
        </p>
      </div>

      <DocSection icon={Flag} title="A verseny célja">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Versenylehetőség megteremtése az IPF és a Magyar Erőemelő Szövetség szabályrendszere alapján,
            versenyengedély és klubtagsági kötelezettségek <strong>nélkül</strong>.
          </li>
          <li>
            A lehető legmagasabb színvonalú tömegsport versenyélményt, látványt, hangulatot és versenymédiát
            biztosítani a résztvevőknek és az érdeklődőknek.
          </li>
        </ol>
      </DocSection>

      <DocSection icon={Users} title="Szervezők">
        <p>
          <strong>Főszervező:</strong> SBD Magyarország (
          <a href="https://sbdhungary.hu" target="_blank" rel="noopener noreferrer">
            sbdhungary.hu
          </a>
          ), Power Flow EU
        </p>
        <p>
          <strong>Társszervezők:</strong> Thor Gym Újbuda (
          <a href="https://ujbuda.thorgym.hu/" target="_blank" rel="noopener noreferrer">
            ujbuda.thorgym.hu
          </a>
          ), Bunnymedia.hu
        </p>
        <p>A Magyar Erőemelő Szövetség (MERSZ) jóváhagyásával és támogatásával.</p>
      </DocSection>

      <DocSection icon={MapPin} title="Helyszín és időpont">
        <p>
          <strong>2027. február 13–14.</strong>
        </p>
        <p>1116 Budapest, Nándorfejérvári út 40., Thor Gym Újbuda</p>
        <p>Parkolási lehetőség a gyártelep udvarán.</p>
      </DocSection>

      <DocSection icon={Gavel} title="A verseny lebonyolítási rendje">
        <p>
          Háromfogásos erőemelő verseny a MERSZ szabályrendszere szerint. Versenykezdet előtt két órával
          mérlegelés az adott kategóriáknak. Felszerelés bemutatása nem kötelező, de a szabályzatban nem
          engedélyezett felszerelés előbb figyelmeztetéssel, később kizárással szankcionálható.
        </p>
        <p>
          <strong>Figyelem:</strong> 2027. január 1-től az IPF engedélyezett lista változik — ennek értelmében
          az SBD Next II-n sem szabad majd a szabályváltozásban érintett merev térdgumikat használni. Kérdéses
          esetben a mérlegelő bírókat érdemes kérdezni.
        </p>
        <p>
          Kizárólag az IPF és a MERSZ 2027. január 1-től érvényes szabályrendszere szerinti raw (klasszikus)
          erőemelő felszerelések használhatóak. Térdbandázs és segítő ruházat használata nem megengedett.
          Tehetségkutató kategóriában testhez simuló cicanadrág vagy rövidnadrág használata a kantáros
          erőemelő mez helyett megengedett.
        </p>
        <p>A csoportbeosztásokat (versenyzés sorrendjét, pontos időpontokat) a nevezés lezárása után közreadjuk.</p>
      </DocSection>

      <DocSection icon={Trophy} title="Kategóriák">
        <p className="font-semibold text-foreground">Tehetségkutató / Rookie</p>
        <p>
          Férfi és női tehetségkutató: súlycsoport és korcsoport megkötés nélkül, betöltött 14. életév felett,
          IPF GL pontok alapján.
        </p>
        <p>A tehetségkutató kategóriában azok indulhatnak, akik:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>2025-ben és/vagy 2026-ban nem indultak a MERSZ első osztályú erőemelő magyar bajnokságán, illetve IPF nemzetközi versenyen, VAGY</li>
          <li>2025–2026 során nem indultak egyéb külföldi IPF tagszervezet ezzel egyenértékű országos versenyén.</li>
        </ul>
        <p>
          Aki magyar II. osztályú versenyen vagy annál kisebb besorolású versenyen vett részt, az nem zárja ki a
          tehetségkutató kategóriában való indulást.
        </p>

        <p className="mt-2 font-semibold text-foreground">Versenyzői / Lifter</p>
        <p>
          Férfi és női versenyzői: súlycsoport és korcsoport megkötés nélkül, betöltött 14. életév felett, IPF
          GL pontok alapján.
        </p>
        <p>A versenyzői kategóriában azok indulhatnak, akik:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>indultak a MERSZ 2025-ös vagy 2026-os Felnőtt Erőemelő Magyar Bajnokságán, VAGY</li>
          <li>2025. január 1-től elért hivatalos MERSZ versenyen az Open Magyar I. osztályú szintet erőemelésben,</li>
          <li>külföldi versenyzők esetében, ha bármely IPF tagország szövetségénél elért eredményük eléri a magyar első osztályú szintet.</li>
        </ul>
        <p className="text-xs">
          A MERSZ I. osztályú szintek (Open): Nők — 47/52/57/63/69/76/84/+84 kg, összetett 250–380 kg.
          Férfiak — 59/66/74/83/93/105/120/+120 kg, összetett 480–700 kg.
        </p>
      </DocSection>

      <DocSection icon={ShieldCheck} title="Bírók és csúcsok">
        <p>A versenyen a MERSZ hivatalos bírói működnek közre. Zsűri nem lesz.</p>
        <p>Az SBD Next nem egy szabadidős verseny, ezért országos csúcsokat nem lehet dönteni.</p>
      </DocSection>

      <DocSection icon={Gift} title="Nevezési határidők és díjazás">
        <p>
          <strong>Nevezési díj:</strong> 30 000 Ft
        </p>
        <p>
          <strong>Nevezési határidő:</strong> 2026. november 30.
        </p>
        <p>
          Figyelem: a versenyre csak korlátozott nevezés elérhető, az „aki hamarabb jön&rdquo; elv alapján. A rendszer
          a maximum nevezési helyek betöltődése után automatikusan lezárja a nevezést.
        </p>
        <p className="mt-2 font-semibold text-foreground">Díjazás</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Érmek a kategóriák I–III. helyezettjeinek. Oklevél minden résztvevőnek.</li>
          <li>Kiemelt ajándékcsomag minden kategória dobogós helyezettjeinek.</li>
          <li>
            Ingyenesen letölthető fotóanyag minden versenyzőről (prémium előfizetéssel teljes fotó- és
            videócsomag is kérhető).
          </li>
          <li>SBD egyedi versenypóló: külön díj fejében rendelhető, a nevezési díj nem tartalmazza.</li>
        </ul>
      </DocSection>
    </div>
  );
}
