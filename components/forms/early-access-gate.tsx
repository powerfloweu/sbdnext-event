"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Lock } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { CountdownTimer } from "@/components/ui/countdown-timer";

const COOKIE_NAME = "sbdnext2_early_access";

const schema = z.object({
  email: z.string().trim().min(1, "Add meg az e-mail címed.").email("Érvénytelen e-mail cím."),
});
type Input = z.infer<typeof schema>;

function hasAccessCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_NAME}=`));
}

function grantAccessCookie(maxAgeSeconds: number) {
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

interface EarlyAccessGateProps {
  /** ISO timestamp — when registration opens to everyone. */
  opensAt: string;
  children: ReactNode;
}

// Gate shown during the registration.earlyAccessOpensAt–opensAt window.
// Anyone who types an e-mail that's in notify_signups (checked via
// /api/notify/check, never exposed otherwise) gets the wizard an hour
// early; everyone else sees a countdown to the public opening. Access is
// remembered for this window only via a short-lived cookie — good enough
// since the thing being protected is an hour of head start, not a secret.
export function EarlyAccessGate({ opensAt, children }: EarlyAccessGateProps) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notSubscribed, setNotSubscribed] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Input>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  // Deferred to a macrotask (matches CountdownTimer's pattern) rather than
  // set synchronously in the effect body, so the server-rendered markup
  // and the first client render match (no hydration mismatch from reading
  // document.cookie at render time).
  useEffect(() => {
    const id = window.setTimeout(() => {
      setUnlocked(hasAccessCookie());
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Once the public opening time passes, reload so the server re-evaluates
  // the phase and everyone sees the full wizard without the gate.
  useEffect(() => {
    const ms = new Date(opensAt).getTime() - Date.now();
    if (ms <= 0) {
      router.refresh();
      return;
    }
    const id = window.setTimeout(() => router.refresh(), Math.min(ms + 1000, 2 ** 31 - 1));
    return () => window.clearTimeout(id);
  }, [opensAt, router]);

  const onSubmit = handleSubmit(async (data) => {
    setNotSubscribed(false);
    try {
      const res = await fetch("/api/notify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json().catch(() => null);
      if (json?.subscribed) {
        grantAccessCookie(2 * 60 * 60);
        setUnlocked(true);
      } else {
        setNotSubscribed(true);
      }
    } catch {
      setError("root", { message: "Az ellenőrzés nem sikerült, próbáld újra." });
    }
  });

  if (!mounted) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Lock className="size-10 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Korai hozzáférés hírlevél-feliratkozóknak</h1>
        <p className="text-sm text-muted-foreground">
          A nevezés 1 órával korábban nyílik meg azoknak, akik feliratkoztak a hírlevélre.
          Mindenki másnak lent látod, mennyit kell még várni.
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="flex flex-col gap-3 p-5">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2 sm:flex-row">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  type="email"
                  placeholder="email@example.com"
                  aria-label="E-mail cím"
                  aria-invalid={!!errors.email}
                  className="sm:flex-1"
                  {...field}
                />
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ellenőrzés…" : "Belépek"}
            </Button>
          </form>
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
          {notSubscribed && (
            <Alert>
              <AlertCircle className="size-4" aria-hidden="true" />
              <span className="text-sm">
                Ezzel az e-mail címmel nem találtunk feliratkozást. A nevezés mindenki számára 18:00-kor
                nyílik meg — addig is feliratkozhatsz a főoldalon.
              </span>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-1 p-5">
          <span className="eyebrow">A nevezés mindenkinek megnyílik</span>
          <CountdownTimer target={opensAt} className="font-display text-3xl font-bold tabular-nums" />
        </CardContent>
      </Card>
    </div>
  );
}
