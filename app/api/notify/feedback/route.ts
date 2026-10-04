import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { notifyFeedbackSchema } from "@/lib/validation/notify";

// Optional "how could we be even better" answer from /hirlevel/koszonjuk,
// attached to the matching notify_signups row by email. Degrades gracefully
// without Supabase configured, same as the rest of app/api/notify.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = notifyFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin
      .from("notify_signups")
      .update({ feedback_text: parsed.data.feedback, feedback_at: new Date().toISOString() })
      .eq("email", email);
    if (error) {
      console.error("notify feedback update failed:", error);
      return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true, demo: !admin });
}
