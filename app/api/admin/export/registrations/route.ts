import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase nincs beállítva." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  let query = admin
    .from("registrations")
    .select("created_at, status, last_name, first_name, email, division, sex, club, bodyweight, total_fee, paid_at")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    if (escaped) {
      query = query.or(
        `last_name.ilike.%${escaped}%,first_name.ilike.%${escaped}%,email.ilike.%${escaped}%,club.ilike.%${escaped}%`
      );
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv(
    ["Beérkezett", "Státusz", "Vezetéknév", "Keresztnév", "E-mail", "Kategória", "Nem", "Klub", "Testsúly", "Összeg", "Fizetve"],
    (data ?? []).map((r) => [
      r.created_at,
      r.status,
      r.last_name,
      r.first_name,
      r.email,
      r.division,
      r.sex,
      r.club ?? "",
      r.bodyweight,
      r.total_fee,
      r.paid_at ?? "",
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nevezesek-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
