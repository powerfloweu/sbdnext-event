import { Resend } from "resend";

import { EVENT } from "@/config/event";
import { formatHUF, formatEUR } from "@/lib/format";

type RegistrationLocale = "hu" | "en";

function formatAmount(amount: number, currency: "HUF" | "EUR"): string {
  return currency === "EUR" ? `€${formatEUR(amount)}` : `${formatHUF(amount)} Ft`;
}

// Server-only, and gracefully inert until the organiser verifies a sending
// domain (sbdnext.hu) with Resend and sets RESEND_API_KEY — see README
// "Environment variables". Every call here is wrapped in try/catch by its
// caller: a failed or skipped email must never block registration/payment.
let cached: Resend | null | undefined;

function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "SBD Next <nevezes@sbdnext.hu>";

// Appended to every outgoing email. Keep in sync with the organiser's own
// copy of this signature if they update it elsewhere (it's not generated
// from config/event.ts — the venue line below is static text). No date here
// on purpose — last year's dates don't apply to this edition.
const SIGNATURE_HTML = `
<div style="margin-top:24px" data-spark-custom-html="true">
    <table cellpadding="0" cellspacing="0" style="background:#000000;border-left:4px solid #e52428;border-radius:8px;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <tbody>
            <tr>
                <td style="padding:12px 16px 12px 16px;vertical-align:middle;">
                    <img src="https://www.sbdnext.hu/small_sbd_next_logo_v4.0.png" alt="SBD Next" style="display:block;width:130px;max-width:130px;height:auto;">
                </td>
                <td style="padding:12px 20px 12px 8px;vertical-align:middle;font-size:13px;line-height:1.5;">
                    <div style="font-weight:700;color:#ff3b3b;margin-bottom:4px;">
                        SBD Next – Nyílt erőemelő verseny
                    </div>
                    <div>
                        Budapest • Thor Gym (Újbuda)
                    </div>
                    <div style="margin-top:10px;font-weight:700;color:#ff3b3b;">
                        Kapcsolat:
                    </div>
                    <div>
                        powerlifting@sbdnext.hu<br>
                        <a href="https://www.sbdnext.hu" style="color:#ff3b3b;text-decoration:none;">www.sbdnext.hu</a>
                    </div>
                    <div style="margin-top:10px;">
                        Instagram: <a href="${EVENT.social.igSbd}" style="color:#ff3b3b;text-decoration:none;">@sbd.hungary</a><br>
                        Instagram: <a href="${EVENT.social.igPowerflow}" style="color:#ff3b3b;text-decoration:none;">@powerfloweu</a>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>`;

// A branded call-to-action button for email HTML. display:inline-block (not
// a bare <a>) so it renders as a real tappable button in mobile clients,
// not just bold text.
function buttonHtml(href: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${href}" style="display:inline-block;background:#e52428;color:#ffffff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${label}</a></p>`;
}

// What the athlete actually submitted — shown back to them in the
// registration/payment e-mails so a typo surfaces immediately instead of
// only at check-in. Optional because a resend of an older row may not have
// all of these (e.g. sent before this recap existed).
export interface RegistrationSummary {
  lastName: string;
  firstName: string;
  division: string;
  sex: string;
  birthYear: number;
  club: string | null;
  bodyweight: number;
  openerSquat: number;
  openerBench: number;
  openerDeadlift: number;
  wantsShirt: boolean;
  shirtCut: string | null;
  shirtSize: string | null;
  premiumMedia: boolean;
}

// Builds a RegistrationSummary from the DB row's snake_case columns — the
// shape every caller outside app/api/register/route.ts (which already has
// the camelCase wizard payload) actually has on hand.
export function summaryFromRow(row: {
  last_name: string;
  first_name: string;
  division: string;
  sex: string;
  birth_year: number;
  club: string | null;
  bodyweight: number;
  opener_squat: number;
  opener_bench: number;
  opener_deadlift: number;
  wants_shirt: boolean;
  shirt_cut: string | null;
  shirt_size: string | null;
  premium_media: boolean;
}): RegistrationSummary {
  return {
    lastName: row.last_name,
    firstName: row.first_name,
    division: row.division,
    sex: row.sex,
    birthYear: row.birth_year,
    club: row.club,
    bodyweight: row.bodyweight,
    openerSquat: row.opener_squat,
    openerBench: row.opener_bench,
    openerDeadlift: row.opener_deadlift,
    wantsShirt: row.wants_shirt,
    shirtCut: row.shirt_cut,
    shirtSize: row.shirt_size,
    premiumMedia: row.premium_media,
  };
}

