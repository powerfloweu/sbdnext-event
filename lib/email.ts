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
    html: `${body}<p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>`,
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
       <p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>`,
  });
  return true;
}

export async function sendNotifySignupConfirmedEmail(email: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "SBD Next 2 — szólunk, amint nyílik a nevezés",
    html: `<p>Szia!</p>
       <p>Feliratkoztál, hogy elsőként értesülj a SBD Next 2 nevezés indulásáról. Amint
       megnyílik a nevezés, ezen a címen kapsz egy e-mailt a linkkel.</p>
       <p>Addig is kövess minket: <a href="${EVENT.social.igSbd}">Instagram</a></p>`,
  });
  return true;
}

export async function sendRegistrationOpenNotification(email: string): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "SBD Next 2 — megnyílt a nevezés!",
    html: `<p>Szia!</p>
       <p>Megnyílt a nevezés a SBD Next 2 versenyre! Ha szeretnél indulni, ne várj sokat —
       a helyek várhatóan gyorsan betelnek.</p>
       <p><a href="${EVENT.siteUrl}/nevezes" style="font-weight:bold">Nevezek most</a></p>
       <p>Kérdés esetén írj nekünk: <a href="mailto:${EVENT.contact.email}">${EVENT.contact.email}</a></p>`,
  });
  return true;
}
