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
    .select(
      "created_at, status, last_name, first_name, email, birth_year, division, sex, club, bodyweight, opener_squat, opener_bench, opener_deadlift, mc_text, notes, wants_shirt, shirt_cut, shirt_size, premium_media, entry_fee, total_fee, utm, paid_at"
    )
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
    [
      "Beérkezett",
      "Státusz",
      "Vezetéknév",
      "Keresztnév",
      "E-mail",
      "Szül. év",
      "Kategória",
      "Nem",
      "Klub",
      "Testsúly",
      "Nyitó guggolás",
      "Nyitó fekvenyomás",
      "Nyitó felhúzás",
      "Nyitó total",
      "MC szöveg",
      "Megjegyzés",
      "Kér pólót",
      "Póló fazon",
      "Póló méret",
      "Prémium média",
      "Nevezési díj",
      "Összeg",
      "UTM",
      "Fizetve",
    ],
    (data ?? []).map((r) => {
      const openerTotal =
        r.opener_squat !== null && r.opener_bench !== null && r.opener_deadlift !== null
          ? r.opener_squat + r.opener_bench + r.opener_deadlift
          : "";
      return [
        r.created_at,
        r.status,
        r.last_name,
        r.first_name,
        r.email,
        r.birth_year,
        r.division,
        r.sex,
        r.club ?? "",
        r.bodyweight,
        r.opener_squat,
        r.opener_bench,
        r.opener_deadlift,
        openerTotal,
        r.mc_text ?? "",
        r.notes ?? "",
        r.wants_shirt ? "igen" : "nem",
        r.shirt_cut ?? "",
        r.shirt_size ?? "",
        r.premium_media ? "igen" : "nem",
        r.entry_fee,
        r.total_fee,
        r.utm ?? "",
        r.paid_at ?? "",
      ];
    })
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nevezesek-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
