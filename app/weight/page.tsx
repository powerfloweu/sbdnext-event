"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEIGHT_WEBHOOK_URL!;

export default function WeightPage() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("registrationId");

  const [weight, setWeight] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  if (!registrationId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
        <Card className="w-full border-red-900/60 bg-black/80 text-red-50">
          <CardHeader>
            <CardTitle className="text-lg">
              Hiányzó azonosító
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-100/80">
              A testsúly megadásához egyedi hivatkozás szükséges.
              Kérjük, az e-mailben kapott linkre kattints, vagy vedd fel velünk
              a kapcsolatot:{" "}
              <a
                href="mailto:powerlifting@sbdnext.hu"
                className="underline underline-offset-4"
              >
                powerlifting@sbdnext.hu
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = weight.trim().replace(",", ".");
    const numeric = Number(trimmed);

    if (!trimmed || Number.isNaN(numeric) || numeric <= 0) {
      setStatus("error");
      setMessage("Kérlek, valós testsúlyt adj meg kg-ban (pl. 83).");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          weight: numeric,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setStatus("success");
      setMessage(
        "Köszönjük! A megadott testsúlyt rögzítettük. Ha több mint 1-2 napon belül új értéket szeretnél, elég válaszolni az e-mailre.",
      );
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(
        "Valami hiba történt a mentés közben. Próbáld meg pár perc múlva újra, vagy írj nekünk: powerlifting@sbdnext.hu.",
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
      <Card className="w-full border-red-900/60 bg-black/80 text-red-50 shadow-xl shadow-red-950/40">
        <CardHeader>
          <CardTitle className="text-xl">
            Tervezett testsúly megadása
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-red-100/80">
            A kategóriabeosztás miatt kérjük, add meg a{" "}
            <span className="font-semibold">versenyen tervezett testsúlyodat</span>{" "}
            kg-ban. Nyugodtan gondolkodj kb. <span className="font-semibold">±3 kg</span>-os
            tartományban.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-red-200/80">
                Testsúly (kg)
              </label>
              <Input
                inputMode="decimal"
                className="border-red-700/80 bg-black/70 text-red-50 placeholder:text-red-400/60"
                placeholder="pl. 83"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
              <p className="mt-1 text-[11px] text-red-200/70">
                A megadott testsúly alapján osztunk be kategóriába. 
                Későbbi kisebb módosítás nem gond.
              </p>
            </div>

            {message && (
              <div
                className={cn(
                  "rounded-md border px-3 py-2 text-xs",
                  status === "success"
                    ? "border-green-600/70 bg-green-900/40 text-green-100"
                    : "border-red-700/80 bg-red-950/70 text-red-100",
                )}
              >
                {message}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-red-600 text-white hover:bg-red-500"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Mentés..."
                  : "Testsúly mentése"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}