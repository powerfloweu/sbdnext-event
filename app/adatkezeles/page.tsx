import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EVENT } from "@/config/event";

// Placeholder — the organiser has not yet supplied the final privacy notice
// text (see docs/UI_UX_ROBUSTNESS_PLAN.md section 9, open question 3). This
// page exists so the route and every link to it (footer, registration
// consent checkbox) resolve to something real rather than a 404.
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Vissza a főoldalra
      </Link>
      <Card>
        <CardContent className="flex flex-col gap-4 p-8 text-sm text-foreground/90">
          <h1 className="text-2xl font-bold">Adatkezelési tájékoztató</h1>
          <p className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-foreground">
            Ez az oldal egyelőre helykitöltő. A végleges adatkezelési tájékoztató szövegét a
            szervező adja meg — addig ne tekintsd ezt hivatalos tájékoztatásnak.
          </p>
          <p>
            A nevezés és az önkéntes jelentkezés során megadott adatokat (név, e-mail cím,
            születési év, testsúly, nevezési súlyok, póló adatok) kizárólag a verseny
            szervezéséhez, a beosztás elkészítéséhez és a kapcsolattartáshoz használjuk fel.
          </p>
          <p>
            Kérdés esetén írj nekünk:{" "}
            <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
              {EVENT.contact.email}
            </a>
          </p>
          <Button asChild variant="secondary" className="self-start">
            <Link href="/">Vissza a főoldalra</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
