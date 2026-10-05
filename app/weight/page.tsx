"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/forms/field";
import { EVENT } from "@/config/event";
import { weightSchema, type WeightInput } from "@/lib/validation/weight";

function WeightFormInner() {
  const searchParams = useSearchParams();
  const prefillName = searchParams.get("name") ?? "";
  const prefillEmail = searchParams.get("email") ?? "";
  const registrationId = searchParams.get("rid") ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<WeightInput>({
    resolver: zodResolver(weightSchema),
    defaultValues: { name: prefillName, email: prefillEmail, weight: "", registrationId },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError("root", {
          message: "A beküldés nem sikerült. Próbáld újra, vagy írj nekünk e-mailt.",
        });
      }
    } catch {
      setError("root", {
        message: "A beküldés nem sikerült. Próbáld újra, vagy írj nekünk e-mailt.",
      });
    }
  });

  if (isSubmitSuccessful && !errors.root) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-2 p-6 text-center">
          <p className="font-semibold text-foreground">Köszönjük, a testsúlyod rögzítettük.</p>
          <p className="text-xs text-muted-foreground">
            Ha még nem kaptál e-mailt arról, hogy a fizetés is rendben van, megnyugodhatsz — a
            nevezésed végleges.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ha elírást vettél észre, írj nekünk:{" "}
            <a href={`mailto:${EVENT.contact.email}`} className="text-primary underline">
              {EVENT.contact.email}
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Tervezett testsúly megadása</h1>
          <p className="text-xs text-muted-foreground">
            A beosztás miatt fontos, hogy lássuk, milyen testsúlyra készülsz. Add meg ±3 kg
            pontossággal.
          </p>
        </div>

        {errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <span>{errors.root.message}</span>
          </Alert>
        )}

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Field id="w-name" label="Név" required error={errors.name?.message}>
                <Input id="w-name" readOnly={Boolean(prefillName)} {...field} />
              </Field>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Field id="w-email" label="E-mail" required error={errors.email?.message}>
                <Input id="w-email" type="email" readOnly={Boolean(prefillEmail)} {...field} />
              </Field>
            )}
          />
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <Field id="w-weight" label="Tervezett testsúly" required hint="pl. 83" error={errors.weight?.message}>
                <div className="relative">
                  <Input id="w-weight" inputMode="decimal" {...field} />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    kg
                  </span>
                </div>
              </Field>
            )}
          />
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Beküldés…" : "Testsúly beküldése"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function WeightPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Suspense
        fallback={
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Betöltés…
            </CardContent>
          </Card>
        }
      >
        <WeightFormInner />
      </Suspense>
    </main>
  );
}
