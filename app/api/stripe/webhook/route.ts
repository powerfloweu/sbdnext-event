import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendPaymentConfirmedEmail } from "@/lib/email";

export const runtime = "nodejs";

// Registers a registration as paid once Stripe confirms the Checkout
// Session, and sends the payment-confirmation email. This is the other
// half of app/api/register/route.ts's createCheckoutSession.
//
// Needs, once real Stripe access is available:
//   1. STRIPE_SECRET_KEY (same as app/api/register/route.ts)
//   2. A webhook registered in the Stripe dashboard pointing at
//      <deployed-url>/api/stripe/webhook, listening for
//      checkout.session.completed (and async_payment_succeeded for
//      delayed payment methods) — its signing secret goes in
//      STRIPE_WEBHOOK_SECRET.
// Until both are set this route safely 400s on every request (no way to
// verify a signature without the secret), which is expected — Stripe won't
// be sending anything here yet either.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ ok: true, skipped: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const registrationId = session.client_reference_id ?? session.metadata?.registrationId;
  if (!registrationId) {
    console.error("Stripe webhook: checkout session has no registrationId", session.id);
    return NextResponse.json({ ok: false, error: "missing_registration_id" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("Stripe webhook received but Supabase isn't configured; cannot mark as paid.");
    return NextResponse.json({ ok: false, error: "storage_not_configured" }, { status: 503 });
  }

  const { data: registration, error: fetchError } = await admin
    .from("registrations")
    .select("id, email, first_name, total_fee, status")
    .eq("id", registrationId)
    .maybeSingle();

  if (fetchError || !registration) {
    console.error("Stripe webhook: registration not found", registrationId, fetchError);
    return NextResponse.json({ ok: false, error: "registration_not_found" }, { status: 404 });
  }

  if (registration.status !== "paid") {
    const { error: updateError } = await admin
      .from("registrations")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      })
      .eq("id", registrationId);

    if (updateError) {
      console.error("Stripe webhook: failed to mark registration paid", updateError);
      return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
    }

    try {
      await sendPaymentConfirmedEmail({
        email: registration.email,
        firstName: registration.first_name,
        totalFee: registration.total_fee,
      });
      await admin
        .from("registrations")
        .update({ payment_email_sent_at: new Date().toISOString() })
        .eq("id", registrationId);
    } catch (err) {
      console.error("payment confirmation email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
