"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_TEST_COOKIE } from "@/lib/admin-test";
import { sendPaymentConfirmedEmail, sendRegistrationReceivedEmail, summaryFromRow } from "@/lib/email";
import { EVENT } from "@/config/event";
import { DEFAULT_PRIVACY_NOTICE, type PrivacyLocale } from "@/lib/privacy-notice";

const REGISTRATION_STATUSES = ["pending_payment", "waitlist", "paid", "cancelled"] as const;
type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

function isRegistrationStatus(value: unknown): value is RegistrationStatus {
  return typeof value === "string" && (REGISTRATION_STATUSES as readonly string[]).includes(value);
}

// Lets an admin flip a registration's status by hand from the dashboard
// table (e.g. mark a bank-transfer payment as "paid", or cancel a no-show).
// Stripe's webhook remains the normal path for card payments; this is the
// manual override for everything else.
export async function updateRegistrationStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  const status = formData.get("status");
  const redirectTo = formData.get("redirectTo");

  if (typeof id !== "string" || !id || !isRegistrationStatus(status)) {
    throw new Error("Érvénytelen kérés.");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error("Supabase nincs beállítva.");
  }

  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "paid") update.paid_at = new Date().toISOString();

  const { error } = await admin.from("registrations").update(update).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");

  if (typeof redirectTo === "string" && redirectTo.startsWith("/admin")) {
    redirect(redirectTo);
  }
}

// Manual re-send for a single registration — e.g. a registration whose
// confirmation e-mail went out in the wrong language because of the
// legacy Make.com webhook email (see project thread 2026-11-05), or that
// bounced. Re-derives the e-mail entirely from the stored row (locale,
// currency, status) so it always matches what a fresh submission would
// get — never trusts anything from the client beyond the id.
export async function resendRegistrationEmail(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  const redirectTo = formData.get("redirectTo");
  if (typeof id !== "string" || !id) {
    throw new Error("Érvénytelen kérés.");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error("Supabase nincs beállítva.");
  }

  const { data: registration, error } = await admin
    .from("registrations")
    .select(
      "id, email, first_name, last_name, status, total_fee, currency, locale, edit_token, division, sex, birth_year, club, bodyweight, opener_squat, opener_bench, opener_deadlift, wants_shirt, shirt_cut, shirt_size, premium_media"
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !registration) {
    throw new Error(error?.message ?? "A nevezés nem található.");
  }

  const currency: "HUF" | "EUR" = registration.currency === "EUR" ? "EUR" : "HUF";
  const locale: "hu" | "en" = registration.locale === "en" ? "en" : "hu";
  const editUrl = registration.edit_token
    ? `${EVENT.siteUrl}/nevezes/szerkesztes/${id}?token=${registration.edit_token}`
    : undefined;

  if (registration.status === "paid") {
    await sendPaymentConfirmedEmail({
      email: registration.email,
      firstName: registration.first_name,
      totalFee: registration.total_fee,
      currency,
      locale,
      editUrl,
      summary: summaryFromRow(registration),
    });
  } else {
    await sendRegistrationReceivedEmail({
      email: registration.email,
      firstName: registration.first_name,
      waitlisted: registration.status === "waitlist",
      totalFee: registration.total_fee,
      currency,
      locale,
      editUrl: editUrl ?? `${EVENT.siteUrl}/nevezes`,
      summary: summaryFromRow(registration),
    });
  }

  revalidatePath("/admin");
  if (typeof redirectTo === "string" && redirectTo.startsWith("/admin")) {
    redirect(redirectTo);
  }
}

// Admin-test mode: lets an allowlisted admin walk through the real
// /nevezes wizard before the public opening (see lib/admin-test.ts). A
// 4-hour cookie is enough for one walkthrough session without leaving a
// stray state lying around.
const ADMIN_TEST_COOKIE_MAX_AGE_SECONDS = 4 * 60 * 60;

export async function startAdminTest(): Promise<void> {
  await requireAdmin();

  const jar = await cookies();
  jar.set(ADMIN_TEST_COOKIE, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TEST_COOKIE_MAX_AGE_SECONDS,
  });

  redirect("/nevezes");
}

export async function stopAdminTest(): Promise<void> {
  await requireAdmin();

  const jar = await cookies();
  jar.delete(ADMIN_TEST_COOKIE);

  revalidatePath("/admin");
  redirect("/admin");
}

