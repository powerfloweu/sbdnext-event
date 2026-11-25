import { EVENT } from "@/config/event";
import { getStripe } from "@/lib/stripe";
import type { RegistrationLocale } from "@/lib/validation/registration";

// Shared with app/api/registration/[id]/pay/route.ts (self-service "pay now"
// link for an already-stored pending_payment registration), so a fresh
// checkout session always looks the same whether it's created at the end of
// the wizard or from a reminder e-mail.
export interface CheckoutSessionParams {
  registrationId: string;
  email: string;
  entryFee: number;
  wantsShirt: boolean;
  premiumMedia: boolean;
  premiumMediaFee: number;
  currency: "HUF" | "EUR";
  locale: RegistrationLocale;
  inviteCode: string | null;
}

export async function createCheckoutSession(params: CheckoutSessionParams): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const currency = params.currency.toLowerCase();
  const entryName =
    params.locale === "en"
      ? params.wantsShirt
        ? "SBD Next 2 — entry + shirt"
        : "SBD Next 2 — entry"
      : params.wantsShirt
        ? "SBD Next 2 — nevezés + póló"
        : "SBD Next 2 — nevezés";

  const lineItems = [
    {
      quantity: 1,
      price_data: {
        currency,
        unit_amount: params.entryFee * 100, // both HUF and EUR are charged as a two-decimal amount on this account
        product_data: { name: entryName },
      },
    },
  ];
  if (params.premiumMedia) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: params.premiumMediaFee * 100,
        product_data: {
          name: params.locale === "en" ? "SBD Next 2 — Premium media package" : "SBD Next 2 — Prémium média csomag",
        },
      },
    });
  }

  const koszonjukPath = params.locale === "en" ? "/en/nevezes/koszonjuk" : "/nevezes/koszonjuk";
  const megszakitvaPath = params.locale === "en" ? "/en/nevezes/megszakitva" : "/nevezes/megszakitva";
  // The invite code only lives in the URL, not in any cookie/session, so it
  // has to be carried through the cancel redirect too — otherwise "try
  // payment again" on the EN cancelled page would bounce an invited athlete
  // back into the "registration hasn't started yet" notice.
  const codeQuery = params.inviteCode ? `&code=${encodeURIComponent(params.inviteCode)}` : "";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: params.email,
    client_reference_id: params.registrationId,
    metadata: { registrationId: params.registrationId },
    success_url: `${EVENT.siteUrl}${koszonjukPath}?rid=${params.registrationId}`,
    cancel_url: `${EVENT.siteUrl}${megszakitvaPath}?rid=${params.registrationId}${codeQuery}`,
  });

  return session.url;
}
