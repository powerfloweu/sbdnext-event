import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendNotifySignupConfirmedEmail } from "@/lib/email";

// One-click subscribe link for the GMass newsletter (sent from
// powerlifting@sbdnext.hu to people who competed at SBD Next 1):
// sbdnext.hu/api/notify/subscribe?email={{email}} — GMass fills in the
// merge tag per recipient. A GET (not a form POST) on purpose: it has to
// work as a plain link inside an email client. Lands on /hirlevel/koszonjuk,
// which asks the optional "how could we be even better" question — every
// recipient of that newsletter is by definition a past competitor, so there
// is nothing to gate here.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(new URL("/hirlevel/koszonjuk?error=email", req.url));
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin
      .from("notify_signups")
      .upsert({ email, locale: "hu", source: "newsletter" }, { onConflict: "email", ignoreDuplicates: false });
    if (error) {
      console.error("newsletter subscribe upsert failed:", error);
    }
  }

  try {
    await sendNotifySignupConfirmedEmail(email, "hu");
  } catch (err) {
    console.error("newsletter subscribe confirmation email failed:", err);
  }

  return NextResponse.redirect(new URL(`/hirlevel/koszonjuk?email=${encodeURIComponent(email)}`, req.url));
}