// Simulates a successful Stripe payment for a test registration — the
// connected Stripe account has no test mode, so admin-test submissions
// never reach real Checkout (see app/api/register/route.ts) and this is
// how Miki/D can still see the real "paid" admin state and the real
// payment-confirmation e-mail. Restricted to is_preview_test rows so it can
// never be used to wave through a real registration without payment.
export async function simulateTestPayment(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  const redirectTo = formData.get("redirectTo");
  if (typeof id !== "string" || !id) {
    throw new Error("Érvénytelen kérés.");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error("Supabase nincs beállítva.");
  }

  const { data: registration, error: fetchError } = await admin
    .from("registrations")
    .select(
      "id, email, first_name, last_name, total_fee, status, edit_token, is_preview_test, locale, currency, division, sex, birth_year, club, bodyweight, opener_squat, opener_bench, opener_deadlift, wants_shirt, shirt_cut, shirt_size, premium_media"
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !registration) {
    throw new Error(fetchError?.message ?? "A nevezés nem található.");
  }
  if (!registration.is_preview_test) {
    throw new Error("Csak teszt nevezésnél szimulálható a fizetés.");
  }

  if (registration.status !== "paid") {
    const { error: updateError } = await admin
      .from("registrations")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) {
      throw new Error(updateError.message);
    }

    try {
      await sendPaymentConfirmedEmail({
        email: registration.email,
        firstName: registration.first_name,
        totalFee: registration.total_fee,
        currency: registration.currency === "EUR" ? "EUR" : "HUF",
        locale: registration.locale === "en" ? "en" : "hu",
        editUrl: registration.edit_token
          ? `${EVENT.siteUrl}/nevezes/szerkesztes/${id}?token=${registration.edit_token}`
          : undefined,
        summary: summaryFromRow(registration),
      });
      await admin.from("registrations").update({ payment_email_sent_at: new Date().toISOString() }).eq("id", id);
    } catch (err) {
      console.error("admin-test payment confirmation email failed:", err);
    }
  }

  revalidatePath("/admin");
  if (typeof redirectTo === "string" && redirectTo.startsWith("/admin")) {
    redirect(redirectTo);
  }
}

function isPrivacyLocale(value: unknown): value is PrivacyLocale {
  return value === "hu" || value === "en";
}

// Who to credit on a draft save/publish — the allowlisted admin's own
// Supabase-auth e-mail (D or Miki, see config/admin.ts), not something the
// client could spoof via the form.
async function currentAdminEmail(): Promise<string | null> {
  const auth = await getSupabaseServerAuth();
  const {
    data: { user },
  } = await auth.auth.getUser();
  return user?.email ?? null;
}

// Saves a working edit to the privacy notice draft (and the shared note
// D/Miki use to flag something for each other) from the /admin "Adatkezelés"
// tab. Never touches published_text — the public pages only change once
// publishPrivacyNotice runs.
export async function savePrivacyNoticeDraft(formData: FormData): Promise<void> {
  await requireAdmin();

  const locale = formData.get("locale");
  const draftText = formData.get("draftText");
  const note = formData.get("note");
  if (!isPrivacyLocale(locale) || typeof draftText !== "string" || !draftText.trim()) {
    throw new Error("Érvénytelen kérés.");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error("Supabase nincs beállítva.");
  }

  const email = await currentAdminEmail();
  // Upsert, not update: the table may hold no row yet for this locale (e.g.
  // the migration's seed INSERT wasn't run, only the CREATE TABLE), in
  // which case an update() would silently affect zero rows and the save
  // would look like it worked while doing nothing.
  const { error } = await admin.from("privacy_notice").upsert(
    {
      locale,
      draft_text: draftText,
      note: typeof note === "string" ? note : null,
      updated_by: email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "locale" }
  );
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

// Copies the current draft onto published_text, which is the only thing
// app/adatkezeles and app/en/adatkezeles ever render — so the public page
// only changes when D or Miki explicitly click "Közzététel", never on every
// draft save.
export async function publishPrivacyNotice(formData: FormData): Promise<void> {
  await requireAdmin();

  const locale = formData.get("locale");
  if (!isPrivacyLocale(locale)) {
    throw new Error("Érvénytelen kérés.");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error("Supabase nincs beállítva.");
  }

  const { data: row, error: fetchError } = await admin
    .from("privacy_notice")
    .select("draft_text")
    .eq("locale", locale)
    .maybeSingle();
  if (fetchError) {
    throw new Error(fetchError.message);
  }
  // No row yet (e.g. publishing before ever saving a draft on this
  // environment) — fall back to the same code-level default the public
  // page would otherwise be showing, so "Közzététel" always has something
  // to publish instead of erroring.
  const draftText = row?.draft_text ?? DEFAULT_PRIVACY_NOTICE[locale];

  const email = await currentAdminEmail();
  const { error } = await admin
    .from("privacy_notice")
    .upsert(
      {
        locale,
        draft_text: draftText,
        published_text: draftText,
        published_by: email,
        published_at: new Date().toISOString(),
      },
      { onConflict: "locale" }
    );
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/adatkezeles");
  revalidatePath("/en/adatkezeles");
}
