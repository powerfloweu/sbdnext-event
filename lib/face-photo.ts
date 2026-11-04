import type { SupabaseClient } from "@supabase/supabase-js";

// Shared between the initial registration (app/api/register/route.ts) and
// the self-service edit link (app/api/registration/[id]/route.ts) — a face
// photo can be added either at registration time or later, since it's
// optional (D, 2026-10-30).

// Face photos are compressed client-side to a small JPEG before this ever
// runs (see lib/client-image.ts), so this is a safety cap, not the primary
// size control.
const MAX_FACE_PHOTO_BYTES = 8 * 1024 * 1024;

export async function uploadFacePhoto(
  admin: SupabaseClient,
  registrationId: string,
  dataUrl: string
): Promise<string | null> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_FACE_PHOTO_BYTES) return null;

  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `${registrationId}.${ext}`;

  const { error } = await admin.storage.from("athlete-face-photos").upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });
  if (error) {
    console.error("face photo upload failed:", error);
    return null;
  }
  return path;
}