function summaryTableHtml(summary: RegistrationSummary, locale: RegistrationLocale): string {
  const rows: [string, string][] =
    locale === "en"
      ? [
          ["Name", `${summary.lastName} ${summary.firstName}`],
          ["Birth year", String(summary.birthYear)],
          ["Sex", summary.sex],
          ["Division", summary.division],
          ["Bodyweight", `${summary.bodyweight} kg`],
          ["Club", summary.club || "—"],
          [
            "Opening attempts",
            `squat ${summary.openerSquat} kg · bench ${summary.openerBench} kg · deadlift ${summary.openerDeadlift} kg`,
          ],
          ["Shirt", summary.wantsShirt ? `${summary.shirtCut ?? "—"}, size ${summary.shirtSize ?? "—"}` : "not ordered"],
          ["Premium media package", summary.premiumMedia ? "yes" : "no"],
        ]
      : [
          ["Név", `${summary.lastName} ${summary.firstName}`],
          ["Születési év", String(summary.birthYear)],
          ["Nem", summary.sex],
          ["Kategória", summary.division],
          ["Testsúly", `${summary.bodyweight} kg`],
          ["Klub", summary.club || "—"],
          [
            "Nyitó súlyok",
            `guggolás ${summary.openerSquat} kg · fekvenyomás ${summary.openerBench} kg · felhúzás ${summary.openerDeadlift} kg`,
          ],
          ["Póló", summary.wantsShirt ? `${summary.shirtCut ?? "—"} fazon, ${summary.shirtSize ?? "—"} méret` : "nem kért"],
          ["Prémium média csomag", summary.premiumMedia ? "igen" : "nem"],
        ];

  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#555;white-space:nowrap;">${label}:</td><td style="padding:4px 0;"><b>${value}</b></td></tr>`
    )
    .join("");

  return `<table style="margin:16px 0;font-size:14px;border-collapse:collapse;">${body}</table>`;
}

interface RegistrationEmailData {
  email: string;
  firstName: string;
  waitlisted: boolean;
  totalFee: number;
  currency: "HUF" | "EUR";
  editUrl: string;
  summary?: RegistrationSummary;
  locale?: RegistrationLocale;
}

export async function sendRegistrationReceivedEmail(data: RegistrationEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const locale = data.locale ?? "hu";
  const amount = formatAmount(data.totalFee, data.currency);

  const subject =
    locale === "en"
      ? data.waitlisted
        ? "SBD Next 2 — you're on the waitlist"
        : "SBD Next 2 — we've received your registration"
      : data.waitlisted
        ? "SBD Next 2 — jelentkezésed várólistára került"
        : "SBD Next 2 — jelentkezésed megérkezett";

  const editLabel = locale === "en" ? "View / edit your registration details" : "Nevezési adatok megtekintése / szerkesztése";
  const contactLabel = locale === "en" ? "Questions? E-mail us:" : "Kérdés esetén írj nekünk:";
  const editHintEn =
    "Made a typo in your name, division or shirt size? You can fix it later via this link, until 2027-01-30 (shirt size until 2027-01-13).";
  const editHintHu = "Elírtad a nevedet, az osztályod vagy a pólóméreted? Ezen a linken utólag is javíthatod, 2027. január 30-ig (a pólóméret 2027. január 13-ig).";

  const body =
    locale === "en"
      ? data.waitlisted
        ? `<p>Hi ${data.firstName}!</p>
           <p>We've received your registration for SBD Next 2. Entry capacity is currently full, so
           you've been placed on the <b>waitlist</b>. We'll e-mail you as soon as a spot opens up.</p>`
        : `<p>Hi ${data.firstName}!</p>
           <p>We've received your registration for SBD Next 2. The amount due is
           <b>${amount}</b>. If your payment went through, you'll get a separate confirmation shortly.</p>`
      : data.waitlisted
        ? `<p>Szia ${data.firstName}!</p>
           <p>Megkaptuk a jelentkezésed a SBD Next 2 versenyre. Jelenleg a nevezői létszám betelt, ezért
           <b>várólistára</b> kerültél. Amint hely szabadul fel, e-mailben jelentkezünk.</p>`
        : `<p>Szia ${data.firstName}!</p>
           <p>Megkaptuk a jelentkezésed a SBD Next 2 versenyre. A fizetendő összeg
           <b>${amount}</b>. Ha a fizetés sikeres volt, hamarosan külön
           visszaigazolást kapsz.</p>`;

  const summaryHtml = data.summary ? summaryTableHtml(data.summary, locale) : "";

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject,
    html: `${body}${summaryHtml}${buttonHtml(data.editUrl, editLabel)}<p class="text-xs">${locale === "en" ? editHintEn : editHintHu}</p><p>${contactLabel} <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>${SIGNATURE_HTML}`,
  });
  return true;
}

interface PaymentEmailData {
  email: string;
  firstName: string;
  totalFee: number;
  currency: "HUF" | "EUR";
  editUrl?: string;
  summary?: RegistrationSummary;
  locale?: RegistrationLocale;
}

