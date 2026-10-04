"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

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
