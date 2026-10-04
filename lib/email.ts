import { Resend } from "resend";

import { EVENT } from "@/config/event";
import { formatHUF } from "@/lib/format";

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
// from config/event.ts — the date/venue line below is static text).
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
                        Budapest • Thor Gym (Újbuda)<br>
                        2026. február 14–15.
                    </div>
                    <div style="margin-top:10px;font-weight:700;color:#ff3b3b;">
                        Kapcsolat:
                    </div>
                    <div>
                        powerlifting@sbdnext.hu<br>
                        <a href="https://www.sbdnext.hu" style="color:#ff3b3b;text-decoration:none;">www.sbdnext.hu</a>
                    </div>
                    <div style="margin-top:10px;">
                        Instagram: @sbd.hungary<br>
                        Instagram: @powerfloweu
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>`;

interface RegistrationEmailData {
  email: string;
  firstName: string;
  waitlisted: boolean;
  totalFee: number;
}

export async function sendRegistrationReceivedEmail(data: RegistrationEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const subject = data.waitlisted
    ? "SBD Next 2 — jelentkezésed várólistára került"
    : "SBD Next 2 — jelentkezésed megérkezett";

  const body = data.waitlisted
    ? `<p>Szia ${data.firstName}!</p>
       <p>Megkaptuk a jelentkezésed a SBD Next 2 versenyre. Jelenleg a nevezői létszám betelt, ezért
       <b>várólistára</b> kerültél. Amint hely szabadul fel, e-mailben jelentkezünk.</p>`
    : `<p>Szia ${data.firstName}!</p>
       <p>Megkaptuk a jelentkezésed a SBD Next 2 versenyre. A fizetendő összeg
       <b>${formatHUF(data.totalFee)} Ft</b>. Ha a fizetés sikeres volt, hamarosan külön
       visszaigazolást kapsz.</p>`;

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject,
    html: `${body}<p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>${SIGNATURE_HTML}`,
  });
  return true;
}

interface PaymentEmailData {
  email: string;
  firstName: string;
  totalFee: number;
}

export async function sendPaymentConfirmedEmail(data: PaymentEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "SBD Next 2 — a fizetésed megérkezett, nevezésed véglegesítve",
    html: `<p>Szia ${data.firstName}!</p>
       <p>A(z) <b>${formatHUF(data.totalFee)} Ft</b> befizetésed megérkezett, a nevezésed
       <b>véglegesítve</b> van. Találkozunk a versenyen!</p>
       <p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>${SIGNATURE_HTML}`,
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
       <p><a href="${EVENT.siteUrl}/nevezes" style="font-weight:bold">Register now</a></p>
       <p class="text-xs">The registration form itself is in Hungarian — see the
       <a href="${EVENT.siteUrl}/en">English guide</a> for help filling it out.</p>
       <p>Questions? Write to us: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>`
      : `<p>Szia!</p>
       <p>Megnyílt a nevezés a SBD Next 2 versenyre! Ha szeretnél indulni, ne várj sokat —
       a helyek várhatóan gyorsan betelnek.</p>
       <p><a href="${EVENT.siteUrl}/nevezes" style="font-weight:bold">Nevezek most</a></p>
       <p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>`;

  await resend.emails.send({ from: FROM, to: email, subject, html: `${html}${SIGNATURE_HTML}` });
  return true;
}