export async function sendPaymentConfirmedEmail(data: PaymentEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const locale = data.locale ?? "hu";
  const amount = formatAmount(data.totalFee, data.currency);
  const editLabel = locale === "en" ? "View / edit your registration details" : "Nevezési adatok megtekintése / szerkesztése";
  const contactLabel = locale === "en" ? "Questions? E-mail us:" : "Kérdés esetén írj nekünk:";

  const editSection = data.editUrl
    ? `${buttonHtml(data.editUrl, editLabel)}<p class="text-xs">${
        locale === "en"
          ? "Made a typo in your details? You can fix it later via this link, until 2027-01-30 (shirt size until 2027-01-13)."
          : "Elírtad valamelyik adatodat? Ezen a linken utólag is javíthatod, 2027. január 30-ig (a pólóméret 2027. január 13-ig)."
      }</p>`
    : "";

  const summaryHtml = data.summary ? summaryTableHtml(data.summary, locale) : "";

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject:
      locale === "en"
        ? "SBD Next 2 — payment received, your registration is confirmed"
        : "SBD Next 2 — a fizetésed megérkezett, nevezésed véglegesítve",
    html:
      locale === "en"
        ? `<p>Hi ${data.firstName}!</p>
       <p>Your payment of <b>${amount}</b> has been received, your registration is
       <b>confirmed</b>. See you at the competition!</p>
       ${summaryHtml}${editSection}<p>${contactLabel} <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>${SIGNATURE_HTML}`
        : `<p>Szia ${data.firstName}!</p>
       <p>A(z) <b>${amount}</b> befizetésed megérkezett, a nevezésed
       <b>véglegesítve</b> van. Találkozunk a versenyen!</p>
       ${summaryHtml}${editSection}<p>${contactLabel} <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>${SIGNATURE_HTML}`,
  });
  return true;
}

type Locale = "hu" | "en";

export async function sendNotifySignupConfirmedEmail(email: string, locale: Locale = "hu"): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const subject =
    locale === "en" ? "SBD Next 2 — we'll let you know when registration opens" : "SBD Next 2 — szólunk, amint nyílik a nevezés";
  const html =
    locale === "en"
      ? `<p>Hi!</p>
       <p>You signed up to be the first to know when SBD Next 2 registration opens. The moment it
       does, you'll get an e-mail at this address with the link.</p>
       <p>In the meantime, follow us: <a href="${EVENT.social.igSbd}">Instagram</a></p>`
      : `<p>Szia!</p>
       <p>Feliratkoztál, hogy elsőként értesülj a SBD Next 2 nevezés indulásáról. Amint
       megnyílik a nevezés, ezen a címen kapsz egy e-mailt a linkkel.</p>
       <p>Addig is kövess minket: <a href="${EVENT.social.igSbd}">Instagram</a></p>`;

  await resend.emails.send({ from: FROM, to: email, subject, html: `${html}${SIGNATURE_HTML}` });
  return true;
}

export async function sendRegistrationOpenNotification(email: string, locale: Locale = "hu"): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const subject = locale === "en" ? "SBD Next 2 — registration is open!" : "SBD Next 2 — megnyílt a nevezés!";
  const html =
    locale === "en"
      ? `<p>Hi!</p>
       <p>Registration for SBD Next 2 is now open! If you want to compete, don't wait too long —
       spots are expected to fill up fast.</p>
       ${buttonHtml(`${EVENT.siteUrl}/nevezes`, "Register now")}
       <p class="text-xs">The registration form itself is in Hungarian — see the
       <a href="${EVENT.siteUrl}/en">English guide</a> for help filling it out.</p>
       <p>Questions? Write to us: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>`
      : `<p>Szia!</p>
       <p>Megnyílt a nevezés a SBD Next 2 versenyre! Ha szeretnél indulni, ne várj sokat —
       a helyek várhatóan gyorsan betelnek.</p>
       ${buttonHtml(`${EVENT.siteUrl}/nevezes`, "Nevezek most")}
       <p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>`;

  await resend.emails.send({ from: FROM, to: email, subject, html: `${html}${SIGNATURE_HTML}` });
  return true;
}

interface FacePhotoReminderData {
  email: string;
  firstName: string;
  editUrl: string;
  locale?: RegistrationLocale;
}

export async function sendFacePhotoReminderEmail(data: FacePhotoReminderData): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const locale = data.locale ?? "hu";

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: locale === "en" ? "SBD Next 2 — don't miss adding your face photo" : "SBD Next 2 — ne maradj le az arcfotódról",
    html:
      locale === "en"
        ? `<p>Hi ${data.firstName}!</p>
       <p>Your registration is still missing a face photo — this is what lets our AI-based photo
       sorter (Excire Photo) automatically find and collect the shots of you after the competition.</p>
       ${buttonHtml(data.editUrl, "Upload face photo")}
       <p>Questions? Write to us: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>${SIGNATURE_HTML}`
        : `<p>Szia ${data.firstName}!</p>
       <p>A nevezésedből még hiányzik az arcfotó — ez kell ahhoz, hogy a verseny után az
       AI-alapú fotóválogatónk (Excire Photo) automatikusan megtalálja és összegyűjtse a rólad
       készült képeket.</p>
       ${buttonHtml(data.editUrl, "Arcfotó feltöltése")}
       <p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>${SIGNATURE_HTML}`,
  });
  return true;
}
