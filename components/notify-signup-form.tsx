"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { notifySignupSchema, type NotifySignupInput } from "@/lib/validation/notify";

const DEFAULTS: NotifySignupInput = { email: "", honeypot: "" };

export function NotifySignupForm() {
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
        setError("root", { message: "A feliratkozás nem sikerült, próbáld újra." });
      }
    } catch {
      setError("root", { message: "A feliratkozás nem sikerült, próbáld újra." });
    }
  });

  if (isSubmitSuccessful && !errors.root) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="size-5" aria-hidden="true" />
        <span className="text-sm">
          Feliratkoztál — e-mailt küldünk, amint megnyílik a nevezés.
        </span>
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
              aria-label="E-mail cím"
              aria-invalid={!!errors.email}
              className="sm:w-64"
              {...field}
            />
          )}
        />
        <Button type="submit" size="lg" disabled={isSubmitting}>
          <BellRing className="size-4" />
          {isSubmitting ? "Küldés…" : "Értesítést kérek"}
        </Button>
      </div>

      {errors.email && (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {errors.email.message}
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
