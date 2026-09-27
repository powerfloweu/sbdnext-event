"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Control, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ChevronRight, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/forms/field";
import { WizardHeader } from "@/components/forms/registration-wizard/wizard-header";

import { EVENT } from "@/config/event";
import { formatHUF } from "@/lib/format";
import {
  registrationSchema,
  REGISTRATION_DEFAULTS,
  STEP_FIELDS,
  type RegistrationInput,
} from "@/lib/validation/registration";

const DRAFT_KEY = "sbdnext2:registration-draft";

type Ctrl = Control<RegistrationInput, unknown, RegistrationInput>;
type Errs = FieldErrors<RegistrationInput>;

function num(v: string): number {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

// ---------- Step 1: alapadatok ----------
function Step1({ control, errors }: { control: Ctrl; errors: Errs }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Field id="lastName" label="Vezetéknév" required error={errors.lastName?.message}>
              <Input id="lastName" autoComplete="family-name" aria-invalid={!!errors.lastName} {...field} />
            </Field>
          )}
        />
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Field id="firstName" label="Keresztnév" required error={errors.firstName?.message}>
              <Input id="firstName" autoComplete="given-name" aria-invalid={!!errors.firstName} {...field} />
            </Field>
          )}
        />
      </div>

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Field id="email" label="E-mail" required error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...field} />
          </Field>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="birthYear"
          control={control}
          render={({ field }) => (
            <Field id="birthYear" label="Születési év" required hint="pl. 1995" error={errors.birthYear?.message}>
              <Input id="birthYear" inputMode="numeric" maxLength={4} aria-invalid={!!errors.birthYear} {...field} />
            </Field>
          )}
        />
        <Controller
          name="sex"
          control={control}
          render={({ field }) => (
            <Field id="sex" label="Nem" required error={errors.sex?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="sex" aria-invalid={!!errors.sex}>
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
    </div>
  );
}

// ---------- Step 2: kategória ----------
function Step2({ control, errors }: { control: Ctrl; errors: Errs }) {
  return (
    <div className="flex flex-col gap-5">
      <Controller
        name="division"
        control={control}
        render={({ field }) => (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-foreground">
              Kategória <span className="text-primary">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "Újonc" as const,
                  desc: "Nem versenyeztél még Magyar Országos Bajnokságon (open, I. osztály).",
                },
                {
                  value: "Versenyző" as const,
                  desc: "Az elmúlt 2 évben versenyeztél MOB-on és/vagy elérted a minősítési szintet.",
                },
              ].map((opt) => {
                const selected = field.value === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-colors ${
                      selected ? "border-primary bg-primary/10" : "border-border bg-card"
                    }`}
                  >
                    <input
                      type="radio"
                      name="division"
                      value={opt.value}
                      checked={selected}
                      onChange={() => field.onChange(opt.value)}
                      className="sr-only"
                    />
                    <span className="text-base font-semibold text-foreground">{opt.value}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </label>
                );
              })}
            </div>
            {errors.division && (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                {errors.division.message}
              </p>
            )}
          </fieldset>
        )}
      />

      <Controller
        name="club"
        control={control}
        render={({ field }) => (
          <Field id="club" label="Egyesület / Klub" hint="Nem kötelező">
            <Input id="club" placeholder="—" {...field} />
          </Field>
        )}
      />
    </div>
  );
}

// ---------- Step 3: nevezési adatok ----------
function Step3({
  control,
  errors,
  watchOpeners,
}: {
  control: Ctrl;
  errors: Errs;
  watchOpeners: { squat: string; bench: string; deadlift: string };
}) {
  const total = num(watchOpeners.squat) + num(watchOpeners.bench) + num(watchOpeners.deadlift);

  return (
    <div className="flex flex-col gap-5">
      <Controller
        name="bodyweight"
        control={control}
        render={({ field }) => (
          <Field
            id="bodyweight"
            label="Tervezett testsúly"
            required
            hint="A versenyen tervezett testsúlyod, ±3 kg pontossággal. A beosztás miatt fontos."
            error={errors.bodyweight?.message}
          >
            <div className="relative">
              <Input id="bodyweight" inputMode="decimal" aria-invalid={!!errors.bodyweight} {...field} />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                kg
              </span>
            </div>
          </Field>
        )}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold text-foreground">
          Nevezési súlyok (első fogás) <span className="text-primary">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <Controller
            name="openerSquat"
            control={control}
            render={({ field }) => (
              <Field id="openerSquat" label="Guggolás" error={errors.openerSquat?.message}>
                <Input id="openerSquat" inputMode="decimal" aria-invalid={!!errors.openerSquat} {...field} />
              </Field>
            )}
          />
          <Controller
            name="openerBench"
            control={control}
            render={({ field }) => (
              <Field id="openerBench" label="Fekvenyomás" error={errors.openerBench?.message}>
                <Input id="openerBench" inputMode="decimal" aria-invalid={!!errors.openerBench} {...field} />
              </Field>
            )}
          />
          <Controller
            name="openerDeadlift"
            control={control}
            render={({ field }) => (
              <Field id="openerDeadlift" label="Felhúzás" error={errors.openerDeadlift?.message}>
                <Input id="openerDeadlift" inputMode="decimal" aria-invalid={!!errors.openerDeadlift} {...field} />
              </Field>
            )}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Nevezési total</span>
          <span className="font-display text-2xl font-bold tabular-nums">
            {total || "—"} <span className="font-sans text-sm font-normal text-muted-foreground">kg</span>
          </span>
        </div>
      </fieldset>

      <Controller
        name="mcText"
        control={control}
        render={({ field }) => (
          <Field id="mcText" label="Bemondó szöveg" hint="Nem kötelező">
            <Textarea id="mcText" placeholder="Mióta edzel, miért jelentkeztél, mi a célod…" {...field} />
          </Field>
        )}
      />
    </div>
  );
}

// ---------- Step 4: póló & extrák ----------
function Step4({ control, errors }: { control: Ctrl; errors: Errs }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="shirtCut"
          control={control}
          render={({ field }) => (
            <Field id="shirtCut" label="Póló fazon" required error={errors.shirtCut?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="shirtCut" aria-invalid={!!errors.shirtCut}>
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
            <Field id="shirtSize" label="Pólóméret" required error={errors.shirtSize?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="shirtSize" aria-invalid={!!errors.shirtSize}>
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

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <Field id="notes" label="Megjegyzés, kérés a szervezőknek" hint="Nem kötelező">
            <Textarea id="notes" placeholder="Pl. külön kérés vagy egészségügyi infó." {...field} />
          </Field>
        )}
      />

      <Controller
        name="premiumMedia"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
            <span className="flex flex-col gap-0.5 text-sm">
              <span className="font-semibold text-foreground">
                Prémium média csomag (+{formatHUF(EVENT.fees.premiumMedia)} Ft)
              </span>
              <span className="text-xs text-muted-foreground">3 fotó + 3 videó, kiemelt válogatás.</span>
            </span>
          </label>
        )}
      />
    </div>
  );
}

// ---------- Step 5: összegzés ----------
function Summary({
  data,
  errors,
  control,
  onEdit,
  showConsentError,
}: {
  data: RegistrationInput;
  errors: Errs;
  control: Ctrl;
  onEdit: (step: number) => void;
  // react-hook-form's schema resolver validates the whole form on every
  // per-step `trigger()` call, so `errors.consent` is already populated
  // long before the user ever reaches this step (it's simply never
  // rendered until now). Only show it once the user has actually tried to
  // submit, not just because it's sitting in resolver state.
  showConsentError: boolean;
}) {
  const total = num(data.openerSquat) + num(data.openerBench) + num(data.openerDeadlift);
  const payable = EVENT.fees.entry + (data.premiumMedia ? EVENT.fees.premiumMedia : 0);

  const rows: [string, string, number][] = [
    ["Név", `${data.lastName} ${data.firstName}`, 1],
    ["E-mail", data.email, 1],
    ["Kategória", `${data.division} · ${data.sex} · ${data.birthYear}`, 2],
    ["Testsúly / total", `${data.bodyweight || "—"} kg · ${total || "—"} kg`, 3],
    ["Póló", `${data.shirtCut || "—"} · ${data.shirtSize || "—"}`, 4],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="divide-y divide-border px-4 py-0">
        {rows.map(([label, value, step]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="flex items-center gap-3 font-medium text-foreground">
              {value}
              <button
                type="button"
                onClick={() => onEdit(step)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Módosítom
              </button>
            </span>
          </div>
        ))}
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 p-5">
          <div className="flex justify-between text-sm">
            <span>Nevezési díj</span>
            <span className="tabular-nums">{formatHUF(EVENT.fees.entry)} Ft</span>
          </div>
          {data.premiumMedia && (
            <div className="flex justify-between text-sm">
              <span>Prémium média csomag</span>
              <span className="tabular-nums">{formatHUF(EVENT.fees.premiumMedia)} Ft</span>
            </div>
          )}
          <div className="my-1 h-px bg-border" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Fizetendő</span>
            <span className="font-display text-2xl font-extrabold text-primary tabular-nums">
              {formatHUF(payable)} Ft
            </span>
          </div>
        </CardContent>
      </Card>

      <Controller
        name="consent"
        control={control}
        render={({ field }) => (
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={field.value === true}
              onCheckedChange={(v) => field.onChange(v === true)}
              aria-invalid={showConsentError && !!errors.consent}
            />
            <span>
              Elfogadom az{" "}
              <a href="/adatkezeles" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                adatkezelési tájékoztatót
              </a>{" "}
              és a{" "}
              <a href={EVENT.docs.invitation} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                versenykiírást
              </a>
              . Tudomásul veszem, hogy a nevezés a fizetéssel válik véglegessé.
            </span>
          </label>
        )}
      />
      {showConsentError && errors.consent && (
        <p role="alert" className="-mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {errors.consent.message}
        </p>
      )}
    </div>
  );
}

export function RegistrationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: REGISTRATION_DEFAULTS,
    mode: "onBlur",
  });
  // Restore a draft on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<RegistrationInput>;
        reset({ ...REGISTRATION_DEFAULTS, ...draft });
        setRestoredDraft(true);
      }
    } catch {
      // ignore — localStorage may be unavailable (private mode, blocked storage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft on every change (skip the honeypot).
  const values = watch();
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const rest: Record<string, unknown> = { ...values };
        delete rest.honeypot;
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
      } catch {
        // ignore
      }
    }, 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }, []);

  const goNext = useCallback(async () => {
    const fields = STEP_FIELDS[step - 1];
    const valid = await trigger(fields);
    if (valid) {
      setSubmitError(null);
      setStep((s) => Math.min(5, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, trigger]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    if (data.honeypot) return; // silently drop bot submissions
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          utm: typeof window !== "undefined" ? window.location.search : "",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "unknown");
      }
      clearDraft();
      if (json.waitlisted) {
        router.push(`/nevezes/koszonjuk?rid=${json.registrationId}&waitlist=1`);
        return;
      }
      if (json.stripeUrl) {
        window.location.assign(json.stripeUrl as string);
        return;
      }
      router.push(`/nevezes/koszonjuk?rid=${json.registrationId}`);
    } catch {
      setSubmitError(
        "A jelentkezés beküldése nem sikerült. A piszkozatod megmaradt, próbáld újra, vagy írj nekünk e-mailt."
      );
    } finally {
      setSubmitting(false);
    }
  });

  const openers = useMemo(
    () => ({
      squat: values.openerSquat ?? "",
      bench: values.openerBench ?? "",
      deadlift: values.openerDeadlift ?? "",
    }),
    [values.openerSquat, values.openerBench, values.openerDeadlift]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <WizardHeader step={step} onBack={step > 1 ? goBack : undefined} />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-6">
        {restoredDraft && step === 1 && (
          <Alert>
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            <span>Folytatod a korábban megkezdett nevezésedet. A korábbi adataid betöltöttük.</span>
          </Alert>
        )}

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {
              [
                "Alapadatok",
                "Kategória",
                "Nevezési adatok",
                "Póló és extrák",
                "Ellenőrizd az adataid",
              ][step - 1]
            }
          </h1>
        </div>

        {/*
          The final submit is wired to the button's onClick, not this
          form's onSubmit. Radix's Select renders a hidden native <select>
          to stay form-associated for autofill, and it can dispatch a
          synthetic "change" event while a step's fields are unmounting
          (e.g. right after picking the last dropdown value on step 4);
          in some browsers that lands as an implicit submit on whatever
          <form> still contains it. Relying on onClick instead of the
          native submit event sidesteps that entirely, whatever its exact
          cause on a given browser.
        */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-1 flex-col gap-6"
          noValidate
        >
          {/* Honeypot — hidden from real users, bots tend to fill every field */}
          <div className="hidden" aria-hidden="true">
            <Controller
              name="honeypot"
              control={control}
              render={({ field }) => (
                <input tabIndex={-1} autoComplete="off" {...field} />
              )}
            />
          </div>

          {step === 1 && <Step1 control={control} errors={errors} />}
          {step === 2 && <Step2 control={control} errors={errors} />}
          {step === 3 && <Step3 control={control} errors={errors} watchOpeners={openers} />}
          {step === 4 && <Step4 control={control} errors={errors} />}
          {step === 5 && (
            <Summary
              data={getValues()}
              errors={errors}
              control={control}
              onEdit={setStep}
              showConsentError={isSubmitted}
            />
          )}

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden="true" />
              <span>{submitError}</span>
            </Alert>
          )}

          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
            {step < 5 ? (
              <Button type="button" size="lg" onClick={goNext}>
                Tovább
                <ChevronRight className="size-5" />
              </Button>
            ) : (
              <Button type="button" size="lg" disabled={submitting} onClick={onSubmit}>
                <Lock className="size-4" />
                {submitting ? "Feldolgozás…" : `Fizetés – ${formatHUF(EVENT.fees.entry + (values.premiumMedia ? EVENT.fees.premiumMedia : 0))} Ft`}
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground">
              {step < 5
                ? "Piszkozat mentve, később folytathatod."
                : "Biztonságos fizetés a Stripe-on keresztül. Ezután átirányítunk."}
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
