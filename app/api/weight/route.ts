import { NextRequest, NextResponse } from "next/server";
import { weightSchema } from "@/lib/validation/weight";

const WEBHOOK_URL = process.env.WEIGHT_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = weightSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, weight, registrationId } = parsed.data;
  const payload = {
    timestamp: new Date().toISOString(),
    name,
    email,
    weight: Number(weight.replace(",", ".")),
    registrationId: registrationId || undefined,
    page: "/weight",
  };

  if (!WEBHOOK_URL) {
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`webhook status ${res.status}`);
  } catch (err) {
    console.error("weight webhook failed:", err);
    return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
