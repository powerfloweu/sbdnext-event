import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EVENT } from "@/config/event";

// Draft privacy notice. The organiser (D) and co-organiser (Miki) still need
// to fill in the [KITÖLTENDŐ] placeholders (controller legal entity, address,
// tax number) and review the rest before this is official. Keep app/en in
// sync if this text changes.
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Vissza a főoldalra
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-6 p-8 text-sm text-foreground/90">
          <div>
            <h1 className="text-2xl font-bold">Adatkezelési tájékoztató</h1>
            <p className="mt-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-foreground">
              Ez a tájékoztató még tervezet. A [KITÖLTENDŐ] jelölésű részeket a szervező tölti ki
              végleges adatokkal, a többi szöveget pedig átnézi, mielőtt ez hivatalos
              adatkezelési tájékoztatóvá válik.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold">1. Az adatkezelő</h2>
            <p className="mt-2">
              A sbdnext.hu oldal és a SBD Next verseny adatkezelője: [KITÖLTENDŐ: cégnév / egyéni
              vállalkozó neve], székhely: [KITÖLTENDŐ: cím], cégjegyzékszám / nyilvántartási
              szám: [KITÖLTENDŐ], adószám: [KITÖLTENDŐ].
            </p>
            <p className="mt-2">
              Kapcsolat:{" "}
              <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
                {EVENT.contact.email}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">2. Milyen adatokat kezelünk, és milyen célból</h2>

            <h3 className="mt-3 font-semibold">Nevezés</h3>
            <p className="mt-1">
              A versenyre nevezéskor megadott adatokat (név, e-mail cím, születési év, nem,
              kategória, klub, testsúly, tervezett nyitófogások, póló adatok, megjegyzés)
              kizárólag a verseny lebonyolításához, a mérlegelés és a beosztás elkészítéséhez,
              a nevezési díj beszedéséhez és a kapcsolattartáshoz használjuk fel.
            </p>
            <p className="mt-1">
              Ha feltöltesz egy arcfotót a nevezéshez, azt a verseny előkészítéséhez (pl. a
              beléptetéshez, a versenyzők azonosításához) használjuk. Az arcfotó feltöltése
              nem kötelező, és csak azok a szervezők, adminisztrátorok férnek hozzá, akiknek ez a
              munkájukhoz szükséges.
            </p>
            <p className="mt-1">
              Ha korábban már versenyeztél a SBD Next-en, a nevezési űrlap az előző évi
              adataiddal automatikusan ki tudja tölteni az űrlapot (e-mail cím, illetve
              név + születési év alapján). Ez kényelmi funkció, nem jelent fiókot vagy
              bejelentkezést.
            </p>

            <h3 className="mt-3 font-semibold">Fizetés</h3>
            <p className="mt-1">
              A nevezési díj és az opcionális csomagok (pl. prémium média) kifizetése a Stripe
              fizetési szolgáltatón keresztül történik. A bankkártya adataidat mi nem látjuk és
              nem tároljuk — azokat közvetlenül a Stripe kezeli a saját adatvédelmi
              szabályzata szerint.
            </p>

            <h3 className="mt-3 font-semibold">E-mailek</h3>
            <p className="mt-1">
              A nevezés visszaigazolását, a fizetési és szerkesztési linkeket, illetve az
              arcfotó pótlására emlékeztető e-maileket a Resend nevű levélküldő szolgáltatón
              keresztül küldjük ki.
            </p>

            <h3 className="mt-3 font-semibold">Hírlevél</h3>
            <p className="mt-1">
              Ha feliratkozol a hírlevélre (pl. korábbi versenyzőként, vagy a korai nevezési
              értesítésre), az e-mail címedet eltároljuk, és a hírlevelet a GMass szolgáltatáson
              keresztül küldjük ki a powerlifting@sbdnext.hu címről. A hírlevélről bármikor
              leiratkozhatsz a levelekben található linken.
            </p>

            <h3 className="mt-3 font-semibold">Visszajelzés</h3>
            <p className="mt-1">
              A hírlevél-visszaigazoló oldalon megadott, opcionális szöveges visszajelzést
              ("mivel tudnánk még jobbá tenni a versenyt") a feliratkozásodhoz kapcsolva tároljuk,
              hogy a jövőbeli versenyeket jobbá tudjuk tenni.
            </p>

            <h3 className="mt-3 font-semibold">Weboldal-használat</h3>
            <p className="mt-1">
              A weboldal látogatottságát a Vercel Analytics szolgáltatással mérjük, amely nem
              használ sütiket, és nem köti egyedi azonosítóhoz a látogatókat — anonimizált,
              összesített statisztikát ad (pl. hányan nyitották meg a nevezési oldalt).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">3. Kik férnek hozzá az adataidhoz (adatfeldolgozók)</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Supabase</strong> — a nevezési adatok és az arcfotók tárolása (adatbázis és
                privát fájltároló).
              </li>
              <li>
                <strong>Stripe</strong> — a nevezési díj és a kiegészítő csomagok fizetésének
                lebonyolítása.
              </li>
              <li>
                <strong>Resend</strong> — a nevezéssel, fizetéssel és szerkesztéssel kapcsolatos
                e-mailek kiküldése.
              </li>
              <li>
                <strong>Vercel</strong> — a weboldal üzemeltetése és a 2. pontban leírt,
                anonimizált látogatottsági statisztika (Vercel Analytics).
              </li>
              <li>
                <strong>Google (Google Sheets) és Make.com</strong> — a nevezési adatok egy
                részét a szervezők belső munkatáblájába (Google Sheets) is továbbítjuk, a
                Make.com automatizáló szolgáltatás segítségével, hogy a szervezők kézi
                adminisztráció nélkül dolgozhassanak a nevezési listával.
              </li>
              <li>
                <strong>GMass</strong> — a hírlevelek kiküldése.
              </li>
            </ul>
            <p className="mt-2">
              Ezek a szolgáltatók az adataidat a saját adatvédelmi szabályzatuk szerint, a
              megbízásunk keretein belül kezelik, és nem használják fel saját céljaikra.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">4. Az adatkezelés jogalapja</h2>
            <p className="mt-2">
              A nevezéssel és a fizetéssel kapcsolatos adatkezelés jogalapja a velünk, mint
              szervezővel létrejövő szerződés teljesítése (a versenyen való részvétel
              biztosítása). A hírlevélre feliratkozás és az opcionális visszajelzés adatkezelésének
              jogalapja a hozzájárulásod, amelyet bármikor visszavonhatsz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">5. Mennyi ideig tároljuk az adataidat</h2>
            <p className="mt-2">
              A nevezési adatokat a versenyt követően [KITÖLTENDŐ: pl. a jogszabályi (számviteli)
              megőrzési időnek megfelelően, illetve a következő éves nevezés megkönnyítése
              érdekében] tároljuk. Az arcfotót a verseny lezárását követően töröljük. A
              hírlevélre feliratkozás adatait a leiratkozásig, illetve a hozzájárulás
              visszavonásáig tároljuk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">6. A te jogaid</h2>
            <p className="mt-2">
              Az adatkezeléssel kapcsolatban kérhetsz tájékoztatást a rólad tárolt adatokról,
              kérheted azok helyesbítését, törlését vagy az adatkezelés korlátozását, illetve
              tiltakozhatsz az adatkezelés ellen. Ezekkel az ügyekben, illetve bármilyen
              adatkezeléssel kapcsolatos kérdéssel az{" "}
              <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
                {EVENT.contact.email}
              </a>{" "}
              címen tudsz hozzánk fordulni.
            </p>
            <p className="mt-2">
              Ha úgy érzed, hogy az adataidat jogellenesen kezeljük, panasszal élhetsz a Nemzeti
              Adatvédelmi és Információszabadság Hatóságnál (NAIH, 1055 Budapest, Falk Miksa
              utca 9-11., www.naih.hu).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">7. Adatbiztonság</h2>
            <p className="mt-2">
              A nevezési adatokat és az arcfotókat zárt, nem nyilvánosan elérhető rendszerekben
              tároljuk. Ezeket az adatokat sosem tesszük nyilvánosan hozzáférhetővé — a
              weboldalon és a kommunikációban csak a verseny lebonyolításához szükséges,
              összesített vagy anonimizált adatok (pl. kategóriánkénti résztvevőszám) jelennek
              meg.
            </p>
          </section>

          <Button asChild variant="secondary" className="self-start">
            <Link href="/">Vissza a főoldalra</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
