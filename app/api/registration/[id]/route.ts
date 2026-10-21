import { NextRequest, NextResponse } from "next/server";

import { EVENT } from "@/config/event";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { registrationEditSchema } from "@/lib/validation/registration-edit";

// Self-service edit link: no login, just the per-registration edit_token
// mailed to the athlete. Rate-limited the same way as /api/register and
// /api/prior-registration — a token is unguessable, but this still caps
// brute-force attempts against a leaked/guessed id.
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function editWindow() {
  const now = Date.now();
  return {
    allFieldsOpen: now <= new Date(EVENT.registration.editClosesAt).getTime(),
    shirtOpen: now <= new Date(EVENT.registration.shirtEditClosesAt).getTime(),
  };
}

const SELECT_FIELDS =
  "id, edit_token, status, last_name, first_name, birth_year, sex, division, club, bodyweight, opener_squat, opener_bench, opener_deadlift, mc_text, notes, wants_shirt, shirt_cut, shirt_size";

async function loadByToken(id: string, token: string) {
  const admin = getSupabaseAdmin();
  if (!admin) return { admin: null, registration: null };

  const { data, error } = await admin.from("registrations").select(SELECT_FIELDS).eq("id", id).maybeSingle();
  if (error || !data || !data.edit_token || data.edit_token !== token) {
    return { admin, registration: null };
  }
  return { admin, registration: data };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { registration } = await loadByToken(id, token);
  if (!registration) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { allFieldsOpen, shirtOpen } = editWindow();

  return NextResponse.json({
    ok: true,
    allFieldsOpen,
    shirtOpen,
    data: {
      lastName: registration.last_name,
      firstName: registration.first_name,
      birthYear: String(registration.birth_year),
      sex: registration.sex,
      division: registration.division,
      club: registration.club ?? "",
      bodyweight: String(registration.bodyweight ?? ""),
      openerSquat: String(registration.opener_squat ?? ""),
      openerBench: String(registration.opener_bench ?? ""),
      openerDeadlift: String(registration.opener_deadlift ?? ""),
      mcText: registration.mc_text ?? "",
      notes: registration.notes ?? "",
      wantsShirt: registration.wants_shirt,
      shirtCut: registration.shirt_cut ?? undefined,
      shirtSize: registration.shirt_size ?? undefined,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const token = typeof (body as Record<string, unknown>)?.token === "string" ? (body as Record<string, unknown>).token as string : "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { admin, registration } = await loadByToken(id, token);
  if (!admin || !registration) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { allFieldsOpen, shirtOpen } = editWindow();
  if (!allFieldsOpen) {
    return NextResponse.json({ ok: false, error: "edit_closed" }, { status: 403 });
  }

  const parsed = registrationEditSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ ok: false, error: "validation", fieldErrors }, { status: 400 });
  }
  const data = parsed.data;

  const update: Record<string, unknown> = {
    last_name: data.lastName.trim(),
    first_name: data.firstName.trim(),
    birth_year: Number(data.birthYear),
    sex: data.sex,
    division: data.division,
    club: data.club || null,
    bodyweight: Number(data.bodyweight.replace(",", ".")),
    opener_squat: Number(data.openerSquat.replace(",", ".")),
    opener_bench: Number(data.openerBench.replace(",", ".")),
    opener_deadlift: Number(data.openerDeadlift.replace(",", ".")),
    mc_text: data.mcText || null,
    notes: data.notes || null,
    updated_at: new Date().toISOString(),
  };

  // Shirt cut/size only change if the athlete already opted into a shirt —
  // this endpoint never flips wants_shirt itself, since that changes the
  // fee already charged via Stripe.
  if (registration.wants_shirt) {
    if (!shirtOpen) {
      // Outside the shirt window: silently keep whatever was submitted for
      // every other field, but never touch shirt_cut/shirt_size.
    } else {
      update.shirt_cut = data.shirtCut ?? null;
      update.shirt_size = data.shirtSize ?? null;
    }
  }

  const { error } = await admin.from("registrations").update(update).eq("id", id);
  if (error) {
    console.error("registration self-edit failed:", error);
    return NextResponse.json({ ok: false, error: "storage" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
