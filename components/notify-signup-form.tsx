"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { notifySignupSchema, type NotifySignupInput } from "@/lib/validation/notify";

const DEFAULTS: NotifySignupInput = { email: "", honeypot: "" };

const STRINGS = {
  hu: {
    success: "Feliratkoztál — e-mailt küldünk, amint megnyílik a nevezés.",
    submitError: "A feliratkozás nem sikerült, próbáld újra.",
    invalidEmail: "Érvénytelen e-mail cím.",
    emailAria: "E-mail cím",
    submitLabel: "Értesítést kérek",
    submittingLabel: "Küldés…",
  },
  en: {
    success: "You're signed up — we'll e-mail you the moment registration opens.",
    submitError: "Sign-up failed, please try again.",
    invalidEmail: "Invalid e-mail address.",
    emailAria: "E-mail address",
    submitLabel: "Notify me",
    submittingLabel: "Sending…",
  },
} as const;

interface NotifySignupFormProps {
  locale?: "hu" | "en";
}

export function NotifySignupForm({ locale = "hu" }: NotifySignupFormProps) {
  const t = STRINGS[locale];
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<NotifySignupInput>({
    resolver: zodResolver(notifySignupSchema),
    defaultValues: DEFAULTS,
  });

  const onSubmit = handleSubmit(async (data) => {
    if (data.honeypot) return;
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError("root", { message: t.submitError });
      }
    } catch {
      setError("root", { message: t.submitError });
    }
  });

  if (isSubmitSuccessful && !errors.root) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="size-5" aria-hidden="true" />
        <span className="text-sm">{t.success}</span>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      <div className="hidden" aria-hidden="true">
        <Controller
          name="honeypot"
          control={control}
          render={({ field }) => <input tabIndex={-1} autoComplete="off" {...field} />}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              type="email"
              placeholder="email@example.com"
              aria-label={t.emailAria}
              aria-invalid={!!errors.email}
              className="sm:w-64"
              {...field}
            />
          )}
        />
        <Button type="submit" size="lg" disabled={isSubmitting}>
          <BellRing className="size-4" />
          {isSubmitting ? t.submittingLabel : t.submitLabel}
        </Button>
      </div>

      {errors.email && (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {t.invalidEmail}
        </p>
      )}
      {errors.root && (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {errors.root.message}
        </p>
      )}
    </form>
  );
}
