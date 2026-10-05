import Stripe from "stripe";

// Server-only. Returns null until the organiser's STRIPE_SECRET_KEY is
// configured, so the registration flow can still be exercised end-to-end in
// "demo" mode (see app/api/register/route.ts) before real Stripe access is
// wired up.
let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cached = null;
    return cached;
  }

  cached = new Stripe(key);
  return cached;
}
