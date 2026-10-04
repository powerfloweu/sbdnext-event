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
  const source = searchParams.get("source");

  let query = admin
    .from("notify_signups")
    .select("created_at, email, locale, source, notified_at")
    .order("created_at", { ascending: false });

  if (source && source !== "all") {
    query = query.eq("source", source);
  }
  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    if (escaped) {
      query = query.ilike("email", `%${escaped}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv(
    ["Feliratkozott", "E-mail", "Nyelv", "Forrás", "Értesítve"],
    (data ?? []).map((r) => [r.created_at, r.email, r.locale, r.source, r.notified_at ?? ""])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feliratkozok-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
