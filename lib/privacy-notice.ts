export type PrivacyLocale = "hu" | "en";

export type PrivacyBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

// Tiny markup for the admin-editable privacy notice text: "## " / "### "
// headings, "- " bullet lines grouped into a list, blank-line-separated
// paragraphs otherwise, and "**bold**" within any of those (handled by the
// renderer, not here). Deliberately not full Markdown — D/Miki only ever
// need headings, paragraphs, a bullet list and the odd bold phrase, and a
// tiny hand-rolled parser means no new dependency and no HTML to sanitise.
export function parsePrivacyNoticeText(text: string): PrivacyBlock[] {
  const blocks: PrivacyBlock[] = [];
  const chunks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean);

  for (const chunk of chunks) {
    if (chunk.startsWith("### ")) {
      blocks.push({ type: "h3", text: chunk.slice(4).trim() });
      continue;
    }
    if (chunk.startsWith("## ")) {
      blocks.push({ type: "h2", text: chunk.slice(3).trim() });
      continue;
    }
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
      blocks.push({ type: "ul", items: lines.map((l) => l.slice(2).trim()) });
      continue;
    }
    blocks.push({ type: "p", text: chunk });
  }

  return blocks;
}

// Code-level fallback, identical to the seed row inserted by
// supabase/migrations/0011_privacy_notice.sql — used when Supabase isn't
// configured on an environment, or the row hasn't been created yet, so the
// public pages never show a blank screen. Keep in sync with that migration
// if the drafted text changes before the real notice is published.
export const DEFAULT_PRIVACY_NOTICE: Record<PrivacyLocale, string> = {
  hu: `## 1. Az adatkezelő

A sbdnext.hu oldal és a SBD Next verseny adatkezelője: [KITÖLTENDŐ: cégnév / egyéni vállalkozó neve], székhely: [KITÖLTENDŐ: cím], cégjegyzékszám / nyilvántartási szám: [KITÖLTENDŐ], adószám: [KITÖLTENDŐ].

Kapcsolat: powerlifting@sbdnext.hu

## 2. Milyen adatokat kezelünk, és milyen célból

### Nevezés

A versenyre nevezéskor megadott adatokat (név, e-mail cím, születési év, nem, kategória, klub, testsúly, tervezett nyitófogások, póló adatok, megjegyzés) kizárólag a verseny lebonyolításához, a mérlegelés és a beosztás elkészítéséhez, a nevezési díj beszedéséhez és a kapcsolattartáshoz használjuk fel.

Ha feltöltesz egy arcfotót a nevezéshez, azt a verseny előkészítéséhez (pl. a beléptetéshez, a versenyzők azonosításához) használjuk. Az arcfotó feltöltése nem kötelező, és csak azok a szervezők, adminisztrátorok férnek hozzá, akiknek ez a munkájukhoz szükséges.

Ha korábban már versenyeztél a SBD Next-en, a nevezési űrlap az előző évi adataiddal automatikusan ki tudja tölteni az űrlapot (e-mail cím, illetve név + születési év alapján). Ez kényelmi funkció, nem jelent fiókot vagy bejelentkezést.

### Fizetés

A nevezési díj és az opcionális csomagok (pl. prémium média) kifizetése a Stripe fizetési szolgáltatón keresztül történik. A bankkártya adataidat mi nem látjuk és nem tároljuk — azokat közvetlenül a Stripe kezeli a saját adatvédelmi szabályzata szerint.

### E-mailek

A nevezés visszaigazolását, a fizetési és szerkesztési linkeket, illetve az arcfotó pótlására emlékeztető e-maileket a Resend nevű levélküldő szolgáltatón keresztül küldjük ki.

### Hírlevél

Ha feliratkozol a hírlevélre (pl. korábbi versenyzőként, vagy a korai nevezési értesítésre), az e-mail címedet eltároljuk, és a hírlevelet a GMass szolgáltatáson keresztül küldjük ki a powerlifting@sbdnext.hu címről. A hírlevélről bármikor leiratkozhatsz a levelekben található linken.

### Visszajelzés

A hírlevél-visszaigazoló oldalon megadott, opcionális szöveges visszajelzést ("mivel tudnánk még jobbá tenni a versenyt") a feliratkozásodhoz kapcsolva tároljuk, hogy a jövőbeli versenyeket jobbá tudjuk tenni.

### Weboldal-használat

A weboldal látogatottságát a Vercel Analytics szolgáltatással mérjük, amely nem használ sütiket, és nem köti egyedi azonosítóhoz a látogatókat — anonimizált, összesített statisztikát ad (pl. hányan nyitották meg a nevezési oldalt).

## 3. Kik férnek hozzá az adataidhoz (adatfeldolgozók)

- **Supabase** — a nevezési adatok és az arcfotók tárolása (adatbázis és privát fájltároló).
- **Stripe** — a nevezési díj és a kiegészítő csomagok fizetésének lebonyolítása.
- **Resend** — a nevezéssel, fizetéssel és szerkesztéssel kapcsolatos e-mailek kiküldése.
- **Vercel** — a weboldal üzemeltetése és a 2. pontban leírt, anonimizált látogatottsági statisztika (Vercel Analytics).
- **Google (Google Sheets) és Make.com** — a nevezési adatok egy részét a szervezők belső munkatáblájába (Google Sheets) is továbbítjuk, a Make.com automatizáló szolgáltatás segítségével, hogy a szervezők kézi adminisztráció nélkül dolgozhassanak a nevezési listával.
- **GMass** — a hírlevelek kiküldése.

Ezek a szolgáltatók az adataidat a saját adatvédelmi szabályzatuk szerint, a megbízásunk keretein belül kezelik, és nem használják fel saját céljaikra.

## 4. Az adatkezelés jogalapja

A nevezéssel és a fizetéssel kapcsolatos adatkezelés jogalapja a velünk, mint szervezővel létrejövő szerződés teljesítése (a versenyen való részvétel biztosítása). A hírlevélre feliratkozás és az opcionális visszajelzés adatkezelésének jogalapja a hozzájárulásod, amelyet bármikor visszavonhatsz.

## 5. Mennyi ideig tároljuk az adataidat

A nevezési adatokat a versenyt követően [KITÖLTENDŐ: pl. a jogszabályi (számviteli) megőrzési időnek megfelelően, illetve a következő éves nevezés megkönnyítése érdekében] tároljuk. Az arcfotót a verseny lezárását követően töröljük. A hírlevélre feliratkozás adatait a leiratkozásig, illetve a hozzájárulás visszavonásáig tároljuk.

## 6. A te jogaid

Az adatkezeléssel kapcsolatban kérhetsz tájékoztatást a rólad tárolt adatokról, kérheted azok helyesbítését, törlését vagy az adatkezelés korlátozását, illetve tiltakozhatsz az adatkezelés ellen. Ezekkel az ügyekben, illetve bármilyen adatkezeléssel kapcsolatos kérdéssel az powerlifting@sbdnext.hu címen tudsz hozzánk fordulni.

Ha úgy érzed, hogy az adataidat jogellenesen kezeljük, panasszal élhetsz a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH, 1055 Budapest, Falk Miksa utca 9-11., www.naih.hu).

## 7. Adatbiztonság

A nevezési adatokat és az arcfotókat zárt, nem nyilvánosan elérhető rendszerekben tároljuk. Ezeket az adatokat sosem tesszük nyilvánosan hozzáférhetővé — a weboldalon és a kommunikációban csak a verseny lebonyolításához szükséges, összesített vagy anonimizált adatok (pl. kategóriánkénti résztvevőszám) jelennek meg.`,
  en: `## 1. Data controller

The controller of sbdnext.hu and the SBD Next competition is [TO FILL IN: company / sole trader name], registered address: [TO FILL IN: address], company registration number: [TO FILL IN], tax number: [TO FILL IN].

Contact: powerlifting@sbdnext.hu

## 2. What we collect, and why

### Registration

The data you submit when registering (name, e-mail address, year of birth, sex, division, club, bodyweight, planned opening attempts, shirt details, notes) is used solely to run the competition — weigh-ins, the flight schedule, collecting the entry fee, and getting in touch with you.

If you upload a face photo with your registration, we use it to prepare for the competition (e.g. check-in, identifying athletes). Uploading a face photo is optional, and only organisers and admins who need it for their work can access it.

If you competed at a previous SBD Next, the registration form can pre-fill your details from last year (matched by e-mail, or by name and year of birth). This is a convenience feature, not an account or login.

### Payment

The entry fee and optional add-ons (e.g. premium media) are paid through Stripe. We never see or store your card details — Stripe handles them directly, under its own privacy policy.

### E-mails

Registration confirmations, payment and edit links, and face-photo reminder e-mails are sent through Resend.

### Newsletter

If you sign up for the newsletter (e.g. as a past competitor, or for early-access registration alerts), we store your e-mail address, and the newsletter is sent through GMass from powerlifting@sbdnext.hu. You can unsubscribe at any time using the link in the e-mails.

### Feedback

Any optional feedback you leave on the newsletter confirmation page ("how could we make the competition even better") is stored together with your newsletter sign-up, so we can improve future events.

### Site usage

We measure site traffic with Vercel Analytics, which doesn't use cookies and doesn't tie visits to an individual identifier — it only gives us anonymised, aggregate statistics (e.g. how many people opened the registration page).

## 3. Who else processes your data

- **Supabase** — stores registration data and face photos (database and private file storage).
- **Stripe** — processes payment of the entry fee and add-on packages.
- **Resend** — sends registration, payment and edit-related e-mails.
- **Vercel** — hosts the website and provides the anonymised traffic statistics described above (Vercel Analytics).
- **Google (Google Sheets) and Make.com** — part of the registration data is also forwarded to the organisers' internal working spreadsheet (Google Sheets), via the Make.com automation service, so the organisers can work with the registration list without manual admin work.
- **GMass** — sends the newsletter.

These providers process your data under their own privacy policies, within the scope of what we ask them to do, and never use it for their own purposes.

## 4. Legal basis

Registration and payment data is processed on the basis of performing the contract between you and us as organiser (making sure you can take part in the competition). Newsletter sign-up and optional feedback are processed on the basis of your consent, which you can withdraw at any time.

## 5. How long we keep your data

We keep registration data after the competition for [TO FILL IN: e.g. as required by accounting/record-keeping rules, and to make next year's registration easier]. Face photos are deleted after the competition is over. Newsletter sign-up data is kept until you unsubscribe or withdraw consent.

## 6. Your rights

You can ask us what data we hold about you, request that it be corrected or deleted, ask us to restrict processing, or object to the processing. For any of this, or any other question about how we handle your data, write to us at powerlifting@sbdnext.hu.

If you believe we are processing your data unlawfully, you can lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH, 1055 Budapest, Falk Miksa utca 9-11., Hungary, www.naih.hu).

## 7. Data security

Registration data and face photos are stored in private, non-public systems. We never make this data publicly accessible — only aggregated or anonymised figures needed to run the competition (e.g. the number of entrants per division) appear on the website or in our communication.`,
};
