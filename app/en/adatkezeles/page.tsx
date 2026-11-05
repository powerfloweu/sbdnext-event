import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PrivacyNoticeContent } from "@/components/privacy-notice-content";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { unpublishedPlaceholder } from "@/lib/privacy-notice";
import { EVENT } from "@/config/event";

export const dynamic = "force-dynamic";

// English counterpart of app/adatkezeles/page.tsx — see there for what this
// reads and why it falls back to the short placeholder, not the detailed
// draft, until D/Miki publish.
export default async function PrivacyPageEn() {
  const admin = getSupabaseAdmin();
  const { data } = admin
    ? await admin.from("privacy_notice").select("published_text").eq("locale", "en").maybeSingle()
    : { data: null };
  const text = data?.published_text || unpublishedPlaceholder("en", EVENT.contact.email);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/en"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-6 p-8 text-sm text-foreground/90">
          <h1 className="text-2xl font-bold">Privacy notice</h1>

          <PrivacyNoticeContent text={text} />

          <Button asChild variant="secondary" className="self-start">
            <Link href="/en">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
