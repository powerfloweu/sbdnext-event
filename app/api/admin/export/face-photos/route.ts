import { NextResponse } from "next/server";
import { createRequire } from "node:module";
import type { Archiver, ArchiverOptions } from "archiver";
import { PassThrough, Readable } from "node:stream";

const archiver = createRequire(import.meta.url)("archiver") as (
  format: "zip",
  options?: ArchiverOptions
) => Archiver;

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-auth";

// archiver streams via Node APIs, not the Edge runtime's Web Streams.
export const runtime = "nodejs";

// Bulk export of every registered athlete's face photo, for importing into
// Excire Photo after the event (D, 2026-11-05 — see project thread
// "Külföldi nevezések ellenőrzése és admin javítás"). Photos stay private:
// this streams a ZIP straight from the athlete-face-photos bucket through
// this admin-only route, nothing is made public. Preview/admin-test rows
// are excluded, same as the main registrations list.
function slugifyName(value: string): string {
  const diacritics = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");
  const ascii = value
    .normalize("NFKD")
    .replace(diacritics, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return ascii || "nevezo";
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Nincs jogosultság." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase nincs beállítva." }, { status: 500 });
  }

  const { data: rows, error } = await admin
    .from("registrations")
    .select("id, last_name, first_name, face_photo_path")
    .eq("is_preview_test", false)
    .not("face_photo_path", "is", null)
    .returns<{ id: string; last_name: string; first_name: string; face_photo_path: string }[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const archive = archiver("zip", { zlib: { level: 9 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  (async () => {
    for (const row of rows ?? []) {
      const { data, error: downloadError } = await admin.storage
        .from("athlete-face-photos")
        .download(row.face_photo_path);
      if (downloadError || !data) {
        console.error("face photo export: download failed for", row.id, downloadError);
        continue;
      }
      const ext = row.face_photo_path.split(".").pop() ?? "jpg";
      const shortId = row.id.slice(0, 8);
      const filename = `${slugifyName(row.last_name)}_${slugifyName(row.first_name)}_${shortId}.${ext}`;
      archive.append(Buffer.from(await data.arrayBuffer()), { name: filename });
    }
    await archive.finalize();
  })().catch((err) => {
    console.error("face photo export failed:", err);
    archive.abort();
  });

  return new NextResponse(Readable.toWeb(passthrough) as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="arcfotok-${new Date().toISOString().slice(0, 10)}.zip"`,
    },
  });
}
