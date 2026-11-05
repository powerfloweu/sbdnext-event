import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PrivacyNoticeContent } from "@/components/privacy-notice-content";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { DEFAULT_PRIVACY_NOTICE } from "@/lib/privacy-notice";

export const dynamic = "force-dynamic";

// English counterpart of app/adatkezeles/page.tsx — see there for what this
// reads and why it falls back to the drafted default text.
export default async function PrivacyPageEn() {
  const admin = getSupabaseAdmin();
  const { data } = admin
    ? await admin.from("privacy_notice").select("published_text").eq("locale", "en").maybeSingle()
    : { data: null };
  const text = data?.published_text || DEFAULT_PRIVACY_NOTICE.en;
  const isDraft = !data?.published_text;

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
          <div>
            <h1 className="text-2xl font-bold">Privacy notice</h1>
            {isDraft && (
              <p className="mt-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-foreground">
                This notice is still a draft. The organiser will fill in the [TO FILL IN] parts
                with final details and review the rest before this becomes the official privacy
                notice. (Translation of{" "}
                <Link href="/adatkezeles" className="underline">
                  /adatkezeles
                </Link>
                .)
              </p>
            )}
          </div>

          <PrivacyNoticeContent text={text} />

          <Button asChild variant="secondary" className="self-start">
            <Link href="/en">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
