import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PrivacyNoticeContent } from "@/components/privacy-notice-content";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { unpublishedPlaceholder } from "@/lib/privacy-notice";
import { EVENT } from "@/config/event";

export const dynamic = "force-dynamic";

// Renders whatever D/Miki last published from the /admin "Adatkezelés" tab
// (privacy_notice.published_text). Until they publish for the first time —
// or if Supabase isn't configured on this environment — this shows the
// original short placeholder, not the detailed [KITÖLTENDŐ] draft the admin
// tab starts with: that draft is for D/Miki to review privately and only
// reaches real visitors once they click "Közzététel".
export default async function PrivacyPage() {
  const admin = getSupabaseAdmin();
  const { data } = admin
    ? await admin.from("privacy_notice").select("published_text").eq("locale", "hu").maybeSingle()
    : { data: null };
  const text = data?.published_text || unpublishedPlaceholder("hu", EVENT.contact.email);

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
          <h1 className="text-2xl font-bold">Adatkezelési tájékoztató</h1>

          <PrivacyNoticeContent text={text} />

          <Button asChild variant="secondary" className="self-start">
            <Link href="/">Vissza a főoldalra</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
