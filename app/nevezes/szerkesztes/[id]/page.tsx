"use client";

import { use, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/forms/field";

import { EVENT } from "@/config/event";
import { registrationEditSchema, type RegistrationEditInput } from "@/lib/validation/registration-edit";

type LoadState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "ready"; allFieldsOpen: boolean; shirtOpen: boolean; wantsShirt: boolean };

export default function EditRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = use(params);
  const { token } = use(searchParams);

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationEditInput>({
    resolver: zodResolver(registrationEditSchema),
  });

  useEffect(() => {
    if (!token) {
      setState({ status: "not_found" });
      return;
    }
    fetch(`/api/registration/${id}?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setState({ status: "not_found" });
          return;
        }
        reset(json.data);
        setState({
          status: "ready",
          allFieldsOpen: json.allFieldsOpen,
          shirtOpen: json.shirtOpen,
          wantsShirt: json.data.wantsShirt,
        });
      })
      .catch(() => setState({ status: "not_found" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const onSubmit = async (data: RegistrationEditInput) => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/registration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      });
      const json = await res.json();
      setSaveState(json.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  };

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Betöltés…</div>
    );
  }

  if (state.status === "not_found") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl">Ez a link már nem érvényes</h1>
        <p className="text-sm text-muted-foreground">
          Ellenőrizd, hogy a teljes linket másoltad-e be a visszaigazoló e-mailből. Ha mégsem működik,
          írj nekünk: <a href={`mailto:${EVENT.contact.email}`} className="text-primary">{EVENT.contact.email}</a>
        </p>
      </div>
    );
  }

  if (!state.allFieldsOpen) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <Lock className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-2xl">A szerkesztési időszak lezárult</h1>
        <p className="text-sm text-muted-foreground">
          A nevezési adatok önálló módosítása 2027. január 30-ig volt lehetséges. Ha mégis változtatnod
          kell valamin, írj nekünk: <a href={`mailto:${EVENT.contact.email}`} className="text-primary">{EVENT.contact.email}</a>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
      <div className="eyebrow mb-1">SBD Next 2</div>
      <h1 className="mb-1 text-3xl">Nevezési adataid</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Itt javíthatod a nevezéskor megadott adataidat. A módosítás 2027. január 30-ig lehetséges
        {state.wantsShirt && !state.shirtOpen ? " — a pólóméret/fazon már lezárult, a rendelés leadása miatt." : "."}
      </p>

      {saveState === "saved" && (
        <Alert className="mb-5 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          Mentve.
        </Alert>
      )}
      {saveState === "error" && (
        <Alert className="mb-5 flex items-center gap-2" variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          A mentés nem sikerült, próbáld újra.
        </Alert>
      )}

      <Card>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Field id="lastName" label="Vezetéknév" required error={errors.lastName?.message}>
                    <Input id="lastName" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Field id="firstName" label="Keresztnév" required error={errors.firstName?.message}>
                    <Input id="firstName" {...field} />
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="birthYear"
                control={control}
                render={({ field }) => (
                  <Field id="birthYear" label="Születési év" required error={errors.birthYear?.message}>
                    <Input id="birthYear" inputMode="numeric" maxLength={4} {...field} />
                  </Field>
                )}
              />
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <Field id="sex" label="Nem" required error={errors.sex?.message}>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="sex">
                        <SelectValue placeholder="Válassz" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT.sexes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Controller
              name="division"
              control={control}
              render={({ field }) => (
                <Field id="division" label="Kategória" required error={errors.division?.message}>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="division">
                      <SelectValue placeholder="Válassz" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT.divisions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="club"
              control={control}
              render={({ field }) => (
                <Field id="club" label="Egyesület / Klub" hint="Nem kötelező">
                  <Input id="club" {...field} />
                </Field>
              )}
            />

            <Controller
              name="bodyweight"
              control={control}
              render={({ field }) => (
                <Field id="bodyweight" label="Tervezett testsúly (kg)" required error={errors.bodyweight?.message}>
                  <Input id="bodyweight" inputMode="decimal" {...field} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="openerSquat"
                control={control}
                render={({ field }) => (
                  <Field id="openerSquat" label="Guggolás (kg)" error={errors.openerSquat?.message}>
                    <Input id="openerSquat" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="openerBench"
                control={control}
                render={({ field }) => (
                  <Field id="openerBench" label="Fekvenyomás (kg)" error={errors.openerBench?.message}>
                    <Input id="openerBench" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
              <Controller
                name="openerDeadlift"
                control={control}
                render={({ field }) => (
                  <Field id="openerDeadlift" label="Felhúzás (kg)" error={errors.openerDeadlift?.message}>
                    <Input id="openerDeadlift" inputMode="decimal" {...field} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="mcText"
              control={control}
              render={({ field }) => (
                <Field id="mcText" label="Bemondó szöveg" hint="Nem kötelező">
                  <Textarea id="mcText" {...field} />
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Field id="notes" label="Megjegyzés" hint="Nem kötelező">
                  <Textarea id="notes" {...field} />
                </Field>
              )}
            />

            {state.wantsShirt && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="shirtCut"
                  control={control}
                  render={({ field }) => (
                    <Field
                      id="shirtCut"
                      label="Póló fazon"
                      hint={!state.shirtOpen ? "A pólórendelés lezárult, ez már nem módosítható." : undefined}
                    >
                      <Select value={field.value} onValueChange={field.onChange} disabled={!state.shirtOpen}>
                        <SelectTrigger id="shirtCut">
                          <SelectValue placeholder="Válassz" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT.shirt.cuts.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  name="shirtSize"
                  control={control}
                  render={({ field }) => (
                    <Field id="shirtSize" label="Pólóméret">
                      <Select value={field.value} onValueChange={field.onChange} disabled={!state.shirtOpen}>
                        <SelectTrigger id="shirtSize">
                          <SelectValue placeholder="Válassz" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT.shirt.sizes.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>
            )}

            <Button type="submit" disabled={saveState === "saving"} className="self-start">
              {saveState === "saving" ? "Mentés…" : "Mentés"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
