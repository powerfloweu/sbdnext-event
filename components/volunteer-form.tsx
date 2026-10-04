"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/forms/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT } from "@/config/event";
import { volunteerSchema, type VolunteerInput } from "@/lib/validation/volunteer";

const POSITIONS = ["higiéniai felelős", "terelő", "karszalag felelős", "admin", "biztonsági"];

const DEFAULTS: VolunteerInput = {
  name: "",
  email: "",
  day14: undefined as unknown as true,
  position: "",
  shirtCut: undefined as unknown as VolunteerInput["shirtCut"],
  shirtSize: undefined as unknown as VolunteerInput["shirtSize"],
  honeypot: "",
};

export function VolunteerForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<VolunteerInput>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: DEFAULTS,
  });

  const onSubmit = handleSubmit(async (data) => {
    if (data.honeypot) return;
    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError("root", { message: "A beküldés nem sikerült, próbáld újra." });
      }
    } catch {
      setError("root", { message: "A beküldés nem sikerült, próbáld újra." });
    }
  });

  if (isSubmitSuccessful && !errors.root) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="size-5" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">
            Köszönjük, rögzítettük az önkéntes jelentkezésed.
          </span>
          <span className="text-xs text-muted-foreground">
            Hamarosan e-mailben keresünk a részletekkel.
          </span>
        </div>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="hidden" aria-hidden="true">
        <Controller
          name="honeypot"
          control={control}
          render={({ field }) => <input tabIndex={-1} autoComplete="off" {...field} />}
        />
      </div>

      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>{errors.root.message}</span>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Field id="v-name" label="Név" required error={errors.name?.message}>
              <Input id="v-name" placeholder="Vezetéknév Keresztnév" aria-invalid={!!errors.name} {...field} />
            </Field>
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field id="v-email" label="E-mail" required error={errors.email?.message}>
              <Input id="v-email" type="email" placeholder="email@example.com" aria-invalid={!!errors.email} {...field} />
            </Field>
          )}
        />
      </div>

      <Controller
        name="day14"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={field.value === true}
                onCheckedChange={(v) => field.onChange(v === true)}
                aria-invalid={!!errors.day14}
              />
              <span>
                <span className="font-semibold text-foreground">
                  Vállalom a teljes napot (2027. február 13., 7:00–19:00)
                </span>
              </span>
            </label>
            {errors.day14 && (
              <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {errors.day14.message}
              </p>
            )}
          </div>
        )}
      />

      <Controller
        name="position"
        control={control}
        render={({ field }) => (
          <Field
            id="v-position"
            label="Preferált pozíció"
            required
            hint="Minden pozícióra várunk jelentkezőt; ha nincs elég ember, a szervezők jelölik ki a beosztást."
            error={errors.position?.message}
          >
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="v-position" aria-invalid={!!errors.position}>
                <SelectValue placeholder="Válassz" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="shirtCut"
          control={control}
          render={({ field }) => (
            <Field id="v-shirtCut" label="Póló fazon" required error={errors.shirtCut?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="v-shirtCut" aria-invalid={!!errors.shirtCut}>
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
            <Field id="v-shirtSize" label="Pólóméret" required error={errors.shirtSize?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="v-shirtSize" aria-invalid={!!errors.shirtSize}>
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

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Küldés…" : "Önkéntes jelentkezés elküldése"}
      </Button>

      <p className="text-xs text-muted-foreground">
        A megadott adatokat csak a verseny szervezése kapcsán használjuk fel és megosztjuk a
        szervezőcsapattal.
      </p>
    </form>
  );
}
