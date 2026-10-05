import Link from "next/link";
import { ArrowLeft, HandHeart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { VolunteerForm } from "@/components/volunteer-form";
import { volunteersOpen } from "@/lib/phase";

export const revalidate = 60;

export default function VolunteersPage() {
  const open = volunteersOpen();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Vissza a főoldalra
        </Link>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <HandHeart className="size-5 text-primary" aria-hidden="true" />
              <span className="eyebrow">Önkéntes jelentkezés</span>
            </div>

            {open ? (
              <>
                <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 p-4 text-center text-sm font-semibold text-foreground">
                  Önkénteseknek étel-ital és póló jár!
                </div>
                <p className="mb-2 text-sm text-foreground">
                  Köszönjük, hogy segítenél a verseny lebonyolításában! Válaszd ki, milyen
                  pozícióban dolgoznál, és add meg a póló adataidat.
                </p>
                <p className="mb-6 text-xs text-muted-foreground">
                  A jelentkezéseket visszaigazoljuk, és e-mailben küldjük a további részleteket.
                </p>
                <VolunteerForm />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Az önkéntes jelentkezés januárban indul, közelebb a versenyhez. Nézz vissza akkor,
                vagy kövesd az Instagramot a friss infókért.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
