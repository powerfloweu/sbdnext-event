import { NextRequest, NextResponse } from "next/server";
import { volunteerSchema } from "@/lib/validation/volunteer";

// Server-side now (fixes finding C6: the old client code counted any
// completed fetch — including a 4xx/5xx response — as success via
// Promise.allSettled). Configure via env vars, not NEXT_PUBLIC_*, since the
// URLs no longer need to reach the browser.
const WEBHOOKS = [process.env.VOLUNTEER_WEBHOOK_URL, process.env.VOLUNTEER_MAKE_WEBHOOK_URL].filter(
  (u): u is string => Boolean(u)
);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof body === "object" && body !== null && "honeypot" in body) {
    const hp = (body as Record<string, unknown>).honeypot;
    if (typeof hp === "string" && hp.length > 0) {
      return NextResponse.json({ ok: true });
    }
  }

  const parsed = volunteerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, position, shirtCut, shirtSize } = parsed.data;
  const payload = {
    timestamp: new Date().toISOString(),
    name,
    email,
    days: ["2027-02-13"],
    position,
    shirtCut,
    shirtSize,
  };

  if (WEBHOOKS.length === 0) {
    // No webhook configured for this deployment (e.g. a preview build) —
    // accept without forwarding rather than failing the demo.
    return NextResponse.json({ ok: true, demo: true });
  }

  const results = await Promise.allSettled(
    WEBHOOKS.map((url) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`webhook status ${res.status}`);
        return res;
      })
    )
  );

  const anySuccess = results.some((r) => r.status === "fulfilled");
  if (!anySuccess) {
    console.error("volunteer webhook(s) failed:", results);
    return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
