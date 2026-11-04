"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import { ADMIN_TEST_COOKIE } from "@/lib/admin-test";
import { sendPaymentConfirmedEmail } from "@/lib/email";
import { EVENT } from "@/config/event";

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
    .select("id, email, first_name, total_fee, status, edit_token, is_preview_test")
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
        editUrl: registration.edit_token
          ? `${EVENT.siteUrl}/nevezes/szerkesztes/${id}?token=${registration.edit_token}`
          : undefined,
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
