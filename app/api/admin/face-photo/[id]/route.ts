import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

// Lets an admin view a single athlete's face photo from the dashboard
// table without making the private athlete-face-photos bucket public —
// generates a short-lived signed URL and redirects to it. See the bulk
// ZIP export (app/api/admin/export/face-photos) for the Excire Photo
// import workflow; this is just the one-off "open this one" link.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase nincs beállítva." }, { status: 500 });
  }

  const { id } = await params;
  const { data: registration, error } = await admin
    .from("registrations")
    .select("face_photo_path")
    .eq("id", id)
    .maybeSingle();

  if (error || !registration?.face_photo_path) {
    return NextResponse.json({ error: "Nincs arcfotó ehhez a nevezéshez." }, { status: 404 });
  }

  const { data: signed, error: signError } = await admin.storage
    .from("athlete-face-photos")
    .createSignedUrl(registration.face_photo_path, 60);

  if (signError || !signed) {
    return NextResponse.json({ error: signError?.message ?? "Nem sikerült aláírt linket készíteni." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
