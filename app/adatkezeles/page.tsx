import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PrivacyNoticeContent } from "@/components/privacy-notice-content";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { DEFAULT_PRIVACY_NOTICE } from "@/lib/privacy-notice";

export const dynamic = "force-dynamic";

// Renders whatever D/Miki last published from the /admin "Adatkezelés" tab
// (privacy_notice.published_text). Until they publish for the first time —
// or if Supabase isn't configured on this environment — this falls back to
// the drafted text in lib/privacy-notice.ts, same text as the admin tab
// starts with, so the route is never blank.
export default async function PrivacyPage() {
  const admin = getSupabaseAdmin();
  const { data } = admin
    ? await admin.from("privacy_notice").select("published_text").eq("locale", "hu").maybeSingle()
    : { data: null };
  const text = data?.published_text || DEFAULT_PRIVACY_NOTICE.hu;
  const isDraft = !data?.published_text;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Vissza a főoldalra
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-6 p-8 text-sm text-foreground/90">
          <div>
            <h1 className="text-2xl font-bold">Adatkezelési tájékoztató</h1>
            {isDraft && (
              <p className="mt-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-foreground">
                Ez a tájékoztató még tervezet. A [KITÖLTENDŐ] jelölésű részeket a szervező tölti ki
                végleges adatokkal, a többi szöveget pedig átnézi, mielőtt ez hivatalos
                adatkezelési tájékoztatóvá válik.
              </p>
            )}
          </div>

          <PrivacyNoticeContent text={text} />

          <Button asChild variant="secondary" className="self-start">
            <Link href="/">Vissza a főoldalra</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
